import express from 'express';
import * as paymentController from '../controller/PaymentController.js';

const router = express.Router();

router.post('/createorder', paymentController.createOrder);
router.get('/getorder', paymentController.getAllOrders);
router.put('/update-status/:id', paymentController.updateOrderStatus);
router.delete('/delete/:id', paymentController.deleteOrder);

router.get('/getuserorder', paymentController.getUserOrders);

router.get("/get/orders/:id",paymentController.getOrderById);

export const initSocket = paymentController.initSocket;
export default router;
