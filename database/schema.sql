-- ==========================================================
-- AGENDA DE CONTACTOS: ESQUEMA POSTGRESQL CON ROLES Y SESIÓN
-- ==========================================================

-- 1. Crear base de datos si no existe (ejecutar por separado si es necesario)
-- CREATE DATABASE agenda_contactos;

-- 2. Tabla de Usuarios (Autenticación y Roles: admin / user)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Contactos (Vinculada a cada usuario por user_id)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  company VARCHAR(120) NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  last_active VARCHAR(50) DEFAULT '10 Mins ago',
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_contact_email UNIQUE (user_id, email)
);

-- 4. Índices para optimizar rendimiento de búsquedas y filtros
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts (user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts (favorite);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS contacts_user_email_lower_unique ON contacts (user_id, LOWER(email));

-- 5. Inserción de usuarios semilla (admin y user)
INSERT INTO users (id, name, email, password, role, avatar_url)
VALUES
  (1, 'Administrador General', 'admin@agenda.com', '$2b$10$39HCqCkeYA0SqpPo5NcDauZzunbcfBXXB.VOxZuUJXZzZD73jwtw2', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
  (2, 'Carlos Mendoza', 'carlos@agenda.com', '$2b$10$AQHWKoFZUwbuCUMEMvRcVuonxXp.I6dyQamVd.D8wgozxu6Vu4QsW', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;

-- 6. Inserción de contactos iniciales inspirados en la referencia visual
-- El administrador solo supervisa; los contactos pertenecen a usuarios normales.
INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite)
VALUES
  (2, 'Sofia', 'Ramirez', 'sofia.ramirez@example.com', '+57 300 555 0182', 'Norte Studio', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', '15 Mins ago', TRUE),
  (2, 'Mateo', 'Castro', 'mateo.castro@example.com', '+57 310 555 0144', 'Andes Labs', '', '25 Mins ago', FALSE),
  (2, 'Valentina', 'Torres', 'valentina.torres@example.com', '+57 315 555 0108', 'Lumen Co.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300', '50 Mins ago', FALSE)
ON CONFLICT DO NOTHING;
