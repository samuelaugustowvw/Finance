import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { api } from '../lib/api'

export function BotWhatsApp() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
        await api.post('/auth/link-phone', { phone: phone.replace(/\D/g, '') })
        setSuccess(true)
    } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao vincular número')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center">
          <h1 className="text-white font-medium">Bot WhatsApp</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-400">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-medium">Vincular WhatsApp</h2>
                <p className="text-gray-400 text-xs">Conecte seu número para usar o bot</p>
              </div>
            </div>

            {success ? (
              <div className="text-center py-4">
                <p className="text-green-400 text-2xl mb-2">✅</p>
                <p className="text-white font-medium mb-1">Número vinculado!</p>
                <p className="text-gray-400 text-sm">Envie !help no WhatsApp para começar.</p>
              </div>
            ) : (
              <form onSubmit={handleLink} className="flex flex-col gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Número com DDD</label>
                  <input type="tel" placeholder="84 99999-9999" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    required />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="bg-green-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-600 disabled:opacity-50">
                  {loading ? 'Vinculando...' : 'Vincular número'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}