// src/components/carManagement.tsx
'use client';
import LayoutComponent from "@/components/Layout";
import LongdoMap from "@/components/LongdoMap";
import { findAllCustomer } from "@/utils/customerService";
import { createOrderVip, findAllOrderVip, removeOrderVip } from "@/utils/orderService";
import { findAllProductDrowdown } from "@/utils/productService";
import { createCar, createTransportationLine, deleteCar, deleteTransportationLine, deleteTransportationLineWithIds, findAllCar, findAllTransportationLine, updateCar } from "@/utils/transpotationService";
import { findAllUser, findAllUserDeliver } from "@/utils/userService";
import { DeleteOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Form, Input, Modal, Popconfirm, Row, Select, Table, TableProps } from "antd";
import TextArea from "antd/es/input/TextArea";
import useMessage from "antd/es/message/useMessage";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { render } from "react-dom";

const OrderVip = () => {
    const [carData, setCarData] = useState<any[]>([]);

    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [messageApi, contextHolder] = useMessage();

    const [selectedCar, setSelectedCar] = useState<number | null>();
    const [customerData, setCustomerData] = useState<any>([]);
    const [transportationData, setTransportationData] = useState<any>([]);
    const [selectCustomer, setSelectCustomer] = useState([]);
    const [openModalCustomer, setOpenModalCustomer] = useState(false);
    const [rowSelectList, setRowSelectList] = useState<any[]>([]);
    const [trueAddress, setTrueAddress] = useState();
    const [productData, setProductData] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [selectedProductsAmount, setSelectedProductsAmount] = useState<{ [key: number]: number }>({});
    const [orderVip, setOrderVip] = useState<any>([])
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const handlePaginationChange = (pagination: any) => {
        setCurrentIndex((pagination.current - 1) * pagination.pageSize);
    };
    const handlePaginationChange2 = (pagination: any) => {
        setCurrentIndex2((pagination.current - 1) * pagination.pageSize);
    };
    const columns = [
        {
            title: "ลำดับ",
            dataIndex: "id",
            key: "id",
            render: (text: any, record: any, index: any) => currentIndex + index + 1
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
            title: 'ที่อยู่',
            dataIndex: 'address',
            key: 'address',
            render: (address: any) => {
                if (address === null) return null
                const parsedAddress = JSON.parse(address);
                return (
                    <div>
                        {parsedAddress.road ? parsedAddress.road : ''} {parsedAddress.subdistrict} {parsedAddress.district} {parsedAddress.province} {parsedAddress.country} {parsedAddress.postcode}
                    </div>
                )
            }
        },
        {
            title: "",
            key: "button",
            render: (item: any) => (
                <div className="flex justify-end">
                    <Button type="primary" className="mr-2" icon={<TeamOutlined />} onClick={() => handleOpenModalCustomer(item)}>สินค้าที่สั่ง</Button>
                    <Popconfirm
                        title="Delete the car"
                        description="แน่ใจหรือไม่"
                        onConfirm={() => deleteOrder(item.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },

    ];

    const customerColumns = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => index + 1
        },
        {
            title: 'ชื่อ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'เบอร์โทรศัพท์',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'ที่อยู่',
            dataIndex: 'address',
            key: 'address',
            render: (address: any) => {
                const parsedAddress = JSON.parse(address);
                return (
                    <div>
                        {parsedAddress.road ? parsedAddress.road : ''} {parsedAddress.subdistrict} {parsedAddress.district} {parsedAddress.province} {parsedAddress.country} {parsedAddress.postcode}
                    </div>
                )
            }
        },


    ];

    const productInStoreColumns = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => currentIndex2 + index + 1
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: "จำนวน",
            dataIndex: "amount",
            key: "amount",
            render: (text: any, record: any) => record.amount
        },
    ];

    const ProductSelectColumns = [
        {
            title: 'เลือก',
            dataIndex: 'id',
            key: 'id',
            width: "5%",
            render: (item: any) => {
                return (
                    <Checkbox
                        key={item}
                        checked={selectedProducts.includes(item)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, item]);
                            } else {
                                setSelectedProducts(
                                    selectedProducts.filter((id) => id !== item)
                                );
                                setSelectedProductsAmount((prevAmounts) => {
                                    const newAmounts = { ...prevAmounts };
                                    delete newAmounts[item];
                                    return newAmounts;
                                });
                            }
                        }}
                    />
                );
            }
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'product_name',
        },
        {
            title: "จำนวน",
            dataIndex: "",
            key: "action",
            width: 160,
            render: (item: any) => {
                const isSelected = selectedProducts.includes(item.id);
                return (
                    <div className='flex justify-center'>
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.id]: Math.max((prevAmounts[item.id] || 0) - 1, 0),
                                }));
                            }}
                        >
                            -
                        </Button>
                        <Input
                            className='text-center'
                            value={selectedProductsAmount[item.id] || 0}
                            onChange={(e) => {
                                const newAmount = parseInt(e.target.value) || 0;
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.id]: newAmount,
                                }));
                            }}
                            disabled={!isSelected}
                        />
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.id]: (prevAmounts[item.id] || 0) + 1,
                                }));
                            }}
                        >
                            +
                        </Button>
                    </div>
                );
            }
        }
    ]

    const productSelect = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'สินค้า',
            dataIndex: 'product',
            key: 'product_name',
            render: (item: any) => item.name
        },

        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',

        },
    ];

    const fetchProduct = async () => {
        const res = await findAllProductDrowdown()
        if (res.status === 200) {
            setProductData(res.data);
        }
    }

    const onFinish = async (values: any) => {
        if (selectedProducts.length === 0) {
            messageApi.error("กรุณาเลือกสินค้า");
            return;
        }
        if (Object.keys(selectedProductsAmount).length < selectedProducts.length) {
            messageApi.error("กรุณากรอกจํานวนสินค้า");
            return;
        }
        const res = await createOrderVip({
            ...values,
            product_id: selectedProducts,
            amount: selectedProductsAmount,
        })

        if (res.status === 201) {
            messageApi.success("สร้างสําเร็จ!");
            form.resetFields();
            setSelectedProducts([])
            setSelectedProductsAmount({})
            getCustomer()
            fetchCarData();
            deliverLine()
            fetchLine()
            fetchProduct()
        }
    };



    const deleteOrder = async (id: number) => {
        const res = await removeOrderVip(id);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            fetchLine()

        }
    };
    const getCustomer = async () => {
        const res = await findAllCustomer();
        if (res.success === true) {
            setCustomerData(res.data);
        }
    };
    const fetchCarData = async () => {
        const res = await findAllCar();
        if (res.success === true) {
            setCarData(res.data);
        }
    };

    const deliverLine = async () => {
        const res = await findAllTransportationLine()
        if (res) {
            setTransportationData(res)
        }
    }

    const handleOpenModalCustomer = (value: any) => {
        setOpenModalCustomer(true)
        setSelectCustomer(value.order_customer_details)
    }

    useEffect(() => {
        getCustomer()
        fetchCarData();
        deliverLine()
        fetchLine()
        fetchProduct()
    }, []);

    const fetchLine = async () => {
        const res = await findAllOrderVip()
        if (res.data) {
            setOrderVip(res.data.data)
        }
    }

    useEffect(() => {
        if (location) {
            form.setFieldsValue({ latitude: location.lat, longitude: location.lon, address: JSON.stringify(trueAddress) });
        }
    }, [location, trueAddress])

    return (
        <LayoutComponent>
            {contextHolder}
            <Card className='w-full h-fit' title={[<h1>สั่งสินค้าพิเศษ</h1>]}>
                <div>
                    <Row>


                        <Col span={16}>
                            <Row>
                                <Col span={24} className="pr-2" >
                                    <Card className='w-full' title="สินค้าในคลัง">
                                        <Table columns={productInStoreColumns} onChange={handlePaginationChange2} dataSource={productData} pagination={{ pageSize: 3 }} />
                                    </Card>
                                </Col>
                            </Row>
                            <Row className="mt-5">
                                <Col span={12} className='pr-2'>
                                    <LongdoMap setMarker={setLocation} setTrueAddress={setTrueAddress} isOpenButton={true} />
                                </Col>
                                <Col span={12} className="pr-2" >
                                    <Card className='w-full' title="สินค้าที่เลือก">
                                        <Table columns={ProductSelectColumns} dataSource={productData} pagination={{ pageSize: 3 }} />
                                    </Card>
                                </Col>
                                <Col span={24} className="mt-5 pr-2" >
                                    <Card title="ข้อมูลคำสั่งซื้อ" className="w-full">
                                        <Table columns={columns} className="h-fit" onChange={handlePaginationChange} pagination={{ pageSize: 5 }} dataSource={orderVip} />
                                    </Card>
                                </Col >
                            </Row >
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Card title="เพิ่มคำสั่งซื้อ" className="w-full">
                                    <Form form={form} layout="vertical" onFinish={onFinish}>
                                        {/* <Form.Item name={"line_id"} key={"line_id"} className='w-full' label="สายการเดินรถ" rules={[{ required: true, message: "กรุณาเลือกสาย" }]}>
                                            <Select className='w-full' onChange={(e) => handleChangeLine(e)}>
                                                {lineData.map((item: any) =>
                                                    <Select.Option key={item.id} value={item.id}>
                                                        {item.line_name}
                                                    </Select.Option>
                                                )}

                                            </Select>
                                        </Form.Item> */}
                                        <Form.Item name={"car_id"} className='w-full' label="เลขทะเบียนรถ" rules={[{ required: true, message: "กรุณาเลือกรถ" }]}>
                                            <Select className='w-full' >
                                                {carData.map((item: any) =>
                                                    <Select.Option key={item.id} value={item.id}>
                                                        {item.car_number}
                                                    </Select.Option>
                                                )}

                                            </Select>
                                        </Form.Item>
                                        <Form.Item key={"customer_name"} name={"customer_name"} className='w-full' label="ชื่อลูกค้า" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item key={"telephone"} name={"telephone"} className='w-full' label="เบอร์โทร" rules={[{ required: true, message: "กรุณากรอกเบอร์" }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item key={"lat"} name={"latitude"} className='w-full' label="ละติจูด" rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]} initialValue={location?.lat}>
                                            <Input value={location?.lat} disabled />
                                        </Form.Item>
                                        <Form.Item key={"lon"} name={"longitude"} className='w-full' label="ลองจิจูด" rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]} initialValue={location?.lon}>
                                            <Input value={location?.lon} disabled />
                                        </Form.Item>
                                        <Form.Item key={"address"} name={"address"} className='w-full' label="ที่อยู่" rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}>
                                            <TextArea value={trueAddress} rows={4} disabled />
                                        </Form.Item>

                                        <Form.Item className="w-full">
                                            <Popconfirm title="ยืนยันการสั่งสินค้า" description="แน่ใจหรือไม่" onConfirm={() => form.submit()} >
                                                <Button type="primary" className="w-full">
                                                    บันทึก
                                                </Button>
                                            </Popconfirm>



                                        </Form.Item>
                                    </Form>
                                </Card>



                            </Row>
                        </Col>
                    </Row>

                    <Modal width={1000} open={openModalCustomer} onCancel={() => setOpenModalCustomer(false)} footer={[]}>
                        <Card title="รายการสินค้า">
                            <Table columns={productSelect} className="h-fit" dataSource={selectCustomer} />
                        </Card>
                    </Modal>
                </div>
            </Card>

        </LayoutComponent>


    );
};

export default OrderVip;