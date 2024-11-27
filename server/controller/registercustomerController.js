const Registration = require('../models/registercustomer');
const Event = require('../models/eventmodel');
const QRCode = require('qrcode');
const axios = require('axios');
const { htmlToText } = require('html-to-text');
const fs = require('fs'); // File system module
const path = require('path');
const nodemailer = require('nodemailer');
const { sendWhatsAppMessage } = require('../controller/whatsappController'); 
const EmailConfig = require('../models/emailconfig');// Import the WhatsApp controller
//const {sendReminderEmail} = require("../controller/emailController");

const cron = require('node-cron');

const moment = require('moment');








exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, participantData, selectedTimeslot } = req.body;

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const emailConfigId = event.emailConfig;
    let emailConfigData = null;
    if (emailConfigId) {
      emailConfigData = await EmailConfig.findById(emailConfigId);
    }
    // Handle event types with timeslot selection (type 1 and 2)
    if (event.eventType === '1' || event.eventType === '2') {
      if (!selectedTimeslot || !selectedTimeslot.date || !selectedTimeslot.time) {
        return res.status(400).json({ message: 'Please provide a valid timeslot with both date and time' });
      }

      const { date, time } = selectedTimeslot;

      // Check if the selected timeslot is valid
      const isTimeslotValid = event.timeslot.some(slot => slot.date === date && slot.time === time);
      if (!isTimeslotValid) {
        return res.status(400).json({ message: `Timeslot ${date} ${time} is not available for this event` });
      }

      // Check if the maximum registrations have been reached for the selected timeslot
      const existingRegistrationsInSlot = await Registration.countDocuments({
        eventId,
        'participantFields.fieldName': 'timeslot',
        'participantFields.fieldValue': `${date} ${time}`
      });

      if (existingRegistrationsInSlot >= event.maxParticipationPerCounter * event.numCounters) {
        return res.status(400).json({ message: `Maximum registrations reached for timeslot: ${date} ${time}` });
      }

      // Store the timeslot in participant data
      participantData.timeslot = `${date} ${time}`;
    } else if (event.eventType === '0') {
      // Handle general event type without timeslot
      const existingRegistrations = await Registration.countDocuments({ eventId });
      if (existingRegistrations >= event.maxRegistrations) {
        return res.status(400).json({ message: 'Maximum registrations reached for the event' });
      }
    }

    // Prepare participant fields for the registration
    const participantFields = Object.keys(participantData).map((key) => ({
      fieldName: key,
      fieldValue: participantData[key].toString()
    }));

    // Create new registration
    const newRegistration = new Registration({
      eventId,
      participantFields,
    });

    await newRegistration.save();

    // Generate a unique QR code for the registration in PNG format
    const qrData = `Event ID: ${eventId}\nRegistration ID: ${newRegistration._id}`;
    const qrFilename = `${newRegistration._id}.png`;
    const qrFilePath = path.join(__dirname, '../public/uploads', qrFilename);

    // Generate and save the QR code as a PNG
    await QRCode.toFile(qrFilePath, qrData, { type: 'png' });

    // Get the participant's mobile number and name
    const mobileNumber = participantData.MobileNumber;
    const participantName = participantData.Name || 'Participant';  // Default name if not provided

    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Prepare the HTML email with proper name replacement and formatting
    let emailHtml = event.emailHtml
      .replace('{{name}}', participantName)  // Replace name placeholder with the participant's name
      .replace(/\n/g, '<br>');  // Replace newline with HTML line breaks, if needed

    // Convert HTML to plain text for WhatsApp message
    const message = htmlToText(emailHtml).replace(/\n/g, ' '); 
    const emailSubject = htmlToText(event.emailSubject || 'Event Registration Confirmation');
 // Convert HTML to plain text and remove newlines
    const media_url = `https://connectje.in/public/uploads/${qrFilename}`;  // URL to access the QR code file

    // Email configuration
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
      to: participantData.Email || participantData.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: qrFilename,
          path: qrFilePath,
          cid: 'qrCodeImage',  // Optional: Use this CID in the email HTML if needed
        },
      ],
    };

    // Send the email
    await transporter.sendMail(emailOptions);

    // Send the response immediately
    res.status(200).json({ message: 'Registration successful', registration: newRegistration, qrCode: media_url });
console.log(event.instance_id)
    // Send WhatsApp message and email asynchronously after the response
    Promise.all([
      axios.post('https://connectje.in/api/v1/wa/api/media/single', {
        instance_id: event.instance_id ,
        clientid: event.clientId,
        number: `91${mobileNumber}`,  // Use the dynamic mobile number from participantData
        message,
        filename: qrFilename,
        media_url,
      }),
      transporter.sendMail(emailOptions)
    ])
    .then(() => {
      console.log(`Email and WhatsApp message sent to ${participantName}`);
    })
    .catch(err => {
      console.error('Error sending email or WhatsApp message:', err);
    });

  } catch (error) {
    console.error('Error during event registration:', error);
    res.status(500).json({ message: 'Failed to register for event', error: error.message });
  }
};





  
  
  
  
exports.getParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find all registrations for the given event
    const registrations = await Registration.find({ eventId });

    if (!registrations) {
      return res.status(404).json({ message: 'No participants found' });
    }

    // Return the registrations (participants)
    res.status(200).json({ participants: registrations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve participants', error });
  }
};


exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the registration ID is passed in the request URL as a parameter

    // Find and delete the registration record by its ID
    const deletedRegistration = await Registration.findByIdAndDelete(id);

    if (!deletedRegistration) {
      return res.status(404).json({ message: "Registration not found!" });
    }

    return res.status(200).json({ message: "Registration deleted successfully", deletedRegistration });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
};



exports.scanQRCode = async (req, res) => {
  const { registerId, eventId, scannerId } = req.params;

  try {
    // Step 1: Find the registration by ID
    const registration = await Registration.findById(registerId);
    
    if (!registration) {
      return res.status(404).send('Registration not found.');
    }

    // Step 2: Check if QR code has already been scanned
    if (registration.qrcodescanned) {
      return res.status(400).send('QR code has already been scanned.');
    }

    // Step 3: Verify the event ID matches
    if (registration.eventId.toString() !== eventId.toString()) {
      return res.status(400).send('QR code is not for this event.');
    }

    // Step 4: Find the event and check the scanner ID and event date
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send('Event not found.');
    }

    // Check if the scannerId exists in the event's scanner list
    const isScannerAuthorized = event.scanner.some(scanner => scanner.toString() === scannerId);

    if (!isScannerAuthorized) {
      return res.status(403).send('You are not authorized to scan for this event.');
    }

    const currentDate = new Date();
    const eventEndDate = new Date(event.endDate);

    if (currentDate > eventEndDate) {
      return res.status(400).send('QR code has expired. The event has already ended.');
    }

    // Step 5: Mark the QR code as scanned and set the scanned time
    registration.qrcodescanned = true;
    registration.qrcodeScannedTime = Date.now(); // Set the current time for the scan
    await registration.save();

    return res.status(200).send('QR code scanned successfully.');
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).send('Server error.');
  }
};



exports.scanQRCodeop = async (req, res) => {
  const { registerId, eventId, opId } = req.params;

  try {
    // Step 1: Find the registration by ID
    const registration = await Registration.findById(registerId);
    
    if (!registration) {
      return res.status(404).send('Registration not found.');
    }

    // Step 2: Check if QR code has already been scanned by the operator
    if (registration.qrcodescannedbyop) {
      return res.status(400).send('QR code has already been scanned by the operator.');
    }

    // Step 3: Verify the event ID matches the registration eventId
    if (registration.eventId.toString() !== eventId.toString()) {
      return res.status(400).send('QR code is not valid for this event.');
    }

    // Step 4: Find the event and check if the operator is authorized
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send('Event not found.');
    }

    // Check if the operator (opId) exists in the event's 'optimistic' list
    const isoptimisticAuthorized = event.optimistic.some(optimistic => optimistic.toString() === opId);

    if (!isoptimisticAuthorized) {
      return res.status(403).send('You are not authorized to scan for this event.');
    }

    // Step 5: Check if the event has already ended
    const currentDate = new Date();
    const eventEndDate = new Date(event.endDate);

    if (currentDate > eventEndDate) {
      return res.status(400).send('QR code has expired. The event has already ended.');
    }

    // Step 6: Mark the registration as scanned by the operator and save
    registration.qrcodescannedbyop = true;
    registration.qrcodeScannedopTime = Date.now(); // Marking that the operator has scanned the code
    await registration.save();

    return res.status(200).send('QR code scanned successfully by the operator.');
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).send('Server error.');
  }
};


exports.getScannedCustomersbyscanner = async (req, res) => {
  const { eventId } = req.params; // Get the eventId from request parameters

  try {
    const scannedCustomers = await Registration.find({
      eventId: eventId, // Filter by event ID
      qrcodescanned: true // Only scanned customers
    })
      .sort({ qrcodeScannedTime: -1 }); // Sort by scan time (newest first)

    if (scannedCustomers.length === 0) {
      return res.status(404).send('No customers have scanned their QR codes for this event.');
    }

    return res.status(200).json(scannedCustomers);
  } catch (error) {
    console.error('Error fetching scanned customers:', error);
    res.status(500).send('Server error.');
  }
};

exports.getScannedCustomersbyop = async (req, res) => {
  const { eventId } = req.params; // Get the eventId from request parameters

  try {
    const scannedCustomers = await Registration.find({
      eventId: eventId, // Filter by event ID
      qrcodescannedbyop: true // Only scanned by operators
    })
      .sort({ qrcodeScannedopTime: -1 }); // Sort by operator scan time (newest first)

    if (scannedCustomers.length === 0) {
      return res.status(404).send('No customers have been scanned by operators for this event.');
    }

    return res.status(200).json(scannedCustomers);
  } catch (error) {
    console.error('Error fetching scanned customers by operators:', error);
    res.status(500).send('Server error.');
  }
};


exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find registration by ID
    const registration = await Registration.findById(id).populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Respond with the found registration
    return res.status(200).json(registration);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve registration' });
  }
};









cron.schedule('* * * * *', async () => { 
  //console.log('Checking for events happening today...');

  try {
    const now = moment().tz('Asia/Kolkata');
    const todayStart = now.clone().startOf('day');
    const todayEnd = now.clone().endOf('day');
    const oneHourLater = now.clone().add(1, 'hour');

    const todayStartFormatted = todayStart.format('DD-MM-YYYY');
    const todayEndFormatted = todayEnd.format('DD-MM-YYYY');

    const todayEvents = await Event.find({
      eventDate: { $lte: todayEndFormatted },
      endDate: { $gte: todayStartFormatted }
    }).populate('emailConfig'); // Populate the emailConfig field

    //console.log('Today\'s events:', todayEvents);

    for (const event of todayEvents) {
      const participants = await Registration.find({ eventId: event._id, reminderSent: false });
      
      for (const participant of participants) {
        if (participant.reminderSent) {
          console.log(`Reminder already sent for participant: ${participant.participantFields.find(field => field.fieldName === 'Name').fieldValue}`);
          continue;
        }

        const timeslotField = participant.participantFields.find(field => field.fieldName === 'timeslot');

        if (timeslotField) {
          const timeslotString = timeslotField.fieldValue.split(' - ')[0];
          const [datePart, timePart] = timeslotString.split(' ');
          const formattedDate = moment(`${datePart}`, 'DD MM YYYY').format('YYYY-MM-DD');
          const timeslot = moment(`${formattedDate} ${timePart}`, 'YYYY-MM-DD HH:mm').tz('Asia/Kolkata');
          
          //console.log(`Timeslot for ${participant.participantFields.find(field => field.fieldName === 'Name').fieldValue}:`, timeslot.format());

          if (timeslot.isBetween(now, oneHourLater, null, '[]')) {
            console.log(`Sending reminder for participant: ${participant.participantFields.find(field => field.fieldName === 'Name').fieldValue}`);

            const mobileNumber = participant.participantFields.find(field => field.fieldName === 'MobileNumber').fieldValue;
            const message = `Hello ${participant.participantFields.find(field => field.fieldName === 'Name').fieldValue}, this is a reminder for your event ${event.eventName} scheduled at ${timeslot.format('HH:mm')} today.`;

            try {
              const [emailResponse, whatsappResponse] = await Promise.all([
                sendReminderEmail(event, participant, event.emailConfig),  // Pass emailConfig
                sendWhatsAppMessage(event, mobileNumber, message)
              ]);
              
              
              participant.reminderSent = true;
              await participant.save();
            } catch (sendError) {
              console.error('Error sending notifications:', sendError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during cron job execution:', error);
  }
});

// Function to send reminder email
const sendReminderEmail = async (event, participant, emailConfigData) => {
  const participantName = participant.participantFields.find(field => field.fieldName === 'Name').fieldValue;
  const participantEmail = participant.participantFields.find(field => field.fieldName === 'Email').fieldValue;
  const timeslot = participant.participantFields.find(field => field.fieldName === 'timeslot').fieldValue;

  const transporter = nodemailer.createTransport({
    host: emailConfigData.host,
    port: emailConfigData.port,
    secure: emailConfigData.secure,
    auth: {
      user: emailConfigData.user,
      pass: emailConfigData.pass,
    }
  });

  const mailOptions = {
    from: emailConfigData.user,
    to: participantEmail,
    subject: `Reminder: ${event.eventName} starts in 1 hour`,
    html: `
      <p>Dear ${participantName},</p>
      <p>This is a reminder that the event <strong>${event.eventName}</strong> is scheduled to start at <strong>${event.startTime}</strong> on <strong>${event.eventDate}</strong>.</p>
      <p>Your selected time slot: ${timeslot}</p>
      <p>Location: ${event.PlaceofEvent}</p>
      <p>We look forward to your presence!</p>
      <p>Best Regards,<br>${event.ContactPersonName || 'The Event Team'}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${participantEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${participantEmail}:`, error);
  }
};
