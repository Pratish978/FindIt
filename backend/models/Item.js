import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  college: { type: String, required: true },
  contact: { type: String, required: true },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  userEmail: { type: String, default: "anonymous@student.com" }, // Default value prevents save failure
  image: { type: String, default: "" }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Item', itemSchema);