'use client';
import { updateProduct } from '@/utils/productService';
import { updateUser } from '@/utils/userService';
import { Button, Card, Col, Form, FormInstance, Input, Modal, Row } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import React from 'react';

interface EditProductModalProps {
    openModalEdit: boolean;
    setOpenModalEdit: (open: boolean) => void;
    productEdit?: UUID | null
    formEdit: FormInstance
}

const EditProductModal: React.FC<EditProductModalProps> = ({ openModalEdit, setOpenModalEdit, productEdit, formEdit }) => {
    const [messageApi, contextHolder] = useMessage();

    const onFinish = async (values: any) => {
        const res = await updateProduct(values.uuid, values)
        if (res.status === 200) {
            messageApi.success('Product updated successfully!');
            setOpenModalEdit(false)
        }
    }
    return (

        <Modal title="Edit User" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
            {contextHolder}
            <Form layout='vertical' title='Edit Product' form={formEdit} onFinish={(e) => onFinish(e)}>
                <Form.Item name={"uuid"} key={"uuid"} hidden={true} initialValue={productEdit} ></Form.Item>
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
                    <Col span={24} className=''>
                        <Button type="primary" className=' w-full' htmlType='submit'>Submit</Button>

                    </Col>
                </Row>
            </Form>

        </Modal>
    );
}

export default EditProductModal;