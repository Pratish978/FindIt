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

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// --- ADMIN STATS ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = {
      totalItems: await Item.countDocuments(),
      lostCount: await Item.countDocuments({ itemType: 'lost', status: 'active' }),
      foundCount: await Item.countDocuments({ itemType: 'found', status: 'active' }),
      recoveredCount: await Item.countDocuments({ status: 'recovered' }),
      // Escalated = status is 'verified' OR (it's lost, active, and older than 24h)
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

// --- POLICE DASHBOARD ENDPOINTS ---

// 1. Get Escalated List
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

// 2. Verify Item & Generate Case ID
app.patch('/api/items/police-verify/:id', async (req, res) => {
  try {
    const caseId = "POLICE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'verified', 
        policeCaseId: caseId,
        verifiedAt: new Date()
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});

// --- SAFE HANDS & FEEDBACK ---
app.patch('/api/items/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const newStatus = item.status === 'recovered' ? 'active' : 'recovered';
    const updated = await Item.findByIdAndUpdate(
      req.params.id, 
      { status: newStatus, feedback: req.body.feedback || "" }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Port: ${PORT}`));