const { connectDB, sql } = require('../config/database');

class SupplierController {
    // Tedarikçi listesi
    getAllSuppliers = async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        s.*,
                        (SELECT COUNT(*) FROM PurchaseOrders WHERE SupplierID = s.SupplierID) as OrderCount,
                        (SELECT SUM(TotalAmount) FROM PurchaseOrders WHERE SupplierID = s.SupplierID) as TotalPurchases
                    FROM Suppliers s
                    ORDER BY s.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Tedarikçi detayı
    getSupplierById = async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        s.*,
                        JSON_QUERY((
                            SELECT TOP 10 *
                            FROM PurchaseOrders
                            WHERE SupplierID = s.SupplierID
                            ORDER BY OrderDate DESC
                            FOR JSON PATH
                        )) as RecentOrders
                    FROM Suppliers s
                    WHERE s.SupplierID = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
            }

            const supplier = {
                ...result.recordset[0],
                RecentOrders: JSON.parse(result.recordset[0].RecentOrders || '[]')
            };

            res.json(supplier);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Yeni tedarikçi ekle
    createSupplier = async (req, res) => {
        try {
            const {
                name,
                contactPerson,
                email,
                phone,
                address
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('contactPerson', sql.NVarChar, contactPerson)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('address', sql.NVarChar, address)
                .query(`
                    INSERT INTO Suppliers (
                        Name, ContactPerson, Email,
                        Phone, Address
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @name, @contactPerson, @email,
                        @phone, @address
                    )
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Tedarikçi güncelle
    updateSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                contactPerson,
                email,
                phone,
                address
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('contactPerson', sql.NVarChar, contactPerson)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('address', sql.NVarChar, address)
                .query(`
                    UPDATE Suppliers
                    SET Name = @name,
                        ContactPerson = @contactPerson,
                        Email = @email,
                        Phone = @phone,
                        Address = @address,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE SupplierID = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Tedarikçi sil
    deleteSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Önce tedarikçiye ait siparişleri kontrol et
            const checkOrders = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT COUNT(*) as OrderCount
                    FROM PurchaseOrders
                    WHERE SupplierID = @id
                `);

            if (checkOrders.recordset[0].OrderCount > 0) {
                return res.status(400).json({
                    error: 'Bu tedarikçiye ait siparişler olduğu için silinemez'
                });
            }

            // Tedarikçiyi sil
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    DELETE FROM Suppliers
                    WHERE SupplierID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = SupplierController; 