# 🚀 GUÍA COMPLETA: BASE DE DATOS + HOSTINGER

## 📋 Tabla de Contenidos

1. [Levantar PocketBase Localmente](#levantar-pocketbase-localmente)
2. [Estructura de BD](#estructura-de-bd)
3. [Migraciones](#migraciones)
4. [Deploy en Hostinger](#deploy-en-hostinger)
5. [Configuración de Dominios](#configuración-de-dominios)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Alternativa: Usa Tu Ordenador Viejo como VPS Personal

### **¿Por qué esto es genial?**

✅ **Gratis** - No pagas hosting (solo electricidad)  
✅ **Control total** - Tu servidor, tus reglas  
✅ **Aprendizaje** - Entiendes cómo funciona un servidor real  
✅ **Bueno para testing** - Perfecto para dev/staging  

### **Requisitos Técnicos**

| Requisito | Mínimo | Recomendado |
|-----------|--------|------------|
| **CPU** | Pentium IV | Intel i5 o mejor |
| **RAM** | 2 GB | 8+ GB |
| **Disco** | 250 GB | 1 TB SSD |
| **Conectividad** | ADSL/4G | Fibra 100+ Mbps |
| **Estabilidad** | Intermitente | 99%+ uptime |

### **Paso 1: Preparar el Ordenador Viejo**

#### **Opción A: Usar Ubuntu Server (RECOMENDADO)**

```bash
# Descargar Ubuntu Server (sin interfaz gráfica = más rápido)
# https://ubuntu.com/download/server

# Instalar en el ordenador viejo
# Ocupará menos recursos que Windows

# Verificar que está corriendo
lsb_release -a
# Ubuntu 22.04 LTS (o similar)
```

#### **Opción B: Usar Windows (si no quieres cambiar SO)**

```bash
# Instalar WSL2 (Windows Subsystem for Linux)
wsl --install

# Luego seguir mismo proceso que Ubuntu
```

---

### **Paso 2: Configurar Red (Lo más importante)**

El **mayor reto** es que tu ISP probablemente tiene IP dinámica (cambia cada día).

#### **Paso 2a: Configurar Router**

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

#### **Paso 2b: Encontrar tu IP Dinámica**

```bash
# En el ordenador, saber tu IP local
ip addr show              # Linux
ipconfig                  # Windows

# IP que te asignó el router (ej: 192.168.1.100)
```

#### **Paso 2c: DYNAMIC DNS (Muy importante)**

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
login=tu_email@no-ip.com
password=tu_password
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

### **Paso 3: Levantar los Servicios**

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

### **Paso 4: Mantener los Servicios Corriendo (PM2)**

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

### **Paso 5: Firewall de Ubuntu**

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

### **Paso 6: Monitoreo & Alertas**

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

### **Paso 7: Acesso Remoto SSH**

```bash
# Desde otro PC, conectar al ordenador viejo
ssh tu_usuario@tudominio.com

# O si tienes IP dinámica de NoIP:
ssh tu_usuario@tu-servidor.no-ip.biz

# Desde teléfono/tablet también funciona con app SSH (ej: Termius)
```

---

## 📊 Comparativa: Ordenador Viejo vs Hostinger

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

## ⚡ Tips para Longevidad

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

## 🆘 Problemas Comunes

### **"No puedo acceder desde fuera de casa"**

```bash
# Verificar que puerto forwarding está correcto
nmap -p 80,443,8090 tudominio.com

# Si da "closed" o "filtered":
# 1. Verifica router port forwarding
# 2. Verifica firewall de Ubuntu (sudo ufw status)
# 3. Verifica que el ordenador tiene IP local fija
```

### **"Mi vecino no puede acceder, pero yo sí desde el mismo WiFi"**

Problema: Hairpin NAT no habilitado en router

```
Solución:
1. En router: Settings → NAT → Hairpin NAT: ON
2. O acceder directa por IP local: 192.168.1.100
```

### **"IP me cambia cada día y pierde conexión"**

```bash
# Verificar que DDNS está actualizándose
cat /var/log/dns_update.log

# Si no actualiza, reiniciar servicio
sudo systemctl restart ddclient

# O si usas script manual, agregar log:
echo "Última actualización: $(date)" >> /var/log/dns.log
```

### **"Se queda lento después de días"**

```bash
# Problema: Memory leak en Node.js
# Solución: Reiniciar cada día
0 2 * * * pm2 restart all

# Verificar logs de PM2
pm2 logs --err
```

---

## 💡 Configuración Final (Scripts automáticos)

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

## ✅ Checklist: Ordenador Viejo como VPS Personal

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

## 🏠 Levantar PocketBase Localmente

### **Opción 1: Usando el script package.json (RECOMENDADO)**

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

### **Opción 2: Usar el binario directamente**

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

## 🔑 Acceder al Admin Panel

🌐 **URL:** `http://localhost:8090/_/`

### Credenciales de Ejemplo:
- **Email:** admin@example.com
- **Contraseña:** 123456789

(Crear la primera del admin durante primera visita)

---

## 🗄️ Estructura de Base de Datos

### **Colecciones Disponibles:**

```
┌─ USERS (_pb_users_auth_)
│  ├─ id
│  ├─ email
│  ├─ password (hash)
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

## 🔄 Migraciones

Las migraciones se aplican automáticamente al iniciar PocketBase.

### **Archivo de migraciones:**

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

## 🌐 Deploy en Hostinger

### **Requisitos:**
- ✅ Cuenta en Hostinger con acceso a VPS o Shared Hosting Plus
- ✅ Node.js 18+ instalado en servidor
- ✅ npm o yarn
- ✅ Dominio apuntando a tu servidor

---

### **Paso 1: Preparar el Proyecto**

```bash
# En proyecto local, crear build de producción
cd apps/web
npm run build

# Esto crea: `dist/` con archivos optimizados para producción
```

### **Paso 2: Configurar Hostinger**

#### **Opción A: VPS en Hostinger**

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

#### **Opción B: Shared Hosting Plus en Hostinger**

1. Ve a **Hosting → Administrador de Archivos**
2. Crea carpeta `public_html/my-app`
3. Sube archivos del `dist/` a esa carpeta
4. Crea un redirect en Hostinger para apuntar a tu app

---

### **Paso 3: Configurar Variables de Entorno**

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

### **Paso 4: Levantar PocketBase en Hostinger**

#### **Usando PM2 (Recomendado - mantiene el proceso vivo)**

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

#### **Usando Systemd (Alternativa)**

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
# Habilitar y iniciar
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Ver estado
sudo systemctl status pocketbase

# Ver logs
sudo journalctl -u pocketbase -f
```

---

### **Paso 5: Configurar Nginx (Reverse Proxy)**

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

### **Paso 6: SSL (HTTPS con Let's Encrypt)**

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

---

## 🔗 Configuración de Dominios

### **Apuntar Dominio a Hostinger**

En tu registrador de dominios (GoDaddy, Namecheap, etc.):

#### **Opción 1: Nameservers (RECOMENDADO)**

```
NS1.HOSTINGER.COM
NS2.HOSTINGER.COM
NS3.HOSTINGER.COM
NS4.HOSTINGER.COM
```

#### **Opción 2: Registros A (DNS Manual)**

```
Tipo    Nombre         Valor
A       @              123.456.789.000    (IP de tu servidor)
A       www            123.456.789.000
CNAME   api            tudominio.com
```

### **Verificar Propagación DNS**

```bash
# Esperar 24-48 horas, luego verificar
nslookup tudominio.com
dig tudominio.com

# Debe mostrar tu IP de Hostinger
```

---

## 📊 Backups de BD

### **Crear Backup Manual en Admin UI**

1. Ir a `http://localhost:8090/_/`
2. Menu → **Settings**
3. **Backups & Restores** → **Create new backup**
4. Descargar archivo `.zip`

### **Automatizar Backups (Script)**

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

## 🆘 Troubleshooting

### **Error: "Cannot connect to http://localhost:8090"**

```bash
# Verificar que PocketBase está corriendo
ps aux | grep pocketbase

# Si no está, iniciar
cd apps/pocketbase
npm run dev

# Verificar puerto está abierto
netstat -tuln | grep 8090
```

### **Error: "CORS error" en el navegador**

**Solución en PocketBase Admin UI:**

1. Settings → **API rules & previews**
2. Buscar `Create (POST)` en Properties
3. Cambiar `API Rule` a: `@request.auth.id != ""`

### **Error: "BD corrupida" o no se actualizan datos**

```bash
# Backup de seguridad
cp -r /data/pb_data /data/pb_data.backup

# Reiniciar PocketBase
pm2 restart pocketbase

# Si sigue fallando, restaurar desde backup
rm -rf /data/pb_data
cp -r /data/pb_data.backup /data/pb_data
```

### **Lento en Hostinger?**

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

### **Certificado SSL expirado**

```bash
# Renovar manualmente
sudo certbot renew --force-renewal

# O automáticamente (ya debería estar)
sudo systemctl start certbot.timer
```

---

## ✅ Checklist de Deploy

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

## 📝 Variables de Entorno (Resumen)

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:8090
VITE_API_PATH=/api
```

### **Frontend (.env.production)**
```env
VITE_API_URL=https://api.tudominio.com
VITE_API_PATH=/api
```

### **Backend (.env)**
```env
PB_SERVER_PORT=8090
PB_SERVER_HOST=127.0.0.1
```

### **Backend (.env.production)**
```env
PB_SERVER_PORT=8090
PB_SERVER_HOST=0.0.0.0
PB_PUBLIC_URL=https://tudominio.com
PB_JWT_SECRET=tu_clave_secreta_aqui
```

---

## 🎯 URLs Finales

| Servicio | Local | Producción |
|----------|-------|-----------|
| **Frontend** | http://localhost:5173 | https://tudominio.com |
| **PocketBase API** | http://localhost:8090/api | https://tudominio.com/api |
| **PocketBase Admin** | http://localhost:8090/_ | https://tudominio.com/_ |

---

## 📞 Recursos

- **PocketBase Docs:** https://pocketbase.io/docs/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Hostinger Docs:** https://support.hostinger.com/

¡Listo! Tu aplicación estará corriendo en producción. 🚀
