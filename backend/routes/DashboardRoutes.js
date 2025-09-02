// routes/dashboard.routes.js
import express from "express";
import DashboardController from "../controller/DashboardController.js";

const router = express.Router();

// Doanh thu theo tháng
router.get("/revenue", DashboardController.getRevenueChart);

// Tăng trưởng khách hàng
router.get("/customers-growth", DashboardController.getCustomerGrowth);

// Sản phẩm bán chạy
router.get("/best-products", DashboardController.getBestSellingProducts);

// Top khách hàng
router.get("/top-customers", DashboardController.getTopCustomers);

export default router;
