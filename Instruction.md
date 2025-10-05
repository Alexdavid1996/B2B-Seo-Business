# FOLLOW THE STEPS BELOW TO SET UP A UBUNTU 22.04 VPS FOR A NODE.JS APP WITH POSTGRESQL, NGINX, HTTPS, AND PM2
# REPLACE ALL PLACEHOLDERS (YOURDOMAIN, EMAIL, DB NAMES, ETC) AS INDICATED 
# THIS WILL WORK PERFECTLY AS LONG AS YOU FOLLOW THE STEPS CAREFULLY    



# ON Your VPS SSH.

Section 1 — Create sudo user, base packages, firewall

# run as root
adduser userexample
usermod -aG sudo userexample
su - userexample

# system update + essentials + nginx
sudo apt update && sudo apt -y upgrade
sudo apt -y install ufw curl unzip git build-essential nginx

# firewall
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable


# Create App Directory 
mkdir -p /home/userexample/apps/b2b-business


Section 2 — Node.js LTS + PM2
# Node LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt -y install nodejs

# PM2
sudo npm i -g pm2






Section 3 — DNS + HTTPS (Let’s Encrypt)

# Make sure your DNS A records point to your server:

# @ → YOUR_SERVER_IP

# www → YOUR_SERVER_IP

# stop nginx for standalone challenge
sudo systemctl stop nginx

# certbot + nginx plugin (for helper files)
sudo apt -y install certbot python3-certbot-nginx

# issue cert (replace domain + email)
sudo certbot certonly --standalone \
  -d alexdu1996sec485space.space -d www.alexdu1996sec485space.space \
  --agree-tos -m YOUREMAIL@gmail.com --non-interactive

# ensure certbot helper files exist (used by nginx conf later)
sudo install -m 644 /usr/lib/python3/dist-packages/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf /etc/letsencrypt/ || true
sudo install -m 644 "$(sudo find /usr -type f -name ssl-dhparams.pem | head -n1)" /etc/letsencrypt/ssl-dhparams.pem || true



Section 4 — Nginx reverse proxy (HTTPS)

# start nginx again
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nginx -t && sudo systemctl reload nginx


# Open a new Nginx site file
sudo nano /etc/nginx/sites-available/b2b-business.conf

#Paste this entire config (it’s already filled for your domain + path):
# Replace ALL: YOURDOMAINHERE and /home/userexample/apps/b2b-business



server {
  listen 80;
  listen [::]:80;
  server_name alexdu1996sec485space.space www.alexdu1996sec485space.space;
  return 301 https://alexdu1996sec485space.space$request_uri;
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  server_name alexdu1996sec485space.space www.alexdu1996sec485space.space;

  # Redirect www → apex
  if ($host = www.alexdu1996sec485space.space) {
    return 301 https://alexdu1996sec485space.space$request_uri;
  }

  # SSL (from Certbot)
  ssl_certificate     /etc/letsencrypt/live/alexdu1996sec485space.space/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/alexdu1996sec485space.space/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  # Vite build assets
  location /assets/ {
    root /home/userexample/apps/b2b-business/dist/public;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    try_files $uri =404;
  }

  # Public files served by Node
  location /qr-code/ {
    alias /home/userexample/apps/b2b-business/public/qr-code/;
    access_log off;
    expires max;
  }

  location /uploads/ {
    alias /home/userexample/apps/b2b-business/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    access_log off;
    try_files $uri =404;
  }
  location ~* ^/uploads/.*\.(php|html|js|css|txt|pdf|doc|docx|exe|zip)$ { return 403; }

  # API → Node
  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
    proxy_cookie_path / /;
    proxy_cookie_flags ~ secure;
    proxy_cookie_flags ~ httponly;
    proxy_cookie_flags ~ samesite=lax;
    proxy_read_timeout 120s;
    proxy_connect_timeout 30s;
    proxy_send_timeout 120s;
    proxy_buffering off;
    proxy_request_buffering off;
    proxy_redirect off;
  }

  # All HTML → Node (SSR/SEO)
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
    proxy_cookie_path / /;
    proxy_cookie_flags ~ secure;
    proxy_cookie_flags ~ httponly;
    proxy_cookie_flags ~ samesite=lax;
    proxy_read_timeout 30s;
    proxy_connect_timeout 10s;
    proxy_send_timeout 30s;
    proxy_buffering off;
    proxy_redirect off;
  }
}

# Save and exit:

Save and exit:

Press Ctrl + O, then Enter to save

Press Ctrl + X to exit

# Enable the site and reload Nginx:

sudo ln -sf /etc/nginx/sites-available/b2b-business.conf /etc/nginx/sites-enabled/b2b-business.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx






Section 5 — Transferring the files to the VPS
# Goal: upload your zipped project from your PC’s Downloads to /home/userexample/apps/b2b-business on the server, then unpack it.

# From your Windows PC (Command Prompt or PowerShell) this is going to use the root password the one you set when creating the VPS:

scp "C:\Users\alexd\Downloads\App.zip" root@153.92.210.120:/home/userexample/apps/b2b-business/


# Install the unzip package if you haven’t already:
sudo apt -y install unzip

# Navigate to the app directory:
# and unzip the file:
unzip APPNAME.zip
# Replace APPNAME.zip with the actual name of your zip file.







Section 6 — PostgreSQL: create DB & import seed

# 1) Install Postgres
sudo apt -y install postgresql postgresql-contrib

# 2) Create a DB user and database (replace placeholders)
#    DB user:    appuser_tutorial
#    DB pass:    StrongPass_ChangeMe_1235
#    Database:   appdb_tutorial

# Create/refresh the DB user (role) with password
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'appuser_tutorial') THEN
    CREATE ROLE appuser_tutorial LOGIN PASSWORD 'StrongPass_ChangeMe_1235';
  ELSE
    ALTER ROLE appuser_tutorial WITH LOGIN PASSWORD 'StrongPass_ChangeMe_1235';
  END IF;
END$$;
SQL

# Create the database owned by that user (safe to run again)
sudo -u postgres createdb -O appuser_tutorial appdb_tutorial 2>/dev/null || true

# Allow localhost password auth for that DB/user and reload Postgres
echo "host  appdb_tutorial  appuser_tutorial  127.0.0.1/32  scram-sha-256" | \
  sudo tee -a /etc/postgresql/*/main/pg_hba.conf >/dev/null
sudo systemctl reload postgresql

# Import your SQL seed (adjust path if needed)
PGPASSWORD='StrongPass_ChangeMe_1235' psql \
  -h 127.0.0.1 \
  -U appuser_tutorial \
  -d appdb_tutorial \
  -f /home/userexample/apps/b2b-business/database_app.sql

# Quick check
PGPASSWORD='StrongPass_ChangeMe_1235' psql -h 127.0.0.1 -U appuser_tutorial -d appdb_tutorial \
  -c "SELECT current_user, current_database();"










Section 7 — Create the .env file 

# Go to the app folder
cd /home/userexample/apps/b2b-business

# Create/edit .env
nano .env


# Environment variables (replace values as needed)
# Example .env file for a Node.js application
# Adjust according to your app's requirements

# .env file
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://DB_USER:DB_PASS@127.0.0.1:5432/DB_NAME

# Security
SESSION_SECRET=REPLACE_WITH_A_LONG_RANDOM_STRING

# Cookies / URLs
COOKIE_DOMAIN=.yourdomain.com
BASE_URL=https://yourdomain.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Client (Vite) routes
VITE_ADMIN_BASE_PATH=/Adminurl
VITE_EMPLOYEE_BASE_PATH=/Employeeurl




Section 8 — How to connect to the DB from your PC
# === Vars (EDIT THESE) ===
SERVER_IP="YOUR_SERVER_PUBLIC_IP"     # e.g. 153.92.110.155
CLIENT_IP="YOUR_PC_PUBLIC_IP"         # e.g. 119.92.13.188
DB_NAME="YOUR_DB_NAME"                # e.g. appdb_tutorial
DB_USER="YOUR_DB_USER"                # e.g. appuser_tutorial
DB_PASS="YOUR_DB_PASSWORD"            # e.g. StrongPass_1235

# === 1) Bind Postgres to localhost + SERVER_IP ===
sudo -u postgres psql -c "ALTER SYSTEM SET listen_addresses = '127.0.0.1, ${SERVER_IP}';"
sudo systemctl restart postgresql
sudo -u postgres psql -c "SHOW listen_addresses;"

# === 2) Allow CLIENT_IP + localhost in pg_hba.conf (put at top) ===
HBA_FILE="$(sudo -u postgres psql -tAc "show hba_file;")"
# remove any previous host rules for this db/user
sudo sed -i "/host\s\+${DB_NAME}\s\+${DB_USER}\s\+[0-9.]\+\/32\s\+scram-sha-256/d" "$HBA_FILE"
# add your PC IP and localhost rules at the top
sudo sed -i "1ihost  ${DB_NAME}  ${DB_USER}  ${CLIENT_IP}/32  scram-sha-256" "$HBA_FILE"
sudo sed -i "2ihost  ${DB_NAME}  ${DB_USER}  127.0.0.1/32      scram-sha-256" "$HBA_FILE"
sudo systemctl reload postgresql

# === 3) UFW: allow 5432 only from CLIENT_IP ===
sudo ufw allow from ${CLIENT_IP} to any port 5432 proto tcp

# === 4) Verify + test from server side (optional sanity check) ===
ss -ltnp 'sport = :5432'
PGPASSWORD="${DB_PASS}" psql -h ${SERVER_IP} -U ${DB_USER} -d ${DB_NAME} \
  -c "select current_user, inet_server_addr();"

# --- pgAdmin connection (on your PC) ---
# Host:     YOUR_SERVER_PUBLIC_IP   (same as SERVER_IP)
# Port:     5432
# Database: YOUR_DB_NAME            (or put as "Maintenance DB")
# Username: YOUR_DB_USER
# Password: YOUR_DB_PASSWORD



9 Section — Start the app with PM2 + auto-restart on reboot

# === Section 9 — Build & run with PM2 (final, fixes EACCES) ===
cd /home/userexample/apps/b2b-business

# Stop app if running
pm2 stop b2b-business || true

# Ensure you own everything here
sudo chown -R userexample:userexample .

# Nuke old build output (use sudo to bypass root-owned files)
sudo rm -rf dist

# If you STILL see "Operation not permitted", clear immutable bit (rare):
# sudo chattr -i -R dist && sudo rm -rf dist

# (Only if node_modules was installed as root and causes issues)
# sudo chown -R userexample:userexample node_modules || true

# Install deps & build
npm install
npm run build

# Start (or restart) with PM2 and persist
pm2 start dist/index.js --name b2b-business --update-env || pm2 restart b2b-business --update-env
pm2 save

# Enable PM2 on reboot (run once; if it prints a command, run it, then pm2 save)
pm2 startup systemd -u userexample --hp /home/userexample



# --- FINAL STEP: allow nginx to read your built assets ---
# Set these to YOUR actual values

APP_PATH="/home/userexample/apps/b2b-business"
DOMAIN="YOURDOMAINHERE"     # e.g. example.com (no https://)

# 1) Allow traversal on parent dirs (so nginx user can walk into APP_PATH)
sudo chmod o+rx /home
sudo chmod o+rx "$(dirname "$APP_PATH")"            # /home/userexample/apps
sudo chmod o+rx "$APP_PATH"                         # /home/userexample/apps/b2b-business

# 2) Standard web perms on the build output
cd "$APP_PATH"
sudo find dist/public -type d -exec chmod 755 {} +
sudo find dist/public -type f -exec chmod 644 {} +

# 3) Quick asset test through nginx (should return 200 OK)
ASSET="$(basename "$(ls dist/public/assets/*.js | head -n1)")"
echo "Testing: https://$DOMAIN/assets/$ASSET"
curl -I "https://$DOMAIN/assets/$ASSET"
# If you get 403 Forbidden, double-check the above steps. If 404 Not Found, ensure the asset exists and the filename is correct.