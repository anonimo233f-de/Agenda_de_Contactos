-- Ejecutar conectado a agenda_contactos.
-- Impide duplicados aunque el correo use mayúsculas diferentes.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS contacts_user_email_lower_unique
  ON contacts (user_id, LOWER(email));
