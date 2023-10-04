const { Client } = require('../models/clints');
const { Message } = require('../models/group');
const puppeteer = require('puppeteer');
exports.createClient = async (req, res) => {
  try {
    const { name} = req.body;
    const client = new Client({ name});
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};
exports.getAllClients = async (req, res) => {
    try {
      const clients = await Client.find();
      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  };
  exports.getClientById = async (req, res) => {
    try {
      const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({ error: 'Failed to fetch client' });
    }
  };
  exports.updateClientById = async (req, res) => {
    try {
      const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
      const { name, sender } = req.body;
      const client = await Client.findByIdAndUpdate(clientId, { name, sender }, { new: true });
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  };
  exports.deleteClientById = async (req, res) => {
    try {
      const clientId = req.params.id; // Assuming you pass the client ID as a route parameter
      const client = await Client.findByIdAndRemove(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Failed to delete client' });
    }
  };
  
  
  exports.getTotalSentMessages = async (req, res) => {
    
  try {
    const clientId = req.params.id; 
    const totalMessages = await Message.countDocuments({ clientId });

    // Fetch message details for the client (replace this with your actual logic)
    const messages = await Message.find({ clientId });

    res.json({ totalMessages, messages });
  } catch (error) {
    console.error('Error retrieving total sent messages count:', error);
    res.status(500).json({ error: 'Failed to retrieve total sent messages count' });
  }
  }
  

  
  exports.getMessagesByDateRange = async (req, res) => {
    try {
      const clientId = req.params.id; 
      const { from, to } = req.query; 
  
      
      const fromDate = new Date(from);
      const toDate = new Date(to);
  
      toDate.setHours(23, 59, 59, 999);

      const messages = await Message.find({
        clientId,
        timestamp: {
          $gte: fromDate, 
          $lte: toDate,  
        },
      });
      console.log(messages, from, to);
      res.json({from, to, messages }); 
      
    } catch (error) {
      console.error('Error retrieving messages by date range:', error);
      res.status(500).json({ error: 'Failed to retrieve messages by date range' });
    }
  };
  

  exports.generatePDF = async (req, res) => {
    try {
      
      const browser = await puppeteer.launch({ headless: true }); // Use 'true' for headless mode
      const page = await browser.newPage();
  
      // Replace 'https://www.example.com' with the actual URL from which you want to generate the PDF
      await page.goto(`http://localhost:3000/pdf`, {
        waitUntil: 'networkidle2',
      });
  
      await page.setViewport({ width: 1680, height: 1050 });
  
      const todayDate = new Date();
      const pdfFilename = `${Client.name}-whatsapp-${todayDate.getTime()}.pdf`; // Set the PDF filename with the name included
  
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  
      await browser.close();
  
      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
  
      // Send the PDF buffer as the response
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      res.status(500).json({ error: 'Error generating PDF report' });
    }
  };
  