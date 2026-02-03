-- =====================================================
-- ProcBridge Database Setup
-- Script 02: Seed Data
-- =====================================================

USE ProcBridgeDB;
GO

-- =====================================================
-- Crear Stored Procedures de ejemplo
-- =====================================================

-- SP 1: sp_echo - Devuelve un mensaje
IF OBJECT_ID('sp_echo', 'P') IS NOT NULL
    DROP PROCEDURE sp_echo;
GO

CREATE PROCEDURE sp_echo
    @Message NVARCHAR(200)
AS
BEGIN
    SELECT 
        @Message AS Message,
        GETDATE() AS Timestamp,
        'ProcBridge is working!' AS Status;
END
GO

-- SP 2: sp_GetUsers - Lista usuarios (ejemplo)
IF OBJECT_ID('sp_GetUsers', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetUsers;
GO

CREATE PROCEDURE sp_GetUsers
    @Status NVARCHAR(20) = NULL
AS
BEGIN
    -- Tabla de ejemplo (en producción vendría de tu DB real)
    SELECT 
        1 AS UserId, 
        'John Doe' AS UserName, 
        'john@example.com' AS Email, 
        'Active' AS Status
    UNION ALL
    SELECT 
        2 AS UserId, 
        'Jane Smith' AS UserName, 
        'jane@example.com' AS Email, 
        'Active' AS Status
    UNION ALL
    SELECT 
        3 AS UserId, 
        'Bob Johnson' AS UserName, 
        'bob@example.com' AS Email, 
        'Inactive' AS Status;
END
GO

-- SP 3: sp_CreateOrder - Inserta una orden (ejemplo)
IF OBJECT_ID('sp_CreateOrder', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateOrder;
GO

CREATE PROCEDURE sp_CreateOrder
    @CustomerId INT,
    @ProductId INT,
    @Quantity INT
AS
BEGIN
    -- En producción, insertaría en una tabla real
    SELECT 
        NEWID() AS OrderId,
        @CustomerId AS CustomerId,
        @ProductId AS ProductId,
        @Quantity AS Quantity,
        GETDATE() AS CreatedAt,
        'Order created successfully' AS Message;
END
GO

PRINT '✅ Stored Procedures de ejemplo creados';
PRINT '';

-- =====================================================
-- Registrar SPs en el catálogo
-- =====================================================

-- Limpiar catálogo de ejemplo (si existe)
DELETE FROM ProcCatalog WHERE ProcCode LIKE 'TEST_%';

-- Registrar sp_echo
IF NOT EXISTS (SELECT * FROM ProcCatalog WHERE ProcCode = 'TEST_ECHO')
BEGIN
    INSERT INTO ProcCatalog (ProcCode, SpName, Description, RequireAuth, UseTransaction, IsActive)
    VALUES ('TEST_ECHO', 'sp_echo', 'Test SP: devuelve un mensaje', 0, 0, 1);
    
    PRINT '✅ Registrado: TEST_ECHO → sp_echo';
END

-- Registrar sp_GetUsers
IF NOT EXISTS (SELECT * FROM ProcCatalog WHERE ProcCode = 'GET_USERS')
BEGIN
    INSERT INTO ProcCatalog (ProcCode, SpName, Description, RequireAuth, UseTransaction, IsActive)
    VALUES ('GET_USERS', 'sp_GetUsers', 'Lista usuarios del sistema', 0, 0, 1);
    
    PRINT '✅ Registrado: GET_USERS → sp_GetUsers';
END

-- Registrar sp_CreateOrder
IF NOT EXISTS (SELECT * FROM ProcCatalog WHERE ProcCode = 'CREATE_ORDER')
BEGIN
    INSERT INTO ProcCatalog (ProcCode, SpName, Description, RequireAuth, UseTransaction, IsActive)
    VALUES ('CREATE_ORDER', 'sp_CreateOrder', 'Crea una nueva orden', 0, 1, 1);
    
    PRINT '✅ Registrado: CREATE_ORDER → sp_CreateOrder (con transacción)';
END

PRINT '';
PRINT '🎉 Seed data completado!';
PRINT '';
PRINT '📋 Catálogo actual:';
SELECT ProcCode, SpName, Description, RequireAuth, UseTransaction, IsActive 
FROM ProcCatalog
ORDER BY ProcCode;
GO

PRINT '';
PRINT '🚀 ¡Todo listo! Ahora puedes ejecutar el API.';
PRINT '';
PRINT '   cd backend/ProcBridge.API';
PRINT '   dotnet run';
PRINT '';
PRINT 'Swagger UI: https://localhost:5001/swagger';
GO
