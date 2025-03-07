import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create mock JWT token with user info and tokens
    const token = jwt.sign(
      {
        accountId: 'mock_account_id',
        name: 'Demo User',
        email: 'demo@example.com',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + 3600 * 1000 // 1 hour
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set JWT as cookie
    const cookie = serialize('dropbox_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    res.setHeader('Set-Cookie', cookie);
    
    // Redirect to dashboard
    res.redirect('/dashboard/files');
  } catch (error) {
    console.error('Error in mock Dropbox callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
} 