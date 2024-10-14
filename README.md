# RPI IMG

Grave a imagem do RPI como 64-bits NO desktop environment.

Ative o SSH com autenticação de usuário e senha e domínio de rede "metah".

# SSH

```

ssh -l metah@metah

```
ou
```

ssh -l metah@192.168.50.52 

```

# Linux - Atualizar, baixar e instalar software:

```

sudo apt update && sudo apt upgrade && sudo apt install git nodejs npm -y && sudo git clone https://github.com/lumiert/metahstarter && cd metahstarter && sudo npm i && sudo chmod +x ~/metahstarter/install.sh && sudo ./install.sh

```

# Abrir no navegador:

```

http://metah:6065 

```
