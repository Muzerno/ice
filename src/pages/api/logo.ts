import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');

    try {
        const imageBuffer = fs.readFileSync(logoPath);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error serving logo:', error);
        res.status(500).json({ message: 'Error serving logo' });
    }
} 