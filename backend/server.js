import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import itemRoutes from './routes/itemRoutes.js';
import Item from './models/Item.js'; 

dotenv.config();
const app = express();

// --- CORS CONFIGURATION ---
// This allows your Vercel frontend to talk to this Render backend
app.use(cors({
  origin: ["https://find-it-h9vt.vercel.app", "http://localhost:5173"], 
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Connection Error:", err));

// --- ADMIN & MANAGEMENT ROUTES ---

// Get Dashboard Stats
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

// Mark Item as Recovered (Safe Hands)
app.patch('/api/items/safe-hands/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'recovered' },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Delete Item (User or Admin)
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Standard Item Routes
app.use('/api/items', itemRoutes);

// Root route for testing if the API is live
app.get('/', (req, res) => {
  res.send("FindIt API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));