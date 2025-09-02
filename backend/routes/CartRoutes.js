const express = require('express');
const router = express.Router();
const CartController = require('../controller/CartController');
// const authMiddleware = require('../middleware/authMiddleware'); // giả sử bạn có middleware JWT

// Lấy giỏ hàng của user
router.get('/getcartuser',CartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/addcart',  CartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/updatecart', CartController.updateCartItem);


router.delete("/deletecart/:cartItemId", CartController.deleteCartItem);


module.exports = router;
