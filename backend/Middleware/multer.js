import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'findit_items',
    // Added 'webp' and other common mobile formats here
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'jfif', 'heic'], 
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: Resizes large images to save space
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: Limits file size to 5MB
});

export default upload;