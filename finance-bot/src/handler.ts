import axios from 'axios'

const API_URL = process.env.FINANCE_API_URL || 'http://localhost:3333'

const HELP_MESSAGE = `*Finance Bot* 💰

*Adicionar transação:*
-Valor Nome :Categoria
+Valor Nome :Categoria
ou
-Valor Nome :Categoria #Data
+Valor Nome :Categoria #Data

*Consultas:*
!saldo — ver saldo do mês
!transações — últimas 5 transações
!help — mostrar esta mensagem

*Exemplos:*
-120.00 Combustível :Transporte
+1500 Freelance :Receita #23/05/2026
-89.90 Netflix :Lazer`

const WELCOME_MESSAGE = `Olá! Bem-vindo ao *Finance Bot* 💸

Sua conta foi vinculada com sucesso!

${HELP_MESSAGE}`

async function getUserByPhone(phone: string) {
  try {
    const res = await axios.get(`${API_URL}/auth/by-phone/${phone}`, {
      headers: { 'x-bot-token': process.env.BOT_TOKEN }
    })
    return res.data
  } catch {
    return null
  }
}

async function addTransaction(token: string, data: object) {
  const res = await axios.post(`${API_URL}/transactions`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

async function getTransactions(token: string) {
  const now = new Date()
  const res = await axios.get(
    `${API_URL}/transactions?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export async function handleMessage(sock: any, msg: any) {
  const from = msg.key.remoteJid
  const text = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || ''

  if (!text) return

  const remoteJidAlt = (msg.key as any).remoteJidAlt || ''
  const rawPhone = (remoteJidAlt || from).replace('@s.whatsapp.net', '').replace(/\D/g, '')
  const phone = rawPhone.startsWith('55') ? rawPhone.slice(2) : rawPhone
  console.log('RAW PHONE:', rawPhone)
  console.log('PHONE AFTER STRIP:', phone)
  console.log('API_URL:', API_URL)
  const user = await getUserByPhone(phone)

  if (!user) {
    await sock.sendMessage(from, {
      text: '❌Parece que você ainda não tem uma conta no Finance. Cria uma em: https://finance.example.com/register'
    })
    return
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (text.toLowerCase() === '!help') {
    await sock.sendMessage(from, { text: HELP_MESSAGE })
    return
  }

  if (text.toLowerCase() === '!saldo') {
    const txs = await getTransactions(user.token)
    const income = txs.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + t.amount, 0)
    const expense = txs.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + t.amount, 0)
    const balance = income - expense
    await sock.sendMessage(from, {
      text: `💰 *Saldo do mês*\n\nReceitas: ${fmt(income)}\nDespesas: ${fmt(expense)}\nSaldo: *${fmt(balance)}*`
    })
    return
  }

  if (text.toLowerCase() === '!transações') {
    const txs = await getTransactions(user.token)
    if (txs.length === 0) {
      await sock.sendMessage(from, { text: '📭 Nenhuma transação este mês.' })
      return
    }
    const list = txs.slice(0, 5).map((t: any) =>
      `${t.type === 'INCOME' ? '🟢' : '🔴'} ${t.title} — ${fmt(t.amount)} (${t.category})`
    ).join('\n')
    await sock.sendMessage(from, { text: `📋 *Últimas transações:*\n\n${list}` })
    return
  }

  const match = text.match(/^([+-])(\d+(?:[.,]\d{1,2})?)\s+(.+?)\s*:([^#\n]+?)(?:\s*#(\d{2}\/\d{2}\/\d{4}))?$/)
  if (match) {
    const type = match[1] === '+' ? 'INCOME' : 'EXPENSE'
    const amount = parseFloat(match[2].replace(',', '.'))
    const title = match[3].trim()
    const category = match[4].trim()
    const dateStr = match[5]
    const currentYear = new Date().getFullYear()
    let date = new Date()

    if (dateStr) {
      const [day, month, year] = dateStr.split('/')
      if (Number(year) !== currentYear) {
        await sock.sendMessage(from, {
          text: `❌ Ano inválido! A data deve ser do ano atual (${currentYear}).\n\nExemplo: #25/04/${currentYear}`
        })
        return
      }
      date = new Date(`${year}-${month}-${day}T00:00:00.000-03:00`)
    }

    try {
      await addTransaction(user.token, { title, amount, type, category, date: date.toISOString() })
      await sock.sendMessage(from, {
        text: `✅ Transação salva!\n\n${type === 'INCOME' ? '🟢 Receita' : '🔴 Despesa'}: *${fmt(amount)}*\nDescrição: ${title}\nCategoria: ${category}\nData: ${date.toLocaleDateString('pt-BR')}`
      })
    } catch {
      await sock.sendMessage(from, { text: '❌ Erro ao salvar. Tente novamente.' })
    }
    return
  }

  await sock.sendMessage(from, { text: `❓ Comando não reconhecido.\n\nDigite *!help* para ver os comandos disponíveis.` })
}