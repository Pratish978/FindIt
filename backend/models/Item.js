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

  // --- UPDATED SECURITY & VERIFICATION FIELDS ---
  
  // Replaced verificationQuestion with specificDetails to match UI
  specificDetails: { 
    type: String, 
    default: "" 
  }, 
  
  // For Electronics: Stores hashed IMEI/Serial
  imei: { 
    type: String, 
    default: "",
    select: false 
  },

  // --- MAINTENANCE FIELDS ---
  
  feedback: { 
    type: String, 
    default: "" 
  },

  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // 30-day auto-expiry
  }
});

itemSchema.index({ name: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;