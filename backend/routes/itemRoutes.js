import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

const cleanID = (val) => {
  if (!val) return "";
  let str = String(val);
  if (str.includes('+')) str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  return str.replace(/\D/g, "").trim();
};

// --- GET DATA FOR EMAIL (No Comparison Logic) ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    if (!item) return res.status(404).json({ success: false });

    res.json({ 
      success: true, 
      storedImei: item.imei || "Not Provided" 
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- REPORT ITEM ---//
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, college, contact, itemType, userEmail, imei, specificDetails } = req.body;
    const cleanedImei = cleanID(imei);
    const cleanedContact = contact.replace(/\D/g, "");

    let aiGuess = "Other";
    if (req.file) {
      try { aiGuess = await predictImage(req.file.path); } catch (e) { aiGuess = "Unrecognized"; }
    }

    const newItem = new Item({
      name, description, location, college, contact: cleanedContact, 
      itemType, userEmail, specificDetails, image: req.file ? req.file.path : "",
      aiCategory: aiGuess, imei: cleanedImei, status: 'active'
    });

    await newItem.save();
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { res.status(500).json({ success: false }); }
});

router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

router.delete('/user-delete/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

export default router;