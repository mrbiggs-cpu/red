import DashboardLayout from '@/components/layout/DashboardLayout'
import WorkOrdersTable from '@/components/work-orders/WorkOrdersTable'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default function WorkOrdersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
        
        <WorkOrdersTable />
      </div>
    </DashboardLayout>
  )
} 