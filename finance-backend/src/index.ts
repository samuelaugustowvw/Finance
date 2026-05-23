import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Finance API' }))
app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)

app.listen(3333, () => console.log('Finance API rodando em http://localhost:3333'))