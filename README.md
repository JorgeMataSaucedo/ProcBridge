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

### **3. Ejecutar el API**

```bash
cd backend/ProcBridge.API
dotnet run
```

Verás:
```
✅ Building...
✅ Now listening on: https://localhost:5001
✅ Swagger UI: https://localhost:5001/swagger
```

### **4. Probar en Swagger**

1. Abre: https://localhost:5001/swagger
2. Expande `POST /api/execute`
3. Click en "Try it out"
4. Pega este JSON:

```json
{
  "procCode": "TEST_ECHO",
  "payload": {
    "Message": "Hello ProcBridge!"
  },
  "meta": {
    "userId": "user123",
    "appName": "SwaggerTest"
  }
}
```

5. Click "Execute"

**Respuesta esperada:**

```json
{
  "isOk": true,
  "data": {
    "resultSets": [
      {
        "columns": ["Message", "Timestamp", "Status"],
        "rows": [
          {
            "Message": "Hello ProcBridge!",
            "Timestamp": "2026-02-01T22:30:00",
            "Status": "ProcBridge is working!"
          }
        ]
      }
    ]
  },
  "meta": {
    "executionId": "...",
    "procCode": "TEST_ECHO",
    "spName": "sp_echo",
    "durationMs": 15,
    "executedAt": "..."
  }
}
```

---

## 📐 Arquitectura

```
┌─────────────────────────┐
│   Angular Frontend      │
│   (Fase 2)              │
└───────────┬─────────────┘
            │ HTTP/JSON
            ↓
┌─────────────────────────┐
│   ProcBridge.API        │
│   - ExecuteController   │
│   - CatalogController   │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   ProcBridge.Engine     │
│   - ProcBridgeEngine    │
│   - CatalogService      │
│   - ParameterMapper     │
│   - ExecutionLogger     │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   SQL Server            │
│   - ProcCatalog         │
│   - ProcExecLog         │
│   - Your SPs            │
└─────────────────────────┘
```

---

## 🔧 Estructura del Proyecto

```
ProcBridge/
├── backend/
│   ├── ProcBridge.Core/          # Models + Interfaces
│   │   ├── Models/
│   │   │   ├── ProcRequest.cs
│   │   │   ├── ProcResult.cs
│   │   │   ├── ProcMeta.cs
│   │   │   └── CatalogEntry.cs
│   │   └── Interfaces/
│   │       └── IProcBridge.cs
│   │
│   ├── ProcBridge.Engine/        # Motor de ejecución
│   │   ├── ProcBridgeEngine.cs
│   │   ├── CatalogService.cs
│   │   ├── ParameterMapper.cs
│   │   └── ExecutionLogger.cs
│   │
│   └── ProcBridge.API/           # REST API
│       ├── Controllers/
│       │   ├── ExecuteController.cs
│       │   └── CatalogController.cs
│       ├── Program.cs
│       └── appsettings.json
│
├── database/
│   ├── 01_CreateTables.sql
│   └── 02_SeedData.sql
│
└── README.md
```

---

## 📝 Ejemplos de Uso

### **Ejemplo 1: Ejecutar SP sin parámetros**

```bash
curl -X POST https://localhost:5001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "procCode": "TEST_ECHO",
    "payload": { "Message": "Test" }
  }'
```

### **Ejemplo 2: Ejecutar SP con filtros**

```bash
curl -X POST https://localhost:5001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "procCode": "GET_USERS",
    "payload": { "Status": "Active" }
  }'
```

### **Ejemplo 3: Crear orden (con transacción)**

```bash
curl -X POST https://localhost:5001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "procCode": "CREATE_ORDER",
    "payload": {
      "CustomerId": 123,
      "ProductId": 456,
      "Quantity": 2
    }
  }'
```

### **Ejemplo 4: Listar catálogo**

```bash
curl https://localhost:5001/api/catalog
```

---

## 🎯 Features

- ✅ **Ejecución dinámica** de SPs via API REST
- ✅ **Catálogo centralizado** (ProcCatalog)
- ✅ **Logging automático** de todas las ejecuciones
- ✅ **Transacciones opcionales** (UseTransaction flag)
- ✅ **Múltiples ResultSets** (DataSets)
- ✅ **Swagger/OpenAPI** integrado
- ✅ **CORS configurado** para Angular
- ✅ **Tipado fuerte** (.NET models)

---

## 🛣️ Roadmap

### **✅ Fase 1: Backend Core** (Completado)
- [x] ProcBridge.Core
- [x] ProcBridge.Engine
- [x] ProcBridge.API
- [x] Database scripts
- [x] Swagger UI

### **⏳ Fase 2: Frontend Angular** (Próximamente)
- [ ] Angular 17 project
- [ ] Dashboard component
- [ ] Catalog manager
- [ ] Playground (Monaco editor)
- [ ] Logs viewer

### **📅 Fase 3: Production Features**
- [ ] JWT Authentication
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] Health checks
- [ ] Metrics (OpenTelemetry)

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
