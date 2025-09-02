import express from 'express';
import { loginAdmin } from '../controller/AdminController.js';

const router = express.Router();

// POST /api/admin/login
router.post('/loginadmin', loginAdmin);

export default router;
