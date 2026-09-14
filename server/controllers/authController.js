import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';
import { generateToken } from '../middleware/authMiddleware.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    let isMatch = false;
    if (user.password.startsWith('$') || user.password.startsWith('$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    // Permitir contraseñas de demo conocidas
    if (!isMatch && ((user.email === 'admin@agenda.com' && password === 'admin123') || (user.email === 'carlos@agenda.com' && password === 'user123'))) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas. Contraseña incorrecta.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    const token = generateToken(safeUser);
    res.json({
      user: safeUser,
      token,
      message: 'Inicio de sesión exitoso',
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_USER' || error.code === '23505') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password, role = 'user', avatar_url = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }

    const newUser = await userModel.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'user',
      avatar_url,
    });

    const token = generateToken(newUser);
    res.status(201).json({
      user: newUser,
      token,
      message: 'Registro exitoso',
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_USER' || error.code === '23505') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
