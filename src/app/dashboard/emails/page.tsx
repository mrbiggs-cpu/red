'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw, Inbox, Send, Clock, Tag } from 'lucide-react'
import { EmailList } from '@/components/emails/EmailList'
import { EmailDetail } from '@/components/emails/EmailDetail'
import { Email, EmailCategory } from '@/services/gmail'
import { useToast } from '@/contexts/ToastContext'
import axios from 'axios'

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<EmailCategory | 'ALL'>('ALL')
  const router = useRouter()
  const { toast } = useToast()

  // Fetch emails on component mount and when category changes
  useEffect(() => {
    fetchEmails()
  }, [activeCategory])

  // Fetch emails from API
  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { maxResults: '50' }
      
      if (searchQuery) {
        params.query = searchQuery
      }
      
      if (activeCategory !== 'ALL') {
        params.category = activeCategory
      }
      
      const response = await axios.get('/api/emails', { params })
      setEmails(response.data.emails)
      
      // Clear selected email if it's no longer in the list
      if (selectedEmail && !response.data.emails.find((email: Email) => email.id === selectedEmail.id)) {
        setSelectedEmail(null)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch emails. Please try again.',
        variant: 'destructive',
      })
      
      // If unauthorized, redirect to Gmail auth
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push('/api/auth/google/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmails()
  }

  // Handle category change
  const handleCategoryChange = async (emailId: string, newCategory: EmailCategory) => {
    try {
      await axios.put(`/api/emails/${emailId}/category`, { category: newCategory })
      
      // Update email in state
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, category: newCategory } : email
      ))
      
      // Update selected email if it's the one being changed
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail({ ...selectedEmail, category: newCategory })
      }
      
      toast({
        title: 'Category Updated',
        description: `Email moved to ${newCategory.replace('_', ' ')} category.`,
      })
    } catch (error) {
      console.error('Error changing email category:', error)
      toast({
        title: 'Error',
        description: 'Failed to change email category. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Email Inbox</h1>
          <Button variant="outline" onClick={fetchEmails}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <Tabs defaultValue="ALL" value={activeCategory} onValueChange={(value) => setActiveCategory(value as EmailCategory | 'ALL')}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="ALL" className="flex items-center">
              <Inbox className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value={EmailCategory.WORK_ORDER} className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Work Orders
            </TabsTrigger>
            <TabsTrigger value={EmailCategory.VENDOR_RESPONSE} className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Vendor Responses
            </TabsTrigger>
            <TabsTrigger value={EmailCategory.APPROVAL} className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value={EmailCategory.UNCATEGORIZED} className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Uncategorized
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
            <div className="md:col-span-1 overflow-y-auto border rounded-md">
              <TabsContent value="ALL" className="m-0">
                <EmailList 
                  emails={emails} 
                  selectedEmailId={selectedEmail?.id} 
                  onSelectEmail={setSelectedEmail}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value={EmailCategory.WORK_ORDER} className="m-0">
                <EmailList 
                  emails={emails.filter(email => email.category === EmailCategory.WORK_ORDER)} 
                  selectedEmailId={selectedEmail?.id} 
                  onSelectEmail={setSelectedEmail}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value={EmailCategory.VENDOR_RESPONSE} className="m-0">
                <EmailList 
                  emails={emails.filter(email => email.category === EmailCategory.VENDOR_RESPONSE)} 
                  selectedEmailId={selectedEmail?.id} 
                  onSelectEmail={setSelectedEmail}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value={EmailCategory.APPROVAL} className="m-0">
                <EmailList 
                  emails={emails.filter(email => email.category === EmailCategory.APPROVAL)} 
                  selectedEmailId={selectedEmail?.id} 
                  onSelectEmail={setSelectedEmail}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value={EmailCategory.UNCATEGORIZED} className="m-0">
                <EmailList 
                  emails={emails.filter(email => email.category === EmailCategory.UNCATEGORIZED)} 
                  selectedEmailId={selectedEmail?.id} 
                  onSelectEmail={setSelectedEmail}
                  loading={loading}
                />
              </TabsContent>
            </div>
            
            <div className="md:col-span-2 border rounded-md overflow-y-auto">
              {selectedEmail ? (
                <EmailDetail 
                  email={selectedEmail} 
                  onCategoryChange={handleCategoryChange} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Select an email to view its contents</p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 