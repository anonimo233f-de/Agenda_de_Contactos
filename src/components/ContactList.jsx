import { useMemo, useState } from 'react';
import ContactCard from './ContactCard';

export default function ContactList({
  contacts = [],
  search = '',
  setSearch,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenCreate,
  showOwner = false,
  readOnly = false,
}) {
  const [filterType, setFilterType] = useState('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const term = (search || '').toLowerCase();
      const matchSearch =
        ((c.first_name || '') + ' ' + (c.last_name || '') + ' ' + (c.email || '') + ' ' + (c.company || '') + ' ' + (c.phone || ''))
          .toLowerCase()
          .includes(term);

      if (!matchSearch) return false;

      if (filterType === 'favorites') return !!c.favorite;
      if (filterType === 'has_company') return Boolean(c.company && c.company.trim() !== '');
      return true;
    });
  }, [contacts, search, filterType]);

  const totalFavorites = useMemo(() => contacts.filter((c) => c.favorite).length, [contacts]);
  const totalCompanies = useMemo(
    () => new Set(contacts.map((c) => c.company).filter(Boolean)).size,
    [contacts]
  );

  return (
    <section className="contact-list-section">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{contacts.length}</span>
          <span className="stat-label">Contactos Totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-number highlight-gold">{totalFavorites}</span>
          <span className="stat-label">★ Favoritos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalCompanies}</span>
          <span className="stat-label">Empresas / Grupos</span>
        </div>
      </div>

      <div className="list-toolbar">
        <div className="search-box-wrapper">
          <span className="search-lens-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, teléfono o empresa en tiempo real..."
            aria-label="Buscar contactos"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch('')}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-chips">
          <button
            type="button"
            className={'filter-chip ' + (filterType === 'all' ? 'active' : '')}
            onClick={() => setFilterType('all')}
          >
            Todos ({contacts.length})
          </button>
          <button
            type="button"
            className={'filter-chip ' + (filterType === 'favorites' ? 'active' : '')}
            onClick={() => setFilterType('favorites')}
          >
            ★ Favoritos ({totalFavorites})
          </button>
          <button
            type="button"
            className={'filter-chip ' + (filterType === 'has_company' ? 'active' : '')}
            onClick={() => setFilterType('has_company')}
          >
            🏢 Con Empresa
          </button>
        </div>

        <div className="results-summary">
          <span>{filteredContacts.length} encontrados en el DOM</span>
        </div>
      </div>

      <div className="contacts-container">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              showOwner={showOwner}
              readOnly={readOnly}
            />
          ))
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon">📇</div>
            <h4>No hay contactos que coincidan</h4>
            <p>
              {search
                ? ('No encontramos resultados para "' + search + '". Intenta con otro término.')
                : 'Tu agenda aún no tiene contactos en esta sección.'}
            </p>
            {!readOnly && <button type="button" className="btn-primary-create" onClick={onOpenCreate}>➕ Crear Contacto en Tiempo Real</button>}
          </div>
        )}
      </div>
    </section>
  );
}