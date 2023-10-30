const { RecipientNumber } = require('../models/recipaintnumber');
const { Section } = require('../models/section');
const xlsx = require('xlsx');
const fetch = require('node-fetch'); 
const { User } = require('../models/user');

exports.uploadRecipientNumbers = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const excelData = xlsx.readFile(req.file.path);
    const sheet = excelData.Sheets[excelData.SheetNames[0]];

    const extractedRecipientNumbers = [];
    let rowNum = 2;

    while (true) {
      const cell = sheet[`A${rowNum}`];
      if (!cell) {
        break;
      }
      const recipientNumber = cell.v;
      if (recipientNumber) {
        extractedRecipientNumbers.push(recipientNumber);
      }
      rowNum++;
    }

    if (extractedRecipientNumbers.length === 0) {
      return res.status(200).send('No recipient numbers found in the Excel file.');
    }

    const sectionId = req.params.id;

    const existingRecipientNumber = await RecipientNumber.findOne({
      section: sectionId,
      contactNumbers: extractedRecipientNumbers,
    });

    if (existingRecipientNumber) {
      return res.status(200).send('Recipient numbers already exist for this section.');
    }

    const newRecipientNumber = new RecipientNumber({
      section: sectionId,
      contactNumbers: extractedRecipientNumbers,
    });

    const savedRecipientNumber = await newRecipientNumber.save();

    res.status(201).json(savedRecipientNumber);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
};

exports.getRecipientNumbersBySection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).send('Section not found.');
    }

    const recipientNumbers = await RecipientNumber.find({ section: sectionId }).distinct('contactNumbers');

    res.json({  recipientNumbers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
};

