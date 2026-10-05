import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'
import AboutPage from './pages/AboutPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MediaPage from './pages/MediaPage'
import MessagesPage from './pages/MessagesPage'
import ResourcePage from './pages/ResourcePage'
import SettingsPage from './pages/SettingsPage'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="content/:resource" element={<ResourcePage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
