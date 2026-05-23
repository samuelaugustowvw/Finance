import 'dotenv/config'
import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authGuard, AuthRequest } from '../middlewares/authGuard'

const router = Router()
router.use(authGuard)

const defaultCategories = [
  { name: 'Alimentação', color: '#1D9E75' },
  { name: 'Moradia', color: '#378ADD' },
  { name: 'Lazer', color: '#7F77DD' },
  { name: 'Transporte', color: '#EF9F27' },
  { name: 'Saúde', color: '#E24B4A' },
  { name: 'Outros', color: '#888780' },
]

router.get('/', async (req: AuthRequest, res: Response) => {
  let categories = await prisma.category.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'asc' },
  })
  if (categories.length === 0) {
    categories = await prisma.category.createMany({
      data: defaultCategories.map(c => ({ ...c, userId: req.userId! })),
    }).then(() => prisma.category.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'asc' },
    }))
  }
  res.json(categories)
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body
  if (!name || !color) return res.status(400).json({ error: 'Nome e cor são obrigatórios' })
  const category = await prisma.category.create({
    data: { name, color, userId: req.userId! },
  })
  res.status(201).json(category)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.category.delete({ where: { id: String(req.params.id) } })
  res.status(204).send()
})

export default router