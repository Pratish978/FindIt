import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

/**
 * HELPER: cleanID
 * Prevents crashing if val is null/undefined and handles scientific notation
 */
const cleanID = (val) => {
  if (!val || val === "undefined" || val === "N/A") return "";
  let str = String(val);
  if (str.includes('+')) {
    str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  }
  return str.replace(/\D/g, "").trim();
};

// --- 1. REPORT ITEM ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    // Destructure with default empty strings to prevent ".replace()" errors
    const { 
      name = "", 
      description = "", 
      location = "", 
      college = "", 
      contact = "", 
      itemType = "lost", 
      userEmail = "", 
      imei = "", 
      specificDetails = "" 
    } = req.body;

    // Validation: Ensure minimum required data exists
    if (!name || !contact) {
      return res.status(400).json({ success: false, message: "Name and Contact are required." });
    }

    const cleanedImei = cleanID(imei);
    const cleanedContact = String(contact).replace(/\D/g, "");

    // AI Categorization
    let aiGuess = "Other";
    if (req.file) {
      try { 
        aiGuess = await predictImage(req.file.path); 
      } catch (e) { 
        console.log("AI Prediction failed, falling back to 'Unrecognized'");
        aiGuess = "Unrecognized"; 
      }
    }

    const newItem = new Item({
      name, 
      description, 
      location, 
      college, 
      contact: cleanedContact, 
      itemType, 
      userEmail, 
      specificDetails, 
      image: req.file ? req.file.path : "",
      aiCategory: aiGuess, 
      imei: cleanedImei, 
      status: 'active'
    });

    const savedItem = await newItem.save();

    // --- CROSS-VAULT MATCHING ---
    const targetType = itemType === 'found' ? 'lost' : 'found';
    let potentialMatch = null;

    if (cleanedImei && cleanedImei.length >= 10) {
      potentialMatch = await Item.findOne({
        itemType: targetType,
        status: 'active',
        imei: cleanedImei 
      });
    }

    res.status(201).json({ 
      success: true, 
      matchDetected: !!potentialMatch,
      matchedEmail: potentialMatch ? potentialMatch.userEmail : null,
      item: savedItem,
      message: potentialMatch ? "Match found in vault!" : "Registered successfully"
    });

  } catch (error) { 
    console.error("Report Error:", error);
    // Return a 500 but with a clear error message for debugging
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 2. GET ALL ACTIVE ITEMS ---
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ success: false, error: "Failed to fetch items" }); 
  }
});

// --- 3. VERIFY CLAIM ---
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
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true, newStatus: item.status });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 5. DELETE ITEM ---
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

export default router;