import type { NextApiRequest, NextApiResponse } from 'next';
import { FileCategory } from '@/services/dropbox';
import { MockDropboxService } from '@/services/mock/dropbox-mock';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For demo, we'll skip token validation and use mock service directly
  const dropboxService = new MockDropboxService();
  
  // Handle GET request (list files)
  if (req.method === 'GET') {
    const { category, entityId } = req.query;
    
    if (!category || !entityId || typeof category !== 'string' || typeof entityId !== 'string') {
      return res.status(400).json({ error: 'Missing category or entityId' });
    }
    
    if (!Object.values(FileCategory).includes(category as FileCategory)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const files = await dropboxService.listFiles(category as FileCategory, entityId);
    
    return res.status(200).json({ files });
  }
  
  // Handle POST request (upload file)
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse form data' });
      }
      
      const uploadedFile = files.file;
      const category = fields.category;
      const entityId = fields.entityId;
      
      if (!uploadedFile || !category || !entityId || typeof category !== 'string' || typeof entityId !== 'string') {
        return res.status(400).json({ error: 'Missing file, category, or entityId' });
      }
      
      if (!Object.values(FileCategory).includes(category as FileCategory)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      // For demo, we'll create a mock File object
      const mockFile = {
        name: uploadedFile.originalFilename || 'file',
        size: uploadedFile.size,
        type: uploadedFile.mimetype || 'application/octet-stream'
      };
      
      // Upload file to mock Dropbox
      const metadata = await dropboxService.uploadFile({
        file: mockFile as any,
        category: category as FileCategory,
        entityId
      });
      
      if (!metadata) {
        return res.status(500).json({ error: 'Failed to upload file' });
      }
      
      return res.status(200).json({ metadata });
    });
    
    return;
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 