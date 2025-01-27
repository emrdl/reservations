const { connectDB, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // Kullanıcı girişi
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const pool = await connectDB();

            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT * FROM Users WHERE Email = @email');

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Giriş başarısız' });
            }

            const user = result.recordset[0];
            const isMatch = await bcrypt.compare(password, user.Password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Giriş başarısız' });
            }

            const token = jwt.sign(
                { id: user.UserID },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.UserID,
                    username: user.Username,
                    email: user.Email,
                    role: user.Role
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Kullanıcı kaydı
    register: async (req, res) => {
        try {
            const { username, email, password, role = 'Customer' } = req.body;
            const pool = await connectDB();

            // Email ve kullanıcı adı kontrolü
            const checkUser = await pool.request()
                .input('email', sql.NVarChar, email)
                .input('username', sql.NVarChar, username)
                .query('SELECT UserID FROM Users WHERE Email = @email OR Username = @username');

            if (checkUser.recordset.length > 0) {
                return res.status(400).json({ message: 'Bu email veya kullanıcı adı zaten kullanımda' });
            }

            // Şifre hashleme
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, hashedPassword)
                .input('role', sql.NVarChar, role)
                .query(`
                    INSERT INTO Users (Username, Email, Password, Role)
                    OUTPUT INSERTED.*
                    VALUES (@username, @email, @password, @role)
                `);

            const user = result.recordset[0];
            const token = jwt.sign(
                { id: user.UserID },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user.UserID,
                    username: user.Username,
                    email: user.Email,
                    role: user.Role
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Kullanıcı bilgilerini getir
    getProfile: async (req, res) => {
        try {
            const user = req.user;
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController; 