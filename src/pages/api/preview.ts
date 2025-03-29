import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const pdfPath = path.join(process.cwd(), 'public', 'report.pdf');

    try {
        // window.open(pdfPath, '_blank');
        const pdfBuffer = fs.readFileSync(pdfPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error serving logo:', error);
        res.status(500).json({ message: 'Error serving logo' });
    }
} 