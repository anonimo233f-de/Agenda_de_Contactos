import { useState, useEffect } from 'react';
import { fetchAllUsers } from '../services/api';

export default function AdminDashboard({ onSelectUserFilter, selectedUserId, onShowAllContacts }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSqlDoc, setShowSqlDoc] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch {
      setUsers([
        {
          id: 1,
          name: 'Administrador General',
          email: 'admin@agenda.com',
          role: 'admin',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          total_contacts: 5,
          favorite_contacts: 4,
          created_at: '2026-01-01',
        },
        {
          id: 2,
          name: 'Carlos Mendoza',
          email: 'carlos@agenda.com',
          role: 'user',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          total_contacts: 3,
          favorite_contacts: 1,
          created_at: '2026-02-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalSystemContacts = users.reduce((acc, u) => acc + (u.total_contacts || 0), 0);
  const totalSystemFavorites = users.reduce((acc, u) => acc + (u.favorite_contacts || 0), 0);

  const sqlSnippet = '-- 1. Tabla de Usuarios con Roles\n' +
    'CREATE TABLE IF NOT EXISTS users (\n' +
    '  id SERIAL PRIMARY KEY,\n' +
    '  name VARCHAR(100) NOT NULL,\n' +
    '  email VARCHAR(160) NOT NULL UNIQUE,\n' +
    '  password VARCHAR(255) NOT NULL,\n' +
    '  role VARCHAR(20) NOT NULL DEFAULT \'user\' CHECK (role IN (\'admin\', \'user\')),\n' +
    '  avatar_url TEXT DEFAULT \'\',\n' +
    '  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n' +
    ');\n\n' +
    '-- 2. Tabla de Contactos vinculada a cada Usuario\n' +
    'CREATE TABLE IF NOT EXISTS contacts (\n' +
    '  id SERIAL PRIMARY KEY,\n' +
    '  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n' +
    '  first_name VARCHAR(80) NOT NULL,\n' +
    '  last_name VARCHAR(80) NOT NULL,\n' +
    '  email VARCHAR(160) NOT NULL,\n' +
    '  phone VARCHAR(30) NOT NULL,\n' +
    '  company VARCHAR(120) NOT NULL DEFAULT \'\',\n' +
    '  avatar_url TEXT DEFAULT \'\',\n' +
    '  last_active VARCHAR(50) DEFAULT \'10 Mins ago\',\n' +
    '  favorite BOOLEAN NOT NULL DEFAULT FALSE,\n' +
    '  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n' +
    ');\n\n' +
    '-- 3. Consulta de Administrador: Ver todos los usuarios y sus cantidades de contactos\n' +
    'SELECT u.id, u.name, u.email, u.role, u.created_at,\n' +
    '       COUNT(c.id) AS total_contacts,\n' +
    '       COUNT(CASE WHEN c.favorite THEN 1 END) AS favorite_contacts\n' +
    'FROM users u\n' +
    'LEFT JOIN contacts c ON u.id = c.user_id\n' +
    'GROUP BY u.id\n' +
    'ORDER BY u.role ASC, u.id ASC;\n\n' +
    '-- 4. Consulta de Administrador: Ver todos los contactos con datos del usuario propietario\n' +
    'SELECT c.*, u.name AS owner_name, u.email AS owner_email\n' +
    'FROM contacts c\n' +
    'JOIN users u ON c.user_id = u.id\n' +
    'ORDER BY c.favorite DESC, c.id DESC;';

  return (
    <section className="admin-dashboard-section">
      <div className="admin-header-banner">
        <div>
          <span className="admin-pill">VISTA PRIVILEGIADA · ROL ADMINISTRADOR</span>
          <h2>Supervisión Global de Usuarios y Contactos</h2>
          <p className="admin-subtitle">
            Como Administrador, puedes auditar todas las cuentas, inspeccionar los contactos creados por cada usuario y ver las consultas SQL.
          </p>
        </div>
        <button
          type="button"
          className="btn-sql-toggle"
          onClick={() => setShowSqlDoc(!showSqlDoc)}
        >
          {showSqlDoc ? '✕ Ocultar Consultas SQL' : '📜 Ver Consultas SQL de Tablas'}
        </button>
      </div>

      {showSqlDoc && (
        <div className="sql-doc-panel">
          <div className="sql-header">
            <h4>📌 Consultas SQL para la Estructura de Tablas y Roles (PostgreSQL)</h4>
            <span className="sql-badge">schema.sql</span>
          </div>
          <pre className="sql-code-block">{sqlSnippet}</pre>
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Usuarios Registrados</span>
          <strong className="stat-value">{users.length}</strong>
          <span className="stat-sub">{users.filter((u) => u.role === 'admin').length} Administradores · {users.filter((u) => u.role === 'user').length} Usuarios</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Contactos en el Sistema</span>
          <strong className="stat-value">{totalSystemContacts}</strong>
          <span className="stat-sub">Sincronizados en tiempo real</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Favoritos Globales</span>
          <strong className="stat-value highlight-gold">{totalSystemFavorites}</strong>
          <span className="stat-sub">Destacados por los usuarios</span>
        </div>
      </div>

      <div className="users-table-card">
        <div className="users-table-header">
          <h3>Usuarios Registrados en el Sistema</h3>
          <div className="table-quick-actions">
            <button
              type="button"
              className={'btn-filter-user ' + (!selectedUserId ? 'active' : '')}
              onClick={onShowAllContacts}
            >
              🌐 Ver Contactos de Todos
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Cargando usuarios...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Total Contactos</th>
                  <th>Favoritos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isFiltered = selectedUserId === u.id;
                  return (
                    <tr key={u.id} className={isFiltered ? 'row-selected' : ''}>
                      <td>
                        <div className="user-cell">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="table-avatar" />
                          ) : (
                            <div className="table-initials">
                              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="user-meta">
                            <strong>{u.name}</strong>
                            <small>ID: #{u.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={'role-tag ' + u.role}>
                          {u.role === 'admin' ? '⭐ Administrador' : '👤 Usuario'}
                        </span>
                      </td>
                      <td>
                        <span className="contacts-count-badge">{u.total_contacts || 0} contactos</span>
                      </td>
                      <td>
                        <span className="fav-count-badge">★ {u.favorite_contacts || 0}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={'btn-inspect ' + (isFiltered ? 'inspecting' : '')}
                          onClick={() => onSelectUserFilter(u.id)}
                          title="Filtrar la agenda para ver solo los contactos de este usuario"
                        >
                          {isFiltered ? '✓ Viendo Contactos' : '🔍 Ver Contactos'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}