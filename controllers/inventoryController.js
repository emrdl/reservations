const InventoryService = require('../services/inventoryService');
const { connectDB, sql } = require('../config/database');

class InventoryController {
    constructor(websocketService) {
        this.inventoryService = new InventoryService(websocketService);
    }

    // Malzeme listesi
    getIngredients = async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        i.*,
                        u.Name as UnitName,
                        u.Symbol as UnitSymbol,
                        CASE 
                            WHEN i.CurrentStock <= i.MinimumStock THEN 1 
                            ELSE 0 
                        END as IsLowStock
                    FROM Ingredients i
                    JOIN Units u ON i.UnitID = u.UnitID
                    ORDER BY i.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Düşük stok malzemeleri
    getLowStockIngredients = async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        i.*,
                        u.Name as UnitName,
                        u.Symbol as UnitSymbol
                    FROM Ingredients i
                    JOIN Units u ON i.UnitID = u.UnitID
                    WHERE i.CurrentStock <= i.MinimumStock
                    ORDER BY i.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Stok hareketi oluştur
    createStockMovement = async (req, res) => {
        try {
            const movementData = {
                ...req.body,
                userId: req.user.UserID
            };
            const movement = await this.inventoryService.createStockMovement(movementData);
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Stok hareketleri geçmişi
    getStockMovements = async (req, res) => {
        try {
            const { ingredientId, startDate, endDate, type } = req.query;
            const pool = await connectDB();
            
            let query = `
                SELECT 
                    sm.*,
                    i.Name as IngredientName,
                    u.Username as CreatedByUser
                FROM StockMovements sm
                JOIN Ingredients i ON sm.IngredientID = i.IngredientID
                JOIN Users u ON sm.CreatedBy = u.UserID
                WHERE 1=1
            `;

            const queryParams = [];
            if (ingredientId) {
                query += ` AND sm.IngredientID = @ingredientId`;
                queryParams.push({ name: 'ingredientId', value: ingredientId, type: sql.Int });
            }
            if (startDate) {
                query += ` AND sm.CreatedAt >= @startDate`;
                queryParams.push({ name: 'startDate', value: new Date(startDate), type: sql.DateTime });
            }
            if (endDate) {
                query += ` AND sm.CreatedAt <= @endDate`;
                queryParams.push({ name: 'endDate', value: new Date(endDate), type: sql.DateTime });
            }
            if (type) {
                query += ` AND sm.Type = @type`;
                queryParams.push({ name: 'type', value: type, type: sql.NVarChar });
            }

            query += ` ORDER BY sm.CreatedAt DESC`;

            const request = pool.request();
            queryParams.forEach(param => {
                request.input(param.name, param.type, param.value);
            });

            const result = await request.query(query);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = InventoryController; 