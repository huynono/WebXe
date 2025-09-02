// routes/ProductRoutes.js
const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 800, height: 600, crop: "fill" }],
  },
});

const upload = multer({ storage: storage });

// Cho phép 1 file 'image' và tối đa 100 file 'images'
router.post(
  "/addProduct",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  ProductController.addProduct
);

router.get("/allProducts", ProductController.getAllProducts);

router.get("/product/:slug", ProductController.getProductBySlug);

router.delete("/deleteproduct/:id", ProductController.deleteProduct);

router.put(
  "/updateproduct/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  ProductController.updateProduct
);

router.put("/updateStatus/:id", ProductController.updateProductStatus);

module.exports = router;
