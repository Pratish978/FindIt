import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

/**
 * HELPER: cleanID
 * UPDATED: Forcefully handles potential scientific notation and types
 */
const cleanID = (val) => {
  if (val === null || val === undefined) return "";
  
  // Convert to string and handle scientific notation (e.g., 8.6e+14)
  let str = String(val);
  if (str.includes('+')) {
    str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  }

  // Strip everything except digits and trim
  return str.replace(/\D/g, "").trim();
};

// --- 1. VERIFY CLAIM (Fixed Comparison Logic) ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    // IMPORTANT: Make sure the model allows imei to be selected if it's hidden by default
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const { userInput } = req.body;
    
    // Process both for comparison
    const storedImei = cleanID(item.imei);
    const providedImei = cleanID(userInput);

    // DEBUGGING: Check your console/terminal for these logs!
    console.log("--- DEBUG START ---");
    console.log("Item Name:", item.name);
    console.log("Raw DB IMEI:", item.imei);
    console.log("Cleaned DB IMEI:", `"${storedImei}"`);
    console.log("User Input IMEI:", `"${providedImei}"`);
    
    // Strict comparison
    const isMatch = (storedImei === providedImei && storedImei.length >= 14);
    
    console.log("Comparison Result:", isMatch);
    console.log("--- DEBUG END ---");

    res.json({ 
      success: true, 
      match: isMatch, 
      message: isMatch ? "IMEI Match Found" : "IMEI Mismatch Detected" 
    });

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ success: false, error: "System Error" });
  }
});

// --- 2. REPORT ITEM (With Strict String Storage) ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, contact, 
      itemType, userEmail, imei, specificDetails 
    } = req.body;
    
    const cleanedImei = cleanID(imei);
    const cleanedContact = contact ? contact.replace(/\D/g, "") : "";

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
      aiCategory: aiGuess, 
      imei: cleanedImei, // Storing as cleaned string
      status: 'active'
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

// --- 5. USER DELETE ---
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const { email } = req.body; 
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (item.userEmail !== email) return res.status(403).json({ success: false, message: "Unauthorized" });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted" });
  } catch (error) { res.status(500).json({ success: false }); }
});

// --- 6. ADMIN DELETE ---
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false });
    res.json({ success: true, message: "Deleted by Admin" });
  } catch (error) { res.status(500).json({ success: false }); }
});

export default router;