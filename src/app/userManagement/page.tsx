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

export default function userManagement() {
    const [userData, setUserData] = useState<any>()
    const [openModalEdit, setOpenModalEdit] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const [form] = Form.useForm()
    const [formEdit] = Form.useForm()
    const [formRole] = Form.useForm()
    const [openConfirmUuid, setOpenConfirmUuid] = useState<UUID | null>(null);
    const [seleteUUid, setSeleteUUid] = useState<UUID | null>();
    const [roleData, setRoleData] = useState<any>([])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Telephone',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: any) => role.role_name
        },
        {
            title: "",
            key: "button",
            render: (item: any) => {
                return <><Button type="primary" className='!bg-yellow-300 mr-1' icon={<ToolOutlined />} onClick={() => { setOpenModalEdit(true); formEdit.setFieldsValue({ uuid: item.uuid, username: item.username, telephone: item.telephone, name: item.name, role_uuid: item.role.uuid }); setSeleteUUid(item.uuid) }}></Button>
                    <Popconfirm
                        key={item.uuid}
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={() => removeUser(item.uuid)}
                        okText="Yes"
                        cancelText="No"
                        open={openConfirmUuid === item.uuid}
                        onOpenChange={(newOpen) => {
                            if (newOpen) {
                                setOpenConfirmUuid(item.uuid);
                            } else {
                                setOpenConfirmUuid(null);
                            }
                        }}

                    >
                        <Button type="primary" className='!bg-red-500' key={item.uuid} icon={<RestOutlined />} ></Button>
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

    const removeUser = async (uuid: UUID) => {
        const user = await deleteUser(uuid)
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
        return <Row className='w-full  '>
            <Col span={18} className='pr-2'>
                <Card key={"cardTableUser"} className='w-full !bg-slate-100'>
                    <Table columns={columns} dataSource={userData} pagination={{ pageSize: 5 }}>

                    </Table>
                </Card>
            </Col>
            <Col span={6}>
                <Card key={"cardAddUser"} className='w-full !bg-slate-100' title="Add User">
                    <div>
                        <Form layout='vertical' title='Add User' form={form} onFinish={(e) => onFinish(e)}>
                            <Form.Item name={"username"} key={"username"} label="Username"
                                rules={[{ required: true, message: "Username is required" }]} >
                                <Input type='text' />
                            </Form.Item>
                            <Form.Item name={"telephone"} key={"telephone"} label="Telephone"
                                rules={[{ required: true, message: "Telephone is required" }, { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }]}>
                                <Input type='text' />
                            </Form.Item>
                            <Form.Item name={"name"} key={"name"} label="Name"
                                rules={[{ required: true, message: "Name is required" }]}>
                                <Input type='text' />
                            </Form.Item>
                            <Form.Item name={"role_uuid"} key={"role_uuid"} label="Role"
                                rules={[{ required: true, message: "Role is required" }]}>
                                <Select defaultActiveFirstOption>
                                    {roleData.map((item: any) => <Select.Option key={item.uuid} value={item.uuid}>{item.role_name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                            <Row>
                                <Col span={12} className='mr-1'>
                                    <Button type="primary" className=' w-full' htmlType='submit'>Submit</Button>

                                </Col>
                                <Col span={11}>
                                    <Button type="default" className='w-full' htmlType='reset'>Reset</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Card>
            </Col>


        </Row>

    }
    const createRoles = async (params: any) => {
        const res = await createRole(params)
        if (res.status === 201) {
            messageApi.success('Role created successfully!');
            fetchRoleData()
        }
    }

    const roleTabs = () => {
        const roleColumn = [
            { title: 'Role Name', dataIndex: 'role_name', key: 'role_name' },
            { title: "createAt", dataIndex: "create_at", key: "create_at", render: (create_at: string) => format(new Date(create_at), 'dd/MM/yyyy') },
        ]
        return <Row className='w-full  '>
            <Col span={18} className='pr-2'>
                <Card key={"cardTableRole"} className='w-full !bg-slate-100'>
                    <Table columns={roleColumn} dataSource={roleData} pagination={{ pageSize: 5 }}>

                    </Table>
                </Card>
            </Col>
            <Col span={6}>
                <Card key={"cardAddRole"} className='w-full !bg-slate-100' title="Add Roles">
                    <div>
                        <Form layout='vertical' title='Add Roles' form={formRole} onFinish={(e) => createRoles(e)}>
                            <Form.Item name={"role_name"} key={"role_name"} label="Role Name"
                                rules={[{ required: true, message: "Name is required" }]} >
                                <Input type='text' />
                            </Form.Item>
                            <Form.Item name={"role_key"} key={"role_key"} label="Role Key"
                                rules={[{ required: true, message: "Key is required like role name" }]} >
                                <Input type='text' />
                            </Form.Item>
                            <Row>
                                <Col span={12} className='mr-1'>
                                    <Button type="primary" className=' w-full' htmlType='submit'>Submit</Button>

                                </Col>
                                <Col span={11}>
                                    <Button type="default" className='w-full' htmlType='reset'>Reset</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Card>
            </Col>


        </Row>
    }

    return (
        <LayoutComponent>
            {contextHolder}
            <Card key={"cardUser"} className="w-full" title={[
                <h1>User Management</h1>
            ]}>
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'User',
                        children: userTabs()
                    },
                    {
                        key: '2',
                        label: 'Role',
                        children: roleTabs()
                    },
                ]} />
            </Card>

            <EditUserModal openModalEdit={openModalEdit} setOpenModalEdit={setOpenModalEdit} userEdit={seleteUUid ?? null} formEdit={formEdit} roleData={roleData} />
        </LayoutComponent>
    );
}