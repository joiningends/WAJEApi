
const Storage = require('../models/storage');
const { Client } = require('../models/clints');
const fs = require('fs');



exports.uploadFile = async (req, res) => {
  try {
    const clientId = req.params.clientid;

    // File details from multer
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    

    const { originalname, size, mimetype } = file;
    const filename = file.filename; 
    const basePath = `https://connectje.in/public/uploads/`; 
    const path = `${basePath}${filename}`;

    // Retrieve the client details
    const clientDetails = await Client.findById(clientId);
    if (!clientDetails) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const storageLimitMB = parseFloat(clientDetails.storagelimit);
    const storageUsedMB = parseFloat(clientDetails.storageused || '0');
    const newSizeMB = size / (1024 * 1024); // Convert size to MB

    // Check if adding the new file exceeds the storage limit
    if (storageUsedMB + newSizeMB > storageLimitMB) {
      return res.status(400).json({ error: 'Storage limit exceeded' });
    }

    // Create a new instance of the Storage model
    const newStorageItem = new Storage({
      client: clientId,
      
      filename: originalname, // Use originalname for clarity
      path: path,
      size: size,
      mimeType: mimetype
    });

    // Save the new instance to the database
    const savedStorageItem = await newStorageItem.save();

    // Update the client's storage used
    clientDetails.storageused = (storageUsedMB + newSizeMB).toFixed(2); // Round to 2 decimal places
    await clientDetails.save();

    // Send a success response with only relevant file details
    res.status(201).json({
      savedStorageItem 
    });
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error creating storage item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};








exports.getStorageItemsByClientId = async (req, res) => {
  try {
    const clientid = req.params.clientid;

    // Find storage items by clientid
    const storageItems = await Storage.find({ client: clientid });

    // Send the storage items as a response
    res.status(200).json(storageItems);
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error retrieving storage items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const path = require("path");

exports.deleteFile = async (req, res) => {
  try {
    const clientId = req.params.id;
    const fileId = req.params.fileId; // Assuming fileId is sent in req.body

    // Find the file to be deleted
    const file = await Storage.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Retrieve the client details
    const clientDetails = await Client.findById(clientId);
    if (!clientDetails) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB
    const storageUsedMB = parseFloat(clientDetails.storageused || '0');

    // Delete the file from database
    await Storage.findByIdAndDelete(fileId);

    // Update the client's storage used
    clientDetails.storageused = (storageUsedMB - fileSizeMB).toFixed(2); // Round to 2 decimal places
    await clientDetails.save();

    // Delete the file from public uploads directory
    const filePath = file.path;
    console.log(filePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File ${file.filename} deleted from public uploads directory`);
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

