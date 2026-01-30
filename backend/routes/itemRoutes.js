import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const cleanID = (id) => id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

// Get all for standard feeds
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { res.status(500).json({ success: false }); }
});

// POLICE ROUTE: Get items that need escalation (older than 24h or marked escalated)
router.get('/escalated-list', async (req, res) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const items = await Item.find({
      itemType: 'lost',
      $or: [
        { status: 'escalated' },
        { status: 'active', createdAt: { $lte: dayAgo } }
      ]
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// POLICE ROUTE: Verify and Generate Receipt ID
router.patch('/police-verify/:id', async (req, res) => {
  try {
    const caseId = `POL-${Math.random().toString(36).toUpperCase().slice(2, 8)}-${Date.now().toString().slice(-4)}`;
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', policeCaseId: caseId, verifiedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});

// REPORT ITEM (Original Logic Preserved)
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, college, contact, itemType, userEmail, imei, specificDetails } = req.body;
    let aiGuess = "Other";
    if (req.file) {
      try { aiGuess = await predictImage(req.file.path); } catch (e) { aiGuess = "Unrecognized"; }
    }
    let hashedImei = "";
    const rawImei = imei ? cleanID(imei) : "";
    if (rawImei !== "") { hashedImei = await bcrypt.hash(rawImei, 10); }

    // Matching logic
    let matchFound = null;
    if (rawImei !== "") {
       const searchType = itemType === 'found' ? 'lost' : 'found';
       const candidates = await Item.find({ itemType: searchType, college, status: 'active' }).select('+imei');
       for (const c of candidates) {
         if (c.imei && await bcrypt.compare(rawImei, c.imei)) { matchFound = c; break; }
       }
    }

    const newItem = new Item({
      name, description, location, college, contact, itemType, userEmail,
      specificDetails, image: req.file ? req.file.path : "",
      aiCategory: aiGuess, imei: hashedImei, status: 'active'
    });
    await newItem.save();
    res.status(201).json({ success: true, aiSuggestion: aiGuess, matchDetected: !!matchFound });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;