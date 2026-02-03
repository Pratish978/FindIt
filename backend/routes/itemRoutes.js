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

// --- 1. VERIFY CLAIM (Returns success:true even on mismatch for "Notify Anyway") ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const { userInput } = req.body;
    const storedImei = cleanID(item.imei);
    const providedImei = cleanID(userInput);

    // Calculate match status (Needs at least 14 digits to be a valid IMEI check)
    const isMatch = (storedImei === providedImei && storedImei.length >= 14);

    console.log(`--- Verification Attempt for ${item.name} ---`);
    console.log(`Result: ${isMatch ? "MATCH" : "MISMATCH"}`);

    // We return success: true so the Frontend Email logic continues
    res.json({ 
      success: true, 
      match: isMatch,
      message: isMatch ? "ID Verified" : "ID Mismatch" 
    });

  } catch (err) {
    console.error("Verification Error:", err);
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

    // Validation
    if (cleanedContact.length !== 10) {
      return res.status(400).json({ success: false, message: "Contact must be 10 digits." });
    }
    
    if (cleanedImei && cleanedImei.length !== 15) {
      return res.status(400).json({ success: false, message: "IMEI must be 15 digits." });
    }

    // Instant Match Check
    if (cleanedImei && itemType === 'lost') {
      const match = await Item.findOne({ imei: cleanedImei, itemType: 'found', status: 'active' });
      if (match) {
        return res.status(200).json({ success: true, matchDetected: true, matchedEmail: match.userEmail });
      }
    }

    // AI Prediction
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

// --- 4. ADMIN/USER: Toggle Recovery Status ---
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });
    
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true, item });
  } catch (error) { res.status(500).json({ success: false }); }
});

// --- 5. USER DELETE (Requires Email Check) ---
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const { email } = req.body; 
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (item.userEmail !== email) {
      return res.status(403).json({ success: false, message: "Unauthorized: You don't own this post" });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Delete failed" });
  }
});

// --- 6. ADMIN DELETE (Forces Deletion) ---
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    res.json({ success: true, message: "Deleted by Admin" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Admin delete failed" });
  }
});

export default router;