import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"

interface Category {
  id: string
  name: string
  color: string
}

export function Sidebar() {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('finance:user') || '{}')
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#1D9E75')

  async function loadCategories() {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch {}
  }

  useEffect(() => { loadCategories() }, [])

  function logout() {
    localStorage.removeItem('finance:token')
    localStorage.removeItem('finance:user')
    window.location.href = '/login'
  }

  async function addCategory() {
    if (!newCatName.trim()) return
    try {
      await api.post('/categories', { name: newCatName.trim(), color: newCatColor })
      setNewCatName('')
      setNewCatColor('#1D9E75')
      setShowAddCat(false)
      loadCategories()
    } catch {}
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '▦', disabled: false },
    { path: '/transactions', label: 'Transações', icon: '⇄', disabled: false },
    { path: '/whatsapp', label: 'Bot WhatsApp', icon: 'whatsapp', disabled: false },
  ]

  return (
    <aside className="w-52 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">F</span>
        </div>
        <span className="text-white font-medium">Finance</span>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider px-2 py-2">Menu</p>
        {navItems.map((item) => (
          item.disabled ? (
            <div key={item.path} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 text-gray-600 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                <path d={WA_PATH} />
              </svg>
              {item.label}
            </div>
          ) : (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 ${
                location.pathname === item.path
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {item.icon === 'whatsapp' ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                  <path d={WA_PATH} />
                </svg>
              ) : (
                <span>{item.icon}</span>
              )}
              {item.label}
            </Link>
          )
        ))}

        <div className="flex items-center justify-between px-2 py-2 mt-3">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Categorias</p>
          <button onClick={() => setShowAddCat(!showAddCat)}
            className="text-gray-500 hover:text-emerald-400 text-lg leading-none">+</button>
        </div>

        {showAddCat && (
          <div className="mx-2 mb-2 p-2 bg-gray-800 rounded-lg flex flex-col gap-2">
            <input type="text" placeholder="Nome da categoria" value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-xs outline-none focus:border-emerald-500" />
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs">Cor:</label>
              <input type="color" value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
            </div>
            <button onClick={addCategory}
              className="bg-emerald-500 text-white rounded px-2 py-1 text-xs font-medium hover:bg-emerald-600">
              Adicionar
            </button>
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
            {cat.name}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-medium flex-shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{user.name}</p>
          <p className="text-gray-500 text-xs truncate">{user.email}</p>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-white text-xs">Sair</button>
      </div>
    </aside>
  )
}