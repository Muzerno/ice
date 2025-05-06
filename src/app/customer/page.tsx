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
            dataIndex: 'customer_id',
            key: 'customer_id',
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
                const [manualAddress, mapAddressPart] = address.split('\n\n[ที่อยู่จากแผนที่]: ');

                try {
                    const mapAddress = mapAddressPart ? JSON.parse(mapAddressPart) : null;

                    return (
                        <div>
                            <div>{manualAddress || '-'}</div>
                            {mapAddress && (
                                <div className="text-gray-500">
                                    {mapAddress.road && <span>{mapAddress.road}</span>}
                                    {mapAddress.subdistrict && <span>, {mapAddress.subdistrict.replace('ต.', 'ตำบล')}</span>}
                                    {mapAddress.district && <span>, {mapAddress.district.replace('อ.', 'อำเภอ')}</span>}
                                    {mapAddress.province && <span>, {mapAddress.province.replace('จ.', 'จังหวัด')}</span>}
                                    {mapAddress.postcode && <span> {mapAddress.postcode}</span>}
                                </div>
                            )}
                        </div>
                    );
                } catch (err) {
                    return <div>{address || '-'}</div>;
                }
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
                            setSeleteUUid(item.customer_id);
                            setOpenModalEdit(true);
                            formEdit.setFieldsValue({
                                ...item
                            });
                        }}
                    />
                    <Popconfirm
                        key={item.customer_id}
                        title="ต้องการลบข้อมูลใช่หรือไม่?"
                        description="ลบข้อมูล"
                        onConfirm={() => onDelete(item.customer_id)}
                        okText="Yes"
                        cancelText="No"
                        open={openConfirmUuid === item.customer_id}
                        onOpenChange={(newOpen) => {
                            if (newOpen) {
                                setOpenConfirmUuid(item.customer_id);
                            } else {
                                setOpenConfirmUuid(null);
                            }
                        }}
                        placement="left"

                    >
                        <Button
                            type="primary"
                            className="!bg-red-500"
                            key={item.customer_id}
                            icon={<RestOutlined />}
                        />
                    </Popconfirm>
                </>
            ),
        },
    ];

    useEffect(() => {
        if (location) {
            form.setFieldsValue({
                latitude: location.lat,
                longitude: location.lon,
                map_address: JSON.stringify(trueAddress),
            });
        }
    }, [location, trueAddress]);

    useEffect(() => {
        if (locationEdit) {
            formEdit.setFieldsValue({ 
                latitude: locationEdit.lat, 
                longitude: locationEdit.lon, 
                map_address: JSON.stringify(trueAddress) 
            });
        }
    }, [locationEdit, trueAddress]);

    useEffect(() => {
        if (seleteUUid && customerData) {
            const customer = customerData.find((c: any) => c.customer_id === seleteUUid);
            if (customer) {
                // แยกที่อยู่จาก address
                const [manualAddress, mapAddress] = customer.address.split('\n\n[ที่อยู่จากแผนที่]: ');
                
                formEdit.setFieldsValue({
                    ...customer,
                    manual_address: manualAddress,
                    map_address: mapAddress || ''
                });
            }
        }
    }, [seleteUUid, customerData]);

    const fetchCustomerData = async () => {
        const res = await findAllCustomer();
        if (res.success === true) {
            setCustomerData(res.data);
        }
    };

    const createCustomers = async (values: any) => {
        const combinedAddress = `${values.manual_address}\n\n[ที่อยู่จากแผนที่]: ${values.map_address}`;

        const payload = {
            ...values,
            address: combinedAddress,
        };

        const res = await createCustomer(payload);

        if (res.status === 201) {
            messageApi.success('สร้างลูกค้าสําเร็จ!');
            fetchCustomerData();
            form.resetFields();
        } else {
            messageApi.error('สร้างลูกค้าไม่สําเร็จ!');
        }
    };


    const onUpdate = async (values: any) => {
        const combinedAddress = `${values.manual_address}\n\n[ที่อยู่จากแผนที่]: ${values.map_address}`;
        const payload = {
            name: values.name,
            telephone: values.telephone,
            customer_code: values.customer_code,
            address: combinedAddress,
            latitude: values.latitude,
            longitude: values.longitude
        };
        
        const res = await updateCustomer(seleteUUid, payload);
        
        if (res.status === 200) {
            messageApi.success('แก้ไขลูกค้าสําเร็จ!');
            setOpenModalEdit(false);
            fetchCustomerData();
        } else {
            messageApi.error('แก้ไขลูกค้าไม่สําเร็จ!');
        }
    };


    const onDelete = async (customer_id: number) => {
        try {
          const res = await deleteCustomer(customer_id);
          if (res.status === 200) {
            messageApi.success('ลบลูกค้าสำเร็จ!');
            fetchCustomerData();
          }
        } catch (error: any) {
          if (error.response?.data?.message === 'ไม่สามารถลบลูกค้าได้ เนื่องจากมีการผูกไว้กับสายรถ') {
            messageApi.error('ไม่สามารถลบได้: ลูกค้าผูกไว้กับสายรถแล้ว');
          } else {
            messageApi.error('ลบลูกค้าไม่สำเร็จ!');
          }
        }
      };
      

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
                                            <Input type='text' value={location?.lat} disabled />
                                        </Form.Item>

                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={"longitude"} key={"lon"} label="ลองจิจูด"
                                            rules={[{ required: true, message: "ลองจิจูด " }]} >
                                            <Input type='text' value={location?.lon} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            name="manual_address"
                                            label="ที่อยู่ (กรอกเอง)"
                                            rules={[{ required: true, message: "กรอกที่อยู่ด้วยตนเอง" }]}
                                        >
                                            <TextArea rows={2} placeholder="กรอกที่อยู่ด้วยตนเอง" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            name="map_address"
                                            label="ที่อยู่จากแผนที่"
                                        >
                                            <TextArea rows={2} disabled placeholder="ที่อยู่ที่ดึงจากแผนที่" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className='pr-1'>
                                        <Button type="default" danger className='w-full ' htmlType='reset'>ล้างค่า</Button>
                                    </Col>
                                    <Col span={12}>

                                        <Button type="primary" htmlType='submit' className='w-full'>บันทึก</Button>

                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
                <Row className=" w-full mt-5">
                    <Col span={24} className='pr-2'>
                        <Card className="w-full h-[400px]" style={{ overflow: "auto" }} >
                            <Table columns={columns} dataSource={customerData} pagination={false} />
                        </Card>
                    </Col>

                </Row>
            </Card>

            <Modal title="แก้ไขลูกค้า" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
                <Form layout='vertical' title='Edit Customer' form={formEdit} onFinish={(e) => onUpdate(e)}>
                    {/* ส่วนข้อมูลทั่วไป */}
                    <Row>
                        <Col span={24}>
                            <Form.Item name={"name"} key={"name"} label="ชื่อลูกค้า"
                                rules={[{ required: true, message: "กรอกชื่อลูกค้า" }]}>
                                <Input type='text' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item name={"customer_id"} key={"customer_id"} label="รหัสลูกค้า">
                                <Input type='text' disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item name={"telephone"} key={"telephone"} label="เบอร์โทรศัพท์"
                                rules={[{ required: true, message: "กรอกเบอร์โทรศัพท์" }, { pattern: /^[0-9]{10}$/, message: "กรอกเบอร์โทรศัพท์ให้ถูกต้อง" }]}>
                                <Input type='text' />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ส่วนแผนที่ */}
                    <Row>
                        <Col span={24}>
                            <LongdoMap setMarker={setLocationEdit} setTrueAddress={setTrueAddress} isOpenButton={true} />
                        </Col>
                    </Row>

                    {/* ส่วนพิกัด */}
                    <Row className='mt-2'>
                        <Col span={12} className='pr-1'>
                            <Form.Item name={"latitude"} key={"lat"} label="ละติจูด">
                                <Input type='text' readOnly disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={"longitude"} key={"lon"} label="ลองจิจูด">
                                <Input type='text' readOnly disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ส่วนที่อยู่ที่กรอกเอง */}
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                name="manual_address"
                                label="ที่อยู่ (กรอกเอง)"
                                rules={[{ required: true, message: "กรอกที่อยู่ด้วยตนเอง" }]}
                            >
                                <TextArea rows={2} placeholder="กรอกที่อยู่ด้วยตนเอง" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ส่วนที่อยู่จากแผนที่ */}
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                name="map_address"
                                label="ที่อยู่จากแผนที่"
                            >
                                <TextArea rows={2} disabled placeholder="ที่อยู่ที่ดึงจากแผนที่" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ปุ่มบันทึก */}
                    <Row className='mt-2'>
                        <Col span={24}>
                            <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => formEdit.submit()}>
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