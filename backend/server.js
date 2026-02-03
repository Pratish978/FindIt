import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import itemRoutes from './routes/itemRoutes.js';
import Item from './models/Item.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure Uploads Directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { 
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

// 1. MIDDLEWARE
app.use(cors());
// Limit JSON parsing so it doesn't interfere with Multi-part form data (images)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

// 2. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 3. ADMIN & POLICE ENDPOINTS (Keep these here or move to a separate adminRoute)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = {
      totalItems: await Item.countDocuments(),
      lostCount: await Item.countDocuments({ itemType: 'lost', status: 'active' }),
      foundCount: await Item.countDocuments({ itemType: 'found', status: 'active' }),
      recoveredCount: await Item.countDocuments({ status: 'recovered' }),
      escalatedCount: await Item.countDocuments({
        itemType: 'lost',
        $or: [
          { status: 'verified' },
          { status: 'active', createdAt: { $lte: twentyFourHoursAgo } }
        ]
      })
    };
    res.json(stats);
  } catch (err) { res.status(500).json({ error: "Stats failed" }); }
});

app.get('/api/items/escalated-list', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const items = await Item.find({
      itemType: 'lost',
      $or: [
        { status: 'verified' },
        { status: 'active', createdAt: { $lte: twentyFourHoursAgo } }
      ]
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: "Escalated list fetch failed" }); }
});

app.patch('/api/items/police-verify/:id', async (req, res) => {
  try {
    const caseId = "POLICE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', policeCaseId: caseId, verifiedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});

// 4. MAIN ITEM ROUTES (This handles /report, /verify-claim, etc.)
// We put this AFTER the static/json middleware but BEFORE the 404 handler
app.use('/api/items', itemRoutes);

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`📂 Uploads path: ${uploadDir}`);
});