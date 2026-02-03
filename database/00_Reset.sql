-- =====================================================
-- ProcBridge Database Reset
-- Script 00: Reset - Borra TODO y empieza de cero
-- =====================================================

USE master;
GO

PRINT '🧹 Iniciando reset de ProcBridge...';
PRINT '';

-- =====================================================
-- Opción 1: BORRAR LA BASE DE DATOS COMPLETA
-- =====================================================
-- Descomenta esto si quieres ELIMINAR TODA LA BD:

/*
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'ProcBridgeDB')
BEGIN
    ALTER DATABASE ProcBridgeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ProcBridgeDB;
    PRINT '✅ Base de datos ProcBridgeDB eliminada completamente';
END
ELSE
BEGIN
    PRINT '⚠️  Base de datos ProcBridgeDB no existe';
END
GO
*/

-- =====================================================
-- Opción 2: SOLO BORRAR TABLAS Y SPs (sin borrar la BD)
-- =====================================================

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'ProcBridgeDB')
BEGIN
    USE ProcBridgeDB;
    
    PRINT 'Borrando stored procedures...';
    
    -- Borrar SPs de ejemplo
    IF OBJECT_ID('sp_echo', 'P') IS NOT NULL
    BEGIN
        DROP PROCEDURE sp_echo;
        PRINT '  ✅ sp_echo eliminado';
    END
    
    IF OBJECT_ID('sp_GetUsers', 'P') IS NOT NULL
    BEGIN
        DROP PROCEDURE sp_GetUsers;
        PRINT '  ✅ sp_GetUsers eliminado';
    END
    
    IF OBJECT_ID('sp_CreateOrder', 'P') IS NOT NULL
    BEGIN
        DROP PROCEDURE sp_CreateOrder;
        PRINT '  ✅ sp_CreateOrder eliminado';
    END
    
    PRINT '';
    PRINT 'Borrando tablas...';
    
    -- Borrar tabla ProcExecLog (primero, no tiene FK)
    IF OBJECT_ID('ProcExecLog', 'U') IS NOT NULL
    BEGIN
        DROP TABLE ProcExecLog;
        PRINT '  ✅ Tabla ProcExecLog eliminada';
    END
    
    -- Borrar tabla ProcCatalog
    IF OBJECT_ID('ProcCatalog', 'U') IS NOT NULL
    BEGIN
        DROP TABLE ProcCatalog;
        PRINT '  ✅ Tabla ProcCatalog eliminada';
    END
    
    PRINT '';
    PRINT '🎉 Reset completado!';
    PRINT 'La base de datos existe pero está vacía.';
    PRINT '';
    PRINT 'Siguiente paso:';
    PRINT '  1. Ejecutar: 01_CreateTables.sql';
    PRINT '  2. Ejecutar: 02_SeedData.sql';
END
ELSE
BEGIN
    PRINT '⚠️  Base de datos ProcBridgeDB no existe';
    PRINT 'No hay nada que resetear.';
END
GO
