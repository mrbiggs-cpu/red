'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileCategory, FileMetadata } from '@/services/dropbox'
import { FileUploader } from '@/components/files/FileUploader'
import { FileList } from '@/components/files/FileList'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock entity options for demo
const entityOptions = {
  [FileCategory.WORK_ORDER]: [
    { id: '123', name: 'Plumbing Repair #123' },
    { id: '124', name: 'Electrical Work #124' }
  ],
  [FileCategory.VIOLATION]: [
    { id: '456', name: 'Noise Complaint #456' },
    { id: '457', name: 'Parking Violation #457' }
  ],
  [FileCategory.ARCHITECTURAL]: [
    { id: '789', name: 'Deck Addition #789' },
    { id: '790', name: 'Fence Installation #790' }
  ],
  [FileCategory.BOARD_MEETING]: [
    { id: '101', name: 'March Board Meeting' },
    { id: '102', name: 'April Board Meeting' }
  ],
  [FileCategory.RESIDENT_REQUEST]: [
    { id: '202', name: 'Pool Access Request #202' },
    { id: '203', name: 'Community Room Booking #203' }
  ]
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<FileCategory>(FileCategory.WORK_ORDER)
  const [entityId, setEntityId] = useState<string>('123') // Default entity ID for demo
  const { toast } = useToast()

  // Fetch files on component mount and when category/entity changes
  useEffect(() => {
    fetchFiles()
  }, [activeCategory, entityId])

  // Fetch files from API
  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/files', {
        params: {
          category: activeCategory,
          entityId
        }
      })
      setFiles(response.data.files)
    } catch (error) {
      console.error('Error fetching files:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch files. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', activeCategory)
      formData.append('entityId', entityId)
      
      const response = await axios.post('/api/files', formData)
      
      // Add new file to state
      setFiles([...files, response.data.metadata])
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Handle file delete
  const handleFileDelete = async (file: FileMetadata) => {
    try {
      await axios.delete(`/api/files/${file.id}`, {
        data: { path: file.path_display }
      })
      
      // Remove file from state
      setFiles(files.filter(f => f.id !== file.id))
      
      toast({
        title: 'File Deleted',
        description: `${file.name} has been deleted.`,
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Document Storage</h1>
        
        <Tabs defaultValue={FileCategory.WORK_ORDER} onValueChange={(value) => setActiveCategory(value as FileCategory)}>
          <TabsList className="mb-4">
            <TabsTrigger value={FileCategory.WORK_ORDER}>Work Orders</TabsTrigger>
            <TabsTrigger value={FileCategory.VIOLATION}>Violations</TabsTrigger>
            <TabsTrigger value={FileCategory.ARCHITECTURAL}>Architectural</TabsTrigger>
            <TabsTrigger value={FileCategory.BOARD_MEETING}>Board Meetings</TabsTrigger>
            <TabsTrigger value={FileCategory.RESIDENT_REQUEST}>Resident Requests</TabsTrigger>
          </TabsList>
          
          {Object.values(FileCategory).map((category) => (
            <TabsContent key={category} value={category}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Select {category.replace('_', ' ')} Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={entityId} 
                    onValueChange={setEntityId}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityOptions[category]?.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              <FileUploader onUpload={handleFileUpload} />
              
              <FileList 
                files={files} 
                loading={loading} 
                onDelete={handleFileDelete} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 