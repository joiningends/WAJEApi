const EISellerDetails = require('../models/eisellerdetails');

// Get all seller details
exports.getAllSellerDetails = async (req, res) => {
    try {
        const sellerDetails = await EISellerDetails.find({ user: req.params.id });
        res.status(200).json(sellerDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get seller details by ID
exports.getSellerDetailsById = async (req, res) => {
    try {
        const sellerDetail = await EISellerDetails.findById(req.params.id);
        if (!sellerDetail) {
            return res.status(404).json({ message: 'Seller details not found' });
        }
        res.status(200).json(sellerDetail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new seller details
exports.createSellerDetails = async (req, res) => {
    const sellerDetails = new EISellerDetails(req.body);

    try {
        const newSellerDetails = await sellerDetails.save();
        res.status(201).json(newSellerDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update seller details by ID
exports.updateSellerDetailsById = async (req, res) => {
    try {
        const updatedSellerDetails = await EISellerDetails.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSellerDetails) {
            return res.status(404).json({ message: 'Seller details not found' });
        }
        res.status(200).json(updatedSellerDetails);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete seller details by ID
exports.deleteSellerDetailsById = async (req, res) => {
    try {
        const deletedSellerDetails = await EISellerDetails.findByIdAndDelete(req.params.id);
        if (!deletedSellerDetails) {
            return res.status(404).json({ message: 'Seller details not found' });
        }
        res.status(200).json({ message: 'Seller details deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
