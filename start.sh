INTERFACE="eth0";IP_ADDRESS="192.168.15.52";NETMASK="255.255.255.0";GATEWAY="192.168.15.1";DNS="8.8.8.8"


sudo ifconfig $INTERFACE $IP_ADDRESS netmask $NETMASK

sudo route add default gw $GATEWAY $INTERFACE

echo "nameserver $DNS" | sudo tee /etc/resolv.conf
                    
sudo systemctl restart networking

cd /home/acionador

sudo node /home/acionador/server.js
