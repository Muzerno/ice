'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { createManufacture, deleteManufacture, findAllManufacture, updateManufacture } from '@/utils/manufactureService';
import { createOrder, findAllOrder, findAllOrderWithDay } from '@/utils/orderService';
import { findAllProductDrowdown } from '@/utils/productService';
import { findAllCar, findAllTransportationLine } from '@/utils/transpotationService';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, message, Popconfirm, Row, Select, Table } from 'antd';
import { format } from 'date-fns';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';

const Order = () => {


    const [productData, setProductData] = useState([]);
    const [data, setData] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const { userLogin } = useContext(UserContext)
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [carData, setCarData] = useState([]);
    const [lineData, setLineData] = useState([])
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [selectedProductsAmount, setSelectedProductsAmount] = useState<{ [key: number]: number }>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const handlePaginationChange = (pagination: any) => {
        setCurrentIndex((pagination.current - 1) * pagination.pageSize);
    };
    const handlePaginationChange2 = (pagination: any) => {
        setCurrentIndex2((pagination.current - 1) * pagination.pageSize);
    };

    const [openConfirmUuid, setOpenConfirmUuid] = useState<number | null>();

    useEffect(() => {
        fetchProduct()
        fetchWithdrawData()
        fetchCarData()
        fetchLine()
    }, [])

    const fetchProduct = async () => {
        const res = await findAllProductDrowdown()
        if (res.status === 200) {
            setProductData(res.data);
        }
    }


    const fetchWithdrawData = async (date: any = new Date()) => {
        const res = await findAllOrderWithDay(format(date, 'yyyy-MM-dd'))
        if (res.status === 200) {
            setData(res.data.data);
        }
    }

    const fetchLine = async () => {
        const res = await findAllTransportationLine()
        if (res) {
            setLineData(res)
        }
    }

    const create = async (values: any) => {
        if (selectedProducts.length === 0) {
            messageApi.error('กรุณาเลือกรายการสินค้า');
            return
        }
        if (Object.keys(selectedProductsAmount).length < selectedProducts.length) {
            messageApi.error('กรุณากรอกจํานวนสินค้า');
            return
        }
        const res = await createOrder({
            user_id: userLogin?.user?.id,
            product_id: selectedProducts,
            amount: selectedProductsAmount,
            car_id: values.car_id,
            line_id: values.line_id
        })
        if (res.data.success === true) {
            fetchWithdrawData()
            fetchProduct()
            setSelectedProducts([])
            setSelectedProductsAmount({})
            form.resetFields()
            messageApi.success('เบิกสินค้าสําเร็จ');
        } else if (res.status === 201 && res.data.success === false) {
            messageApi.warning('จำนวนสินค้ามีไม่พอ!');
        } else {
            messageApi.error('เบิกสินค้าไม่สําเร็จ');
        }
    }
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
            render: (text: any, record: any, index: any) => currentIndex2 + index + 1
        },
        {
            title: 'สายการเดินรถ',
            dataIndex: 'line',
            key: 'line_name',
            render: (item: any) => item?.line_name

        },
        {
            title: 'วันที่เบิก',
            dataIndex: 'date_time',
            key: 'date_time',
            render: (item: any) => format(item, 'yyyy-MM-dd')
        },
        {
            title: 'รายละเอียดการเบิก',
            dataIndex: 'withdraw_details',
            key: 'withdraw_details',
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
    ]

    const ProductColumns = [
        {
            title: "ลำดับ",
            dataIndex: "id",
            key: "id",
            render: (text: any, record: any, index: any) => currentIndex + index + 1
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'product_name',
        },

        {
            title: 'ราคา (บาท)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
        },
    ]

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
                                    [item.id]: Math.min(newAmount, item.amount),
                                }));
                            }}

                            disabled={!isSelected}
                        />
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => {
                                    const newAmount = (prevAmounts[item.id] || 0) + 1;
                                    return {
                                        ...prevAmounts,
                                        [item.id]: Math.min(newAmount, item.amount),
                                    };
                                });
                            }}
                        >
                            +
                        </Button>
                    </div>
                );
            }
        }
    ]
    const onDelete = async (id: number) => {
        const res = await deleteManufacture(id)
        if (res.status === 200) {
            messageApi.success('ลบข้อมูลสำเร็จ');
            fetchWithdrawData()
        } else {
            messageApi.error('ลบข้อมูลไม่สำเร็จ');
        }
    }

    const onUpdate = async (values: any) => {
        const res = await updateManufacture(values.id, values)
        if (res.status === 200) {
            messageApi.success('แก้ไขข้อมูลสำเร็จ');
            setOpenModalEdit(false)
            fetchWithdrawData()
        } else {
            messageApi.error('แก้ไขข้อมูลไม่สำเร็จ');
        }
    }

    const handleChangeLine = (id: any) => {
        const findLine: any = lineData.find((line: any) => line.id === id)
        if (findLine) {
            form.setFieldsValue({
                car_id: findLine.car_id
            })
        }
    }
    return (
        <LayoutComponent>
            {contextHolder}
            <div className='w-full'>
                <Row className='mt-5'>
                    <Col span={16}>
                        <Row>
                            <Card className='w-full' title="สินค้าในคลัง">
                                <Table columns={ProductColumns} dataSource={productData} onChange={handlePaginationChange} pagination={{ pageSize: 5 }} />
                            </Card>
                        </Row>

                        <Row className='mt-5'>

                            <Card className='w-full pt-5' title="การเบิกสินค้า">
                                {/* <div className='mb-2 float-end'>
                                    <DatePicker format={"DD/MM/YYYY"} size='large' defaultValue={moment(new Date())} onChange={(date, dateString) => fetchWithdrawData(date)} />
                                </div> */}
                                <Table columns={columns} dataSource={data} onChange={handlePaginationChange2} pagination={{ pageSize: 5 }} />
                            </Card>
                        </Row>


                    </Col>

                    <Col span={8} className='pl-2'>
                        <Card className='w-full' title="เบิกสินค้า">
                            <Form layout='vertical' onFinish={create} form={form}>
                                <Form.Item name={"line_id"} key={"line_id"} className='w-full' label="สายการเดินรถ" rules={[{ required: true, message: "กรุณาเลือกสาย" }]}>
                                    <Select className='w-full' onChange={(e) => handleChangeLine(e)}>
                                        {lineData.map((item: any) =>
                                            <Select.Option key={item.id} value={item.id}>
                                                {item.line_name}
                                            </Select.Option>
                                        )}

                                    </Select>
                                </Form.Item>
                                <Form.Item name={"car_id"} className='w-full' label="เลขทะเบียนรถ" rules={[{ required: true, message: "กรุณาเลือกรถ" }]}>
                                    <Select className='w-full' >
                                        {carData.map((item: any) =>
                                            <Select.Option key={item.id} value={item.id}>
                                                {item.car_number}
                                            </Select.Option>
                                        )}

                                    </Select>
                                </Form.Item>
                                <Table columns={ProductSelectColumns} dataSource={productData} pagination={{ pageSize: 5 }} />
                                <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => form.submit()}>
                                    <Button type="primary" className=' w-full'>บันทึก</Button>
                                </Popconfirm>
                            </Form>
                        </Card>
                    </Col>

                </Row>



            </div>
        </LayoutComponent>
    );
}

export default Order;
