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
    let withdrawByDay: any[] = [];
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

      // 👉 แยกตามสาย-วัน (เดิม)
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
          (sum: number, detail: any) => sum + (detail.amount || 0),
          0
        );
        acc[key].amount += totalWithdrawAmount;
        acc[key].items.push(item);
        acc[key].withdraw_details.push(...item.withdraw_details);
        return acc;
      }, {});

      // Convert grouped data to array
      rowData = Object.values(groupedData).map(
        (group: any, index: number) => ({
          index: index + 1,
          line_name: group.line_name,
          date_time: group.date_time,
          amount: group.amount,
          items: group.items,
          car_number: group.car_number,
          withdraw_details: group.withdraw_details,
        })
      );

      // Calculate total amount
      total = rowData.reduce(
        (sum: number, group: any) => sum + group.amount,
        0
      );

      const totalItems = rowData.reduce((sum: number, group: any) => {
        return (
          sum +
          group.withdraw_details.reduce(
            (itemSum: number, detail: any) => itemSum + detail.amount,
            0
          )
        );
      }, 0);

      // 👉 แยกตามวันที่ (รวมทุกสาย) - แก้ไขเพื่อรวม ice_id เดียวกัน
      const withdrawByDayData = Object.values(
        result.data.reduce((acc: any, item: any) => {
          const dateKey = format(new Date(item.date_time), "dd/MM/yyyy");

          if (!acc[dateKey]) {
            acc[dateKey] = {
              date_time: dateKey,
              items: [],
              withdraw_details_grouped: {}, // เปลี่ยนเป็น object เพื่อจัดกลุ่ม
              amount: 0,
            };
          }

          // จัดกลุ่ม withdraw_details ตาม ice_id
          item.withdraw_details.forEach((detail: any) => {
            const iceId = detail.ice_id;
            if (!acc[dateKey].withdraw_details_grouped[iceId]) {
              acc[dateKey].withdraw_details_grouped[iceId] = {
                ice_id: detail.ice_id,
                product: detail.product,
                amount: 0,
              };
            }
            acc[dateKey].withdraw_details_grouped[iceId].amount +=
              detail.amount;
          });

          const totalWithdrawAmount = item.withdraw_details.reduce(
            (sum: number, detail: any) => sum + (detail.amount || 0),
            0
          );

          acc[dateKey].amount += totalWithdrawAmount;
          acc[dateKey].items.push(item);

          return acc;
        }, {})
      ).map((group: any, index: number) => ({
        index: index + 1,
        date_time: group.date_time,
        items: group.items,
        withdraw_details: Object.values(group.withdraw_details_grouped), // แปลงกลับเป็น array
        amount: group.amount,
      }));

      // 👉 สรุปตามประเภทน้ำแข็ง (เดิม)
      const iceSummary = result.data.reduce((acc: any, item: any) => {
        item.withdraw_details.forEach((detail: any) => {
          const productName = detail.product.name;
          if (!acc[productName]) {
            acc[productName] = {
              ice_name: productName,
              total_amount: 0,
            };
          }
          acc[productName].total_amount += detail.amount;
        });
        return acc;
      }, {});

      const summaryRowData = Object.values(iceSummary).map(
        (item: any, index: number) => ({
          index: index + 1,
          ice_name: item.ice_name,
          total_amount: item.total_amount,
        })
      );

      // Set all data for template
      rowData2 = summaryRowData;
      totalAmount = totalItems;
      withdrawByDay = withdrawByDayData;

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

    if (type === "stock" && result.data) {
      htmlFilePath = path.join(
        process.cwd(),
        "src",
        "app",
        "dashboard",
        "template",
        "stock.html"
      );

      const stockInCar = result.data.stockInCar || [];
      const products = result.data.products || [];

      // Group ข้อมูล stock แยกตามรถ
      const groupedData = stockInCar.reduce((acc: any, item: any) => {
        const carId = item?.car?.car_id;
        const carNumber = item?.car?.car_number || `รถหมายเลข ${carId}`;
        const key = `${carId}-${carNumber}`;

        if (!acc[key]) {
          acc[key] = {
            car_id: carId,
            car_number: carNumber,
            stock_items_grouped: {}, // รวมสินค้า ice_id เดียวกัน
            total_stock: 0,
          };
        }

        const iceId = item.ice_id;
        if (!acc[key].stock_items_grouped[iceId]) {
          acc[key].stock_items_grouped[iceId] = {
            ice_id: iceId,
            product_name: item?.product?.name || "ไม่ระบุชื่อสินค้า",
            amount: 0,
          };
        }

        acc[key].stock_items_grouped[iceId].amount += item.amount || 0;
        acc[key].total_stock += item.amount || 0;

        return acc;
      }, {});

      // เติมสินค้าใน products ที่ไม่มีอยู่ในรถ (amount = 0)
      Object.values(groupedData).forEach((group: any) => {
        products.forEach((product: any) => {
          const iceId = product.ice_id;
          if (!group.stock_items_grouped[iceId]) {
            group.stock_items_grouped[iceId] = {
              ice_id: iceId,
              product_name: product.name || "ไม่ระบุชื่อสินค้า",
              amount: 0,
            };
          }
        });
      });

      // แปลงกลับเป็น array สำหรับใช้ใน HTML template
      rowData = Object.values(groupedData).map((group: any, index: number) => ({
        index: index + 1,
        car_id: group.car_id,
        car_number: group.car_number,
        stock_items: Object.values(group.stock_items_grouped).map((item: any, itemIndex: number) => ({
          ...item,
          index: itemIndex + 1 // เพิ่ม index สำหรับแต่ละ item
        })),
        total_stock: group.total_stock,
      }));

      // แปลงเป็น array และเรียงลำดับ
      const summaryData = products.map((product: any, index: number) => ({
        index: index + 1,
        ice_id: product.ice_id,
        product_name: product.name || "ไม่ระบุชื่อสินค้า",
        amount: product.amount || 0, // ใช้ amount จาก products โดยตรง
      }));

      // ตั้งค่า rowData2 เป็น summaryData สำหรับใช้ใน template
      rowData2 = summaryData;

      // รวมยอดทั้งหมดทุกคัน
      total = rowData.reduce(
        (sum: number, group: any) => sum + group.total_stock,
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
      withdrawByDay,
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
