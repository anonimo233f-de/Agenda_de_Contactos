# Contacts Service

Microservicio independiente para el CRUD de contactos. Usa la tabla `contacts` de PostgreSQL y no contiene usuarios ni autenticación; recibe el usuario autenticado desde el gateway mediante `X-User-Id`.

## Ejecutar

Desde la raíz del proyecto:

```bash
npm run contacts-service
```

Servicio: `http://localhost:3002`

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/contacts` | Listar contactos del usuario |
| GET | `/api/contacts/:id` | Obtener un contacto |
| POST | `/api/contacts` | Crear contacto |
| PUT | `/api/contacts/:id` | Actualizar contacto |
| DELETE | `/api/contacts/:id` | Eliminar contacto |

Todas las solicitudes CRUD requieren el header:

```http
X-User-Id: 4
```

Ejemplo de creación:

```bash
curl -X POST http://localhost:3002/api/contacts -H "Content-Type: application/json" -H "X-User-Id: 4" -d "{\"first_name\":\"Ana\",\"last_name\":\"Lopez\",\"email\":\"ana@example.com\",\"phone\":\"+57 300 000 0000\"}"
```

El microservicio devuelve `409` si el usuario ya tiene un contacto con ese correo.
