import axios from 'axios';

// Dropbox OAuth configuration
const DROPBOX_AUTH_URL = 'https://www.dropbox.com/oauth2/authorize';
const DROPBOX_TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
const REDIRECT_URI = process.env.NEXT_PUBLIC_DROPBOX_REDIRECT_URI || 'http://localhost:3000/api/auth/dropbox/callback';
const CLIENT_ID = process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET || '';

// Token response interface
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  account_id: string;
  uid: string;
}

// Dropbox auth service
export class DropboxAuthService {
  // Generate OAuth authorization URL
  static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      token_access_type: 'offline'
    });
    
    return `${DROPBOX_AUTH_URL}?${params.toString()}`;
  }
  
  // Exchange authorization code for tokens
  static async getTokensFromCode(code: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      });
      
      const response = await axios.post(DROPBOX_TOKEN_URL, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }
  
  // Refresh access token using refresh token
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });
      
      const response = await axios.post(DROPBOX_TOKEN_URL, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
  
  // Get user account info
  static async getUserInfo(accessToken: string): Promise<{ account_id: string; name: string; email: string }> {
    try {
      const response = await axios.post('https://api.dropboxapi.com/2/users/get_current_account', null, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return {
        account_id: response.data.account_id,
        name: response.data.name.display_name,
        email: response.data.email
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user info');
    }
  }
} 