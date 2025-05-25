import { NextApiRequest, NextApiResponse } from "next";
import { exportHtmlToPdf } from "@/utils/pdfService";
import path from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import AxiosInstances from "@/utils/axiosInstance";
import { format } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let htmlFilePath = "";
  const outputPdfPath = path.join(process.cwd(), "public", "report.pdf");
  const logoPath = path.join(process.cwd(), "public", "logo.jpg");
  const { type, date_from, date_to, line } = req.query;

  try {
    // ตรวจสอบว่าไฟล์ logo มีอยู่จริง
    try {
      await fs.access(logoPath);
    } catch (error) {
      console.error("Logo file not found:", error);
    }

    const body = {
      type: type,
      date_from: date_from,
      date_to: date_to,
      line: line,
    };
    const result = await AxiosInstances.patch("/dashboard/export", body);
    let rowData: any[] = [];
    let rowData2: any[] = [];
    let total = 0;
    let totalAmount = 0;
    if (type === "manufacture" && result.data) {
      htmlFilePath = path.join(
        process.cwd(),
        "src",
        "app",
        "dashboard",
        "template",
        "example1.html"
      );

      // Group by date first
      const groupedByDate = result.data.reduce((acc: any, item: any) => {
        const dateOnly = format(
          new Date(item.manufacture?.date_time),
          "dd/MM/yyyy"
        );
        if (!acc[dateOnly]) {
          acc[dateOnly] = {
            products: {},
            manufacture_amount_total: 0,
          };
        }

        const productId = item.products.ice_id;
        if (!acc[dateOnly].products[productId]) {
          acc[dateOnly].products[productId] = {
            ...item.products,
            manufacture_amount: 0,
          };
        }
        acc[dateOnly].products[productId].manufacture_amount +=
          item.manufacture_amount;
        acc[dateOnly].manufacture_amount_total += item.manufacture_amount;
        return acc;
      }, {});

      // Convert to final format with index starting from 1 for each date
      rowData = Object.entries(groupedByDate).map(
        ([date, data]: [string, any]) => {
          let dateIndex = 1;
          const productsWithIndex = Object.values(data.products).map(
            (product: any) => ({
              index: dateIndex++,
              ...product,
            })
          );

          return {
            date_time: date,
            manufacture_amount_total: data.manufacture_amount_total,
            products: productsWithIndex,
          };
        }
      );

      const groupedData = result.data.reduce((acc: any, item: any) => {
        const productName = item.products.name;
        if (!acc[productName]) {
          acc[productName] = {
            product_name: productName,
            manufacture_amount: 0,
            items: [],
          };
        }
        acc[productName].manufacture_amount += item.manufacture_amount;
        acc[productName].items.push(item);
        return acc;
      }, {});

      // Convert grouped data to array
      rowData2 = Object.values(groupedData).map(
        (group: any, index: number) => ({
          index: index + 1,
          product_name: group.product_name,
          manufacture_amount: group.manufacture_amount,
          items: group.items,
        })
      );

      // Calculate total manufacture amount
      total = rowData2.reduce(
        (sum: number, group: any) => sum + group.manufacture_amount,
        0
      );
    }

    if (type === "withdraw" && result.data) {
      htmlFilePath = path.join(
        process.cwd(),
        "src",
        "app",
        "dashboard",
        "template",
        "withdraw.html"
      );

      // Group data by line_name and date_time
      const groupedData = result.data.reduce((acc: any, item: any) => {
        const key = `${item.transportation_car.Lines[0].line_name}-${format(
          new Date(item.date_time),
          "dd/MM/yyyy"
        )}`;
        if (!acc[key]) {
          acc[key] = {
            line_name: item.transportation_car.Lines[0].line_name,
            date_time: format(new Date(item.date_time), "dd/MM/yyyy"),
            car_number: item.transportation_car.car_number,
            amount: 0,
            withdraw_details: [],
            items: [],
          };
        }
        const totalWithdrawAmount = item.withdraw_details.reduce(
          (sum: number, detail: any) => sum + detail.amount,
          0
        );
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
        withdraw_details: group.withdraw_details,
      }));

      // Calculate total amount
      total = rowData.reduce(
        (sum: number, group: any) => sum + group.amount,
        0
      );

      // === 🔽 สร้าง summaryData และ totalAmount ===
      const summaryMap = new Map<string, { total: number; items: any[] }>();

      rowData.forEach((group: any) => {
        group.withdraw_details.forEach((detail: any) => {
          const name = detail.product?.name || "ไม่ทราบชื่อ";
          const amount = detail.amount;

          if (summaryMap.has(name)) {
            const entry = summaryMap.get(name)!;
            entry.total += amount;
            entry.items.push(detail);
          } else {
            summaryMap.set(name, {
              total: amount,
              items: [detail],
            });
          }
        });
      });

      rowData2 = Array.from(summaryMap.entries()).map(
        ([ice_name, data], index) => ({
          index: index + 1,
          ice_name,
          total_amount: data.total,
          items: data.items,
        })
      );

      totalAmount = rowData2.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );
    }

    if (type === "money" && result.data) {
      htmlFilePath = path.join(
        process.cwd(),
        "src",
        "app",
        "dashboard",
        "template",
        "money.html"
      );
      const groupedData = result.data.reduce((acc: any, item: any) => {
        const dropOffPoints = item.line?.dropOffPoints || [];

        dropOffPoints.forEach((drop: any) => {
          const details = drop.delivery_details || [];
          if (details.length === 0) return; // 🧹 ข้ามถ้าไม่มีน้ำแข็ง

          const lineId = drop.line_id;
          const lines = details[0]?.car?.Lines || [];

          const matchedLine = lines.find(
            (line: any) => line.line_id === lineId
          );
          const lineName = matchedLine?.line_name || "ไม่พบชื่อสาย";

          const date = format(new Date(item.date_time), "dd/MM/yyyy");
          const key = `${lineName}-${date}`;

          // 🛑 สร้าง key เฉพาะเมื่อเจอ delivery ที่มีข้อมูลจริง
          if (!acc[key]) {
            acc[key] = {
              line_name: lineName,
              date: date,
              ice_details: {},
              total_amount: 0,
            };
          }

          details.forEach((detail: any) => {
            if (!detail?.product?.ice_id) return;

            const productId = detail.product.ice_id;
            if (!acc[key].ice_details[productId]) {
              acc[key].ice_details[productId] = {
                name: detail.product.name,
                amount: 0,
                price: detail.price,
                total: 0,
              };
            }

            acc[key].ice_details[productId].amount += detail.amount;
            acc[key].ice_details[productId].total =
              acc[key].ice_details[productId].amount * detail.price;
          });

          // คำนวณยอดรวมจากน้ำแข็งจริง ๆ
          acc[key].total_amount = Object.values(acc[key].ice_details).reduce(
            (sum: number, detail: any) => sum + detail.total,
            0
          );
        });


        return acc;
      }, {});

      rowData = Object.values(groupedData).map((group: any, index: number) => ({
        index: index + 1,
        date: group.date,
        line_name: group.line_name,
        ice_list: Object.values(group.ice_details).map(
          (ice: any, iceIndex: number) => ({
            index: iceIndex + 1,
            indexs: index + 1,
            name: ice.name,
            amount: ice.amount,
            price: ice.price,
            total: ice.total,
          })
        ),
        total_amount: group.total_amount,
      }));

      total = rowData.reduce(
        (sum: number, group: any) => sum + group.total_amount,
        0
      );
    }

    if (type === "delivery" && result.data) {
      htmlFilePath = path.join(
        process.cwd(),
        "src",
        "app",
        "dashboard",
        "template",
        "delivery.html"
      );
      // จัดกลุ่มข้อมูลตาม line_name
      const groupedData = result.data.reduce((acc: any, item: any) => {
        const lineName = item?.line?.line_name || item?.car?.car_number;
        const customerName = item?.customer?.name || item?.customer_order?.name;

        if (!acc[lineName]) {
          acc[lineName] = {
            line_name: lineName,
            customers: new Set(),
          };
        }
        if (customerName) {
          acc[lineName].customers.add(customerName);
        }
        return acc;
      }, {});

      // แปลงข้อมูลที่จัดกลุ่มแล้วเป็น array
      rowData = Object.values(groupedData).map((group: any, index: number) => ({
        index: index + 1,
        line_name: group.line_name,
        customers: Array.from(group.customers as Set<string>).map(
          (name: string, index: number) => ({
            index: index + 1,
            customer_name: name,
          })
        ),
      }));

      // คำนวณจำนวน customer ทั้งหมด
      total = rowData.reduce(
        (sum: number, group: any) => sum + group.customers.length,
        0
      );
    }
    const htmlTemplate = await fs.readFile(htmlFilePath, "utf-8");
    const template = Handlebars.compile(htmlTemplate);
    const formattedDateFrom = date_from
      ? format(new Date(date_from as string), "dd/MM/yyyy")
      : "";
    const formattedDateTo = date_to
      ? format(new Date(date_to as string), "dd/MM/yyyy")
      : "";
    const htmlContent = template({
      rowData,
      date_from: formattedDateFrom,
      date_to: formattedDateTo,
      total,
      rowData2,
      totalAmount,
    });

    const publicDir = path.join(process.cwd(), "public");
    await fs.mkdir(publicDir, { recursive: true });

    const pdfPath = await exportHtmlToPdf(htmlContent, outputPdfPath);
    res
      .status(200)
      .json({ message: "PDF generated successfully", pdfPath: pdfPath });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
