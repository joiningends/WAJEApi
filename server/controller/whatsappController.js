// waController.js
const axios = require('axios');

const sendWhatsAppMessage = async (event, mobileNumber, message) => {
  try {
    const response = await axios.post('https://connectje.in/api/v1/wa/api/media/single', {
      instance_id: event.instance_id , // Default instance_id
      clientid: event.clientId,
      number: `91${mobileNumber}`,  // Use the dynamic mobile number from participantData
      message,
    });

    return response.data; // Return the response from the API
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error; // Throw error to be caught in the calling function
  }
};

module.exports = {
  sendWhatsAppMessage,
};
