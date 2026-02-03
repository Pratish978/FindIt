import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

/**
 * HELPER: cleanID
 * Ensures IMEIs/Contacts are treated as strings to prevent scientific notation 
 */
const cleanID = (val) => {
  if (val === null || val === undefined) return "";
  let str = typeof val === 'number' 
    ? val.toLocaleString('fullwide', { useGrouping: false }) 
    : String(val);
  return str.replace(/[^0-9]/g, "").trim();
};

// --- 1. VERIFY CLAIM (Now returns success even on mismatch) ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const { userInput } = req.body;
    const storedImei = cleanID(item.imei);
    const providedImei = cleanID(userInput);

    // Calculate match status
    const isMatch = (storedImei === providedImei && storedImei.length >= 14);

    console.log(`--- Verification Attempt ---`);
    console.log(`Item: ${item.name} | Match: ${isMatch}`);

    // ALWAYS return success: true so the frontend continues to the email step
    // But provide the 'match' flag so the email content can be adjusted
    res.json({ 
      success: true, 
      match: isMatch,
      message: isMatch ? "ID Verified" : "ID Mismatch" 
    });

  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ success: false, error: "System Error" });
  }
});

// --- 2. REPORT ITEM (With AI & Instant Matching) ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, contact, 
      itemType, userEmail, imei, specificDetails 
    } = req.body;
    
    const cleanedImei = cleanID(imei);
    const cleanedContact = contact ? contact.replace(/[^0-9]/g, "") : "";

    if (cleanedContact.length !== 10) {
      return res.status(400).json({ success: false, message: "Contact must be 10 digits." });
    }
    
    if (cleanedImei && cleanedImei.length !== 15) {
      return res.status(400).json({ success: false, message: "IMEI must be 15 digits." });
    }

    if (cleanedImei && itemType === 'lost') {
      const match = await Item.findOne({ imei: cleanedImei, itemType: 'found', status: 'active' });
      if (match) {
        return res.status(200).json({ success: true, matchDetected: true, matchedEmail: match.userEmail });
      }
    }

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
    res.status(201).json({ success: true, aiSuggestion: aiGuess });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 3. GET ALL ITEMS ---
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { res.status(500).json({ success: false }); }
});

// --- 4. ADMIN: Toggle Recovery ---
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true, item });
  } catch (error) { res.status(500).json({ success: false }); }
});

// --- 5. ADMIN: Delete ---
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) { res.status(500).json({ success: false }); }
});

export default router;