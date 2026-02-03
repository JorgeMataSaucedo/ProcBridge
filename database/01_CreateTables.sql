-- =====================================================
-- ProcBridge Database Setup
-- Script 01: Create Tables
-- =====================================================

USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProcBridgeDB')
BEGIN
    CREATE DATABASE ProcBridgeDB;
END
GO

USE ProcBridgeDB;
GO

-- =====================================================
-- Table: ProcCatalog
-- Purpose: Catálogo de stored procedures disponibles
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcCatalog')
BEGIN
    CREATE TABLE ProcCatalog (
        ProcCatalogId INT PRIMARY KEY IDENTITY(1,1),
        
        -- Código único (identificador amigable)
        ProcCode NVARCHAR(50) UNIQUE NOT NULL,
        
        -- Nombre real del SP en SQL Server
        SpName NVARCHAR(100) NOT NULL,
        
        -- Descripción
        Description NVARCHAR(500) NULL,
        
        -- ¿Requiere autenticación?
        RequireAuth BIT NOT NULL DEFAULT 0,
        
        -- Roles permitidos (separados por coma)
        AllowedRoles NVARCHAR(200) NULL,
        
        -- ¿Usa transacción?
        UseTransaction BIT NOT NULL DEFAULT 0,
        
        -- ¿Está activo?
        IsActive BIT NOT NULL DEFAULT 1,
        
        -- Auditoría
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy NVARCHAR(50) NULL,
        UpdatedAt DATETIMEOFFSET NULL,
        UpdatedBy NVARCHAR(50) NULL
    );

    CREATE INDEX IX_ProcCatalog_ProcCode ON ProcCatalog(ProcCode);
    CREATE INDEX IX_ProcCatalog_IsActive ON ProcCatalog(IsActive);
    
    PRINT '✅ Tabla ProcCatalog creada';
END
ELSE
BEGIN
    PRINT '⚠️  Tabla ProcCatalog ya existe';
END
GO

-- =====================================================
-- Table: ProcExecLog
-- Purpose: Log de ejecuciones de stored procedures
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcExecLog')
BEGIN
    CREATE TABLE ProcExecLog (
        ProcExecLogId BIGINT PRIMARY KEY IDENTITY(1,1),
        
        -- ID único de la ejecución
        ExecutionId UNIQUEIDENTIFIER NOT NULL,
        
        -- ProcCode ejecutado
        ProcCode NVARCHAR(50) NOT NULL,
        
        -- Parámetros enviados (JSON)
        PayloadJson NVARCHAR(MAX) NULL,
        
        -- ¿Fue exitoso?
        Success BIT NOT NULL,
        
        -- Mensaje de error (si falló)
        ErrorMessage NVARCHAR(MAX) NULL,
        
        -- Duración en milisegundos
        DurationMs BIGINT NULL,
        
        -- Número de ResultSets devueltos
        ResultSetCount INT NULL,
        
        -- Metadata: quién ejecutó
        UserId NVARCHAR(50) NULL,
        UserName NVARCHAR(100) NULL,
        AppName NVARCHAR(50) NULL,
        IpAddress NVARCHAR(50) NULL,
        CorrelationId NVARCHAR(100) NULL,
        
        -- Cuándo se ejecutó
        ExecutedAt DATETIMEOFFSET NOT NULL
    );

    CREATE INDEX IX_ProcExecLog_ProcCode ON ProcExecLog(ProcCode);
    CREATE INDEX IX_ProcExecLog_ExecutedAt ON ProcExecLog(ExecutedAt DESC);
    CREATE INDEX IX_ProcExecLog_Success ON ProcExecLog(Success);
    CREATE INDEX IX_ProcExecLog_ExecutionId ON ProcExecLog(ExecutionId);
    
    PRINT '✅ Tabla ProcExecLog creada';
END
ELSE
BEGIN
    PRINT '⚠️  Tabla ProcExecLog ya existe';
END
GO

PRINT '';
PRINT '🎉 Database setup completado!';
PRINT 'Database: ProcBridgeDB';
PRINT 'Tablas: ProcCatalog, ProcExecLog';
PRINT '';
PRINT 'Siguiente paso: Ejecutar 02_SeedData.sql';
GO
