const { RecipientNumber } = require('../models/recipaintnumber');
const { Section } = require('../models/section');
const fetch = require('node-fetch');
const { User } = require('../models/user');


let sentMessageCount = 0;



exports.sendBulkWhatsAppMessages = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';

  try {
    const { instance_id, sectionId, message, minIntervalMs } = req.body;
    const section = await Section.findById(sectionId).populate('user');

    if (!section) {
      return res.status(404).send('Section not found.');
    }

    const recipientNumbers = await RecipientNumber.find({ section: sectionId }).distinct('contactNumbers');
    console.log('Recipient Numbers:', recipientNumbers);
    const user = section.user;
    let successCount = 0;
    let failureCount = 0;

    for (const recipientNumber of recipientNumbers) {
      const payload = {
        clientId: user._id,
        sender: user.name,
        number: recipientNumber, // Send messages to one recipient at a time
        type: 'text',
        message: message,
        instance_id: instance_id,
        access_token: access_token,
      };

      fetch(hisocialWhatsAppEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            successCount++;
            console.log(`Message sent successfully to ${recipientNumber}`);
          } else {
            failureCount++;
            console.error(`Failed to send message to ${recipientNumber}: ${response.statusText}`);
          }
        })
        .catch((error) => {
          failureCount++;
          console.error(`Error sending message to ${recipientNumber}: ${error}`);
        });

      await new Promise((resolve) => setTimeout(resolve, minIntervalMs));
      
      // After sending the message, make a request to the tracking service
      const trackingServiceUrl = 'http://localhost:4000/api/v1/groups/track-message'; 
      fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({ clientId: user._id, sender: user.name, recipient: recipientNumber, content: message }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((trackingResponse) => {
          if (trackingResponse.ok) {
            console.log('Message sent and tracked successfully');
          } else {
            console.error('Error tracking the message:', trackingResponse.statusText);
          }
        })
        .catch((trackingError) => {
          console.error('Error tracking the message:', trackingError);
        });
    }

   

    res.json({
      success: true,
      message: 'Bulk WhatsApp messages are being sent.',
      successCount: successCount,
      failureCount: failureCount,
    });
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    res.status(500).json({ success: false, error: 'Failed to send bulk WhatsApp messages' });
  }
};



exports.sendMediaMessage = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';

  let successCount = 0;
  let failureCount = 0;

  try {
    const { instance_id, sectionId, message, minIntervalMs } = req.body;
    const section = await Section.findById(sectionId).populate('user');

    if (!section) {
      return res.status(404).send('Section not found.');
    }

    const recipientNumbers = await RecipientNumber.find({ section: sectionId }).distinct('contactNumbers');

    for (const recipientNumber of recipientNumbers) {
      const media_url = generateMediaURL(req.file.filename);

      const payload = {
        number: recipientNumber,
        type: 'media',
        message: message,
        media_url: media_url,
        instance_id: instance_id,
        access_token: access_token,
      };

      const response = await fetch(hisocialWhatsAppEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            successCount++;
          } else {
            failureCount++;
          }
        })
        .catch((error) => {
          failureCount++;
        });

      const mediaMessage = `Media (pdf or image) sent.${message}`;

      const trackingServiceUrl = 'http://localhost:4000/api/v1/groups/track-message';
      fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({ clientId: section.user._id, sender: section.user.name, recipient: recipientNumber, content: mediaMessage }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((trackingResponse) => {
          if (trackingResponse.ok) {
            console.log('Message sent and tracked successfully');
          } else {
            console.error('Error tracking the message:', trackingResponse.statusText);
          }
        })
        .catch((trackingError) => {
          console.error('Error tracking the message:', trackingError);
        });

      await new Promise((resolve) => setTimeout(resolve, minIntervalMs));
    }

    res.json({
      success: true,
      message: 'Bulk WhatsApp media messages are being sent.',
      successCount: successCount,
      failureCount: failureCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send bulk WhatsApp media messages' });
  }
};



function generateMediaURL(filename) {
  return `https://www.stpaul.gov/DocumentCenter/Government/Police/About%20the%20Department/Major%20Crimes%20Division%20/Sample%20Internal%20Fraud%20Report%20for%20Businessess.PDF`;
}



exports.getSentWhatsAppMessages = async (req, res) => {
  try {
    const count = getSentMessageCount();
    res.json({ totalMessages: count });
  } catch (error) {
    console.error('Error retrieving sent WhatsApp messages:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve sent WhatsApp messages' });
  }
};

const getSentMessageCount = () => {
  return sentMessageCount;
};



exports.sendTextMessageToGroup = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppGroupEndpoint = 'https://hisocial.in/api/send_group';

  try {
    const { group_id, message, instance_id } = req.body;

    const payload = {
      group_id: group_id,
      type: 'text',
      message: message,
      instance_id: instance_id,
      access_token: access_token,
    };

    const response = await fetch(hisocialWhatsAppGroupEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      res.json({ success: true, message: 'Text message sent to WhatsApp group.' });
    } else {
      const errorText = await response.text();
      console.error(`Error sending text message to WhatsApp group: ${errorText}`);
      res.status(500).json({ success: false, error: 'Failed to send text message to WhatsApp group' });
    }
  } catch (error) {
    console.error('Error sending text message to WhatsApp group:', error);
    res.status(500).json({ success: false, error: 'Failed to send text message to WhatsApp group' });
  }
};
