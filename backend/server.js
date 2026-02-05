import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

// HELPER: cleanID (Intact)
const cleanID = (val) => {
  if (!val || val === "undefined" || val === "N/A") return "";
  let str = String(val);
  if (str.includes('+')) {
    str = Number(val).toLocaleString('fullwide', { useGrouping: false });
  }
  return str.replace(/\D/g, "").trim();
};

// --- 1. ADMIN STATS ---
router.get('/admin/stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const recoveredCount = await Item.countDocuments({ status: 'recovered' });
    res.json({ success: true, totalItems, recoveredCount });
  } catch (error) {
    res.status(500).json({ success: false, totalItems: 0, recoveredCount: 0 });
  }
});

// --- 2. REPORT ITEM (With Render Fix) ---
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, 
      contact, itemType, userEmail, imei, 
      specificDetails 
    } = req.body;

    if (!name || !contact) {
      return res.status(400).json({ success: false, message: "Name and Contact are required." });
    }

    const cleanedImei = cleanID(imei);
    const cleanedContact = String(contact).replace(/\D/g, "");

    // AI Prediction
    let aiGuess = "Other";
    if (req.file) {
      try { 
        // Agar Cloudinary use kar rahe ho toh req.file.path URL hoga
        aiGuess = await predictImage(req.file.path); 
      } catch (e) { 
        aiGuess = "Unrecognized"; 
      }
    }

    // ✅ Image URL Logic
    // Agar Multer-Cloudinary use kar rahe ho toh req.file.path hi URL hai
    // Agar local storage hai toh hum path ko normalize karenge
    let imagePath = "";
    if (req.file) {
        imagePath = req.file.path.startsWith('http') 
          ? req.file.path 
          : `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
    }

    const newItem = new Item({
      name, description, location, college, contact: cleanedContact, 
      itemType: itemType || 'lost', userEmail, specificDetails, 
      image: imagePath,
      aiCategory: aiGuess, imei: cleanedImei, status: 'active'
    });

    const savedItem = await newItem.save();

    // Matching Logic (Exact IMEI Match)
    const targetType = itemType === 'found' ? 'lost' : 'found';
    let potentialMatch = null;
    if (cleanedImei && cleanedImei.length >= 8) { // Min 8 digits for matching
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
      message: potentialMatch ? "Instant Match Found!" : "Registered successfully"
    });
  } catch (error) { 
    console.error("Report Error:", error);
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 3. GET ALL ITEMS ---
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ success: false, error: "Failed to fetch items" }); 
  }
});

// --- 4. VERIFY CLAIM ---
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const { userInput } = req.body; 
    const item = await Item.findById(req.params.id).select('+imei');
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    const isMatch = (cleanID(item.imei) === cleanID(userInput) && cleanID(userInput).length > 0);
    res.json({ 
      success: true, 
      matchStatus: isMatch ? "✅ VERIFIED" : "⚠️ UNVERIFIED",
      // Security: Don't send real IMEI back if unverified
      storedImei: isMatch ? item.imei : "****" 
    });
  } catch (err) { res.status(500).json({ success: false, message: "Server error" }); }
});

// --- 5. TOGGLE STATUS (Safe Hands) ---
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const { feedback, status: newStatus } = req.body; 
    const item = await Item.findById(req.params.id);
    
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    if (newStatus) item.status = newStatus;
    else item.status = item.status === 'recovered' ? 'active' : 'recovered';
    
    if (feedback !== undefined) item.feedback = feedback;

    await item.save();
    res.json({ success: true, newStatus: item.status });
  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// --- 6. DELETE ---
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