const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ── configure cloudinary with your credentials ────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── create storage engine ─────────────────────────────────────────────────────
// CloudinaryStorage tells multer to stream uploaded files directly to Cloudinary
// instead of saving them to disk first
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // 'slice-receipts' is the folder name in your Cloudinary account
    folder: 'slice-receipts',
    // allowed formats — only images
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    // transformation: resize and compress on upload
    // this prevents users from uploading 10MB phone photos
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// ── create multer upload middleware ───────────────────────────────────────────
// limits.fileSize: 5MB max upload size
// single('receipt') means we accept one file with the field name 'receipt'
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // only allow image files — reject PDFs, videos etc
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };