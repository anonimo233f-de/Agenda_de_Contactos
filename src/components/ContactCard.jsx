import { getInitials } from './ContactCarousel';

export default function ContactCard({ contact, onEdit, onDelete, onToggleFavorite, showOwner = false, readOnly = false }) {
  const initials = getInitials(contact);

  return (
    <article className={'contact-row-card ' + (contact.favorite ? 'is-favorite' : '')}>
      <div className={'card-avatar-squircle ' + (!contact.avatar_url ? 'initials-style' : '')}>
        {contact.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={contact.first_name + ' ' + contact.last_name}
            className="card-avatar-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('initials-style');
              e.currentTarget.parentElement.innerText = initials;
            }}
          />
        ) : (
          <span className="card-initials">{initials}</span>
        )}
      </div>

      <div className="card-main-info">
        <div className="name-header">
          <h3 className="contact-fullname">
            {contact.first_name} {contact.last_name}
          </h3>
          {contact.last_active && (
            <span className="time-pill">{contact.last_active}</span>
          )}
        </div>
        <p className="contact-company">{contact.company || 'Sin empresa asignada'}</p>
        
        {showOwner && contact.owner_name && (
          <span className="owner-badge">
            👤 Propietario: {contact.owner_name} ({contact.owner_email})
          </span>
        )}
      </div>

      <div className="card-channels">
        <a className="contact-link email-link" href={'mailto:' + contact.email} title={'Enviar correo a ' + contact.email}>
          <span className="channel-icon">✉️</span>
          <div className="link-text-group">
            <span className="channel-label">Correo</span>
            <span className="channel-value">{contact.email}</span>
          </div>
        </a>

        <a className="contact-link phone-link" href={'tel:' + contact.phone} title={'Llamar a ' + contact.phone}>
          <span className="channel-icon">📞</span>
          <div className="link-text-group">
            <span className="channel-label">Teléfono</span>
            <span className="channel-value">{contact.phone}</span>
          </div>
        </a>
      </div>

      <div className="card-actions-group">
        {!readOnly && (
          <>
        <button
          type="button"
          className={'favorite-btn ' + (contact.favorite ? 'active' : '')}
          onClick={() => onToggleFavorite(contact)}
          aria-label={contact.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          title={contact.favorite ? 'Quitar de favoritos' : 'Marcar favorito'}
        >
          ★
        </button>

        <button
          type="button"
          className="action-btn edit-btn"
          onClick={() => onEdit(contact)}
          aria-label="Editar contacto"
          title="Modificar contacto en tiempo real"
        >
          ✏️ Editar
        </button>

        <button
          type="button"
          className="action-btn delete-btn"
          onClick={() => onDelete(contact.id)}
          aria-label="Eliminar contacto"
          title="Eliminar contacto del DOM y Base de Datos"
        >
          🗑️ Eliminar
        </button>
          </>
        )}
      </div>
    </article>
  );
}