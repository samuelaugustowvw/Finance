import { useState } from 'react'
import { api } from '../lib/api'

const categories = ['Alimentação', 'Moradia', 'Lazer', 'Transporte', 'Saúde', 'Receita', 'Outros']

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function TransactionModal({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [category, setCategory] = useState('Alimentação')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/transactions', {
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date).toISOString(),
      })
      onSuccess()
      onClose()
    } catch {
      alert('Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-medium">Nova transação</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Descrição" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            required />
          <input type="number" placeholder="Valor" value={amount} step="0.01"
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            required />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setType('EXPENSE')}
              className={`py-2 rounded-lg text-sm font-medium ${type === 'EXPENSE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
              Despesa
            </button>
            <button type="button" onClick={() => setType('INCOME')}
              className={`py-2 rounded-lg text-sm font-medium ${type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
              Receita
            </button>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          <button type="submit" disabled={loading}
            className="bg-emerald-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 mt-1">
            {loading ? 'Salvando...' : 'Salvar transação'}
          </button>
        </form>
      </div>
    </div>
  )
}