# ProcBridge Admin Frontend

Premium Angular frontend for ProcBridge - Execute stored procedures with style! 🎮

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start

# Build for production
npm run build
```

## 📦 Tech Stack

- Angular 17.3
- PrimeNG 17.18
- TypeScript 5.4
- SCSS (Glassmorphism Dark Mode)

## 🎯 Features

- **🎮 Playground**: Interactive SP execution with JSON editor
- **📚 Catalog**: Browse and manage stored procedures
- **🎨 Premium UI**: Glassmorphism dark mode design
- **⚡ Fast**: Lazy-loaded routes for optimal performance

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/       # TypeScript DTOs
│   │   └── services/     # API client
│   ├── features/
│   │   ├── playground/   # SP executor
│   │   └── catalog/      # SP manager
│   ├── app.component.ts  # Root + sidebar
│   └── app.routes.ts     # Routes
└── styles.scss           # Global styles
```

## 🔧 Configuration

Update API base URL in `src/app/core/services/api.service.ts`:

```typescript
private baseUrl = 'http://localhost:7016/api';
```

## 📝 Available Scripts

- `npm start` - Start dev server
- `npm run build` - Build for production
- `npm run watch` - Build + watch mode

## 🎨 Design System

- **Primary**: #6366f1 (Indigo)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Dark**: #0f172a (Slate)

## 🔗 Backend

Make sure ProcBridge API is running:

```bash
cd ../../backend/ProcBridge.API
dotnet run
```

API runs at: `http://localhost:7016`

## 📚 Documentation

See `walkthrough.md` for detailed setup and architecture walkthrough.

---

Built with 💙 by Mikata Renji
