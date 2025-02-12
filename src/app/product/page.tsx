'use client';
import EditProductModal from '@/components/editProductModal';
import LayoutComponent from '@/components/Layout';
import { ICreateProduct } from '@/interface/product';
import { createProduct, deleteProduct, findAllProduct } from '@/utils/productService';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select, Table } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';



const ProdectManagement = () => {

    const [form] = Form.useForm()
    const [messageApi, contextHolder] = useMessage();
    const [data, setData] = React.useState<any[]>([]);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [productEdit, setProductEdit] = useState<number | null>();
    const [formEdit] = Form.useForm();


    const onFinish = async (values: ICreateProduct) => {
        const res = await createProduct(values)
        if (res.status === 201) {
            fetchProductData()
            messageApi.success('สินค้าเพิ่มสําเร็จ');
            form.resetFields();
        }
    }
    useEffect(() => {
        fetchProductData()
    }, [openModalEdit])

    const fetchProductData = async () => {
        const res = await findAllProduct()
        if (res.status === 200) {
            setData(res.data)
        }
    }

    const removeProduct = async (id: number) => {
        const product = await deleteProduct(id)
        if (product.status === 200) {
            messageApi.success('ลบสินค้าสําเร็จ');
            fetchProductData()
        }
    }
    const handleEdit = (item: any) => {
        setOpenModalEdit(true)
        setProductEdit(item.id)
        formEdit.setFieldsValue({
            ...item
        })
    }


    const columns = [
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
        {
            title: 'จัดการ',
            dataIndex: 'action',
            key: 'action',
            render: (text: any, record: any) => (
                <div className='flex justify-center'>
                    <Button type='primary' className='mr-2  !bg-yellow-300' onClick={() => handleEdit(record)}>
                        <ToolOutlined />
                    </Button>
                    <Popconfirm
                        title="ยืนยันการลบ"
                        onConfirm={() => removeProduct(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type='primary' danger>
                            <RestOutlined />
                        </Button>
                    </Popconfirm>
                </div>
            )
        },
    ]






    return (
        <LayoutComponent>
            {contextHolder}
            <Card className="w-full" title={[
                <h1>จัดการสินค้า</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={18} className='pr-2'>
                        <Card key={"tableProduct"} className='w-full !bg-slate-100'>
                            <Table columns={columns} dataSource={data}>
                            </Table>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card key={"formProduct"} className='w-full !bg-slate-100' title="เพิ่มข้อมูลสินค้า">
                            <div>
                                <Form layout='vertical' title='Add User' form={form} onFinish={(e) => onFinish(e)}>
                                    {/* <Form.Item name={"product_number"} key={"product_number"} label="เลขสินค้า"
                                        rules={[{ required: true, message: "Name is required" }]} >
                                        <Input type='text' />
                                    </Form.Item> */}
                                    <Form.Item name={"name"} key={"product_name"} label="ชื่อสินค้า"
                                        rules={[{ required: true, message: "Name is required" }]} >
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"price"} key={"price"} label="ราคา"
                                        rules={[{ required: true, message: "Price is required" }]}>
                                        <Input type='number' />
                                    </Form.Item>
                                    {/* <Form.Item name={"amount"} key={"amount"} label="จำนวน"
                                        rules={[{ required: true, message: "Amount is required" }]}>
                                        <Input type='number' />
                                    </Form.Item> */}

                                    <Row>
                                        <Col span={12} className='mr-1'>
                                            <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => form.submit()} >
                                                <Button type="primary" className=' w-full'>บันทึก</Button>
                                            </Popconfirm>

                                        </Col>
                                        <Col span={11}>
                                            <Button type="default" className='w-full' htmlType='reset'>รีเซ็ต</Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Card>
                    </Col>


                </Row>

            </Card>
            <EditProductModal openModalEdit={openModalEdit} setOpenModalEdit={setOpenModalEdit} productEdit={productEdit} formEdit={formEdit} />
        </LayoutComponent>

    );
}

export default ProdectManagement;
