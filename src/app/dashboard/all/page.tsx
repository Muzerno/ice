"use client";
import { getExportData } from "@/utils/dashboardService";
import LayoutComponent from "@/components/Layout";
import { findAllTransportationLine } from "@/utils/transpotationService";
import { Table, Select, DatePicker, Avatar, Divider, Button, Spin } from "antd";
import useMessage from "antd/es/message/useMessage";
import axios from "axios";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import "./page.css";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { title } from "process";

const ReportPage = () => {
  const router = useRouter();
  const [exportType, setExportType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [exportData, setExportData] = useState<any>([]);
  const [summaryData, setSummaryData] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [messageApi, contextHolder] = useMessage();
  const [transportationData, setTransportationData] = useState<any[]>([]);
  const [selectLine, setSelectLine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unit, setUnit] = useState("");
  const [showTable, setShowTable] = useState<boolean>(false);
  const [dateFromDisplay, setDateFromDisplay] = useState<string | null>(null);
  const [dateToDisplay, setDateToDisplay] = useState<string | null>(null);
  const [withdrawByDay, setWithdrawByDay] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);

  // Report type options
  const reportTypes = [
    { value: "manufacture", label: "รายงานการผลิต", unit: "รายการ" },
    { value: "withdraw", label: "รายงานการเบิก", unit: "รายการ" },
    { value: "stock", label: "รายงานสินค้าคงคลัง", unit: "รายการ" },
    { value: "money", label: "รายงานการจัดส่ง", unit: "บาท" },
  ];

  useEffect(() => {
    deliverLine();
  }, []);

  useEffect(() => {
    if (transportationData.length === 1) {
      setSelectLine(transportationData[0].line_id);
    }
  }, [transportationData]);

  useEffect(() => {
    if (exportType) {
      const selectedReport = reportTypes.find(
        (report) => report.value === exportType
      );
      setUnit(selectedReport?.unit || "");
      setShowTable(false); // Hide table when type changes
      setExportData([]); // Clear previous data
      setSummaryData([]); // Clear summary data
      setProductData([]);
      setTotal(0);
    }
  }, [exportType]);

  const deliverLine = async () => {
    const res = await findAllTransportationLine();
    if (res) {
      setTransportationData(res);
    }
  };

  const getExport = async () => {
    if (!exportType) {
      messageApi.error("กรุณาเลือกประเภทรายงาน");
      return;
    }

    if (exportType !== "stock" && (!dateFrom || !dateTo)) {
      messageApi.error("กรุณาเลือกช่วงวันที่");
      return;
    }

    setIsLoading(false);

    try {
      const response = await getExportData(
        dateFrom,
        dateTo,
        exportType,
        selectLine
      );

      if (
        (exportType === "stock" && response.stockInCar?.length > 0) ||
        (exportType !== "stock" &&
          Array.isArray(response) &&
          response.length > 0)
      ) {
        let rowData: any[] = [];
        let total: number = 0;

        if (exportType === "withdraw") {
          // 👉 แยกตามสาย-วัน (เดิม)
          const groupedData = response.reduce((acc: any, item: any) => {
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
            response.reduce((acc: any, item: any) => {
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
          const iceSummary = response.reduce((acc: any, item: any) => {
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

          setTotalAmount(totalItems);
          setSummaryData(summaryRowData);
          setWithdrawByDay(withdrawByDayData);
        } else if (exportType === "stock") {
          const stockInCar = response?.stockInCar || [];
          const products = response?.products || [];

          console.log("stockInCar", stockInCar);
          console.log("products", products);

          setProductData(products);

          // Group ข้อมูล stock แยกตามรถ
          const groupedData = stockInCar.reduce((acc: any, item: any) => {
            const carId = item?.car?.car_id;
            const carNumber = item?.car?.car_number || `รถหมายเลข ${carId}`;
            const key = `${carId}-${carNumber}`;

            if (!acc[key]) {
              acc[key] = {
                car_id: carId,
                car_number: carNumber,
                stock_items_grouped: {},
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

          // แปลงกลับเป็น array สำหรับ Table
          rowData = Object.values(groupedData).map(
            (group: any, index: number) => ({
              index: index + 1,
              car_id: group.car_id,
              car_number: group.car_number,
              stock_items: Object.values(group.stock_items_grouped),
              total_stock: group.total_stock,
            })
          );

          // **เพิ่มส่วนนี้: สร้าง summaryData**
          const summaryMap = new Map();

          // รวมข้อมูลจากทุกรถ
          rowData.forEach((car: any) => {
            car.stock_items.forEach((item: any) => {
              const key = item.ice_id;
              if (summaryMap.has(key)) {
                summaryMap.get(key).amount += item.amount;
              } else {
                summaryMap.set(key, {
                  ice_id: item.ice_id,
                  product_name: item.product_name,
                  amount: item.amount,
                });
              }
            });
          });

          // แปลงเป็น array และเรียงลำดับ
          const summaryData = products.map((product: any, index: number) => ({
            index: index + 1,
            ice_id: product.ice_id,
            product_name: product.name || "ไม่ระบุชื่อสินค้า",
            amount: product.amount || 0, // ใช้ amount จาก products โดยตรง
            price: product.price || 0,
          }));

          console.log("Summary Data:", summaryData);

          total = rowData.reduce(
            (sum: number, group: any) => sum + group.total_stock,
            0
          );
        } else if (exportType === "money") {
          const groupedData = response.reduce((acc: any, item: any) => {
            const lineName = item.line?.line_name || "ไม่พบชื่อสาย";
            const date = format(new Date(item.date_time), "dd/MM/yyyy");
            const key = `${lineName}-${date}`;

            if (!acc[key]) {
              acc[key] = {
                line_name: lineName,
                date: date,
                ice_details: {},
                total_amount: 0,
              };
            }

            const dropOffPoints = item.line?.dropOffPoints || [];
            dropOffPoints.forEach((drop: any) => {
              const deliveryDetails = drop.delivery_details || [];

              deliveryDetails.forEach((detail: any) => {
                const productId = detail?.product?.ice_id;
                if (!productId) return;

                if (!acc[key].ice_details[productId]) {
                  acc[key].ice_details[productId] = {
                    name: detail?.product?.name,
                    amount: 0,
                    price: detail?.price,
                    total: 0,
                  };
                }

                acc[key].ice_details[productId].amount += detail?.amount;
                acc[key].ice_details[productId].total =
                  acc[key].ice_details[productId].amount * detail?.price;
              });
            });

            acc[key].total_amount = Object.values(acc[key].ice_details).reduce(
              (sum: number, detail: any) => sum + detail.total,
              0
            );
            return acc;
          }, {});

          rowData = Object.values(groupedData).map(
            (group: any, index: number) => ({
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
            })
          );

          total = rowData.reduce(
            (sum: number, group: any) => sum + group.total_amount,
            0
          );
        } else if (exportType === "manufacture") {
          const groupedByDate = response.reduce((acc: any, item: any) => {
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

          total = rowData.reduce(
            (sum: number, group: any) => sum + group.manufacture_amount_total,
            0
          );

          // Create summary data for manufacture types and quantities
          const manufactureSummary = response.reduce((acc: any, item: any) => {
            const productName = item.products.name;
            if (!acc[productName]) {
              acc[productName] = {
                product_name: productName,
                total_amount: 0,
              };
            }
            acc[productName].total_amount += item.manufacture_amount;
            return acc;
          }, {});

          const manufactureSummaryData = Object.values(manufactureSummary).map(
            (item: any, index: number) => ({
              index: index + 1,
              product_name: item.product_name,
              total_amount: item.total_amount,
            })
          );

          setSummaryData(manufactureSummaryData);
        }

        setExportData(rowData);
        setTotal(total);
        setShowTable(true);
        setDateFromDisplay(dateFrom);
        setDateToDisplay(dateTo);

        messageApi.success("ดึงข้อมูลรายงานสำเร็จ");
      } else {
        messageApi.error("ไม่พบข้อมูล");
        setShowTable(false);
        setSummaryData([]);
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setShowTable(false);
      setSummaryData([]);
    } finally {
      setIsLoading(true);
    }
  };

  const columnsManufacture = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "",
      key: "",
      align: "center",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>วันที่</div>,
      dataIndex: "date_time",
      key: "date_time",
      align: "center",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>รหัสสินค้า</div>,
      dataIndex: "products",
      key: "ice_id",
      render: (products: any[]) => {
        return products?.map((product, index) => (
          <div key={product.ice_id || index}>{product.ice_id}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "products",
      key: "name",
      render: (products: any[]) => {
        return products?.map((product, index) => (
          <div key={product.ice_id || index}>{product.name}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวน (ถุง)</div>,
      dataIndex: "products",
      key: "amount",
      align: "center",
      render: (products: any[]) => {
        return products?.map((product, index) => (
          <div key={product.ice_id || index}>{product.manufacture_amount}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนรวม (ถุง)</div>,
      dataIndex: "manufacture_amount_total",
      key: "manufacture_amount_total",
      align: "center",
    },
  ];

  const columnsWithdraw = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "",
      key: "",
      align: "center",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>วันที่</div>,
      dataIndex: "date_time",
      key: "date_time",
      align: "center",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อสาย / เลขทะเบียนรถ</div>,
      key: "line_car",
      align: "center",
      render: (_: any, record: any) => (
        <div>
          <div>{record.line_name} / {record.car_number}</div>
        </div>
      ),
    },

    {
      title: <div style={{ textAlign: "center" }}>รหัสสินค้า</div>,
      dataIndex: "withdraw_details",
      key: "ice_id",
      render: (withdraw_details: any[]) => {
        return withdraw_details?.map((withdraw_details, index) => (
          <div key={withdraw_details.ice_id || index}>
            {withdraw_details.ice_id}
          </div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "items",
      key: "name",
      render: (items: any) => {
        return items?.map((item: any) => {
          const withdrawDetails = item.withdraw_details.map((item: any) => {
            return <div key={item.index}>{item.product.name}</div>;
          });
          return (
            <div key={item.index}>
              {item.car_number} {withdrawDetails}
            </div>
          );
        });
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวน (ถุง)</div>,
      dataIndex: "withdraw_details",
      key: "amount",
      align: "center",
      render: (item: any[]) => {
        return item?.map((item) => <div key={item.index}>{item.amount}</div>);
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนรวม (ถุง)</div>,
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (_: any, record: any) => {
        const totalAmount = record.withdraw_details?.reduce(
          (sum: number, detail: any) => sum + detail.amount,
          0
        );
        return <div>{totalAmount}</div>;
      },
    },
  ];

  const columnsMoney = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "indexs",
      key: "indexs",
      render: (item: any, index: number, idx: number) => idx + 1,
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>วันที่</div>,
      dataIndex: "date",
      key: "date",
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อสาย</div>,
      dataIndex: "line_name",
      key: "line_name",
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "ice_list",
      key: "name",
      width: 250,
      render: (items: any[]) =>
        items?.map((item, idx) => <div key={idx}>{item.name}</div>),
    },
    {
      title: <div style={{ textAlign: "center" }}>ราคาต่อถุง (บาท)</div>,
      dataIndex: "ice_list",
      key: "price",
      align: "right",
      width: 125,
      render: (items: any[]) =>
        items?.map((item, idx) => (
          <div key={idx}>{item.price.toLocaleString()}</div>
        )),
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนถุง (ถุง)</div>,
      dataIndex: "ice_list",
      key: "amount",
      align: "center",
      width: 125,
      render: (items: any[]) =>
        items?.map((item, idx) => <div key={idx}>{item.amount}</div>),
    },
    {
      title: <div style={{ textAlign: "center" }}>เงินรวม (บาท)</div>,
      dataIndex: "ice_list",
      key: "total",
      align: "right",
      render: (items: any[]) =>
        items?.map((item, idx) => (
          <div key={idx}>{item.total.toLocaleString()}</div>
        )),
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนเงินรวม (บาท)</div>,
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      width: 175,
      render: (item: any) => item?.toLocaleString(),
    },
  ];

  const columnsSummaryManufacture = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "index",
      key: "index",
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนรวม (ถุง)</div>,
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      render: (amount: number) => `${amount.toLocaleString()}`,
    },
  ];

  const columnsSummaryWithdraw = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "index",
      key: "index",
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "ice_name",
      key: "ice_name",
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนรวม (ถุง)</div>,
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      render: (amount: number) => `${amount.toLocaleString()}`,
    },
  ];

  const columnsStock = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      key: "index",
      align: "center",
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: <div style={{ textAlign: "center" }}>ทะเบียนรถ</div>,
      dataIndex: "car_number",
      key: "car_number",
      render: (car_number: string) => (
        <div>
          <strong>{car_number}</strong>
        </div>
      ),
    },
    {
      title: <div style={{ textAlign: "center" }}>รหัสสินค้า</div>,
      dataIndex: "stock_items",
      key: "ice_id",
      render: (stock_items: any[]) =>
        stock_items?.map((item, index) => (
          <div key={index} className="mb-1">
            {item.ice_id}
          </div>
        )),
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อสินค้า</div>,
      dataIndex: "stock_items",
      key: "product_name",
      render: (stock_items: any[]) =>
        stock_items?.map((item, index) => (
          <div key={index} className="mb-1">
            {item.product_name}
          </div>
        )),
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนในคลัง (ถุง)</div>,
      dataIndex: "stock_items",
      key: "amount",
      align: "center",
      render: (stock_items: any[]) =>
        stock_items?.map((item, index) => (
          <div key={index} className="mb-1">
            {item.amount}
          </div>
        )),
    },
    {
      title: <div style={{ textAlign: "center" }}>รวมทั้งหมด (ถุง)</div>,
      dataIndex: "total_stock",
      key: "total_stock",
      align: "center",
      render: (total_stock: number, _: any, idx: number) => (
        <div key={idx} className="font-bold">
          {total_stock}
        </div>
      ),
    },
  ];

  const columnsWithdrawByday = [
    {
      title: <div style={{ textAlign: "center" }}>ลำดับ</div>,
      dataIndex: "",
      key: "",
      align: "center",
      render: (item: any, record: any, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>วันที่</div>,
      dataIndex: "date_time",
      key: "date_time",
      align: "center",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>รหัสสินค้า</div>,
      dataIndex: "withdraw_details",
      key: "ice_id",
      render: (withdraw_details: any[]) => {
        return withdraw_details?.map((detail, index) => (
          <div key={detail.ice_id || index}>{detail.ice_id}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>ชื่อน้ำแข็ง</div>,
      dataIndex: "withdraw_details",
      key: "name",
      render: (withdraw_details: any[]) => {
        return withdraw_details?.map((detail, index) => (
          <div key={detail.ice_id || index}>{detail.product.name}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวน (ถุง)</div>,
      dataIndex: "withdraw_details",
      key: "amount",
      align: "center",
      render: (withdraw_details: any[]) => {
        return withdraw_details?.map((detail, index) => (
          <div key={detail.ice_id || index}>{detail.amount}</div>
        ));
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนรวม (ถุง)</div>,
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (_: any, record: any) => {
        const totalAmount = record.withdraw_details?.reduce(
          (sum: number, detail: any) => sum + detail.amount,
          0
        );
        return <div>{totalAmount}</div>;
      },
    },
  ];

  const columnsProduct = [
    {
      title: <div style={{ textAlign: "center" }}>รหัสสินค้า</div>,
      dataIndex: "ice_id",
      key: "ice_id",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: <div style={{ textAlign: "center" }}>ราคา (บาท)</div>,
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => `${price.toLocaleString()}`,
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนคงเหลือ (ถุง)</div>,
      dataIndex: "amount",
      key: "amount",
      align: "center",
    },
  ];

  const exportPDF = async () => {
    if (!exportType) {
      messageApi.error("กรุณาเลือกประเภทรายงานก่อนดู PDF");
      return;
    }

    try {
      setIsLoading(false);
      const response = await axios.get("/api/exportPdf", {
        params: {
          type: exportType,
          date_from: dateFrom,
          date_to: dateTo,
          line: selectLine,
        },
      });

      if (response.data.pdfPath) {
        const pdfPath = `/report.pdf`;
        // เปิดแท็บใหม่เพื่อดู PDF (ไม่ดาวน์โหลด)
        window.open(pdfPath, "_blank");
      }
    } catch (error) {
      console.error("Failed to export PDF", error);
      messageApi.error("เกิดข้อผิดพลาดในการดู PDF");
    } finally {
      setIsLoading(true);
    }
  };

  const getColumns = () => {
    switch (exportType) {
      case "manufacture":
        return columnsManufacture;
      case "withdraw":
        return columnsWithdraw;
      case "money":
        return columnsMoney;
      case "stock":
        return columnsStock;
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    const report = reportTypes.find((r) => r.value === exportType);
    return report?.label || "เลือกประเภทรายงาน";
  };

  const shouldShowLineSelector = () => {
    return exportType && ["withdraw", "money"].includes(exportType);
  };

  const shouldShowLineSelectorDay = () => {
    return (
      exportType && ["withdraw", "money", "manufacture"].includes(exportType)
    );
  };

  return (
    <Spin tip="Loading..." spinning={!isLoading}>
      <LayoutComponent>
        <div>
          {contextHolder}
          <div className="flex justify-start mt-10 items-center">
            <div>
              <Avatar src={"/logo.jpg"} alt="logo" size={150} />
            </div>
            <div className="text-sm text-start">
              ห้างหุ้นส่วนจำกัด โรงน้ำแข็งหลอดศรีนวล
              <br />
              310 หมู่ 4, ถนนทางหลวงชนบท, ตำบลเมืองเก่า อำเภอเมืองขอนแก่น
              <br />
              จังหวัดขอนแก่น 40000, Thailand โทร 043-222-300
            </div>
          </div>
          <Divider />

          <div className="flex justify-center text-2xl font-bold">
            <h1>{getReportTitle()}</h1>
          </div>

          {/* Report Type Selector */}
          <div className="flex justify-center mt-5">
            <div className="flex items-center">
              <span className="pr-2 text-md">ประเภทรายงาน:</span>
              <Select
                placeholder="เลือกประเภทรายงาน"
                onChange={(value) => setExportType(value)}
                style={{ width: 200 }}
                size="large"
                value={exportType || undefined}
              >
                {reportTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-center mt-[20px]">
            {/* Line Selector - only show for certain report types */}
            {shouldShowLineSelector() && transportationData.length > 0 && (
              <div className="flex justify-center items-center mr-5">
                <div className="pr-2 text-md">เลือกสาย:</div>
                <div>
                  <Select
                    title="Transportation"
                    onChange={(value) => setSelectLine(value)}
                    defaultValue={null}
                    style={{ width: 220 }}
                    size="large"
                    value={selectLine}
                  >
                    <Select.Option key="0" value={null}>
                      เลือกทั้งหมด
                    </Select.Option>
                    {transportationData.map((item: any, index: number) => {
                      return (
                        <Select.Option key={index} value={item.line_id}>
                          {item.line_name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            )}

            {/* Date Range Picker */}
            <div className="flex justify-center">
              {shouldShowLineSelectorDay() && (
                <>
                  <div className="pr-5">
                    <span className="pr-2">วันที่:</span>
                    <DatePicker
                      format={"YYYY-MM-DD"}
                      maxDate={dayjs()}
                      onChange={(value, dateString) => {
                        if (typeof dateString === "string") {
                          setDateFrom(
                            format(new Date(dateString), "yyyy-MM-dd")
                          );
                        }
                      }}
                      size="large"
                      placeholder="เริ่มต้น"
                    />
                  </div>
                  <div className="pr-5">
                    <span className="pr-2">ถึง:</span>
                    <DatePicker
                      format={"YYYY-MM-DD"}
                      maxDate={dayjs()}
                      onChange={(value, dateString) => {
                        if (typeof dateString === "string") {
                          setDateTo(format(new Date(dateString), "yyyy-MM-dd"));
                        }
                      }}
                      size="large"
                      placeholder="สิ้นสุด"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center items-center">
                <Button
                  size="large"
                  type="primary"
                  onClick={getExport}
                  disabled={!exportType}
                >
                  ดูรายงาน
                </Button>
                <Button
                  size="large"
                  type="primary"
                  style={{ backgroundColor: "red", marginLeft: "10px" }}
                  onClick={exportPDF}
                  disabled={!showTable}
                >
                  ดูไฟล์ PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Table Display */}
          {showTable && exportData.length > 0 && (
            <div className="mt-5 p-5 overflow-y-auto">
              {/* Summary Table for Manufacture Report */}
              {exportType === "manufacture" && summaryData.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      สรุปการผลิตสินค้าแยกตามประเภท
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={summaryData}
                      columns={columnsSummaryManufacture}
                      pagination={false}
                      size="small"
                      bordered
                    />
                  </div>
                  <Divider />
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      รายละเอียดการผลิตแต่ละวัน
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Summary Table for Withdraw Report */}
              {exportType === "withdraw" && summaryData.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      สรุปการเบิกสินค้าแยกตามประเภท
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={summaryData}
                      columns={columnsSummaryWithdraw}
                      pagination={false}
                      size="small"
                      bordered
                    />
                  </div>

                  <Divider />

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-center">
 รายงานแยกตามวันที่ (รวมทกสาย)
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={withdrawByDay}
                      columns={columnsWithdrawByday}
                      pagination={false}
                      size="small"
                      bordered
                    />
                  </div>

                  <Divider />

                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-center mb-3">
                       รายงานแยกตามสายการเดินรถ-วัน (รายละเอียด)
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {exportType === "stock" && productData.length > 0 && (
                <>
                  <Divider />
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      📈 สรุปรายการสินค้าในระบบ
                    </h3>
                    {dateFromDisplay && dateToDisplay && (
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {`จากวันที่ ${dayjs(dateFromDisplay).format(
                          "D MMM YYYY"
                        )} ถึง ${dayjs(dateToDisplay).format("D MMM YYYY")}`}
                      </p>
                    )}
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={productData}
                      columns={columnsProduct}
                      pagination={false}
                      size="small"
                      bordered
                      scroll={{ x: "max-content" }}
                      rowKey="ice_id"
                    />
                  </div>
                </>
              )}

              <Table
                className="custom-table"
                style={{ width: "100%" }}
                dataSource={exportData}
                columns={getColumns()}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </div>
          )}

          {/* Total Display - Only show for money and delivery reports */}
          {showTable &&
            (exportType === "stock" ||
              exportType === "withdraw" ||
              exportType === "manufacture") && (
              <div className="flex justify-end mt-5 p-5 gap-2">
                <div className="text-xl text-start">รวมทั้งหมด : </div>
                <div className="text-xl text-start font-bold ">
                  {total.toLocaleString()} {unit}
                </div>
              </div>
            )}

          {showTable && exportType === "money" && (
            <div className="flex justify-end mt-5 p-5 gap-2">
              <div className="text-xl text-start">รวมเป็นเงินทั้งสิ้น : </div>
              <div className="text-xl text-start font-bold ">
                {total.toLocaleString()} {unit}
              </div>
            </div>
          )}
        </div>
      </LayoutComponent>
    </Spin>
  );
};

export default ReportPage;
