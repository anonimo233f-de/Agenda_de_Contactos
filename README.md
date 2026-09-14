# Agenda de Contactos

CRUD responsive de contactos con React, Express, PostgreSQL y arquitectura MVC.

## Base de datos

La base se llama `agenda_contactos` y usa las tablas `users` y `contacts`. Ejecuta [database/schema.sql](database/schema.sql) en PostgreSQL para crear la estructura. Si las tablas ya existen pero están vacías, ejecuta [database/seed.sql](database/seed.sql) para insertar los usuarios y contactos iniciales.

Después crea `.env` a partir de `.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agenda_contactos
PORT=3001
```

## Ejecutar

```bash
npm install
npm run dev:full
```

La aplicación estará en `http://localhost:5173` y la API MVC en `http://localhost:3001`.

El CRUD también está separado como microservicio independiente en [contacts-service](contacts-service). Se ejecuta con `npm run contacts-service` en `http://localhost:3002` y usa la tabla `contacts` de PostgreSQL.

Usuarios iniciales creados por la semilla:

- Administrador: `admin@agenda.com` / `admin123`
- Usuario: `carlos@agenda.com` / `user123`

La aplicación no permite usuarios con el mismo correo ni contactos repetidos dentro de la agenda del mismo usuario. La comparación ignora mayúsculas y espacios. El mismo contacto puede existir en la agenda de usuarios diferentes.

Comprueba la conexión en `http://localhost:3001/api/health`. Debe responder con `"database": "postgresql"`. Si responde `in-memory (fallback)`, revisa `DATABASE_URL` y reinicia `npm run dev:full`.

## API CRUD

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/contacts` | Listar y buscar contactos |
| GET | `/api/contacts/:id` | Consultar un contacto |
| POST | `/api/contacts` | Crear un contacto |
| PUT | `/api/contacts/:id` | Actualizar un contacto |
| DELETE | `/api/contacts/:id` | Eliminar un contacto |

## MVC

- **Vista:** `src/App.jsx` y `src/App.css`.
- **Controlador:** `server/controllers/contactController.js`.
- **Modelo:** `server/models/contactModel.js`, con consultas parametrizadas usando `pg`.
- **Rutas:** `server/routes/contactRoutes.js`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
