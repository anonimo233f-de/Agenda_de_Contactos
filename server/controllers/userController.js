import * as userModel from '../models/userModel.js';
import * as contactModel from '../models/contactModel.js';

export async function getAllUsers(req, res, next) {
  try {
    const memoryContacts = contactModel.getMemoryContacts ? contactModel.getMemoryContacts() : [];
    const users = await userModel.findAllWithStats(memoryContacts);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserContacts(req, res, next) {
  try {
    const targetUserId = req.params.id;
    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const contacts = await contactModel.findAll({
      userId: targetUserId,
      isAdmin: true,
      targetUserId,
    });
    res.json({ user, contacts });
  } catch (error) {
    next(error);
  }
}
