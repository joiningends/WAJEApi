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

    const extractedRecipients = [];
    let rowNum = 2;

    while (true) {
      const numberCell = sheet[`A${rowNum}`];
      const param1Cell = sheet[`B${rowNum}`];
      const param2Cell = sheet[`C${rowNum}`];
      const param3Cell = sheet[`D${rowNum}`];
      const param4Cell = sheet[`E${rowNum}`];
      const param5Cell = sheet[`F${rowNum}`];

      if (!numberCell) {
        break;
      }

      const recipientNumber = numberCell.v;
      if (recipientNumber) {
        extractedRecipients.push({
          number: recipientNumber,
          Param1: param1Cell ? param1Cell.v : '',
          Param2: param2Cell ? param2Cell.v : '',
          Param3: param3Cell ? param3Cell.v : '',
          Param4: param4Cell ? param4Cell.v : '',
          Param5: param5Cell ? param5Cell.v : '',
        });
      }
      rowNum++;
    }

    if (extractedRecipients.length === 0) {
      return res.status(200).send('No recipient numbers found in the Excel file.');
    }

    if (extractedRecipients.length > 10000) {
      return res.status(400).send('Please upload an Excel file containing less than 10,000 contact numbers.');
    }

    const sectionId = req.params.id;

    // Validate extracted recipient numbers
    const invalidNumbers = extractedRecipients.filter(recipient => !/^91\d{10}$/.test(recipient.number));
    if (invalidNumbers.length > 0) {
      const invalidNums = invalidNumbers.map(recipient => recipient.number);
      return res.status(400).send(`Invalid contact numbers found: ${invalidNums.join(', ')}. Each number should start with "91" followed by 10 digits.`);
    }

    // Fetch the existing recipient numbers for the given section
    let recipientNumberDoc = await RecipientNumber.findOne({ section: sectionId });

    if (recipientNumberDoc) {
      recipientNumberDoc.contactNumbers = extractedRecipients;
    } else {
      recipientNumberDoc = new RecipientNumber({
        section: sectionId,
        contactNumbers: extractedRecipients,
      });
    }
    await recipientNumberDoc.save();

    // Calculate the total count
    const totalRecipientCount = recipientNumberDoc.contactNumbers.length;

    // Update the count in the Section model
    const section = await Section.findById(sectionId);
    section.count = totalRecipientCount;
    await section.save();

    res.status(201).json({ message: 'Recipient numbers updated successfully.' });
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

    const recipientNumbers = await RecipientNumber.find({ section: sectionId });

    res.json({  recipientNumbers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error.');
  }
};


exports.updateContactNumber = async (req, res) => {
  const { id, contactId } = req.params;
  const updateData = req.body;

  try {
    const recipientNumber = await RecipientNumber.findById(id);
    if (!recipientNumber) return res.status(404).json({ message: 'Recipient number not found' });

    const contact = recipientNumber.contactNumbers.id(contactId);
    if (!contact) return res.status(404).json({ message: 'Contact number not found' });

    Object.assign(contact, updateData); // Update the contact with the provided data
    await recipientNumber.save();

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific contact number within a RecipientNumber document
exports.deleteContactNumber = async (req, res) => {
  const { id, contactId } = req.params;

  try {
    const recipientNumber = await RecipientNumber.findById(id);
    if (!recipientNumber) return res.status(404).json({ message: 'Recipient number not found' });

    const contact = recipientNumber.contactNumbers.id(contactId);
    if (!contact) return res.status(404).json({ message: 'Contact number not found' });

    contact.remove();
    await recipientNumber.save();

    res.json({ message: 'Contact number deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

