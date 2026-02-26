# Guía de Implementación de Base de Datos - GameHub

Sigue estos pasos para activar la base de datos en tu entorno local con **WAMP**.

## 1. Crear la Base de Datos en phpMyAdmin
1. Abre tu navegador y ve a `http://localhost/phpmyadmin/`.
2. Haz clic en la pestaña **SQL** en la parte superior.
3. Abre el archivo `database.sql` que he creado en tu proyecto, copia todo su contenido y pégalo en el cuadro de texto de phpMyAdmin.
4. Pulsa el botón **Continuar** (Go). Esto creará la base de datos `gamehub_db` y las tablas necesarias.

## 2. Verificar la Configuración de PHP
El archivo `db_config.php` está configurado con los valores por defecto de WAMP:
- **Host**: `localhost`
- **Usuario**: `root`
- **Contraseña**: (vacío)
- **Base de Datos**: `gamehub_db`

Si has cambiado la contraseña del usuario `root` en tu WAMP, deberás editar el archivo `db_config.php` y poner tu contraseña en la variable `$pass`.

## 3. Probar el Sistema
1. Asegúrate de que los servicios de WAMP (Apache y MySQL) estén en verde.
2. Abre tu proyecto desde el navegador (ej: `http://localhost/Proyecto%20Final/index.html`).
3. Intenta **Registrar** un nuevo usuario.
4. Verifica en phpMyAdmin que el usuario aparezca en la tabla `usuarios`.
5. Intenta hacer **Login** con ese usuario.

---

## Cambios realizados en el código:
- **database.sql**: Script para crear las tablas.
- **db_config.php**: Conexión PDO a MySQL.
- **auth_api.php**: Endpoints para Registro y Login.
- **user_api.php**: Endpoints para Puntos e Historial.
- **auth.js**: Se ha refactorizado para enviar peticiones `fetch` a los archivos PHP en lugar de guardar datos solo en el navegador (`localStorage`).

¡Ahora tus usuarios y su progreso se guardarán permanentemente en la base de datos!
