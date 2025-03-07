'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'

// Work order type
type WorkOrder = {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  vendor: string
  amount: number
  dueDate: string
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}

export default function ApprovalsPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch work orders that need approval
  useEffect(() => {
    // In a real app, this would fetch from your API
    // For now, we'll use mock data
    const mockWorkOrders: WorkOrder[] = [
      {
        id: 'WO-1001',
        title: 'HVAC Repair - Building A',
        description: 'Replace faulty compressor and recharge refrigerant',
        status: 'pending',
        vendor: 'ABC Heating & Cooling',
        amount: 1250.00,
        dueDate: '2024-03-20',
        createdAt: '2024-03-10',
        priority: 'high'
      },
      {
        id: 'WO-1005',
        title: 'Security System Upgrade',
        description: 'Install new cameras and update access control system',
        status: 'pending',
        vendor: 'SecureTech Solutions',
        amount: 3750.00,
        dueDate: '2024-03-30',
        createdAt: '2024-03-14',
        priority: 'medium'
      },
      {
        id: 'WO-1008',
        title: 'Lobby Painting',
        description: 'Repaint main lobby walls and ceiling',
        status: 'pending',
        vendor: 'Premier Painting Co.',
        amount: 2200.00,
        dueDate: '2024-03-25',
        createdAt: '2024-03-15',
        priority: 'low'
      }
    ]
    
    setWorkOrders(mockWorkOrders)
    setLoading(false)
  }, [])

  // Handle approval or rejection
  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true)
      
      // In a real app, this would call your API
      // const response = await axios.put(`/api/approvals/${id}`, {
      //   action,
      //   token: 'your-auth-token' // In a real app, get from auth context
      // })
      
      // For demo, we'll just update the state
      setTimeout(() => {
        setWorkOrders(workOrders.map(wo => 
          wo.id === id ? { ...wo, status: action === 'approve' ? 'approved' : 'rejected' } : wo
        ))
        
        toast({
          title: action === 'approve' ? 'Work Order Approved' : 'Work Order Rejected',
          description: `Work order ${id} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
          variant: action === 'approve' ? 'default' : 'destructive',
        })
        
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error(`Failed to ${action} work order:`, error)
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} work order. Please try again.`,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Filter work orders by status
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending')
  const approvedWorkOrders = workOrders.filter(wo => wo.status === 'approved')
  const rejectedWorkOrders = workOrders.filter(wo => wo.status === 'rejected')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Approval Workflow</h1>
          <Badge variant="outline" className="flex gap-1 items-center">
            <Clock className="h-3 w-3" />
            <span>{pendingWorkOrders.length} Pending</span>
          </Badge>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex gap-2 items-center">
              <AlertTriangle className="h-4 w-4" />
              Pending ({pendingWorkOrders.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2 items-center">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedWorkOrders.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2 items-center">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedWorkOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {pendingWorkOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending work orders requiring approval.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingWorkOrders.map((workOrder) => (
                  <Card key={workOrder.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{workOrder.title}</CardTitle>
                          <CardDescription>{workOrder.vendor}</CardDescription>
                        </div>
                        {getPriorityBadge(workOrder.priority)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Description:</p>
                          <p>{workOrder.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount:</p>
                            <p className="font-medium">{formatCurrency(workOrder.amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date:</p>
                            <p className="font-medium">
                              {new Date(workOrder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleAction(workOrder.id, 'reject')}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleAction(workOrder.id, 'approve')}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            {approvedWorkOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved work orders to display.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {approvedWorkOrders.map((workOrder) => (
                  <Card key={workOrder.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{workOrder.title}</CardTitle>
                          <CardDescription>{workOrder.vendor}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Approved
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Description:</p>
                          <p>{workOrder.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount:</p>
                            <p className="font-medium">{formatCurrency(workOrder.amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date:</p>
                            <p className="font-medium">
                              {new Date(workOrder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            {rejectedWorkOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rejected work orders to display.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rejectedWorkOrders.map((workOrder) => (
                  <Card key={workOrder.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{workOrder.title}</CardTitle>
                          <CardDescription>{workOrder.vendor}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Rejected
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Description:</p>
                          <p>{workOrder.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount:</p>
                            <p className="font-medium">{formatCurrency(workOrder.amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date:</p>
                            <p className="font-medium">
                              {new Date(workOrder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 