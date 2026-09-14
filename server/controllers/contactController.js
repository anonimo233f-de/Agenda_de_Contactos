import * as contactModel from '../models/contactModel.js';

export async function getContacts(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const isAdmin = req.user?.role === 'admin';
    const all = req.query.all === 'true' && isAdmin;
    const search = req.query.search ?? '';
    const targetUserId = req.query.userId ? Number(req.query.userId) : null;

    const contacts = await contactModel.findAll({
      userId,
      isAdmin,
      all,
      search,
      targetUserId,
    });

    res.json(contacts);
  } catch (error) {
    next(error);
  }
}

export async function getContact(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user?.role === 'admin';
    const contact = await contactModel.findById(req.params.id, userId, isAdmin);

    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado o sin permisos' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
}

export async function createContact(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'El administrador solo puede consultar usuarios y contactos' });
    }
    const userId = req.user.id;
    const first_name = req.body.first_name?.trim();
    const last_name = req.body.last_name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { phone, company, avatar_url, last_active, favorite } = req.body;

    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ message: 'Nombre, apellido, correo y teléfono son obligatorios' });
    }

    const created = await contactModel.create(
      { first_name, last_name, email, phone, company, avatar_url, last_active, favorite },
      userId
    );
    res.status(201).json(created);
  } catch (error) {
    if (error.code === 'DUPLICATE_CONTACT' || error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un contacto con ese correo en tu agenda' });
    }
    next(error);
  }
}

export async function updateContact(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'El administrador no puede modificar contactos' });
    }
    const userId = req.user.id;
    const isAdmin = req.user?.role === 'admin';
    const current = await contactModel.findById(req.params.id, userId, isAdmin);
    if (!current) {
      return res.status(404).json({ message: 'Contacto no encontrado o sin permisos para modificarlo' });
    }
    const contact = await contactModel.update(
      req.params.id,
      {
        ...current,
        ...req.body,
        email: (req.body.email ?? current.email).trim().toLowerCase(),
      },
      userId,
      isAdmin
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado o sin permisos para modificarlo' });
    }
    res.json(contact);
  } catch (error) {
    if (error.code === 'DUPLICATE_CONTACT' || error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un contacto con ese correo en tu agenda' });
    }
    next(error);
  }
}

export async function deleteContact(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'El administrador no puede eliminar contactos' });
    }
    const userId = req.user.id;
    const isAdmin = req.user?.role === 'admin';
    const deleted = await contactModel.remove(req.params.id, userId, isAdmin);

    if (!deleted) {
      return res.status(404).json({ message: 'Contacto no encontrado o sin permisos para eliminarlo' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
