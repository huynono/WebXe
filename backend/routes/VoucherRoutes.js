const express = require("express");
const router = express.Router();
const multer = require("multer");
const voucherController = require("../controller/VoucherController");

// Multer config (dùng để upload image voucher)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// 📌 Routes Voucher
router.post("/createvoucher", upload.single("image"), voucherController.createVoucher);
router.get("/getvoucher", voucherController.getAllVouchers);
router.put("/updatevoucher/:id", upload.single("image"), voucherController.updateVoucher);
router.delete("/deletevoucher/:id", voucherController.deleteVoucher);

router.put('/updatestatus/:id', voucherController.updateVoucherStatus);

// Apply voucher khi checkout
router.post("/applyvoucher", voucherController.applyVoucher);



module.exports = router;
