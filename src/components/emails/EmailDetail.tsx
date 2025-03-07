import { useState } from 'react'
import { Email, EmailCategory } from '@/services/gmail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tag, ChevronDown } from 'lucide-react'

interface EmailDetailProps {
  email: Email
  onCategoryChange: (emailId: string, category: EmailCategory) => Promise<void>
}

export function EmailDetail({ email, onCategoryChange }: EmailDetailProps) {
  const [changingCategory, setChangingCategory] = useState(false)
  
  // Get email headers
  const getHeader = (name: string): string => {
    const header = email.payload.headers.find(h => h.name === name)
    return header ? header.value : ''
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString))
    return date.toLocaleString()
  }
  
  // Get email body
  const getEmailBody = (): string => {
    // Try to get body from the main payload
    if (email.payload.body && email.payload.body.data) {
      return decodeBase64(email.payload.body.data)
    }
    
    // If not found, try to get from parts
    if (email.payload.parts && email.payload.parts.length > 0) {
      // Look for text/plain or text/html parts
      const textPart = email.payload.parts.find(part => 
        part.mimeType === 'text/plain'
      )
      
      const htmlPart = email.payload.parts.find(part => 
        part.mimeType === 'text/html'
      )
      
      // Prefer plain text over HTML
      if (textPart && textPart.body && textPart.body.data) {
        return decodeBase64(textPart.body.data)
      }
      
      if (htmlPart && htmlPart.body && htmlPart.body.data) {
        return decodeBase64(htmlPart.body.data)
      }
    }
    
    return 'No content'
  }
  
  // Decode base64 encoded string
  const decodeBase64 = (data: string): string => {
    return Buffer.from(data, 'base64').toString('utf-8')
  }
  
  // Handle category change
  const handleCategoryChange = async (category: EmailCategory) => {
    if (category === email.category) return
    
    setChangingCategory(true)
    try {
      await onCategoryChange(email.id, category)
    } finally {
      setChangingCategory(false)
    }
  }
  
  // Get category name
  const getCategoryName = (category?: EmailCategory): string => {
    switch (category) {
      case EmailCategory.WORK_ORDER:
        return 'Work Order'
      case EmailCategory.VENDOR_RESPONSE:
        return 'Vendor Response'
      case EmailCategory.APPROVAL:
        return 'Approval'
      case EmailCategory.UNCATEGORIZED:
        return 'Uncategorized'
      default:
        return 'Uncategorized'
    }
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{getHeader('Subject')}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={changingCategory}>
              <Tag className="h-4 w-4 mr-2" />
              {getCategoryName(email.category)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.values(EmailCategory).map((category) => (
              <DropdownMenuItem 
                key={category}
                onClick={() => handleCategoryChange(category)}
                disabled={category === email.category}
              >
                {getCategoryName(category)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Email Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><strong>From:</strong> {getHeader('From')}</div>
          <div><strong>To:</strong> {getHeader('To')}</div>
          <div><strong>Date:</strong> {formatDate(email.internalDate)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: getEmailBody() }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 