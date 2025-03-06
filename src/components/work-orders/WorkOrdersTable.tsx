'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreVertical, CheckCircle, XCircle } from 'lucide-react'

// Mock data type
type WorkOrder = {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  vendor: string
  dueDate: string
  createdAt: string
}

// Mock data
const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO-1001',
    title: 'HVAC Repair - Building A',
    status: 'pending',
    vendor: 'ABC Heating & Cooling',
    dueDate: '2024-03-20',
    createdAt: '2024-03-10'
  },
  {
    id: 'WO-1002',
    title: 'Plumbing Maintenance',
    status: 'approved',
    vendor: 'City Plumbers Inc.',
    dueDate: '2024-03-25',
    createdAt: '2024-03-12'
  },
  {
    id: 'WO-1003',
    title: 'Electrical Inspection',
    status: 'in_progress',
    vendor: 'Bright Electric Co.',
    dueDate: '2024-03-18',
    createdAt: '2024-03-08'
  },
  {
    id: 'WO-1004',
    title: 'Landscaping - Monthly Service',
    status: 'completed',
    vendor: 'Green Thumb Landscaping',
    dueDate: '2024-03-15',
    createdAt: '2024-03-01'
  },
  {
    id: 'WO-1005',
    title: 'Security System Upgrade',
    status: 'pending',
    vendor: 'SecureTech Solutions',
    dueDate: '2024-03-30',
    createdAt: '2024-03-14'
  }
]

export default function WorkOrdersTable() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders)
  
  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
    }
  }
  
  const handleApprove = (id: string) => {
    setWorkOrders(workOrders.map(wo => 
      wo.id === id ? { ...wo, status: 'approved' } : wo
    ))
  }
  
  const handleReject = (id: string) => {
    setWorkOrders(workOrders.map(wo => 
      wo.id === id ? { ...wo, status: 'rejected' } : wo
    ))
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="rounded-md border bg-white dark:bg-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">{workOrder.id}</TableCell>
                <TableCell>{workOrder.title}</TableCell>
                <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                <TableCell>{workOrder.vendor}</TableCell>
                <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
                <TableCell className="text-right">
                  {workOrder.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApprove(workOrder.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(workOrder.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 