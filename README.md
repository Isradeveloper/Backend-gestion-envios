# Backend - Gestión de Envíos y Rutas Logísticas

Este proyecto es un backend desarrollado en **Node.js con TypeScript** y usa **Express.js**. También integra **Redis** y **SOCKET.IO** para mejorar el rendimiento y almacenamiento en caché.

## 🚀 Pasos para ejecutar el proyecto

### 1️⃣ Llenar las variables de entorno

Antes de ejecutar el proyecto, copia el archivo de ejemplo y modifica los valores según tu configuración.

---

### 2️⃣ Instalar dependencias

Asegúrate de tener **Yarn** instalado y ejecuta:

```sh
yarn install
```

---

### 3️⃣ Levantar los servicios con Docker Compose

Para ejecutar el backend junto con Redis, usa el siguiente comando:

```sh
 docker compose -f 'docker-compose-dev.yaml' up -d --build
```

Esto iniciará el backend y Redis en contenedores Docker.

---

### 4️⃣ Iniciar el servidor en modo desarrollo

Una vez que los contenedores estén corriendo, puedes iniciar el servidor en modo desarrollo con:

```sh
yarn dev
```

Esto recargará automáticamente los cambios en el código.

---

## 🛠 Tecnologías usadas

- **Node.js** (con TypeScript)
- **Express.js**
- **Redis**
- **MySQL**
- **Docker & Docker Compose**

---

## 📌 Notas adicionales

- Si necesitas detener los contenedores de Docker, usa:
  ```sh
  docker-compose down
  ```
- Para ver logs del backend:
  ```sh
  docker logs -f backend-gestion-envios
  ```

🚀 ¡Listo para usar! 🎯
