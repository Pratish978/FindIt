import express from 'express';
import Item from '../models/Item.js';
import upload from '../Middleware/multer.js';

const router = express.Router();

// POST: Report Item
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
      // If no file is uploaded, req.file is undefined, so we save an empty string
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

// PATCH: Mark Item as Recovered (Safe Hands)
router.patch('/safe-hands/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'recovered' },
      { new: true }
    );
    res.status(200).json({ success: true, message: "In safe hands! 🎉", item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: All Items
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Remove Item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Successfully removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;