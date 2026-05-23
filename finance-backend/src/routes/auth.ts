import 'dotenv/config'
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      if (errors.password) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
      if (errors.email) return res.status(400).json({ error: 'Email inválido' })
      if (errors.name) return res.status(400).json({ error: 'Nome deve ter no mínimo 2 caracteres' })
      return res.status(400).json({ error: 'Dados inválidos' })
  }
  const { name, email, password } = result.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email já cadastrado' })
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed } })
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

router.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Dados inválidos' })
  const { email, password } = result.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' })
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

router.get('/by-phone/:phone', async (req: Request, res: Response) => {
  const botToken = req.headers['x-bot-token']
  if (botToken !== process.env.BOT_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' })
  }
  const user = await prisma.user.findUnique({
    where: { phone: String(req.params.phone) }
  })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  )
  res.json({ id: user.id, name: user.name, token })
})
router.post('/link-phone', async (req: Request, res: Response) => {
  const { phone } = req.body
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' })
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing && existing.id !== decoded.userId) {
      return res.status(409).json({ error: 'Número já vinculado a outra conta' })
    }
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { phone },
    })
    res.json({ message: 'Número vinculado com sucesso!', phone: user.phone })
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
})

export default router