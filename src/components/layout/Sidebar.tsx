import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Route, 
  Map, 
  ClipboardList, 
  Calendar, 
  BarChart3,
  Server
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Migration Planning', href: '/planning', icon: Route },
  { name: 'Data Center Map', href: '/datacenter', icon: Map },
  { name: 'Workload Assessment', href: '/assessment', icon: ClipboardList },
  { name: 'Migration Timeline', href: '/timeline', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Migration Tool</h1>
            <p className="text-sm text-muted-foreground">Workload Planning</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}