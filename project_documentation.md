# Documentación Consolidada del Proyecto

Este archivo contiene toda la documentación del proyecto, consolidada de los archivos originales. Los archivos originales han sido eliminados después de la consolidación.

---

## Comandos

# Cargar nvm y npm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Levantar Vite
cd ~/testingWeb/apps/web
npm run dev

---

## Sistema de Permisos - Corina Capital

## Resumen Ejecutivo

Se ha implementado un sistema de permisos basado en roles para la plataforma Corina Capital. Este sistema permite que **2 usuarios con permisos de administrador** puedan gestionar propiedades, mientras que **todos los demás usuarios** tienen acceso de solo lectura.

---

## Cambios Realizados

### 1. Estructura de Permisos

| Rol | Ver Propiedades | Crear | Editar | Eliminar |
|-----|-----------------|-------|--------|----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ✅ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ |

### 2. Backend - Pocketbase

**Nueva migración creada:** `apps/pocketbase/pb_migrations/1774000000_add_role_field_and_update_rules.js`

- **Campo `role` añadido a la colección `users`**
  - Valores posibles: `admin`, `editor`, `viewer`
  - Valor por defecto para nuevos usuarios: `viewer`

- **Reglas de la colección `properties` actualizadas:**
  - `listRule` (ver): Público (todos)
  - `createRule` (crear): Solo usuarios autenticados con rol `admin` o `editor`
  - `updateRule` (editar): Solo usuarios autenticados con rol `admin` o `editor`
  - `deleteRule` (eliminar): Solo usuarios autenticados con rol `admin` o `editor`

- **Reglas de la colección `favorites` actualizadas:**
  - Acceso permitido para cualquier usuario autenticado

### 3. Frontend - Web

- **SignupPage eliminado:** Los usuarios ya no pueden registrarse por cuenta propia
- **Login disponible:** Para uso interno del equipo administrativo
- **AuthContext actualizado:** Incluye función `isAdmin` para verificar permisos en el frontend

---

## Cómo Crear Usuarios Administradores

1. Acceder al panel de administración de Pocketbase: `http://localhost:8090/_/`

2. Ir a la colección **users**

3. Crear un nuevo usuario con los datos deseados

4. **Importante:** Asignar el valor `admin` al campo `role`

5. Configurar la contraseña inicial

---

## Configuración de Variables de Entorno (Superuser)

Para acceso de emergencia al panel de Pocketbase:

```bash
# En apps/pocketbase/.env o como variables de entorno
PB_SUPERUSER_EMAIL=tu_email_admin
PB_SUPERUSER_PASSWORD=tu_contraseña_segura
```

---

## Panel de Administración

Se ha implementado un panel de administración sencillo accesible en `/admin` para usuarios con rol `admin` o `editor`.

### Funcionalidades

- **Crear propiedades:** Formulario simple con campos para nombre, ubicación, precio, categoría, descripción y fotos
- **Editar propiedades:** Modificar cualquier propiedad existente
- **Eliminar propiedades:** Eliminar propiedades con confirmación
- **Gestionar fotos:** Subir hasta 10 imágenes por propiedad

---

## Guía de Migración - Fase 1 Completada

Este documento explica cómo usar los nuevos servicios creados y cómo migrar tus componentes existentes.

---

## Tabla de Contenidos

1. [Vista General](#vista-general)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Archivos Creados](#archivos-creados)
4. [Cómo Usar Cada Archivo](#cómo-usar-cada-archivo)
5. [Ejemplos de Migración](#ejemplos-de-migración)
6. [Antes vs Después](#antes-vs-después)

---

## Vista General

Se han creado **5 archivos centrales** que mejoran la mantenibilidad:

```
apps/web/src/
├── services/
│   └── propertyService.js      ← Todas las queries de propiedades
├── hooks/
│   └── usePocketbaseQuery.js    ← Hooks genéricos para fetching
├── lib/
│   ├── schemas.js              ← Validaciones con Zod
│   ├── constants.js            ← Valores hardcoded centralizados
│   └── logger.js               ← Logger centralizado
```

### Beneficios Inmediatos:
- ✅ Menos código duplicado
- ✅ Cambios en BD requieren editar 1 archivo (no 5)
- ✅ Mejor manejo de errores
- ✅ Code reuse entre componentes

---

## Estructura de Base de Datos

Tu PocketBase tiene esta estructura:

```
┌─────────────────────────────────────┐
│  USUARIOS (_pb_users_auth_)         │
├─────────────────────────────────────┤
│ • id (PK)                           │
│ • email, password                   │
│ • name                              │
│ • role: admin | editor | viewer     │
│ • emailVisibility                   │
└─────────────────────────────────────┘
        1:N          1:N
        │            │
┌───────▼────────┐  ┌──────────────────┐
│  PROPERTIES    │  │  FAVORITES       │
│  (Propiedades) │  │ (Join Table)     │
├────────────────┤  ├──────────────────┤
│ • id (PK)      │  │ • id (PK)        │
│ • name         │  │ • userId (FK)    │
│ • category *   │  │ • propertyId (FK)│
│ • description  │  │ • created        │
│ • price        │  └──────────────────┘
│ • location *   │
│ • availability │
│ • image        │
│ • created      │
│ • updated      │
└────────────────┘

* Campos con validación especial
```

### Categorías de Propiedades:
- `Habitaciones alquiler`
- `Inversiones`
- `Propiedades en venta`
- `Propiedades en alquiler`
- `Obras`

### Relaciones:
- **Usuario → Propiedades**: 1:N (aunque no se ve en BD, se implica por cambios)
- **Usuario → Favoritos**: 1:N (tabla de unión)
- **Propiedades → Favoritos**: 1:N (tabla de unión)

---

## Archivos Creados

### 1. **propertyService.js** (307 líneas)

**Centraliza TODAS las operaciones con propiedades.**

#### Funciones Incluidas:

| Función | Tipo | Descripción |
|---------|------|-------------|
| `getAll(options)` | READ | Obtiene todas las propiedades con filtros |
| `getById(id)` | READ | Obtiene UNA propiedad por ID |
| `search(searchTerm)` | READ | Búsqueda full-text |
| `getByCategory(category)` | READ | Filtra por categoría |
| `create(data)` | CREATE | Crea nueva propiedad |
| `update(id, data)` | UPDATE | Actualiza propiedad |
| `deleteProperty(id)` | DELETE | Elimina propiedad |
| `getFavoriteIds()` | FAVORITE | IDs de favoritos del usuario |
| `getFavoriteProperties()` | FAVORITE | Propiedades favoritas completas |
| `isFavorite(propertyId)` | FAVORITE | ¿Es favorito? |
| `addFavorite(propertyId)` | FAVORITE | Agregar a favoritos |
| `removeFavorite(propertyId)` | FAVORITE | Quitar de favoritos |
| `getStats()` | STAT | Estadísticas globales |

---

### 2. **usePocketbaseQuery.js** (195 líneas)

**Hooks genéricos que ELIMINAN código duplicado de fetching.**

#### Hooks Incluidos:

| Hook | Descripción |
|------|-------------|
| `usePocketbaseQuery()` | Genérico para listar registros |
| `usePocketbaseGetOne()` | Para obtener un registro por ID |
| `usePocketbaseSearch()` | Para búsqueda con debounce |

**Ventaja:** Todos retornan `{ data, loading, error, refetch() }`

---

### 3. **schemas.js** (280 líneas)

**Validación de datos con Zod.**

#### Schemas Incluidos:

| Schema | Uso |
|--------|-----|
| `propertyCreateSchema` | Validar al crear propiedad |
| `propertyUpdateSchema` | Validar al actualizar |
| `propertyFilterSchema` | Validar filtros de búsqueda |
| `loginSchema` | Validar login |
| `signupSchema` | Validar signup con confirmación |
| `userUpdateSchema` | Validar actualización de perfil |

**Funciones Aquí:**
- `validateSchema(data, schema)` → Valida y retorna `{ success, data, errors }`
- `safeParse(data, schema)` → Como validar pero sin throws
- `getErrorMessages(errors)` → Convierte errores a string

---

### 4. **constants.js** (350 líneas)

**Centraliza TODOS los valores hardcoded.**

#### Incluye:

| Grupo | Ejemplos |
|-------|----------|
| **Colecciones** | `POCKETBASE_COLLECTIONS.PROPERTIES` |
| **Categorías** | `PROPERTY_CATEGORIES` array con label, icon, color |
| **Roles** | `USER_ROLES`, `ROLE_PERMISSIONS` con permisos |
| **Validación** | `VALIDATION_LIMITS`, `ALLOWED_IMAGE_TYPES` |
| **Rutas** | `ROUTES.PROPERTIES`, `ROUTES.ADMIN`, etc. |
| **Mensajes** | `ERROR_MESSAGES`, `SUCCESS_MESSAGES` |
| **Helpers** | `hasPermission()`, `getRoute()` |

---

### 5. **logger.js** (250 líneas)

**Logger centralizado para toda la app.**

#### Funciones:

```javascript
logger.debug(message, data)   // Solo en desarrollo
logger.info(message, data)    // Información general
logger.warn(message, data)    // Advertencias
logger.error(error, context)  // Errores críticos
logger.track(name, props)     // Analytics
logger.startTimer(label)      // Medir performance
```

---

## Cómo Usar Cada Archivo

### 1️⃣ Usar propertyService.js

```javascript
// Importar
import propertyService from '@/services/propertyService';

// ✅ Obtener todas las propiedades
const props = await propertyService.getAll();

// ✅ Con filtros
const filtered = await propertyService.getAll({
  filter: 'price >= 100000 && availability = true',
  sort: '-price'
});

// ✅ Búsqueda
const results = await propertyService.search('apartamento madrid');

// ✅ Por categoría
const rentals = await propertyService.getByCategory('Propiedades en alquiler');

// ✅ Crear
const newProp = await propertyService.create({
  name: 'Apartamento centro',
  location: 'Madrid',
  category: 'Propiedades en alquiler',
  price: 1500,
  description: 'Moderno...'
});

// ✅ Actualizar
await propertyService.update(propertyId, { price: 2000 });

// ✅ Eliminar
await propertyService.deleteProperty(propertyId);

// ✅ Favoritos
const isFav = await propertyService.isFavorite(propertyId);
await propertyService.addFavorite(propertyId);
await propertyService.removeFavorite(propertyId);

// ✅ Estadísticas
const stats = await propertyService.getStats();
// { total: 45, byCategory: {...}, avgPrice: 250000, priceRange: {...} }
```

---

### 2️⃣ Usar usePocketbaseQuery.js

```javascript
import { usePocketbaseQuery } from '@/hooks/usePocketbaseQuery';

// ✅ BÁSICO - Obtener todas las propiedades
function MyComponent() {
  const { data, loading, error } = usePocketbaseQuery('properties');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  
  return data.map(prop => <PropertyCard key={prop.id} property={prop} />);
}

// ✅ CON FILTROS
function FilteredProperties() {
  const [category, setCategory] = useState('');
  
  const { data, loading } = usePocketbaseQuery('properties', {
    filter: category ? `category = "${category}"` : '',
    sort: '-price'
  }, [category]); // Dependencia para re-fetch
  
  return <PropertyList properties={data} />;
}

// ✅ CON PAGINACIÓN
function PaginatedProperties() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const { data } = usePocketbaseQuery('properties', {
    limit: pageSize,
    offset: (page - 1) * pageSize
  }, [page]);
  
  return <>
    <PropertyList properties={data} />
    <Pagination page={page} onChangePage={setPage} />
  </>;
}

// ✅ BÚSQUEDA CON DEBOUNCE
function SearchProperties() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Usa usePocketbaseSearch que ya tiene debounce
  const { data: results, loading } = usePocketbaseSearch(
    'properties',
    searchTerm,
    ['name', 'description', 'location'],
    300 // 300ms debounce
  );
  
  return <>
    <SearchBar value={searchTerm} onChange={setSearchTerm} />
    <PropertyList properties={results} loading={loading} />
  </>;
}
```

---

### 3️⃣ Usar schemas.js

```javascript
import {
  propertyCreateSchema,
  validateSchema,
  getErrorMessages
} from '@/lib/schemas';

// ✅ VALIDAR CON MANEJO DE ERRORES
async function handleCreateProperty(formData) {
  // Validar datos
  const validation = validateSchema(formData, propertyCreateSchema);
  
  if (!validation.success) {
    // Mostrar errores
    toast.error(getErrorMessages(validation.errors));
    return;
  }
  
  // Datos válidos, crear propiedad
  try {
    await propertyService.create(validation.data);
    toast.success('Propiedad creada');
  } catch (error) {
    logError(error, 'handleCreateProperty');
    toast.error('Error al crear');
  }
}

// ✅ EN FORMULARIOS CON REACT-HOOK-FORM
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function PropertyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(propertyCreateSchema)
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('price', { valueAsNumber: true })} />
      {errors.price && <span>{errors.price.message}</span>}
    </form>
  );
}
```

---

### 4️⃣ Usar constants.js

```javascript
import {
  PROPERTY_CATEGORIES,
  CATEGORY_COLORS,
  USER_ROLES,
  hasPermission,
  ROUTES,
  ERROR_MESSAGES,
  TIMING
} from '@/lib/constants';

// ✅ CATEGORÍAS EN SELECT
function CategorySelect() {
  return (
    <select>
      {PROPERTY_CATEGORIES.map(cat => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}

// ✅ PERMISOS
function PropertyForm() {
  const { currentUser } = useAuth();
  
  if (!hasPermission(currentUser.role, 'canCreateProperty')) {
    return <div>No tienes permiso</div>;
  }
  
  return <CreateForm />;
}

// ✅ RUTAS
import { useNavigate } from 'react-router-dom';

function AppHeader() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate(ROUTES.ADMIN)}>
      Admin Panel
    </button>
  );
}

// ✅ DEBOUNCE EN BÚSQUEDA
const { data } = usePocketbaseSearch(
  'properties',
  searchTerm,
  ['name'],
  TIMING.DEBOUNCE_SEARCH
);
```

---

### 5️⃣ Usar logger.js

```javascript
import { logError, logDebug, logInfo, logTrack } from '@/lib/logger';

// ✅ LOGGING EN SERVICES
try {
  const data = await fetch(...);
} catch (error) {
  logError(error, 'propertyService.getAll', { filter: 'example' });
}

// ✅ DEBUG EN COMPONENTES
const { data, loading } = usePocketbaseQuery('properties', options);
logDebug('Propiedades cargadas', { count: data.length });

// ✅ EVENTOS IMPORTANTES
function PropertyCard({ property }) {
  const handleViewDetailsClick = () => {
    logTrack('view_property', { 
      propertyId: property.id, 
      category: property.category 
    });
    navigate(`/properties/${property.id}`);
  };
  
  return <button onClick={handleViewDetailsClick}>Ver detalles</button>;
}

// ✅ MEDIR PERFORMANCE
async function fetchAllData() {
  const endTimer = logStartTimer('fetch_all_data');
  
  await propertyService.getAll();
  
  endTimer(); // Imprime: "fetch_all_data completed in 245.67ms"
}
```

---

## Antes vs Después

### ANTES (sin estos archivos):

```javascript
// ❌ HomePage.jsx - Código duplicado
function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await pb.collection('properties').getFullList({
          sort: '-created',
          limit: 20
        });
        setProperties(data);
      } catch (err) {
        setError(err);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return properties.map(p => <PropertyCard key={p.id} prop={p} />);
}

// ❌ PropertiesPage.jsx - MISMO CÓDIGO REPETIDO
function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await pb.collection('properties').getFullList({
          // ... mismo código ...
        });
        setProperties(data);
      } catch (err) {
        setError(err);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return <PropertyList properties={properties} />;
}

// ❌ AdminPanel.jsx - OTRA VEZ EL MISMO PATRÓN
// ... etc ...
```

### DESPUÉS (con los nuevos servicios):

```javascript
// ✅ HomePage.jsx
function HomePage() {
  const { data: properties, loading } = usePocketbaseQuery('properties', {
    sort: '-created',
    limit: 20
  });
  
  return properties.map(p => <PropertyCard key={p.id} prop={p} />);
}

// ✅ PropertiesPage.jsx
function PropertiesPage() {
  const { data: properties, loading } = usePocketbaseQuery('properties');
  
  return <PropertyList properties={properties} />;
}

// ✅ AdminPanel.jsx
function AdminPanel() {
  const { data: properties, loading } = usePocketbaseQuery('properties');
  
  const handleDelete = async (id) => {
    await propertyService.deleteProperty(id);
    toast.success('Eliminado');
  };
  
  return <AdminTable properties={properties} onDelete={handleDelete} />;
}
```

### Comparación:

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Líneas de código** | ~15-20 por componente | ~3-5 por componente |
| **Duplicación** | Alto (mismo código en 4 lugares) | ✅ Cero |
| **Cambiar queries** | Modificar 4 archivos | ✅ 1 archivo |
| **Manejo de errores** | console.error inconsistente | ✅ logger centralizado |
| **Tipado/JSDoc** | Ninguno | ✅ Comentarios detallados |

---

## Próximos Pasos

### Fase 2 (OPCIONAL):
- [ ] Migrar componentes existentes a usar estos servicios
- [ ] Agregar TypeScript
- [ ] Implementar React Query para caching
- [ ] Agregar tests con Vitest

### Fase 3 (OPCIONAL):
- [ ] Reorganizar carpetas por features
- [ ] Lazy loading de rutas
- [ ] Code splitting

---

## Resumen

| Archivo | Función | Importancia |
|---------|---------|------------|
| `propertyService.js` | Centralizar queries | 🔴 CRÍTICA |
| `usePocketbaseQuery.js` | Eliminar código duplicado | 🔴 CRÍTICA |
| `schemas.js` | Validación automática | 🟠 ALTA |
| `constants.js` | Fuente única de datos | 🟠 ALTA |
| `logger.js` | Logging centralizado | 🟡 MEDIA |

**Impacto Total:** Reducción de ~200 líneas de código duplicado ✅

---

¿Necesitas ayuda migrando algún componente específico? 🚀

---

## README - Corina Capital - Plataforma Inmobiliaria

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
PB_ENCRYPTION_KEY=tu_clave_de_encriptacion
```

### Crear Superuser (primera vez)
```bash
cd apps/pocketbase
./pocketbase superuser create tu_email_superuser tu_password_superuser
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
echo "PB_ENCRYPTION_KEY=tu_clave_de_encriptacion" > .env

# Crear superuser de PocketBase (para administrar colecciones)
./pocketbase superuser create tu_email_superuser tu_password_superuser
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
   - Email: tu_email_admin
   - Password: tu_password_admin
   - Name: Administrador
   - Role: admin
   - Verified: true

### 7. Acceder al panel de administración

#### Paso 1: Crear usuario administrador
1. Ir a **http://localhost:8090/_/**
2. Click en **"Sign in"**
3. Ingresar:
   - Email: `tu_email_admin`
   - Password: `tu_password_admin`
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
- Email: tu_email_superuser
- Password: tu_password_superuser
- URL: http://localhost:8090/_/

### Usuario Administrador de la App
- Email: tu_email_admin
- Password: tu_password_admin
- URL: http://localhost:3000/login

---

## Licencia

Privado - Corina Capital

---

## Guía Completa: Base de Datos + Hostinger

## Tabla de Contenidos

1. [Levantar PocketBase Localmente](#levantar-pocketbase-localmente)
2. [Estructura de BD](#estructura-de-bd)
3. [Migraciones](#migraciones)
4. [Deploy en Hostinger](#deploy-en-hostinger)
5. [Configuración de Dominios](#configuración-de-dominios)
6. [Troubleshooting](#troubleshooting)

---

## Alternativa: Usa Tu Ordenador Viejo como VPS Personal

### ¿Por qué esto es genial?

✅ **Gratis** - No pagas hosting (solo electricidad)  
✅ **Control total** - Tu servidor, tus reglas  
✅ **Aprendizaje** - Entiendes cómo funciona un servidor real  
✅ **Bueno para testing** - Perfecto para dev/staging  

### Requisitos Técnicos

| Requisito | Mínimo | Recomendado |
|-----------|--------|------------|
| **CPU** | Pentium IV | Intel i5 o mejor |
| **RAM** | 2 GB | 8+ GB |
| **Disco** | 250 GB | 1 TB SSD |
| **Conectividad** | ADSL/4G | Fibra 100+ Mbps |
| **Estabilidad** | Intermitente | 99%+ uptime |

### Paso 1: Preparar el Ordenador Viejo

#### Opción A: Usar Ubuntu Server (RECOMENDADO)

```bash
# Descargar Ubuntu Server (sin interfaz gráfica = más rápido)
# https://ubuntu.com/download/server

# Instalar en el ordenador viejo
# Ocupará menos recursos que Windows

# Verificar que está corriendo
lsb_release -a
# Ubuntu 22.04 LTS (o similar)
```

#### Opción B: Usar Windows (si no quieres cambiar SO)

```bash
# Instalar WSL2 (Windows Subsystem for Linux)
wsl --install

# Luego seguir mismo proceso que Ubuntu
```

---

### Paso 2: Configurar Red (Lo más importante)

El **mayor reto** es que tu ISP probablemente tiene IP dinámica (cambia cada día).

#### Paso 2a: Configurar Router

```
1. Ir a: http://192.168.1.1
   (o http://192.168.0.1 si es distinto)

2. Usuario: admin
   Contraseña: [la que pusiste]

3. Buscar: Port Forwarding / Reenvío de puertos

4. Agregar regla:
   Puerto externo: 80   → Puerto interno: 80 (ordenador)
   Puerto externo: 443  → Puerto interno: 443 (ordenador)
   Puerto externo: 8090 → Puerto interno: 8090 (PocketBase)

5. Asignar IP local FIJA al ordenador:
   Buscar: DHCP / Local Network
   Buscar ordenador (por MAC address)
   "Assign same IP always" o similar
```

#### Paso 2b: Encontrar tu IP Dinámica

```bash
# En el ordenador, saber tu IP local
ip addr show              # Linux
ipconfig                  # Windows

# IP que te asignó el router (ej: 192.168.1.100)
```

#### Paso 2c: DYNAMIC DNS (Muy importante)

Como tu IP cambia, necesitas un servicio que la actualice automáticamente:

**Opción 1: Usar servicio GRATUITO (NoIP, DynDNS, Cloudflare)**

```bash
# Instalación en Linux
sudo apt-get install ddclient

# Configurar
sudo nano /etc/ddclient/ddclient.conf
```

```cfg
# Ejemplo NoIP
protocol=noip
use=web, web=checkip.dyndns.com/
server=dynupdate.no-ip.com
login=tu_email_noip
password=tu_password_noip
tu-dominio.no-ip.biz
```

```bash
# O usando Cloudflare (más seguro)
# https://www.npmjs.com/package/ddns-cloudflare

npm install -g ddns-cloudflare
ddns-cloudflare --help

# Con cron para actualizar cada 5 minutos
*/5 * * * * /usr/local/bin/ddns-cloudflare --token TOKEN 
 --zone tudominio.com --domain tudominio.com
```

**Opción 2: MEJOR - Usar Cloudflare gratuito**

```bash
# 1. Crear cuenta en Cloudflare (gratis)
# https://www.cloudflare.com/

# 2. Apuntar nameservers a Cloudflare
# (En tu registrador, ej: GoDaddy, Namecheap)

# 3. Crear registro A dinámico
# DNS → Add record
# Type: A
# Name: @
# Content: tu-ip-actual
# TTL: 120 (se actualizará cada 2 min)

# 4. Script para actualizar IP
#!/bin/bash
api_token="tu_cloudflare_api_token"
zone_id="tu_zone_id"
record_id="tu_record_id"
domain="tudominio.com"

ip=$(curl -s https://api.ipify.org)

curl -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$record_id" \
  -H "Authorization: Bearer $api_token" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$domain\",\"content\":\"$ip\",\"ttl\":120}"

echo "IP actualizada: $ip"
```

```bash
# Hacer ejecutable
chmod +x update_dns.sh

# Ejecutar cada 5 minutos con cron
crontab -e

# Agregar:
*/5 * * * * /home/tu_usuario/update_dns.sh >> /var/log/dns_update.log 2>&1
```

---

### Paso 3: Levantar los Servicios

```bash
# En tu ordenador viejo (corriendo 24/7)

# Terminal 1: PocketBase
cd /home/tu_usuario/testingWeb/apps/pocketbase
npm run dev

# Terminal 2: Frontend (Vite)
cd /home/tu_usuario/testingWeb/apps/web
npm run build
# Servir con nginx (ver sección de nginx abajo)

# (Opcional) Terminal 3: Monitor de recursos
watch -n 1 'free -h; df -h'
```

---

### Paso 4: Mantener los Servicios Corriendo (PM2)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosistema
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "pocketbase",
      cwd: "/home/tu_usuario/testingWeb/apps/pocketbase",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "production"
      },
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    },
    {
      name: "frontend",
      cwd: "/home/tu_usuario/testingWeb/apps/web",
      script: "npm",
      args: "run preview",
      env: {
        NODE_ENV: "production"
      },
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M"
    }
  ]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Guardar para que inicie al reiniciar
pm2 startup
pm2 save

# Verificar que está guardado
pm2 list
```

---

### Paso 5: Firewall de Ubuntu

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (para acceso remoto)
sudo ufw allow 22/tcp

# Permitir puertos web
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp

# Ver reglas
sudo ufw status verbose
```

---

### Paso 6: Monitoreo & Alertas

```bash
# Script de monitoreo
cat > monitor.sh << 'EOF'
#!/bin/bash

# Verificar que PocketBase está corriendo
if ! curl -s http://localhost:8090/api/health > /dev/null; then
  echo "ERROR: PocketBase caído!"
  pm2 restart pocketbase
  
  # (Opcional) Enviar email de alerta
  # echo "PocketBase se reinició" | mail -s "Alerta" tu_email@gmail.com
fi

# Verificar espacio disco
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 90 ]; then
  echo "ADVERTENCIA: Disco lleno al ${disk_usage}%"
fi

# Verificar memoria
mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
echo "Memoria: ${mem_usage}%"

# Usar 24/7
echo "Monitor: OK - $(date)"
EOF

chmod +x monitor.sh

# Ejecutar cada 15 minutos
crontab -e
# Agregar: */15 * * * * /home/tu_usuario/monitor.sh
```

---

### Paso 7: Acesso Remoto SSH

```bash
# Desde otro PC, conectar al ordenador viejo
ssh tu_usuario@tudominio.com

# O si tienes IP dinámica de NoIP:
ssh tu_usuario@tu-servidor.no-ip.biz

# Desde teléfono/tablet también funciona con app SSH (ej: Termius)
```

---

## Comparativa: Ordenador Viejo vs Hostinger

| Aspecto | Ordenador Viejo | Hostinger VPS |
|--------|-----------------|---------------|
| **Costo inicial** | 0€ | 0€ (primer mes) |
| **Costo mensual** | ~20€ (electricidad) | 20-50€ |
| **Uptime garantizado** | 95% (si funciona) | 99.9% |
| **Ancho de banda** | Limitado (ADSL/Fibra) | Ilimitado |
| **IP dinámica** | Sí (hay que actualizar) | Fija |
| **Apoyo técnico** | Tú mismo | Hostinger |
| **Performance** | Depende del HW | Garantizado |
| **Escalabilidad** | No (hardware fijo) | Sí (upgrade fácil) |
| **Ideal para** | Dev/Testing | Producción |

---

## Tips para Longevidad

```bash
# 1. Evitar sobrecalentamiento
sudo apt-get install lm-sensors
sensors  # Ver temperaturas

# 2. Apagar pantalla (ahorra energía)
setterm -blank 60

# 3. Crear alias para conectar rápido
echo "alias ssh_server='ssh tu_usuario@tudominio.com'" >> ~/.bashrc
source ~/.bashrc

# ssh_server  # Conexión rápida

# 4. Monitoreo de uptime
apt-get install uptimed
uptimes  # Ver tiempo corriendo

# 5. Backup automatizado remoto
sudo apt-get install rsync

# Backup diario a disco externo
0 3 * * * rsync -av /data/ /media/external_drive/backups/
```

---

## Problemas Comunes

### "No puedo acceder desde fuera de casa"

```bash
# Verificar que puerto forwarding está correcto
nmap -p 80,443,8090 tudominio.com

# Si da "closed" o "filtered":
# 1. Verifica router port forwarding
# 2. Verifica firewall de Ubuntu (sudo ufw status)
# 3. Verifica que el ordenador tiene IP local fija
```

### "Mi vecino no puede acceder, pero yo sí desde el mismo WiFi"

Problema: Hairpin NAT no habilitado en router

```
Solución:
1. En router: Settings → NAT → Hairpin NAT: ON
2. O acceder directa por IP local: 192.168.1.100
```

### "IP me cambia cada día y pierde conexión"

```bash
# Verificar que DDNS está actualizándose
cat /var/log/dns_update.log

# Si no actualiza, reiniciar servicio
sudo systemctl restart ddclient

# O si usas script manual, agregar log:
echo "Última actualización: $(date)" >> /var/log/dns.log
```

### "Se queda lento después de días"

```bash
# Problema: Memory leak en Node.js
# Solución: Reiniciar cada día
0 2 * * * pm2 restart all

# Verificar logs de PM2
pm2 logs --err
```

---

## Configuración Final (Scripts automáticos)

```bash
#!/bin/bash
# setup_vps.sh - Script de instalación completa

set -e

echo "=== Configurando VPS en tu ordenador ==="

# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias
sudo apt install -y nodejs npm nginx git curl wget

# 3. Instalar PM2
sudo npm install -g pm2

# 4. Clonar repo
cd /home/$USER
git clone https://github.com/tuuser/testingWeb.git
cd testingWeb

# 5. Instalar dependencias del proyecto
npm install
cd apps/pocketbase && npm install
cd ../web && npm install
cd ../..

# 6. Crear ecosystem.config.js (ver arriba)
npm run build  # Build frontend

# 7. Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp
sudo ufw enable

# 8. Iniciar PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 9. Crear cron para DDNS y monitor
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER/update_dns.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/15 * * * * /home/$USER/monitor.sh") | crontab -

# 10. Reinicio daily para limpiar memoria
(crontab -l 2>/dev/null; echo "0 2 * * * pm2 restart all") | crontab -

echo "=== Configuración completada ==="
echo "Tu servidor está corriendo en: tudominio.com"
echo "Admin UI: tudominio.com/_/"
echo "Ver logs: pm2 logs"
```

```bash
# Hacer ejecutable y ejecutar
chmod +x setup_vps.sh
./setup_vps.sh
```

---

## Checklist: Ordenador Viejo como VPS Personal

- [ ] Ubuntu Server o WSL2 instalado
- [ ] Puerto forwarding configurado en router
- [ ] IP local fija asignada al ordenador
- [ ] Dynamic DNS/Cloudflare configurado
- [ ] PocketBase y Node.js instalados
- [ ] PM2 configurado con auto-restart
- [ ] Firewall habilitado
- [ ] DNS actualiza automáticamente (verificar)
- [ ] Puedes acceder desde fuera de casa (verificar)
- [ ] Monitoreo y alertas configuradas
- [ ] Backups automatizados
- [ ] Reinicio diario para limpiar memoria

---

¡Tu ordenador viejo ahora es tu VPS personal gratuito! 🎉

---

## Levantar PocketBase Localmente

### Opción 1: Usando el script package.json (RECOMENDADO)

```bash
# En la raíz del proyecto
cd apps/pocketbase

# Comando para desarrollo (escucha en puerto 8090)
npm run dev

# Salida esperada:
# ➜ Server started at http://127.0.0.1:8090
#   Admin UI:   http://127.0.0.1:8090/_/
#   API base:   http://127.0.0.1:8090/api/
```

### Opción 2: Usar el binario directamente

```bash
# En Linux/Mac
cd apps/pocketbase
./pocketbase serve

# En Windows
cd apps/pocketbase
.\pocketbase serve
```

### ✅ Verificar que PocketBase está funcionando

```bash
# En otra terminal, hacer una prueba:
curl http://localhost:8090/api/health

# Respuesta esperada:
# {"code":200,"message":"OK"}
```

---

## Acceder al Admin Panel

🌐 **URL:** `http://localhost:8090/_/`

### Credenciales de Ejemplo:
- **Email:** admin@example.com
- **Contraseña:** 123456789

(Crear la primera del admin durante primera visita)

---

## Estructura de Base de Datos

### Colecciones Disponibles:

```
┌─ USERS (_pb_users_auth_)
│  ├─ id
│  ├─ email
│  ├─ password
│  ├─ name
│  ├─ role (admin|editor|viewer)
│  └─ emailVisibility
│
├─ PROPERTIES
│  ├─ id
│  ├─ name ⭐
│  ├─ location ⭐
│  ├─ category (select)
│  ├─ price (number)
│  ├─ description (text)
│  ├─ availability (boolean)
│  ├─ image (file)
│  ├─ created (auto)
│  └─ updated (auto)
│
└─ FAVORITES (Join Table)
   ├─ id
   ├─ userId (FK)
   ├─ propertyId (FK)
   ├─ created (auto)
   └─ updated (auto)
```

---

## Migraciones

Las migraciones se aplican automáticamente al iniciar PocketBase.

### Archivo de migraciones:

```
apps/pocketbase/pb_migrations/
├── 1759383931_initial_app_settings.js
├── 1769159103_disable_auth_alert_superusers.js
├── 1769164585_set_rate_limits.js
├── 1773824294_001_created_properties.js
├── 1773824296_001_created_favorites.js
├── 1773824320_002_seed_properties_15_records.js
├── 1776161310_updated_users.js
└── 1776161318_updated_properties.js
```

### Crear Nueva Migración

```bash
# Dentro de apps/pocketbase
./pocketbase migrate create [nombre]

# Ejemplo:
./pocketbase migrate create add_rating_field

# Se creará: pb_migrations/[timestamp]_add_rating_field.js
```

### Ver Estado de Migraciones

```bash
# En dashboard de Admin UI:
# Settings → Backups & Restores → Ver logs
```

---

## Deploy en Hostinger

### Requisitos:
- ✅ Cuenta en Hostinger con acceso a VPS o Shared Hosting Plus
- ✅ Node.js 18+ instalado en servidor
- ✅ npm o yarn
- ✅ Dominio apuntando a tu servidor

---

### Paso 1: Preparar el Proyecto

```bash
# En proyecto local, crear build de producción
cd apps/web
npm run build

# Esto crea: `dist/` con archivos optimizados para producción
```

### Paso 2: Configurar Hostinger

#### Opción A: VPS en Hostinger

```bash
# 1. Conectar SSH a tu VPS
ssh root@tu_ip_vps

# 2. Instalar Node.js (si no está)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verificar instalación
node --version   # v18.x.x
npm --version    # 9.x.x

# 4. Clonar repositorio
cd /home/tu_usuario
git clone https://github.com/tu_usuario/testingWeb.git
cd testingWeb

# 5. Instalar dependencias
npm install

# 6. Compilar para producción
cd apps/web
npm run build
```

#### Opción B: Shared Hosting Plus en Hostinger

1. Ve a **Hosting → Administrador de Archivos**
2. Crea carpeta `public_html/my-app`
3. Sube archivos del `dist/` a esa carpeta
4. Crea un redirect en Hostinger para apuntar a tu app

---

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env.production` en la raíz:

```env
# Frontend - apps/web
VITE_API_URL=https://api.tudominio.com    # URL de PocketBase en producción
VITE_API_PATH=/api

# Backend - apps/pocketbase
PB_SERVER_PORT=8090
PB_SERVER_HOST=0.0.0.0              # Escuchar en todas las interfaces
PB_DB_PATH=/data/pb_data.db         # Ruta persistente de BD
PB_ENCRYPTION_KEY=tu_clave_secreta
```

---

### Paso 4: Levantar PocketBase en Hostinger

#### Usando PM2 (Recomendado - mantiene el proceso vivo)

```bash
# En el servidor Hostinger
npm install -g pm2

# Navegar a carpeta de pocketbase
cd apps/pocketbase

# Iniciar con PM2
pm2 start "npm run dev" --name "pocketbase" --env production

# Verificar que está corriendo
pm2 status

# Ver logs
pm2 logs pocketbase

# (Opcional) Guardar configuración para que inicie al rebootear
pm2 startup
pm2 save
```

#### Usando Systemd (Alternativa)

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/pocketbase.service
```

```ini
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/home/tu_usuario/testingWeb/apps/pocketbase
ExecStart=/home/tu_usuario/testingWeb/apps/pocketbase/pocketbase serve --http=0.0.0.0:8090 --dir=/data
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Activar y iniciar
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Ver estado
sudo systemctl status pocketbase

# Ver logs
sudo journalctl -u pocketbase -f
```

---

### Paso 5: Configurar Nginx (Reverse Proxy)

```bash
# En el servidor, crear configuración
sudo nano /etc/nginx/sites-available/default
```

```nginx
# Configuración Nginx para servir Frontend + PocketBase

server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # Certificado SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend (React/Vite build)
    location / {
        root /home/tu_usuario/testingWeb/apps/web/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers para caching
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API y PocketBase
    location /api/ {
        proxy_pass http://localhost:8090/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin UI de PocketBase
    location /_/ {
        proxy_pass http://localhost:8090/_;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets si se necesitan
    location /api/realtime {
        proxy_pass http://localhost:8090/api/realtime;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

### Paso 6: SSL (HTTPS con Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

---

## Configuración de Dominios

### Apuntar Dominio a Hostinger

En tu registrador de dominios (GoDaddy, Namecheap, etc.):

#### Opción 1: Nameservers (RECOMENDADO)

```
NS1.HOSTINGER.COM
NS2.HOSTINGER.COM
NS3.HOSTINGER.COM
NS4.HOSTINGER.COM
```

#### Opción 2: Registros A (DNS Manual)

```
Tipo    Nombre         Valor
A       @              123.456.789.000    (IP de tu servidor)
A       www            123.456.789.000
CNAME   api            tudominio.com
```

### Verificar Propagación DNS

```bash
# Esperar 24-48 horas, luego verificar
nslookup tudominio.com
dig tudominio.com

# Debe mostrar tu IP de Hostinger
```

---

## Backups de BD

### Crear Backup Manual en Admin UI

1. Ir a `http://localhost:8090/_/`
2. Menu → **Settings**
3. **Backups & Restores** → **Create new backup**
4. Descargar archivo `.zip`

### Automatizar Backups (Script)

```bash
#!/bin/bash
# backup_db.sh

BACKUP_DIR="/backups/pocketbase"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Copiar base de datos
cp -r /data/pb_data/storage $BACKUP_DIR/backup_$DATE

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/backup_$DATE

# Eliminar carpeta
rm -rf $BACKUP_DIR/backup_$DATE

echo "Backup creado: $BACKUP_DIR/backup_$DATE.tar.gz"
```

```bash
# Hacer ejecutable
chmod +x backup_db.sh

# Agregar al crontab para ejecutar diariamente (3 AM)
crontab -e

# Agregar línea:
0 3 * * * /home/tu_usuario/backup_db.sh
```

---

## Troubleshooting

### Error: "Cannot connect to http://localhost:8090"

```bash
# Verificar que PocketBase está corriendo
ps aux | grep pocketbase

# Si no está, iniciar
cd apps/pocketbase
npm run dev

# Verificar puerto está abierto
netstat -tuln | grep 8090
```

### Error: "CORS error" en el navegador

**Solución en PocketBase Admin UI:**

1. Settings → **API rules & previews**
2. Buscar `Create (POST)` en Properties
3. Cambiar `API Rule` a: `@request.auth.id != ""`

### Error: "BD corrupida" o no se actualizan datos

```bash
# Backup de seguridad
cp -r /data/pb_data /data/pb_data.backup

# Reiniciar PocketBase
pm2 restart pocketbase

# Si sigue fallando, restaurar desde backup
rm -rf /data/pb_data
cp -r /data/pb_data.backup /data/pb_data
```

### Lento en Hostinger?

```bash
# Aumentar recursos Node si es VPS
# En app.js o inicio de servidor:

// Limitaciones de memoria
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Aumentar workers
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

### Certificado SSL expirado

```bash
# Renovar manualmente
sudo certbot renew --force-renewal

# O automáticamente (ya debería estar)
sudo systemctl start certbot.timer
```

---

## Checklist de Deploy

- [ ] PocketBase levantado localmente y funcionando
- [ ] Frontend compilado (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] PM2/Systemd configurado en servidor
- [ ] Nginx/Apache configurado
- [ ] SSL certificado instalado
- [ ] Dominio apuntando correctamente
- [ ] DNS propagado (verificar con `dig`)
- [ ] Backups automatizados
- [ ] Prueba de login funcionando
- [ ] Prueba de crear propiedad funcionando
- [ ] CORS habilitado en PocketBase

---

## Variables de Entorno (Resumen)

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8090
VITE_API_PATH=/api
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.tudominio.com
VITE_API_PATH=/api
```

### Backend (.env)
```env
PB_SERVER_PORT=8090
PB_SERVER_HOST=127.0.0.1
```

### Backend (.env.production)
```env
PB_SERVER_PORT=8090
PB_SERVER_HOST=0.0.0.0
PB_PUBLIC_URL=https://tudominio.com
PB_JWT_SECRET=tu_clave_secreta_aqui
```

---

## URLs Finales

| Servicio | Local | Producción |
|----------|-------|-----------|
| **Frontend** | http://localhost:5173 | https://tudominio.com |
| **PocketBase API** | http://localhost:8090/api | https://tudominio.com/api |
| **PocketBase Admin** | http://localhost:8090/_ | https://tudominio.com/_ |

---

## Recursos

- **PocketBase Docs:** https://pocketbase.io/docs/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Hostinger Docs:** https://support.hostinger.com/

¡Listo! Tu aplicación estará corriendo en producción. 🚀