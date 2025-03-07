import type { NextApiRequest, NextApiResponse } from 'next';
import { DropboxAuthService } from '@/services/auth/dropbox-auth';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing authorization code' });
  }
  
  try {
    // Exchange code for tokens
    const tokens = await DropboxAuthService.getTokensFromCode(code);
    
    // Get user info
    const userInfo = await DropboxAuthService.getUserInfo(tokens.access_token);
    
    // Create JWT token with user info and tokens
    const token = jwt.sign(
      {
        accountId: userInfo.account_id,
        name: userInfo.name,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000
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
    console.error('Error in Dropbox callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
} 