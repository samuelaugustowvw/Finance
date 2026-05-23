import 'dotenv/config'
import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authGuard, AuthRequest } from '../middlewares/authGuard'

const router = Router()
router.use(authGuard)

const schema = z.object({
    title: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1),
    date: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res: Response) => {
    const { month, year } = req.query
    const where: any = { userId: req.userId }
    if (month && year) {
        const start = new Date(Number(year), Number(month) - 1, 1)
        const end = new Date(Number(year), Number(month), 1)
        where.date = { gte: start, lt: end }
    }
    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
    })
    res.json(transactions)
})

router.post('/', async (req: AuthRequest, res: Response) => {
    const result = schema.safeParse(req.body)
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() })
    const transaction = await prisma.transaction.create({
        data: { ...result.data, userId: req.userId!, date: result.data.date ? new Date(result.data.date) : new Date() },
    })
    res.status(201).json(transaction)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
    await prisma.transaction.delete({ where: { id: String(req.params.id) } })
    res.status(204).send()
})

export default router