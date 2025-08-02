#!/bin/bash

# ====================================================================
# SCRIPT DE CONFIGURACIÓN INICIAL DEL SERVIDOR UBUNTU PARA SMARTVITALS
# Se ejecuta una sola vez.
# ====================================================================

# Detiene la ejecución si algún comando falla
set -e

# --- CONFIGURACIÓN (MODIFICA ESTAS VARIABLES) ---
DOMAIN_OR_IP="LA_IP_DE_TU_SERVIDOR"  # IMPORTANTE: Reemplaza con tu IP o dominio
DEST_PATH="/var/www/smartvitals"      # Directorio donde vivirá la aplicación
# ------------------------------------------------

# Refresca la contraseña de sudo al inicio
sudo -v

echo "✅ 1. Actualizando e instalando Nginx..."
sudo apt-get update
sudo apt-get install nginx -y

echo "✅ 2. Configurando Firewall (UFW)..."
sudo ufw allow 'Nginx Full' # Puertos 80 y 443
sudo ufw allow 'OpenSSH'    # Puerto 22
sudo ufw --force enable     # Habilita el firewall sin prompt interactivo

echo "✅ 3. Creando directorio de despliegue..."
sudo mkdir -p ${DEST_PATH}
# Asigna permisos al usuario 'dev' para que pueda escribir en él
sudo chown -R dev:dev ${DEST_PATH}

echo "✅ 4. Generando certificado SSL autofirmado (para pruebas)..."
sudo mkdir -p /etc/nginx/ssl
# Comando no interactivo para generar el certificado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
 -subj "/C=MX/ST=Chiapas/L=Tuxtla/O=SmartVitals/CN=${DOMAIN_OR_IP}"

echo "✅ 5. Creando archivo de configuración de Nginx para el sitio..."
# Usamos un 'heredoc' para escribir el archivo de configuración completo.
sudo bash -c "cat > /etc/nginx/sites-available/smartvitals" <<EOF
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN_OR_IP};

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

    # Configuraciones SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    root ${DEST_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "✅ 6. Activando la configuración de Nginx y reiniciando..."
# Elimina el sitio por defecto si existe para evitar conflictos
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi
# Activa el nuevo sitio
if [ ! -f /etc/nginx/sites-enabled/smartvitals ]; then
    sudo ln -s /etc/nginx/sites-available/smartvitals /etc/nginx/sites-enabled/
fi

sudo nginx -t # Prueba la sintaxis de la configuración
sudo systemctl restart nginx

echo "🎉 ¡Servidor configurado exitosamente!"
