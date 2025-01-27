const { connectDB, sql } = require('../config/database');

const settingsController = {
    // Tüm ayarları getir
    getAllSettings: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT *
                    FROM Settings
                    ORDER BY SettingGroup, SettingKey
                `);
            
            // Ayarları gruplandır
            const groupedSettings = result.recordset.reduce((acc, setting) => {
                const group = setting.SettingGroup || 'General';
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push(setting);
                return acc;
            }, {});

            res.json(groupedSettings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Belirli bir ayarı getir
    getSettingByKey: async (req, res) => {
        try {
            const { key } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('key', sql.NVarChar, key)
                .query(`
                    SELECT *
                    FROM Settings
                    WHERE SettingKey = @key
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Ayar bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ayar güncelle veya oluştur
    updateSetting: async (req, res) => {
        try {
            const { key } = req.params;
            const { value, group, description } = req.body;

            const pool = await connectDB();
            
            // Önce ayarın var olup olmadığını kontrol et
            const checkResult = await pool.request()
                .input('key', sql.NVarChar, key)
                .query('SELECT SettingID FROM Settings WHERE SettingKey = @key');

            let result;
            if (checkResult.recordset.length > 0) {
                // Güncelle
                result = await pool.request()
                    .input('key', sql.NVarChar, key)
                    .input('value', sql.NVarChar, value)
                    .input('group', sql.NVarChar, group)
                    .input('description', sql.NVarChar, description)
                    .query(`
                        UPDATE Settings
                        SET SettingValue = @value,
                            SettingGroup = @group,
                            Description = @description,
                            UpdatedAt = GETDATE()
                        OUTPUT INSERTED.*
                        WHERE SettingKey = @key
                    `);
            } else {
                // Yeni ayar oluştur
                result = await pool.request()
                    .input('key', sql.NVarChar, key)
                    .input('value', sql.NVarChar, value)
                    .input('group', sql.NVarChar, group)
                    .input('description', sql.NVarChar, description)
                    .query(`
                        INSERT INTO Settings (SettingKey, SettingValue, SettingGroup, Description)
                        OUTPUT INSERTED.*
                        VALUES (@key, @value, @group, @description)
                    `);
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = settingsController; 