const EyePrescription = require('../models/eyePrescription');
const Registration = require('../models/registercustomer');
const axios = require('axios');
const Event = require('../models/eventmodel');
const Role = require('../models/role');
const nodemailer = require('nodemailer');
const EmailConfig = require('../models/emailconfig');
exports.createPrescription = async (req, res) => { 
  try {
    const { userId, prescription, eventId, opId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const emailConfigId = event.emailConfig;
    let emailConfigData = null;
    if (emailConfigId) {
      emailConfigData = await EmailConfig.findById(emailConfigId);
    }
    const user = await Registration.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const op = await Role.findById(opId);
    if (!op) {
      return res.status(404).json({ message: 'Optomatics not found' });
    }

    const partner = await Role.findById(event.Associationwith);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Generate the PDF and get the file path
    const pdfPath = await generateEyePrescriptionPDF({
      name: user.participantFields.find(field => field.fieldName === 'Name').fieldValue,
      phone: user.participantFields.find(field => field.fieldName === 'MobileNumber').fieldValue,
      leftEye: prescription.leftEye,
      rightEye: prescription.rightEye,
      optomaticsname: op.Name,
      partnername: partner.Name,
      partnermobilenumber: partner.Mobile,
      eventownerlogo: event.eventownerlogo,
      patnerlog: event.patnerlog
    });

    const newPrescription = new EyePrescription({
      user: userId,
      eventId,
      prescription,
      pdfPath, // Save the PDF path in the database
    });

    await newPrescription.save();

    // Respond to the client first
    res.status(201).json({ message: 'Prescription saved successfully!', pdfPath });

    // Generate and send email and WhatsApp notifications asynchronously
    (async () => {
      try {
        const emailHtml = `
          <p>Dear ${user.participantFields.find(field => field.fieldName === 'Name').fieldValue},</p>
          <p>Your eye prescription has been generated. Please find it attached to this email.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Your Team</p>
        `;
        const email = user.participantFields.find(field => field.fieldName === 'Email').fieldValue;

        await sendPrescriptionEmail(email, emailHtml, pdfPath, event, emailConfigData);

        const mobileNumber = user.participantFields.find(field => field.fieldName === 'MobileNumber').fieldValue;
        const mediaUrl = `https://connectje.in/public/uploads/${pdfPath.split('/').pop()}`;
        const message = `Dear ${user.participantFields.find(field => field.fieldName === 'Name').fieldValue},\n\nYour eye prescription has been generated. Please find it attached in this message.`;

        await axios.post('https://connectje.in/api/v1/wa/api/media/single', {
          instance_id: event.instance_id || '670CE6EDB45CE',
          clientid: event.clientId,
          number: `${mobileNumber}`,
          message,
          filename: pdfPath.split('/').pop(),
          media_url: mediaUrl,
        });
      } catch (internalError) {
        console.error('Error sending notifications:', internalError);
      }
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save prescription and send notifications' });
  }
};



// Function to send the email with prescription attached
const sendPrescriptionEmail = (to, htmlContent, pdfPath, event,emailConfigData) => {
  const transporter = nodemailer.createTransport({
    host: emailConfigData.host,
      port: emailConfigData.port,
      secure: emailConfigData.secure,
      auth: {
        user: emailConfigData.user,
        pass: emailConfigData.pass  // Ensure this is your App Password if using 2FA
      }
    });

    // Email options
    const emailOptions = {
      from: emailConfigData.user,
    to,
    subject: 'Your Eye Prescription',
    html: htmlContent,
    attachments: [
      {
        filename: pdfPath.split('/').pop(),
        path: pdfPath,
      },
    ],
  };

  return transporter.sendMail(emailOptions);
};







exports.getPrescriptionsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find all prescriptions by eventId, sort by createdAt descending (oldest last), and populate user details
    const prescriptions = await EyePrescription.find({ eventId })
      .populate('user') // Extract details from Registration
      .sort({ createdAt: 1 }); // Sort by createdAt field (1 for ascending)

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this event.' });
    }

    return res.status(200).json(prescriptions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve prescriptions' });
  }
};


const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateEyePrescriptionPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [595.28, 500] });
    const pdfFileName = `eye_prescription_${data.name}_${Date.now()}.pdf`;
    const pdfFilePath = `./public/uploads/${pdfFileName}`;
    doc.pipe(fs.createWriteStream(pdfFilePath));

    // Draw a border around the page
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

    // Admin Logo - ensure it stays within the border
    const adminLogoPath = data.eventownerlogo;
    const adminLogoWidth = 80;
    const adminLogoHeight = 40;
    doc.image(adminLogoPath, 40, 40, { fit: [adminLogoWidth, adminLogoHeight] }).moveDown(1);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('Eye Prescription', { align: 'center' }).moveDown(0.5);

    // Patient Name and Phone Number - bold for labels only
    doc.font('Helvetica-Bold').fontSize(12).text('Patient Name:', 50, doc.y);
    doc.font('Helvetica').fontSize(12).text(data.name || 'Auto Populated', 150, doc.y - 12);

    const optomaticsTextTop = doc.y - 10;
    doc.font('Helvetica-Bold').text('Optometrist Name:', 300, optomaticsTextTop);
    doc.font('Helvetica').text(data.partnername || 'N/A', 410, optomaticsTextTop);

    // Mobile Number - bold label only
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Mobile Number:', 50, doc.y);
    doc.font('Helvetica').text(data.phone || 'Auto Populated', 150, doc.y - 12);

    // Prescription details
    doc.moveDown(1);
    const boxTop = doc.y;
    const boxHeight = 100;
    const boxWidth = doc.page.width - 60;
    doc.rect(30, boxTop, boxWidth, boxHeight).stroke();

    // Table Headers
    const rowHeight = 30;
    const columnWidth = 100;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Cylindrical', 150, boxTop + 5);
    doc.text('Spherical', 150 + columnWidth, boxTop + 5);
    doc.text('Axis', 150 + columnWidth * 2, boxTop + 5);
    doc.text('Additional', 150 + columnWidth * 3, boxTop + 5);

    // Left Eye row
    doc.font('Helvetica-Bold').text('Left Eye', 50, boxTop + rowHeight + 5);
    doc.font('Helvetica').fontSize(12);
    doc.text(data.leftEye.cylindrical || 'N/A', 150, boxTop + rowHeight + 5);
    doc.text(data.leftEye.spherical || 'N/A', 150 + columnWidth, boxTop + rowHeight + 5);
    doc.text(data.leftEye.axis || 'N/A', 150 + columnWidth * 2, boxTop + rowHeight + 5);
    doc.text(data.leftEye.additional || 'N/A', 150 + columnWidth * 3, boxTop + rowHeight + 5);

    // Right Eye row
    doc.font('Helvetica-Bold').text('Right Eye', 50, boxTop + rowHeight * 2 + 5);
    doc.font('Helvetica').fontSize(12);
    doc.text(data.rightEye.cylindrical || 'N/A', 150, boxTop + rowHeight * 2 + 5);
    doc.text(data.rightEye.spherical || 'N/A', 150 + columnWidth, boxTop + rowHeight * 2 + 5);
    doc.text(data.rightEye.axis || 'N/A', 150 + columnWidth * 2, boxTop + rowHeight * 2 + 5);
    doc.text(data.rightEye.additional || 'N/A', 150 + columnWidth * 3, boxTop + rowHeight * 2 + 5);

    // Partner Details section with name and phone below logo
    const partnerBoxTop = boxTop + boxHeight + 15;
    doc.fontSize(12).font('Helvetica-Bold').text('In Association with:', 50, partnerBoxTop);

    // Partner Logo with name and phone directly below
    const partnerLogoPath = data.patnerlog;
    const partnerLogoWidth = 60;
    const partnerLogoHeight = 30;
    doc.image(partnerLogoPath, 50, partnerBoxTop + 20, { fit: [partnerLogoWidth, partnerLogoHeight] });

    // Partner Name and Phone
    doc.font('Helvetica-Bold').text('Partner Name:', 50, partnerBoxTop + 55);
    doc.font('Helvetica').text(data.partnername || 'N/A', 150, partnerBoxTop + 55);

    doc.font('Helvetica-Bold').text('Phone:', 50, partnerBoxTop + 75);
    doc.font('Helvetica').text(data.partnermobilenumber || 'N/A', 150, partnerBoxTop + 75);

    doc.end();
    resolve(pdfFilePath);
  });
}




exports.downloadPrescriptionPDF = async (req, res) => {
  try {
    const { user } = req.params;

    // Fetch the prescription using the userId field
    const prescription = await EyePrescription.findOne({ user: user });
    if (!prescription) {
      console.error('Prescription not found for user:', user);
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const pdfPath = prescription.pdfPath;
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      console.error('PDF path invalid or file does not exist:', pdfPath);
      return res.status(404).json({ message: 'PDF file not found' });
    }

    // Send the file for download
    res.download(pdfPath, (err) => {
      if (err) {
        console.error('Error during file download:', err);
        res.status(500).json({ message: 'Error downloading the file.' });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Failed to download the prescription PDF.' });
  }
};

