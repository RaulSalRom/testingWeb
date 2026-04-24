# 🚀 FRONTEND PARA HOSTINGER - CORINA CAPITAL

## 📋 INFORMACIÓN DEL PROYECTO
- **Dominio:** https://corinacapital.com
- **Backend API:** https://corina-server.tail4f61af.ts.net
- **Admin PocketBase:** https://corina-server.tail4f61af.ts.net/_/
- **Credenciales Admin:** admin@corinacapital.com / AdminCorina2026!

## 📋 INSTRUCCIONES DE INSTALACIÓN

### 1. Subir archivos a Hostinger
- Subir TODO el contenido de esta carpeta a `public_html/` en Hostinger
- Mantener la estructura de directorios
- **Dominio objetivo:** `corinacapital.com`

### 2. Configuración lista
**¡NO NECESITAS CAMBIAR NADA!** La configuración ya está actualizada:
```javascript
API_URL: 'https://corina-server.tail4f61af.ts.net',
FRONTEND_URL: 'https://corinacapital.com',
ENV: 'production'
```

### 3. Verificar .htaccess
- Asegurarse que Apache tiene `mod_rewrite` habilitado
- Si hay problemas con rutas, revisar reglas de rewrite

### 4. Configurar dominio en Hostinger
- En panel de Hostinger, apuntar `corinacapital.com` a esta carpeta
- Configurar SSL/HTTPS (automático con Let's Encrypt)

## 🔧 TROUBLESHOOTING

### Problema: Páginas no cargan (404)
**Solución:** Verificar que `.htaccess` está en `public_html/`

### Problema: API no conecta (CORS error)
**Solución:** Configurar CORS en PocketBase Admin:
1. Ir a `https://corina-server.tail4f61af.ts.net/_/`
2. Settings → API Rules
3. Añadir origen: `https://corinacapital.com`

### Problema: CSS/JS no cargan
**Solución:** Verificar permisos (755 para directorios, 644 para archivos)

## 📞 SOPORTE
- Revisar logs de error en Hostinger
- Verificar consola del navegador (F12)
- Probar con URL directa: `https://corinacapital.com/index.html`

## 🚀 DESPUÉS DE INSTALAR
1. **Acceder a Admin PocketBase** y crear colecciones
2. **Probar aplicación** completa
3. **Configurar backups** automáticos
4. **Planear migración** a VPS para producción

