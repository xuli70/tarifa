#!/bin/sh

# Reemplazar placeholder con variable de entorno
# Si PIN_CODE no esta definido, usar "1111" por defecto
PIN_CODE=${PIN_CODE:-1111}

# Reemplazar en config.js
sed -i "s/__PIN_CODE__/${PIN_CODE}/g" /usr/share/nginx/html/config.js

# Iniciar nginx
exec nginx -g 'daemon off;'
