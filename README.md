# 🌉 ProcBridge

**Sistema de ejecución dinámica de Stored Procedures con API REST**

---

## 🚀 Quick Start (5 minutos)

### **1. Crear la Base de Datos**

Ejecuta los scripts SQL en orden:

```sql
-- En SQL Server Management Studio o Azure Data Studio:
-- 1. Ejecutar: database/01_CreateTables.sql
-- 2. Ejecutar: database/02_SeedData.sql
```

Esto creará:
- Database: `ProcBridgeDB`
- Tablas: `ProcCatalog`, `ProcExecLog`
- 3 SPs de ejemplo: `sp_echo`, `sp_GetUsers`, `sp_CreateOrder`

### **2. Configurar Connection String**

Edita `backend/ProcBridge.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ProcBridgeDB;Integrated Security=true;TrustServerCertificate=true;"
  }
}
```

Ajusta según tu servidor SQL.

### **3. Ejecutar el API (.NET)**

```bash
cd backend/ProcBridge.API
dotnet run
```

Verás:
- ✅ **API URL**: http://localhost:5194
- ✅ **Swagger UI**: http://localhost:5194/swagger

### **4. Ejecutar el Frontend (Angular)**

```bash
cd frontend/procbridge-admin
npm install
npm start
```

Verás:
- ✅ **App URL**: http://localhost:4200

---

## 📐 Arquitectura

```
┌─────────────────────────┐
│   Angular Frontend      │
│   (Diseño Minimalista)  │
└───────────┬─────────────┘
            │ HTTP/JSON (Port 4200 -> 5194)
            ↓
┌─────────────────────────┐
│   ProcBridge.API        │
│   - Stats, Logs, Catalog│
│   - Execution Engine    │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   ProcBridge.Engine     │
│   - ProcBridgeEngine    │
│   - CatalogService      │
│   - ExecutionLogger     │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   SQL Server            │
│   - ProcCatalog (Metadata)
│   - ProcExecLog (Logs)
└─────────────────────────┘
```

---

## 🔧 Estructura del Proyecto

```
ProcBridge/
├── backend/              # .NET 8 Web API
│   ├── ProcBridge.Core/  # Modelos e Interfaces
│   ├── ProcBridge.Engine/# Lógica de ejecución
│   └── ProcBridge.API/   # Endpoints REST
│
├── frontend/             # Angular 17 App
│   └── procbridge-admin/ # Admin Panel (PrimeNG)
│
├── database/             # SQL Scripts
│   ├── 01_CreateTables.sql
│   └── 02_SeedData.sql
│
└── README.md
```

---

## 🎯 Features

- ✅ **Ejecución dinámica** de SPs via API REST
- ✅ **Dashboard Minimalista** con stats reales de la BD
- ✅ **Playground** con editor JSON y ejecutor
- ✅ **Catálogo centralizado** (ProcCatalog) con buscador reactivo
- ✅ **Logging automático** (ProcExecLog)
- ✅ **Diseño Premium** Dark Mode / Glassmorphism
- ✅ **Botón Copy JSON** integrado en resultados

---

## 🛣️ Roadmap

### **✅ Fase 1: Backend Core** (Completado)
- [x] Ejecución dinámica y mapeo
- [x] Logging y Catálogo
- [x] Swagger UI

### **✅ Fase 2: Frontend Angular** (Completado)
- [x] Dashboard con KPIs reales
- [x] Playground (Editor + Results Viewer)
- [x] Catalog Manager con filtros
- [x] Logs Viewer con historial

### **⌛ Fase 3: Security & Identity** (Siguiente)
- [ ] JWT Authentication
- [ ] Role-based access control (RBAC)
- [ ] User management UI

### **📅 Fase 4: Production Polish**
- [ ] Gráficas dinámicas (ECharts)
- [ ] Multi-tenancy (SaaS ready)
- [ ] Dockerization (Backend + Frontend)

---

## 🤝 Contribuir

Este es un proyecto personal en desarrollo activo. 

**Próximos pasos:**
1. Terminar frontend Angular
2. Agregar tests unitarios
3. Deploy a Azure/AWS
4. Documentación completa

---

## 📄 Licencia

MIT License - úsalo como quieras 😊

---

## 💡 Inspiración

Creado como alternativa moderna a sistemas legacy metadata-driven, con arquitectura SaaS-ready desde el inicio.

**Built with ❤️ and .NET 8**
