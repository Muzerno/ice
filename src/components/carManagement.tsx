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
    const [selectedCar, setSelectedCar] = useState<UUID | null>();
    const [userData, setUserData] = useState<any>([]);
    const columns = [
        {
            title: "Car Number",
            dataIndex: "car_number",
            key: "car_number",
        },
        {
            title: "User Name",
            dataIndex: "users",
            key: "usesr",
            render: (item: any) => item.name,
        },
        {
            title: "",
            key: "button",
            render: (item: any) => (
                <>
                    <Popconfirm
                        title="Delete the car"
                        description="Are you sure to delete this car?"
                        onConfirm={() => deleteCars(item.uuid)}
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

    const deleteCars = async (uuid: UUID) => {
        const res = await deleteCar(uuid);
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
                            <Table columns={columns} className="h-[300px]" dataSource={carData} />
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span={6} className="pl-2">
                <Card className="w-full !bg-slate-100">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="car_number" label="Car Number">
                            <Input />
                        </Form.Item>
                        <Form.Item name="user_uid" label="User">
                            <Select>
                                {userData?.map((item: any) => <Select.Option value={item.uuid}>{item.name} {item?.role?.role_name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Create Car
                            </Button>
                        </Form.Item>
                    </Form>
                    <Modal
                        title="Edit Car"
                        visible={openModalEdit}
                        onCancel={() => setOpenModalEdit(false)}
                        footer={[
                            <Button key="back" onClick={() => setOpenModalEdit(false)}>
                                Cancel
                            </Button>,
                            <Button key="submit" type="primary" onClick={onFinishEdit}>
                                Update Car
                            </Button>,
                        ]}
                    >
                        <Form form={formEdit} onFinish={onFinishEdit}>
                            <Form.Item name="car_number" label="Car Number">
                                <Input />
                            </Form.Item>
                            <Form.Item name="user_name" label="User Name">
                                <Input />
                            </Form.Item>
                            <Form.Item name="customer_name" label="Customer Name">
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </Col>
        </Row>
    );
};

export default CarManagement;