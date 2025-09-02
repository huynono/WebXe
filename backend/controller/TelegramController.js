const axios = require("axios");

exports.sendToTelegram = async (req, res) => {
  const { fullName, phone, email, address, preferredDate, preferredTime, notes } = req.body;

  const message = `
📌 Lịch hẹn mới:
👤 Họ tên: ${fullName}
📞 SĐT: ${phone}
📧 Email: ${email}
📍 Địa chỉ: ${address}
📅 Ngày: ${preferredDate}
⏰ Giờ: ${preferredTime}
📝 Ghi chú: ${notes || "Không có"}
`;

  try {
  await axios.post(
  `https://api.telegram.org/bot8164400166:AAEB2WVgIcjM9UFbQ2kxX2aadhBCp3PIb24/sendMessage`,
  {
    chat_id: 5682966436, // 👈 thay bằng số này
    text: message,
  }
);


    res.json({ success: true, message: "Đã gửi thông tin lên Telegram" });
  } catch (error) {
    console.error("Telegram error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Không gửi được" });
  }
};
