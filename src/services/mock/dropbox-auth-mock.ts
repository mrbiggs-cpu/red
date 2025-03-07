// Mock Dropbox auth service
export class MockDropboxAuthService {
  // Generate mock auth URL
  static getAuthUrl(): string {
    return '/api/auth/dropbox/mock-callback';
  }
  
  // Get mock tokens
  static async getTokensFromCode(code: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      token_type: 'bearer',
      account_id: 'mock_account_id',
      uid: 'mock_uid'
    };
  }
  
  // Refresh mock token
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return 'new_mock_access_token';
  }
  
  // Get mock user info
  static async getUserInfo(accessToken: string): Promise<{ account_id: string; name: string; email: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      account_id: 'mock_account_id',
      name: 'Demo User',
      email: 'demo@example.com'
    };
  }
} 