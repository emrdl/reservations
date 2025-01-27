-- RestaurantManagementSystem veritabanını oluştur
CREATE DATABASE RestaurantManagementSystem;
GO

USE RestaurantManagementSystem;
GO

-- Kullanıcılar tablosu
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Role NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Kategoriler tablosu
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Ürünler tablosu
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Price DECIMAL(10,2) NOT NULL,
    IsAvailable BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Masalar tablosu
CREATE TABLE Tables (
    TableID INT IDENTITY(1,1) PRIMARY KEY,
    TableNumber NVARCHAR(10) NOT NULL UNIQUE,
    Capacity INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Available'
);

-- Siparişler tablosu
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    TableID INT FOREIGN KEY REFERENCES Tables(TableID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    OrderStatus NVARCHAR(20) NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    KitchenStatus NVARCHAR(20) DEFAULT 'Pending',
    KitchenNotes NVARCHAR(MAX),
    EstimatedPrepTime INT
);

-- Sipariş detayları tablosu
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    MenuItemID INT FOREIGN KEY REFERENCES MenuItems(MenuItemID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL
);

-- Müşteri sadakat programı tablosu
CREATE TABLE LoyaltyProgram (
    LoyaltyID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL UNIQUE,
    Points INT DEFAULT 0,
    MembershipLevel NVARCHAR(20) DEFAULT 'Bronze',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Sadakat programı için gerekli tablolar
CREATE TABLE LoyaltyPrograms (
    LoyaltyProgramID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    PointsPerPurchase DECIMAL(10,2) DEFAULT 1.0,
    MinPointsForReward INT DEFAULT 100,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE CustomerLoyalty (
    CustomerLoyaltyID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT FOREIGN KEY REFERENCES Users(UserID),
    CurrentPoints DECIMAL(10,2) DEFAULT 0,
    TotalPointsEarned DECIMAL(10,2) DEFAULT 0,
    TotalPointsSpent DECIMAL(10,2) DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE LoyaltyTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT FOREIGN KEY REFERENCES Users(UserID),
    Points DECIMAL(10,2) NOT NULL,
    TransactionType NVARCHAR(20) NOT NULL, -- 'EARN' veya 'SPEND'
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Personel tablosu
CREATE TABLE Staff (
    StaffID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(255),
    Position NVARCHAR(50) NOT NULL,
    Salary DECIMAL(10,2),
    HireDate DATE NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Vardiya tablosu
CREATE TABLE Shifts (
    ShiftID INT IDENTITY(1,1) PRIMARY KEY,
    StaffID INT FOREIGN KEY REFERENCES Staff(StaffID),
    ShiftDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Scheduled',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Ayarlar tablosu
CREATE TABLE Settings (
    SettingID INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(50) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX),
    SettingGroup NVARCHAR(50),
    Description NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Bildirimler tablosu
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(100) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(20) NOT NULL DEFAULT 'INFO',
    ReadAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bildirim indeksleri
CREATE INDEX IX_Notifications_UserID ON Notifications(UserID);
CREATE INDEX IX_Notifications_ReadAt ON Notifications(ReadAt) WHERE ReadAt IS NULL;

-- Rezervasyonlar tablosu
CREATE TABLE Reservations (
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT FOREIGN KEY REFERENCES Users(UserID),
    TableID INT FOREIGN KEY REFERENCES Tables(TableID),
    ReservationDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    GuestCount INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending', -- Pending, Confirmed, Cancelled, Completed
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Rezervasyon geçmişi tablosu
CREATE TABLE ReservationHistory (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    ReservationID INT FOREIGN KEY REFERENCES Reservations(ReservationID),
    OldStatus NVARCHAR(20) NOT NULL,
    NewStatus NVARCHAR(20) NOT NULL,
    ChangedBy INT FOREIGN KEY REFERENCES Users(UserID),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Rezervasyon indeksleri
CREATE INDEX IX_Reservations_Date ON Reservations(ReservationDate, StartTime);
CREATE INDEX IX_Reservations_Customer ON Reservations(CustomerID);
CREATE INDEX IX_Reservations_Status ON Reservations(Status);

-- Stok birimleri tablosu
CREATE TABLE Units (
    UnitID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Symbol NVARCHAR(10) NOT NULL
);

-- Malzemeler tablosu
CREATE TABLE Ingredients (
	IngredientID INT PRIMARY KEY IDENTITY(1,1),
	Name NVARCHAR(50) NOT NULL,
	UnitID int NULL,
	MinimumStock decimal(10, 2) DEFAULT 0.00,
	CurrentStock decimal(10, 2) DEFAULT 0.00,
	Cost decimal(10, 2) DEFAULT 0.00,
	Description NVARCHAR(200),
	CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME
);

-- Stok hareketleri tablosu
CREATE TABLE StockMovements (
    MovementID INT IDENTITY(1,1) PRIMARY KEY,
    IngredientID INT FOREIGN KEY REFERENCES Ingredients(IngredientID),
    Type NVARCHAR(20) NOT NULL, -- IN, OUT, ADJUSTMENT
    Quantity DECIMAL(10,2) NOT NULL,
    PreviousStock DECIMAL(10,2) NOT NULL,
    NewStock DECIMAL(10,2) NOT NULL,
    UnitCost DECIMAL(10,2),
    TotalCost DECIMAL(10,2),
    Notes NVARCHAR(MAX),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Ürün-Malzeme ilişki tablosu
CREATE TABLE ProductIngredients (
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    IngredientID INT FOREIGN KEY REFERENCES Ingredients(IngredientID),
    Quantity DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (ProductID, IngredientID)
);

-- Tedarikçiler tablosu
CREATE TABLE Suppliers (
    SupplierID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    ContactPerson NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Satın alma siparişleri tablosu
CREATE TABLE PurchaseOrders (
    PurchaseOrderID INT IDENTITY(1,1) PRIMARY KEY,
    SupplierID INT FOREIGN KEY REFERENCES Suppliers(SupplierID),
    OrderDate DATETIME NOT NULL,
    DeliveryDate DATETIME,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Delivered, Cancelled
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    Notes NVARCHAR(MAX),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Satın alma sipariş detayları tablosu
CREATE TABLE PurchaseOrderDetails (
    PurchaseOrderID INT FOREIGN KEY REFERENCES PurchaseOrders(PurchaseOrderID),
    IngredientID INT FOREIGN KEY REFERENCES Ingredients(IngredientID),
    Quantity DECIMAL(10,2) NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    ReceivedQuantity DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (PurchaseOrderID, IngredientID)
);

-- İndeksler
CREATE INDEX IX_Ingredients_MinStock ON Ingredients(MinimumStock);
CREATE INDEX IX_Ingredients_CurrentStock ON Ingredients(CurrentStock);
CREATE INDEX IX_StockMovements_Date ON StockMovements(CreatedAt);
CREATE INDEX IX_PurchaseOrders_Status ON PurchaseOrders(Status);

-- Ödemeler tablosu
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(20) NOT NULL, -- CASH, CREDIT_CARD, DEBIT_CARD
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Failed, Refunded
    TransactionID NVARCHAR(100),
    Notes NVARCHAR(MAX),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- İade tablosu
CREATE TABLE Refunds (
    RefundID INT IDENTITY(1,1) PRIMARY KEY,
    PaymentID INT FOREIGN KEY REFERENCES Payments(PaymentID),
    Amount DECIMAL(10,2) NOT NULL,
    Reason NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Rejected
    ProcessedBy INT FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- İndirimler tablosu
CREATE TABLE Discounts (
    DiscountID INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) UNIQUE,
    Description NVARCHAR(255),
    DiscountType NVARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT
    Value DECIMAL(10,2) NOT NULL,
    MinimumOrderAmount DECIMAL(10,2) DEFAULT 0,
    StartDate DATETIME,
    EndDate DATETIME,
    MaxUsageCount INT,
    CurrentUsageCount INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Sipariş-İndirim ilişki tablosu
CREATE TABLE OrderDiscounts (
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    DiscountID INT FOREIGN KEY REFERENCES Discounts(DiscountID),
    DiscountAmount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (OrderID, DiscountID)
);

-- İndeksler
CREATE INDEX IX_Payments_OrderID ON Payments(OrderID);
CREATE INDEX IX_Payments_Status ON Payments(Status);
CREATE INDEX IX_Refunds_PaymentID ON Refunds(PaymentID);
CREATE INDEX IX_Discounts_Code ON Discounts(Code);
CREATE INDEX IX_Discounts_Active_Date ON Discounts(IsActive, StartDate, EndDate);

-- Push Notification Subscriptions tablosu
CREATE TABLE PushSubscriptions (
    SubscriptionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Endpoint NVARCHAR(500) NOT NULL,
    P256dh NVARCHAR(255) NOT NULL,
    Auth NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE INDEX IX_PushSubscriptions_UserID ON PushSubscriptions(UserID);
CREATE UNIQUE INDEX IX_PushSubscriptions_Endpoint ON PushSubscriptions(Endpoint);

CREATE TABLE MenuItems (
    MenuItemID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10,2) NOT NULL,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    ImageURL NVARCHAR(255),
    IsAvailable BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    PrepTime INT, -- Hazırlanma süresi (dakika)
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Menü Malzemeleri (garnitür, ekstra malzemeler vb.) tablosu
CREATE TABLE MenuAdditions (
    AdditionID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(200),
    Price DECIMAL(10,2) DEFAULT 0.00, -- Ekstra ücret
    IsAvailable BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    GroupID INT,
    FOREIGN KEY (GroupID) REFERENCES AdditionGroups(GroupID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Ekstra Malzeme Grupları tablosu
CREATE TABLE AdditionGroups (
    GroupID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    SelectionType VARCHAR(20) DEFAULT 'SINGLE',
    IsRequired BIT NOT NULL DEFAULT 0,
    MinSelect INT NOT NULL DEFAULT 0,
    MaxSelect INT NOT NULL DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Restoran Bölgeleri Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sections')
BEGIN
    CREATE TABLE Sections (
        SectionID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        ColorCode NVARCHAR(20) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );

    -- Örnek bölge verileri
    INSERT INTO Sections (Name, ColorCode) VALUES 
    ('VIP', '#8B5CF6'),
    ('ANA SALON', '#3B82F6'),
    ('BAHÇE', '#10B981'),
    ('TERAS', '#34D399'),
    ('BALKON', '#6EE7B7');
END

-- Masa Durumları Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TableStatuses')
BEGIN
    CREATE TABLE TableStatuses (
        StatusID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        Description NVARCHAR(100)
    );

    -- Örnek durum verileri
    INSERT INTO TableStatuses (Name, Description) VALUES
    ('EMPTY', 'Masa boş'),
    ('RESERVED', 'Masa rezerve edilmiş'),
    ('OCCUPIED', 'Masa dolu');
END

-- Masalar Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tables')
BEGIN
    CREATE TABLE Tables (
        TableID INT IDENTITY(1,1) PRIMARY KEY,
        Number INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Capacity INT NOT NULL,
        SectionID INT FOREIGN KEY REFERENCES Sections(SectionID),
        StatusID INT FOREIGN KEY REFERENCES TableStatuses(StatusID),
        PositionX INT NOT NULL,
        PositionY INT NOT NULL,
        IsAvailable BIT DEFAULT 1,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
