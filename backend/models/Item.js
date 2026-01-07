import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  college: { type: String },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  userEmail: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['active', 'recovered'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);
export default Item;