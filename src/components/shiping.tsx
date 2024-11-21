// src/components/carManagement.tsx
import { findAllCustomer } from "@/utils/customerService";
import { createCar, createTransportationLine, deleteCar, deleteTransportationLine, findAllCar, findAllTransportationLine, updateCar } from "@/utils/transpotationService";
import { findAllUser, findAllUserDeliver } from "@/utils/userService";
import { DeleteOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Table } from "antd";
import useMessage from "antd/es/message/useMessage";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { render } from "react-dom";

const Shipping: React.FC = () => {
    const [carData, setCarData] = useState<any[]>([]);

    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [messageApi, contextHolder] = useMessage();
    const [selectedCar, setSelectedCar] = useState<number | null>();
    const [customerData, setCustomerData] = useState<any>([]);
    const [transportationData, setTransportationData] = useState<any>([]);
    const columns = [
        {
            title: "Car Number",
            dataIndex: "transportation_car",
            key: "car_number",
            render: (item: any) => item.car_number,
        },
        {
            title: "Customer Name",
            dataIndex: "customer",
            key: "customer",
            render: (item: any) => item.name,
        },
        {
            title: "Address",
            dataIndex: "customer",
            key: "address",
            render: (item: any) => {
                const parsedAddress = JSON.parse(item.address);
                return (
                    <div>
                        {parsedAddress.road ? parsedAddress.road : ""} {parsedAddress.subdistrict} {parsedAddress.district} {parsedAddress.province} {parsedAddress.country} {parsedAddress.postcode}
                    </div>
                );
            }
        },

        {
            title: "",
            key: "button",
            render: (item: any) => (
                <>
                    <Popconfirm
                        title="Delete the car"
                        description="Are you sure to delete this car?"
                        onConfirm={() => deleteLine(item.id)}
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

        const res = await createTransportationLine(values);
        if (res.status === 201) {
            messageApi.success("Car created successfully!");
            form.resetFields();
            deliverLine();
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

    const deleteLine = async (id: number) => {
        const res = await deleteTransportationLine(id);
        if (res.status === 200) {
            messageApi.success("Car deleted successfully!");
            deliverLine();
        }
    };
    const getCustomer = async () => {
        const res = await findAllCustomer();
        if (res.success === true) {
            setCustomerData(res.data);
        }
    };
    const fetchCarData = async () => {
        const res = await findAllCar();
        if (res.success === true) {
            setCarData(res.data);
        }
    };

    const deliverLine = async () => {
        const res = await findAllTransportationLine()
        if (res) {
            setTransportationData(res)
        }
    }



    useEffect(() => {
        getCustomer()
        fetchCarData();
        deliverLine()
    }, []);


    return (
        <Row className="w-full">
            {contextHolder}
            <Col span={18} className="pr-2">
                <Card className="w-full !bg-slate-100">
                    <Row>
                        <Col span={24}>
                            <Table columns={columns} className="h-[300px]" dataSource={transportationData} />
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span={6} className="pl-2">
                <Card className="w-full !bg-slate-100">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="car_id" label="Car Number">
                            <Select >
                                {carData.map((item: any) => <Select.Option value={item.id}>{item.car_number}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="customer_id" label="Customer">
                            <Select>
                                {customerData.map((item: any) => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Create Car
                            </Button>
                        </Form.Item>
                    </Form>
                    {/* <Modal
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
                    </Modal> */}
                </Card>
            </Col>
        </Row>
    );
};

export default Shipping;