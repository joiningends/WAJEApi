const EishipDetails = require('../models/eishippingdetails');

// Create a new ship detail
exports.createEishipDetail = async (req, res) => {
    try {
        const shipDetail = new EishipDetails(req.body);
        const savedShipDetail = await shipDetail.save();
        res.status(201).json(savedShipDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all ship details
exports.getAllEishipDetails = async (req, res) => {
    try {
        const shipDetails = await EishipDetails.find({ user: req.params.id });
        res.status(200).json(shipDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a ship detail by ID
exports.getEishipDetailById = async (req, res) => {
    try {
        const shipDetail = await EishipDetails.findById(req.params.id);
        if (!shipDetail) {
            return res.status(404).json({ message: 'Ship detail not found' });
        }
        res.status(200).json(shipDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a ship detail by ID
exports.updateEishipDetailById = async (req, res) => {
    try {
        const updatedShipDetail = await EishipDetails.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedShipDetail) {
            return res.status(404).json({ message: 'Ship detail not found' });
        }
        res.status(200).json(updatedShipDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a ship detail by ID
exports.deleteEishipDetailById = async (req, res) => {
    try {
        const deletedShipDetail = await EishipDetails.findByIdAndDelete(req.params.id);
        if (!deletedShipDetail) {
            return res.status(404).json({ message: 'Ship detail not found' });
        }
        res.status(200).json({ message: 'Ship detail deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
