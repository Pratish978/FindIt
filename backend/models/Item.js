import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true },
  college: { type: String, index: true }, // Indexing college for faster search
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  userEmail: { type: String, required: true, lowercase: true },
  userName: { type: String }, 
  image: { type: String },
  aiCategory: { type: String, default: 'Not Scanned' }, 
  status: { 
    type: String, 
    enum: ['active', 'recovered', 'escalated', 'verified'], 
    default: 'active',
    index: true
  },
  contact: { type: String, required: true }, 
  specificDetails: { type: String, default: "" }, 

  // ✅ IMEI Fix: 'select: false' hatana behtar hai agar verify-claim use karna hai
  // Ya fir query karte waqt .select('+imei') use karna padega (jo tumne routes mein kiya hai)
  imei: { type: String, default: "" }, 
  
  feedback: { type: String, default: "" },
  
  // --- POLICE FIELDS ---
  policeCaseId: { type: String, default: null }, 
  verifiedAt: { type: Date },

  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // 30 days (Auto-delete)
  }
}, { timestamps: true }); // Automatically adds updatedAt and createdAt

// Performance ke liye Text Index
itemSchema.index({ name: 'text', location: 'text', specificDetails: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;