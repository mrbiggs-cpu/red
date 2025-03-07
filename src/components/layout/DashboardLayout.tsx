'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Bell,
  File as FileIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Work Orders',
    href: '/dashboard/work-orders',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Vendors',
    href: '/dashboard/vendors',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Files',
    href: '/dashboard/files',
    icon: <FileIcon className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
  },

]



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // Mock pending approvals count
  const pendingApprovals = 5

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold">Work Order Dashboard</h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full border-t p-4 dark:border-gray-700">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-0 text-xs text-gray-500 dark:text-gray-400"
                onClick={logout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {pendingApprovals > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                      variant="destructive"
                    >
                      {pendingApprovals}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Notification bar for pending approvals */}
          {pendingApprovals > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-y border-amber-200 dark:border-amber-800">
              <div className="flex justify-between items-center">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  You have {pendingApprovals} pending work orders requiring approval
                </p>
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </div>
            </div>
          )}
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 