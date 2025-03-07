import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { getBuildiumToken } from '@/services/buildium'
import axios from 'axios'

type EmailActionResponse = {
  success: boolean
  message: string
  redirectUrl?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailActionResponse>
) {
  // Only allow GET requests for email actions
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { action } = req.query
    const { token } = req.query as { token: string }

    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' })
    }

    // Verify the token
    let decodedToken: any
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }

    // Extract work order ID from token
    const { workOrderId } = decodedToken

    if (!workOrderId) {
      return res.status(400).json({ success: false, message: 'Invalid token payload' })
    }

    // Validate the action
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ success: false, message: 'Invalid action' })
    }

    // Get Buildium API token
    const buildiumToken = await getBuildiumToken()
    
    // Update the work order in Buildium
    // This is a simplified example - actual implementation would use Buildium's API
    const buildiumResponse = await axios.put(
      `https://api.buildium.com/v1/workorders/${workOrderId}`,
      {
        status: action === 'approve' ? 'Approved' : 'Rejected',
      },
      {
        headers: {
          'Authorization': `Bearer ${buildiumToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (buildiumResponse.status === 200) {
      // Redirect to a success page
      return res.redirect(307, `/email-action-success?action=${action}&id=${workOrderId}`)
    } else {
      throw new Error('Failed to update work order in Buildium')
    }
  } catch (error) {
    console.error('Email action error:', error)
    // Redirect to an error page
    return res.redirect(307, '/email-action-error')
  }
} 