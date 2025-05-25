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

  // Report type options
  const reportTypes = [
    { value: "manufacture", label: "รายงานการผลิต", unit: "รายการ" },
    { value: "withdraw", label: "รายงานการเบิก", unit: "รายการ" },
    { value: "money", label: "รายงานการเงิน", unit: "บาท" },
    { value: "delivery", label: "รายงานการจัดสายรถ", unit: "รายการ" },
  ];

  useEffect(() => {
    deliverLine();
  }, []);

  useEffect(() => {
    if (exportType) {
      const selectedReport = reportTypes.find(
        (report) => report.value === exportType
      );
      setUnit(selectedReport?.unit || "");
      setShowTable(false); // Hide table when type changes
      setExportData([]); // Clear previous data
      setSummaryData([]); // Clear summary data
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

    if (!dateFrom || !dateTo) {
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

      if (response.length > 0) {
        let rowData: any[] = [];
        let total: number = 0;

        if (exportType === "withdraw") {
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
              (sum: number, detail: any) => sum + detail.amount || 0,
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
          console.log("summaryRowData", summaryRowData);
        } else if (exportType === "delivery") {
          const groupedData = response.reduce((acc: any, item: any) => {
            const lineName = item?.line?.line_name || item?.car?.car_number;
            const customerName = item?.customer?.name;

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

          rowData = Object.values(groupedData).map(
            (group: any, index: number) => ({
              index: index + 1,
              line_name: group.line_name,
              customers: Array.from(group.customers as Set<string>).map(
                (name: string, index: number) => ({
                  index: index + 1,
                  customer_name: name,
                })
              ),
            })
          );

          total = rowData.reduce(
            (sum: number, group: any) => sum + group.customers.length,
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
      title: "ลำดับ",
      dataIndex: "",
      key: "",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: "วันที่",
      dataIndex: "date_time",
      key: "date_time",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: "ชื่อน้ำแข็ง / ถุง",
      dataIndex: "products",
      key: "name",
      render: (products: any[]) => {
        return products?.map((product: any, index: number) => (
          <div key={product.ice_id || index}>
            {product.name} x {product.manufacture_amount}
          </div>
        ));
      },
    },
    {
      title: "จำนวนรวม",
      dataIndex: "manufacture_amount_total",
      key: "manufacture_amount_total",
    },
  ];

  const columnsWithdraw = [
    {
      title: "ลำดับ",
      dataIndex: "",
      key: "",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: "วันที่",
      dataIndex: "date_time",
      key: "date_time",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: "ชื่อสาย",
      dataIndex: "line_name",
      key: "line_name",
      render: (item: any) => {
        return item;
      },
    },
    {
      title: "เลขทะเบียนรถ",
      dataIndex: "car_number",
      key: "car_number",
    },
    {
      title: "ชื่อน้ำแข็ง / ถุง",
      dataIndex: "items",
      key: "name",
      render: (items: any) => {
        return items?.map((item: any) => {
          const withdrawDetails = item.withdraw_details.map((item: any) => {
            return (
              <div key={item.index}>
                {item.product.name} x {item.amount}
              </div>
            );
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
      title: "จำนวนรวม",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: any) => {
        const totalAmount = record.withdraw_details?.reduce(
          (sum: number, detail: any) => sum + detail.amount,
          0
        );
        return <div>{totalAmount} ถุง</div>;
      },
    },
  ];

  const columnsMoney = [
    {
      title: "ลำดับ",
      dataIndex: "indexs",
      key: "indexs",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "ชื่อสาย",
      dataIndex: "line_name",
      key: "line_name",
    },
    {
      title: "รายละเอียด",
      dataIndex: "ice_list",
      key: "ice_list",
      render: (items: any[]) => {
        return items?.map((item: any) => (
          <div key={item.index}>
            {item.name} ({item.price} บาท/ถุง) x {item.amount} = {item.total}{" "}
            บาท
          </div>
        ));
      },
    },
    {
      title: "จำนวนเงินรวม",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (item: any) => {
        return `${item} บาท`;
      },
    },
  ];

  const columnsSummaryManufacture = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "ชื่อน้ำแข็ง",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "จำนวนรวม (ถุง)",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number) => `${amount.toLocaleString()} ถุง`,
    },
  ];

  const columnsSummaryWithdraw = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "ชื่อน้ำแข็ง",
      dataIndex: "ice_name",
      key: "ice_name",
    },
    {
      title: "จำนวนรวม (ถุง)",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number) => `${amount.toLocaleString()} ถุง`,
    },
  ];

  const columnsDelivery = [
    {
      title: "ลำดับ",
      dataIndex: "",
      key: "",
      render: (item: any, index: number, idx: number) => {
        return idx + 1;
      },
    },
    {
      title: "ชื่อสายรถ",
      dataIndex: "line_name",
      key: "line_name",
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "customers",
      key: "customers",
      render: (item: any) => {
        return item?.map((item: any, indexs: number) => {
          return (
            <div key={indexs}>
              {indexs + 1}. {item.customer_name}
            </div>
          );
        });
      },
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
      case "delivery":
        return columnsDelivery;
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    const report = reportTypes.find((r) => r.value === exportType);
    return report?.label || "เลือกประเภทรายงาน";
  };

  const shouldShowLineSelector = () => {
    return exportType && ["delivery", "withdraw", "money"].includes(exportType);
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
              <div className="pr-5">
                <span className="pr-2">วันที่:</span>
                <DatePicker
                  format={"YYYY-MM-DD"}
                  maxDate={dayjs()}
                  onChange={(value, dateString) => {
                    if (typeof dateString === "string") {
                      setDateFrom(format(new Date(dateString), "yyyy-MM-dd"));
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
                      สรุปการผลิตน้ำแข็งแยกตามประเภท
                    </h3>
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={summaryData}
                      columns={columnsSummaryManufacture}
                      pagination={false}
                      size="small"
                      bordered
                    />
                    <div className="flex justify-end mt-3">
                      <div className="text-md font-semibold">
                        รวมจำนวนถุงทั้งหมด: {total.toLocaleString()} ถุง
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-center">
                      รายละเอียดการผลิตแต่ละวัน
                    </h3>
                  </div>
                </>
              )}

              {/* Summary Table for Withdraw Report */}
              {exportType === "withdraw" && summaryData.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      สรุปการเบิกน้ำแข็งแยกตามประเภท
                    </h3>
                    <Table
                      className="custom-table"
                      style={{ width: "100%" }}
                      dataSource={summaryData}
                      columns={columnsSummaryWithdraw}
                      pagination={false}
                      size="small"
                      bordered
                    />
                    <div className="flex justify-end mt-3">
                      <div className="text-md font-semibold">
                        รวมจำนวนถุงทั้งหมด: {totalAmount.toLocaleString()} ถุง
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-center">
                      รายละเอียดการเบิกแต่ละวัน
                    </h3>
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
            (exportType === "money" ||
              exportType === "delivery" ||
              exportType === "withdraw" ||
              exportType === "manufacture") && (
              <div className="flex justify-end mt-5 p-5">
                <div className="text-sm text-start">รวมทั้งหมด: </div>
                <div className="text-sm text-start font-bold">
                  {total.toLocaleString()} {unit}
                </div>
              </div>
            )}

          {/* Back Button */}
          {/* <div className="flex justify-center mt-5 p-5">
            <Button
              size="large"
              type="primary"
              style={{ backgroundColor: "lightblue" }}
              onClick={() => router.back()}
            >
              ย้อนกลับ
            </Button>
          </div> */}
        </div>
      </LayoutComponent>
    </Spin>
  );
};

export default ReportPage;
