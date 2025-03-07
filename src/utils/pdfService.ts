import puppeteer from 'puppeteer';

export const exportHtmlToPdf = async (htmlContent: string, outputPdfPath: string) => {

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPdfPath, format: 'A4' });
    await browser.close();
    return outputPdfPath;
};
