import { pool, isDbConnected } from '../config/db.js';

let memoryContacts = [
  {
    id: 1,
    user_id: 1,
    first_name: 'Jame',
    last_name: 'Michael',
    email: 'jame.michael@example.com',
    phone: '+1 555 0192',
    company: 'Apex Design',
    avatar_url: '',
    last_active: '12 Mins ago',
    favorite: true,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    first_name: 'Cecilia',
    last_name: 'Heine',
    email: 'cecilia.heine@example.com',
    phone: '+1 555 0184',
    company: 'Vogue Studios',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    last_active: '42 Mins ago',
    favorite: true,
    created_at: new Date(Date.now() - 42 * 60000).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    first_name: 'Mary',
    last_name: 'Sherlock',
    email: 'mary.sherlock@example.com',
    phone: '+1 555 0137',
    company: 'Neon Tech',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    last_active: '10 Mins ago',
    favorite: true,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 4,
    user_id: 1,
    first_name: 'Lucas',
    last_name: 'Vance',
    email: 'lucas.vance@example.com',
    phone: '+1 555 0155',
    company: 'Craft Global',
    avatar_url: '',
    last_active: '1 Hour ago',
    favorite: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 5,
    user_id: 1,
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 555 0199',
    company: 'Starlight Media',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    last_active: '3 Mins ago',
    favorite: true,
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 6,
    user_id: 2,
    first_name: 'Sofia',
    last_name: 'Ramirez',
    email: 'sofia.ramirez@example.com',
    phone: '+57 300 555 0182',
    company: 'Norte Studio',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    last_active: '15 Mins ago',
    favorite: true,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 7,
    user_id: 2,
    first_name: 'Mateo',
    last_name: 'Castro',
    email: 'mateo.castro@example.com',
    phone: '+57 310 555 0144',
    company: 'Andes Labs',
    avatar_url: '',
    last_active: '25 Mins ago',
    favorite: false,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 8,
    user_id: 2,
    first_name: 'Valentina',
    last_name: 'Torres',
    email: 'valentina.torres@example.com',
    phone: '+57 315 555 0108',
    company: 'Lumen Co.',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    last_active: '50 Mins ago',
    favorite: false,
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
  }
];

export function getMemoryContacts() {
  return memoryContacts;
}

export async function findAll({ userId, isAdmin = false, all = false, search = '', targetUserId = null }) {
  if (pool && isDbConnected()) {
    try {
      let query = 'SELECT c.id, c.user_id, c.first_name, c.last_name, c.email, c.phone, c.company, c.avatar_url, c.last_active, c.favorite, c.created_at, u.name as owner_name, u.email as owner_email FROM contacts c JOIN users u ON c.user_id = u.id WHERE 1=1';
      const params = [];

      if (!isAdmin || (!all && !targetUserId)) {
        params.push(userId);
        query += ' AND c.user_id = $' + params.length;
      } else if (isAdmin && targetUserId) {
        params.push(targetUserId);
        query += ' AND c.user_id = $' + params.length;
      }

      if (search) {
        params.push('%' + search + '%');
        const pNum = params.length;
        query += ' AND (c.first_name ILIKE $' + pNum + ' OR c.last_name ILIKE $' + pNum + ' OR c.email ILIKE $' + pNum + ' OR c.company ILIKE $' + pNum + ')';
      }

      query += ' ORDER BY c.favorite DESC, c.id DESC';
      const result = await pool.query(query, params);
      return result.rows;
    } catch (e) {
      console.warn('Postgres findAll fallback to memory:', e.message);
    }
  }

  let list = [...memoryContacts];
  if (!isAdmin || (!all && !targetUserId)) {
    list = list.filter((c) => Number(c.user_id) === Number(userId));
  } else if (isAdmin && targetUserId) {
    list = list.filter((c) => Number(c.user_id) === Number(targetUserId));
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter((c) =>
      ((c.first_name || '') + ' ' + (c.last_name || '') + ' ' + (c.email || '') + ' ' + (c.company || '')).toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => (b.favorite === a.favorite ? b.id - a.id : b.favorite ? 1 : -1));
}

export async function findById(id, userId = null, isAdmin = false) {
  const numericId = Number(id);
  if (pool && isDbConnected()) {
    try {
      let query = 'SELECT * FROM contacts WHERE id = $1';
      const params = [numericId];
      if (!isAdmin && userId) {
        query += ' AND user_id = $' + (params.length + 1);
        params.push(userId);
      }
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (e) {
      console.warn('Postgres findById fallback to memory:', e.message);
    }
  }

  return memoryContacts.find((c) => {
    if (c.id !== numericId) return false;
    if (!isAdmin && userId && Number(c.user_id) !== Number(userId)) return false;
    return true;
  });
}

export async function create(contact, userId) {
  const lastActive = contact.last_active || 'Just now';
  if (pool && isDbConnected()) {
    try {
      const query = 'INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite, created_at';
      const result = await pool.query(
        query,
        [
          userId,
          contact.first_name,
          contact.last_name,
          contact.email,
          contact.phone,
          contact.company || '',
          contact.avatar_url || '',
          lastActive,
          contact.favorite || false,
        ]
      );
      return result.rows[0];
    } catch (e) {
      if (e.code === '23505') {
        const duplicateError = new Error('Ya existe un contacto con ese correo en tu agenda');
        duplicateError.code = 'DUPLICATE_CONTACT';
        throw duplicateError;
      }
      throw new Error(`No se pudo guardar el contacto en PostgreSQL: ${e.message}`);
    }
  }

  const newId = memoryContacts.length ? Math.max(...memoryContacts.map((c) => c.id)) + 1 : 1;
  const newContact = {
    id: newId,
    user_id: Number(userId),
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company || '',
    avatar_url: contact.avatar_url || '',
    last_active: lastActive,
    favorite: contact.favorite || false,
    created_at: new Date().toISOString(),
  };
  memoryContacts.unshift(newContact);
  return newContact;
}

export async function update(id, contact, userId = null, isAdmin = false) {
  const numericId = Number(id);
  if (pool && isDbConnected()) {
    try {
      let query = 'UPDATE contacts SET first_name = $1, last_name = $2, email = $3, phone = $4, company = $5, avatar_url = $6, last_active = $7, favorite = $8, updated_at = NOW() WHERE id = $9';
      const params = [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.company || '',
        contact.avatar_url || '',
        contact.last_active || 'Just now',
        contact.favorite || false,
        numericId,
      ];

      if (!isAdmin && userId) {
        query += ' AND user_id = $' + (params.length + 1);
        params.push(userId);
      }

      query += ' RETURNING id, user_id, first_name, last_name, email, phone, company, avatar_url, last_active, favorite, created_at';
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (e) {
      if (e.code === '23505') {
        const duplicateError = new Error('Ya existe un contacto con ese correo en tu agenda');
        duplicateError.code = 'DUPLICATE_CONTACT';
        throw duplicateError;
      }
      throw new Error(`No se pudo actualizar el contacto en PostgreSQL: ${e.message}`);
    }
  }

  const index = memoryContacts.findIndex((c) => {
    if (c.id !== numericId) return false;
    if (!isAdmin && userId && Number(c.user_id) !== Number(userId)) return false;
    return true;
  });

  if (index === -1) return null;
  memoryContacts[index] = {
    ...memoryContacts[index],
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company !== undefined ? contact.company : memoryContacts[index].company,
    avatar_url: contact.avatar_url !== undefined ? contact.avatar_url : memoryContacts[index].avatar_url,
    last_active: contact.last_active !== undefined ? contact.last_active : memoryContacts[index].last_active,
    favorite: contact.favorite !== undefined ? contact.favorite : memoryContacts[index].favorite,
    updated_at: new Date().toISOString(),
  };
  return memoryContacts[index];
}

export async function remove(id, userId = null, isAdmin = false) {
  const numericId = Number(id);
  if (pool && isDbConnected()) {
    try {
      let query = 'DELETE FROM contacts WHERE id = $1';
      const params = [numericId];
      if (!isAdmin && userId) {
        query += ' AND user_id = $' + (params.length + 1);
        params.push(userId);
      }
      query += ' RETURNING id';
      const result = await pool.query(query, params);
      return result.rowCount > 0;
    } catch (e) {
      console.warn('Postgres remove contact fallback to memory:', e.message);
    }
  }

  const index = memoryContacts.findIndex((c) => {
    if (c.id !== numericId) return false;
    if (!isAdmin && userId && Number(c.user_id) !== Number(userId)) return false;
    return true;
  });

  if (index === -1) return false;
  memoryContacts.splice(index, 1);
  return true;
}