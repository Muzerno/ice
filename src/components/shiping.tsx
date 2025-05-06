// src/components/carManagement.tsx
import { findAllCustomer } from "@/utils/customerService";
import { createTransportationLine, deleteCustomerFromLine, deleteTransportationLineWithIds, findAllCar, findAllTransportationLine, updateCar, addCustomersToLine } from "@/utils/transpotationService";
import { DeleteOutlined, PlusCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Table, TableProps } from "antd";
import useMessage from "antd/es/message/useMessage";
import { useEffect, useState } from "react";

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
    const [assignedCustomers, setAssignedCustomers] = useState<Set<number>>(new Set());
    const handlePaginationChange = (pagination: any) => {
        setCurrentIndex((pagination.current - 1) * pagination.pageSize);

    };
    const handlePaginationChange2 = (pagination: any) => {
        setCurrentIndex2((pagination.current - 1) * pagination.pageSize);
    }

    const handleUpdate = async (item: any) => {
        if (rowSelectList.length <= 0) {
            messageApi.error("กรุณาเลือกลูกค้า");
            return;
        }

        const payload = {
            line_id: item.line_id,
            car_id: item.car_id,
            customer_ids: rowSelectList,
        };

        const res = await addCustomersToLine(payload);

        if (res.status === 200 || res.status === 201) {
            messageApi.success("เพิ่มลูกค้าในสายเรียบร้อย!");
            form.resetFields();
            await deliverLine();
            setRowSelectList([]);
        } else {
            messageApi.error("เพิ่มลูกค้าไม่สำเร็จ!");
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
            render: (item: any) => {
                const driverName = item.users
                    ? `${item.users.firstname || ''} ${item.users.lastname || ''}`.trim()
                    : 'ไม่มีคนขับ';
                return `${item.car_number} - ${driverName}`;
            },
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
                        onConfirm={() => deleteLineWithIdsArray(item.line_id)}
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
                if (!address) return '-';

                // แยกส่วนที่อยู่ที่กรอกเองและที่อยู่จากแผนที่
                const [manualAddress, mapAddressPart] = address.split('\n\n[ที่อยู่จากแผนที่]: ');

                // พยายาม parse ที่อยู่จากแผนที่ถ้ามี
                let mapAddress = null;
                if (mapAddressPart) {
                    try {
                        mapAddress = JSON.parse(mapAddressPart);
                    } catch (err) {
                        console.error('Failed to parse map address:', err);
                        // ถ้า parse ไม่ได้ ให้แสดงข้อมูลดิบ
                        return (
                            <div>
                                <div>{manualAddress || '-'}</div>
                                {mapAddressPart && <div className="text-gray-500">{mapAddressPart}</div>}
                            </div>
                        );
                    }
                }

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
            }
        },
        {
            title: 'สถานะ',
            key: 'status',
            render: (record: any) => {
                const isAssigned = assignedCustomers.has(record.customer_id);
                return (
                    <span className={isAssigned ? 'text-red-500' : 'text-green-500'}>
                        {isAssigned ? 'อยู่ในสายแล้ว' : 'ยังไม่ลงสาย'}
                    </span>
                );
            },
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
                if (!address) return '-';

                // แยกส่วนที่อยู่ที่กรอกเองและที่อยู่จากแผนที่
                const [manualAddress, mapAddressPart] = address.split('\n\n[ที่อยู่จากแผนที่]: ');

                // พยายาม parse ที่อยู่จากแผนที่ถ้ามี
                let mapAddress = null;
                if (mapAddressPart) {
                    try {
                        mapAddress = JSON.parse(mapAddressPart);
                    } catch (err) {
                        console.error('Failed to parse map address:', err);
                        // ถ้า parse ไม่ได้ ให้แสดงข้อมูลดิบ
                        return (
                            <div>
                                <div>{manualAddress || '-'}</div>
                                {mapAddressPart && <div className="text-gray-500">{mapAddressPart}</div>}
                            </div>
                        );
                    }
                }

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
                        onConfirm={() => deleteLine(item.line_id, item.customer_id)}
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
        if (res.status === 201 || res.status === 200) {
            messageApi.success("บันทึกสําเร็จ!");
            form.resetFields();
            deliverLine();
            setRowSelectList([]);
        } else if (res.status === 400) {
            messageApi.error(res.data?.message || "เกิดข้อผิดพลาดในการสร้างสายรถ");
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

    const deleteLine = async (lineId: number, cusId: number) => {
        const res = await deleteCustomerFromLine(lineId, cusId);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            deliverLine();
            getCustomer();
            setOpenModalCustomer(false);
        } else {
            messageApi.error("ลบไม่สําเร็จ!");
        }
    };


    const deleteLineWithIdsArray = async (ids: number[]) => {
        const res = await deleteTransportationLineWithIds(ids);
        if (res.status === 200) {
            messageApi.success("ลบสําเร็จ!");
            deliverLine(); // โหลดเส้นทางใหม่
            getCustomer(); // โหลดลูกค้าใหม่
        } else {
            messageApi.error("ลบไม่สําเร็จ!");
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
        const res = await findAllTransportationLine();
        if (res) {
            setTransportationData(res);

            const assigned = new Set<number>();
            res.forEach((line: any) => {
                if (line.customer && Array.isArray(line.customer)) {
                    line.customer.forEach((cust: any) => {
                        if (cust.customer_id) assigned.add(cust.customer_id); // ใช้ customer_id
                    });
                }
            });
            setAssignedCustomers(assigned);
        }
    }

    const rowSelection: TableProps<any>['rowSelection'] = {
        selectedRowKeys: rowSelectList,
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            // ใช้ customer_id แทน id
            const customerArray = selectedRows
                .map(row => row.customer_id)
                .filter(customer_id => customer_id != null);

            form.setFieldsValue({
                customer_id: customerArray
            });
            setRowSelectList(customerArray);
        },
        getCheckboxProps: (record: any) => ({
            name: record.name,
            disabled: assignedCustomers.has(record.customer_id), // ใช้ customer_id
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
                                <Card title="ข้อมูลลูกค้า" className="w-full  " >
                                    <div className="h-[300px] overflow-y-scroll">
                                        <Table
                                            columns={customerColumns}
                                            rowSelection={{
                                                type: "checkbox",
                                                ...rowSelection,
                                            }}
                                            rowKey={(record) => record.customer_id} // ใช้ customer_id แทน id
                                            pagination={false}
                                            dataSource={customerData}
                                            onChange={handlePaginationChange2}
                                        >

                                        </Table>
                                    </div>

                                </Card>

                            </div>
                            <div className="mt-5 w-full">
                                <Card title="ข้อมูลสายการเดินรถ" className="w-full h-full">
                                    <div className=" h-[300px] overflow-y-scroll">
                                        <Table columns={columns} pagination={false}
                                            className="h-full" onChange={handlePaginationChange} dataSource={transportationData} />
                                    </div>

                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Col >
                <Col span={8} className="pl-2">
                    <Card className=" !bg-slate-100" title="เพิ่มสายการเดินรถ">
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item name={"line_name"} label="ชื่อสายการเดินรถ" rules={[{ required: true, message: "กรุณากรอกชื่อสายการเดินรถ" }]}>
                                <Input type="text" />
                            </Form.Item>
                            <Form.Item name="car_id" label="เลขทะเบียนรถ" rules={[{ required: true, message: "กรุณากรอกเลขทะเบียนรถ" }]}>
                                <Select >
                                    {carData.map((item: any) => <Select.Option value={item.car_id}>{item.car_number} - {item.users ? `${item.users.firstname} ${item.users.lastname}` : 'ไม่มีคนขับ'}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="customer_id" label="Customer" hidden>
                                <Select mode="multiple">
                                    {customerData.map((item: any) => <Select.Option value={item.customer_id}>{item.name} </Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item className="w-full">

                                <Button type="primary" className="w-full" htmlType="submit">
                                    บันทึก
                                </Button>

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