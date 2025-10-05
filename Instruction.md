# B2B-Business — Quick Deploy (Ubuntu 24.04 LTS)

# Recommended
# - OS: Ubuntu 24.04 LTS
# - vCPU: 1–2 | RAM: 2–4 GB | Disk: 20+ GB

# ─────────────────────────────────────────────────────────
# 0) Create deploy user & base packages (run as root)
adduser ChooseYourUsername
usermod -aG sudo ChooseYourUsername
su - ChooseYourUsername
sudo apt update && sudo apt -y upgrade
sudo apt -y install ufw curl unzip git build-essential nginx

sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# ─────────────────────────────────────────────────────────
# 1) Node LTS + PM2
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2

# ─────────────────────────────────────────────────────────
# 2) DNS (at your registrar)
# A @   YOUR_SERVER_IP
# A www YOUR_SERVER_IP

# ─────────────────────────────────────────────────────────
# 3) HTTPS certificate (Certbot standalone)
sudo systemctl stop nginx
sudo apt -y install certbot
sudo certbot certonly --standalone \
  -d YOURDOMAINHERE -d www.YOURDOMAINHERE \
  --agree-tos -m YOUR_REAL_EMAIL@example.com --non-interactive

# ─────────────────────────────────────────────────────────
# 4) Nginx (HTTPS reverse proxy)
sudo tee /etc/nginx/sites-available/b2b-business.conf >/dev/null <<'NGINX'
server {
  listen 80;
  listen [::]:80;
  server_name YOURDOMAINHERE www.YOURDOMAINHERE;
  return 301 https://YOURDOMAINHERE$request_uri;
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  server_name YOURDOMAINHERE www.YOURDOMAINHERE;

  if ($host = www.YOURDOMAINHERE) {
    return 301 https://YOURDOMAINHERE$request_uri;
  }

  # SSL (Certbot)
  ssl_certificate     /etc/letsencrypt/live/YOURDOMAINHERE/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/YOURDOMAINHERE/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  # Static assets (Vite build output)
  location /assets/ {
    root /home/ChooseYourUsername/apps/b2b-business/dist/public;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    try_files $uri =404;
  }

  # Public files served by Node
  location /qr-code/ {
    alias /home/ChooseYourUsername/apps/b2b-business/public/qr-code/;
    access_log off;
    expires max;
  }

  location /uploads/ {
    alias /home/ChooseYourUsername/apps/b2b-business/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    access_log off;
    try_files $uri =404;
  }
  location ~* ^/uploads/.*\.(php|html|js|css|txt|pdf|doc|docx|exe|zip)$ { return 403; }

  # API
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

  # HTML → Node (SSR/SEO)
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
NGINX

sudo ln -sf /etc/nginx/sites-available/b2b-business.conf /etc/nginx/sites-enabled/b2b-business.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nginx -t && sudo systemctl reload nginx

# ─────────────────────────────────────────────────────────
# 5) PostgreSQL 16
sudo apt -y install postgresql postgresql-contrib

# Create role + DB + grants
sudo -u postgres psql <<'SQL'
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'DB_USER') THEN
    CREATE ROLE DB_USER LOGIN PASSWORD 'DB_PASS';
  ELSE
    ALTER ROLE DB_USER WITH LOGIN PASSWORD 'DB_PASS';
  END IF;
END
$do$;
SQL

sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='DB_NAME'" | grep -q 1 \
  || sudo -u postgres createdb -O DB_USER DB_NAME

echo "host  DB_NAME  DB_USER  127.0.0.1/32  scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl reload postgresql

sudo -u postgres psql -d DB_NAME <<'SQL'
GRANT ALL PRIVILEGES ON DATABASE DB_NAME TO DB_USER;
GRANT USAGE ON SCHEMA public TO DB_USER;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO DB_USER;
GRANT USAGE,SELECT,UPDATE ON ALL SEQUENCES IN SCHEMA public TO DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE,SELECT,UPDATE ON SEQUENCES TO DB_USER;
SQL

# ─────────────────────────────────────────────────────────
# 6) App folder & code
mkdir -p /home/ChooseYourUsername/apps/b2b-business
cd /home/ChooseYourUsername/apps/b2b-business

# Upload your project from your computer (example from Windows PowerShell/CMD):
# scp "C:\path\to\project.zip" ChooseYourUsername@YOUR_SERVER_IP:/home/ChooseYourUsername/apps/b2b-business/
# ssh ChooseYourUsername@YOUR_SERVER_IP
# cd /home/ChooseYourUsername/apps/b2b-business && unzip project.zip

# ─────────────────────────────────────────────────────────
# 7) .env
cd /home/ChooseYourUsername/apps/b2b-business
nano .env
# Paste and edit:
# --------------------------------------------------------
# NODE_ENV=production
# PORT=5000
#
# DATABASE_URL=postgresql://DB_USER:DB_PASS@127.0.0.1:5432/DB_NAME
# SESSION_SECRET=REPLACE_LONG_RANDOM
# COOKIE_DOMAIN=.YOURDOMAINHERE
# BASE_URL=https://YOURDOMAINHERE
#
# VITE_ADMIN_BASE_PATH=/super-secure-admin
# VITE_EMPLOYEE_BASE_PATH=/super-secure-employee
# --------------------------------------------------------

# ─────────────────────────────────────────────────────────
# 8) Install, build, run
cd /home/ChooseYourUsername/apps/b2b-business
npm install
npm run build
pm2 start dist/index.js --name b2b-business
pm2 save

# ─────────────────────────────────────────────────────────
# 9) Import seed data (if provided at project root as database_app.sql)
#   (Replace DB_USER / DB_PASS / DB_NAME)
PGPASSWORD='DB_PASS' psql -h 127.0.0.1 -U DB_USER -d DB_NAME -f /home/ChooseYourUsername/apps/b2b-business/database_app.sql
rm -f /home/ChooseYourUsername/apps/b2b-business/database_app.sql

# ─────────────────────────────────────────────────────────
# 10) Default admin
# Email: admin@admin.com
# Pass : 123456789
