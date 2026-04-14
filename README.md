# Corina Capital - Plataforma Inmobiliaria

## Descripción General

Corina Capital es una plataforma web para la gestión y visualización de propiedades inmobiliarias en la Costa del Sol. Desarrollada con React, Vite, TailwindCSS y PocketBase como backend.

---

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **React 18** | Framework frontend |
| **Vite** | Bundler y servidor de desarrollo |
| **TailwindCSS** | Estilos CSS |
| **shadcn/ui** | Componentes UI |
| **PocketBase** | Backend (base de datos + autenticación) |
| **React Router** | Navegación |
| **PocketBase JS SDK** | Cliente para API |

---

## Estructura del Proyecto

```
testingWeb/
├── apps/
│   ├── web/                    # Aplicación React
│   │   ├── src/
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   │   ├── ui/        # Componentes shadcn/ui
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── PropertyCard.jsx
│   │   │   │   └── ...
│   │   │   ├── contexts/      # Contextos React
│   │   │   │   └── AuthContext.jsx
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── pages/         # Páginas principales
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── PropertiesPage.jsx
│   │   │   │   ├── PropertyDetailPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── AdminPanel.jsx
│   │   │   └── lib/
│   │   │       └── pocketbaseClient.js
│   │   └── plugins/           # Plugins Vite personalizados
│   └── pocketbase/            # Backend PocketBase
│       ├── pb_data/           # Datos SQLite
│       ├── pb_hooks/          # Hooks de servidor
│       └── pb_migrations/     # Migraciones de BD
└── package.json               # Workspace raíz
```

---

## Páginas

### Página Principal (`/`)
- Hero con llamada a la acción
- Estadísticas de la empresa
- Listado de propiedades destacadas
- Footer con información de contacto

### Catálogo (`/properties`)
- Grid de propiedades con filtros
- Búsqueda por nombre o ubicación
- Filtrado por categoría:
  - Habitaciones alquiler
  - Inversiones
  - Propiedades en venta
  - Propiedades en alquiler
  - Obras

### Detalle de Propiedad (`/properties/:id`)
- Galería de imágenes
- Información completa de la propiedad
- Precio y ubicación
- Características detalladas
- Botón de contacto

### Login (`/login`)
- Formulario de autenticación
- Solo para usuarios administradores

### Panel de Administración (`/admin`)
- **Acceso:** Solo usuarios con rol `admin` o `editor`
- **Funcionalidades:**
  - Crear propiedades
  - Editar propiedades existentes
  - Eliminar propiedades
  - Subir hasta 10 imágenes por propiedad
  - Gestionar disponibilidad

---

## Cómo Publicar una Propiedad

### Paso 1: Acceder al Panel de Admin
1. Ir a **http://localhost:3000/login**
2. Iniciar sesión con tu usuario
3. Serás redirigido automáticamente a **http://localhost:3000/admin**

### Paso 2: Crear Nueva Propiedad
1. Click en el botón **"Nueva Propiedad"** (arriba a la derecha)
2. Se abrirá un formulario con los siguientes campos:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| **Nombre** | ✅ | Título de la propiedad (ej: "Apartamento Vista Mar") |
| **Categoría** | No | Seleccionar una: Habitaciones alquiler, Inversiones, Propiedades en venta, Propiedades en alquiler, Obras |
| **Ubicación** | ✅ | Dirección o zona (ej: "Benalmádena, Costa del Sol") |
| **Precio** | No | Precio en euros (ej: 250000) |
| **Descripción** | No | Texto descriptivo de la propiedad |
| **Características** | No | Lista de características, una por línea (ej: "3 habitaciones") |
| **Notas de contacto** | No | Notas internas para el equipo |
| **Fotos** | No | Hasta 10 imágenes (máx 20MB cada una) |
| **Estado** | No | Disponible (por defecto) o Inactiva |

### Paso 3: Rellenar el Formulario
1. **Nombre:** Escribir el título de la propiedad
2. **Categoría:** Opcional, seleccionar si aplica
3. **Ubicación:** Escribir la dirección
4. **Precio:** Opcional, escribir solo números
5. **Descripción:** Escribir una descripción atractiva
6. **Características:** Escribir cada característica en una línea separada:
   ```
   3 habitaciones
   2 baños
   Piscina
   Garaje
   ```
7. **Fotos:** 
   - Click en "Arrastra imágenes aquí o haz clic para seleccionar"
   - Seleccionar las fotos del ordenador
   - Se muestran como previsualización
   - Para eliminar una foto, hover sobre ella y click en la X

### Paso 4: Publicar
1. Verificar que los campos obligatorios están llenos
2. Click en el botón **"Publicar"**
3. Aparecerá una notificación de éxito
4. La propiedad aparecerá en el catálogo público

### Editar una Propiedad Existente
1. En el panel de admin, buscar la propiedad en la lista
2. Click en el icono del **lápiz** (✏️) en la fila de la propiedad
3. Modificar los campos deseados
4. Click en **"Actualizar"**

### Eliminar una Propiedad
1. En el panel de admin, buscar la propiedad
2. Click en el icono de la **papelera** (🗑️)
3. Confirmar la eliminación en el popup

---

## Sistema de Permisos

### Roles de Usuario

| Rol | Ver Propiedades | Crear | Editar | Eliminar |
|-----|-----------------|-------|--------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

### Colección `properties` - Reglas API

```javascript
listRule: ""                    // Público (todos pueden ver)
viewRule: ""                    // Público
createRule: "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')"
updateRule: "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')"
deleteRule: "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')"
```

---

## Colecciones de Datos

### `properties`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | text | Nombre de la propiedad |
| category | select | Categoría |
| description | text | Descripción detallada |
| price | number | Precio en euros |
| location | text | Ubicación |
| availability | bool | Disponible/Inactiva |
| images | file | Imágenes (máx. 10) |
| detailed_features | text | Características |
| contact_info | text | Notas de contacto |

### `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| email | email | Correo electrónico |
| name | text | Nombre |
| role | select | admin / editor / viewer |

---

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo (levanta web + pocketbase)
npm run dev

# Build producción
npm run build

# Linting
npm run lint

# Solo web
cd apps/web && npm run dev

# Solo pocketbase
cd apps/pocketbase && ./pocketbase serve
```

---

## Variables de Entorno

### PocketBase (apps/pocketbase/.env)
```bash
PB_ENCRYPTION_KEY=tu_clave_de_32_caracteres
```

### Crear Superuser (primera vez)
```bash
cd apps/pocketbase
./pocketbase superuser create admin@corinacapital.com TuPassword123
```

---

## Despliegue en Hostinger

### Opción 1: Hosting Compartido (Solo frontend)

El frontend (React) se puede subir directamente a Hostinger.

1. **Construir el proyecto:**
```bash
npm run build
```

2. **Subir a Hostinger:**
   - Ir al **Administrador de Archivos** de Hostinger
   - Navegar a `public_html`
   - Subir todo el contenido de `dist/apps/web/` (excepto `llms.txt`)

3. **Configurar .htaccess:**
   - Ya existe un archivo `.htaccess` en el proyecto que configura SPA

4. **Importante:** PocketBase debe estar en otro servicio (servidor VPS, PocketBase Cloud, etc.)

### Opción 2: VPS Hostinger (Recomendado)

Para usar PocketBase en el mismo servidor:

1. **Subir el proyecto completo** a `/home/public_html/` o tu directorio

2. **Instalar PocketBase:**
```bash
cd apps/pocketbase
# Descargar PocketBase para Linux
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip
chmod +x pocketbase
```

3. **Crear servicio systemd para PocketBase:**
```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Contenido:
```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/a/apps/pocketbase
ExecStart=/ruta/a/pocketbase serve --http=0.0.0.0:8090
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

4. **Activar servicio:**
```bash
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

5. **Configurar Nginx como proxy reverso:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /_/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

6. **Activar SSL con Let's Encrypt:**
```bash
sudo certbot --nginx -d tu-dominio.com
```

---

## Instalación Local (Desarrollo)

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd testingWeb
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar PocketBase
```bash
cd apps/pocketbase
# Crear archivo .env con clave de encriptación
echo "PB_ENCRYPTION_KEY=EfJTYKp2DXNcPbUJB9x5dfShNs/Ktde3VrIuS5w+iI8=" > .env

# Crear superuser de PocketBase (para administrar colecciones)
./pocketbase superuser create admin@corinacapital.com TuPassword123
```

### 4. Levantar el proyecto
```bash
npm run dev
```

### 5. URLs de acceso:
- **Web:** http://localhost:3000
- **Panel Admin PocketBase:** http://localhost:8090/_/

### 6. Crear usuario administrador para la app

1. Ir a http://localhost:8090/_/
2. Iniciar sesión con el superuser de PocketBase
3. Ir a colección `users`
4. Crear usuario con:
   - Email: admin@corinacapital.com
   - Password: AdminCorina2024!
   - Name: Administrador
   - Role: admin
   - Verified: true

### 7. Acceder al panel de administración

#### Paso 1: Crear usuario administrador
1. Ir a **http://localhost:8090/_/**
2. Click en **"Sign in"**
3. Ingresar:
   - Email: `admin@corinacapital.com`
   - Password: `CorinaCapital2024!`
4. En el menú lateral, ir a **"Collections"** → **"users"**
5. Click en **"+ New record"**
6. Rellenar los campos:
   - **Email:** tu email
   - **Password:** tu password
   - **Name:** Tu Nombre
   - **Role:** `admin`
   - **Verified:** ✅ (marcar)
7. Click **"Create"**

#### Paso 2: Iniciar sesión en la app
1. Ir a **http://localhost:3000/login**
2. Ingresar el email y password creados
3. Click **"Iniciar sesión"**
4. Serás redirigido a **http://localhost:3000/admin**

---

## Migraciones de Base de Datos

Las migraciones se encuentran en `apps/pocketbase/pb_migrations/` y se ejecutan automáticamente al iniciar PocketBase.

| Migración | Descripción |
|-----------|-------------|
| `1773824294_001_created_properties.js` | Colección properties |
| `1773824296_001_created_favorites.js` | Colección favorites |
| `1773824320_002_seed_properties_15_records.js` | Datos de ejemplo |

---

## Credenciales de Acceso

### Superuser PocketBase (para administrar BD)
- Email: admin@corinacapital.com
- Password: CorinaCapital2024!
- URL: http://localhost:8090/_/

### Usuario Administrador de la App
- Email: admin@corinacapital.com
- Password: AdminCorina2024!
- URL: http://localhost:3000/login

---

## Licencia

Privado - Corina Capital
