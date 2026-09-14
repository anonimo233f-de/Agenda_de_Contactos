import { Router } from 'express'
import { create, get, list, remove, update } from '../controllers/contactController.js'

const router = Router()

router.use((request, response, next) => {
  const userId = Number(request.header('x-user-id'))
  if (!Number.isInteger(userId) || userId < 1) {
    return response.status(401).json({ message: 'El microservicio requiere el header X-User-Id' })
  }
  request.userId = userId
  next()
})

router.get('/', list)
router.get('/:id', get)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id', update)
router.delete('/:id', remove)

export default router
