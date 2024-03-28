#!/bin/bash



# Substitua os valores abaixo pelos desejados
INTERFACE="eth0"
IP_ADDRESS="192.168.15.55"
NETMASK="255.255.255.0"
GATEWAY="192.168.15.1"
DNS="8.8.8.8"

# Configurar o IP
sudo ifconfig $INTERFACE $IP_ADDRESS netmask $NETMASK

# Adicionar o gateway
sudo route add default gw $GATEWAY $INTERFACE

# Configurar os servidores DNS
echo "nameserver $DNS" | sudo tee /etc/resolv.conf

echo "Configuração concluída para a interface $INTERFACE:"
echo "IP Address: $IP_ADDRESS"
echo "Netmask: $NETMASK"
echo "Gateway: $GATEWAY"
echo "DNS: $DNS"
