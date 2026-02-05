import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Route Handlers and Models
import itemRoutes from './routes/itemRoutes.js';
import Item from './models/Item.js';

// Configuration for ES Modules to handle directory paths
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** * DIRECTORY SETUP
 * Ensures the 'uploads' folder exists to prevent errors during file uploads
 */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { 
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

/** * MIDDLEWARE CONFIGURATION
 */
app.use(cors()); // Allows your frontend to communicate with this backend
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));

/** * DATABASE CONNECTION
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

/** * ✅ ROOT ROUTE (Fixes "Cannot GET /")
 * This acts as a health check for Render
 */
app.get('/', (req, res) => {
    res.status(200).json({
        message: "🚀 FindIt Backend is Live and Running!",
        status: "Healthy",
        timestamp: new Date()
    });
});

/** * ADMIN & ANALYTICS ENDPOINTS
 */
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
  } catch (err) { 
    res.status(500).json({ error: "Failed to fetch admin statistics" }); 
  }
});

/** * POLICE/ESCALATION ENDPOINTS
 */
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
  } catch (err) { 
    res.status(500).json({ error: "Failed to fetch escalated items" }); 
  }
});

/** * POLICE VERIFICATION ACTION
 */
app.patch('/api/items/police-verify/:id', async (req, res) => {
  try {
    const caseId = "POLICE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', policeCaseId: caseId, verifiedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) { 
    res.status(500).json({ error: "Police verification process failed" }); 
  }
});

/** * ROUTE DELEGATION
 */
app.use('/api/items', itemRoutes);

/** * SERVER INITIALIZATION
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`📂 Static Uploads Path: ${uploadDir}`);
});