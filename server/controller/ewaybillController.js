const axios = require('axios');
const { EwayBill } = require('../models/ewaybills');

// Function to fetch transportation distance
async function getTransportationDistance(fromPincode, toPincode) {
  const url = `http://clientbasic.mastersindia.co/distance`;
  const access_token = '6971df2b43e2aa38764a76dd4ebed6ac1908a61d';
console.log(fromPincode)
  try {
    const response = await axios.get(url, {
      params: {
        access_token: access_token,
        fromPincode: fromPincode,
        toPincode: toPincode
      }
    });

    console.log('Distance API Response:', response); // Log the response data

    if (response.data && response.data.results && response.data.results.status === 'Success') {
      return response.data.results.distance;
    } else {
      throw new Error(response.data.results.message || 'Unknown error');
    }
  } catch (error) {
    console.error(`Error fetching transportation distance: ${error.message}`);
    return null;
  }
}


exports.createEwaybill = async (req, res) => {
  try {
    const userid = req.params.id;
    const { access_token, pincode_of_consignor, pincode_of_consignee, ...invoiceData } = req.body;

    // Log the request body
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Get the transportation distance
    const transportationDistance = await getTransportationDistance(pincode_of_consignor, pincode_of_consignee);

    // If distance calculation fails, return an error
    if (!transportationDistance) {
      return res.status(400).json({ message: 'Failed to calculate transportation distance' });
    }

    // Add the calculated transportation distance to the invoice data
    invoiceData.transportationDistance = transportationDistance;
    invoiceData.pincode_of_consignor = pincode_of_consignor;
    invoiceData.pincode_of_consignee = pincode_of_consignee;

    // Log the invoice data before sending it to the external API
    console.log('Invoice Data:', JSON.stringify(invoiceData, null, 2));

    // Make POST request to the external API endpoint
    const response = await axios.post('https://clientbasic.mastersindia.co/ewayBillsGenerate', {
      access_token,
      ...invoiceData,
    });

    // If request to external API is successful, save the response along with the original data
    const newInvoice = new EwayBill({
      userid,
      ...invoiceData,
      ewayBillNo: response.data.results.message.ewayBillNo,
      ewayBillDate: response.data.results.message.ewayBillDate,
      validUpto: response.data.results.message.validUpto,
      alert: response.data.results.message.alert,
      error: response.data.results.message.error,
      url: response.data.results.message.url,
      status: response.data.results.status,
      timestamp: Date.now(),
    });

    await newInvoice.save(); // Save the new invoice

    // Send a success response with the data returned by the external API
    res.status(201).json({ data: response.data });

  } catch (error) {
    console.error('Error creating E-waybill:', error.message);

    // If failed to create E-Invoice, return an error response
    res.status(500).json({ message: 'Failed to create E-waybill' });
  }
};



const { Parser } = require('json2csv');

exports.generateEwayBillReport = async (req, res) => {
    const { clientid } = req.params;

    try {
        // Find all e-way bills by client ID
        const ewayBills = await EwayBill.find({ userid: clientid });

        if (!ewayBills.length) {
            return res.status(404).json({ message: 'No e-way bills found for this client' });
        }

        // Extract relevant fields for the report and handle null values
        const reportData = ewayBills.map(ewayBill => ({
            
            gstin_of_consignor: ewayBill.gstin_of_consignor || 'N/A',
            pincode_of_consignor: ewayBill.pincode_of_consignor || 'N/A',
            gstin_of_consignee: ewayBill.gstin_of_consignee || 'N/A',
            pincode_of_consignee: ewayBill.pincode_of_consignee || 'N/A',
            total_invoice_value: ewayBill.taxable_amount || 'N/A',
            transportation_distance: ewayBill.transportationDistance || 'N/A',
            vehicle_number: ewayBill.vehicle_number || 'N/A',
            transporter_id: ewayBill.transporter_id|| 'N/A',
            transportation_mode: ewayBill.transportation_mode || 'N/A',
            ewayBillNo: ewayBill.ewayBillNo || 'N/A',
            ewayBillDate: ewayBill.ewayBillDate || 'N/A',
            validUpto: ewayBill.validUpto || 'N/A',
            url: ewayBill.url || 'N/A',
            timestamp:ewayBill.timestamp || 'N/A'
        }));

        // Define the fields for the CSV
        const fields = [
           
            { label: 'GSTIN of Consignor', value: 'gstin_of_consignor' },
            { label: 'Pincode of Consignor', value: 'pincode_of_consignor' },
            { label: 'GSTIN of Consignee', value: 'gstin_of_consignee' },
            { label: 'Pincode of Consignee', value: 'pincode_of_consignee' },
            { label: 'Total Invoice Value', value: 'total_invoice_value' },
            { label: 'Transportation Distance', value: 'transportation_distance' },
            { label: 'Vehicle Number', value: 'vehicle_number' },
            { label: 'Transporter ID', value: 'transporter_id' },
            { label: 'Transportation Mode', value: 'transportation_mode' },
            { label: 'Eway Bill Number', value: 'ewayBillNo' },
            { label: 'Eway Bill Date', value: 'ewayBillDate' },
            { label: 'Valid Upto', value: 'validUpto' },
            { label: 'Download URL', value: 'url' },
            { label: 'Timestamp', value: 'timestamp' }
        ];

        // Initialize the JSON2CSV parser
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment(`ewaybill_report_${clientid}.csv`);
        res.send(csv);
        
    } catch (error) {
        console.error('Error generating EwayBill report:', error.message);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};





exports.generateEwayBillReportdate = async (req, res) => {
    const { clientid } = req.params;
    const { fromDate, toDate } = req.query;

    try {
        // Convert fromDate and toDate to Date objects
        const from = new Date(fromDate);
        const to = new Date(toDate);

        // Ensure 'to' date includes the entire day
        to.setHours(23, 59, 59, 999);
    
        // Find all e-way bills by client ID
        const ewayBills = await EwayBill.find({ userid: clientid,
          timestamp: { $gte: from, $lte: to }
         });

        if (!ewayBills.length) {
            return res.status(404).json({ message: 'No e-way bills found for this client' });
        }

        // Extract relevant fields for the report and handle null values
        const reportData = ewayBills.map(ewayBill => ({
            gstin_of_consignor: ewayBill.gstin_of_consignor || 'N/A',
            pincode_of_consignor: ewayBill.pincode_of_consignor || 'N/A',
            gstin_of_consignee: ewayBill.gstin_of_consignee || 'N/A',
            pincode_of_consignee: ewayBill.pincode_of_consignee || 'N/A',
            total_invoice_value: ewayBill.taxable_amount || 'N/A',
            transportation_distance: ewayBill.transportationDistance || 'N/A',
            vehicle_number: ewayBill.vehicle_number || 'N/A',
            transporter_id: ewayBill.transporter_id || 'N/A',
            transportation_mode: ewayBill.transportation_mode || 'N/A',
            ewayBillNo: ewayBill.ewayBillNo || 'N/A',
            ewayBillDate: ewayBill.ewayBillDate || 'N/A',
            validUpto: ewayBill.validUpto || 'N/A',
            url: ewayBill.url || 'N/A',
            timestamp:ewayBill.timestamp || 'N/A'
        }));

        // Define the fields for the CSV
        const fields = [
            { label: 'GSTIN of Consignor', value: 'gstin_of_consignor' },
            { label: 'Pincode of Consignor', value: 'pincode_of_consignor' },
            { label: 'GSTIN of Consignee', value: 'gstin_of_consignee' },
            { label: 'Pincode of Consignee', value: 'pincode_of_consignee' },
            { label: 'Total Invoice Value', value: 'total_invoice_value' },
            { label: 'Transportation Distance', value: 'transportation_distance' },
            { label: 'Vehicle Number', value: 'vehicle_number' },
            { label: 'Transporter ID', value: 'transporter_id' },
            { label: 'Transportation Mode', value: 'transportation_mode' },
            { label: 'Eway Bill Number', value: 'ewayBillNo' },
            { label: 'Eway Bill Date', value: 'ewayBillDate' },
            { label: 'Valid Upto', value: 'validUpto' },
            { label: 'Download URL', value: 'url' },
            { label: 'Timestamp', value: 'timestamp' }
        ];

        // Initialize the JSON2CSV parser
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment(`ewaybill_report_${fromDate}_${toDate}.csv`);
        res.send(csv);
        
    } catch (error) {
        console.error('Error generating EwayBill report:', error.message);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};
