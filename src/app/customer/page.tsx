'use client';
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Table } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useEffect, useState } from 'react';

import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { createCustomer, deleteCustomer, findAllCustomer, updateCustomer } from '@/utils/customerService';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { render } from 'react-dom';
import EditUserModal from '@/components/editUserModal';

const CustomerManagement = () => {
    const [customerData, setCustomerData] = useState<any>();
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [messageApi, contextHolder] = useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [openConfirmUuid, setOpenConfirmUuid] = useState<number | null>();
    const [seleteUUid, setSeleteUUid] = useState<number | null>();
    const [trueAddress, setTrueAddress] = useState();
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationEdit, setLocationEdit] = useState<{ lat: number; lon: number } | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const handlePaginationChange = (pagination: any) => {
        setCurrentIndex((pagination.current - 1) * pagination.pageSize);
    };
    const columns = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => currentIndex + index + 1
        },
        {
            title: 'รหัสลูกค้า',
            dataIndex: 'customer_code',
            key: 'customer_code',
        },
        {
            title: 'ชื่อ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'เบอร์โทรศัพท์',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'ที่อยู่',
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
                    <Button
                        type="primary"
                        className="!bg-yellow-300 mr-1"
                        icon={<ToolOutlined />}
                        onClick={() => {
                            setSeleteUUid(item.id);
                            setOpenModalEdit(true);
                            formEdit.setFieldsValue({
                                ...item
                            });
                        }}
                    />
                    <Popconfirm
                        key={item.id}
                        title="ต้องการลบข้อมูลใช่หรือไม่?"
                        description="ลบข้อมูล"
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

    useEffect(() => {
        if (locationEdit) {
            formEdit.setFieldsValue({ latitude: locationEdit.lat, longitude: locationEdit.lon, address: JSON.stringify(trueAddress) });
        }
    }, [locationEdit, trueAddress])

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

    const onUpdate = async (values: any) => {
        const res = await updateCustomer(seleteUUid, values)

        if (res.status === 200) {
            messageApi.success('แก้ไขลูกค้าสําเร็จ!');
            setOpenModalEdit(false)
            fetchCustomerData()
        } else {
            messageApi.error('แก้ไขลูกค้าไม่สําเร็จ!');
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
                                        <Form.Item name={"customer_code"} key={"customer_code"} label="รหัสลูกค้า"
                                            rules={[{ required: true, message: "กรอกรหัสลูกค้า" }]} >
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
                                            rules={[{ required: true, message: "ละติจูด" }]} >
                                            <Input type='text' value={location?.lat} />
                                        </Form.Item>

                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={"longitude"} key={"lon"} label="ลองจิจูด"
                                            rules={[{ required: true, message: "ลองจิจูด " }]} >
                                            <Input type='text' value={location?.lon} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name={"address"} key={"address"} label="ที่อยู่"
                                            rules={[{ required: true, message: "กรอกที่อยู่" }]} >
                                            <TextArea rows={2} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className='pr-1'>
                                        <Button type="default" danger className='w-full ' htmlType='reset'>ล้างค่า</Button>
                                    </Col>
                                    <Col span={12}>
                                        <Popconfirm title="คุณแน่ใจหรือไม่" onConfirm={() => form.submit()}>
                                            <Button type="primary" className='w-full'>บันทึก</Button>
                                        </Popconfirm>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
                <Row className=" w-full mt-5">
                    <Col span={24} className='pr-2'>
                        <Card className="w-full  !bg-slate-100" >
                            <Table columns={columns} dataSource={customerData} onChange={handlePaginationChange} pagination={{ pageSize: 5, position: ["bottomCenter"] }} />
                        </Card>
                    </Col>

                </Row>
            </Card>
            <Modal title="แก้ไขลูกค้า" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
                <Form layout='vertical' title='Add Customer' form={formEdit} onFinish={(e) => onUpdate(e)} >
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
                            <Form.Item name={"customer_code"} key={"customer_code"} label="รหัสลูกค้า"
                                rules={[{ required: true, message: "กรอกรหัสลูกค้า" }]} >
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
                        <Col span={24}>
                            <LongdoMap setMarker={setLocationEdit} setTrueAddress={setTrueAddress} isOpenButton={true} />
                        </Col>
                    </Row>
                    <Row className='mt-2'>
                        <Col span={12} className='pr-1'>
                            <Form.Item name={"latitude"} key={"lat"} label="ละติจูด"
                                rules={[{ required: true, message: "ละติจูด" }]} >
                                <Input type='text' value={location?.lat} readOnly />
                            </Form.Item>

                        </Col>
                        <Col span={12}>
                            <Form.Item name={"longitude"} key={"lon"} label="ลองจิจูด"
                                rules={[{ required: true, message: "ลองจิจูด " }]} >
                                <Input type='text' value={location?.lon} readOnly />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item name={"address"} key={"address"} label="ที่อยู่"
                                rules={[{ required: true, message: "กรอกที่อยู่" }]} >
                                <TextArea rows={2} readOnly />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row className='mt-2'>
                        <Col span={24}>
                            <Popconfirm title="คุณแน่ใจหรือไม่" onConfirm={() => formEdit.submit()}>
                                <Button type="primary" className='w-full'>บันทึก</Button>
                            </Popconfirm>
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </LayoutComponent>
    );
};

export default CustomerManagement;