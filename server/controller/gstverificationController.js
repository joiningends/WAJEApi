const axios = require('axios');
const GstVerification = require('../models/gstverification');
const { Client } = require('../models/clints');


exports.verifyGstNumber = async (req, res) => {
    const { clientid, gstnumber } = req.params;
    const token = '0c56d92e88ba114f7aeb00acfc4e32f635e1af6e';
    const client_id = 'UwfOvkVsCkkAwOqWZm';

    try {
        // Find the client by ID
        const client = await Client.findById(clientid);
        if (!client) {
            return res.status(404).json({ message: 'No Account found' });
        }

        const minimumCredits = Number(client.Totalcrediteinvoice) || 0; // Ensure it's a number
        const requiredCredits = client.einvoicemodel.gstverification;

        // Check if the client has sufficient credits
        if (minimumCredits < requiredCredits) {
            const failedVerification = new GstVerification({
                gstnumber,
                clientid,
                status: 'Insufficient credits. Please check your credit balance or contact admin.'
            });

            await failedVerification.save();
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        // Making the API call to the GST verification service
        const response = await axios.get(`https://commonapi.mastersindia.co/commonapis/searchgstin?gstin=${gstnumber}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'client_id': client_id
            }
        });

        const responseData = response.data;

        // Create verification data
        const verificationData = {
            gstnumber: gstnumber,
            clientid: clientid,
            status: responseData.error ? 'Failed' : 'Success'
        };

        // Create a new GST verification record and save it to the database
        const savedVerification = await new GstVerification(verificationData).save();

        if (!responseData.error) {
            // Deduct credits and update the client's record
            client.Totalcrediteinvoice = Math.max(0, minimumCredits - requiredCredits); // Prevent negative values
            client.creditusedforeinvoice = (client.creditusedforeinvoice || 0) + requiredCredits; // Ensure it's a number
            await client.save();

            res.status(201).json({ message: 'GST verification successful', data:responseData  });
        } else {
            res.status(400).json({ message: 'GST verification failed', error: responseData });
        }
    } catch (error) {
        // Save the failed verification attempt
        const failedVerification = new GstVerification({
            gstnumber,
            clientid,
            status: 'Failed'
        });

        await failedVerification.save();
        
        res.status(500).json({ message: 'Error verifying GST number', error: error.message });
    }
};






const { createObjectCsvStringifier } = require('csv-writer');

exports.csvgstverification = async (req, res) => {
    try {
        const { clientId } = req.params; // Correctly extract clientId from params

        // Fetch records for the given clientId
        const records = await GstVerification.find({ clientid: clientId }); // Ensure the query is correct

        // CSV writer configuration
        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'gstnumber', title: 'GST Number' },
                { id: 'status', title: 'Status' },
                { id: 'timestamp', title: 'Timestamp' }
            ]
        });

        // Prepare data for CSV
        const csvRecords = records.map(record => ({
            gstnumber: record.gstnumber,
            status: record.status,
            timestamp: record.timestamp // Assuming you have a createdAt field
        }));

        // Create the CSV string with headers
        const csvHeader = csvStringifier.getHeaderString();
        const csvBody = csvStringifier.stringifyRecords(csvRecords);
        const csvString = csvHeader + csvBody;

        // Send the CSV string as a download
        res.setHeader('Content-disposition', 'attachment; filename=gst_verification_report.csv');
        res.setHeader('Content-type', 'text/csv');
        res.send(csvString);
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).send('Error generating CSV');
    }
};
