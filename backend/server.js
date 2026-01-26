import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // Required for folder check
import { fileURLToPath } from 'url';
import itemRoutes from './routes/itemRoutes.js';
import Item from './models/Item.js';

// --- CONFIGURATION ---
dotenv.config();
const app = express();

// Handle ES Module pathing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- AUTO-CREATE UPLOADS FOLDER ---
// This prevents Multer from crashing if the 'uploads' folder is missing on the server
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' folder");
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Serve the uploads folder as a static directory
app.use('/uploads', express.static(uploadDir));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- SPECIAL ROUTES (Feedback & Stats) ---

// Mark Item as Recovered (Safe Hands) + Save Feedback
app.patch('/api/items/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const newStatus = item.status === 'recovered' ? 'active' : 'recovered';
    const feedbackText = req.body.feedback || ""; 

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        status: newStatus,
        feedback: feedbackText 
      },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Admin Dashboard Statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const lostCount = await Item.countDocuments({ itemType: 'lost', status: 'active' });
    const foundCount = await Item.countDocuments({ itemType: 'found', status: 'active' });
    const recoveredCount = await Item.countDocuments({ status: 'recovered' });
    
    res.json({ totalItems, lostCount, foundCount, recoveredCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Delete Item
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- MAIN ITEM ROUTES ---
app.use('/api/items', itemRoutes);

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
// Using '0.0.0.0' helps Render map the network traffic correctly
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
});