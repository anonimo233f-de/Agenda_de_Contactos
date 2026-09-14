import { useState, useEffect } from 'react';
import { getInitials } from './ContactCarousel';

const AVATAR_PRESETS = [
  { label: 'Iniciales (Oscuro)', url: '' },
  { label: 'Mujer (Castaña)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
  { label: 'Mujer (Studio Azul)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300' },
  { label: 'Mujer (Rubia)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
  { label: 'Hombre (Elegante)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
  { label: 'Hombre (Casual)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
];

export default function ContactModal({ isOpen, onClose, onSave, editingContact }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    avatar_url: '',
    last_active: '10 Mins ago',
    favorite: false,
  });

  useEffect(() => {
    if (editingContact) {
      setFormData({
        first_name: editingContact.first_name || '',
        last_name: editingContact.last_name || '',
        email: editingContact.email || '',
        phone: editingContact.phone || '',
        company: editingContact.company || '',
        avatar_url: editingContact.avatar_url || '',
        last_active: editingContact.last_active || '10 Mins ago',
        favorite: !!editingContact.favorite,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        avatar_url: '',
        last_active: 'Just now',
        favorite: false,
      });
    }
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  const initials = getInitials(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Por favor completa los campos obligatorios (*)');
      return;
    }
    onSave(formData);
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">
              {editingContact ? 'MODIFICAR ELEMENTO DEL DOM' : 'CREACIÓN EN TIEMPO REAL'}
            </span>
            <h2 className="modal-title">
              {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div className="live-preview-box">
          <div className="preview-label">Vista Previa en Vivo (Carrusel / Tarjeta):</div>
          <div className="preview-content">
            <div className={'squircle-card ' + (!formData.avatar_url ? 'squircle-initials' : 'squircle-photo')}>
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="squircle-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.classList.add('squircle-initials');
                    e.currentTarget.parentElement.innerText = initials;
                  }}
                />
              ) : (
                <span className="squircle-text">{initials}</span>
              )}
              {formData.favorite && <span className="squircle-fav-badge">★</span>}
            </div>
            <div className="preview-info">
              <strong>{(formData.first_name || 'Nombre') + ' ' + (formData.last_name || 'Apellido')}</strong>
              <span>{(formData.company || 'Sin empresa') + ' · '}{formData.last_active || 'Reciente'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form-grid">
          <div className="form-row two-cols">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Ej. Jame"
              />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Ej. Michael"
              />
            </div>
          </div>

          <div className="form-row two-cols">
            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jame.michael@example.com"
              />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 0192"
              />
            </div>
          </div>

          <div className="form-row two-cols">
            <div className="form-group">
              <label>Empresa u Organización</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Ej. Apex Design"
              />
            </div>
            <div className="form-group">
              <label>Estado / Última Actividad</label>
              <input
                type="text"
                value={formData.last_active}
                onChange={(e) => setFormData({ ...formData, last_active: e.target.value })}
                placeholder="Ej. 12 Mins ago, En línea..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Foto de Avatar (URL o Presets)</label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://images.unsplash.com/... (o deja vacío para iniciales)"
            />
            <div className="preset-buttons">
              <span className="preset-title">Presets rápidos:</span>
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={'preset-chip ' + (formData.avatar_url === preset.url ? 'active' : '')}
                  onClick={() => setFormData({ ...formData, avatar_url: preset.url })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.favorite}
              onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
            />
            <span className="custom-check-text">★ Marcar como contacto favorito</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {editingContact ? '💾 Guardar Cambios' : '➕ Crear Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}