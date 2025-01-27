const validate = {
    // Sipariş validasyonu
    order: (req, res, next) => {
        const { tableId, products } = req.body;

        if (!tableId || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: 'Geçersiz sipariş verisi'
            });
        }

        for (const product of products) {
            if (!product.productId || !product.quantity || product.quantity < 1) {
                return res.status(400).json({
                    message: 'Geçersiz ürün verisi'
                });
            }
        }

        next();
    },

    // Kullanıcı validasyonu
    user: (req, res, next) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Tüm alanlar zorunludur'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Şifre en az 6 karakter olmalıdır'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Geçersiz email formatı'
            });
        }

        next();
    },

    // Masa validasyonu
    table: (req, res, next) => {
        const { tableNumber, capacity } = req.body;

        if (!tableNumber || !capacity) {
            return res.status(400).json({
                message: 'Masa numarası ve kapasite zorunludur'
            });
        }

        if (capacity < 1) {
            return res.status(400).json({
                message: 'Kapasite 1\'den küçük olamaz'
            });
        }

        next();
    }
};

module.exports = validate; 