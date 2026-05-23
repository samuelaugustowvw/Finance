import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Sidebar } from '../components/Sidebar'
import { MobileMenu } from '../components/MobileMenu'
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

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  async function loadTransactions() {
    const { data } = await api.get(`/transactions?month=${month}&year=${year}`)
    setTransactions(data)
  }

  async function loadAllTransactions() {
    const { data } = await api.get('/transactions')
    setAllTransactions(data)
  }

  useEffect(() => { loadTransactions() }, [month])
  useEffect(() => { loadAllTransactions() }, [])

  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const categoryTotals = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxCategory = categoryData[0]?.[1] || 1

  const chartData = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(year, month - 1 - (4 - i), 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const monthTx = allTransactions.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() + 1 === m && td.getFullYear() === y
    })
    return {
      name: d.toLocaleString('pt-BR', { month: 'short' }),
      Receitas: monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
      Despesas: monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
    }
  })

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white font-medium flex-1">Dashboard</h1>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none">
            {months.map((m, i) => <option key={i} value={i + 1}>{m} {year}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600">
            + <span className="hidden sm:inline">Nova transação</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Saldo atual</p>
              <p className={`text-2xl font-medium ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(balance)}</p>
              <p className="text-gray-500 text-xs mt-1">{transactions.length} transações</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Receitas</p>
              <p className="text-2xl font-medium text-emerald-400">{fmt(income)}</p>
              <p className="text-gray-500 text-xs mt-1">{transactions.filter(t => t.type === 'INCOME').length} entradas</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Despesas</p>
              <p className="text-2xl font-medium text-red-400">{fmt(expense)}</p>
              <p className="text-gray-500 text-xs mt-1">{transactions.filter(t => t.type === 'EXPENSE').length} saídas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Receitas vs Despesas</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={chartData} barSize={14}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => fmt(Number(v))}
                  />
                  <Bar dataKey="Receitas" fill="#1D9E75" radius={[3,3,0,0]} />
                  <Bar dataKey="Despesas" fill="#E24B4A" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Receitas</span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500"></span>Despesas</span>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Gastos por categoria</p>
              {categoryData.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-8">Sem despesas este mês</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {categoryData.map(([cat, val]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-24 flex-shrink-0">{cat}</span>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(val/maxCategory)*100}%`, backgroundColor: categoryColors[cat] || '#888780' }}></div>
                      </div>
                      <span className="text-gray-400 text-xs w-20 text-right">{fmt(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Transações recentes</p>
            {transactions.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">Nenhuma transação este mês</p>
            ) : (
              <div className="flex flex-col">
                {transactions.slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (categoryColors[t.category] || '#888780') + '20' }}>
                      <span className="text-xs" style={{ color: categoryColors[t.category] || '#888780' }}>
                        {t.category[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.title}</p>
                      <p className="text-gray-500 text-xs">{t.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {fmt(t.amount)}
                      </p>
                      <p className="text-gray-500 text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSuccess={() => { loadTransactions(); loadAllTransactions() }} />}
    </div>
  )
}