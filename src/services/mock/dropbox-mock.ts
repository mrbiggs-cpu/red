import { FileCategory, FileMetadata, UploadOptions } from '@/services/dropbox';
import { v4 as uuidv4 } from 'uuid';

// Mock file data
const mockFiles: Record<string, FileMetadata[]> = {
  'work_order-123': [
    {
      id: '1',
      name: 'invoice.pdf',
      path_display: '/Work_Orders/123/invoice.pdf',
      size: 1024 * 1024 * 2.5, // 2.5 MB
      client_modified: new Date(2024, 2, 10).toISOString(),
      server_modified: new Date(2024, 2, 10).toISOString(),
      rev: 'abc123',
      category: FileCategory.WORK_ORDER,
      entityId: '123',
      previewLink: 'https://www.example.com/preview/invoice.pdf',
      downloadLink: 'https://www.example.com/download/invoice.pdf'
    },
    {
      id: '2',
      name: 'contract.docx',
      path_display: '/Work_Orders/123/contract.docx',
      size: 1024 * 512, // 512 KB
      client_modified: new Date(2024, 2, 12).toISOString(),
      server_modified: new Date(2024, 2, 12).toISOString(),
      rev: 'def456',
      category: FileCategory.WORK_ORDER,
      entityId: '123',
      previewLink: 'https://www.example.com/preview/contract.docx',
      downloadLink: 'https://www.example.com/download/contract.docx'
    },
    {
      id: '3',
      name: 'site_photo.jpg',
      path_display: '/Work_Orders/123/site_photo.jpg',
      size: 1024 * 1024 * 3.2, // 3.2 MB
      client_modified: new Date(2024, 2, 15).toISOString(),
      server_modified: new Date(2024, 2, 15).toISOString(),
      rev: 'ghi789',
      category: FileCategory.WORK_ORDER,
      entityId: '123',
      previewLink: 'https://www.example.com/preview/site_photo.jpg',
      downloadLink: 'https://www.example.com/download/site_photo.jpg'
    }
  ],
  'violation-456': [
    {
      id: '4',
      name: 'violation_notice.pdf',
      path_display: '/Violations/456/violation_notice.pdf',
      size: 1024 * 768, // 768 KB
      client_modified: new Date(2024, 2, 18).toISOString(),
      server_modified: new Date(2024, 2, 18).toISOString(),
      rev: 'jkl012',
      category: FileCategory.VIOLATION,
      entityId: '456',
      previewLink: 'https://www.example.com/preview/violation_notice.pdf',
      downloadLink: 'https://www.example.com/download/violation_notice.pdf'
    },
    {
      id: '5',
      name: 'evidence.jpg',
      path_display: '/Violations/456/evidence.jpg',
      size: 1024 * 1024 * 1.8, // 1.8 MB
      client_modified: new Date(2024, 2, 18).toISOString(),
      server_modified: new Date(2024, 2, 18).toISOString(),
      rev: 'mno345',
      category: FileCategory.VIOLATION,
      entityId: '456',
      previewLink: 'https://www.example.com/preview/evidence.jpg',
      downloadLink: 'https://www.example.com/download/evidence.jpg'
    }
  ],
  'architectural-789': [
    {
      id: '6',
      name: 'blueprint.pdf',
      path_display: '/Architectural/789/blueprint.pdf',
      size: 1024 * 1024 * 5.7, // 5.7 MB
      client_modified: new Date(2024, 2, 20).toISOString(),
      server_modified: new Date(2024, 2, 20).toISOString(),
      rev: 'pqr678',
      category: FileCategory.ARCHITECTURAL,
      entityId: '789',
      previewLink: 'https://www.example.com/preview/blueprint.pdf',
      downloadLink: 'https://www.example.com/download/blueprint.pdf'
    }
  ],
  'board_meeting-101': [
    {
      id: '7',
      name: 'meeting_minutes.docx',
      path_display: '/Board_Meetings/101/meeting_minutes.docx',
      size: 1024 * 384, // 384 KB
      client_modified: new Date(2024, 2, 22).toISOString(),
      server_modified: new Date(2024, 2, 22).toISOString(),
      rev: 'stu901',
      category: FileCategory.BOARD_MEETING,
      entityId: '101',
      previewLink: 'https://www.example.com/preview/meeting_minutes.docx',
      downloadLink: 'https://www.example.com/download/meeting_minutes.docx'
    },
    {
      id: '8',
      name: 'budget_proposal.xlsx',
      path_display: '/Board_Meetings/101/budget_proposal.xlsx',
      size: 1024 * 512, // 512 KB
      client_modified: new Date(2024, 2, 22).toISOString(),
      server_modified: new Date(2024, 2, 22).toISOString(),
      rev: 'vwx234',
      category: FileCategory.BOARD_MEETING,
      entityId: '101',
      previewLink: 'https://www.example.com/preview/budget_proposal.xlsx',
      downloadLink: 'https://www.example.com/download/budget_proposal.xlsx'
    }
  ],
  'resident_request-202': [
    {
      id: '9',
      name: 'request_form.pdf',
      path_display: '/Resident_Requests/202/request_form.pdf',
      size: 1024 * 256, // 256 KB
      client_modified: new Date(2024, 2, 25).toISOString(),
      server_modified: new Date(2024, 2, 25).toISOString(),
      rev: 'yz0567',
      category: FileCategory.RESIDENT_REQUEST,
      entityId: '202',
      previewLink: 'https://www.example.com/preview/request_form.pdf',
      downloadLink: 'https://www.example.com/download/request_form.pdf'
    }
  ]
};

// Mock Dropbox service
export class MockDropboxService {
  // List files for a category and entity
  async listFiles(category: FileCategory, entityId: string): Promise<FileMetadata[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const key = `${category}-${entityId}`;
    return mockFiles[key] || [];
  }
  
  // Upload file
  async uploadFile(options: UploadOptions): Promise<FileMetadata | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const { file, category, entityId } = options;
    const key = `${category}-${entityId}`;
    
    // Create new file metadata
    const newFile: FileMetadata = {
      id: uuidv4(),
      name: file.name,
      path_display: `/${this.getCategoryFolder(category)}/${entityId}/${file.name}`,
      size: file.size,
      client_modified: new Date().toISOString(),
      server_modified: new Date().toISOString(),
      rev: uuidv4().substring(0, 8),
      category,
      entityId,
      previewLink: `https://www.example.com/preview/${file.name}`,
      downloadLink: `https://www.example.com/download/${file.name}`
    };
    
    // Add to mock data
    if (!mockFiles[key]) {
      mockFiles[key] = [];
    }
    
    mockFiles[key].push(newFile);
    
    return newFile;
  }
  
  // Delete file
  async deleteFile(filePath: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Find and remove file from mock data
    for (const key in mockFiles) {
      const index = mockFiles[key].findIndex(file => file.path_display === filePath);
      
      if (index !== -1) {
        mockFiles[key].splice(index, 1);
        return true;
      }
    }
    
    return false;
  }
  
  // Download file (mock - returns a simple blob)
  async downloadFile(filePath: string): Promise<Blob | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find file in mock data
    for (const key in mockFiles) {
      const file = mockFiles[key].find(file => file.path_display === filePath);
      
      if (file) {
        // Create a mock blob
        return new Blob(['Mock file content'], { type: 'application/octet-stream' });
      }
    }
    
    return null;
  }
  
  // Helper to get folder name for category
  private getCategoryFolder(category: FileCategory): string {
    switch (category) {
      case FileCategory.WORK_ORDER:
        return 'Work_Orders';
      case FileCategory.VIOLATION:
        return 'Violations';
      case FileCategory.ARCHITECTURAL:
        return 'Architectural';
      case FileCategory.BOARD_MEETING:
        return 'Board_Meetings';
      case FileCategory.RESIDENT_REQUEST:
        return 'Resident_Requests';
      default:
        return 'Other';
    }
  }
} 