import { useState } from 'react'
import { FileMetadata, FileCategory } from '@/services/dropbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { File, FileText, Trash2, Download, ExternalLink } from 'lucide-react'
import { formatBytes, formatDate } from '@/lib/utils'

interface FileListProps {
  files: FileMetadata[]
  loading: boolean
  onDelete: (file: FileMetadata) => void
}

export function FileList({ files, loading, onDelete }: FileListProps) {
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  
  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    // Use just two icon types for simplicity
    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-blue-500" />
    }
    
    return <File className="h-8 w-8 text-gray-500" />
  }
  
  // Handle file delete
  const handleDelete = async (file: FileMetadata) => {
    setDeletingFile(file.id)
    try {
      await onDelete(file)
    } finally {
      setDeletingFile(null)
    }
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }
  
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 border rounded-md">
        <p>No files found</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="p-4 flex flex-col">
          <div className="flex items-start space-x-4">
            {getFileIcon(file.name)}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{file.name}</h3>
              <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
              <p className="text-xs text-gray-500">{formatDate(file.server_modified)}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            {file.previewLink && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a href={file.previewLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
            )}
            
            {file.downloadLink && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a href={file.downloadLink} download>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDelete(file)}
              disabled={deletingFile === file.id}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 