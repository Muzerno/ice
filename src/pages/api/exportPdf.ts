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

    const { type, date_from, date_to, line } = req.query;

    try {
        const body = {
            type: type,
            date_from: date_from,
            date_to: date_to,
            line: line
        }
        const result = await AxiosInstances.patch('/dashboard/export', body);
        let rowData = []
        let rowData2: any[] = []
        let total = 0
        if (type === 'manufacture' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'example1.html');
            rowData = result.data.map((item: any, index: number) => {
                total += item.manufacture_amount
                return {
                    index: index + 1,
                    ...item,
                    date_time: format(new Date(item.date_time), 'dd/MM/yyyy HH:mm'),
                }
            })
            // Group data by product name
            const groupedData = result.data.reduce((acc: any, item: any) => {
                const productName = item.products.name;
                if (!acc[productName]) {
                    acc[productName] = {
                        product_name: productName,
                        manufacture_amount: 0,
                        items: []
                    };
                }
                acc[productName].manufacture_amount += item.manufacture_amount;
                acc[productName].items.push(item);
                return acc;
            }, {});

            // Convert grouped data to array
            rowData2 = Object.values(groupedData).map((group: any, index: number) => ({
                index: index + 1,
                product_name: group.product_name,
                manufacture_amount: group.manufacture_amount,
                items: group.items
            }));

            // Calculate total manufacture amount
            total = rowData2.reduce((sum: number, group: any) => sum + group.manufacture_amount, 0);
        }

        if (type === 'withdraw' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'withdraw.html');

            // Group data by line_name and date_time
            const groupedData = result.data.reduce((acc: any, item: any) => {
                const key = `${item.transportation_car.Lines[0].line_name}-${format(new Date(item.date_time), 'dd/MM/yyyy')}`;
                if (!acc[key]) {
                    acc[key] = {
                        line_name: item.transportation_car.Lines[0].line_name,
                        date_time: format(new Date(item.date_time), 'dd/MM/yyyy'),
                        car_number: item.transportation_car.car_number,
                        amount: 0,
                        withdraw_details: [],
                        items: []
                    };
                }
                const totalWithdrawAmount = item.withdraw_details.reduce((sum: number, detail: any) => sum + detail.amount, 0);
                acc[key].amount += totalWithdrawAmount;
                acc[key].items.push(item);

                acc[key].withdraw_details.push(...item.withdraw_details);
                return acc;
            }, {});

            // Convert grouped data to array
            rowData = Object.values(groupedData).map((group: any, index: number) => ({
                index: index + 1,
                line_name: group.line_name,
                date_time: group.date_time,
                amount: group.amount,
                items: group.items,
                car_number: group.car_number,
                withdraw_details: group.withdraw_details
            }));

            // Calculate total amount
            total = rowData.reduce((sum: number, group: any) => sum + group.amount, 0);
        }
        if (type === 'money' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'money.html');
            const groupedData = result.data.reduce((acc: any, item: any) => {
                const key = `${item?.delivery?.car?.Lines[0]?.line_name}-${format(new Date(item.date_time), 'dd/MM/yyyy')}`;
                if (!acc[key]) {
                    acc[key] = {
                        line_name: item?.delivery?.car?.Lines[0]?.line_name,
                        date_time: format(new Date(item.date_time), 'dd/MM/yyyy'),
                        amount: 0,
                        items: []
                    };
                }
                acc[key].amount += item.amount;
                acc[key].items.push(item);
                return acc;
            }, {});

            // Convert grouped data to array
            rowData = Object.values(groupedData).map((group: any, index: number) => ({
                index: index + 1,
                line_name: group.line_name,
                date_time: group.date_time,
                amount: group.amount,
                items: group.items
            }));

            // Calculate total amount
            total = rowData.reduce((sum: number, group: any) => sum + group.amount, 0);

            // return res.status(200).json({ rowData, total });
        }
        if (type === 'delivery' && result.data) {
            htmlFilePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'template', 'delivery.html');
            rowData = result.data.map((item: any, index: number) => {
                const customer_name = item?.customer_order?.name || item?.customer?.name
                const customer_type = item?.drop_type === "dayly" ? "จุดส่งประจำวัน" : "คำสั่งซื้อพิเศษ"
                return {
                    index: index + 1,
                    line_name: item?.line?.line_name || item?.car?.car_number,
                    customer_name,
                    customer_type,
                    items: item
                }
            })
            total = rowData.length;
        }
        const htmlTemplate = await fs.readFile(htmlFilePath, 'utf-8');
        const template = Handlebars.compile(htmlTemplate);
        const formattedDateFrom = date_from ? format(new Date(date_from as string), 'dd/MM/yyyy') : '';
        const formattedDateTo = date_to ? format(new Date(date_to as string), 'dd/MM/yyyy') : '';
        const htmlContent = template({ rowData, date_from: formattedDateFrom, date_to: formattedDateTo, total, rowData2 });

        const publicDir = path.join(process.cwd(), 'public');
        await fs.mkdir(publicDir, { recursive: true });

        const pdfPath = await exportHtmlToPdf(htmlContent, outputPdfPath);
        res.status(200).json({ message: 'PDF generated successfully', pdfPath: pdfPath });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}