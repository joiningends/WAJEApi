const nodemailer = require('nodemailer');

// Function to send the password to the user's email
async function sendPasswordByEmail(name,email, htmlContent) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'joiningends93@gmail.com',
            pass: 'phxq dgpu etkz afuu',
        },
    });

    const mailOptions = {
        from: 'joiningends93@gmail.com',
        to: email,
        subject: 'login credential',
        html: htmlContent,
    }

    await transporter.sendMail(mailOptions);
}

const sendEmail = async (to, subject, text, config) => {
  // Configure your email service using event configuration
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: true,
    auth: {
        user: config.user,
        pass: config.pass,
    },
});

const mailOptions = {
    from: config.from,
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};


  const sendReminderEmail = async (event, participant) => {
    const transporter = nodemailer.createTransport({
      host: event.emailConfig.host,
      port: event.emailConfig.port,
      secure: event.emailConfig.secure, // true for 465, false for other ports
      auth: {
        user: event.emailConfig.user, // Event-specific email
        pass: event.emailConfig.pass // Event-specific email password
      }
    });
  
    const mailOptions = {
        from: event.emailConfig.user, // Sender email from event config
        to: participant.participantFields.find(field => field.fieldName === 'Email').fieldValue, // Receiver email
        subject: `Reminder: ${event.eventName} starts in 1 hour`, // Subject line
        html: `
          <p>Dear ${participant.participantFields.find(field => field.fieldName === 'Name').fieldValue},</p>
          <p>This is a reminder that the event <strong>${event.eventName}</strong> is scheduled to start at <strong>${event.startTime}</strong> on <strong>${event.eventDate}</strong>.</p>
          <p>Location: ${event.PlaceofEvent}</p>
          <p>We look forward to your presence!</p>
          <p>Best Regards,<br>${event.ContactPersonName || 'The Event Team'}</p>
        `
      };
      
    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${participant.participantFields.find(field => field.fieldName === 'Email').fieldValue}`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  };
  
module.exports = { sendPasswordByEmail,sendEmail,sendReminderEmail };