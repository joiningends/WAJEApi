const axios = require('axios');

exports.sendeventmessage = async (req, res) => {
    try {
        const { name, phn, instance_id } = req.body;

        // Validate phone number and name
        if (!name || !phn) {
            return res.status(400).json({ message: 'Name and phone number are required' });
        }

        // Prepare the message with bold text
        const message = `Dear Sir/Maam,\n\nWe thank you for visiting the ZEISS Vision Center By SpecsBunker counter at the Hyderabad Golf Club. We would love to connect with you in future for your Spectacles / Sunglasses or Lenses. We have Golf specialized lenses as well.\n\nAs an esteemed participant of this tournament, you are also eligible for *Flat 15% Off* across our range of products. We have over 70 international brands to chose from at the store.\n\nStore Location: https://maps.app.goo.gl/HJevNoYQwrC36GnN9\n\nWe look forward to serving you at our store.\n\nRegards,\nRakesh Paul\nStore Manager\nZEISS Vision Center By SpecsBunker\nJubilee Hills`;

        // Prepare API request
        const response = await axios.post('https://connectje.in/api/v1/wa/api/single', {
            instance_id,
            number: `${phn}`, // Ensure to add '91' before the number
            message: message,
            clientid: '66b49b2f3d31113bee688fe4'
        });

        console.log('Message sent successfully:', response.data);

        // Respond to the client
        res.status(200).json({ message: 'Message sent successfully', data: response.data });
    } catch (error) {
        console.error('Error sending message:', error);

        // Respond with an error message
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

