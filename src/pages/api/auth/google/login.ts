import type { NextApiRequest, NextApiResponse } from 'next';
import { GmailAuthService } from '@/services/auth/gmail-auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authUrl = GmailAuthService.getAuthUrl();
  res.redirect(authUrl);
} 