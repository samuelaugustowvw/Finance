import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { TransactionModal } from '../components/TransactionModal'
import { api } from '../lib/api'

interface Transaction {
  id: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
}

const categoryColors: Record<string, string> = {
  'Alimentação': '#1D9E75',
  'Moradia': '#378ADD',
  'Lazer': '#7F77DD',
  'Transporte': '#EF9F27',
  'Saúde': '#E24B4A',
  'Outros': '#888780',
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  async function loadTransactions() {
    const { data } = await api.get(`/transactions?month=${month}&year=${year}`)
    setTransactions(data)
  }

  useEffect(() => { loadTransactions() }, [month])

  const filtered = transactions.filter(t => filter === 'ALL' ? true : t.type === filter)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  async function deleteTransaction(id: string) {
    await api.delete(`/transactions/${id}`)
    loadTransactions()
  }

  function downloadTXT() {
    const pad = (str: string, len: number) => str.substring(0, len).padEnd(len)
    
    const header = `${pad('Data', 12)}| ${pad('Descrição', 30)}| ${pad('Categoria', 15)}| ${pad('Tipo', 10)}| Valor`
    const divider = '-'.repeat(80)
    
    const lines = filtered.map(t =>
      `${pad(new Date(t.date).toLocaleDateString('pt-BR'), 12)}| ${pad(t.title, 30)}| ${pad(t.category, 15)}| ${pad(t.type === 'INCOME' ? 'Receita' : 'Despesa', 10)}| ${t.type === 'INCOME' ? '+' : '-'} ${fmt(t.amount)}`
    ).join('\n')

    const income = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

    const content = `FINANCE — Transações de ${months[month - 1]} ${year}
  ${divider}
  ${header}
  ${divider}
  ${lines || 'Nenhuma transação encontrada'}
  ${divider}
  Total Receitas:  ${fmt(income)}
  Total Despesas:  ${fmt(expense)}
  Saldo:           ${fmt(income - expense)}
  `

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-${months[month-1].toLowerCase()}-${year}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-3">
          <h1 className="text-white font-medium flex-1">Transações</h1>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none">
            {months.map((m, i) => <option key={i} value={i + 1}>{m} {year}</option>)}
          </select>
          <button onClick={downloadTXT}
            className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-1">
            ↓ Exportar
          </button>
          <button onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600">
            + Nova transação
          </button>
        </header>

        <div className="px-5 py-3 border-b border-gray-800 flex gap-2">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                filter === f ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {f === 'ALL' ? 'Todas' : f === 'INCOME' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
          <span className="ml-auto text-gray-500 text-xs self-center">{filtered.length} transações</span>
        </div>

        <main className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-12">Nenhuma transação encontrada</p>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {filtered.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-gray-800' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (categoryColors[t.category] || '#888780') + '20' }}>
                    <span className="text-xs" style={{ color: categoryColors[t.category] || '#888780' }}>
                      {t.category[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.title}</p>
                    <p className="text-gray-500 text-xs">{t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className={`text-sm font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {fmt(t.amount)}
                  </p>
                  <button onClick={() => deleteTransaction(t.id)}
                    className="text-gray-700 hover:text-red-400 text-lg leading-none ml-2">×</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSuccess={loadTransactions} />}
    </div>
  )
}