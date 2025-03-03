'use client';
import EditUserModal from '@/components/editUserModal';
import LayoutComponent from '@/components/Layout';
import { createUser, deleteUser, findAllUser } from '@/utils/userService';
import { RestOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select, Table, Tabs, } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import { useEffect, useState } from 'react';
import { createRole, findAllRole } from '@/utils/roleService';
import { format } from 'date-fns';
import TextArea from 'antd/es/input/TextArea';
import { fi, ro } from 'date-fns/locale';

export default function userManagement() {
    const [userData, setUserData] = useState<any>()
    const [openModalEdit, setOpenModalEdit] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const [form] = Form.useForm()
    const [formEdit] = Form.useForm()
    const [formRole] = Form.useForm()
    const [openConfirmUuid, setOpenConfirmUuid] = useState<UUID | null>(null);
    const [seleteUUid, setSeleteUUid] = useState<number | null>();
    const [roleData, setRoleData] = useState<any>([])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            size: "xs md lg"
        },
        {
            title: 'ชื่อ',
            dataIndex: '',
            key: 'name',
            render: (item: any) => (`${item.firstname} ${item.lastname}`)
        },
        {
            title: 'ชื่อผู้ใช้',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'เบอร์โทรศัพท์',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'ระดับผู้ใช้',
            dataIndex: 'role',
            key: 'role',
            render: (role: any) => role?.role_name
        },
        {
            title: "",
            key: "button",
            render: (item: any) => {
                return <><Button type="primary" className='!bg-yellow-300 mr-1' icon={<ToolOutlined />} onClick={() => { setOpenModalEdit(true); formEdit.setFieldsValue({ ...item, role_id: item.role.id }); setSeleteUUid(item.id) }}></Button>
                    <Popconfirm
                        key={item.id}
                        title="ต้องการลบข้อมูลใช่หรือไม่?"
                        onConfirm={() => removeUser(item.id)}
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
                        <Button type="primary" className='!bg-red-500' key={item.id} icon={<RestOutlined />} ></Button>
                    </Popconfirm ></>



            }
        }
    ]

    const fetchRoleData = async () => {
        const role = await findAllRole()
        if (role) {
            setRoleData(role.data)
        }

    }
    useEffect(() => {
        fetchUserdata()
        fetchRoleData()
    }, [openModalEdit])
    const fetchUserdata = async () => {
        const user = await findAllUser()
        setUserData(user.data)
    }

    const removeUser = async (id: number) => {
        const user = await deleteUser(id)
        if (user.status === 200) {
            messageApi.success('User deleted successfully!');
            fetchUserdata()
        }
    }

    const onFinish = async (values: any) => {
        const res = await createUser(values)
        if (res.status === 201) {
            messageApi.success('User created successfully!');
            fetchUserdata()
            form.resetFields();
        }
    };

    const userTabs = () => {
        return

    }
    const createRoles = async (params: any) => {
        const res = await createRole(params)
        if (res.status === 201) {
            messageApi.success('Role created successfully!');
            fetchRoleData()
        }
    }

    return (
        <LayoutComponent>
            {contextHolder}
            <Card key={"cardUser"} className="w-full" title={[
                <h1>จัดการข้อมูลผู้ใช้งาน</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={14} className='pr-2'>
                        <Card key={"cardTableUser"} className='w-full h-[500px]' style={{ overflowY: "scroll" }}>
                            <Table columns={columns} dataSource={userData} pagination={false} />
                        </Card>
                    </Col>
                    <Col span={10}>
                        <Card key={"cardAddUser"} className='w-full !bg-slate-100' title="เพิ่มผู้ใช้">
                            <div>
                                <Form layout='vertical' title='Add User' form={form} onFinish={(e) => onFinish(e)}>
                                    <Row>
                                        <Col span={12} className='pr-1'>
                                            <Form.Item name={"username"} key={"username"} label="ชื่อผู้ใช้"
                                                rules={[{ required: true, message: "กรอกชื่อผู้ใช้" }]} >
                                                <Input type='text' />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name={"telephone"} key={"telephone"} label="เบอร์โทรศัพท์"
                                                rules={[{ required: true, message: " กรอกเบอร์โทรศัพท์" }, { pattern: /^[0-9]{10}$/, message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 ตัว" }]}>
                                                <Input type='text' />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} className='pr-1'>
                                            <Form.Item name={"firstname"} key={"firstname"} label="ชื่อ"
                                                rules={[{ required: true, message: "กรอกชื่อ" }]}>
                                                <Input type='text' />
                                            </Form.Item>

                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name={"lastname"} key={"lastname"} label="นามสกุล"
                                                rules={[{ required: true, message: "กรอกนามสกุล" }]}>
                                                <Input type='text' />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Form.Item name={"address"} key={"address"} label="ที่อยู่"
                                                rules={[{ required: true, message: "กรอกที่อยู่" }]} >
                                                <TextArea rows={2}></TextArea>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col span={24}>
                                            <Form.Item name={"role_id"} key={"role_id"} label="ระดับผู้ใช้"
                                                rules={[{ required: true, message: "กรุณาเลือกระดับผู้ใช้" }]}>
                                                <Select defaultActiveFirstOption>
                                                    {roleData.map((item: any) => <Select.Option key={item.id} value={item.id}>{item.role_name}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} className='mr-1'>
                                            <Button type="primary" className=' w-full' htmlType='submit'>บันทึก</Button>
                                        </Col>
                                        <Col span={11}>
                                            <Button type="default" className='w-full' htmlType='reset'>ล้างค่า</Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <EditUserModal openModalEdit={openModalEdit} setOpenModalEdit={setOpenModalEdit} userEdit={seleteUUid ?? null} formEdit={formEdit} roleData={roleData} />
        </LayoutComponent>
    );
}