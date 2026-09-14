import { pool } from '../config/db.js'

const fields = 'id, user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite, created_at, updated_at'

export async function findAll(userId, search = '') {
  const result = await pool.query(
    `SELECT ${fields} FROM contacts
     WHERE user_id = $1
       AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2 OR company ILIKE $2)
     ORDER BY favorite DESC, first_name ASC, last_name ASC`,
    [userId, `%${search}%`],
  )
  return result.rows
}

export async function findById(id, userId) {
  const result = await pool.query(
    `SELECT ${fields} FROM contacts WHERE id = $1 AND user_id = $2`,
    [id, userId],
  )
  return result.rows[0]
}

export async function create(contact, userId) {
  const result = await pool.query(
    `INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${fields}`,
    [userId, contact.first_name, contact.last_name, contact.email, contact.phone, contact.company || '', contact.avatar_url || '', contact.last_active || 'Just now', contact.favorite ?? false],
  )
  return result.rows[0]
}

export async function update(id, contact, userId) {
  const result = await pool.query(
    `UPDATE contacts
     SET first_name = $1, last_name = $2, email = $3, phone = $4, company = $5,
         avatar_url = $6, last_active = $7, favorite = $8, updated_at = NOW()
     WHERE id = $9 AND user_id = $10
     RETURNING ${fields}`,
    [contact.first_name, contact.last_name, contact.email, contact.phone, contact.company || '', contact.avatar_url || '', contact.last_active || 'Just now', contact.favorite ?? false, id, userId],
  )
  return result.rows[0]
}

export async function remove(id, userId) {
  const result = await pool.query(
    'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId],
  )
  return result.rowCount > 0
}
