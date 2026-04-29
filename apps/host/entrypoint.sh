#!/bin/sh
set -e

HOST=${HOST:-web}

CONFDIR=/etc/nginx/conf
[ -d /etc/nginx/conf.d ] && CONFDIR=/etc/nginx/conf.d

cat <<EOF > $CONFDIR/default.conf
server {
  listen                80;
  server_name           $HOST;
  access_log            /dev/stdout;
  error_log             /dev/stderr;

  add_header X-Frame-Options SAMEORIGIN always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com https://accounts.google.com https://www.gstatic.com https://cdn.onesignal.com https://api.onesignal.com https://onesignal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://onesignal.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; frame-src https://auth.turnkey.com https://verify.walletconnect.com https://app.insightx.network blob:; worker-src 'self' blob:" always;

  root /app;
  location /healthz {
    return 200 'OK';
    add_header Content-Type text/plain;
  }
  location / {
    try_files \$uri \$uri.html /index.html;
  }

  location = /.well-known/apple-app-site-association {
      default_type application/json;
      try_files \$uri =404;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|otf|mp4|webm)$ {
    try_files \$uri =404;
    access_log off;
  }

  location @custom_404 {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    return 404 "Not Found";
  }

  error_page 404 = @custom_404;


  # # Media: images, icons, video, audio, HTC
  # location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff2)$ {
  #   expires 1M;
  #   access_log off;
  #   add_header Cache-Control "public";
  # }
}
EOF

# Starting nginx
exec nginx -g "daemon off;"
