import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'FLEET_MANAGER' | 'ACCOUNTANT' | 'DRIVER' | 'VEHICLE_OWNER'
  organizationId: string
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  hasPermission: (permission: string) => boolean
}

const rolePermissions: Record<string, string[]> = {
  ADMIN: ['*'],
  FLEET_MANAGER: [
    'vehicles:read',
    'vehicles:update',
    'drivers:read',
    'expenses:read',
    'reports:read',
    'notifications:manage'
  ],
  ACCOUNTANT: [
    'expenses:*',
    'reports:financial',
    'vehicles:read',
    'invoices:*'
  ],
  DRIVER: [
    'vehicles:read:own',
    'expenses:create:fuel',
    'documents:read:own',
    'maintenance:report'
  ],
  VEHICLE_OWNER: [
    'vehicles:*:own',
    'expenses:*:own',
    'documents:*:own',
    'reports:read:own'
  ]
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  hasPermission: (permission) => {
    const user = get().user
    if (!user) return false
    
    const permissions = rolePermissions[user.role] || []
    
    // Check for wildcard permission
    if (permissions.includes('*')) return true
    
    // Check for exact permission
    if (permissions.includes(permission)) return true
    
    // Check for resource wildcard (e.g., 'expenses:*')
    const [resource, action] = permission.split(':')
    if (permissions.includes(`${resource}:*`)) return true
    
    // Check for own resource permission
    const ownPermission = `${permission}:own`
    if (permissions.includes(ownPermission)) return true
    
    return false
  }
}))