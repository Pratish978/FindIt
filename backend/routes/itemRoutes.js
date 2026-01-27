import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';
import { predictImage } from '../utils/aiHelper.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Helper to clean IMEI/Serial numbers
const cleanID = (id) => id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

// --- FIXED: Removed { status: 'active' } to allow Feedback & Rewards to show ---
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching items" });
  }
});

router.post('/report', upload.single('image'), async (req, res) => {
  try {

    const { name, description, location, college, contact, itemType, userEmail, imei, specificDetails } = req.body;

    // 1. AI Categorization (CNN) - Logic preserved
    let aiGuess = "Other"; 
    if (req.file) {
      try { aiGuess = await predictImage(req.file.path); } 
      catch (e) { aiGuess = "Unrecognized"; }
    }

    
    let hashedImei = "";
    const rawImei = imei ? cleanID(imei) : "";
    if (rawImei !== "") {
      hashedImei = await bcrypt.hash(rawImei, 10);
    }

    let matchFound = null;
    if (rawImei !== "") {
      const searchType = itemType === 'found' ? 'lost' : 'found';
      const candidates = await Item.find({ 
        itemType: searchType, 
        college: college, 
        status: 'active' 
      }).select('+imei');

      for (const candidate of candidates) {
        if (candidate.imei) {
          const isHardwareMatch = await bcrypt.compare(rawImei, candidate.imei);
          if (isHardwareMatch) {
            matchFound = candidate;
            break; 
          }
        }
      }
    }

    
    const newItem = new Item({
      name, 
      description, 
      location, 
      college, 
      contact, 
      itemType, 
      userEmail,
      specificDetails, // Added to save to DB
      image: req.file ? req.file.path : "",
      aiCategory: aiGuess,
      imei: hashedImei,
      status: 'active'
    });

    await newItem.save();

    res.status(201).json({ 
      success: true, 
      aiSuggestion: aiGuess,
      matchDetected: !!matchFound,
      matchedEmail: matchFound ? matchFound.userEmail : null 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify-claim/:id', async (req, res) => {
  try {
    const { userInput } = req.body; 
    const item = await Item.findById(req.params.id).select('+imei');
    
    if (!item || !item.imei) {
      return res.status(200).json({ success: true, message: "No protection required" });
    }

    const isMatch = await bcrypt.compare(cleanID(userInput), item.imei);
    
    if (isMatch) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid IMEI. Verification failed." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Verification Error" });
  }
});

export default router;