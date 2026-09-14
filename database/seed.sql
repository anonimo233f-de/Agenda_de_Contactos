-- Datos iniciales para agenda_contactos.
-- Ejecutar conectado a la base agenda_contactos.

INSERT INTO users (id, name, email, password, role, avatar_url)
VALUES
  (1, 'Administrador General', 'admin@agenda.com', '$2b$10$39HCqCkeYA0SqpPo5NcDauZzunbcfBXXB.VOxZuUJXZzZD73jwtw2', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
  (2, 'Carlos Mendoza', 'carlos@agenda.com', '$2b$10$AQHWKoFZUwbuCUMEMvRcVuonxXp.I6dyQamVd.D8wgozxu6Vu4QsW', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));

-- El administrador supervisa el sistema, pero no tiene agenda propia.
DELETE FROM contacts WHERE user_id = 1;

INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite)
VALUES
  (2, 'Sofia', 'Ramirez', 'sofia.ramirez@example.com', '+57 300 555 0182', 'Norte Studio', '', '15 Mins ago', TRUE),
  (2, 'Mateo', 'Castro', 'mateo.castro@example.com', '+57 310 555 0144', 'Andes Labs', '', '25 Mins ago', FALSE)
ON CONFLICT (user_id, email) DO NOTHING;

SELECT setval(pg_get_serial_sequence('contacts', 'id'), COALESCE((SELECT MAX(id) FROM contacts), 1));
