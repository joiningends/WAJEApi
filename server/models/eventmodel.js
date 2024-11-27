const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clientId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  eventType: { type: String },
  eventName: { type: String },
  eventDate: { type: String },
  description: { type: String },
  images: [String],
  
  paymentCollection: { 
    type: String,
     default: 'no' 
    },
  startTime: { 
    type: String 

   }, 
   Associationwith:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
   },
   scanner:[{
    
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
     
   }],
   optimistic:[{
    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
   
 }],
   ContactPersonName:{
    type: String 
   },
   ContactPersonPhoneNumber:{
    type: String 
   },
   PlaceofEvent:{
    type: String
   },
  endTime: { 
    type: String

   },  // Format: HH:MM
  //startDate: { type: String, required: true }, // Format: YYYY-MM-DD
  endDate: { type: String },   // Format: YYYY-MM-DD
  maxRegistrations: { 
    type: Number ,
  },
  paymentMethod: { type: String },
  customFields: [{
    name: { type: String },
    type: { type: String }
  }],
  numCounters: { type: Number},  // Number of counters
  maxParticipationPerCounter: { type: Number  },  // Max participation per counter
  sessionTimePerCounterHours: { type: Number},  // Session time per counter (hours)
  sessionTimePerCounterMinutes: { type: Number} ,
  url:{
    type: String,
  },
 amount:{
    type: String,
  },
  key:{
    type: String,
  },


  secret:{
  type: String
},
linkedAccountId:{
  type: String
},
status:{
  type: String,
  default: 'approved'
},
by:{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Role',
},
instance_id:{
type:String
},
Whowillbepresent:[{
  name : String,
  email: String
}],
Instrumenttobecarried:[{
  type:String
}],
  timeslot:[{
    date:{
      type:String
    },
    time:{
      type:String
    },
  }
  ],
  emailConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailConfig',
  },
  emailSubject: { type: String },
  emailHtml: { type: String },
  eventownerlogo:{
    type: String
  },
  patnerlog:{
    type: String
  }

  
   // Session time per counter (minutes)
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
