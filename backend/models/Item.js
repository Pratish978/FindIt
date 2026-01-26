import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  college: { 
    type: String 
  },
  itemType: { 
    type: String, 
    enum: ['lost', 'found'], 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  userName: { 
    type: String 
  }, 
  image: { 
    type: String 
  },
  aiCategory: { 
    type: String, 
    default: 'Not Scanned' 
  }, 
  status: { 
    type: String, 
    enum: ['active', 'recovered'], 
    default: 'active' 
  },
  contact: { 
    type: String 
  }, 

  // --- NEW SECURITY & VERIFICATION FIELDS ---
  
  // For Non-Electronics: "What color is the keychain?"
  verificationQuestion: { 
    type: String, 
    default: "" 
  }, 
  
  // For Electronics: Stores the real IMEI/Serial Number
  // We use 'select: false' so the IMEI isn't accidentally 
  // leaked in the general "All Items" API list.
  imei: { 
    type: String, 
    default: "",
    select: false 
  },

  // For Non-Electronics: Stores the "Answer" to the secret question
  secretAnswer: {
    type: String,
    default: "",
    select: false
  },

  // --- MAINTENANCE FIELDS ---
  
  feedback: { 
    type: String, 
    default: "" 
  },

  // Auto-Expiration: 2,592,000 seconds = 30 days.
  // MongoDB will automatically delete the post after 30 days to keep the feed clean.
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 
  }
});

// Create an index for faster searching
itemSchema.index({ name: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;