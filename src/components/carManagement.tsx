// src/components/carManagement.tsx
import { createCar, deleteCar, findAllCar, updateCar } from "@/utils/transpotationService";
import { findAllUser, findAllUserDeliver } from "@/utils/userService";
import { DeleteOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Table } from "antd";
import useMessage from "antd/es/message/useMessage";
import { UUID } from "crypto";
import { useEffect, useState } from "react";

const CarManagement: React.FC = () => {
    const [carData, setCarData] = useState<any[]>([]);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [messageApi, contextHolder] = useMessage();
    const [selectedCar, setSelectedCar] = useState<number | null>();
    const [userData, setUserData] = useState<any>([]);
    const [userFilter, setUserFilter] = useState<any>([]);
    const columns = [
        {
            title: "เลขทะเบียนรถ",
            dataIndex: "car_number",
            key: "car_number",
        },
        {
            title: "ชื่อผู้ใช้",
            dataIndex: "users",
            key: "usesr",
            render: (item: any) => `${item.firstname} ${item.lastname}`,
        },
        {
            title: "",
            key: "button",
            render: (item: any) => (
                <>
                    <Button
                        type="primary"
                        className='!bg-yellow-300 mr-1'
                        icon={<ToolOutlined />}
                        onClick={() => {
                            setOpenModalEdit(true);
                            setSelectedCar(item.car_id);
                            formEdit.setFieldsValue({
                                car_number: item.car_number,
                                user_id: item.user_id // ตั้งค่า user_id ปัจจุบัน
                            });
                        }}
                    >
                    </Button>
                    <Popconfirm
                        title="ต้องการลบข้อมูลใช่หรือไม่?"
                        description="ลบข้อมูล!"
                        onConfirm={() => deleteCars(item.car_id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </>
            ),
        },
    ];

    useEffect(() => {
        const userFilters = userData
            .filter((user: any) => user.role?.role_key === 'deliver') // เฉพาะคนขับ
            .filter((user: any) =>
                !carData.some((car: any) => car.user_id === user.id) ||
                (selectedCar && carData.some(car => car.car_id === selectedCar && car.user_id === user.id))
            ); // ยังไม่ถูกผูกกับรถ หรือเป็นผู้ใช้ปัจจุบันของรถที่กำลังแก้ไข

        setUserFilter(userFilters);
    }, [userData, carData, selectedCar]); // เพิ่ม selectedCar ใน dependencies


    const onFinish = async (values: any) => {
        const res = await createCar(values);
        if (res.status === 201) {
            messageApi.success("บันทึกสําเร็จ!");
            form.resetFields();
            fetchCarData();
        }
        if (res.status === 204) {
            messageApi.error("เลขทะเบียนรถซ้ําหรือคนขับไม่ถูกต้อง");
        }
    };

    const onFinishEdit = async (values: any) => {
        const res = await updateCar(selectedCar, values);
    
        if (res.status === 200) {
            messageApi.success("อัพเดทสําเร็จ!");
            formEdit.resetFields();
            fetchCarData();
            setOpenModalEdit(false);
        } else if (res.status === 409) {
            messageApi.error(res.data?.message || "เลขทะเบียนรถซ้ําหรือคนขับไม่ถูกต้อง");
        } else {
            messageApi.error("เกิดข้อผิดพลาดในการอัพเดท");
        }
    };
    

    const deleteCars = async (car_id: number) => {
        const res = await deleteCar(car_id);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            fetchCarData();
        } else {
            messageApi.error("ลบไม่สําเร็จ!");
        }

    };

    const fetchCarData = async () => {
        const res = await findAllCar();
        if (res.success === true) {
            setCarData(res.data);
        }
    };

    const fetchUserData = async () => {
        const res = await findAllUser();
        if (res.success === true) {
            setUserData(res.data);
        }
    };

    useEffect(() => {
        fetchCarData();
        fetchUserData()
    }, []);

    return (
        <Row className="w-full">
            {contextHolder}
            <Col span={18} className="pr-2">
                <Card className="w-full ">
                    <Row>
                        <Col span={24}>
                            <div className="w-full h-[70vh]" style={{ overflowY: "scroll" }}>
                                <Table columns={columns} dataSource={carData} pagination={false} />
                            </div>

                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span={6} className="pl-2">
                <Card className="w-full !bg-slate-100">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="car_number" label="เลขทะเบียนรถ" rules={[{ required: true, message: "กรุณากรอกเลขทะเบียนรถ" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="user_id" label="ผู้ใช้" rules={[{ required: true, message: "กรุณาเลือกผู้ใช้" }]}>
                            <Select>
                                {userFilter.map((item: any) => <Select.Option key={item.id} value={item.id}>{item.firstname} {item.lastname} {`[${item.role.role_name}]`}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item>

                            <Button type="primary" htmlType="submit" >
                                บันทึก
                            </Button>

                        </Form.Item>
                    </Form>
                    <Modal
                        title="แก้ไขข้อมูลรถ"
                        visible={openModalEdit}
                        onCancel={() => {
                            setOpenModalEdit(false);
                            setSelectedCar(null);
                        }}
                        footer={[
                            <Button key="back" onClick={() => setOpenModalEdit(false)}>
                                ปิด
                            </Button>,
                            <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => formEdit.submit()} >
                                <Button type="primary">
                                    บันทึก
                                </Button>,
                            </Popconfirm>
                        ]}
                    >
                        <Form form={formEdit} onFinish={onFinishEdit} layout="vertical">
                            <Form.Item name="car_number" label="เลขทะเบียนรถ">
                                <Input />
                            </Form.Item>
                            <Form.Item name="user_id" label="ผู้ใช้">
                                <Select>
                                    {userFilter.map((item: any) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.firstname} {item.lastname} {item.role ? `[${item.role.role_name}]` : ''}
                                            {selectedCar && carData.find(car => car.car_id === selectedCar)?.user_id === item.id && ' (ปัจจุบัน)'}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </Col>
        </Row>
    );
};

export default CarManagement;