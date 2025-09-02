import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class DashboardController {
  // === Doanh thu theo tháng ===
  async getRevenueChart(req, res) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: "paid",
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // 12 tháng gần đây
          },
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      });

      const monthlyStats = {};
      orders.forEach(order => {
        const month = order.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
        if (!monthlyStats[month]) {
          monthlyStats[month] = { revenue: 0, orders: 0 };
        }
        monthlyStats[month].revenue += order.totalAmount;
        monthlyStats[month].orders += 1;
      });

      const result = Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("🔥 Revenue chart error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu doanh thu" });
    }
  }

  // === Tăng trưởng khách hàng theo tháng ===
  async getCustomerGrowth(req, res) {
    try {
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      const monthlyStats = {};
      users.forEach(user => {
        const month = user.createdAt.toISOString().slice(0, 7);
        if (!monthlyStats[month]) {
          monthlyStats[month] = 0;
        }
        monthlyStats[month] += 1;
      });

      const result = Object.entries(monthlyStats)
        .map(([month, count]) => ({
          month,
          newCustomers: count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("🔥 Customer growth error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu tăng trưởng khách hàng" });
    }
  }

  // === Sản phẩm bán chạy ===
  async getBestSellingProducts(req, res) {
    try {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            paymentStatus: "paid",
            createdAt: {
              gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
          },
        },
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      const productStats = {};
      orderItems.forEach(item => {
        const pid = item.product.id;
        if (!productStats[pid]) {
          productStats[pid] = {
            id: pid,
            name: item.product.name,
            price: item.product.price,
            totalSold: 0,
          };
        }
        productStats[pid].totalSold += item.quantity;
      });

      const result = Object.values(productStats)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("🔥 Best-selling products error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu sản phẩm bán chạy" });
    }
  }

  // === Top khách hàng mua nhiều ===
  async getTopCustomers(req, res) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: "paid",
          createdAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
        select: {
          totalAmount: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const customerStats = {};
      orders.forEach(order => {
        const uid = order.user.id;
        if (!customerStats[uid]) {
          customerStats[uid] = {
            id: uid,
            name: order.user.name,
            email: order.user.email,
            totalSpent: 0,
            totalOrders: 0,
          };
        }
        customerStats[uid].totalSpent += order.totalAmount;
        customerStats[uid].totalOrders += 1;
      });

      const result = Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("🔥 Top customers error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu khách hàng" });
    }
  }
}

export default new DashboardController();
