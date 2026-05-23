import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { PrivateRoute } from './components/PrivateRoute'
import { BotWhatsApp } from './pages/BotWhatsApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/bot-whatsapp" element={<PrivateRoute><BotWhatsApp /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}