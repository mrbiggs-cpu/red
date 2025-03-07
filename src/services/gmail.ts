import axios from 'axios';

// Gmail API scopes needed for our application
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
];

// Gmail API base URL
const API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Email categories
export enum EmailCategory {
  WORK_ORDER = 'WORK_ORDER',
  VENDOR_RESPONSE = 'VENDOR_RESPONSE',
  APPROVAL = 'APPROVAL',
  UNCATEGORIZED = 'UNCATEGORIZED'
}

// Email interface
export interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
    body: {
      data?: string;
    };
    parts?: {
      mimeType: string;
      body: {
        data?: string;
      };
    }[];
  };
  internalDate: string;
  category?: EmailCategory;
}

// Gmail service class
export class GmailService {
  private token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  // Fetch emails with optional query parameters
  async fetchEmails(maxResults = 20, query = ''): Promise<Email[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: {
          maxResults,
          q: query
        }
      });
      
      const messageIds = response.data.messages || [];
      const emails: Email[] = [];
      
      // Fetch full email details for each message ID
      for (const { id } of messageIds) {
        const email = await this.fetchEmailById(id);
        if (email) {
          // Categorize the email
          email.category = this.categorizeEmail(email);
          emails.push(email);
        }
      }
      
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails');
    }
  }
  
  // Fetch a single email by ID
  async fetchEmailById(id: string): Promise<Email | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        params: {
          format: 'full'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching email ${id}:`, error);
      return null;
    }
  }
  
  // Categorize an email based on content
  categorizeEmail(email: Email): EmailCategory {
    const subject = this.getHeader(email, 'Subject') || '';
    const body = this.getEmailBody(email) || '';
    const from = this.getHeader(email, 'From') || '';
    
    // Work Order detection
    if (
      subject.match(/work order|maintenance request|repair request/i) ||
      body.match(/new work order|maintenance needed|please repair|service request/i)
    ) {
      return EmailCategory.WORK_ORDER;
    }
    
    // Vendor Response detection
    if (
      subject.match(/re: work order|quote|estimate|invoice/i) ||
      body.match(/completed work|service completed|invoice attached|quote for services/i) ||
      from.match(/contractor|service|repair|vendor|maintenance/i)
    ) {
      return EmailCategory.VENDOR_RESPONSE;
    }
    
    // Approval detection
    if (
      subject.match(/approval|approve work order|authorization needed/i) ||
      body.match(/needs your approval|please approve|waiting for authorization|pending approval/i)
    ) {
      return EmailCategory.APPROVAL;
    }
    
    return EmailCategory.UNCATEGORIZED;
  }
  
  // Get email header by name
  private getHeader(email: Email, name: string): string | null {
    const header = email.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
  }
  
  // Extract email body text
  private getEmailBody(email: Email): string {
    // Try to get body from the main payload
    if (email.payload.body && email.payload.body.data) {
      return this.decodeBase64(email.payload.body.data);
    }
    
    // If not found, try to get from parts
    if (email.payload.parts && email.payload.parts.length > 0) {
      // Look for text/plain or text/html parts
      const textPart = email.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      
      if (textPart && textPart.body && textPart.body.data) {
        return this.decodeBase64(textPart.body.data);
      }
    }
    
    return '';
  }
  
  // Decode base64 encoded string
  private decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
  
  // Move email to a different category (applies labels)
  async moveToCategory(emailId: string, category: EmailCategory): Promise<boolean> {
    try {
      // First, remove existing category labels
      await this.removeAllCategoryLabels(emailId);
      
      // Then add the new category label
      const labelId = await this.getCategoryLabelId(category);
      
      await axios.post(`${API_BASE_URL}/messages/${emailId}/modify`, {
        addLabelIds: [labelId]
      }, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error moving email ${emailId} to category ${category}:`, error);
      return false;
    }
  }
  
  // Remove all category labels from an email
  private async removeAllCategoryLabels(emailId: string): Promise<void> {
    try {
      const categoryLabels = await Promise.all(
        Object.values(EmailCategory).map(category => this.getCategoryLabelId(category))
      );
      
      await axios.post(`${API_BASE_URL}/messages/${emailId}/modify`, {
        removeLabelIds: categoryLabels
      }, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
    } catch (error) {
      console.error(`Error removing category labels from email ${emailId}:`, error);
    }
  }
  
  // Get or create a label for a category
  private async getCategoryLabelId(category: EmailCategory): Promise<string> {
    const labelName = `Dashboard/${category}`;
    
    try {
      // Try to find existing label
      const response = await axios.get(`${API_BASE_URL}/labels`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      const existingLabel = response.data.labels.find((label: any) => label.name === labelName);
      
      if (existingLabel) {
        return existingLabel.id;
      }
      
      // Create new label if not found
      const createResponse = await axios.post(`${API_BASE_URL}/labels`, {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      }, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      return createResponse.data.id;
    } catch (error) {
      console.error(`Error getting/creating label for category ${category}:`, error);
      throw new Error(`Failed to get/create label for category ${category}`);
    }
  }
} 