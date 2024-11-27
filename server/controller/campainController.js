const Campaign = require('../models/campains');
const { Section } = require('../models/section');
const WhatsAppMessage = require('../models/whatsapps'); 




exports.createCampaign = async (req, res) => {
  try {
    const { name, client, contractGroup, profile, scheduleTime } = req.body;

    // Check if a campaign already exists for the profile at the same schedule time
    const existingCampaign = await Campaign.findOne({ profile, scheduleTime });
    if (existingCampaign) {
      return res.status(400).json({ error: 'A campaign already exists for this profile at the scheduled time' });
    }

    // Check if the section (contact group) exists
    const section = await Section.findById(contractGroup);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Ensure no new campaign is created for the same profile if any campaign is scheduled in the next 30 minutes
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const upcomingCampaign = await Campaign.findOne({ profile, scheduleTime: { $gte: now, $lte: thirtyMinutesFromNow } });
    if (upcomingCampaign) {
      return res.status(400).json({ error: 'A campaign is already scheduled in the next 30 minutes for this profile' });
    }

    // Extract all campaigns for the profile and check for currently ongoing campaigns
    const allCampaigns = await Campaign.find({ profile });
    for (const campaign of allCampaigns) {
      const whatsappMessage = await WhatsAppMessage.findOne({ campainid: campaign._id });
      if (whatsappMessage) {
        const maxIntervalM = section.count * whatsappMessage.maxIntervalMs;
        const bufferTime = 30 * 60 * 1000; // 30 minutes in milliseconds
        const campaignEndTime = new Date(campaign.scheduleTime).getTime() + maxIntervalM + bufferTime;

        if (new Date(scheduleTime).getTime() < campaignEndTime) {
          const endDate = new Date(campaignEndTime);
          const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
          return res.status(400).json({ error: `An ongoing campaign exists. You can create a new campaign after ${formattedEndDate}` });
        }
      }
    }

    // Create a new instance of the Campaign model
    const newCampaign = new Campaign({
      name,
      client,
      contractGroup,
      profile,
      scheduleTime
    });

    // Save the new campaign to the database
    const savedCampaign = await newCampaign.save();

    // Send a success response
    res.status(201).json(savedCampaign);
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
    
        try {
          const clientId = req.params.clientId;
      
          // Find campaigns for the specific client
          const campaigns = await Campaign.find({ client: clientId })
            
      
          res.status(200).json(campaigns);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      };
      

// Get a single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id)
      .populate('client')
      .populate('contractGroup')
      .populate('profile');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a campaign by ID
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, contractGroup, profile, successCount, failureCount } = req.body;

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { name, client, contractGroup, profile, successCount, failureCount },
      { new: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.deleteCampaign = async (req, res) => {
  try {
    const clientId = req.params.id; // Retrieve clientId from URL params

    // Attempt to delete all campaigns with the specified clientId
    const result = await Campaign.deleteMany({ client: clientId });

    // Check if any documents were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No campaigns found for the specified clientId' });
    }

    // Success response
    res.status(200).json({ message: 'Campaigns deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
