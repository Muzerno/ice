'use client';
import LayoutComponent from '@/components/Layout';
import { Button, Card, Col, Form, Input, Row, Table } from 'antd';
import React from 'react';

const ProdectManagement = () => {
    const columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    }]

    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>Product</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={18} className='pr-2'>
                        <Card className='w-full !bg-slate-100'>
                            <Table columns={columns} >

                            </Table>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className='w-full !bg-slate-100' title="Add New Product">
                            <div>
                                <Form layout='vertical' title='Add User'>
                                    <Form.Item name={"name"} key={"name"} label="Name"
                                        rules={[{ required: true, message: "Name is required" }]} >
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"price"} key={"price"} label="Price"
                                        rules={[{ required: true, message: "Price is required" }]}>
                                        <Input type='number' />
                                    </Form.Item>
                                    <Form.Item name={"amount"} key={"amount"} label="Amount"
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
        </LayoutComponent>

    );
}

export default ProdectManagement;
