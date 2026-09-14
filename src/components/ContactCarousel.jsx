import { useRef } from 'react';

export function getInitials(contact) {
  const first = contact && contact.first_name ? contact.first_name[0] : '';
  const last = contact && contact.last_name ? contact.last_name[0] : '';
  return (first + last).toUpperCase() || '??';
}

export function formatTruncatedName(contact) {
  const full = ((contact && contact.first_name || '') + ' ' + (contact && contact.last_name || '')).trim();
  if (full.length <= 11) return full;
  return full.slice(0, 10) + '...';
}

export default function ContactCarousel({ contacts = [], onSelectContact, onOpenCreate, activeContactId }) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <section className="carousel-section">
      <div className="carousel-header">
        <div className="carousel-title-group">
          <span className="carousel-pill">EN VIVO · RECIENTES</span>
          <h3 className="carousel-heading">Contactos Destacados</h3>
        </div>
        <div className="carousel-nav-buttons">
          <button
            type="button"
            className="carousel-arrow prev"
            onClick={scrollLeft}
            aria-label="Desplazar contactos anteriores"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            onClick={scrollRight}
            aria-label="Desplazar contactos siguientes"
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-track-wrapper">
        <div className="carousel-track" ref={scrollContainerRef}>
          <div
            className="carousel-item add-contact-item"
            onClick={onOpenCreate}
            role="button"
            tabIndex={0}
            title="Añadir nuevo contacto"
          >
            <div className="squircle-card add-card">
              <span className="add-plus-icon">+</span>
            </div>
            <span className="contact-name-label">Nuevo</span>
            <span className="contact-time-label">Crear DOM</span>
          </div>

          {contacts.map((contact) => {
            const initials = getInitials(contact);
            const truncatedName = formatTruncatedName(contact);
            const timeAgo = contact.last_active || 'Reciente';
            const isSelected = activeContactId === contact.id;

            return (
              <div
                key={contact.id}
                className={'carousel-item ' + (isSelected ? 'selected' : '')}
                onClick={() => onSelectContact(contact)}
                role="button"
                tabIndex={0}
                title={contact.first_name + ' ' + contact.last_name + ' (' + (contact.company || 'Sin empresa') + ')'}
              >
                <div className={'squircle-card ' + (!contact.avatar_url ? 'squircle-initials' : 'squircle-photo')}>
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={contact.first_name + ' ' + contact.last_name}
                      className="squircle-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.classList.add('squircle-initials');
                        e.currentTarget.parentElement.innerText = initials;
                      }}
                    />
                  ) : (
                    <span className="squircle-text">{initials}</span>
                  )}
                  {contact.favorite && <span className="squircle-fav-badge">★</span>}
                </div>

                <span className="contact-name-label">{truncatedName}</span>
                <span className="contact-time-label">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}