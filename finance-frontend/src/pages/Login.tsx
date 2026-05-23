import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('finance:token', data.token)
        localStorage.setItem('finance:user', JSON.stringify(data.user))
        navigate('/')
        }
        catch {
        setError('Email ou senha incorretos')
        }
        finally {
        setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="text-white font-medium text-lg">Finance</span>
            </div>
            <h1 className="text-white text-xl font-medium mb-1">Entrar</h1>
            <p className="text-gray-400 text-sm mb-6">Acesse sua conta para continuar</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                required />
            <input type="password" placeholder="Senha" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
                className="bg-emerald-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 mt-1">
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
            </form>
            <p className="text-gray-400 text-sm mt-4 text-center">
            Não tem conta?<Link to="/register" className="text-emerald-400 ml-1">Criar conta</Link>
            </p>
        </div>
        </div>
    )
}