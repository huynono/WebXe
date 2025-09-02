const express = require('express');
const router = express.Router();
const CategoryController = require('../controller/CategoryController');

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Cấu hình storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});
const upload = multer({ storage: storage });
router.post(
  "/createCategory",
  upload.single("image"),
  CategoryController.createCategory
);
router.put('/updateCategory/:id', upload.single('image'), CategoryController.updateCategory);
router.get('/allCategory', CategoryController.getAllCategories);
router.put('/updateStatus/:id', CategoryController.updateCategoryStatus);
router.delete('/deleteCategory/:id', CategoryController.deleteCategory);
module.exports = router;
