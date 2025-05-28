// src/components/carManagement.tsx
"use client";
import LayoutComponent from "@/components/Layout";
import LongdoMap from "@/components/LongdoMap";
import { findAllCustomer } from "@/utils/customerService";
import {
  createOrderVip,
  findAllOrderVip,
  removeOrderVip,
  getNewCustomer,
  findOrderVipByCarId,
} from "@/utils/orderService";
import { findAllProductDrowdown } from "@/utils/productService";
import {
  findAllCarWithLine,
  findAllTransportationLine,
} from "@/utils/transpotationService";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  TableProps,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import useMessage from "antd/es/message/useMessage";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { UserContext } from "@/context/userContext";

const OrderVip = () => {
  const { userLogin } = useContext(UserContext);
  const roleKey = userLogin?.user?.role?.role_key;
  const user = userLogin?.user;

  console.log();
  
  const [carData, setCarData] = useState<any[]>([]);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = useMessage();
  const [customerData, setCustomerData] = useState<any>([]);
  const [transportationData, setTransportationData] = useState<any>([]);
  const [selectCustomer, setSelectCustomer] = useState([]);
  const [openModalCustomer, setOpenModalCustomer] = useState(false);
  const [trueAddress, setTrueAddress] = useState();
  const [productData, setProductData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedProductsAmount, setSelectedProductsAmount] = useState<{
    [key: number]: number;
  }>({});
  const [orderVip, setOrderVip] = useState<any>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customerMarkers, setCustomerMarkers] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const handlePaginationChange = (pagination: any) => {
    setCurrentIndex((pagination.current - 1) * pagination.pageSize);
  };

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      render: (text: any, record: any, index: any) => currentIndex + index + 1,
    },
    {
      title: "รหัสลูกค้า",
      dataIndex: "customer_id",
      key: "customer_id",
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "เบอร์โทรศัพท์",
      dataIndex: "telephone",
      key: "telephone",
    },
    {
      title: "ที่อยู่",
      dataIndex: "address",
      render: (address: string) => {
        if (!address) return null;

        const [manual, mapPart] = address.split("\n\n[ที่อยู่จากแผนที่]: ");
        const mapAddress = mapPart ? JSON.parse(mapPart) : null;

        return (
          <div>
            <div>{manual}</div>
            {mapAddress && (
              <div className="text-gray-500">
                {mapAddress.road}, {mapAddress.subdistrict}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "ชื่อสาย",
      dataIndex: "drop_off_points",
      key: "line_name",
      render: (drop_off_points: any[]) => {
        const lineName = drop_off_points?.[0]?.line?.line_name;
        return lineName || "-";
      },
    },
    {
      title: "ทะเบียนรถ",
      dataIndex: "drop_off_points",
      key: "car_number",
      render: (drop_off_points: any[]) => {
        const carNumber = drop_off_points?.[0]?.car?.car_number;
        return carNumber || "-";
      },
    },
    {
      title: "ประเภทการจัดส่ง",
      dataIndex: "type_cus",
      key: "type_cus",
      render: (type_cus: number) => (
        <span className={type_cus === 1 ? "text-blue-500" : "text-purple-500"}>
          {type_cus === 1 ? "พิเศษ" : "ประจำวัน"}
        </span>
      ),
    },
    {
      title: "",
      key: "button",
      render: (item: any) => {
        if (roleKey === "deliver") return null;

        return (
          <div className="flex justify-end">
            {/* <Button type="primary" className="mr-2" icon={<TeamOutlined />} onClick={() => handleOpenModalCustomer(item)}>สินค้าที่สั่ง</Button> */}
            <Popconfirm
              title="Delete the car"
              description="แน่ใจหรือไม่"
              onConfirm={() => deleteOrder(item.customer_id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="primary" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const productSelect = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "สินค้า",
      dataIndex: "product",
      key: "product_name",
      render: (item: any) => item.name,
    },

    {
      title: "จำนวน",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const fetchProduct = async () => {
    const res = await findAllProductDrowdown();
    if (res.status === 200) {
      setProductData(res.data);
    }
  };

  useEffect(() => {
    fetchCustomerId();
  }, [form]);

  const fetchCustomerId = async () => {
    try {
      const res = await getNewCustomer();
      form.setFieldsValue({ customer_id: res.data.newCustomerId });
    } catch (error) {
      messageApi.error("ไม่สามารถดึงรหัสลูกค้าได้");
    }
  };

  const onFinish = async (values: any) => {
    console.log(values);

    // const combinedAddress = `${values.manual_address}\n\n[ที่อยู่จากแผนที่]: ${values.map_address}`;
    const payload = {
      customer_id: values.customer_id,
      customer_name: values.customer_name,
      telephone: values.telephone,
      line_id: values.line_id,
      car_id: values.car_id,
      latitude: values.latitude,
      longitude: values.longitude,
      address: values.address,
      note: values.note,
    };

    console.log("Payload:", payload);

    const res = await createOrderVip(payload);

    if (res.status === 201) {
      messageApi.success("สร้างสําเร็จ!");
      form.resetFields();
      fetchCustomerId();
      setSelectedProducts([]);
      setSelectedProductsAmount({});
      getCustomer();
      fetchCarData();
      deliverLine();
      fetchLine();
      fetchProduct();
    } else {
      messageApi.error("สร้างไม่สําเร็จ!");
    }
  };

  const deleteOrder = async (customer_id: number) => {
    const res = await removeOrderVip(customer_id);
    if (res.status === 200) {
      messageApi.success("ลบสําเร็จ!");
      fetchLine();
    }
  };

  const getCustomer = async () => {
    const res = await findAllCustomer();
    if (res.success === true) {
      setCustomerData(res.data);
    }
  };

  const fetchCarData = async () => {
    const res = await findAllCarWithLine();

    if (res.success === true) {
      setCarData(res.data);
    }
  };

  const deliverLine = async () => {
    const res = await findAllTransportationLine();
    if (res) {
      setTransportationData(res.data);
    }
  };

  useEffect(() => {
    getCustomer();
    fetchCarData();
    deliverLine();
    fetchLine();
    fetchProduct();
  }, []);

  const fetchLine = async () => {
    const res = await findAllOrderVip();
    if (res.data) {
      const customers = res.data.data;

      setOrderVip(customers);

      const customerLocation = customers
        .filter((cus: any) => cus.latitude && cus.longitude) // เผื่อมีบางคนไม่มีพิกัด
        .map((cus: any) => ({
          latitude: parseFloat(cus.latitude),
          longitude: parseFloat(cus.longitude),
          name: cus.name,
          detail: cus.customer_id,
          address: cus.address,
        }));

      setCustomerMarkers(customerLocation);
    }
  };

  useEffect(() => {
    if (location && trueAddress) {
      const mapAddress = {
        road: trueAddress.road || "",
        subdistrict: trueAddress.subdistrict || "",
        district: trueAddress.district || "",
        province: trueAddress.province || "",
        postcode: trueAddress.postcode || "",
      };

      const currentAddress = form.getFieldValue("address") || "";
      const cleanCurrentAddress = currentAddress.split(
        "\n\n[ที่อยู่จากแผนที่]:"
      )[0]; // ลบของเก่าถ้ามี

      const addressWithMap = `${cleanCurrentAddress}\n\n[ที่อยู่จากแผนที่]: ${JSON.stringify(
        mapAddress
      )}`;

      form.setFieldsValue({
        latitude: location.lat,
        longitude: location.lon,
        address: addressWithMap,
      });
    }
  }, [location, trueAddress]);

  const rowSelection: TableProps<any>["rowSelection"] = {
    selectedRowKeys: selectedProducts,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      const customerArray = [];
      for (const row of selectedRows) {
        customerArray.push(row.id);
      }
      setSelectedProducts([...customerArray]);
    },
    // getCheckboxProps: (record: any) => ({
    //     name: record.name,
    // }),
  };

  return (
    <LayoutComponent>
      {contextHolder}
      <Card className="w-full h-fit" title={[<h1>สั่งสินค้าพิเศษ</h1>]}>
        <div>
          <Row>
            <Col span={16}>
              <Row className="mt-5">
                <Col span={24} className="pr-2">
                  <LongdoMap
                    setMarker={setLocation}
                    setTrueAddress={setTrueAddress}
                    isOpenButton={true}
                    isOpenButtonMap={true}
                    customerLocation={customerMarkers}
                  />
                </Col>

                <Col span={24} className="mt-5 pr-2">
                  <Card title="ข้อมูลคำสั่งซื้อ" className="w-full">
                    <div className="w-full h-[420px] overflow-y-scroll">
                      <Table
                        columns={columns}
                        onChange={handlePaginationChange}
                        pagination={false}
                        dataSource={orderVip}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Card title="เพิ่มคำสั่งซื้อ" className="w-full">
                  <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                      key={"customer_id"}
                      name={"customer_id"}
                      className="w-full"
                      label="รหัสลูกค้า"
                    >
                      <Input type="text" disabled />
                    </Form.Item>

                    <Form.Item
                      key={"customer_name"}
                      name={"customer_name"}
                      className="w-full"
                      label="ชื่อลูกค้า"
                      rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      key={"telephone"}
                      name={"telephone"}
                      className="w-full"
                      label="เบอร์โทร"
                      rules={[
                        { required: true, message: "กรุณากรอกเบอร์" },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "กรอกเบอร์โทรศัพท์ให้ถูกต้อง",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="line_id" // ต้องมี name property ตรงกับ payload
                      noStyle
                      hidden
                      initialValue={null} // กำหนดค่าเริ่มต้น
                    >
                      <Input type="hidden" />
                    </Form.Item>
                    <Form.Item
                      name={"car_id"}
                      className="w-full"
                      label="เลขทะเบียนรถที่จัดส่ง"
                      rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
                    >
                      <Select
                        onChange={async (carId) => {
                          setSelectedCarId(carId);
                          const selectedCar = carData.find(
                            (car: any) => car.car_id === carId
                          );
                          if (selectedCar) {
                            form.setFieldsValue({
                              line_id: selectedCar.Lines?.[0]?.line_id || null,
                            });
                          }

                          const res = await findOrderVipByCarId(carId);

                          if (res.data && Array.isArray(res.data.data)) {
                            const customers = res.data.data;
                            setOrderVip(customers);

                            const customerLocation = customers
                              .filter(
                                (cus: any) => cus.latitude && cus.longitude
                              )
                              .map((cus: any) => ({
                                latitude: parseFloat(cus.latitude),
                                longitude: parseFloat(cus.longitude),
                                name: cus.name,
                                detail: cus.customer_id,
                                address: cus.address,
                              }));

                            setCustomerMarkers(customerLocation);
                          }
                        }}
                      >
                        {carData.map((item: any) => (
                          <Select.Option key={item.car_id} value={item.car_id}>
                            {item.car_number} - {item.users?.firstname} -{" "}
                            {item.users?.lastname}
                            {item.line_name ? ` (สาย ${item.line_name})` : ""}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      key={"lat"}
                      name={"latitude"}
                      className="w-full"
                      label="ละติจูด"
                      rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]}
                      initialValue={location?.lat}
                    >
                      <Input value={location?.lat} disabled />
                    </Form.Item>
                    <Form.Item
                      key={"lon"}
                      name={"longitude"}
                      className="w-full"
                      label="ลองจิจูด"
                      rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]}
                      initialValue={location?.lon}
                    >
                      <Input value={location?.lon} disabled />
                    </Form.Item>
                    <Form.Item
                      name={"address"}
                      className="w-full"
                      label="ที่อยู่"
                      rules={[{ required: true, message: "กรอกที่อยู่" }]}
                    >
                      <TextArea rows={5} placeholder="กรอกที่อยู่" />
                    </Form.Item>
                    <Row>
                      <Col span={24}>
                        <Form.Item name="note" label="หมายเหตุ">
                          <TextArea rows={2} placeholder="หมายเหตุ" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item className="w-full">
                      <Button
                        type="primary"
                        className="w-full"
                        htmlType="submit"
                      >
                        บันทึก
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Row>
            </Col>
          </Row>

          <Modal
            width={1000}
            open={openModalCustomer}
            onCancel={() => setOpenModalCustomer(false)}
            footer={[]}
          >
            <Card title="รายการสินค้า">
              <Table
                columns={productSelect}
                className="h-fit"
                dataSource={selectCustomer}
              />
            </Card>
          </Modal>
        </div>
      </Card>
    </LayoutComponent>
  );
};

export default OrderVip;
