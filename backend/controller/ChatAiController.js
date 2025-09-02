const { PrismaClient } = require("@prisma/client");
const OpenAI = require("openai").default;
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatWithAI = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Bạn cần đăng nhập" });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId || decoded.id;
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  if (!userId)
    return res.status(401).json({ message: "Token không có userId" });

  const { message } = req.body;
  if (!message?.trim())
    return res.status(400).json({ error: "Message is required" });

  try {
    // 2️⃣ Lấy sản phẩm liên quan (keyword search) hoặc top 10
    let products = await prisma.product.findMany({
      where: { name: { contains: message } },
      select: {
        name: true,
        year: true,
        price: true,
        warranty: true,
        fuelType: true,
        power: true,
        seats: true,
        km: true,
        quantity: true,
        specifications: { select: { key: true, value: true } },
        features: { select: { name: true } },
        safeties: { select: { name: true } },
        colors: { select: { name: true, hex: true, gradient: true } },
      },
      take: 5,
    });

    if (!products.length) {
      products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          year: true,
          price: true,
          warranty: true,
          fuelType: true,
          power: true,
          seats: true,
          km: true,
          quantity: true,
          specifications: { select: { key: true, value: true } },
          features: { select: { name: true } },
          safeties: { select: { name: true } },
          colors: { select: { name: true, hex: true, gradient: true } },
        },
        take: 10,
      });
    }

    // 3️⃣ Chuẩn hóa sản phẩm thành JSON
    const productContext = products.map((p) => ({
      name: p.name,
      year: p.year || null,
      price: p.price || null,
      warranty: p.warranty || null,
      fuelType: p.fuelType || null,
      power: p.power || null,
      seats: p.seats || null,
      km: p.km || null,
      quantity: p.quantity || null,
      specifications: Object.fromEntries(
        p.specifications.map((s) => [s.key, s.value])
      ),
      features: p.features.map((f) => f.name),
      safeties: p.safeties.map((s) => s.name),
      colors: p.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        gradient: c.gradient,
      })),
    }));

    // 4 Xây dựng prompt với few-shot examples
    const systemPrompt = `
Bạn là trợ lý bán hàng ô tô thông minh. 
Chỉ sử dụng dữ liệu JSON dưới đây để trả lời các câu hỏi về sản phẩm. 
Trả lời chi tiết về: giá, màu sắc, số lượng còn, tính năng, bảo hành, công suất, số ghế, số km đã chạy. 
Nếu câu hỏi không có trong dữ liệu, trả lời: "Thông tin này hiện chưa có".
Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.

Ví dụ:
- User hỏi: "Xe chạy được bao nhiêu km rồi?"
  Trả lời: "Xe đã chạy 15.000 km."

- User hỏi: "Giá của xe là bao nhiêu?"
  Trả lời: "Giá của xe là 1.200.000.000 VNĐ."

- User hỏi: "Xe còn bao nhiêu chiếc?"
  Trả lời: "Hiện tại còn 3 chiếc trong kho."

- User hỏi: "Xe có màu đỏ không?"
  Trả lời: "Có, xe có màu đỏ."

- User hỏi: "Xe có màu xanh và trắng không?"
  Trả lời: "Có, xe có màu xanh và trắng."

- User hỏi: "Bảo hành xe bao lâu?"
  Trả lời: "Xe được bảo hành 3 năm hoặc 100.000 km."

- User hỏi: "Xe sử dụng loại nhiên liệu gì?"
  Trả lời: "Xe sử dụng xăng."

- User hỏi: "Xe có bao nhiêu ghế?"
  Trả lời: "Xe có 5 ghế."

- User hỏi: "Công suất của xe là bao nhiêu?"
  Trả lời: "Công suất của xe là 150 HP."

- User hỏi: "Xe có bao nhiêu tính năng an toàn?"
  Trả lời: "Xe có các tính năng an toàn: ABS, Airbag, Camera lùi."

- User hỏi: "Xe có phanh ABS không?"
  Trả lời: "Có, xe có phanh ABS."

- User hỏi: "Xe có tính năng Cruise Control không?"
  Trả lời: "Có, xe có tính năng Cruise Control."

- User hỏi: "Xe có hỗ trợ Bluetooth không?"
  Trả lời: "Có, xe hỗ trợ Bluetooth."

- User hỏi: "Xe có cửa sổ trời không?"
  Trả lời: "Có, xe có cửa sổ trời."

- User hỏi: "Xe có số tự động hay số sàn?"
  Trả lời: "Xe có hộp số tự động 6 cấp."

- User hỏi: "Xe có chống trộm không?"
  Trả lời: "Có, xe có hệ thống chống trộm."

- User hỏi: "Xe có ghế da không?"
  Trả lời: "Có, xe được trang bị ghế da."

- User hỏi: "Xe có camera 360 độ không?"
  Trả lời: "Có, xe có camera 360 độ."

- User hỏi: "Xe có radio không?"
  Trả lời: "Có, xe có hệ thống radio."

- User hỏi: "Có hỗ trợ sạc điện thoại không?"
  Trả lời: "Có, xe có cổng sạc USB."

- User hỏi: "Xe này có giảm giá không?"
  Trả lời: "Hiện tại xe có giảm giá 10%."

- User hỏi: "Số km tối đa xe đã chạy?"
  Trả lời: "Xe đã chạy tối đa 15.000 km."


Dữ liệu sản phẩm:
${JSON.stringify(productContext, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message?.content || "Không có phản hồi";

    // 5️⃣ Lưu chat vào DB
    await prisma.chatMessage.create({
      data: { userId, role: "user", content: message },
    });
    await prisma.chatMessage.create({
      data: { userId, role: "assistant", content: reply },
    });

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "AI error", details: error.message });
  }
};

module.exports = { chatWithAI };
