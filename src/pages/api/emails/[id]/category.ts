import type { NextApiRequest, NextApiResponse } from 'next';
import { GmailService, EmailCategory } from '@/services/gmail';
import jwt from 'jsonwebtoken';
import { GmailAuthService } from '@/services/auth/gmail-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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
    
    // Get email ID from URL
    const { id } = req.query;
    
    // Get new category from request body
    const { category } = req.body;
    
    if (!category || !Object.values(EmailCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Create Gmail service
    const gmailService = new GmailService(decoded.accessToken);
    
    // Move email to new category
    const success = await gmailService.moveToCategory(id as string, category);
    
    if (success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to change email category' });
    }
  } catch (error) {
    console.error('Error changing email category:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to change email category' });
  }
} 