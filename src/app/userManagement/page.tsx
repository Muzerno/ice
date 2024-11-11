'use client';
import LayoutComponent from '@/components/Layout';
import { Button, Card, Col, Form, Input, Row, Table, } from 'antd';
import React from 'react';

export default function userManagement() {

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Telephone',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status"
        },
        {
            title: "",
            dataIndex: "status",
            key: "status"
        }
    ]

    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>User Management</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={18} className='pr-2'>
                        <Card className='w-full !bg-slate-100'>
                            <Table columns={columns} >

                            </Table>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className='w-full !bg-slate-100' title="Add User">
                            <div>
                                <Form layout='vertical' title='Add User'>
                                    <Form.Item name={"username"} key={"username"} label="Username"
                                        rules={[{ required: true, message: "Username is required" }]} >
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"telephone"} key={"telephone"} label="Telephone"
                                        rules={[{ required: true, message: "Telephone is required" }, { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }]}>
                                        <Input type='text' />
                                    </Form.Item>
                                    <Form.Item name={"name"} key={"name"} label="Name"
                                        rules={[{ required: true, message: "Name is required" }]}>
                                        <Input type='text' />
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