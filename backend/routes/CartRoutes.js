const express = require('express');
const router = express.Router();
const CartController = require('../controller/CartController');
// const authMiddleware = require('../middleware/authMiddleware'); // giả sử bạn có middleware JWT

router.get('/getcartuser',CartController.getCart);
router.post('/addcart',  CartController.addToCart);
router.put('/updatecart', CartController.updateCartItem);
router.delete("/deletecart/:cartItemId", CartController.deleteCartItem);

module.exports = router;
