import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'
import { Car } from 'lucide-react'

export default function Login() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-4">
              <Car className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Fleet Manager Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Upravljajte vašim voznim parkom sa lakoćom
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Dobrodošli nazad
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Prijavite se da biste pristupili vašem nalogu
              </p>
            </div>
            
            <Button
              onClick={() => loginWithRedirect()}
              className="w-full"
              size="lg"
            >
              Prijavite se
            </Button>
            
            <div className="text-sm text-center text-gray-600">
              <p>Nemate nalog? Kontaktirajte administratora.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Fleet Manager Pro. Sva prava zadržana.</p>
        </div>
      </div>
    </div>
  )
}