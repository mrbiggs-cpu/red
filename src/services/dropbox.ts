import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Dropbox API endpoints
const DROPBOX_API_BASE = 'https://api.dropboxapi.com/2';
const DROPBOX_CONTENT_API_BASE = 'https://content.dropboxapi.com/2';

// File types and categories
export enum FileCategory {
  WORK_ORDER = 'work_order',
  VIOLATION = 'violation',
  ARCHITECTURAL = 'architectural',
  BOARD_MEETING = 'board_meeting',
  RESIDENT_REQUEST = 'resident_request'
}

// File metadata interface
export interface FileMetadata {
  id: string;
  name: string;
  path_display: string;
  size: number;
  client_modified: string;
  server_modified: string;
  rev: string;
  content_hash?: string;
  category: FileCategory;
  entityId: string; // Work order ID, violation ID, etc.
  previewLink?: string;
  downloadLink?: string;
}

// Upload options interface
export interface UploadOptions {
  file: File;
  category: FileCategory;
  entityId: string;
  customPath?: string;
}

// Dropbox service class
export class DropboxService {
  private token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  // Get folder path for a specific category and entity
  private getFolderPath(category: FileCategory, entityId: string, customPath?: string): string {
    if (customPath) {
      return customPath;
    }
    
    switch (category) {
      case FileCategory.WORK_ORDER:
        return `/Work_Orders/${entityId}`;
      case FileCategory.VIOLATION:
        return `/Violations/${entityId}`;
      case FileCategory.ARCHITECTURAL:
        return `/Architectural/${entityId}`;
      case FileCategory.BOARD_MEETING:
        return `/Board_Meetings/${entityId}`;
      case FileCategory.RESIDENT_REQUEST:
        return `/Resident_Requests/${entityId}`;
      default:
        return `/Other/${entityId}`;
    }
  }
  
  // Create folder if it doesn't exist
  async createFolderIfNeeded(path: string): Promise<boolean> {
    try {
      // Check if folder exists
      try {
        await axios.post(
          `${DROPBOX_API_BASE}/files/get_metadata`,
          { path },
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Folder exists
        return true;
      } catch (error) {
        // Folder doesn't exist, create it
        await axios.post(
          `${DROPBOX_API_BASE}/files/create_folder_v2`,
          { path },
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return true;
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      return false;
    }
  }
  
  // Upload file to Dropbox
  async uploadFile(options: UploadOptions): Promise<FileMetadata | null> {
    const { file, category, entityId, customPath } = options;
    
    try {
      // Get folder path
      const folderPath = this.getFolderPath(category, entityId, customPath);
      
      // Create folder if needed
      const folderCreated = await this.createFolderIfNeeded(folderPath);
      
      if (!folderCreated) {
        throw new Error('Failed to create folder');
      }
      
      // Generate unique filename to avoid conflicts
      const uniquePrefix = uuidv4().substring(0, 8);
      const fileName = `${uniquePrefix}_${file.name}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post(
        `${DROPBOX_CONTENT_API_BASE}/files/upload`,
        file,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              path: filePath,
              mode: 'add',
              autorename: true,
              mute: false
            })
          }
        }
      );
      
      // Get file metadata
      const metadata = uploadResponse.data;
      
      // Create shared link for preview and download
      const sharedLinkResponse = await axios.post(
        `${DROPBOX_API_BASE}/sharing/create_shared_link_with_settings`,
        {
          path: metadata.path_display,
          settings: {
            requested_visibility: 'public',
            audience: 'public',
            access: 'viewer'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Return file metadata with additional info
      return {
        ...metadata,
        category,
        entityId,
        previewLink: sharedLinkResponse.data.url.replace('?dl=0', '?dl=1'),
        downloadLink: sharedLinkResponse.data.url.replace('?dl=0', '?dl=1')
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }
  
  // List files in a folder
  async listFiles(category: FileCategory, entityId: string): Promise<FileMetadata[]> {
    try {
      const folderPath = this.getFolderPath(category, entityId);
      
      const response = await axios.post(
        `${DROPBOX_API_BASE}/files/list_folder`,
        {
          path: folderPath,
          recursive: false,
          include_media_info: true,
          include_deleted: false,
          include_has_explicit_shared_members: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const files = response.data.entries.filter((entry: any) => entry['.tag'] === 'file');
      
      // Get shared links for each file
      const filesWithLinks = await Promise.all(
        files.map(async (file: any) => {
          try {
            const sharedLinkResponse = await axios.post(
              `${DROPBOX_API_BASE}/sharing/create_shared_link_with_settings`,
              {
                path: file.path_display,
                settings: {
                  requested_visibility: 'public',
                  audience: 'public',
                  access: 'viewer'
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${this.token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            return {
              ...file,
              category,
              entityId,
              previewLink: sharedLinkResponse.data.url,
              downloadLink: sharedLinkResponse.data.url.replace('?dl=0', '?dl=1')
            };
          } catch (error) {
            // If shared link already exists, get existing link
            if (axios.isAxiosError(error) && error.response?.status === 409) {
              try {
                const getLinksResponse = await axios.post(
                  `${DROPBOX_API_BASE}/sharing/list_shared_links`,
                  {
                    path: file.path_display,
                    direct_only: true
                  },
                  {
                    headers: {
                      'Authorization': `Bearer ${this.token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                const link = getLinksResponse.data.links[0]?.url;
                
                return {
                  ...file,
                  category,
                  entityId,
                  previewLink: link,
                  downloadLink: link?.replace('?dl=0', '?dl=1')
                };
              } catch (linkError) {
                console.error('Error getting existing shared link:', linkError);
                return {
                  ...file,
                  category,
                  entityId
                };
              }
            }
            
            console.error('Error creating shared link:', error);
            return {
              ...file,
              category,
              entityId
            };
          }
        })
      );
      
      return filesWithLinks;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
  
  // Download file
  async downloadFile(filePath: string): Promise<Blob | null> {
    try {
      const response = await axios.post(
        `${DROPBOX_CONTENT_API_BASE}/files/download`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Dropbox-API-Arg': JSON.stringify({ path: filePath })
          },
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }
  
  // Delete file
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await axios.post(
        `${DROPBOX_API_BASE}/files/delete_v2`,
        { path: filePath },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
} 