const BASE_URL = '/api';

function getHeaders(token = null) {
  const currentToken = token || localStorage.getItem('agenda-token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (currentToken) {
    headers.Authorization = 'Bearer ' + currentToken;
  }
  return headers;
}

export async function fetchHealth() {
  try {
    const res = await fetch(BASE_URL + '/health');
    if (!res.ok) throw new Error('Offline');
    return await res.json();
  } catch {
    return { status: 'offline', database: 'local' };
  }
}

export async function fetchContacts({ search = '', all = false, userId = null } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (all) params.set('all', 'true');
  if (userId) params.set('userId', userId);

  const res = await fetch(BASE_URL + '/contacts?' + params.toString(), {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar contactos');
  return await res.json();
}

export async function createContact(contactData) {
  const res = await fetch(BASE_URL + '/contacts', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error('Error al crear contacto');
  return await res.json();
}

export async function updateContact(id, contactData) {
  const res = await fetch(BASE_URL + '/contacts/' + id, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw new Error('Error al actualizar contacto');
  return await res.json();
}

export async function deleteContact(id) {
  const res = await fetch(BASE_URL + '/contacts/' + id, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar contacto');
  return true;
}

export async function fetchAllUsers() {
  const res = await fetch(BASE_URL + '/users', {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar usuarios (Requiere rol Admin)');
  return await res.json();
}

export async function fetchUserContacts(userId) {
  const res = await fetch(BASE_URL + '/users/' + userId + '/contacts', {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar contactos del usuario');
  return await res.json();
}