import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ currentView, setCurrentView, onOpenAuth, onOpenCreate, isOnline }) {
  const { user, isAdmin, logout, loginAsDemo } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="topbar">
      <div className="brand-group">
        <div className="brand-mark">AC</div>
        <div className="brand-info">
          <p className="eyebrow">AGENDA PROFESIONAL 2026</p>
          <h1>Agenda de Contactos</h1>
        </div>
      </div>

      <div className="topbar-controls">
        <div className={'connection-badge ' + (isOnline ? 'online' : 'local')} title={isOnline ? 'Conectado a PostgreSQL' : 'Modo memoria / local'}>
          <span className="status-dot" />
          <span className="status-text">{isOnline ? 'PostgreSQL Conectado' : 'Almacenamiento Local'}</span>
        </div>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Cambiar tema claro/oscuro"
          title={isDark ? 'Cambiar a modo claro (Fondo blanco)' : 'Cambiar a modo oscuro (Fondo negro)'}
        >
          <div className={'toggle-track ' + (isDark ? 'dark' : 'light')}>
            <span className="toggle-icon sun">☀️</span>
            <span className="toggle-icon moon">🌙</span>
            <div className="toggle-thumb" />
          </div>
          <span className="theme-label">{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>

        {isAdmin && (
          <div className="nav-tabs">
            <button
              type="button"
              className={'nav-tab ' + (currentView === 'agenda' ? 'active' : '')}
              onClick={() => setCurrentView('agenda')}
            >
              📒 Mi Agenda
            </button>
            <button
              type="button"
              className={'nav-tab admin-tab ' + (currentView === 'admin' ? 'active' : '')}
              onClick={() => setCurrentView('admin')}
            >
              👑 Panel Admin
            </button>
          </div>
        )}

        {user ? (
          <div className="user-profile-menu">
            <div className="user-avatar-chip">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="user-nav-avatar" />
              ) : (
                <div className="user-nav-initials">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="user-nav-details">
                <span className="user-nav-name">{user.name}</span>
                <span className={'role-badge ' + user.role}>
                  {user.role === 'admin' ? '⭐ Administrador' : '👤 Usuario'}
                </span>
              </div>
            </div>

            <div className="user-actions">
              <button
                type="button"
                className="btn-text-sm"
                onClick={() => loginAsDemo(isAdmin ? 'user' : 'admin')}
                title="Cambiar rápido de rol para probar"
              >
                🔄 Ver como {isAdmin ? 'Usuario' : 'Admin'}
              </button>
              <button
                type="button"
                className="btn-danger-sm"
                onClick={logout}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="login-btn-header"
            onClick={onOpenAuth}
          >
            🔑 Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}