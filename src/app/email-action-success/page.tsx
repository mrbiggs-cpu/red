'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmailActionSuccessPage() {
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const id = searchParams.get('id')
  
  const isApprove = action === 'approve'
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {isApprove ? (
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-center text-xl">
            Work Order {isApprove ? 'Approved' : 'Rejected'} Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Work order {id} has been {isApprove ? 'approved' : 'rejected'}.
            {isApprove 
              ? ' The vendor will be notified and work can begin.' 
              : ' The requester will be notified of your decision.'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 