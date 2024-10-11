IP_ADDRESS="192.168.50.52";GATEWAY="192.168.50.1";DNS="8.8.8.8"


sudo nmcli connection modify "Wired connection 1" ip4.addresses $IP_ADDRESS ipv4.gateway $GATEWAY ipv4.dns $DNS ipv4.method manual &&
sudo nmcli connection up "Wired connection 1" &&

cd /home/acionador

sudo node /home/acionador/server.js
