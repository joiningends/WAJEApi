const EInvoiceui = require('../models/einvoiceui');
const EidispatchDetails = require('../models/dispatchdetails');
const EiBuyerDetails = require('../models/eibuyerdetails');
const EISellerDetails = require('../models/eisellerdetails');
const EishipDetails = require('../models/eishippingdetails');
const axios = require('axios');
const { Client } = require('../models/clints');



exports.generateEInvoice = async (req, res) => {
    const userid = req.params.id;

    try {
        const client = await Client.findById(userid);

        if (!client) {
            return res.status(404).json({ message: 'No Account found' });
        }

        const minimumCredits = client.Totalcrediteinvoice;
        const requiredCredits = client.einvoicemodel.einvoice;

        // Check if the client has sufficient credits
        if (minimumCredits < requiredCredits) {
            const newInvoice = new EInvoiceui({
                userid,
                status: 'Insufficient credits. Please check your credit balance or contact admin.',
                ...req.body.data,
            });

            await newInvoice.save();
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        const existingInvoice = await EInvoiceui.findOne({
            'document_details.document_number': req.body.data.document_details.document_number,
            status: 'Success',
            AckNo: { $ne: 'N/A' },  // AckNo should not be 'N/A'
            Irn: { $ne: 'N/A' },    // Irn should not be 'N/A'
            SignedInvoice: { $ne: 'N/A' }  // SignedInvoice should not be 'N/A'
        });

        if (existingInvoice) {
            return res.status(400).json({ message: 'E-Invoice with this document number has already been generated successfully.' });
        }

        // Extract IDs from request body
        const { sellerId, buyerId, dispatchId, shipId, user_gstin } = req.body;

        // Fetch details by ID
        const sellerDetails = await EISellerDetails.findById(sellerId);
        const buyerDetails = await EiBuyerDetails.findById(buyerId);
        const dispatchDetails = await EidispatchDetails.findById(dispatchId);
        const shipDetails = await EishipDetails.findById(shipId);

        if (!sellerDetails || !buyerDetails || !dispatchDetails || !shipDetails) {
            return res.status(400).json({ message: 'Invalid seller, buyer, dispatch, or ship details ID' });
        }

        const {
            transaction_details,
            document_details,
            reference_details,
            preceding_document_details,
            value_details,
            item_list,
        } = req.body.data;

        // Construct the payload
        const payload = {
            access_token: "6971df2b43e2aa38764a76dd4ebed6ac1908a61d",
            user_gstin,
            transaction_details,
            document_details,
            seller_details: sellerDetails,
            buyer_details: buyerDetails,
            dispatch_details: dispatchDetails,
            ship_details: shipDetails,
            reference_details,
            preceding_document_details,
            value_details,
            item_list,
        };

        console.log(payload); // Debugging: Inspect the payload

        // Send POST request to the external API
        const response = await axios.post(
            "https://clientbasic.mastersindia.co/generateEinvoice",
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        const apiStatus = response.data.results?.status === 'Success';

        const newInvoice = new EInvoiceui({
            userid,
            ...req.body.data,
            status: apiStatus ? 'Success' : 'Failed',
            apiResponse: response.data,
        });

        if (apiStatus) {
            // Deduct credits and update the client's record
            client.Totalcrediteinvoice -= requiredCredits;
            client.creditusedforeinvoice += requiredCredits;
            await client.save();

            await newInvoice.save();
            return res.status(201).json({ message: 'E-Invoice created successfully', data: response.data });
        } else {
            const errorMsg = response.data.errorMessage || 'E-Invoice creation failed due to unknown reasons.';
            await newInvoice.save();
            return res.status(400).json({ message: errorMsg, error: response.data });
        }
    } catch (error) {
        // Save the failed invoice attempt
        const failedInvoice = new EInvoiceui({
            userid,
            ...req.body.data,
            status: 'Failed',
            errorMessage: error.message,
        });

        await failedInvoice.save();

        res.status(500).json({ message: 'Error creating E-Invoice', error: error.message });
    }
};

