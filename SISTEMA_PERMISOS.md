# Sistema de Permisos - Corina Capital

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
PB_SUPERUSER_EMAIL=admin@corinacapital.com
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

### Campos del formulario

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre | Sí | Título de la propiedad |
| Categoría | No | Tipo de propiedad |
| Ubicación | Sí | Dirección o zona |
| Precio | No | Precio en euros |
| Descripción | No | Texto descriptivo |
| Características | No | Lista de características (una por línea) |
| Fotos | No | Imágenes de la propiedad (máx. 10) |
| Estado | No | Disponible/Inactiva |

### Acceso al Panel

1. Iniciar sesión en `/login`
2. Ir a `/admin`

---

## Contacto

Para soporte técnico o dudas sobre el sistema de permisos, contactar al equipo de desarrollo.
