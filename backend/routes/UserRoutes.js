const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');


router.post('/register', userController.register);
router.post('/login', userController.login); 
router.post("/google", userController.googleLogin);
router.post("/facebook", userController.facebookLogin);
router.get('/alluser', userController.getAllUsers); // Lấy tất cả người dùng
router.delete('/deleteuser/:id', userController.deleteUser);
router.put('/updateuser/:id', userController.updateUser);

module.exports = router;
