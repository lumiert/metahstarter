#!/bin/bash

# Define variáveis
SERVICE_NAME="metahstarter.service"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME"
WORKING_DIR="/home/metah/metahstarter"

# 1. Criar o arquivo de serviço
echo "Criando arquivo de serviço em $SERVICE_FILE..."

cat <<EOL | sudo tee $SERVICE_FILE
[Unit]
Description=Metahstarter Service
After=network.target

[Service]
WorkingDirectory=$WORKING_DIR
ExecStart=/usr/bin/npm start
Restart=always
User=metah
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# 2. Definir permissões do diretório
echo "Definindo permissões para o diretório $WORKING_DIR..."
sudo chown -R metah:metah $WORKING_DIR
sudo chmod -R 755 $WORKING_DIR

# 3. Habilitar e iniciar o serviço
echo "Habilitando e iniciando o serviço $SERVICE_NAME..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# 4. Status do serviço
echo "Verificando o status do serviço..."
sudo systemctl status $SERVICE_NAME

echo "Instalação concluída."
