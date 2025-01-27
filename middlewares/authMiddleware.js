const jwt = require('jsonwebtoken');
const { connectDB, sql } = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme başarısız' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pool = await connectDB();
        
        const result = await pool.request()
            .input('id', sql.Int, decoded.id)
            .query('SELECT UserID, Username, Email, Role FROM Users WHERE UserID = @id');

        if (result.recordset.length === 0) {
            throw new Error();
        }

        req.user = result.recordset[0];
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Lütfen giriş yapın' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        if (req.user.Role !== 'Admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
};

module.exports = { auth, adminAuth }; 