#!/bin/bash

# ====================================================================
# SCRIPT DE DESPLIEGUE LOCAL PARA SMARTVITALS
# Ejecútalo desde tu máquina para actualizar la aplicación en el servidor.
# ====================================================================

set -e

# --- CONFIGURACIÓN (MODIFICA ESTAS VARIABLES) ---
SERVER_USER="dev"
SERVER_IP="LA_IP_DE_TU_SERVIDOR"            # ¡Reemplaza con tu IP!
DEST_PATH="/var/www/smartvitals"            # Debe coincidir con el script del servidor

# URLs para el entorno de producción (serán inyectadas temporalmente)
PROD_API_URL="https://LA_IP_DE_TU_SERVIDOR/api" # ¡Reemplaza con la URL real!
PROD_WS_URL="wss://LA_IP_DE_TU_SERVIDOR/ws"     # ¡Reemplaza con la URL real! (wss para websockets seguros)
# ------------------------------------------------


echo "✅ 1. Creando archivo 'environment.prod.ts' temporal..."
cat <<EOF > src/environments/environment.prod.ts
export const environment = {
  production: true,
  API_URL: '${PROD_API_URL}',
  WEBSOCKET_URL: '${PROD_WS_URL}'
};
EOF

echo "✅ 2. Construyendo la aplicación para producción..."
# Usamos 'npm ci' para asegurar una construcción consistente
npm ci
ng build

echo "✅ 3. Desplegando archivos al servidor ${SERVER_IP}..."
# rsync usará la autenticación por llave SSH que configuraste en el Paso Cero
rsync -avz --delete ./dist/front-evotek/ ${SERVER_USER}@${SERVER_IP}:${DEST_PATH}

echo "✅ 4. Limpiando el entorno temporal..."
rm src/environments/environment.prod.ts

echo "🎉 ¡Despliegue completado! La aplicación ha sido actualizada en el servidor."
