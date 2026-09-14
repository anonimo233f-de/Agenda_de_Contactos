import bcrypt from 'bcryptjs';
import { pool, isDbConnected } from '../config/db.js';

let memoryUsers = [
  {
    id: 1,
    name: 'Administrador General',
    email: 'admin@agenda.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    email: 'carlos@agenda.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    created_at: '2026-02-01T00:00:00.000Z',
  }
];

export async function findByEmail(email) {
  if (pool) {
    if (!isDbConnected()) {
      throw new Error('PostgreSQL no está conectado');
    }
    try {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return result.rows[0];
    } catch (e) {
      throw new Error(`No se pudo consultar PostgreSQL: ${e.message}`);
    }
  }
  return memoryUsers.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
}

export async function findById(id) {
  const numericId = Number(id);
  if (pool && isDbConnected()) {
    try {
      const result = await pool.query('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1', [numericId]);
      return result.rows[0];
    } catch (e) {
      console.warn('Postgres query fallback to memory for findById:', e.message);
    }
  }
  const user = memoryUsers.find((u) => u.id === numericId);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function create({ name, email, password, role = 'user', avatar_url = '' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  if (pool) {
    if (!isDbConnected()) {
      throw new Error('PostgreSQL no está conectado');
    }
    try {
      const query = 'INSERT INTO users (name, email, password, role, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, avatar_url, created_at';
      const result = await pool.query(query, [name, email, hashedPassword, role, avatar_url]);
      return result.rows[0];
    } catch (e) {
      if (e.code === '23505') {
        const duplicateError = new Error('El correo electrónico ya está registrado');
        duplicateError.code = 'DUPLICATE_USER';
        throw duplicateError;
      }
      throw new Error(`No se pudo registrar el usuario en PostgreSQL: ${e.message}`);
    }
  }
  const newId = memoryUsers.length ? Math.max(...memoryUsers.map((u) => u.id)) + 1 : 1;
  const newUser = {
    id: newId,
    name,
    email,
    password: hashedPassword,
    role,
    avatar_url,
    created_at: new Date().toISOString()
  };
  memoryUsers.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

export async function findAllWithStats(contactsList = []) {
  if (pool && isDbConnected()) {
    try {
      const query = 'SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.created_at, COUNT(c.id)::int AS total_contacts, COUNT(CASE WHEN c.favorite THEN 1 END)::int AS favorite_contacts FROM users u LEFT JOIN contacts c ON u.id = c.user_id GROUP BY u.id ORDER BY u.role ASC, u.id ASC';
      const result = await pool.query(query);
      return result.rows;
    } catch (e) {
      console.warn('Postgres findAllWithStats fallback to memory:', e.message);
    }
  }

  return memoryUsers.map((u) => {
    const userContacts = contactsList.filter((c) => Number(c.user_id) === Number(u.id));
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar_url: u.avatar_url,
      created_at: u.created_at,
      total_contacts: userContacts.length,
      favorite_contacts: userContacts.filter((c) => c.favorite).length,
    };
  });
}