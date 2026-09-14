import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginAsDemo, error: authError, loading } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Error en la autenticación');
    }
  };

  const handleDemoClick = (roleType) => {
    loginAsDemo(roleType);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card auth-modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">CONTROL DE ACCESO</span>
            <h2 className="modal-title">
              {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="auth-tab-switch">
          <button
            type="button"
            className={'auth-tab-btn ' + (tab === 'login' ? 'active' : '')}
            onClick={() => { setTab('login'); setLocalError(''); }}
          >
            Ingresar
          </button>
          <button
            type="button"
            className={'auth-tab-btn ' + (tab === 'register' ? 'active' : '')}
            onClick={() => { setTab('register'); setLocalError(''); }}
          >
            Registrarse
          </button>
        </div>

        <div className="demo-accounts-box">
          <span className="demo-box-title">⚡ Acceso Rápido Demo (1 Clic):</span>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn-demo-admin"
              onClick={() => handleDemoClick('admin')}
            >
              👑 Iniciar como <strong>Administrador</strong>
              <small>admin@agenda.com</small>
            </button>
            <button
              type="button"
              className="btn-demo-user"
              onClick={() => handleDemoClick('user')}
            >
              👤 Iniciar como <strong>Usuario Normal</strong>
              <small>carlos@agenda.com</small>
            </button>
          </div>
        </div>

        {(localError || authError) && (
          <div className="auth-error-banner">
            ⚠️ {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Ana Morales"
                />
              </div>

              <div className="form-group">
                <label>Rol de Usuario</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-select"
                >
                  <option value="user">👤 Usuario (Gestión de su propia agenda)</option>
                  <option value="admin">👑 Administrador (Ver todos los usuarios y contactos)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Procesando...' : tab === 'login' ? '🔑 Ingresar' : '✨ Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}