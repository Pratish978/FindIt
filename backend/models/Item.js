import mongoose from 'mongoose';

/**
 * ITEM SCHEMA
 * Defines the structure for both 'Lost' and 'Found' reports in the database.
 */
const itemSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true },
  college: { type: String, index: true }, // Indexed for faster filtering by campus
  
  // Classification: Must be either 'lost' or 'found'
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  
  // User Details
  userEmail: { type: String, required: true, lowercase: true }, // Lowercase ensures consistency
  userName: { type: String }, 
  contact: { type: String, required: true }, 
  
  // Media & AI Analysis
  image: { type: String }, // Stores the URL/path of the uploaded image
  aiCategory: { type: String, default: 'Not Scanned' }, // Store category predicted by AI
  
  // Lifecycle Status
  status: { 
    type: String, 
    enum: ['active', 'recovered', 'escalated', 'verified'], 
    default: 'active',
    index: true
  },
  
  // Sensitive/Specific Information
  specificDetails: { type: String, default: "" }, 
  // IMEI is hidden from default queries for security; must be explicitly selected
  imei: { type: String, default: "", select: false }, 
  feedback: { type: String, default: "" }, // Success stories or user notes
  
  // Police/Security Integration
  policeCaseId: { type: String, default: null }, // Unique ID assigned after police verification
  verifiedAt: { type: Date }, // Timestamp for when the item was verified

  // Auto-expiry Logic
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // Automatically deletes the document after 30 days (TTL Index)
  }
}, { 
  timestamps: true // Automatically manages createdAt and updatedAt fields
});

/**
 * SEARCH INDEXING
 * Enables full-text search capabilities on Item Name and Location fields.
 */
itemSchema.index({ name: 'text', location: 'text', specificDetails: 'text' });

const Item = mongoose.model('Item', itemSchema);
export default Item;