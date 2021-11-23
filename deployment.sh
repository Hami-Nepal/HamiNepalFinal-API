#!/bin/sh  
sudo rm -rf node_modules   
sudo git pull origin main
sudo npm install --unsafe-perm
sudo systemctl restart nginx
pm2 restart server