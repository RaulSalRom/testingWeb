# Corina Capital

**Plataforma inmobiliaria** construida con React + PocketBase. Catálogo de propiedades, favoritos, panel de administración y búsqueda avanzada.

## 🚀 Stack

| Capa       | Tecnología                  |
|------------|-----------------------------|
| Frontend   | React 19 + Tailwind CSS 4   |
| Backend    | PocketBase (Go)              |
| Base datos | PostgreSQL                  |
| UI         | shadcn/ui + Lucide icons    |
| Build tool | Vite                        |

## 📁 Estructura

```
testingWeb/
├── apps/web/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks (PocketBase queries)
│   │   ├── lib/             # Configuración, constantes, utilidades
│   │   ├── pages/           # Páginas de la app
│   │   └── services/        # Servicios PocketBase
│   └── package.json
├── .gitignore
└── README.md
```

## 🧩 Funcionalidades

- **Catálogo de propiedades** con filtros por categoría y búsqueda
- **Vista detalle** con imágenes, mapa y características
- **Sistema de favoritos** para usuarios registrados
- **Panel de administración** para gestión de propiedades
- **Scroll a categorías** desde la Home y página de propiedades

## 🔧 Desarrollo local

```bash
git clone https://github.com/RaulSalRom/testingWeb.git
cd testingWeb/apps/web
npm install
npm run dev
```

Configura la URL de PocketBase en `src/lib/pocketbaseClient.js`.

## 🌐 Producción

```bash
npm run build
```

El build se genera en `dist/apps/web/`. Súbelo al `public_html/` de tu hosting.

---

> Proyecto desarrollado para **Corina Capital**. 2026.
