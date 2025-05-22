"use client";
import LayoutComponent from "@/components/Layout";
import { UserContext } from "@/context/userContext";
import {
  createManufacture,
  deleteManufacture,
  findAllManufacture,
  updateManufacture,
} from "@/utils/manufactureService";
import {
  createOrder,
  findAllOrder,
  findAllOrderWithDay,
} from "@/utils/orderService";
import { findAllProductDrowdown } from "@/utils/productService";
import {
  findAllCar,
  findAllTransportationLine,
} from "@/utils/transpotationService";
import { StockInCar } from "@/utils/productService";
import {
  RestOutlined,
  ToolOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Table,
  TableProps,
  Modal,
} from "antd";
import { format } from "date-fns";
import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { title } from "process";

const Order = () => {
  const [productData, setProductData] = useState([]);
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const { userLogin } = useContext(UserContext);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [carData, setCarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedProductsAmount, setSelectedProductsAmount] = useState<{
    [key: number]: number;
  }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [stockInCar, setStockInCar] = useState<number | null>(null);
  const [stockInCarModalVisible, setStockInCarModalVisible] = useState(false);
  const [stockInCarData, setStockInCarData] = useState<any[]>([]);
  const [lineOptions, setLineOptions] = useState<any[]>([]);
  const [filteredLineOptions, setFilteredLineOptions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handlePaginationChange = (pagination: any) => {
    setCurrentIndex((pagination.current - 1) * pagination.pageSize);
  };
  const handlePaginationChange2 = (pagination: any) => {
    setCurrentIndex2((pagination.current - 1) * pagination.pageSize);
  };

  useEffect(() => {
    fetchProduct();
    fetchWithdrawData();
    fetchCarData();
    fetchLine();
  }, []);

  const fetchProduct = async () => {
    const res = await findAllProductDrowdown();
    if (res.status === 200) {
      setProductData(res.data);
    }
  };

  const fetchWithdrawData = async (date: any = new Date()) => {
    const res = await findAllOrderWithDay(format(date, "yyyy-MM-dd"));
    if (res.status === 200) {
      setData(res.data.data);
    }
  };

  const fetchLine = async () => {
    const res = await findAllTransportationLine();
    if (res) {
      setLineData(res);
      setLineOptions(
        res.map((line: any) => ({
          value: line.id,
          label: line.line_name,
          car_id: line.car_id,
        }))
      );
    }
  };

  const fetchStockInCar = async (carId: number) => {
    try {
      const res = await StockInCar(carId);
      if (res && Array.isArray(res)) {
        // ตรวจสอบว่า res เป็น array
        setStockInCarData(res);
        // คำนวณจำนวนน้ำแข็งทั้งหมด
        const totalIce = res.reduce(
          (sum, item) => sum + (item.stock_amount || 0),
          0
        );
        setStockInCar(totalIce);
      } else {
        setStockInCarData([]);
        setStockInCar(null);
        messageApi.warning("ไม่พบข้อมูลน้ำแข็งในรถคันนี้");
      }
    } catch (err) {
      console.error("Error fetching stock in car:", err);
      setStockInCarData([]);
      setStockInCar(null);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลน้ำแข็งในรถ");
    }
  };

  const stockInCarColumns = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "stock_amount",
      key: "stock_amount",
    },
    {
      title: "ราคา (บาท)",
      dataIndex: "product_price",
      key: "product_price",
    },
  ];

  const create = async (values: any) => {
    try {
      if (selectedProducts.length === 0) {
        messageApi.error("กรุณาเลือกรายการสินค้า");
        return;
      }

      if (
        Object.keys(selectedProductsAmount).length < selectedProducts.length
      ) {
        messageApi.error("กรุณากรอกจํานวนสินค้า");
        return;
      }

      const totalSelectedAmount = Object.values(selectedProductsAmount).reduce(
        (sum, amount) => sum + amount,
        0
      );
      if (totalSelectedAmount > 40) {
        messageApi.error("ไม่สามารถเลือกสินค้ารวมเกิน 40 รายการได้");
        return;
      }

      if (selectedDate && selectedDate.isBefore(dayjs(), "day")) {
        messageApi.error("ไม่สามารถเลือกวันที่ย้อนหลังได้");
        return;
      }

      const res = await createOrder({
        user_id: userLogin?.user?.id,
        product_id: selectedProducts,
        amount: selectedProductsAmount,
        car_id: values.car_id,
        line_id: values.line_id,
      });

      if (res.data.success === true) {
        await Promise.all([
          fetchWithdrawData(),
          fetchProduct(),
          fetchStockInCar(values.car_id),
        ]);

        setSelectedProducts([]);
        setSelectedProductsAmount({});
        form.resetFields();
        messageApi.success("เบิกสินค้าสําเร็จ");
      } else if (res.status === 201 && res.data.success === false) {
        messageApi.warning("จำนวนสินค้ามีไม่พอ!");
      } else {
        messageApi.error("เบิกสินค้าไม่สําเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเบิกสินค้า");
    }
  };

  const fetchCarData = async () => {
    const res = await findAllCar();
    if (res.success === true) {
      setCarData(res.data);
    }
  };

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      render: (text: any, record: any, index: any) => currentIndex2 + index + 1,
    },
    {
      title: "สายการเดินรถ",
      dataIndex: "transportation_car",
      key: "line_name",
      render: (car: any) => car?.Lines?.[0]?.line_name || "-",
    },
    {
      title: "ทะเบียนรถ / คนขับ",
      dataIndex: "transportation_car",
      key: "car_info",
      render: (car: any) => {
        const carNumber = car?.car_number || "-";
        const firstName = car?.users?.firstname || "";
        const lastName = car?.users?.lastname || "";
        const driverName =
          firstName || lastName ? `${firstName} ${lastName}` : "-";
        return `${carNumber} / ${driverName}`;
      },
    },
    {
      title: "วันที่เบิก",
      dataIndex: "date_time",
      key: "date_time",
      render: (item: any) => format(item, "yyyy-MM-dd"),
    },
    {
      title: "รายละเอียดการเบิก",
      dataIndex: "withdraw_details",
      key: "withdraw_details",
      render: (item: any) => {
        return (
          <p>
            {item?.map((item: any) => (
              <p>
                สินค้า {item?.product?.name} : จำนวน {item?.amount}
              </p>
            ))}
          </p>
        );
      },
    },
  ];

  const ProductColumns = [
    // {
    //     title: "ลำดับ",
    //     dataIndex: "id",
    //     key: "id",
    //     render: (text: any, record: any, index: any) => currentIndex + index + 1
    // },
    {
      title: "รหัสสินค้า",
      dataIndex: "ice_id",
      key: "ice_id",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "product_name",
    },

    {
      title: "ราคา (บาท)",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "จำนวน",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const ProductSelectColumns = [
    // {
    //     title: 'เลือก',
    //     dataIndex: 'id',
    //     key: 'id',
    //     width: "5%",
    //     render: (item: any) => {
    //         return (
    //             <Checkbox
    //                 key={item}
    //                 checked={selectedProducts.includes(item)}
    //                 onChange={(e) => {
    //                     if (e.target.checked) {
    //                         setSelectedProducts([...selectedProducts, item]);
    //                     } else {
    //                         setSelectedProducts(
    //                             selectedProducts.filter((id) => id !== item)
    //                         );
    //                         setSelectedProductsAmount((prevAmounts) => {
    //                             const newAmounts = { ...prevAmounts };
    //                             delete newAmounts[item];
    //                             return newAmounts;
    //                         });
    //                     }
    //                 }}
    //             />
    //         );
    //     }
    // },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "product_name",
    },
    {
      title: "จำนวน",
      dataIndex: "",
      key: "action",
      width: 160,
      render: (item: any) => {
        const isSelected = selectedProducts.includes(item.ice_id);
        return (
          <div className="flex justify-center">
            <Button
              disabled={!isSelected}
              onClick={() => {
                setSelectedProductsAmount((prevAmounts) => ({
                  ...prevAmounts,
                  [item.ice_id]: Math.max(
                    (prevAmounts[item.ice_id] || 0) - 1,
                    0
                  ),
                }));
              }}
            >
              -
            </Button>
            <Input
              className="text-center"
              value={selectedProductsAmount[item.ice_id] || 0}
              onChange={(e) => {
                const newAmount = parseInt(e.target.value) || 0;
                setSelectedProductsAmount((prevAmounts) => ({
                  ...prevAmounts,
                  [item.ice_id]: Math.min(newAmount, item.amount),
                }));
              }}
              disabled={!isSelected}
            />
            <Button
              disabled={!isSelected}
              onClick={() => {
                setSelectedProductsAmount((prevAmounts) => {
                  const newAmount = (prevAmounts[item.ice_id] || 0) + 1;
                  return {
                    ...prevAmounts,
                    [item.ice_id]: Math.min(newAmount, item.amount),
                  };
                });
              }}
            >
              +
            </Button>
          </div>
        );
      },
    },
  ];

  const rowSelection: TableProps<any>["rowSelection"] = {
    selectedRowKeys: selectedProducts,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      const customerArray = [];
      for (const row of selectedRows) {
        customerArray.push(row.ice_id);
      }
      setSelectedProducts([...customerArray]);
    },
    // getCheckboxProps: (record: any) => ({
    //     name: record.name,
    // }),
  };

  const handleCarChange = (carId: number) => {
    // กรองสายรถที่เกี่ยวข้องกับรถคันนี้
    const filteredLines = lineOptions.filter((line) => line.car_id === carId);
    setFilteredLineOptions(filteredLines);

    // ถ้ามีสายรถที่เกี่ยวข้อง ให้เลือกสายรถนั้นโดยอัตโนมัติ
    if (filteredLines.length > 0) {
      form.setFieldsValue({ line_id: filteredLines[0].value });
    } else {
      form.setFieldsValue({ line_id: undefined });
    }

    // ดึงข้อมูลน้ำแข็งในรถ
    fetchStockInCar(carId);
  };

  return (
    <LayoutComponent>
      {contextHolder}
      <div className="w-full">
        <Row className="mt-5">
          <Col span={16}>
            <Row>
              <Card className="w-full" title="สินค้าในคลัง">
                <div className="w-full h-[300px] overflow-y-scroll">
                  <Table
                    columns={ProductColumns}
                    dataSource={productData}
                    onChange={handlePaginationChange}
                    pagination={false}
                  />
                </div>
              </Card>
            </Row>

            <Row className="mt-5">
              <Card className="w-full pt-5" title="การเบิกสินค้า">
                <div className="mb-2 float-end">
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    size="large"
                    defaultValue={selectedDate}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                    onChange={(date) => {
                      setSelectedDate(date);
                      fetchWithdrawData(date);
                    }}
                  />
                </div>
                <div className="w-full h-[300px] overflow-y-scroll">
                  <Table
                    columns={columns}
                    dataSource={data}
                    onChange={handlePaginationChange2}
                    pagination={false}
                  />
                </div>
              </Card>
            </Row>
          </Col>

          <Col span={8} className="pl-2">
            <Card className="w-full" title="เบิกสินค้า">
              <Form layout="vertical" onFinish={create} form={form}>
                <Form.Item
                  name={"line_id"}
                  key={"line_id"}
                  className="w-full"
                  label="สายการเดินรถ"
                  rules={[{ required: true, message: "กรุณาเลือกสาย" }]}
                >
                  <Select
                    className="w-full"
                    onChange={(lineId) => {
                      // หารถที่ใช้สายนี้
                      const selectedLine = lineData.find(
                        (line: any) => line.line_id === lineId
                      );
                      if (selectedLine) {
                        form.setFieldsValue({ car_id: selectedLine.car_id });
                        fetchStockInCar(selectedLine.car_id);
                      }
                    }}
                    options={lineData.map((line: any) => ({
                      value: line.line_id,
                      label: line.line_name,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name={"car_id"}
                  className="w-full"
                  label="เลขทะเบียนรถ"
                  rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
                >
                  <Select
                    className="w-full"
                    onChange={(carId) => {
                      const relatedLines = lineData.filter(
                        (line: any) => line.car_id === carId
                      );
                      if (relatedLines.length > 0) {
                        form.setFieldsValue({
                          line_id: relatedLines[0].line_id,
                        });
                      }
                      fetchStockInCar(carId);
                    }}
                    options={carData.map((car: any) => ({
                      value: car.car_id,
                      label: `${car.car_number} - ${car.users.firstname} ${
                        car.users.lastname || ""
                      }`,
                    }))}
                  />
                </Form.Item>
                {stockInCar !== null && stockInCarData.length > 0 && (
                  <div className="text-right text-sm text-blue-500 mb-2 flex justify-between items-center">
                    <span>❄️ คงเหลือน้ำแข็งในรถ: {stockInCar} ถุง</span>
                    <Button
                      type="link"
                      icon={<InfoCircleOutlined />}
                      onClick={() => setStockInCarModalVisible(true)}
                      size="small"
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                )}
                <Table
                  rowKey={(ice_id: any) => ice_id.ice_id}
                  rowSelection={{ ...rowSelection }}
                  columns={ProductSelectColumns}
                  dataSource={productData}
                  pagination={{ pageSize: 5 }}
                />

                <Button type="primary" className=" w-full" htmlType="submit">
                  บันทึก
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title="รายละเอียดน้ำแข็งในรถ"
        visible={stockInCarModalVisible}
        onCancel={() => setStockInCarModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStockInCarModalVisible(false)}>
            ปิด
          </Button>,
        ]}
      >
        <Table
          columns={stockInCarColumns}
          dataSource={stockInCarData}
          rowKey="id"
          pagination={false}
        />
        <div className="mt-4 text-right font-semibold">
          รวมทั้งหมด: {stockInCar} ถุง
        </div>
      </Modal>
    </LayoutComponent>
  );
};

export default Order;
