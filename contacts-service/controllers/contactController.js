import * as contactModel from '../models/contactModel.js'

function normalizeContact(body) {
  return {
    first_name: body.first_name?.trim(),
    last_name: body.last_name?.trim(),
    email: body.email?.trim().toLowerCase(),
    phone: body.phone?.trim(),
    company: body.company?.trim() || '',
    avatar_url: body.avatar_url || '',
    last_active: body.last_active,
    favorite: body.favorite,
  }
}

function requireFields(contact) {
  return contact.first_name && contact.last_name && contact.email && contact.phone
}

export async function list(request, response, next) {
  try {
    response.json(await contactModel.findAll(request.userId, request.query.search || ''))
  } catch (error) {
    next(error)
  }
}

export async function get(request, response, next) {
  try {
    const contact = await contactModel.findById(request.params.id, request.userId)
    if (!contact) return response.status(404).json({ message: 'Contacto no encontrado' })
    response.json(contact)
  } catch (error) {
    next(error)
  }
}

export async function create(request, response, next) {
  try {
    const contact = normalizeContact(request.body)
    if (!requireFields(contact)) return response.status(400).json({ message: 'Nombre, apellido, correo y teléfono son obligatorios' })
    response.status(201).json(await contactModel.create(contact, request.userId))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'Ya existe un contacto con ese correo en esta agenda' })
    next(error)
  }
}

export async function update(request, response, next) {
  try {
    const current = await contactModel.findById(request.params.id, request.userId)
    if (!current) return response.status(404).json({ message: 'Contacto no encontrado' })
    const contact = { ...current, ...normalizeContact(request.body) }
    if (!requireFields(contact)) return response.status(400).json({ message: 'Nombre, apellido, correo y teléfono son obligatorios' })
    const updated = await contactModel.update(request.params.id, contact, request.userId)
    response.json(updated)
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'Ya existe un contacto con ese correo en esta agenda' })
    next(error)
  }
}

export async function remove(request, response, next) {
  try {
    const deleted = await contactModel.remove(request.params.id, request.userId)
    if (!deleted) return response.status(404).json({ message: 'Contacto no encontrado' })
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
