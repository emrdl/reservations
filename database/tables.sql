-- Restoran Bölgeleri Tablosu
CREATE TABLE Sections (
    SectionID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    ColorCode NVARCHAR(20) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
)

-- Masa Durumları Tablosu (Enum yerine)
CREATE TABLE TableStatuses (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(100)
)

-- Masalar Tablosu
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
)

-- Örnek veriler
INSERT INTO Sections (Name, ColorCode) VALUES 
('VIP', '#8B5CF6'),
('ANA SALON', '#3B82F6'),
('BAHÇE', '#10B981'),
('TERAS', '#34D399'),
('BALKON', '#6EE7B7')

INSERT INTO TableStatuses (Name, Description) VALUES
('EMPTY', 'Masa boş'),
('RESERVED', 'Masa rezerve edilmiş'),
('OCCUPIED', 'Masa dolu') 