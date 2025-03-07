import type { NextApiRequest, NextApiResponse } from 'next'
import { getBuildiumToken } from '@/services/buildium'
import axios from 'axios'

type ApprovalResponse = {
  success: boolean
  message: string
  workOrderId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApprovalResponse>
) {
  // Only allow PUT requests for approvals
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const { action, token } = req.body

    // Validate the token (in a real app, verify JWT or other secure token)
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
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
      `https://api.buildium.com/v1/workorders/${id}`,
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
      return res.status(200).json({
        success: true,
        message: `Work order ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        workOrderId: id as string
      })
    } else {
      throw new Error('Failed to update work order in Buildium')
    }
  } catch (error) {
    console.error('Approval error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to process approval'
    })
  }
} 