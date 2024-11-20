'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Table, Tabs } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';

import LayoutComponent from '@/components/Layout';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import { createCustomer, deleteCustomer, findAllCustomer } from '@/utils/customerService';
import LongdoMap from '@/components/LongdoMap';
import TextArea from 'antd/es/input/TextArea';
import { render } from 'react-dom';

const CustomerManagement = () => {
    const [customerData, setCustomerData] = useState<any>();
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [messageApi, contextHolder] = useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [openConfirmUuid, setOpenConfirmUuid] = useState<UUID | null>();
    const [trueAddress, setTrueAddress] = useState();
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Telephone',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'Address',
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
        {
            title: '',
            key: 'button',
            render: (item: any) => (
                <>
                    {/* <Button
                        type="primary"
                        className="!bg-yellow-300 mr-1"
                        icon={<ToolOutlined />}
                        onClick={() => {
                            setOpenModalEdit(true);
                            formEdit.setFieldsValue({
                                uuid: item.uuid,
                                name: item.name,
                                email: item.email,
                                phone: item.phone,
                            });
                        }}
                    /> */}
                    <Popconfirm
                        key={item.uuid}
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={() => onDelete(item.uuid)}
                        okText="Yes"
                        cancelText="No"
                        open={openConfirmUuid === item.uuid}
                        onOpenChange={(newOpen) => {
                            if (newOpen) {
                                setOpenConfirmUuid(item.uuid);
                            } else {
                                setOpenConfirmUuid(null);
                            }
                        }}
                    >
                        <Button
                            type="primary"
                            className="!bg-red-500"
                            key={item.uuid}
                            icon={<RestOutlined />}
                        />
                    </Popconfirm>
                </>
            ),
        },
    ];

    useEffect(() => {
        if (location) {
            form.setFieldsValue({ latitude: location.lat, longitude: location.lon, address: JSON.stringify(trueAddress) });
        }
    }, [location, trueAddress])

    const fetchCustomerData = async () => {
        const res = await findAllCustomer();
        if (res.success === true) {
            setCustomerData(res.data);
        }
    };

    const createCustomers = async (params: any) => {
        const res = await createCustomer(params)
        if (res.status === 201) {
            messageApi.success('Customer created successfully!');
            fetchCustomerData()
            form.resetFields();
        } else {
            messageApi.error('Customer created failed!');
        }

    }

    const onDelete = async (uuid: UUID) => {
        const res = await deleteCustomer(uuid)
        if (res.status === 200) {
            messageApi.success('Customer deleted successfully!');
            fetchCustomerData()
        } else {
            messageApi.error('Customer deleted failed!');
        }
    }

    useEffect(() => {
        fetchCustomerData();
    }, [openModalEdit]);

    return (
        <LayoutComponent>
            {contextHolder}
            <Card className='w-full' title="Customer">
                <Row className='w-full'>
                    <Col span={16} className='pr-2 '>
                        <LongdoMap setMarker={setLocation} setTrueAddress={setTrueAddress} />
                    </Col>
                    <Col span={8}>
                        <Card className="w-full !bg-slate-100">
                            <Form layout='vertical' title='Add Customer' form={form} onFinish={(e) => createCustomers(e)} >
                                <Row >
                                    <Col span={24}>
                                        <Form.Item name={"name"} key={"name"} label="Name"
                                            rules={[{ required: true, message: "Name is required" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"email"} key={"email"} label="Email"
                                            rules={[{ required: true, message: "Email is required" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"telephone"} key={"telephone"} label="Telephone"
                                            rules={[{ required: true, message: "Telephone is required" }, { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={12} className='pr-1'>
                                        <Form.Item name={"latitude"} key={"lat"} label="Latitude"
                                            rules={[{ required: true, message: "Latitude is required" }]} >
                                            <Input type='text' value={location?.lat} />
                                        </Form.Item>

                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={"longitude"} key={"lon"} label="Longitude"
                                            rules={[{ required: true, message: "Longitude is required" }]} >
                                            <Input type='text' value={location?.lon} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"address"} key={"address"} label="Address"
                                            rules={[{ required: true, message: "Address is required" }]} >
                                            <TextArea rows={2} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className='pr-1'>
                                        <Button type="default" danger className='w-full ' htmlType='reset'>Reset</Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button type="primary" className='w-full' htmlType='submit'>Submit</Button>
                                    </Col>
                                </Row>


                            </Form>
                        </Card>
                    </Col>
                </Row>
                <Row className=" w-full mt-5">
                    <Col span={24} className='pr-2'>
                        <Card className="w-full  !bg-slate-100" >
                            <Table columns={columns} dataSource={customerData} pagination={{ pageSize: 10 }} />
                        </Card>
                    </Col>

                </Row>

            </Card>

        </LayoutComponent>
    );
};

export default CustomerManagement;