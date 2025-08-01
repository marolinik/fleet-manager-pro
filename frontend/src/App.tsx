import { useAuth0 } from '@auth0/auth0-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Vehicles from '@/pages/Vehicles'
import VehicleDetail from '@/pages/VehicleDetail'
import Expenses from '@/pages/Expenses'
import Reports from '@/pages/Reports'
import Users from '@/pages/Users'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import { useUserStore } from '@/store/userStore'
import { useEffect } from 'react'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0()
  const { setUser } = useUserStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch full user profile from backend
      setUser({
        id: user.sub || '',
        email: user.email || '',
        name: user.name || '',
        role: 'DRIVER', // This should come from backend
        organizationId: '',
      })
    }
  }, [isAuthenticated, user, setUser])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}