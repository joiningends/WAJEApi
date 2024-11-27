const Event = require('../models/eventmodel');
const Registration = require('../models/registercustomer');
const { sendEmail } = require("../controller/emailController");
const Role = require('../models/role');
const EmailConfig = require('../models/emailconfig');
const generateTimeslots = (startTime, endTime, sessionDuration, eventDate, endDate) => {
  const timeslots = [];
  console.log(startTime, endTime, sessionDuration, eventDate, endDate);

  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // 'DD-MM-YYYY' format
  };

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number); // Adjusted for 'DD-MM-YYYY' format
    return new Date(year, month - 1, day); // Month is 0-indexed in JS
  };

  const totalEventStartTime = convertToMinutes(startTime);
  const totalEventEndTime = convertToMinutes(endTime);
  const totalEventDuration = totalEventEndTime - totalEventStartTime;

  if (totalEventDuration >= sessionDuration) {
    const numSlotsPerCounter = Math.floor(totalEventDuration / sessionDuration);
    console.log('Total Event Duration:', totalEventDuration);
    console.log('Number of Slots Per Counter:', numSlotsPerCounter);

    const generateTimeslotsForDate = (date) => {
      let currentStartTime = totalEventStartTime;
      for (let slot = 0; slot < numSlotsPerCounter; slot++) {
        const slotStartTime = formatTime(currentStartTime);
        const slotEndTime = formatTime(currentStartTime + sessionDuration);

        timeslots.push({
          date: formatDate(date), // Format the date as 'DD-MM-YYYY'
          time: `${slotStartTime} - ${slotEndTime}`
        });

        currentStartTime += sessionDuration; // Move to the next slot
      }
    };

    const getDatesInRange = (startDate, endDate) => {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      const dates = [];
      while (start <= end) {
        dates.push(new Date(start)); // Store date objects
        start.setDate(start.getDate() + 1); // Move to the next day
      }
      return dates;
    };

    const allDates = getDatesInRange(eventDate, endDate);
    allDates.forEach(generateTimeslotsForDate);
    console.log(timeslots)
  }

  return timeslots;
  
};


exports.createEvent = async (req, res) => {   
  try {
    const {
      eventType, 
      eventName, 
      eventDate, 
      description, 
      images, 
      paymentCollection, 
      startTime, 
      endTime, 
      endDate, 
      maxRegistrations, 
      paymentMethod, 
      customFields,
      numCounters, 
      maxParticipationPerCounter, 
      sessionTimePerCounterHours, 
      sessionTimePerCounterMinutes,
      amount,
      key,
      secret,
      Whowillbepresent, 
      Instrumenttobecarried,
      by,
      status,
      scanner,
      optimistic,
      Associationwith,
      ContactPersonName,
      ContactPersonPhoneNumber,
      PlaceofEvent,
      eventownerlogo,
      patnerlog,
      emailConfig,
      instance_id
    } = req.body;

    const clientId = req.params.id; // Extract clientId from req.params

    const eventOwnerLogoPath = eventownerlogo ? formatImageUrl(eventownerlogo) : null;
    const partnerLogPath = patnerlog ? formatImageUrl(patnerlog) : null;

    // Create new event
    const newEvent = new Event({
      clientId,
      eventType,
      eventName,
      eventDate,
      description,
      images,
      paymentCollection,
      startTime,
      endTime,
      endDate,
      maxRegistrations,
      paymentMethod,
      customFields,
      numCounters,
      maxParticipationPerCounter,
      sessionTimePerCounterHours,
      sessionTimePerCounterMinutes,
      amount,
      key,
      secret,
      Whowillbepresent, 
      Instrumenttobecarried,
      by,
      status,
      Associationwith,
      ContactPersonName,
      ContactPersonPhoneNumber,
      PlaceofEvent,
      scanner,
      optimistic,
      eventownerlogo: eventOwnerLogoPath, 
      patnerlog: partnerLogPath,
      emailConfig,
      instance_id,
      timeslot: [], // Initialize timeslot as empty
    });

    await newEvent.save();

    // Generate the URL based on eventType
    newEvent.url = eventType === '0' 
      ? `https://connectje.in/normalEvent/${newEvent._id}`
      : `https://connectje.in/eventTimeSlot/${newEvent._id}`;
      
    await newEvent.save();

    // Handle eventType '1' to calculate timeslots
    if (eventType === '1' || eventType === '2') { 
      const sessionDuration = sessionTimePerCounterHours * 60 + sessionTimePerCounterMinutes;
      const timeslots = generateTimeslots(startTime, endTime, sessionDuration, eventDate, endDate);
      newEvent.timeslot = timeslots;
      // Calculate maxRegistrations safely
if ((numCounters && !isNaN(numCounters)) && 
(timeslots && Array.isArray(timeslots) && timeslots.length > 0) && 
(maxParticipationPerCounter && !isNaN(maxParticipationPerCounter))) {

newEvent.maxRegistrations = numCounters * timeslots.length * maxParticipationPerCounter;
} else {
// Set maxRegistrations to 0 or handle as needed
newEvent.maxRegistrations = 0; // Or omit this line if you don't want to save it at all
}

      await newEvent.save();
    }
    const emailconfiguration = newEvent.emailConfig 
    const config = await EmailConfig.findById(emailconfiguration);
    res.status(201).json({ 
      message: 'Event created successfully', 
      event: newEvent 
    });

    // Asynchronously handle notifications
    handleNotifications(newEvent,config, eventType, sessionTimePerCounterHours, sessionTimePerCounterMinutes, Whowillbepresent, scanner, optimistic);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error });
  }
};


// Function to handle notifications in the background
async function handleNotifications(event,config, eventType, sessionTimePerCounterHours, sessionTimePerCounterMinutes, Whowillbepresent, scanner, optimistic) {
  try {
    if (eventType === '2') {

      // Send emails to scanner
      if (scanner && scanner.length > 0) {
        for (const scannerId of scanner) {
          const scannerRole = await Role.findById(scannerId);
          if (scannerRole) {
            const emailText = `Dear ${scannerRole.Name},\n\nYou have been assigned to be part of the ${event.eventName} on ${event.eventDate} at ${event.PlaceofEvent}.`;
            await sendEmail(scannerRole.Email, `Assignment for ${event.eventName}`, emailText, config);
            console.log(`Email sent to scanner ${scannerRole.Name} (${scannerRole.Email})`);
          }
        }
      }

      // Send emails to Whowillbepresent
      if (Whowillbepresent && Whowillbepresent.length > 0) {
        for (const person of Whowillbepresent) {
          const { name, email } = person;
          const emailText = `Dear ${name},\n\nWe are pleased to inform you about your invitation to the event: ${event.eventName}.\nYou have been assigned to be part of the event on ${event.eventDate} at ${event.PlaceofEvent}.`;
          await sendEmail(email, `Event Details for ${event.eventName}`, emailText, config);
          console.log(`Email sent to ${name} (${email})`);
        }
      }

      // Send emails to optimistic roles
      if (optimistic && optimistic.length > 0) {
        for (const optimisticId of optimistic) {
          const optimisticRole = await Role.findById(optimisticId);
          if (optimisticRole) {
            const emailText = `Dear ${optimisticRole.Name},\n\nYou have been assigned to be part of the ${event.eventName} on ${event.eventDate} at ${event.PlaceofEvent}.`;
            await sendEmail(optimisticRole.Email, `Assignment for ${event.eventName}`, emailText, config);
            console.log(`Email sent to optimistic ${optimisticRole.Name} (${optimisticRole.Email})`);
          }
        }
      }
    
    }
  } catch (error) {
    console.error('Error in handleNotifications:', error);
  }
}


const formatImageUrl = (imageUrl) => {
  // Check if the URL is valid
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    throw new Error('Invalid image URL provided');
  }

  // Replace the domain with the desired relative path format
  const relativePath = imageUrl.replace('https://connectje.in/', './');

  return relativePath; // Return the formatted URL
};










// Get All Events
exports.getEvents = async (req, res) => {
  try {
    const clientId = req.params.id; // Extract clientId from req.params

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // Find events that match the clientId with either approved or disapproved status
    const events = await Event.find({ clientId, status: { $in: ['approved', 'disapproved'] } });

    // If no events found, respond with a 404 status
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this client.' });
    }

    // Respond with the found events
    res.status(200).json(events);
  } catch (error) {
    console.error('Error retrieving events:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
  }
};
exports.getEventsbysalesandmarketing = async (req, res) => {
  try {
    const clientId = req.params.id; // Extract clientId from req.params

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // Find events that match the clientId with either approved or disapproved status
    const events = await Event.find({ by:clientId });

    // If no events found, respond with a 404 status
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this client.' });
    }

    // Respond with the found events
    res.status(200).json(events);
  } catch (error) {
    console.error('Error retrieving events:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
  }
};





// Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve event', error });
  }
};



exports.updateEvent = async (req, res) => {
  try {
    const {
      eventType,
      eventName,
      eventDate,
      description,
      images,
      paymentCollection,
      startTime,
      endTime,
      endDate,
      paymentMethod,
      customFields,
      numCounters,
      maxParticipationPerCounter,
      sessionTimePerCounterHours,
      sessionTimePerCounterMinutes,
      amount,
      key,
      secret,
      Whowillbepresent,
      Instrumenttobecarried,
      by,
      status,
      scanner,
      optimistic,
      Associationwith,
      ContactPersonName,
      ContactPersonPhoneNumber,
      PlaceofEvent,
      eventownerlogo,
      patnerlog,
      emailConfig,
      instance_id
    } = req.body;

    let maxRegistrations = 0;
    const eventOwnerLogoPath = eventownerlogo ? formatImageUrl(eventownerlogo) : null;
    const partnerLogPath = patnerlog ? formatImageUrl(patnerlog) : null;

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, {
      ...req.body,
      eventownerlogo: eventOwnerLogoPath,
      patnerlog: partnerLogPath,
    }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Calculate session duration in minutes
    const sessionDuration = sessionTimePerCounterHours * 60 + sessionTimePerCounterMinutes;

    // Log the session duration to check if it's correct
    console.log(sessionDuration);

    // Generate timeslots based on start time, end time, and session duration
    const timeslots = generateTimeslot(updatedEvent.startTime, updatedEvent.endTime, sessionDuration, updatedEvent.eventDate, updatedEvent.endDate);
    updatedEvent.timeslot = timeslots;

    // Log the timeslots to check if they are correctly formatted
    console.log(timeslots);

    // Save the updated event
    await updatedEvent.save();

    // Check if numCounters, timeslots, and maxParticipationPerCounter are valid and calculate maxRegistrations
    if ((numCounters && !isNaN(numCounters)) && 
        (timeslots && Array.isArray(timeslots) && timeslots.length > 0) && 
        (maxParticipationPerCounter && !isNaN(maxParticipationPerCounter))) {
      updatedEvent.maxRegistrations = numCounters * timeslots.length * maxParticipationPerCounter;
    } else {
      updatedEvent.maxRegistrations = 0;
    }

    // Save the max registrations data
    await updatedEvent.save();

    // Proceed with email notifications (not shown here for brevity)

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};


// Updated generateTimeslot function without ObjectId
function generateTimeslot(startTime, endTime, sessionDuration, eventDate, endDate) {
  const timeslots = [];
  
  // Convert eventDate and endDate to Date objects
  let currentDate = new Date(eventDate.split('-').reverse().join('-')); // format as YYYY-MM-DD
  const lastDate = new Date(endDate.split('-').reverse().join('-')); // format as YYYY-MM-DD

  // Loop over each day within the event date range
  while (currentDate <= lastDate) {
    // Set the start and end time for the current day
    let currentStartTime = new Date(currentDate);
    currentStartTime.setHours(...startTime.split(':').map(Number));
    
    const endTimeDate = new Date(currentDate);
    endTimeDate.setHours(...endTime.split(':').map(Number));
    
    // Generate timeslots for each day within the time window
    while (currentStartTime < endTimeDate) {
      const currentEndTime = new Date(currentStartTime.getTime() + sessionDuration * 60000); // sessionDuration in minutes
      
      if (currentEndTime > endTimeDate) break;

      // Add the timeslot with formatted date and time
      timeslots.push({
        date: formatDate(currentDate),
        time: `${formatTime(currentStartTime)} - ${formatTime(currentEndTime)}`
      });

      // Move start time to the end of the current slot
      currentStartTime = currentEndTime;
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeslots;
}

// Helper function to format date in dd-mm-yyyy format
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Helper function to format time in hh:mm format
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}





// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const result = await Event.deleteMany({});
    console.log(`Deleted ${result.deletedCount} events`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} events`
    });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({
      error: 'Failed to delete events'
    });
  }
};


exports.getEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const currentDateTime = new Date();

    // Filter timeslots for future times in memory
    let availableTimeslots = event.timeslot.filter(slot => {
      const [day, month, year] = slot.date.split('-');
      const startTime = slot.time.split(' - ')[0];
      const slotDateTime = new Date(`${year}-${month}-${day}T${startTime}`);
      return slotDateTime >= currentDateTime;
    });

    if (event.eventType === '1' || event.eventType === '2') {
      const validTimeslots = await Promise.all(
        availableTimeslots.map(async (slot) => {
          const existingRegistrationsInSlot = await Registration.countDocuments({
            eventId,
            'participantFields.fieldName': 'timeslot',
            'participantFields.fieldValue': `${slot.date} ${slot.time}`
          });
          console.log(existingRegistrationsInSlot)
          if (existingRegistrationsInSlot < event.maxParticipationPerCounter * event.numCounters) {
            return slot;
          }
        })
      );

      // Filter out any undefined slots that didn't meet the criteria
      availableTimeslots = validTimeslots.filter(Boolean);
    }

    res.status(200).json({
      message: 'Event retrieved successfully',
      event: {
        ...event.toObject(),
        availableTimeslots
      }
    });
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({ message: 'Failed to retrieve event', error: error.message });
  }
};


exports.getEventsbysales = async (req, res) => {
  try {
    const clientId = req.params.id; // Extract clientId from req.params

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // Find events that match the clientId with approved status
    const events = await Event.find({ clientId, status: "pending" });

    // If no events found, respond with a 404 status
    if (events.length === 0) {
      return res.status(404).json({ message: 'No approved events found for this client.' });
    }

    // Respond with the found events
    res.status(200).json(events);
  } catch (error) {
    console.error('Error retrieving events:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
  }
};


exports.getEventsbypatner = async (req, res) => {
  try {
    const clientId = req.params.id; // Extract clientId from req.params

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // Find events that match the clientId with approved status
    const events = await Event.find({ Associationwith:clientId });

    // If no events found, respond with a 404 status
    if (events.length === 0) {
      return res.status(404).json({ message: 'No  events found ' });
    }

    // Respond with the found events
    res.status(200).json(events);
  } catch (error) {
    console.error('Error retrieving events:', error); // Log the error for debugging
    res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
  }
};


exports.getAllEventsByScanner = async (req, res) => {
  const { scannerId } = req.params; // Scanner ID from request parameters
  const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, '0'); // Add leading zero if day is single digit
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if month is single digit
const year = currentDate.getFullYear();

const formattedDate = `${day}-${month}-${year}`;
  try {
    // Query the database for events associated with the given scannerId and a valid endDate
    const events = await Event.find({
      scanner: scannerId, // Find events where the scanner ID is included in the scanner array
      endDate: { $gte: formattedDate } // Filter events where the endDate is today or later
    }).sort({
      endDate: 1 // Sort by endDate in ascending order (earliest date first)
    });

    // If no events are found, return a 404 error
    if (events.length === 0) {
      return res.status(404).send('No events found for this scanner.');
    }

    // Return the list of events if found
    return res.status(200).json(events);
  } catch (error) {
    // If an error occurs, log it and return a 500 server error
    console.error('Error fetching events by scanner:', error);
    res.status(500).send('Server error.');
  }
};




exports.getAllEventsByOptimistic = async (req, res) => {
  const { optimisticId } = req.params; // Optimistic ID from request parameters
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0'); // Add leading zero if day is single digit
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if month is single digit
  const year = currentDate.getFullYear();
  
  const formattedDate = `${day}-${month}-${year}`;
  try {
    const events = await Event.find({
      optimistic: { $in: [optimisticId] }, // Check if optimisticId is in the optimistic array
      endDate: { $gte: formattedDate }  // Only get events where endDate is today or later
    })
    .sort({
      endDate: 1 // Sort in ascending order (earliest date first)
    });


    if (events.length === 0) {
      return res.status(404).send('No events found for this optimistic user.');
    }

    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events by optimistic user:', error);
    res.status(500).send('Server error.');
  }
};




exports.createOrUpdateEventEmail = async (req, res) => { 
  const eventId = req.params.id;  // Get eventId from params
  const {  emailSubject, emailHtml } = req.body;  // Destructure input from the request body

  try {
    let event;

    if (eventId) {
      // Find and update existing event
      event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Update the existing event with emailConfig, emailSubject, and emailHtml
      
      event.emailSubject = emailSubject;

      // Wrap the emailHtml in HTML format, replacing newlines with <br>
      event.emailHtml = `<p>${emailHtml.replace(/\n/g, '<br>')}</p>`;
      await event.save();
    } else {
      // Handle creation of a new event if eventId is not provided
      event = new Event({
        emailConfig,
        emailSubject,
        emailHtml: `<p>${emailHtml.replace(/\n/g, '<br>')}</p>`, // Wrap content in HTML
        // Add other necessary fields here
      });
      await event.save();
    }

    res.status(200).json({ message: 'Event email details saved successfully!', event });
  } catch (error) {
    console.error('Error saving event email details:', error);
    res.status(500).json({ message: 'Error saving event email details', error });
  }
};


