import type { NextApiRequest, NextApiResponse } from 'next';
import { MockDropboxService } from '@/services/mock/dropbox-mock';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For demo, we'll skip token validation and use mock service directly
  const dropboxService = new MockDropboxService();
  
  // Get file path from query
  const { id } = req.query;
  const { path } = req.body;
  
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Missing file path' });
  }
  
  // Handle DELETE request (delete file)
  if (req.method === 'DELETE') {
    const success = await dropboxService.deleteFile(path);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    
    return res.status(200).json({ success: true });
  }
  
  // Handle GET request (download file)
  if (req.method === 'GET') {
    const fileBlob = await dropboxService.downloadFile(path);
    
    if (!fileBlob) {
      return res.status(500).json({ error: 'Failed to download file' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', fileBlob.type);
    res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
    
    // Convert Blob to Buffer and send
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    res.send(buffer);
    
    return;
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 