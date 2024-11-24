import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../logging/error'; // Import your logger

// API route to handle logging
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { message, level = 'error' } = req.body;

    // Log the error or message with a specific level
    logger.log({
      level, // Error, info, debug, etc.
      message,
    });

    // Respond with success
    res.status(200).json({ success: true, message: 'Log recorded successfully.' });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ success: false, error: 'Failed to record log' });
  }
}
