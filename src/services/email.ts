import axios from 'axios'
import jwt from 'jsonwebtoken'

type EmailData = {
  to: string
  subject: string
  workOrderId: string
  workOrderTitle: string
  amount: number
  vendor: string
  dueDate: string
}

export const sendApprovalEmail = async (data: EmailData) => {
  try {
    // Generate secure token for email actions
    const token = jwt.sign(
      { 
        workOrderId: data.workOrderId,
        action: 'pending',
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    )
    
    // In a real app, you would use a service like SendGrid, Mailgun, etc.
    // For demo purposes, we'll just log the email content
    console.log(`
      To: ${data.to}
      Subject: ${data.subject}
      
      Work Order Approval Request: ${data.workOrderTitle}
      
      A new work order requires your approval:
      
      Work Order ID: ${data.workOrderId}
      Title: ${data.workOrderTitle}
      Vendor: ${data.vendor}
      Amount: $${data.amount.toFixed(2)}
      Due Date: ${new Date(data.dueDate).toLocaleDateString()}
      
      Please click one of the following links to take action:
      
      Approve: ${process.env.NEXT_PUBLIC_APP_URL}/api/email-actions/approve?token=${token}
      Reject: ${process.env.NEXT_PUBLIC_APP_URL}/api/email-actions/reject?token=${token}
      
      This link will expire in 7 days.
    `)
    
    // In a real app, you would send the email via an API
    // const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
    //   personalizations: [{ to: [{ email: data.to }] }],
    //   from: { email: 'noreply@yourcompany.com' },
    //   subject: data.subject,
    //   content: [{ type: 'text/html', value: emailHtml }]
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send approval email:', error)
    return { success: false, error }
  }
} 