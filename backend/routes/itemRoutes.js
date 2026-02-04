import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

/**
 * HELPER: cleanID (Original Logic Intact)
 */
const cleanID = (val) => {
  if (!val || val === "undefined" || val === "N/A") return "";
  let str = String(val);
  if (str.includes('+')) {
    str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  }
  return str.replace(/\D/g, "").trim();
};

// --- 1. ADMIN STATS (Hero Section ke liye) ---
router.get('/admin/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const recoveredCount = await Item.countDocuments({ status: 'recovered' });
    res.json({ 
      success: true, 
      totalItems, 
      recoveredCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, totalItems: 0, recoveredCount: 0 });
  }
});

// --- 2. REPORT ITEM (Original Logic Intact) ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name = "", description = "", location = "", college = "", 
      contact = "", itemType = "lost", userEmail = "", imei = "", 
      specificDetails = "" 
    } = req.body;

    if (!name || !contact) {
      return res.status(400).json({ success: false, message: "Name and Contact are required." });
    }

    const cleanedImei = cleanID(imei);
    const cleanedContact = String(contact).replace(/\D/g, "");

    let aiGuess = "Other";
    if (req.file) {
      try { 
        aiGuess = await predictImage(req.file.path); 
      } catch (e) { 
        aiGuess = "Unrecognized"; 
      }
    }

    const newItem = new Item({
      name, description, location, college, contact: cleanedContact, 
      itemType, userEmail, specificDetails, 
      image: req.file ? req.file.path : "",
      aiCategory: aiGuess, imei: cleanedImei, status: 'active'
    });

    const savedItem = await newItem.save();

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
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 3. GET ALL ITEMS (FIXED: Yahan status filter hata diya taki feedback load ho sake) ---
router.get('/all', async (req, res) => {
  try {
    // Agar hum yahan { status: 'active' } lagate hain, toh 'recovered' items (feedback wale) nahi aayenge.
    // Isliye sabhi items bhej rahe hain, frontend khud filter kar lega.
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ success: false, error: "Failed to fetch items" }); 
  }
});

// --- 4. VERIFY CLAIM (Original Logic Intact) ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const { userInput } = req.body; 
    const item = await Item.findById(req.params.id).select('+imei');
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    const isMatch = (cleanID(item.imei) === cleanID(userInput) && cleanID(userInput).length > 0);
    res.json({ success: true, matchStatus: isMatch ? "✅ VERIFIED" : "⚠️ UNVERIFIED", storedImei: item.imei || "Not Provided" });
  } catch (err) { res.status(500).json({ success: false, message: "Server error" }); }
});

// --- 5. TOGGLE RECOVERY STATUS (Original Logic Intact) ---
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();
    res.json({ success: true, newStatus: item.status });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// --- 6. DELETE ITEM (Original Logic Intact) ---
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;