import { Email, EmailCategory } from '@/services/gmail'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | undefined
  onSelectEmail: (email: Email) => void
  loading: boolean
}

export function EmailList({ emails, selectedEmailId, onSelectEmail, loading }: EmailListProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString))
    return date.toLocaleDateString()
  }
  
  // Get sender name from email address
  const getSenderName = (from: string) => {
    // Extract name if in format "Name <email@example.com>"
    const match = from.match(/^"?([^"<]+)"?\s*<.*>$/)
    if (match) {
      return match[1].trim()
    }
    
    // Otherwise, return the email address
    return from.replace(/<|>/g, '')
  }
  
  // Get category badge
  const getCategoryBadge = (category?: EmailCategory) => {
    switch (category) {
      case EmailCategory.WORK_ORDER:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Work Order</Badge>
      case EmailCategory.VENDOR_RESPONSE:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Vendor Response</Badge>
      case EmailCategory.APPROVAL:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Approval</Badge>
      case EmailCategory.UNCATEGORIZED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Uncategorized</Badge>
      default:
        return null
    }
  }
  
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    )
  }
  
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No emails found</p>
      </div>
    )
  }
  
  return (
    <div className="divide-y">
      {emails.map((email) => {
        const subject = email.payload.headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = email.payload.headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const isSelected = email.id === selectedEmailId
        
        return (
          <div 
            key={email.id}
            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => onSelectEmail(email)}
          >
            <div className="flex justify-between items-start">
              <div className="font-medium truncate">{getSenderName(from)}</div>
              <div className="text-xs text-gray-500">{formatDate(email.internalDate)}</div>
            </div>
            <div className="text-sm font-medium truncate mt-1">{subject}</div>
            <div className="text-xs text-gray-500 truncate mt-1">{email.snippet}</div>
            <div className="mt-2">
              {getCategoryBadge(email.category)}
            </div>
          </div>
        )
      })}
    </div>
  )
} 