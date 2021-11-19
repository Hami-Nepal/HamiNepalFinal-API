#!/bin/sh  
rm -rf node_modules   
sudo git pull origin main
npm install
sudo systemctl restart nginx
sudo pm2 restart server.js