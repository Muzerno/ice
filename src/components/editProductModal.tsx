'use client';
import { updateProduct } from '@/utils/productService';
import { updateUser } from '@/utils/userService';
import { Button, Card, Col, Form, FormInstance, Input, Modal, Popconfirm, Row } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import React from 'react';

interface EditProductModalProps {
    openModalEdit: boolean;
    setOpenModalEdit: (open: boolean) => void;
    productEdit?: number | null
    formEdit: FormInstance
}

const EditProductModal: React.FC<EditProductModalProps> = ({ openModalEdit, setOpenModalEdit, productEdit, formEdit }) => {
    const [messageApi, contextHolder] = useMessage();

    const onFinish = async (values: any) => {
        const res = await updateProduct(values.id, values)
        if (res.status === 200) {
            messageApi.success('แก้ไขสินค้าสําเร็จ');
            setOpenModalEdit(false)
        }
    }
    return (

        <Modal title="แก้ไขสินค้า" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
            {contextHolder}
            <Form layout='vertical' title='Edit Product' form={formEdit} onFinish={(e) => onFinish(e)}>
                <Form.Item name={"id"} key={"id"} hidden={true} initialValue={productEdit} ></Form.Item>
                {/* <Form.Item name={"product_number"} key={"product_number"} label="Product Number"
                    rules={[{ required: true, message: "Name is required" }]} >
                    <Input type='text' />
                </Form.Item> */}
                <Form.Item name={"name"} key={"name"} label="ชื่อสินค้า"
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
                    <Col span={24} className=''>
                        <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => formEdit.submit()} >
                            <Button type="primary" className=' w-full'>บันทึก</Button>
                        </Popconfirm>

                    </Col>
                </Row>
            </Form>

        </Modal>
    );
}

export default EditProductModal;