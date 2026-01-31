import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const cleanID = (id) => id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

// 1. VERIFY CLAIM (Handles hidden imei field + Bcrypt)
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (!item.imei) return res.status(400).json({ success: false, message: "No verification ID on file" });

    const { userInput } = req.body;
    const rawInput = cleanID(userInput);

    const isMatch = await bcrypt.compare(rawInput, item.imei);

    if (isMatch) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid ID Provided" });
    }
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ success: false, error: "System Error" });
  }
});

// 2. Standard Item Feed
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { res.status(500).json({ success: false }); }
});

// 3. Report Item (Original Logic + Hashing)
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, college, contact, itemType, userEmail, imei, specificDetails } = req.body;
    
    let aiGuess = "Other";
    if (req.file) {
      try { aiGuess = await predictImage(req.file.path); } catch (e) { aiGuess = "Unrecognized"; }
    }

    let hashedImei = "";
    if (imei) { 
      hashedImei = await bcrypt.hash(cleanID(imei), 10); 
    }

    const newItem = new Item({
      name, description, location, college, contact, itemType, userEmail,
      specificDetails, image: req.file ? req.file.path : "",
      aiCategory: aiGuess, imei: hashedImei, status: 'active'
    });

    await newItem.save();
    res.status(201).json({ success: true, aiSuggestion: aiGuess });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// 4. USER DELETE (Requires email verification)
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const { email } = req.body; 
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Security check: Does the email match the one who posted it?
    if (item.userEmail !== email) {
      return res.status(403).json({ success: false, message: "Unauthorized: Email mismatch" });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// 5. ADMIN DELETE (Simple delete for the dashboard)
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin deleted item" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Admin delete failed" });
  }
});

export default router;