'use client';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Table } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useEffect, useState } from 'react';

import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { createCustomer, deleteCustomer, findAllCustomer } from '@/utils/customerService';
import { RestOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

const CustomerManagement = () => {
    const [customerData, setCustomerData] = useState<any>();
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [messageApi, contextHolder] = useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [openConfirmUuid, setOpenConfirmUuid] = useState<number | null>();
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
                                id: item.id,
                                name: item.name,
                                email: item.email,
                                phone: item.phone,
                            });
                        }}
                    /> */}
                    <Popconfirm
                        key={item.id}
                        title="Delete the task"
                        description="Are you sure to delete this task?"
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
            messageApi.success('สร้างลูกค้าสําเร็จ!');
            fetchCustomerData()
            form.resetFields();
        } else {
            messageApi.error('สร้างลูกค้าไม่สําเร็จ!');
        }

    }

    const onDelete = async (id: number) => {
        const res = await deleteCustomer(id)
        if (res.status === 200) {
            messageApi.success('ลบลูกค้าสําเร็จ!');
            fetchCustomerData()
        } else {
            messageApi.error('ลบลูกค้าไม่สําเร็จ!');
        }
    }

    useEffect(() => {
        fetchCustomerData();
    }, [openModalEdit]);

    return (
        <LayoutComponent>
            {contextHolder}
            <Card className='w-full' title="จัดการข้อมูลลูกค้า">
                <Row className='w-full'>
                    <Col span={16} className='pr-2 '>
                        <LongdoMap setMarker={setLocation} setTrueAddress={setTrueAddress} isOpenButton={true} />
                    </Col>
                    <Col span={8}>
                        <Card className="w-full !bg-slate-100">
                            <Form layout='vertical' title='Add Customer' form={form} onFinish={(e) => createCustomers(e)} >
                                <Row >
                                    <Col span={24}>
                                        <Form.Item name={"name"} key={"name"} label="ชื่อลูกค้า"
                                            rules={[{ required: true, message: "กรอกชื่อลูกค้า" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"email"} key={"email"} label="อีเมล์"
                                            rules={[{ required: true, message: "กรอกอีเมล์" }, { type: 'email', message: "กรอกอีเมล์ให้ถูกต้อง" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"telephone"} key={"telephone"} label="เบอร์โทรศัพท์"
                                            rules={[{ required: true, message: "กรอกเบอร์โทรศัพท์" }, { pattern: /^[0-9]{10}$/, message: "กรอกเบอร์โทรศัพท์ให้ถูกต้อง" }]} >
                                            <Input type='text' />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={12} className='pr-1'>
                                        <Form.Item name={"latitude"} key={"lat"} label="ละติจูด"
                                            rules={[{ required: true, message: "Latitude is required" }]} >
                                            <Input type='text' value={location?.lat} />
                                        </Form.Item>

                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={"longitude"} key={"lon"} label="ลองจิจูด"
                                            rules={[{ required: true, message: "Longitude is required" }]} >
                                            <Input type='text' value={location?.lon} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"address"} key={"address"} label="ที่อยู่"
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