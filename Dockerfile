FROM php:8.2-apache

# Instala el driver PDO para MySQL, necesario para auth_api.php y user_api.php
RUN docker-php-ext-install pdo_mysql

# Habilita mod_rewrite por si más adelante se añaden rutas amigables
RUN a2enmod rewrite

# Copiamos el contenido real de la app al document root de Apache
COPY "Proyecto Final/" /var/www/html/

# Script de arranque para que Apache escuche en el puerto que Railway asigne
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080

CMD ["/usr/local/bin/start.sh"]
