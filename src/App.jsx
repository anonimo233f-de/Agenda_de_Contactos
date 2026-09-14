import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ContactCarousel from './components/ContactCarousel';
import ContactList from './components/ContactList';
import ContactModal from './components/ContactModal';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import {
  fetchContacts,
  createContact as apiCreateContact,
  updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact,
  fetchHealth,
} from './services/api';
import './App.css';

const INITIAL_FALLBACK_CONTACTS = [
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
  },
];

function MainApp() {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();

  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('agenda-contacts-data');
      return saved ? JSON.parse(saved) : INITIAL_FALLBACK_CONTACTS;
    } catch {
      return INITIAL_FALLBACK_CONTACTS;
    }
  });

  const [currentView, setCurrentView] = useState('agenda');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [search, setSearch] = useState('');
  const [activeContactId, setActiveContactId] = useState(null);

  const [pendingCreate, setPendingCreate] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [notice, setNotice] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Effect to open create modal after successful login if pendingCreate was set
  useEffect(() => {
    if (user && pendingCreate) {
      setEditingContact(null);
      setIsFormOpen(true);
      setPendingCreate(false);
    }
  }, [user, pendingCreate]);

  const handleOpenCreate = () => {
    if (user) {
      setEditingContact(null);
      setIsFormOpen(true);
    } else {
      setPendingCreate(true);
      setIsAuthOpen(true);
    }
  };

  useEffect(() => {
    localStorage.setItem('agenda-contacts-data', JSON.stringify(contacts));
  }, [contacts]);

  const loadContacts = useCallback(async () => {
    try {
      const health = await fetchHealth();
      setIsOnline(health.database === 'postgresql');

      const data = await fetchContacts({
        all: isAdmin && showAllContacts,
        userId: isAdmin ? selectedUserId : null,
      });

      if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch {
      console.warn('API no disponible, operando en modo local sincronizado.');
    }
  }, [isAdmin, showAllContacts, selectedUserId]);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }
    loadContacts();
  }, [loadContacts, user]);

  const showToast = (message) => {
    setNotice(message);
    setTimeout(() => {
      setNotice((prev) => (prev === message ? '' : prev));
    }, 4000);
  };

  const handleCreateContact = async (formData) => {
    const tempId = Date.now();
    const newContact = {
      ...formData,
      id: tempId,
      user_id: user?.id || 1,
      created_at: new Date().toISOString(),
    };

    setContacts((prev) => [newContact, ...prev]);
    setIsFormOpen(false);
    showToast('✨ Contacto añadido al DOM en tiempo real.');

    try {
      const saved = await apiCreateContact(formData);
      setContacts((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
    } catch (err) {
      setContacts((prev) => prev.filter((c) => c.id !== tempId));
      showToast(err.message || 'No se pudo crear el contacto.');
    }
  };

  const handleUpdateContact = async (formData) => {
    if (!editingContact) return;
    const targetId = editingContact.id;

    setContacts((prev) =>
      prev.map((c) => (c.id === targetId ? { ...c, ...formData } : c))
    );
    setIsFormOpen(false);
    setEditingContact(null);
    showToast('✏️ Contacto modificado en tiempo real.');

    try {
      await apiUpdateContact(targetId, formData);
    } catch (err) {
      setContacts((prev) => prev.map((c) => (c.id === targetId ? editingContact : c)));
      showToast(err.message || 'No se pudo modificar el contacto.');
    }
  };

  const handleSaveContact = (formData) => {
    if (editingContact) {
      handleUpdateContact(formData);
    } else {
      handleCreateContact(formData);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este contacto? Se actualizará el DOM de inmediato.')) {
      return;
    }

    const removedContact = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('🗑️ Contacto eliminado del DOM.');

    try {
      await apiDeleteContact(id);
    } catch (err) {
      console.warn('Eliminado en modo local:', err.message);
    }
  };

  const handleToggleFavorite = async (contact) => {
    const updated = { ...contact, favorite: !contact.favorite };
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? updated : c)));

    try {
      await apiUpdateContact(contact.id, { favorite: updated.favorite });
    } catch (err) {
      console.warn('Favorito actualizado localmente:', err.message);
    }
  };

  const handleSelectContactFromCarousel = (contact) => {
    setActiveContactId(contact.id);
    setSearch(contact.first_name);
    showToast('🔍 Enfocando contacto en la lista');
  };

  const handleAdminSelectUser = (userId) => {
    setSelectedUserId(userId);
    setShowAllContacts(false);
    setCurrentView('agenda');
    showToast('👑 Filtrando agenda por usuario');
  };

  const handleAdminShowAll = () => {
    setSelectedUserId(null);
    setShowAllContacts(true);
    setCurrentView('agenda');
    showToast('🌐 Mostrando todos los contactos del sistema');
  };

  return (
    <main className="app-shell">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreate={() => {
          if (isAdmin) return;
          setEditingContact(null);
          setIsFormOpen(true);
        }}
        isOnline={isOnline}
      />

      {notice && (
        <div className="toast-notification" role="alert">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}

      <section className="intro-section">
        <div className="intro-text">
          <div className="badge-row">
            <span className="eyebrow-tag">
              {isAdmin ? 'SESIÓN ADMINISTRADOR' : 'ESPACIO PERSONAL'}
            </span>
            <span className="theme-indicator-tag">
              {isDark ? '🌙 Modo Fondo Negro' : '☀️ Modo Fondo Blanco'}
            </span>
          </div>
          <h2 className="intro-headline">
            Todo tu círculo,<br />
            <em>bien conectado.</em>
          </h2>
          <p className="intro-subtext">
            Gestiona tus contactos en tiempo real con manipulación reactiva del DOM,
            diseño visual Squircle, modo claro/oscuro y control de roles.
          </p>
        </div>

        <div className="intro-actions">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={() => {
              if (isAdmin) return;
              setEditingContact(null);
              setIsFormOpen(true);
            }}
            disabled={isAdmin}
          >
            <span className="btn-icon">{isAdmin ? '👁' : '+'}</span>
            <span>{isAdmin ? 'Solo lectura' : 'Nuevo Contacto'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setCurrentView(currentView === 'admin' ? 'agenda' : 'admin')}
            >
              {currentView === 'admin' ? '📒 Ir a Mi Agenda' : '👑 Abrir Panel Administrador'}
            </button>
          )}
        </div>
      </section>

      {isAdmin && (showAllContacts || selectedUserId) && (
        <div className="admin-filter-bar">
          <span>
            👁️ Estás viendo:{' '}
            <strong>
              {showAllContacts
                ? 'Todos los contactos de todos los usuarios'
                : 'Contactos filtrados por usuario seleccionado'}
            </strong>
          </span>
          <button
            type="button"
            className="btn-clear-admin-filter"
            onClick={() => {
              setSelectedUserId(null);
              setShowAllContacts(false);
            }}
          >
            Volver a mi agenda personal
          </button>
        </div>
      )}

      {currentView === 'admin' && isAdmin ? (
        <AdminDashboard
          selectedUserId={selectedUserId}
          onSelectUserFilter={handleAdminSelectUser}
          onShowAllContacts={handleAdminShowAll}
        />
      ) : (
        <>
          <ContactCarousel
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={handleSelectContactFromCarousel}
            onOpenCreate={() => {
              if (isAdmin) return;
              setEditingContact(null);
              setIsFormOpen(true);
            }}
          />

          <ContactList
            contacts={contacts}
            search={search}
            setSearch={setSearch}
            onEdit={(contact) => {
              setEditingContact(contact);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteContact}
            onToggleFavorite={handleToggleFavorite}
            onOpenCreate={() => {
              if (isAdmin) return;
              setEditingContact(null);
              setIsFormOpen(true);
            }}
            showOwner={isAdmin && (showAllContacts || !!selectedUserId)}
            readOnly={isAdmin}
          />
        </>
      )}

      <footer className="app-footer">
        <div className="footer-left">
          <strong>Agenda de Contactos Profesional</strong> · React + Node/Express + PostgreSQL
        </div>
        <div className="footer-right">
          <span>CRUD en Tiempo Real</span>
          <span>·</span>
          <span>Roles (Admin / User)</span>
          <span>·</span>
          <span>Fondo Blanco/Negro</span>
        </div>
      </footer>

      <ContactModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}