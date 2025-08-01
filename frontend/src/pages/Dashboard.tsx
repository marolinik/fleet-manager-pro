import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, DollarSign, AlertTriangle, FileText } from 'lucide-react'

export default function Dashboard() {
  // Mock data - should come from API
  const stats = {
    totalVehicles: 15,
    monthlyExpenses: 45320,
    upcomingServices: 3,
    expiringDocuments: 2
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Pregled vašeg voznog parka</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno vozila
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              Aktivna vozila u floti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mesečni troškovi
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyExpenses.toLocaleString('sr-RS')} RSD
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% od prošlog meseca
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predstojeći servisi
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingServices}</div>
            <p className="text-xs text-muted-foreground">
              U narednih 30 dana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dokumenti koji ističu
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Registracije i osiguranja
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skorašnje aktivnosti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Novi trošak dodat za BG-123-AB
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gorivo - 5,500 RSD
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Pre 2 sata
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Servis zakazan za NS-456-CD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redovan servis na 60,000km
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Pre 5 sati
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifikacije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Registracija ističe za 15 dana
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vozilo BG-789-EF
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Osiguranje isteklo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vozilo KG-012-GH - obnovite hitno
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}