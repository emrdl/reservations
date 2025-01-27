const bcrypt = require('bcryptjs');

const helpers = {
    // Şifre hashleme
    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    },

    // Tarih formatlama
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('tr-TR');
    },

    // Para birimi formatlama
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    },

    // Sipariş durumu çevirisi
    translateOrderStatus: (status) => {
        const statusMap = {
            'Pending': 'Beklemede',
            'In Progress': 'Hazırlanıyor',
            'Ready': 'Hazır',
            'Completed': 'Tamamlandı',
            'Cancelled': 'İptal Edildi'
        };
        return statusMap[status] || status;
    }
};

module.exports = helpers; 