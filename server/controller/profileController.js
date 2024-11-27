const Profile = require('../models/profile');
const { Client } = require('../models/clints');
exports.createProfile = async (req, res) => {
  try {
    const clientId = req.body.client;

    // Check if the client ID is provided
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Fetch the client details
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    console.log("Client details:", client);

    // Count the number of profiles for this client
    const profileCount = await Profile.countDocuments({ client: clientId });
    console.log("Profile count:", profileCount);

    // Check the wapc value
    if (profileCount >= client.wapc) {
      return res.status(403).json({ error: 'Profile creation limit reached. Please contact admin.' });
    }

    // Validate required fields for profile creation
    if (!req.body.name || !req.body.mobile_no) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }

    // Create a new profile
    const newProfile = new Profile({
      client: clientId,
      name: req.body.name,
      mobile_no: req.body.mobile_no,
    });

    await newProfile.save();
    console.log("New profile created:", newProfile);

    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
};

    



exports.updateProfileByInstanceId = async (req, res) => {
    try {
            const { id } = req.params;
            const { instance_id } = req.body;
    
            if (!instance_id) {
                return res.status(400).json({ message: 'Instance ID is required' });
            }
    
            const profile = await Profile.findByIdAndUpdate(id, { instance_id }, { new: true, runValidators: true });
    
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
    
            res.status(200).json(profile);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };


    exports.getProfilesByClientId = async (req, res) => {
        try {
            const clientId = req.params.clientId;
            const profiles = await Profile.find({ client: clientId });
    
            if (!profiles.length) {
                return res.status(404).json({ message: 'No profiles found for this client' });
            }
    
            res.status(200).json(profiles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };


    

exports.getProfileById = async (req, res) => {
    try {
        const id = req.params.id;
        const profile = await Profile.findById(id);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};






exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.send({ message: 'Profile deleted successfully', profile });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error });
  }
};
