const express = require('express');
const router = express.Router();
const { connectDB, sql } = require('../config/database');
const loyaltyController = require('../controllers/loyaltyController');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const staffController = require('../controllers/staffController');
const shiftController = require('../controllers/shiftController');
const kitchenController = require('../controllers/kitchenController');
const settingsController = require('../controllers/settingsController');
const categoriesController = require('../controllers/categoriesController');
const menuController = require('../controllers/menuController');
const tablesController = require('../controllers/tablesController');
const customersController = require('../controllers/customersController');
const authController = require('../controllers/authController');
const ReservationController = require('../controllers/reservationController');
const InventoryController = require('../controllers/inventoryController');
const PurchaseOrderController = require('../controllers/purchaseOrderController');
const SupplierController = require('../controllers/supplierController');
const ReportController = require('../controllers/reportController');
const AnalyticsController = require('../controllers/analyticsController');
const PaymentController = require('../controllers/paymentController');
const DiscountController = require('../controllers/discountController');
const PushNotificationController = require('../controllers/pushNotificationController');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */

// Ürünleri getir
router.get('/products', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sipariş oluştur
router.post('/orders', async (req, res) => {
    try {
        const { tableId, userId, products } = req.body;
        const pool = await connectDB();
        
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            // Ana sipariş kaydı
            const orderResult = await transaction.request()
                .input('tableId', sql.Int, tableId)
                .input('userId', sql.Int, userId)
                .input('status', sql.NVarChar, 'Pending')
                .input('totalAmount', sql.Decimal, 0)
                .query(`
                    INSERT INTO Orders (TableID, UserID, OrderStatus, TotalAmount)
                    OUTPUT INSERTED.OrderID
                    VALUES (@tableId, @userId, @status, @totalAmount)
                `);

            const orderId = orderResult.recordset[0].OrderID;

            // Sipariş detaylarını ekle
            let totalAmount = 0;
            for (const product of products) {
                const detailResult = await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('productId', sql.Int, product.productId)
                    .input('quantity', sql.Int, product.quantity)
                    .input('unitPrice', sql.Decimal, product.price)
                    .input('subTotal', sql.Decimal, product.price * product.quantity)
                    .query(`
                        INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, SubTotal)
                        VALUES (@orderId, @productId, @quantity, @unitPrice, @subTotal)
                    `);
                
                totalAmount += product.price * product.quantity;
            }

            // Toplam tutarı güncelle
            await transaction.request()
                .input('orderId', sql.Int, orderId)
                .input('totalAmount', sql.Decimal, totalAmount)
                .query(`
                    UPDATE Orders 
                    SET TotalAmount = @totalAmount
                    WHERE OrderID = @orderId
                `);

            await transaction.commit();
            res.json({ success: true, orderId });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sadakat Programı Routes
router.get('/loyalty/program', auth, loyaltyController.getProgramDetails);
router.post('/loyalty/program', auth, adminAuth, loyaltyController.updateProgram);
router.get('/loyalty/points/:customerId', auth, loyaltyController.getCustomerPoints);
router.post('/loyalty/redeem', auth, loyaltyController.redeemPoints);

// Staff (Personel) Routes
router.get('/staff', auth, adminAuth, staffController.getAllStaff);
router.get('/staff/:id', auth, adminAuth, staffController.getStaffById);
router.post('/staff', auth, adminAuth, staffController.createStaff);
router.put('/staff/:id', auth, adminAuth, staffController.updateStaff);
router.delete('/staff/:id', auth, adminAuth, staffController.deleteStaff);

// Shifts (Vardiya) Routes
router.get('/shifts', auth, adminAuth, shiftController.getAllShifts);
router.post('/shifts', auth, adminAuth, shiftController.createShift);
router.put('/shifts/:id', auth, adminAuth, shiftController.updateShift);
router.delete('/shifts/:id', auth, adminAuth, shiftController.deleteShift);

// Kitchen (Mutfak) Routes
router.get('/kitchen/orders', auth, kitchenController.getPendingOrders);
router.put('/kitchen/orders/:id/status', auth, kitchenController.updateOrderStatus);
router.put('/kitchen/orders/:id/prep-time', auth, kitchenController.updatePrepTime);

// Settings Routes
router.get('/settings', auth, adminAuth, settingsController.getAllSettings);
router.get('/settings/:key', auth, adminAuth, settingsController.getSettingByKey);
router.put('/settings/:key', auth, adminAuth, settingsController.updateSetting);

// Categories Routes
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', auth, adminAuth, categoriesController.createCategory);
router.put('/categories/:id', auth, adminAuth, categoriesController.updateCategory);
router.delete('/categories/:id', auth, adminAuth, categoriesController.deleteCategory);

// Menu Routes
router.get('/menu', menuController.getFullMenu);
router.get('/menu/category/:categoryId', menuController.getMenuByCategory);
router.post('/menu/item', auth, adminAuth, menuController.createMenuItem);
router.put('/menu/item/:id', auth, adminAuth, menuController.updateMenuItem);
router.delete('/menu/item/:id', auth, adminAuth, menuController.deleteMenuItem);

// Tables Routes
router.get('/tables', auth, tablesController.getAllTables);
router.post('/tables', auth, adminAuth, tablesController.createTable);
router.put('/tables/:id', auth, adminAuth, tablesController.updateTable);
router.put('/tables/:id/status', auth, tablesController.updateTableStatus);
router.delete('/tables/:id', auth, adminAuth, tablesController.deleteTable);

// Customers Routes
router.get('/customers', auth, adminAuth, customersController.getAllCustomers);
router.get('/customers/:id', auth, adminAuth, customersController.getCustomerById);
router.put('/customers/:id', auth, adminAuth, customersController.updateCustomer);
router.delete('/customers/:id', auth, adminAuth, customersController.deleteCustomer);

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/profile', auth, authController.getProfile);

// Reservation controller'ı başlat
const reservationController = new ReservationController(app.get('wss'));

// Rezervasyon Routes
router.post('/reservations', auth, reservationController.createReservation);
router.put('/reservations/:id/status', auth, adminAuth, reservationController.updateStatus);
router.get('/reservations/customer', auth, reservationController.getCustomerReservations);
router.get('/reservations/date-range', auth, adminAuth, reservationController.getReservationsByDateRange);
router.get('/reservations/table/:tableId', auth, reservationController.getTableReservations);
router.post('/reservations/:id/cancel', auth, reservationController.cancelReservation);

// Inventory controller'ı başlat
const inventoryController = new InventoryController(app.get('wss'));

// Inventory Routes
router.get('/inventory/ingredients', auth, inventoryController.getIngredients);
router.get('/inventory/low-stock', auth, inventoryController.getLowStockIngredients);
router.post('/inventory/movements', auth, adminAuth, inventoryController.createStockMovement);
router.get('/inventory/movements', auth, inventoryController.getStockMovements);

// Controller'ları başlat
const purchaseOrderController = new PurchaseOrderController(app.get('wss'));
const supplierController = new SupplierController();

// Purchase Order Routes
router.get('/purchase-orders', auth, adminAuth, purchaseOrderController.getOrders);
router.post('/purchase-orders', auth, adminAuth, purchaseOrderController.createOrder);
router.post('/purchase-orders/:id/receive', auth, adminAuth, purchaseOrderController.receiveOrder);

// Supplier Routes
router.get('/suppliers', auth, supplierController.getAllSuppliers);
router.get('/suppliers/:id', auth, supplierController.getSupplierById);
router.post('/suppliers', auth, adminAuth, supplierController.createSupplier);
router.put('/suppliers/:id', auth, adminAuth, supplierController.updateSupplier);
router.delete('/suppliers/:id', auth, adminAuth, supplierController.deleteSupplier);

// Report controller'ı başlat
const reportController = new ReportController();

// Report Routes
router.get('/reports/sales', auth, adminAuth, reportController.getSalesReport);
router.get('/reports/inventory', auth, adminAuth, reportController.getInventoryReport);
router.get('/reports/summary', auth, adminAuth, reportController.getSummaryReport);

// Analytics controller'ı başlat
const analyticsController = new AnalyticsController();

// Analytics Routes
router.get('/analytics/hourly-sales', auth, adminAuth, analyticsController.getHourlySales);
router.get('/analytics/category-sales', auth, adminAuth, analyticsController.getCategorySales);
router.get('/analytics/table-performance', auth, adminAuth, analyticsController.getTablePerformance);
router.get('/analytics/staff-performance', auth, adminAuth, analyticsController.getStaffPerformance);
router.get('/analytics/trends', auth, adminAuth, analyticsController.getTrends);

// Payment controller'ı başlat
const paymentController = new PaymentController(app.get('wss'));

// Payment Routes
router.post('/payments', auth, paymentController.createPayment);
router.post('/payments/refund', auth, adminAuth, paymentController.createRefund);
router.get('/payments/order/:orderId', auth, paymentController.getOrderPayments);
router.post('/orders/:orderId/discount', auth, paymentController.applyDiscount);

// Discount controller'ı başlat
const discountController = new DiscountController();

// Discount Routes
router.post('/discounts', auth, adminAuth, discountController.createDiscount);
router.put('/discounts/:id', auth, adminAuth, discountController.updateDiscount);
router.post('/discounts/validate', auth, discountController.validateDiscount);
router.get('/discounts/:id/stats', auth, adminAuth, discountController.getDiscountStats);

// Push Notification controller'ı başlat
const pushNotificationController = new PushNotificationController();

// Push Notification Routes
router.get('/push/public-key', auth, pushNotificationController.getPublicKey);
router.post('/push/subscribe', auth, pushNotificationController.subscribe);
router.post('/push/unsubscribe', auth, pushNotificationController.unsubscribe);
router.post('/push/test', auth, pushNotificationController.sendTestNotification);
router.post('/push/broadcast', auth, adminAuth, pushNotificationController.broadcastNotification);

module.exports = router; 