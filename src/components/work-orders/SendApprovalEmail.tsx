'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { sendApprovalEmail } from '@/services/email'

type SendApprovalEmailProps = {
  workOrder: {
    id: string
    title: string
    vendor: string
    amount: number
    dueDate: string
  }
  onClose: () => void
}

export default function SendApprovalEmail({ workOrder, onClose }: SendApprovalEmailProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address.',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    
    try {
      // In a real app, this would call your API
      const result = await sendApprovalEmail({
        to: email,
        subject: `Work Order Approval Request: ${workOrder.title}`,
        workOrderId: workOrder.id,
        workOrderTitle: workOrder.title,
        vendor: workOrder.vendor,
        amount: workOrder.amount,
        dueDate: workOrder.dueDate,
      })
      
      if (result.success) {
        toast({
          title: 'Email Sent',
          description: `Approval request sent to ${email}`,
        })
        onClose()
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Failed to send approval email:', error)
      toast({
        title: 'Failed to Send Email',
        description: 'There was an error sending the approval email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Send Approval Request</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Approver's Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="approver@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Work Order Details</Label>
              <div className="text-sm rounded-md border p-3 bg-muted/50">
                <p><strong>ID:</strong> {workOrder.id}</p>
                <p><strong>Title:</strong> {workOrder.title}</p>
                <p><strong>Vendor:</strong> {workOrder.vendor}</p>
                <p><strong>Amount:</strong> ${workOrder.amount.toFixed(2)}</p>
                <p><strong>Due Date:</strong> {new Date(workOrder.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 