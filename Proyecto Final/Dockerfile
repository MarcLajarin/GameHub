FROM php:8.2-apache

# Instala el driver PDO para MySQL, necesario para auth_api.php y user_api.php
RUN docker-php-ext-install pdo_mysql

# Habilita mod_rewrite por si mas adelante se anaden rutas amigables
RUN a2enmod rewrite

# El servicio de Railway ya usa esta carpeta como root del deploy
COPY . /var/www/html/

# Script de arranque para que Apache escuche en el puerto que Railway asigne
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080

CMD ["/usr/local/bin/start.sh"]
