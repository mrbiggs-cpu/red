import axios from 'axios';
import { redis } from '../config/redis';

export class BuildiumService {
  private static instance: BuildiumService;
  private token: string | null = null;
  private readonly baseUrl = 'https://api.buildium.com/v1';

  private constructor() {}

  public static getInstance(): BuildiumService {
    if (!BuildiumService.instance) {
      BuildiumService.instance = new BuildiumService();
    }
    return BuildiumService.instance;
  }

  private async getToken(): Promise<string> {
    // Check Redis cache first
    const cachedToken = await redis.get('buildium_token') as string | null;
    if (cachedToken) return cachedToken;

    // If no cached token, get new one
    const tokenResponse = await axios.post(
      'https://auth.buildium.com/oauth/token',
      {
        grant_type: 'client_credentials',
        client_id: process.env.BUILDIUM_CLIENT_ID,
        client_secret: process.env.BUILDIUM_CLIENT_SECRET,
      }
    );

    const token = tokenResponse.data.access_token;
    // Cache token with expiry
    await redis.set('buildium_token', token, { ex: 3600 }); // 1 hour expiry
    return token;
  }

  async getWorkOrders(): Promise<any> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${this.baseUrl}/workorders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
  }

  // Add other methods for vendor requests and violations
} 