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
                    <Popconfirm
                        title="Delete the car"
                        description="Are you sure to delete this car?"
                        onConfirm={() => deleteCars(item.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </>
            ),
        },
    ];

    const onFinish = async (values: any) => {
        const res = await createCar(values);
        if (res.status === 201) {
            messageApi.success("Car created successfully!");
            form.resetFields();
            fetchCarData();
        }
    };

    const onFinishEdit = async (values: any) => {
        const res = await updateCar(selectedCar, values);
        if (res.status === 200) {
            messageApi.success("Car updated successfully!");
            formEdit.resetFields();
            fetchCarData();
        }
    };

    const deleteCars = async (id: number) => {
        const res = await deleteCar(id);
        if (res.status === 200) {
            messageApi.success("Car deleted successfully!");
            fetchCarData();
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
                <Card className="w-full !bg-slate-100">
                    <Row>
                        <Col span={24}>
                            <Table columns={columns} className="h-fit" dataSource={carData} />
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span={6} className="pl-2">
                <Card className="w-full !bg-slate-100">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="car_number" label="เลขทะเบียนรถ">
                            <Input />
                        </Form.Item>
                        <Form.Item name="user_id" label="ผู้ใช้">
                            <Select>
                                {userData.map((item: any) => <Select.Option value={item.id}>{item.firstname} {item.lastname}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                บันทึก
                            </Button>
                        </Form.Item>
                    </Form>
                    <Modal
                        title="แก้ไขข้อมูลรถ"
                        visible={openModalEdit}
                        onCancel={() => setOpenModalEdit(false)}
                        footer={[
                            <Button key="back" onClick={() => setOpenModalEdit(false)}>
                                ปิด
                            </Button>,
                            <Button key="submit" type="primary" onClick={onFinishEdit}>
                                บันทึก
                            </Button>,
                        ]}
                    >
                        <Form form={formEdit} onFinish={onFinishEdit}>
                            <Form.Item name="car_number" label="เลขทะเบียนรถ">
                                <Input />
                            </Form.Item>
                            <Form.Item name="user_id" label="ผู้ใช้">
                                <Select>
                                    {userData.map((item: any) => <Select.Option value={item.id}>{item.name} {item.role.role_name}</Select.Option>)}
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