import { NextApiRequest, NextApiResponse } from 'next';
import { exportHtmlToPdf } from '@/utils/pdfService';
import path from 'path';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import AxiosInstances from '@/utils/axiosInstance';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let htmlFilePath = ""
    const outputPdfPath = path.join(process.cwd(), 'public', 'report.pdf');

    const { type, date_from, date_to } = req.query;

    try {
        const body = {
            type: type,
            date_from: date_from,
            date_to: date_to
        }
        const result = await AxiosInstances.patch('/dashboard/export', body);
        let rowData = []
        let total = 0
        if (type === 'manufacture' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'example1.html');
            rowData = result.data.map((item: any, index: number) => {
                total += item.manufacture_amount
                return {
                    index: index + 1,
                    ...item,
                    date_time: format(new Date(item.date_time), 'dd/MM/yyyy HH:mm:ss'),
                }
            })
        }

        if (type === 'withdraw' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'withdraw.html');
            rowData = result.data.map((item: any, index: number) => {

                return {
                    index: index + 1,
                    ...item,
                    line_name: item.transportation_car.Lines[0].line_name,
                    date_time: format(new Date(item.date_time), 'dd/MM/yyyy HH:mm:ss'),
                }
            })
            total = result.data.length
        }
        if (type === 'money' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'money.html');
            rowData = result.data.map((item: any, index: number) => {
                total += item.amount
                return {
                    index: index + 1,
                    ...item,
                    line_name: item.delivery.car.Lines[0].line_name,
                    date_time: format(new Date(item.date_time), 'dd/MM/yyyy HH:mm:ss'),
                }
            })
        }

        const htmlTemplate = await fs.readFile(htmlFilePath, 'utf-8');
        const template = Handlebars.compile(htmlTemplate);
        const formattedDateFrom = date_from ? format(new Date(date_from as string), 'dd/MM/yyyy') : '';
        const formattedDateTo = date_to ? format(new Date(date_to as string), 'dd/MM/yyyy') : '';
        const htmlContent = template({ rowData, date_from: formattedDateFrom, date_to: formattedDateTo, total });

        const publicDir = path.join(process.cwd(), 'public');
        await fs.mkdir(publicDir, { recursive: true });

        const pdfPath = await exportHtmlToPdf(htmlContent, outputPdfPath);
        res.status(200).json({ message: 'PDF generated successfully', pdfPath: pdfPath });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}