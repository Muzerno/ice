'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { createManufacture, deleteManufacture, findAllManufacture, updateManufacture } from '@/utils/manufactureService';
import { findAllProduct, findAllProductDrowdown } from '@/utils/productService';
import { DeleteOutlined, RestOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Row, Select, Table } from "antd";
import FormItem from 'antd/es/form/FormItem';
import { format, isValid } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';
import moment from 'moment';

interface IProps {
    navBarMenu: number
}
export default function Manufacture(props: IProps) {


    const [productData, setProductData] = useState([]);
    const [data, setData] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const { userLogin } = useContext(UserContext)
    const [openModalEdit, setOpenModalEdit] = useState(false);

    const [openConfirmUuid, setOpenConfirmUuid] = useState<number | null>();

    useEffect(() => {
        fetchProduct()
        fetchManufacture()
    }, [])

    const fetchProduct = async () => {
        const res = await findAllProductDrowdown()
        if (res.status === 200) {
            setProductData(res.data);
        }

    }

    const fetchManufacture = async (date: any = new Date()) => {
        const res = await findAllManufacture(date)
        if (res.status === 200) {
            setData(res.data);
        }
    }

    const create = async (values: any) => {
        const res = await createManufacture({
            user_id: userLogin?.user?.id,
            product_id: values.product_id,
            amount: parseInt(values.manufacture_amount),
            date_time: new Date()
        })
        if (res.status === 201) {
            fetchManufacture()
            fetchProduct()
            messageApi.success('สร้างข้อมูลการผลิตสําเร็จ');
        } else {
            messageApi.error('สร้างข้อมูลการผลิตไม่สําเร็จ');
        }
    }
    const columns = [

        {
            title: 'เวลาที่ผลิต',
            dataIndex: 'date_time',
            key: 'date_time',
            render: (item: any) => format(new Date(item), 'HH:mm'),
        },
        {
            title: 'จำนวน',
            dataIndex: 'manufacture_details',
            key: 'manufacture_amount',
            render: (item: any) => {
                const amount = item?.map((item: any) => item?.manufacture_amount)
                return amount
            },
        },
        {
            title: "ชื่อสินค้า",
            dataIndex: "manufacture_details",
            key: "product_name",
            render: (item: any) => item[0]?.products?.name
        },
        {
            title: "",
            dataIndex: "",
            key: "action",
            width: 100,
            render: (item: any) => {
                return (
                    <>
                        <Button
                            type="primary"
                            className="!bg-yellow-300 mr-1"
                            icon={<ToolOutlined />}
                            onClick={() => {
                                setOpenModalEdit(true);
                                const newDate = new Date();
                                formEdit.setFieldsValue({
                                    id: item?.id,
                                    date_time: moment(newDate),
                                    product_id: item?.manufacture_details[0]?.products[0]?.id,
                                    manufacture_amount: item?.manufacture_details[0]?.manufacture_amount
                                });
                            }}
                        />
                        <Popconfirm
                            key={item.id}
                            title="ลบข้อมูลการผลิต"
                            description="คุณต้องการลบข้อมูลการผลิตหรือไม่"
                            onConfirm={() => onDelete(item.id)}
                            okText="Yes"
                            cancelText="No"
                            open={openConfirmUuid === item.id}
                            onOpenChange={(newOpen) => {
                                if (newOpen) {
                                    setOpenConfirmUuid(item.id);
                                } else {
                                    setOpenConfirmUuid(null);
                                }
                            }}
                        >
                            <Button
                                type="primary"
                                className="!bg-red-500"
                                key={item.id}
                                icon={<RestOutlined />}
                            />
                        </Popconfirm>
                    </>
                )
            }
        }
    ]

    const ProductColumns = [
        {
            title: 'รหัสสินค้า',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => index + 1
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
            messageApi.success('ลบข้อมูลการผลิตสําเร็จ');
            fetchManufacture()
        } else {
            messageApi.error('ลบข้อมูลการผลิตไม่สําเร็จ');
        }
    }

    const onUpdate = async (values: any) => {
        const res = await updateManufacture(values.id, values)
        if (res.status === 200) {
            messageApi.success('แก้ไขข้อมูลการผลิตสําเร็จ');
            setOpenModalEdit(false)
            fetchManufacture()
        } else {
            messageApi.error('แก้ไขข้อมูลการผลิตไม่สําเร็จ');
        }
    }
    return (
        <LayoutComponent >
            {contextHolder}
            <div className='w-full'>
                <Row className='mt-5'>
                    <Col span={16}>
                        <Row>
                            <Card className='w-full' title="สินค้าในคลัง">

                                <Table columns={ProductColumns} dataSource={productData} pagination={{ pageSize: 5 }} />
                            </Card>
                        </Row>
                        <Row className='mt-5'>
                            <Card className='w-full' title="จัดการข้อมูลการผลิต" >
                                <div className='mb-2 float-end'>
                                    <DatePicker format={"DD/MM/YYYY"} size='large' defaultValue={moment(new Date())} onChange={(date, dateString) => fetchManufacture(date)} />
                                </div>
                                <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
                            </Card>
                        </Row>


                    </Col>
                    <Col span={8} className='pl-2'>
                        <Card className='w-full' title="เพิ่มข้อมูลการผลิต">
                            <Form layout='vertical' onFinish={create} form={form}>
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
                                <Form.Item name={"manufacture_amount"} className='w-full' label="จำนวนที่ผลิต" rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}>
                                    <Input className='w-full' />
                                </Form.Item>
                                <Button type="primary" className=' w-full' htmlType='submit'>บันทึก</Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
            <Modal open={openModalEdit} title="แก้ไขข้อมูลการผลิต" onCancel={() => setOpenModalEdit(false)} footer={[]}>
                <Form layout='vertical' onFinish={onUpdate} form={formEdit}>
                    <Form.Item name='id' hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name={"product_id"} className='w-full' label="สินค้า" rules={[{ required: true, message: "กรุณาเลือกสินค้า" }]}>
                        <Select className='w-full' disabled>
                            {productData.map((item: any) =>
                                <Select.Option key={item.id} value={item.id}>
                                    {item.name}
                                </Select.Option>
                            )}

                        </Select>
                    </Form.Item>
                    <Form.Item name={"date_time"} className='w-full ' label="วันที่ผลิต" rules={[{ required: true, message: "กรุณาเลือกวันที่ผลิต" }]}>
                        <DatePicker className='w-full' format={'DD/MM/YYYY'} />
                    </Form.Item>
                    <Form.Item name={"manufacture_amount"} className='w-full' label="จำนวนที่ผลิต" rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}>
                        <Input className='w-full' />
                    </Form.Item>
                    <Button type="primary" className=' w-full' htmlType='submit'>บันทึก</Button>
                </Form>
            </Modal>
        </LayoutComponent>

    );
}


