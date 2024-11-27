const EiBuyerDetails = require('../models/eibuyerdetails');

// Create a new buyer detail
exports.createEiBuyerDetail = async (req, res) => {
    try {
        const buyerDetail = new EiBuyerDetails(req.body);
        const savedBuyerDetail = await buyerDetail.save();
        res.status(201).json(savedBuyerDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all buyer details
exports.getAllEiBuyerDetails = async (req, res) => {
    try {
        const buyerDetails = await EiBuyerDetails.find({ user: req.params.id });
        res.status(200).json(buyerDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a buyer detail by ID
exports.getEiBuyerDetailById = async (req, res) => {
    try {
        const buyerDetail = await EiBuyerDetails.findById(req.params.id);
        if (!buyerDetail) {
            return res.status(404).json({ message: 'Buyer detail not found' });
        }
        res.status(200).json(buyerDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a buyer detail by ID
exports.updateEiBuyerDetailById = async (req, res) => {
    try {
        const updatedBuyerDetail = await EiBuyerDetails.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBuyerDetail) {
            return res.status(404).json({ message: 'Buyer detail not found' });
        }
        res.status(200).json(updatedBuyerDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a buyer detail by ID
exports.deleteEiBuyerDetailById = async (req, res) => {
    try {
        const deletedBuyerDetail = await EiBuyerDetails.findByIdAndDelete(req.params.id);
        if (!deletedBuyerDetail) {
            return res.status(404).json({ message: 'Buyer detail not found' });
        }
        res.status(200).json({ message: 'Buyer detail deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
