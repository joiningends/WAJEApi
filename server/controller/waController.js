const { RecipientNumber } = require('../models/recipaintnumber');
const { Section } = require('../models/section');
const fetch = require('node-fetch');
const { User } = require('../models/user');
const QRCode = require('qrcode');
const fs = require('fs').promises; 
const axios = require('axios');
const cron = require('node-cron');
const WhatsAppGroup = require('../models/whatsappgroup');
const Campaign = require('../models/campains');
const { Client } = require('../models/clints');
const WhatsAppMessage = require('../models/whatsapps'); 
let sentMessageCount = 0;

const { Message } = require('../models/group');


exports.sendBulkWhatsAppMessages = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';

  try {
      const { instance_id, sender,sectionId, message, minIntervalMs } = req.body;
      const section = await Section.findById(sectionId).populate('user');

      if (!section) {
          return res.status(404).send('Section not found.');
      }

      const recipientNumbers = await RecipientNumber.find({ section: sectionId }).distinct('contactNumbers');
      const user = section.user;

      // Initialize success and failure counts
      let successCount = 0;
      let failureCount = 0;

      const sendMessages = async () => {
          for (const recipientNumber of recipientNumbers) {
              const payload = {
                  clientId: user._id,
                  sender: user,
                  number: recipientNumber,
                  type: 'text',
                  message: message,
                  instance_id: instance_id,
                  access_token: access_token,
              };

              try {
                  const response = await fetch(hisocialWhatsAppEndpoint, {
                      method: 'POST',
                      body: JSON.stringify(payload),
                      headers: { 'Content-Type': 'application/json' },
                  });
console.log(response)
                  if (response.ok) {
                      successCount++;
                      console.log(`Message sent successfully to ${recipientNumber}`);
                  } else {
                      failureCount++;
                      console.error(`Failed to send message to ${recipientNumber}: ${response.statusText}`);
                  }
              } catch (error) {
                  failureCount++;
                  console.error(`Error sending message to ${recipientNumber}: ${error}`);
              }

              // Wait for minIntervalMs before sending the next message
              await new Promise((resolve) => setTimeout(resolve, minIntervalMs));

              // After sending the message, make a request to the tracking service
              const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message';
              try {
                  const trackingResponse = await fetch(trackingServiceUrl, {
                      method: 'POST',
                      body: JSON.stringify({ clientId: user._id, sender: sender, recipient: recipientNumber, content: message }),
                      headers: { 'Content-Type': 'application/json' },
                  });

                  if (trackingResponse.ok) {
                      console.log('Message sent and tracked successfully');
                  } else {
                      console.error('Error tracking the message:', trackingResponse.statusText);
                  }
              } catch (trackingError) {
                  console.error('Error tracking the message:', trackingError);
              }
          }

          // Update the section with success and failure counts
          section.successCount = successCount;
          section.failureCount = failureCount;
          await section.save();

          // Log the success and failure counts
          console.log(`Cycle completed. Success: ${successCount}, Failure: ${failureCount}`);

          // Send the response with success and failure counts
          res.json({
              success: true,
              message: 'Bulk WhatsApp messages sent.',
              successCount,
              failureCount,
          });
      };

      // Start the task to send messages
      sendMessages();

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

      const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message';
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













exports.createInstance = async (req, res) => {
  const access_token = req.params.accetoken;

  try {
    const response = await axios.post('http://hisocial.in/api/create_instance', null, {
      params: {
        access_token: access_token,
      }
    });
    
    console.log('Instance created successfully:', response.data);
    res.status(200).json(response.data);  // Send the response back to the client
  } catch (error) {
    console.error('Error creating instance:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create instance', details: error.response ? error.response.data : error.message });
  }
};









 


exports.getQRCode = async (req, res) => {
  const instance_id = req.params.instanceid;
  const access_token = req.params.accetoken;

  try {
    const response = await axios.post('http://hisocial.in/api/get_qrcode', null, {
      params: {
        instance_id: instance_id,
        access_token: access_token,
      }
    });

    if (response.data && response.data.base64) {
      res.send(response.data);
    } else {
      console.error('No base64 data found in the response');
      res.status(500).send(response.data.message);
    }
  } catch (error) {
    
      res.status(500).send(response.data.message);
    
  }
};







const cancellationTokens = {}; 

exports.stop = async (req, res) => {
  const { campainid } = req.body;
  cancellationTokens[campainid] = true; 
  res.send({ success: true, message: 'Bulk message sending cancelled.' });
};





const nodeCron = require('node-cron');

async function sendMessages(instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid) {
  console.log(sender)
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1; // Maximum number of retries for failed messages
  const batchSize = 1000; // Number of recipients to process in each batch
  const breakTimeMs = 5 * 60 * 1000; // 5 minutes break time between batches

  try {
    const section = await Section.findById(sectionId).populate('user');
    if (!section) {
      console.error('Section not found.');
      return;
    }

    const campain = await Campaign.findById(campainid);
    if (!campain) {
      console.error('Campaign not found.');
      return;
    }

    const recipientNumbers = await RecipientNumber.find({ section: sectionId });
    const user = await Client.findById(section.user._id);

    if (!user) {
      console.error('Client not found.');
      return;
    }
    const minimum = user.Totalcredit;
    const counts = section.count * user.whatsappmodel.cm;

    if (minimum < counts) {
      campain.failureCount += section.count;
      await campain.save();
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: user._id,
          sender: sender,
          attachment: "No",
          campainid: campainid,
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    let successCount = campain.successCount || 0;
    let failureCount = campain.failureCount || 0;
    let totalRecipientsProcessed = 0;

    for (let i = 0; i < recipientNumbers.length; i++) {
      const recipient = recipientNumbers[i];
      for (const contact of recipient.contactNumbers) {
        if (cancellationTokens[campainid]) {
          console.log(`Bulk message sending for campaign ${campainid} was cancelled.`);
          break; // Stop processing if cancellation flag is set
        }

        let attempt = 0;
        let messageSent = false;

        while (attempt < maxRetries && !messageSent) {
          // Replace parameters in the message
          let customizedMessage = message.replace('%param1%', contact.Param1 || '')
                                         .replace('%param2%', contact.Param2 || '')
                                         .replace('%param3%', contact.Param3 || '')
                                         .replace('%param4%', contact.Param4 || '')
                                         .replace('%param5%', contact.Param5 || '');

          // Remove placeholders with no value
          customizedMessage = customizedMessage.replace(/%param\d%/g, '');

          const payload = {
            clientId: user._id,
            sender: sender,
            number: contact.number,
            type: 'text',
            message: customizedMessage,
            instance_id: instance_id,
            access_token: access_token,
          };

          try {
            const response = await fetch(hisocialWhatsAppEndpoint, {
              method: 'POST',
              body: JSON.stringify(payload),
              headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
            let remark = "Message sent successfully";

            if (status === "success") {
              successCount++;
              user.Totalcredit -= user.whatsappmodel.cm;
              user.creditused += user.whatsappmodel.cm;
              await user.save();
              messageSent = true;
            } else {
              throw new Error("Failed to send message");
            }

            await fetch(trackingServiceUrl, {
              method: 'POST',
              body: JSON.stringify({
                clientId: user._id,
                sender: sender,
                attachment: "No",
                recipient: contact.number,
                content: customizedMessage,
                campainid: campainid,
                status: status,
                Remark: remark
              }),
              headers: { 'Content-Type': 'application/json' },
            });

            console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${contact.number}`);

          } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
              failureCount++;
              const remark = "Please check if Instance ID is active or contact admin";
              await fetch(trackingServiceUrl, {
                method: 'POST',
                body: JSON.stringify({
                  clientId: user._id,
                  sender: sender,
                  attachment: "No",
                  recipient: contact.number,
                  content: customizedMessage,
                  campainid: campainid,
                  status: "Failed",
                  Remark: remark
                }),
                headers: { 'Content-Type': 'application/json' },
              });
              console.error(`Error sending message to ${contact.number}: ${error}`);
            } else {
              console.log(`Retrying message to ${contact.number} (attempt ${attempt})`);
            }
          }

          // Update campaign success and failure counts after each message attempt
          campain.successCount = successCount;
          campain.failureCount = failureCount;
          await campain.save();

          totalRecipientsProcessed++;
          console.log(`Processed ${totalRecipientsProcessed} recipients.`);

          // Check if break time is needed after each batch
          if (totalRecipientsProcessed % batchSize === 0 && totalRecipientsProcessed < recipientNumbers.reduce((acc, curr) => acc + curr.contactNumbers.length, 0)) {
            console.log(`Taking a break for ${breakTimeMs / 1000 / 60} minutes.`);
            await new Promise((resolve) => setTimeout(resolve, breakTimeMs));
          }

          // Generate a random delay between minIntervalMs and maxIntervalMs
          const randomDelay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
          await new Promise((resolve) => setTimeout(resolve, randomDelay));
        }
      }
    }

    console.log(`Bulk WhatsApp messages sent. Success: ${successCount}, Failure: ${failureCount}`);
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
  }
}




const moment = require('moment-timezone'); // Import moment-timezone for timezone handling


exports.sendBulkWhatsAppMessagess = async (req, res) => {
  const { instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid, scheduleTime } = req.body;

  try {
    // Parse schedule time
    const now = moment().tz('Asia/Kolkata');
    const scheduleDate = moment.tz(scheduleTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');

    console.log('Current time:', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Scheduled time:', scheduleDate.format('YYYY-MM-DD HH:mm:ss'));

    let delay = scheduleDate.diff(now);

    if (!scheduleDate.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid schedule time format.' });
    }

    // If schedule time is in the past, execute immediately
    if (scheduleDate.isBefore(now)) {
      console.log('Scheduled time is in the past. Executing immediately.');
      delay = 0;
    }

    console.log(`Campaign scheduled to start in ${delay} ms (${delay / 1000}s).`);

    // Delay execution using setTimeout
    setTimeout(async () => {
      console.log('Executing campaign...');
      try {
        await sendMessages(instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid);
        console.log('Campaign executed successfully.');
      } catch (err) {
        console.error('Error executing campaign:', err);
      }
    }, delay);

    res.json({
      success: true,
      message: delay === 0 
        ? 'Campaign executed immediately due to past schedule time.'
        : `Campaign scheduled for ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')} successfully.`,
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule campaign.' });
  }
};

















async function sendMessagesmedia(instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid, filename, media_url) {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1; // Maximum number of retries for failed messages
  const batchSize = 1000; // Number of recipients to process in each batch
  const breakTimeMs = 5 * 60 * 1000; // 5 minutes break time between batches

  try {
    const section = await Section.findById(sectionId).populate('user');
    if (!section) {
      console.error('Section not found.');
      return;
    }

    const campain = await Campaign.findById(campainid);
    if (!campain) {
      console.error('Campaign not found.');
      return;
    }

    const recipientNumbers = await RecipientNumber.find({ section: sectionId });
    const user = await Client.findById(section.user._id);

    if (!user) {
      console.error('Client not found.');
      return;
    }
    const minimum = user.Totalcredit;
    let counts;
    if (message) {
      counts = section.count * (user.whatsappmodel.cmf + user.whatsappmodel.cm);
    } else {
      counts = section.count * user.whatsappmodel.cmf;
    }

    if (minimum < counts) {
      campain.failureCount += section.count;
      await campain.save();
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({ clientId: user._id, sender: sender, attachment: "Yes", campainid: campainid, status: "Failed", Remark: "Please check your credit is low or contact admin" }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }
    let successCount = campain.successCount || 0;
    let failureCount = campain.failureCount || 0;
    let totalRecipientsProcessed = 0;

    for (let i = 0; i < recipientNumbers.length; i++) {
      const recipient = recipientNumbers[i];
      for (const contact of recipient.contactNumbers) {
        if (cancellationTokens[campainid]) {
          console.log(`Bulk message sending for campaign ${campainid} was cancelled.`);
          break; // Stop processing if cancellation flag is set
        }

        let attempt = 0;
        let messageSent = false;

        while (attempt < maxRetries && !messageSent) {
          // Replace parameters in the message
          let customizedMessage = message.replace('%param1%', contact.Param1 || '')
                                         .replace('%param2%', contact.Param2 || '')
                                         .replace('%param3%', contact.Param3 || '')
                                         .replace('%param4%', contact.Param4 || '')
                                         .replace('%param5%', contact.Param5 || '');

          // Remove placeholders with no value
          customizedMessage = customizedMessage.replace(/%param\d%/g, '');

          const payload = {
            number: contact.number,
            type: 'media',
            filename: filename,
            message: customizedMessage,
            media_url: media_url,
            instance_id: instance_id,
            access_token: access_token,
          };

          try {
            const response = await fetch(hisocialWhatsAppEndpoint, {
              method: 'POST',
              body: JSON.stringify(payload),
              headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
            let remark = "Message sent successfully";

            if (status === "success") {
              successCount++;
              user.Totalcredit -= user.whatsappmodel.cmf + user.whatsappmodel.cm;
              user.creditused += user.whatsappmodel.cmf + user.whatsappmodel.cm;
              await user.save();
              messageSent = true;
            } else {
              throw new Error("Failed to send message");
            }

            await fetch(trackingServiceUrl, {
              method: 'POST',
              body: JSON.stringify({
                clientId: user._id,
                sender: sender,
                attachment: "Yes",
                recipient: contact.number,
                content: customizedMessage,
                campainid: campainid,
                status: status,
                Remark: remark
              }),
              headers: { 'Content-Type': 'application/json' },
            });

            console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${contact.number}`);

          } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
              failureCount++;
              const remark = "Please check if Instance ID is active or contact admin";
              await fetch(trackingServiceUrl, {
                method: 'POST',
                body: JSON.stringify({
                  clientId: user._id,
                  sender: sender,
                  attachment: "Yes",
                  recipient: contact.number,
                  content: customizedMessage,
                  campainid: campainid,
                  status: "Failed",
                  Remark: remark
                }),
                headers: { 'Content-Type': 'application/json' },
              });
              console.error(`Error sending message to ${contact.number}: ${error}`);
            } else {
              console.log(`Retrying message to ${contact.number} (attempt ${attempt})`);
            }
          }

          // Update campaign success and failure counts after each message attempt
          campain.successCount = successCount;
          campain.failureCount = failureCount;
          await campain.save();

          totalRecipientsProcessed++;
          console.log(`Processed ${totalRecipientsProcessed} recipients.`);

          // Check if break time is needed after each batch
          if (totalRecipientsProcessed % batchSize === 0 && totalRecipientsProcessed < recipientNumbers.reduce((acc, curr) => acc + curr.contactNumbers.length, 0)) {
            console.log(`Taking a break for ${breakTimeMs / 1000 / 60} minutes.`);
            await new Promise((resolve) => setTimeout(resolve, breakTimeMs));
          }

          // Generate a random delay between minIntervalMs and maxIntervalMs
          const randomDelay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
          await new Promise((resolve) => setTimeout(resolve, randomDelay));
        }
      }
    }

    console.log(`Bulk WhatsApp messages sent. Success: ${successCount}, Failure: ${failureCount}`);
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
  }
}












exports.sendBulkWhatsAppMessagesMedia = async (req, res) => {
  const { instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid, filename, media_url, scheduleTime } = req.body;

  console.log(req.body);

  try {
    // Parse the schedule time
    const now = moment().tz('Asia/Kolkata');
    const scheduleDate = moment.tz(scheduleTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');

    console.log('Current time in Asia/Kolkata:', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Scheduled time in Asia/Kolkata:', scheduleDate.format('YYYY-MM-DD HH:mm:ss'));

    if (!scheduleDate.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid schedule time format.' });
    }

    let delay = scheduleDate.diff(now);

    // Handle past schedule times
    if (scheduleDate.isBefore(now)) {
      console.log('Scheduled time is in the past. Executing immediately.');
      delay = 0;
    }

    console.log(`Media campaign scheduled to start in ${delay} ms (${delay / 1000}s).`);

    // Save message details to the database
    const whatsappMessage = new WhatsAppMessage({
      instance_id,
      sender,
      sectionId,
      message,
      minIntervalMs,
      maxIntervalMs,
      campainid,
      filename,
      media_url,
      scheduleTime,
    });
    await whatsappMessage.save();

    // Delay execution using setTimeout
    setTimeout(async () => {
      console.log('Executing scheduled media campaign...');
      try {
        await sendMessagesmedia(instance_id, sender, sectionId, message, minIntervalMs, maxIntervalMs, campainid, filename, media_url);
        console.log('Media campaign executed successfully.');
      } catch (err) {
        console.error('Error executing media campaign:', err);
      }
    }, delay);

    res.json({
      success: true,
      message: delay === 0
        ? 'Media campaign executed immediately due to past schedule time.'
        : `Media campaign scheduled for ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')} successfully.`,
    });
  } catch (error) {
    console.error('Error scheduling media campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule media campaign.' });
  }
};





exports.sendTextMessageToGroup = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppGroupEndpoint = 'https://hisocial.in/api/send_group';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1;  // Maximum number of retries for failed messages

  try {
    const userId = req.params.id;
    const user = await Client.findById(userId);

    if (!user) {
      return res.status(404).send('Client not found.');
    }

    const { groups, message, instance_id, scheduleTime } = req.body;

    // Validate if groups array exists and is not empty
    if (!Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ success: false, message: 'No groups provided.' });
    }

    const minimumCredits = user.Totalcredit;
    const totalCost = groups.length * user.whatsappmodelgroup.cm;  // Total cost for sending messages to all groups

    if (minimumCredits < totalCost) {
      await trackMessageFailure(user._id, user.mobile, "No", "Failed", "Please check your credit is low or contact admin");
      return res.status(400).json({ success: false, message: 'Not enough credits.' });
    }

    // Determine if the message is to be scheduled or sent immediately
    const now = moment().tz('Asia/Kolkata');
    console.log('Current time in Asia/Kolkata:', now.format('YYYY-MM-DD HH:mm:ss'));

    if (scheduleTime) {
      // Parse the schedule time string and convert it to a moment object
      const scheduleDate = moment.tz(scheduleTime, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
      console.log('Schedule time in Asia/Kolkata:', scheduleDate.format('YYYY-MM-DD HH:mm:ss'));

      if (scheduleDate.isValid() && scheduleDate.isAfter(now)) {
        // Schedule the message at the given time using cron
        const cronExpression = `${scheduleDate.minutes()} ${scheduleDate.hours()} ${scheduleDate.date()} ${scheduleDate.month() + 1} *`;

        nodeCron.schedule(cronExpression, async () => {
          console.log(`Scheduled campaign started at ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')}`);
          await sendMessagesToGroups(user, groups, message, instance_id, access_token);
        });

        return res.json({
          success: true,
          message: `Campaign scheduled to start at ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')}`
        });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or past schedule time provided.' });
      }
    }

    // Start the message campaign immediately if no valid schedule time is provided
    console.log('Starting campaign immediately.');
    await sendMessagesToGroups(user, groups, message, instance_id, access_token);
    return res.json({
      success: true,
      message: 'Campaign started immediately.',
    });

  } catch (error) {
    console.error('Error in main try block:', error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
};

// Helper function to send messages to groups
async function sendMessagesToGroups(user, groups, message, instance_id, access_token) {
  const hisocialWhatsAppGroupEndpoint = 'https://hisocial.in/api/send_group';
  const maxRetries = 1;  // Maximum number of retries for failed messages
  const successGroups = [];
  const failedGroups = [];

  for (let groupId of groups) {
    const group = await WhatsAppGroup.findById(groupId);
    if (!group) {
      failedGroups.push({ groupId, message: 'Group not found' });
      continue;
    }

    let attempt = 0;
    let messageSent = false;

    while (attempt < maxRetries && !messageSent) {
      const payload = {
        group_id: group.groupid,
        type: 'text',
        message: message,
        instance_id: instance_id,
        access_token: access_token,
      };

      try {
        const response = await fetch(hisocialWhatsAppGroupEndpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log(data);

        const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
        const remark = status === "success" ? "Message sent successfully" : "Please check if Instance ID is active or contact admin";

        if (status === "success") {
          // Deduct the user credits for successful message
          user.Totalcredit -= user.whatsappmodelgroup.cmf;
          user.creditused += user.whatsappmodelgroup.cmf;
          await user.save();

          // Update the success count for the group
          await WhatsAppGroup.findOneAndUpdate(
            { _id: groupId },
            { $inc: { successcount: 1 } },
            { new: true, upsert: true }
          );
          messageSent = true;
          successGroups.push(group.name);
        } else {
          throw new Error("Failed to send message");
        }

        await trackMessageStatus(user._id, user.mobile, group.name, message, groupId, status, remark, "No");

      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error('Error sending text message to WhatsApp group:', error);
          const remark = "Please check if Instance ID is active or contact admin";

          // Increment the failure count if the message fails
          await WhatsAppGroup.findOneAndUpdate(
            { _id: groupId },
            { $inc: { failurecount: 1 } },
            { new: true, upsert: true }
          );

          await trackMessageStatus(user._id, user.mobile, group.name, null, groupId, "Failed", remark, "No");
          failedGroups.push({ groupId, message: 'Message sending failed after retries' });
        } else {
          console.log(`Retrying message to group ${group.name} (attempt ${attempt})`);
        }
      }
    }
  }

  return { successGroups, failedGroups };
}


// Helper function to track message failures
async function trackMessageFailure(clientId, sender, attachment, status, remark) {
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  await fetch(trackingServiceUrl, {
    method: 'POST',
    body: JSON.stringify({
      clientId: clientId,
      sender: sender,
      attachment: attachment,
      status: status,
      Remark: remark,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Helper function to track message status
async function trackMessageStatus(clientId, sender, recipient, content, campainId, status, remark, attachment) {
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  await fetch(trackingServiceUrl, {
    method: 'POST',
    body: JSON.stringify({
      clientId: clientId,
      sender: sender,
      recipient: recipient,
      content: content,
      campainid: campainId,
      status: status,
      Remark: remark,
      attachment:attachment
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}







    
    
    






















exports.sendMediaMessageToGroup = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppGroupEndpoint = 'https://hisocial.in/api/send_group';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1;  // Maximum number of retries for failed messages

  try {
    const userId = req.params.id;
    const user = await Client.findById(userId);

    if (!user) {
      return res.status(404).send('Client not found.');
    }

    const { groups, message, instance_id, media_url, type, filename, scheduleTime } = req.body;

    // Validate if groups array exists and is not empty
    if (!Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ success: false, message: 'No groups provided.' });
    }

    const minimumCredits = user.Totalcredit;
    let totalCost;
    
    // Check if it's a media with message or only media
    if (message && media_url) {
      // Media with message
      totalCost = groups.length * (user.whatsappmodelgroup.cmf + user.whatsappmodelgroup.cm);
    } else if (media_url) {
      // Only media
      totalCost = groups.length * user.whatsappmodelgroup.cmf;
    } else {
      return res.status(400).json({ success: false, message: 'Either message or media URL must be provided.' });
    }

    // Check if the user has enough credits
    if (minimumCredits < totalCost) {
      await trackMessageFailure(user._id, user.mobile, "Yes", "Failed", "Please check your credit is low or contact admin");
      return res.status(400).json({ success: false, message: 'Not enough credits.' });
    }

    // Determine if the message is to be scheduled or sent immediately
    const now = moment().tz('Asia/Kolkata');
    console.log('Current time in Asia/Kolkata:', now.format('YYYY-MM-DD HH:mm:ss'));

    if (scheduleTime) {
      // Parse the schedule time string and convert it to a moment object
      const scheduleDate = moment.tz(scheduleTime, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
      console.log('Schedule time in Asia/Kolkata:', scheduleDate.format('YYYY-MM-DD HH:mm:ss'));

      if (scheduleDate.isValid() && scheduleDate.isAfter(now)) {
        // Schedule the message at the given time using cron
        const cronExpression = `${scheduleDate.minutes()} ${scheduleDate.hours()} ${scheduleDate.date()} ${scheduleDate.month() + 1} *`;

        nodeCron.schedule(cronExpression, async () => {
          console.log(`Scheduled media campaign started at ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')}`);
          await sendMediaMessagesToGroups(user, groups, message, instance_id, media_url, type, filename, access_token);
        });

        return res.json({
          success: true,
          message: `Media campaign scheduled to start at ${scheduleDate.format('YYYY-MM-DD HH:mm:ss')}`
        });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or past schedule time provided.' });
      }
    }

    // Start the message campaign immediately if no valid schedule time is provided
    console.log('Starting media campaign immediately.');
    await sendMediaMessagesToGroups(user, groups, message, instance_id, media_url, type, filename, access_token);
    return res.json({
      success: true,
      message: 'Media campaign started immediately.',
    });

  } catch (error) {
    console.error('Error in main try block:', error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
};

// Helper function to send media messages to multiple groups
async function sendMediaMessagesToGroups(user, groups, message, instance_id, media_url, type, filename, access_token) {
  const hisocialWhatsAppGroupEndpoint = 'https://hisocial.in/api/send_group';
  const maxRetries = 1;  // Maximum number of retries for failed messages
  const successGroups = [];
  const failedGroups = [];

  for (let groupId of groups) {
    const group = await WhatsAppGroup.findById(groupId);
    if (!group) {
      failedGroups.push({ groupId, message: 'Group not found' });
      continue;
    }

    let attempt = 0;
    let messageSent = false;

    while (attempt < maxRetries && !messageSent) {
      const payload = {
        group_id: group.groupid,
        type: type,
        message: message || "",  // If no message, send empty string
        media_url: media_url,
        filename: filename || "",  // Optional filename for media
        instance_id: instance_id,
        access_token: access_token,
      };

      try {
        const response = await fetch(hisocialWhatsAppGroupEndpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        console.log(data);

        const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
        const remark = status === "success" ? "Media message sent successfully" : "Failed to send media message";

        if (status === "success") {
          // Deduct the credits based on the type of message
          if (message && media_url) {
            // Media with message
            user.Totalcredit -= user.whatsappmodelgroup.cmf + user.whatsappmodelgroup.cm;
            user.creditused += user.whatsappmodelgroup.cmf + user.whatsappmodelgroup.cm;
          } else if (media_url) {
            // Only media
            user.Totalcredit -= user.whatsappmodelgroup.cmf;
            user.creditused += user.whatsappmodelgroup.cmf;
          }

          await user.save();
          await WhatsAppGroup.findOneAndUpdate(
            { _id: groupId },
            { $inc: { successcount: 1 } },
            { new: true, upsert: true }
          );
          messageSent = true;
          successGroups.push(group.name);

        } else {
          throw new Error("Failed to send media message");
        }

        await trackMessageStatus(user._id, user.mobile, group.name, message, groupId, status, remark, "Yes");

      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          
          console.error('Error sending media message to WhatsApp group:', error);
          const remark = "Please check if Instance ID is active or contact admin";
          await WhatsAppGroup.findOneAndUpdate(
            { _id: groupId },
            { $inc: { failurecount: 1 } },
            { new: true, upsert: true }
          );
          await trackMessageStatus(user._id, user.mobile, group.name, null, groupId, "Failed", remark,"Yes");
          failedGroups.push({ groupId, message: 'Media message sending failed after retries' });
        } else {
          console.log(`Retrying media message to group ${group.name} (attempt ${attempt})`);
        }
      }
    }
  }

  return { successGroups, failedGroups };
}

// Helper function to track message failures
async function trackMessageFailure(clientId, sender, attachment, status, remark ) {
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  await fetch(trackingServiceUrl, {
    method: 'POST',
    body: JSON.stringify({
      clientId: clientId,
      sender: sender,
      attachment: attachment,
      status: status,
      Remark: remark,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Helper function to track message status
async function trackMessageStatus(clientId, sender, recipient, content, campaignId, status, remark, attachment) {
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  await fetch(trackingServiceUrl, {
    method: 'POST',
    body: JSON.stringify({
      clientId: clientId,
      sender: sender,
      recipient: recipient,
      content: content,
      campainid: campaignId,
      status: status,
      Remark: remark,
      attachment:attachment
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}
















exports.sendTextMessage = async (req, res) => {
  const url = 'https://hisocial.in/api/send';
  const access_token = '64da53e6c44e5';

  // Extract parameters from the request body
  const { number, type, message, instance_id } = req.body;

  const payload = {
    number: number,
    type: type,
    message: message,
    instance_id: instance_id,
    access_token: access_token,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      
      res.status(200).json({  data: data });
    } else {
      const errorText = await response.text();
      console.error('Failed to send message:', response.status, errorText);
      res.status(response.status).json({ success: false, message: `Failed to send message: ${response.statusText}`, error: errorText });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.toString() });
  }
};









const { createObjectCsvWriter } = require('csv-writer');

const util = require('util');

const unlinkAsync = util.promisify(fs.unlink);

exports.downloadexcel = async (req, res) => {
  const { campainid } = req.params;

  try {
    // Fetch messages by campaign ID
    const messages = await Message.find({ campainid: campainid });
console.log(messages)
    if (!messages || messages.length === 0) {
      return res.status(404).send('No messages found for the specified campaign ID.');
    }

    // Preprocess messages to replace empty fields with "empty"
    const processedMessages = messages.map(message => ({
      sender: message.sender || 'empty',
      recipient: message.recipient || 'empty',
      status: message.status || 'empty',
      attachment: message.attachment || 'empty',
      Remark:message.Remark|| 'empty',
      timestamp: message.timestamp || 'empty',
      
    }));

    const filePath = `./messages_${campainid}.csv`;

    // Define the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'sender', title: 'Sender' },
        { id: 'recipient', title: 'Recipient' },
        { id: 'status', title: 'Status' },
        { id: 'attachment', title: 'Attachment' },
        { id: 'Remark', title: 'Remark' },
        { id: 'timestamp', title: 'Time Stamp' },
        
      ],
    });

    // Write records to CSV
    await csvWriter.writeRecords(processedMessages);

    // Send the CSV file as a download
    res.download(filePath, `messages_${campainid}.csv`, async (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file.');
      } else {
        // Delete the file after sending it
        try {
          await unlinkAsync(filePath);
          console.log(`Temporary file ${filePath} deleted successfully.`);
        } catch (deleteErr) {
          console.error(`Error deleting the file ${filePath}:`, deleteErr);
        }
      }
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).send('Failed to generate CSV.');
  }
};







exports.sendBulkWhatsAppMessagesapi = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1; // Maximum number of retries for failed messages

  try {
    const { instance_id, numbers, message, minIntervalMs, clientid } = req.body;

    // Fetch client details
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No Account found');
    }

    const minimumCredits = client.Totalcredit;
    const requiredCredits = numbers.length * client.whatsappmodel.cm;

    if (minimumCredits < requiredCredits) {
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          attachment: "No",
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    let successCount = 0;
    let failureCount = 0;

    for (const recipientNumber of numbers) {
      let attempt = 0;
      let messageSent = false;

      while (attempt < maxRetries && !messageSent) {
        const payload = {
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          number: recipientNumber,
          type: 'text',
          message: message,
          instance_id: instance_id,
          access_token: access_token,
        };

        try {
          const response = await fetch(hisocialWhatsAppEndpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await response.json();
          console.log(data)
          const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
          let remark = status === "success" ? "Message sent successfully" : "Failed to send message";

          if (status === "success") {
            successCount++;
            client.Totalcredit -= client.whatsappmodel.cm;
            client.creditused += client.whatsappmodel.cm;
            await client.save();
            messageSent = true;
          } else {
            throw new Error("Failed to send message");
          }

          await fetch(trackingServiceUrl, {
            method: 'POST',
            body: JSON.stringify({
              clientId: client._id,
              sender: `${client.name} ${client.mobile}`,
              attachment: "No",
              recipient: recipientNumber,
              content: message,
              status: status,
              Remark: remark
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${recipientNumber}`);

        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) {
            failureCount++;
            const remark = "Please check if Instance ID is active or contact admin";
            await fetch(trackingServiceUrl, {
              method: 'POST',
              body: JSON.stringify({
                clientId: client._id,
                sender: `${client.name} ${client.mobile}`,
                attachment: "No",
                recipient: recipientNumber,
                content: message,
                status: "Failed",
                Remark: remark
              }),
              headers: { 'Content-Type': 'application/json' },
            });
            console.error(`Error sending message to ${recipientNumber}: ${error}`);
          } else {
            console.log(`Retrying message to ${recipientNumber} (attempt ${attempt})`);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, minIntervalMs));
      }
    }

    console.log(`Bulk WhatsApp messages sent. Success: ${successCount}, Failure: ${failureCount}`);
    res.json({
      success: true,
      message: 'Bulk WhatsApp messages sent.',
      successCount,
      failureCount,
    });

  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    res.status(500).json({ success: false, error: 'Failed to send bulk WhatsApp messages' });
  }
};




exports.sendBulkWhatsAppMessagesMediaapi = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1;  // Maximum number of retries for failed messages

  try {
    const { instance_id, clientid, numbers, message, minIntervalMs, filename, media_url } = req.body;
    
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No Account found');
    }

    const minimumCredits = client.Totalcredit;
    let requiredCredits = numbers.length * client.whatsappmodel.cmf;
    
    
    if (message) {
       requiredCredits = numbers.length *  (client.whatsappmodel.cmf + client.whatsappmodel.cm);
    } else {
      requiredCredits = numbers.length * client.whatsappmodel.cmf;
    }
console.log(requiredCredits)
    if (minimumCredits < requiredCredits) {
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          attachment: "Yes",
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    let successCount = 0;
    let failureCount = 0;

    for (const recipientNumber of numbers) {
      let attempt = 0;
      let messageSent = false;

      while (attempt < maxRetries && !messageSent) {
        const payload = {
          number: recipientNumber,
          type: 'media',
          filename: filename,
          message: message,
          media_url: media_url,
          instance_id: instance_id,
          access_token: access_token,
        };

        try {
          const response = await fetch(hisocialWhatsAppEndpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await response.json();
          const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
          let remark = "Message sent successfully";

          if (status === "success") {
            successCount++;
            
              if (message) {
                client.Totalcredit -=  client.whatsappmodel.cmf +  client.whatsappmodel.cm;
                client.creditused +=  client.whatsappmodel.cmf +  client.whatsappmodel.cm;
              } else {
                client.Totalcredit -= client.whatsappmodel.cmf;
                client.creditused +=  client.whatsappmodel.cmf;
              }
              await client.save();
              messageSent = true;
            
            messageSent = true;
          } else {
            throw new Error("Failed to send message");
          }

          await fetch(trackingServiceUrl, {
            method: 'POST',
            body: JSON.stringify({
              clientId: client._id,
              sender: `${client.name} ${client.mobile}`,
              attachment: "Yes",
              recipient: recipientNumber,
              content: message,
              status: status,
              Remark: remark
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${recipientNumber}`);

        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) {
            failureCount++;
            const remark = "Please check if Instance ID is active or contact admin";
            await fetch(trackingServiceUrl, {
              method: 'POST',
              body: JSON.stringify({
                clientId: client._id,
                sender: `${client.name} ${client.mobile}`,
                attachment: "Yes",
                recipient: recipientNumber,
                content: message,
                status: "Failed",
                Remark: remark
              }),
              headers: { 'Content-Type': 'application/json' },
            });
            console.error(`Error sending message to ${recipientNumber}: ${error}`);
          } else {
            console.log(`Retrying message to ${recipientNumber} (attempt ${attempt})`);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, minIntervalMs));
      }
    }

    console.log(`Bulk WhatsApp messages sent. Success: ${successCount}, Failure: ${failureCount}`);
    res.json({
      success: true,
      message: 'Bulk WhatsApp messages sent.',
      successCount,
      failureCount,
    });

  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    res.status(500).json({ success: false, error: 'Failed to send bulk WhatsApp messages' });
  }
};




exports.sendSingleWhatsAppMessageapi = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';

  try {
    const { instance_id, number, message, clientid } = req.body;

    // Fetch client details
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No Account found');
    }

    const minimumCredits = client.Totalcredit;
    const requiredCredits = client.whatsappmodel.cm;

    if (minimumCredits < requiredCredits) {
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          attachment: "No",
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    const payload = {
      clientId: client._id,
      sender: `${client.name} ${client.mobile}`,
      number: number,
      type: 'text',
      message: message,
      instance_id: instance_id,
      access_token: access_token,
    };

    const response = await fetch(hisocialWhatsAppEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
console.log(response)
    const data = await response.json();
    const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
    let remark = status === "success" ? "Message sent successfully" : "Failed to send message";

    if (status === "success") {
      client.Totalcredit -= client.whatsappmodel.cm;
      client.creditused += client.whatsappmodel.cm;
      await client.save();
    }

    await fetch(trackingServiceUrl, {
      method: 'POST',
      body: JSON.stringify({
        clientId: client._id,
        sender: `${client.name} ${client.mobile}`,
        attachment: "No",
        recipient: number,
        content: message,
        status: status,
        Remark: remark
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${number}`);
    res.json({ success: status === "success", message: status === "success" ? 'WhatsApp message sent successfully.' : 'Failed to send WhatsApp message.' });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
  }
};



exports.sendSingleWhatsAppMessageMediaapi = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';

  try {
    const { instance_id, clientid, number, message, filename, media_url } = req.body;

    // Fetch client details
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No Account found');
    }

    const minimumCredits = client.Totalcredit;
    let requiredCredits = message ? (client.whatsappmodel.cmf + client.whatsappmodel.cm) : client.whatsappmodel.cmf;

    if (minimumCredits < requiredCredits) {
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          attachment: "Yes",
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    const payload = {
      number: number,
      type: 'media',
      filename: filename,
      message: message,
      media_url: media_url,
      instance_id: instance_id,
      access_token: access_token,
    };
console.log(payload)
    const response = await fetch(hisocialWhatsAppEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
console.log(response)
    const data = await response.json();
    const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
    let remark = status === "success" ? "Message sent successfully" : "Failed to send message";

    if (status === "success") {
      if (message) {
        client.Totalcredit -= client.whatsappmodel.cmf + client.whatsappmodel.cm;
        client.creditused += client.whatsappmodel.cmf + client.whatsappmodel.cm;
      } else {
        client.Totalcredit -= client.whatsappmodel.cmf;
        client.creditused += client.whatsappmodel.cmf;
      }
      await client.save();
    }

    await fetch(trackingServiceUrl, {
      method: 'POST',
      body: JSON.stringify({
        clientId: client._id,
        sender: `${client.name} ${client.mobile}`,
        attachment: "Yes",
        recipient: number,
        content: message,
        status: status,
        Remark: remark
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${number}`);
    res.json({ success: status === "success", message: status === "success" ? 'WhatsApp message sent successfully.' : 'Failed to send WhatsApp message.' });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
  }
};









exports.downloadexcelapi = async (req, res) => {
  const { clientid } = req.params;
  const { fromDate, toDate } = req.query;

  try {
    // Fetch client details
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No client found.');
    }

    // Helper function to convert date string from DD/MM/YYYY to ISO format
    const convertToISODate = (dateString) => {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Validate and set up date filter
    let dateFilter = {};
    if (fromDate && toDate) {
      const fromISO = convertToISODate(fromDate);
      const toISO = convertToISODate(toDate);
      
      if (isNaN(fromISO.getTime()) || isNaN(toISO.getTime())) {
        return res.status(400).send('Invalid date format. Please use DD/MM/YYYY.');
      }

      dateFilter = {
        timestamp: {
          $gte: new Date(fromISO.setHours(0, 0, 0)),
          $lte: new Date(toISO.setHours(23, 59, 59))
        }
      };
    }

    // Fetch messages by client ID and optional date filter
    const messages = await Message.find({ clientId: clientid, ...dateFilter });
    console.log(messages);

    if (!messages || messages.length === 0) {
      return res.status(404).send('No messages found for the specified client and date range.');
    }

    // Preprocess messages to replace empty fields with "empty" and format timestamp
    const processedMessages = messages.map(message => ({
      sender: message.sender || 'empty',
      recipient: message.recipient || 'empty',
      status: message.status || 'empty',
      attachment: message.attachment || 'empty',
      Remark: message.Remark || 'empty',
      timestamp: message.timestamp ? new Date(message.timestamp).toLocaleString() : 'empty',
    }));

    // Sanitize the dates in the file name to avoid path issues
    const sanitizedFromDate = fromDate.replace(/\//g, '-');
    const sanitizedToDate = toDate.replace(/\//g, '-');

    // Generate file name with client name and sanitized date range
    const clientName = client.name.replace(/\s+/g, ''); // Remove spaces from client name for file naming
    const fileName = `messages_${clientName}_${sanitizedFromDate}-${sanitizedToDate}.csv`;

    // Define the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: `./${fileName}`,
      header: [
        { id: 'sender', title: 'Sender' },
        { id: 'recipient', title: 'Recipient' },
        { id: 'status', title: 'Status' },
        { id: 'attachment', title: 'Attachment' },
        { id: 'Remark', title: 'Remark' },
        { id: 'timestamp', title: 'Time Stamp' },
      ],
    });

    // Write records to CSV
    await csvWriter.writeRecords(processedMessages);

    // Send the CSV file as a download
    res.download(`./${fileName}`, fileName, async (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file.');
      } else {
        // Delete the file after sending it
        try {
          await fs.unlink(`./${fileName}`);
          console.log(`Temporary file ${fileName} deleted successfully.`);
        } catch (deleteErr) {
          console.error(`Error deleting the file ${fileName}:`, deleteErr);
        }
      }
    });

  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).send('Failed to generate CSV.');
  }
};








exports.createInstanceapi = async (req, res) => {
  const access_token = "64da53e6c44e5";

  try {
    const response = await axios.post('http://hisocial.in/api/create_instance', null, {
      params: {
        access_token: access_token,
      }
    });
    
    console.log('Instance created successfully:', response.data);
    res.status(200).json(response.data);  // Send the response back to the client
  } catch (error) {
    console.error('Error creating instance:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create instance', details: error.response ? error.response.data : error.message });
  }
};









 


exports.getQRCodeapi = async (req, res) => {
  const instance_id = req.params.instanceid;
  const access_token = "64da53e6c44e5";
  try {
    const response = await axios.post('http://hisocial.in/api/get_qrcode', null, {
      params: {
        instance_id: instance_id,
        access_token: access_token,
      }
    });

    if (response.data && response.data.base64) {
      res.send(response.data);
    } else {
      console.error('No base64 data found in the response');
      res.status(500).send(response.data.message);
    }
  } catch (error) {
    
      res.status(500).send(response.data.message);
    
  }
};





exports.sendSingleWhatsAppMessageapiparam = async (req, res) => {
  const access_token = '64da53e6c44e5';
  const hisocialWhatsAppEndpoint = 'https://hisocial.in/api/send';
  const trackingServiceUrl = 'https://connectje.in/api/v1/groups/track-message/excel';
  const maxRetries = 1; // Maximum number of retries for failed messages

  try {
    const { instance_id, number, message, clientid } = req.query;
    // Fetch client details
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).send('No Account found');
    }

    const minimumCredits = client.Totalcredit;
    const requiredCredits = client.whatsappmodel.cm;

    if (minimumCredits < requiredCredits) {
      await fetch(trackingServiceUrl, {
        method: 'POST',
        body: JSON.stringify({
          clientId: client._id,
          sender: `${client.name} ${client.mobile}`,
          attachment: "No",
          status: "Failed",
          Remark: "Please check your credit is low or contact admin"
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return res.status(400).json({ success: false, message: 'Not enough message templates available.' });
    }

    let attempt = 0;
    let messageSent = false;

    while (attempt < maxRetries && !messageSent) {
      const payload = {
        clientId: client._id,
        sender: `${client.name} ${client.mobile}`,
        number: number,
        type: 'text',
        message: message,
        instance_id: instance_id,
        access_token: access_token,
      };

      try {
        const response = await fetch(hisocialWhatsAppEndpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        const status = data.status === "success" && data.message?.key?.fromMe === true ? "success" : "Failed";
        let remark = status === "success" ? "Message sent successfully" : "Failed to send message";

        if (status === "success") {
          client.Totalcredit -= client.whatsappmodel.cm;
          client.creditused += client.whatsappmodel.cm;
          await client.save();
          messageSent = true;
        } else {
          throw new Error("Failed to send message");
        }

        await fetch(trackingServiceUrl, {
          method: 'POST',
          body: JSON.stringify({
            clientId: client._id,
            sender: `${client.name} ${client.mobile}`,
            attachment: "No",
            recipient: number,
            content: message,
            status: status,
            Remark: remark
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        console.log(`Message ${status === "success" ? "sent successfully" : "Failed"} to ${number}`);

      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          const remark = "Please check if Instance ID is active or contact admin";
          await fetch(trackingServiceUrl, {
            method: 'POST',
            body: JSON.stringify({
              clientId: client._id,
              sender: `${client.name} ${client.mobile}`,
              attachment: "No",
              recipient: number,
              content: message,
              status: "Failed",
              Remark: remark
            }),
            headers: { 'Content-Type': 'application/json' },
          });
          console.error(`Error sending message to ${number}: ${error}`);
        } else {
          console.log(`Retrying message to ${number} (attempt ${attempt})`);
        }
      }
    }

    if (messageSent) {
      console.log('WhatsApp message sent successfully.');
      res.json({ success: true, message: 'WhatsApp message sent successfully.' });
    } else {
      console.log('Failed to send WhatsApp message.');
      res.status(500).json({ success: false, message: 'Failed to send WhatsApp message.' });
    }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
  }
};