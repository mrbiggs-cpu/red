import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
    }
  }
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }
  
  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      toast({
        title: 'File Uploaded',
        description: `${selectedFile.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }
  
  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <Card className="p-4 mb-6">
      <div 
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSelectedFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Drag and drop a file here, or click to select a file</p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </Card>
  )
} 