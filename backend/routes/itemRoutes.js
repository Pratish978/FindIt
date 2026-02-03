import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';

const router = express.Router();

// Helper to ensure IMEIs are compared/stored without spaces or special characters
const cleanID = (id) => id ? id.replace(/[^0-9]/g, "") : "";

// 1. VERIFY CLAIM (Direct String Match)
router.post('/verify-claim/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (!item.imei) return res.status(400).json({ success: false, message: "No verification ID on file" });

    const { userInput } = req.body;
    
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

// 3. Report Item (With Strict 15/10 length enforcement)
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, description, location, college, contact, 
      itemType, userEmail, imei, specificDetails 
    } = req.body;
    
    const cleanedImei = cleanID(imei);
    const cleanedContact = contact ? contact.replace(/[^0-9]/g, "") : "";

    // --- STRICT LENGTH ENFORCEMENT ---
    // Validate Phone (Must be 10)
    if (cleanedContact.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Validation Error: Contact number must be exactly 10 digits." 
      });
    }

    // Validate IMEI (Only if provided, must be 15)
    if (cleanedImei && cleanedImei.length !== 15) {
      return res.status(400).json({ 
        success: false, 
        message: "Validation Error: IMEI/ID must be exactly 15 digits." 
      });
    }

    // --- INSTANT MATCH LOGIC ---
    if (cleanedImei && itemType === 'lost') {
      const match = await Item.findOne({ 
        imei: cleanedImei, 
        itemType: 'found' 
      });

      if (match) {
        return res.status(200).json({ 
          success: true, 
          matchDetected: true, 
          matchedEmail: match.userEmail 
        });
      }
    }

    // AI Prediction
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

// 4. ADMIN RECOVER (Safe Hands Toggle)
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });

    // Toggle status
    item.status = item.status === 'recovered' ? 'active' : 'recovered';
    await item.save();

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 5. USER DELETE
router.delete('/user-delete/:id', async (req, res) => {
  try {
    const { email } = req.body; 
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (item.userEmail !== email) return res.status(403).json({ success: false, message: "Unauthorized" });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 6. ADMIN DELETE (The route your AdminDashboard calls)
router.delete('/admin-delete/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Record not found" });
    
    res.json({ success: true, message: "Admin deleted item permanently" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Admin delete failed" });
  }
});

export default router;