import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true },
  college: { type: String },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  userEmail: { type: String, required: true },
  userName: { type: String }, 
  image: { type: String },
  aiCategory: { type: String, default: 'Not Scanned' }, 
  status: { 
    type: String, 
    enum: ['active', 'recovered', 'escalated', 'verified'], 
    default: 'active' 
  },
  contact: { type: String }, 
  specificDetails: { type: String, default: "" }, 
  imei: { type: String, default: "", select: false },
  feedback: { type: String, default: "" },
  
  // --- NEW POLICE FIELDS ---
  policeCaseId: { type: String, default: null }, // Unique ID for the receipt
  verifiedAt: { type: Date },

  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // 30 days
  }
});

itemSchema.index({ name: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;