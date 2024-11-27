const axios = require('axios');
const EInvoice = require('../models/einvoice');
const { Client } = require('../models/clints');


exports.createEInvoice = async (req, res) => {
    const userid = req.params.id; // Assuming the user ID is passed as a parameter in the request
    const invoiceData = req.body; // Assuming the invoice data is sent in the body of the request

    try {
        // Find the client by user ID
        const client = await Client.findById(userid);

        if (!client) {
            return res.status(404).json({ message: 'No Account found' });
        }

        const minimumCredits = client.Totalcrediteinvoice;
        const requiredCredits = client.einvoicemodel.einvoice;

        // Check if the client has sufficient credits
        if (minimumCredits < requiredCredits) {
            const newInvoice = new EInvoice({
                userid,
                status: 'Insufficient credits. Please check your credit balance or contact admin.',
                ...invoiceData
            });

            await newInvoice.save();
            return res.status(400).json({ message: 'Insufficient credits' });
        }
        const existingInvoice = await EInvoice.findOne({
            'document_details.document_number': invoiceData.document_details.document_number,
            status: 'Success',
            AckNo: { $ne: 'N/A' },  // AckNo should not be 'N/A'
            Irn: { $ne: 'N/A' },    // Irn should not be 'N/A'
            SignedInvoice: { $ne: 'N/A' }  // SignedInvoice should not be 'N/A'
        });
        
        if (existingInvoice) {
            return res.status(400).json({ message: 'E-Invoice with this document number has already been generated successfully.' });
        }
        
       
        
        
        const access_token = "6971df2b43e2aa38764a76dd4ebed6ac1908a61d"; // Replace with your actual access token

        // Make POST request to the external API endpoint
        const response = await axios.post('https://clientbasic.mastersindia.co/generateEinvoice', {
            access_token,
            ...invoiceData
        });

        // Evaluate the success status from the API response
        const apiStatus = response.data.results?.status === 'Success';

        // Create a new E-Invoice record and save it to the database
        const newInvoice = new EInvoice({
            userid,
            ...invoiceData,
            status: apiStatus ? 'Success' : 'Failed',
            AckNo: response.data.results?.message?.AckNo || 'N/A',
            AckDt: response.data.results?.message?.AckDt || 'N/A',
            Irn: response.data.results?.message?.Irn || 'N/A',
            SignedInvoice: response.data.results?.message?.SignedInvoice || 'N/A',
            SignedQRCode: response.data.results?.message?.SignedQRCode || 'N/A',
            EwbNo: response.data.results?.message?.EwbNo || 'N/A',
            EwbDt: response.data.results?.message?.EwbDt || 'N/A',
            EwbValidTill: response.data.results?.message?.EwbValidTill || 'N/A',
            QRCodeUrl: response.data.results?.message?.QRCodeUrl || 'N/A',
            EinvoicePdf: response.data.results?.message?.EinvoicePdf || 'N/A',
            Remarks: response.data.results?.message?.Remarks || '',
            alert: response.data.results?.message?.alert || '',
            error: response.data.results?.error || false,
            requestId: response.data.results?.requestId || 'N/A'
        });

        await newInvoice.save();

        if (apiStatus) {
            // Deduct credits and update the client's record
            client.Totalcrediteinvoice -= requiredCredits;
            client.creditusedforeinvoice += requiredCredits;
            await client.save();

            res.status(201).json({ message: 'E-Invoice created successfully', data: response.data });
        } else {
            // Handle the case where the API indicates failure
            const errorMsg = response.data.errorMessage || 'E-Invoice creation failed due to unknown reasons.';
            res.status(400).json({ message: errorMsg, error: response.data });
        }
    } catch (error) {
        // Save the failed invoice attempt
        const failedInvoice = new EInvoice({
            userid,
            ...invoiceData,
            status: 'Failed'
        });

        await failedInvoice.save();

        res.status(500).json({ message: 'Error creating E-Invoice', error: error.message });
    }
};




exports.cancelEinvoice = async (req, res) => {
  try {
    const { access_token, user_gstin, irn, cancel_reason, cancel_remarks } = req.body;

    const postData = {
      access_token,
      user_gstin,
      irn,
      cancel_reason,
      cancel_remarks
    };

    const response = await axios.post('https://clientbasic.mastersindia.co/cancelEinvoice', postData);
    
    // Assuming the API returns data in JSON format
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



//const { Parser } = require('json2csv');

const { Parser } = require('json2csv');
//const EInvoice = require('../models/EInvoice'); // Assuming your model is located here

exports.generateInvoiceReport = async (req, res) => {
    const { clientid } = req.params;

    try {
        // Find all e-invoices by client ID
        const invoices = await EInvoice.find({ userid: clientid });

        if (!invoices.length) {
            return res.status(404).json({ message: 'No invoices found for this client' });
        }

        // Extract relevant fields for the report and handle null values
        const reportData = invoices.map(invoice => ({
            document_number: invoice.document_details.document_number || 'N/A',
            document_type:invoice.document_details.document_type || 'N/A',
            total_invoice_value: invoice.value_details.total_invoice_value || 'N/A',
            seller_legal_name: invoice.seller_details.legal_name || 'N/A',
            buyer_legal_name: invoice.buyer_details.legal_name || 'N/A',
            ackno: invoice.AckNo || 'N/A',
            acdt: invoice.AckDt || 'N/A',
            irn: invoice.Irn || 'N/A',
            status: invoice.status || 'N/A',
            timestamp:invoice.timestamp || 'N/A'
        }));

        // Define the fields for the CSV
        const fields = [
            { label: 'Document Number', value: 'document_number' },
            { label: 'Document Number', value: 'document_type' },
            { label: 'Total Invoice Value', value: 'total_invoice_value' },
            { label: 'Seller Legal Name', value: 'seller_legal_name' },
            { label: 'Buyer Legal Name', value: 'buyer_legal_name' },
            { label: 'Acknowledgement Number', value: 'ackno' },
            { label: 'Acknowledgement Date', value: 'acdt' },
            { label: 'Invoice Reference Number (IRN)', value: 'irn' },
            { label: 'Status', value: 'status' },
            { label: 'Timestamp', value: 'timestamp' }
        ];

        // Initialize the JSON2CSV parser
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment(`einvoice_report.csv`);
        res.send(csv);
        
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};




exports.generateInvoiceReportbydate = async (req, res) => {
    const { clientid } = req.params;
    const { fromDate, toDate } = req.query;

    try {
        // Convert fromDate and toDate to Date objects
        const from = new Date(fromDate);
        const to = new Date(toDate);

        // Ensure 'to' date includes the entire day
        to.setHours(23, 59, 59, 999);

        // Find all e-invoices by client ID and within the date range
        const invoices = await EInvoice.find({
            userid: clientid,
            timestamp: { $gte: from, $lte: to }
        });

        if (!invoices.length) {
            return res.status(404).json({ message: 'No invoices found for this client within the specified date range' });
        }

        // Extract relevant fields for the report and handle null values
        const reportData = invoices.map(invoice => ({
            document_number: invoice.document_details?.document_number || 'N/A',
            document_type: invoice.document_details?.document_type || 'N/A',
            total_invoice_value: invoice.value_details?.total_invoice_value || 'N/A',
            seller_legal_name: invoice.seller_details?.legal_name || 'N/A',
            buyer_legal_name: invoice.buyer_details?.legal_name || 'N/A',
            ackno: invoice.AckNo || 'N/A',
            acdt: invoice.AckDt || 'N/A',
            irn: invoice.Irn || 'N/A',
            status: invoice.status || 'N/A',
            timestamp: invoice.timestamp ? invoice.timestamp.toISOString() : 'N/A' // Format timestamp as ISO string
        }));

        // Define the fields for the CSV
        const fields = [
            { label: 'Document Number', value: 'document_number' },
            { label: 'Document Type', value: 'document_type' },
            { label: 'Total Invoice Value', value: 'total_invoice_value' },
            { label: 'Seller Legal Name', value: 'seller_legal_name' },
            { label: 'Buyer Legal Name', value: 'buyer_legal_name' },
            { label: 'Acknowledgement Number', value: 'ackno' },
            { label: 'Acknowledgement Date', value: 'acdt' },
            { label: 'Invoice Reference Number (IRN)', value: 'irn' },
            { label: 'Status', value: 'status' },
            { label: 'Timestamp', value: 'timestamp' }
        ];

        // Initialize the JSON2CSV parser
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment(`einvoice_report_${fromDate}_${toDate}.csv`);
        res.send(csv);
        
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

