import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

/**
 * HELPER: cleanID
 * Handles scientific notation and strips non-numeric characters
 */
const cleanID = (val) => {
  if (!val) return "";
  let str = String(val);
  if (str.includes('+')) {
    str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  }
  return str.replace(/\D/g, "").trim();
};

// --- 1. REPORT ITEM (With Bi-Directional Matching) ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, 
      contact, itemType, userEmail, imei, specificDetails 
    } = req.body;
    
    const cleanedImei = cleanID(imei);
    const cleanedContact = contact.replace(/\D/g, "");

    // AI Categorization using your existing utility
    let aiGuess = "Other";
    if (req.file) {
      try { 
        aiGuess = await predictImage(req.file.path); 
      } catch (e) { 
        aiGuess = "Unrecognized"; 
      }
    }

    const newItem = new Item({
      name, 
      description, 
      location, 
      college, 
      contact: cleanedContact, 
      itemType, // 'lost' or 'found'
      userEmail, 
      specificDetails, 
      image: req.file ? req.file.path : "",
      aiCategory: aiGuess, 
      imei: cleanedImei, 
      status: 'active'
    });

    const savedItem = await newItem.save();

    // --- CROSS-VAULT MATCHING LOGIC ---
    // If reporting 'lost', look in 'found'. If reporting 'found', look in 'lost'.
    const targetType = itemType === 'found' ? 'lost' : 'found';
    let potentialMatch = null;

    // Matching requires at least 10 digits to be statistically significant
    if (cleanedImei && cleanedImei.length >= 10) {
      potentialMatch = await Item.findOne({
        itemType: targetType,
        status: 'active',
        imei: cleanedImei 
      });
    }

    // Return matchDetected to trigger the "Instant Match" Popup on the website
    res.status(201).json({ 
      success: true, 
      matchDetected: !!potentialMatch,
      matchedEmail: potentialMatch ? potentialMatch.userEmail : null,
      item: savedItem,
      message: potentialMatch ? "Match found in vault!" : "Registered successfully"
    });

  } catch (error) { 
    console.error("Report Error:", error);
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 2. GET ALL ACTIVE ITEMS ---
router.get('/all', async (req, res) => {
  try {
    // Only fetch active items, newest first
    const items = await Item.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ success: false }); 
  }
});

// --- 3. VERIFY CLAIM (Data Retrieval) ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    res.json({ 
      success: true, 
      storedImei: item.imei || "Not Provided" 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error retrieving ID" });
  }
});

// --- 4. TOGGLE RECOVERY STATUS ---
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });
    
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true, newStatus: item.status });
  } catch (error) { 
    res.status(500).json({ success: false }); 
  }
});

// --- 5. DELETE ITEM ---
router.delete('/user-delete/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { 
    res.status(500).json({ success: false }); 
  }
});

export default router;