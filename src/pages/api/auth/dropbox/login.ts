import type { NextApiRequest, NextApiResponse } from 'next';
import { DropboxAuthService } from '@/services/auth/dropbox-auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authUrl = DropboxAuthService.getAuthUrl();
  res.redirect(authUrl);
} 