# RPI IMG

Grave a imagem do RPI como 32-bits and desktop environment

Troque a aba e ative o SSH com autenticação de usuário e senha

# NMAP

Procure o IP na rede (Utilizando NMAP):

```

nmap -O -p 22 192.168.50.0/24 

```

# Windows

Conecte-se ao RPI via SSH:

⊞ + R cmd

```

ssh -l methastarter 192.168.50.?

```

# Linux SSH - COPIE E COLE NO NANO

```

sudo nano ./install.sh

```

```
#!/bin/sh -e

clear
echo -e "\033[32m 🎈 - Iniciando a instalação - 1/3 ...\033[0m"
sudo apt update -y && sudo apt upgrade -y && sudo apt install git nodejs npm -y &&
sudo mkdir /home/acionador && cd /home/acionador &&
sudo git clone https://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@github.com/lumiert/methastarter.git &&
if [ $? -eq 0 ]; then
  clear
  echo -e "\033[32m 🐑 - Clone do repositório do GitHub bem-sucedido.\033[0m"
  sleep 2
else
  clear
  echo -e "\033[31m ❌ - Erro ao clonar o repositório do GitHub. Verifique sua conexão com a internet ou a chave de segurança.\033[0m"
  sleep 2
  exit 1
fi
clear
cd methastarter && sudo mv * ../ && cd .. && sudo rm -rf methastarter &&
sudo truncate -s 0 /etc/rc.local && clear
echo -e "\033[32m 🎈 - Instalação em andamento - 2/3 ...\033[0m"
sleep 2
sudo sh -c 'cat <<EOF > /etc/rc.local
#!/bin/sh -e
#/etc/rc.local
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.
#
# Print the IP address
_IP=\$(hostname -I) || true
if [ "\$_IP" ]; then
  echo "My IP address is \$_IP"
fi

sudo bash /home/acionador/start.sh

exit 0
EOF' && clear &&
echo -e "\033[32m 🎈 - Configurando a rede 3/3 ...\033[0m"
sleep 5
sudo npm install onoff && sudo npm install express && sudo ifconfig eth0 192.168.50.52 && sudo chmod +x /etc/rc.local && clear
echo -e "\033[32m ✔ - Instalação finalizada. Desconectando, Reiniciando...\033[0m" &&
sudo reboot

exit 0


```

# Linux SSH - COPIE E COLE NO NANO (Beta, Não testado, execute este primeiro pra ver se funciona em outra instalação futura)

```
#!/bin/sh -e

clear
echo -e "\033[32m 🎈 - Iniciando a instalação - 1/3 ...\033[0m"
sudo apt update -y && sudo apt upgrade -y && sudo apt install git nodejs npm -y &&
sudo mkdir /home/acionador && cd /home/acionador &&
sudo git clone https://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@github.com/lumiert/methastarter.git &&
if [ $? -eq 0 ]; then
  clear
  echo -e "\033[32m 🐑 - Clone do repositório do GitHub bem-sucedido.\033[0m"
  sleep 2
else
  clear
  echo -e "\033[31m ❌ - Erro ao clonar o repositório do GitHub. Verifique sua conexão com a internet ou a chave de segurança.\033[0m"
  sleep 2
  exit 1
fi
clear
cd methastarter && sudo mv * ../ && cd .. && sudo rm -rf methastarter &&
sudo truncate -s 0 /etc/rc.local && clear
echo -e "\033[32m 🎈 - Instalação em andamento - 2/3 ...\033[0m"
sleep 2
sudo sh -c 'cat <<EOF > /etc/rc.local
#!/bin/sh -e
#/etc/rc.local
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.
#
# Print the IP address
_IP=\$(hostname -I) || true
if [ "\$_IP" ]; then
  echo "My IP address is \$_IP"
fi

sudo bash /home/acionador/start.sh

exit 0
EOF' && clear &&
echo -e "\033[32m 🎈 - Configurando a rede 3/3 ...\033[0m"
sleep 5
sudo npm install onoff && sudo npm install express && sudo ifconfig eth0 192.168.50.52 && sudo chmod +x /etc/rc.local && clear
echo -e "\033[32m ✔ - Instalação finalizada. Desconectando, Reiniciando...\033[0m" && sudo npm install &&
sudo npm rebuild
sudo reboot

exit 0


```

# Linux NANO - EXECUTE O BASH

```

sudo bash ./install.sh

```
