// routes/telegram.js
const express = require("express");
const router = express.Router();
const telegramController = require("../controller/TelegramController");

// POST /api/telegram/send
router.post("/send", telegramController.sendToTelegram);

module.exports = router;
