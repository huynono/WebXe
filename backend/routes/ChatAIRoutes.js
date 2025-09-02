const express = require("express");
const { chatWithAI } = require("../controller/ChatAiController.js");
const router = express.Router();

router.post("/chat", chatWithAI);

module.exports = router;
