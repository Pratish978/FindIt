import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

// Helper to ensure IMEIs are compared without spaces or special characters
const cleanID = (id) => id ? id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "";

// 1. VERIFY CLAIM (Direct String Match)
router.post('/verify-claim/:id', async (req, res) => {
  try {
    // Select '+imei' in case your schema has 'select: false' for security
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (!item.imei) return res.status(400).json({ success: false, message: "No verification ID on file" });

    const { userInput } = req.body;
    
    // Compare cleaned strings (Removed Bcrypt compare)
    if (cleanID(userInput) === cleanID(item.imei)) {
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
  } catch (error) { 
    res.status(500).json({ success: false }); 
  }
});

// 3. Report Item (Integrated Instant Match logic)
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, contact, 
      itemType, userEmail, imei, specificDetails 
    } = req.body;
    
    const cleanedImei = cleanID(imei);

    // --- INSTANT MATCH LOGIC ---
    // If reporting a LOST item, look if that IMEI is already in the database as FOUND
    if (cleanedImei && itemType === 'lost') {
      const match = await Item.findOne({ 
        imei: cleanedImei, 
        itemType: 'found' 
      });

      if (match) {
        // Stop execution and return the match to the frontend
        return res.status(200).json({ 
          success: true, 
          matchDetected: true, 
          matchedEmail: match.userEmail 
        });
      }
    }

    // --- AI PREDICTION ---
    let aiGuess = "Other";
    if (req.file) {
      try { 
        aiGuess = await predictImage(req.file.path); 
      } catch (e) { 
        aiGuess = "Unrecognized"; 
      }
    }

    // --- SAVE NEW ITEM (Plain text, searchable IMEI) ---
    const newItem = new Item({
      name, 
      description, 
      location, 
      college, 
      contact, 
      itemType, 
      userEmail,
      specificDetails, 
      image: req.file ? req.file.path : "",
      aiCategory: aiGuess, 
      imei: cleanedImei, 
      status: 'active'
    });

    await newItem.save();
    res.status(201).json({ success: true, aiSuggestion: aiGuess });

  } catch (error) { 
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// 4. USER DELETE (Remains the same)
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const { email } = req.body; 
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (item.userEmail !== email) return res.status(403).json({ success: false, message: "Unauthorized: Email mismatch" });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// 5. ADMIN DELETE 
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin deleted item" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Admin delete failed" });
  }
});

export default router;