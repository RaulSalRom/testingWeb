# Keys Extraídas del Proyecto

Este archivo contiene todas las claves y credenciales sensibles extraídas de los archivos del proyecto. Estas han sido removidas de los archivos originales para mayor seguridad.

## Variables de Entorno Usadas

### PocketBase
- PB_SUPERUSER_EMAIL: admin@corinacapital.com
- PB_SUPERUSER_PASSWORD: tu_contraseña_segura
- PB_ENCRYPTION_KEY: EfJTYKp2DXNcPbUJB9x5dfShNs/Ktde3VrIuS5w+iI8= (ejemplo en README.md)

### Builder Mailer (en pb_hooks/builder-mailer.pb.js)
- BUILDER_MAILER_SENDER_ADDRESS: (dirección de envío, valor no especificado)
- BUILDER_MAILER_API_URL: (URL de la API de mailer, valor no especificado)
- BUILDER_MAILER_API_KEY: (clave API para mailer, valor no especificado)

### Frontend (Vite)
- TEMPLATE_BANNER_SCRIPT_URL: (URL del script de banner, usado en producción)
- TEMPLATE_REDIRECT_URL: (URL de redirección, usado en producción)
- VITE_API_URL: (URL de la API de PocketBase, por defecto '/hcgi/platform')

### Ejemplos de Credenciales en README.md
- Superuser Email: admin@corinacapital.com
- Superuser Password: TuPassword123
- Admin Password: AdminCorina2024!
- Admin Password alternativo: CorinaCapital2024!

### Otros
- En DEPLOYMENT_GUIDE.md: login=tu_email@no-ip.com, password=tu_password (placeholders para DDNS, cambiados a tu_email_noip, tu_password_noip)
- En comandos.txt: fZKzH(0b+C@Yiz'O (posible key o dato sensible al final del archivo)

## Notas
- Las variables de entorno sin valores especificados deben ser configuradas en archivos .env o variables de sistema.
- Los valores hardcodeados han sido removidos de SISTEMA_PERMISOS.md y README.md.