import type { NextApiRequest, NextApiResponse } from 'next';
import { GmailService, Email, EmailCategory } from '@/services/gmail';
import jwt from 'jsonwebtoken';
import { GmailAuthService } from '@/services/auth/gmail-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get token from cookie
  const { auth_token } = req.cookies;
  
  if (!auth_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Verify and decode JWT
    const decoded: any = jwt.verify(auth_token, JWT_SECRET);
    
    // Check if token is expired
    if (Date.now() > decoded.expiresAt) {
      // Refresh token
      const newAccessToken = await GmailAuthService.refreshAccessToken(decoded.refreshToken);
      
      // Update JWT
      const newToken = jwt.sign(
        {
          ...decoded,
          accessToken: newAccessToken,
          expiresAt: Date.now() + 3600 * 1000 // 1 hour
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set new JWT as cookie
      res.setHeader('Set-Cookie', `auth_token=${newToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`);
      
      // Use new access token
      decoded.accessToken = newAccessToken;
    }
    
    // Get query parameters
    const { maxResults = '20', category, query = '' } = req.query;
    
    // Create Gmail service
    const gmailService = new GmailService(decoded.accessToken);
    
    // Fetch emails
    let emails = await gmailService.fetchEmails(Number(maxResults), query as string);
    
    // Filter by category if specified
    if (category && Object.values(EmailCategory).includes(category as EmailCategory)) {
      emails = emails.filter(email => email.category === category);
    }
    
    res.status(200).json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
} 