const User = require("../../models/user.model");
const Order = require("../../models/order.model");

// [GET] /admin/dashboard/
module.exports.index = async (req, res) => {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)); 
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)); 

    const statistic = {
        orders: {
            todayOrders: 0,
            totalOrders: 0
        },
        amounts: {
            todayAmounts: 0,
            totalAmounts: 0
        },
        customers:{
            todayCustomer: 0,
            totalCustomer: 0
        }
    };

    // orders
    statistic.orders.todayOrders = await Order.countDocuments({
        createdAt: {
            $gte: startOfDay, 
            $lte: endOfDay    
        },
        deleted: false
    });

    statistic.orders.totalOrders = await Order.countDocuments({
        deleted: false
    });

    // End orders

    // amounts
    const orders = await Order.find({
        is_payment: true,
        deleted: false
    });
    
    statistic.amounts.totalAmounts = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const ordersToday = await Order.find({
        is_payment: true,
        deleted: false,
        createdAt: {
            $gte: startOfDay, 
            $lte: endOfDay    
        }
    });

    statistic.amounts.todayAmounts = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);
    // End amounts

    // customers
    statistic.amounts.todayCustomer = await User.countDocuments({
        createdAt: {
            $gte: startOfDay, 
            $lte: endOfDay    
        },
        deleted: false,
        status: "active"
    });

    statistic.amounts.totalCustomer = await User.countDocuments({
        deleted: false,
        status: "active"
    });
    // End customers

    // Tính doanh thu hàng tháng
    const monthlyRevenueData = await Order.aggregate([
        {
            $match: {
                is_payment: true,
                deleted: false,
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), 0, 1), 
                    $lte: new Date(new Date().getFullYear(), 11, 31) 
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" }, 
                totalRevenue: { $sum: "$totalPrice" } 
            }
        },
        {
            $sort: { _id: 1 } 
        }
    ]);

    statistic.amounts.monthlyRevenue = new Array(12).fill(0); 
    monthlyRevenueData.forEach(item => {
        statistic.amounts.monthlyRevenue[item._id - 1] = item.totalRevenue; 
    });

    
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Trang tổng quan",
        statistic: statistic
    });
}