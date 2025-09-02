const express = require('express');
const router = express.Router();
const ReviewController = require('../controller/ReviewController');

// Sử dụng multer-storage-cloudinary thay vì lưu local
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

// Up nhiều ảnh (tối đa 5)
router.post('/add', upload.array('images', 5), ReviewController.createReview);
router.get('/get/product/:productId', ReviewController.getReviewsByProduct);
router.get('/getallreview', ReviewController.getAllReviews);
router.put('/update/:id', upload.array('images', 5), ReviewController.updateReview);
router.delete("/admindelete/:id", ReviewController.adminDeleteReview);
router.delete("/userdelete/:id", ReviewController.deleteReviewByUser);


module.exports = router;
