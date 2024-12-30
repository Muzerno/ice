'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { createManufacture, deleteManufacture, findAllManufacture, updateManufacture } from '@/utils/manufactureService';
import { createOrder, findAllOrder } from '@/utils/orderService';
import { findAllProductDrowdown } from '@/utils/productService';
import { findAllCar, findAllTransportationLine } from '@/utils/transpotationService';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Popconfirm, Row, Select, Table } from 'antd';
import { format } from 'date-fns';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';

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


    const fetchWithdrawData = async () => {
        const res = await findAllOrder()
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
        const res = await createOrder({
            user_id: userLogin?.user?.id,
            product_id: values.product_id,
            amount: parseInt(values.amount),
            car_id: values.car_id
        })
        if (res.data.success === true) {
            fetchWithdrawData()
            fetchProduct()
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
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => index + 1
        },
        {
            title: 'ทะเบียนรถ',
            dataIndex: 'transportation_car',
            key: 'transportation_car',
            render: (item: any) => item.car_number
        },
        {
            title: 'วันที่เบิก / เวลา',
            dataIndex: 'data_time',
            key: 'data_time',
            render: (item: any) => moment(item).format('DD/MM/YYYY HH:mm'),
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
        // {
        //     title: "",
        //     dataIndex: "",
        //     key: "action",
        //     width: 100,
        //     render: (item: any) => {
        //         return (
        //             <>
        //                 <Button
        //                     type="primary"
        //                     className="!bg-yellow-300 mr-1"
        //                     icon={<ToolOutlined />}
        //                     onClick={() => {
        //                         setOpenModalEdit(true);
        //                         const newDate = new Date();
        //                         formEdit.setFieldsValue({
        //                             id: item?.id,
        //                             date_time: moment(newDate),
        //                             product_id: item?.manufacture_details[0]?.products[0]?.id,
        //                             manufacture_amount: item?.manufacture_details[0]?.manufacture_amount
        //                         });
        //                     }}
        //                 />
        //                 <Popconfirm
        //                     key={item.id}
        //                     title="ลบข้อมูลการผลิต"
        //                     description="คุณต้องการลบข้อมูลการผลิตหรือไม่"
        //                     onConfirm={() => onDelete(item.id)}
        //                     okText="Yes"
        //                     cancelText="No"
        //                     open={openConfirmUuid === item.id}
        //                     onOpenChange={(newOpen) => {
        //                         if (newOpen) {
        //                             setOpenConfirmUuid(item.id);
        //                         } else {
        //                             setOpenConfirmUuid(null);
        //                         }
        //                     }}
        //                 >
        //                     <Button
        //                         type="primary"
        //                         className="!bg-red-500"
        //                         key={item.id}
        //                         icon={<RestOutlined />}
        //                     />
        //                 </Popconfirm>
        //             </>
        //         )
        //     }
        // }
    ]

    const ProductColumns = [
        {
            title: 'รหัสสินค้า',
            dataIndex: 'id',
            key: 'id',
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
                        <Card className='w-full' title="การเบิกสินค้า">
                            <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
                        </Card>
                    </Col>
                    <Col span={8} className='pl-2'>
                        <Card className='w-full' title="เบิกสินค้า">
                            <Form layout='vertical' onFinish={create} form={form}>
                                <Form.Item name={"car_id"} className='w-full' label="สายการเดินรถ" rules={[{ required: true, message: "กรุณาเลือกสาย" }]}>
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
                                <Form.Item name={"product_id"} className='w-full' label="สินค้า" rules={[{ required: true, message: "กรุณาเลือกสินค้า" }]}>
                                    <Select className='w-full' >
                                        {productData.map((item: any) =>
                                            <Select.Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Select.Option>
                                        )}

                                    </Select>
                                </Form.Item>

                                {/* <Form.Item name={"date_time"} className='w-full ' label="วันที่ผลิต" rules={[{ required: true, message: "กรุณาเลือกวันที่ผลิต" }]}>
                                    <DatePicker className='w-full' format={'DD/MM/YYYY'} />
                                </Form.Item> */}
                                <Form.Item name={"amount"} className='w-full' label="จำนวน" rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}>
                                    <Input className='w-full' />
                                </Form.Item>
                                <Button type="primary" className=' w-full' htmlType='submit'>บันทึก</Button>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={16}>
                        <Card className='w-full' title="สินค้าในคลัง">
                            <Table columns={ProductColumns} dataSource={productData} pagination={{ pageSize: 5 }} />
                        </Card>
                    </Col>

                </Row>
            </div>
        </LayoutComponent>
    );
}

export default Order;
