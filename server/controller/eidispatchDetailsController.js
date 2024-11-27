const EidispatchDetails = require('../models/dispatchdetails');

// Create a new dispatch detail
exports.createEidispatchDetail = async (req, res) => {
    try {
        const dispatchDetail = new EidispatchDetails(req.body);
        const savedDispatchDetail = await dispatchDetail.save();
        res.status(201).json(savedDispatchDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all dispatch details
exports.getAllEidispatchDetails = async (req, res) => {
    try {
        const dispatchDetails = await EidispatchDetails.find({ user: req.params.id }).populate('user');
        res.status(200).json(dispatchDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a dispatch detail by ID
exports.getEidispatchDetailById = async (req, res) => {
    try {
        const dispatchDetail = await EidispatchDetails.findById(req.params.id).populate('user');
        if (!dispatchDetail) {
            return res.status(404).json({ message: 'Dispatch detail not found' });
        }
        res.status(200).json(dispatchDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a dispatch detail by ID
exports.updateEidispatchDetailById = async (req, res) => {
    try {
        const updatedDispatchDetail = await EidispatchDetails.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedDispatchDetail) {
            return res.status(404).json({ message: 'Dispatch detail not found' });
        }
        res.status(200).json(updatedDispatchDetail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a dispatch detail by ID
exports.deleteEidispatchDetailById = async (req, res) => {
    try {
        const deletedDispatchDetail = await EidispatchDetails.findByIdAndDelete(req.params.id);
        if (!deletedDispatchDetail) {
            return res.status(404).json({ message: 'Dispatch detail not found' });
        }
        res.status(200).json({ message: 'Dispatch detail deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
