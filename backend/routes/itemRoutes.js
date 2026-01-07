import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';

const router = express.Router();

/**
 * @route   POST /api/items/report
 * @desc    Create a new lost or found item report
 */
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, college, contact, itemType, userEmail } = req.body;

    const newItem = new Item({
      name,
      description,
      location,
      college,
      contact,
      itemType,
      userEmail: userEmail || "anonymous@student.com",
      // Save Cloudinary/Multer path if file exists
      image: req.file ? req.file.path : "",
      status: 'active' 
    });

    const savedItem = await newItem.save();
    console.log("✅ Item Saved:", savedItem.name);
    res.status(201).json({ success: true, item: savedItem });
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/items/safe-hands/:id
 * @desc    Update item status to 'recovered' (User action)
 */
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'recovered' },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Item status updated to recovered! 🎉", 
      item: updatedItem 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/items/:id/status
 * @desc    Admin action to update status to any value
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/items/all
 * @desc    Fetch all items sorted by newest first
 */
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Fetch a single item by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/items/:id
 * @desc    Permanently delete an item report
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, message: "Successfully removed from database" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;