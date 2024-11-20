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



const ProdectManagement = () => {

    const [form] = Form.useForm()
    const [messageApi, contextHolder] = useMessage();
    const [data, setData] = React.useState<any[]>([]);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [productEdit, setProductEdit] = useState<UUID | null>();
    const [formEdit] = Form.useForm();


    const onFinish = async (values: ICreateProduct) => {
        const res = await createProduct(values)
        if (res.status === 201) {
            messageApi.success('Product created successfully!')
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

    const removeProduct = async (uuid: UUID) => {
        const product = await deleteProduct(uuid)
        if (product.status === 200) {
            messageApi.success('Product deleted successfully!')
            fetchProductData()
        }
    }
    const handleEdit = (item: any) => {
        setOpenModalEdit(true)
        setProductEdit(item.uuid)
        formEdit.setFieldsValue({
            uuid: item.uuid,
            product_number: item.product_number,
            product_name: item.product_name,
            price: item.price,
            stock: item.stock,
        })
    }


    const columns = [
        {
            title: 'Product Number',
            dataIndex: 'product_number',
            key: 'product_number',
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name',
        },

        {
            title: 'Price (บาท)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Action',
            key: 'action',
            render: (item: any) => {
                return <><Button type="primary" className='!bg-yellow-300 mr-1' icon={<ToolOutlined />} onClick={() => handleEdit(item)} ></Button>
                    <Popconfirm
                        key={item.uuid}
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={() => removeProduct(item.uuid)}
                        okText="Yes"
                        cancelText="No"
                        onOpenChange={(newOpen) => {
                            if (newOpen) {
                                setProductEdit(item.uuid);
                            } else {
                                setProductEdit(null);
                            }
                        }}
                    >
                        <Button type="primary" className='!bg-red-500' key={item.uuid} icon={<RestOutlined />} ></Button>
                    </Popconfirm>
                </>
            }
        }
    ]



    return (
        <LayoutComponent>
            {contextHolder}
            <Card className="w-full" title={[
                <h1>Product</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={18} className='pr-2'>
                        <Card key={"tableProduct"} className='w-full !bg-slate-100'>
                            <Table columns={columns} dataSource={data}>
                            </Table>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card key={"formProduct"} className='w-full !bg-slate-100' title="Add New Product">
                            <div>
                                <Form layout='vertical' title='Add User' form={form} onFinish={(e) => onFinish(e)}>
                                    <Form.Item name={"product_number"} key={"product_number"} label="Product Number"
                                        rules={[{ required: true, message: "Name is required" }]} >
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"product_name"} key={"product_name"} label="Product Name"
                                        rules={[{ required: true, message: "Name is required" }]} >
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"price"} key={"price"} label="Price"
                                        rules={[{ required: true, message: "Price is required" }]}>
                                        <Input type='number' />
                                    </Form.Item>
                                    <Form.Item name={"stock"} key={"stock"} label="Stock"
                                        rules={[{ required: true, message: "Amount is required" }]}>
                                        <Input type='number' />
                                    </Form.Item>

                                    <Row>
                                        <Col span={12} className='mr-1'>
                                            <Button type="primary" className=' w-full' htmlType='submit'>Submit</Button>

                                        </Col>
                                        <Col span={11}>
                                            <Button type="default" className='w-full' htmlType='reset'>Reset</Button>
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
