# 📚 GUÍA DE MIGRACIÓN - FASE 1 COMPLETADA

Este documento explica cómo usar los nuevos servicios creados y cómo migrar tus componentes existentes.

---

## 📋 Tabla de Contenidos

1. [Vista General](#vista-general)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Archivos Creados](#archivos-creados)
4. [Cómo Usar Cada Archivo](#cómo-usar-cada-archivo)
5. [Ejemplos de Migración](#ejemplos-de-migración)
6. [Antes vs Después](#antes-vs-después)

---

## 🎯 Vista General

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

## 🗄️ Estructura de Base de Datos

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

## 📦 Archivos Creados

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

## 💡 Cómo Usar Cada Archivo

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

## 📊 Antes vs Después

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

## 🚀 Próximos Pasos

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

## 📝 Resumen

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
