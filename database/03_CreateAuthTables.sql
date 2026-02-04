-- =============================================
-- Script 03: Tablas de Autenticación y Autorización
-- ProcBridge - Security & Identity
-- =============================================

USE ProcBridgeDB;
GO

-- =============================================
-- 1. Tabla de Roles
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        RoleName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    
    PRINT '✅ Tabla [Roles] creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Tabla [Roles] ya existe';
END
GO

-- =============================================
-- 2. Tabla de Usuarios
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Email NVARCHAR(256) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        LastLoginAt DATETIME2 NULL,
        
        -- Índices
        INDEX IX_Users_Email (Email),
        INDEX IX_Users_IsActive (IsActive)
    );
    
    PRINT '✅ Tabla [Users] creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Tabla [Users] ya existe';
END
GO

-- =============================================
-- 3. Tabla de Relación Usuario-Roles (Many-to-Many)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE UserRoles (
        UserId UNIQUEIDENTIFIER NOT NULL,
        RoleId UNIQUEIDENTIFIER NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        PRIMARY KEY (UserId, RoleId),
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
    );
    
    PRINT '✅ Tabla [UserRoles] creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Tabla [UserRoles] ya existe';
END
GO

-- =============================================
-- 4. Tabla de Refresh Tokens
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
    CREATE TABLE RefreshTokens (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Token NVARCHAR(256) NOT NULL UNIQUE,
        UserId UNIQUEIDENTIFIER NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        RevokedAt DATETIME2 NULL,
        IsRevoked AS CASE WHEN RevokedAt IS NOT NULL THEN 1 ELSE 0 END,
        
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        INDEX IX_RefreshTokens_Token (Token),
        INDEX IX_RefreshTokens_UserId (UserId)
    );
    
    PRINT '✅ Tabla [RefreshTokens] creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Tabla [RefreshTokens] ya existe';
END
GO

-- =============================================
-- 5. Seed Data - Roles Predeterminados
-- =============================================
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Admin')
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES
        ('Admin', 'Administrador del sistema con acceso total'),
        ('User', 'Usuario estándar con acceso a funcionalidades básicas'),
        ('Viewer', 'Solo visualización, sin permisos de ejecución');
    
    PRINT '✅ Roles predeterminados insertados';
END
ELSE
BEGIN
    PRINT '⚠️ Roles ya existen';
END
GO

-- =============================================
-- 6. Usuario Admin Inicial
-- Password: Admin123! (BCrypt hash)
-- =============================================
DECLARE @AdminRoleId UNIQUEIDENTIFIER;
DECLARE @AdminUserId UNIQUEIDENTIFIER;

SELECT @AdminRoleId = Id FROM Roles WHERE RoleName = 'Admin';

IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin@procbridge.local')
BEGIN
    -- BCrypt hash para "Admin123!"
    -- Este hash es temporal, se debería cambiar en producción
    SET @AdminUserId = NEWID();
    
    INSERT INTO Users (Id, Email, PasswordHash, FullName, IsActive)
    VALUES (
        @AdminUserId,
        'admin@procbridge.local',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.K0p9/2', -- Admin123!
        'Administrator',
        1
    );
    
    -- Asignar rol de Admin
    INSERT INTO UserRoles (UserId, RoleId)
    VALUES (@AdminUserId, @AdminRoleId);
    
    PRINT '✅ Usuario admin creado exitosamente';
    PRINT '   Email: admin@procbridge.local';
    PRINT '   Password: Admin123!';
    PRINT '   ⚠️ CAMBIAR PASSWORD EN PRODUCCIÓN ⚠️';
END
ELSE
BEGIN
    PRINT '⚠️ Usuario admin ya existe';
END
GO

-- =============================================
-- 7. Usuario de Prueba (User Role)
-- Password: User123!
-- =============================================
DECLARE @UserRoleId UNIQUEIDENTIFIER;
DECLARE @TestUserId UNIQUEIDENTIFIER;

SELECT @UserRoleId = Id FROM Roles WHERE RoleName = 'User';

IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'user@procbridge.local')
BEGIN
    SET @TestUserId = NEWID();
    
    INSERT INTO Users (Id, Email, PasswordHash, FullName, IsActive)
    VALUES (
        @TestUserId,
        'user@procbridge.local',
        '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- User123!
        'Test User',
        1
    );
    
    INSERT INTO UserRoles (UserId, RoleId)
    VALUES (@TestUserId, @UserRoleId);
    
    PRINT '✅ Usuario de prueba creado exitosamente';
    PRINT '   Email: user@procbridge.local';
    PRINT '   Password: User123!';
END
ELSE
BEGIN
    PRINT '⚠️ Usuario de prueba ya existe';
END
GO

-- =============================================
-- RESUMEN
-- =============================================
PRINT '';
PRINT '========================================';
PRINT '✅ Script de autenticación completado';
PRINT '========================================';
PRINT '';
PRINT 'Tablas creadas:';
PRINT '  - Roles';
PRINT '  - Users';
PRINT '  - UserRoles';
PRINT '  - RefreshTokens';
PRINT '';
PRINT 'Usuarios de prueba:';
PRINT '  Admin: admin@procbridge.local / Admin123!';
PRINT '  User:  user@procbridge.local / User123!';
PRINT '';
GO
