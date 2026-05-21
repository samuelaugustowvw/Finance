import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Finance API' })
})

app.listen(3333, () => {
  console.log('Finance API rodando em http://localhost:3333')
})