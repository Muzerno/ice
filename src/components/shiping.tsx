// src/components/carManagement.tsx
import { findAllCustomer } from "@/utils/customerService";
import { createCar, createTransportationLine, deleteCar, deleteTransportationLine, deleteTransportationLineWithIds, findAllCar, findAllTransportationLine, updateCar } from "@/utils/transpotationService";
import { findAllUser, findAllUserDeliver } from "@/utils/userService";
import { DeleteOutlined, PlusCircleOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Pagination, Popconfirm, Row, Select, Table, TableProps } from "antd";
import useMessage from "antd/es/message/useMessage";
import { UUID } from "crypto";
import { ca } from "date-fns/locale";
import { useEffect, useState } from "react";
import { render } from "react-dom";

const Shipping = () => {
    const [carData, setCarData] = useState<any[]>([]);

    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [messageApi, contextHolder] = useMessage();
    const [selectedCar, setSelectedCar] = useState<number | null>();
    const [customerData, setCustomerData] = useState<any>([]);
    const [transportationData, setTransportationData] = useState<any>([]);
    const [selectCustomer, setSelectCustomer] = useState([]);
    const [openModalCustomer, setOpenModalCustomer] = useState(false);
    const [rowSelectList, setRowSelectList] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const handlePaginationChange = (pagination: any) => {
        setCurrentIndex((pagination.current - 1) * pagination.pageSize);

    };
    const handlePaginationChange2 = (pagination: any) => {
        console.log(pagination.current, pagination.pageSize)
        setCurrentIndex2((pagination.current - 1) * pagination.pageSize);
    }

    const handleUpdate = async (item: any) => {
        if (rowSelectList.length <= 0) {
            messageApi.error("กรุณาเลือกลูกค้า");
            return
        }
        const res = await createTransportationLine({
            line_name: item.line_name,
            car_id: item.car_id,
            customer_id: rowSelectList,
        });
        if (res.status === 201) {
            messageApi.success("บันทึกสําเร็จ!");
            form.resetFields();
            deliverLine();
            setRowSelectList([])
        }
    };

    const columns = [
        {
            title: "ลำดับ",
            dataIndex: "id",
            key: "id",
            render: (text: any, record: any, index: any) => currentIndex + index + 1
        },
        {
            title: "ขื่อสายการเดินรถ",
            dataIndex: "line_name",
            key: "line_name",
        },
        {
            title: "เลขทะเบียนรถ",
            dataIndex: "transportation_car",
            key: "car_number",
            render: (item: any) => item?.car_number,
        },
        {
            title: "",
            key: "button",
            render: (item: any) => (
                <div className="flex justify-end">
                    <Popconfirm title="ต้องการเพิ่มข้อมูลใช่หรือไม่?" description="เพิ่มข้อมูล" onConfirm={() => handleUpdate(item)}>
                        <Button type="primary" className="mr-2 !bg-green-400" icon={<PlusCircleOutlined />}></Button>
                    </Popconfirm>
                    <Button type="primary" className="mr-2" icon={<TeamOutlined />} onClick={() => handleOpenModalCustomer(item)}>ข้อมูลลูกค้า</Button>
                    <Popconfirm
                        title="Delete the car"
                        description="แน่ใจหรือไม่"
                        onConfirm={() => deleteLineWithIdsArray(item.lineArray)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },

    ];
    const customerColumns = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => currentIndex2 + index + 1
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


    ];

    const customerModalColumns = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => index + 1
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
            title: "",
            key: "button",
            render: (item: any) => (
                <div className="flex justify-end">
                    <Popconfirm
                        title="Delete the car"
                        description="แน่ใจหรือไม่"
                        onConfirm={() => deleteLine(item.line_id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const onFinish = async (values: any) => {
        if (rowSelectList.length <= 0) {
            messageApi.error("กรุณาเลือกลูกค้า");
            return
        }
        const res = await createTransportationLine(values);
        if (res.status === 201) {
            messageApi.success("บันทึกสําเร็จ!");
            form.resetFields();
            deliverLine();
            setRowSelectList([])
        }
    };

    const onFinishEdit = async (values: any) => {
        const res = await updateCar(selectedCar, values);
        if (res.status === 200) {
            messageApi.success("แก้ไขสําเร็จ!");
            formEdit.resetFields();
            fetchCarData();
        }
    };

    const deleteLine = async (id: number) => {
        const res = await deleteTransportationLine(id);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            deliverLine();
            getCustomer()
            setOpenModalCustomer(false)
        }
    };

    const deleteLineWithIdsArray = async (id: number[]) => {
        const res = await deleteTransportationLineWithIds(id);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            deliverLine();
            getCustomer()

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

    const rowSelection: TableProps<any>['rowSelection'] = {
        selectedRowKeys: rowSelectList,
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            const customerArray = []
            for (const row of selectedRows) {
                customerArray.push(row.id)
            }
            form.setFieldsValue({
                customer_id: customerArray
            })
            setRowSelectList([...customerArray])
        },
        getCheckboxProps: (record: any) => ({
            name: record.name,
        }),

    };

    const handleOpenModalCustomer = (value: any) => {
        setOpenModalCustomer(true)

        setSelectCustomer(value.customer)
    }

    useEffect(() => {
        getCustomer()
        fetchCarData();
        deliverLine()
    }, []);



    return (
        <div>

            <Row  >
                {contextHolder}
                <Col span={16} className="pr-2" >
                    <Row>
                        <Col >
                            <div>
                                <Card title="ข้อมูลลูกค้า" className="w-full " style={{ height: 600 }}>
                                    <Table columns={customerColumns}
                                        rowSelection={{
                                            type: "checkbox",
                                            ...rowSelection,
                                        }}

                                        rowKey={(id: any) => id.id}
                                        pagination={{ pageSize: 5 }}
                                        dataSource={customerData}

                                        onChange={handlePaginationChange2}
                                    >

                                    </Table>
                                </Card>

                            </div>
                            <div className="mt-5 w-full">
                                <Card title="ข้อมูลสายการเดินรถ" className="w-full h-full">
                                    <Table columns={columns} pagination={{ pageSize: 5 }} className="h-full" style={{ height: "400px", overflow: 'auto' }} onChange={handlePaginationChange} dataSource={transportationData} />
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Col >
                <Col span={8} className="pl-2">
                    <Card className=" !bg-slate-100" title="เพิ่มสายการเดินรถ">
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item name={"line_name"} label="ชื่อสายการเดินรถ">
                                <Input type="text" />
                            </Form.Item>
                            <Form.Item name="car_id" label="เลขทะเบียนรถ">
                                <Select >
                                    {carData.map((item: any) => <Select.Option value={item.id}>{item.car_number}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="customer_id" label="Customer" hidden>
                                <Select mode="multiple">
                                    {customerData.map((item: any) => <Select.Option value={item.id}>{item.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item className="w-full">
                                <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => form.submit()} >
                                    <Button type="primary" className="w-full">
                                        บันทึก
                                    </Button>
                                </Popconfirm>
                            </Form.Item>
                        </Form>

                    </Card>
                </Col>
            </Row >

            <Modal width={1000} open={openModalCustomer} onCancel={() => setOpenModalCustomer(false)} footer={[]}>
                <Card title="ข้อมูลลูกค้า">
                    <Table columns={customerModalColumns} pagination={{ pageSize: 5 }} dataSource={selectCustomer} />
                </Card>
            </Modal>
        </div>



    );
};

export default Shipping;