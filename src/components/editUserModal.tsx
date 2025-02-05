'use client';
import { updateUser } from '@/utils/userService';
import { Button, Card, Form, FormInstance, Input, Modal, Popconfirm, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import React from 'react';

interface EditUserModalProps {
    openModalEdit: boolean;
    setOpenModalEdit: (open: boolean) => void;
    userEdit: number | null
    formEdit: FormInstance
    roleData: any[]
}

const EditUserModal: React.FC<EditUserModalProps> = ({ openModalEdit, setOpenModalEdit, userEdit, formEdit, roleData }) => {
    const [messageApi, contextHolder] = useMessage();

    const editUser = async (id: number, params: any) => {
        const res = await updateUser(id, params)
        return res
    }
    console.log(formEdit)
    const onFinish = async (values: any) => {
        const res = await editUser(values.id, values)
        if (res.status === 200) {
            messageApi.success('User updated successfully!');
            setOpenModalEdit(false)
        }
    }
    return (

        <Modal title="Edit User" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
            {contextHolder}
            <Form layout='vertical' title={`Edit User${formEdit.getFieldValue('username')}`} form={formEdit} onFinish={(e) => onFinish(e)}>
                <Form.Item name={"id"} key={"id"} hidden={true} initialValue={userEdit} ></Form.Item>
                <Form.Item name={"username"} key={"username"} label="ชื่อผู้ใช้"
                    rules={[{ required: true, message: "กรอกชื่อผู้ใช้" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"telephone"} key={"telephone"} label="เบอร์โทรศัพท์"
                    rules={[{ required: true, message: "กรอกเบอร์โทรศัพท์" }, { pattern: /^[0-9]{10}$/, message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 ตัว" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"firstname"} key={"firstname"} label="ชื่อ"
                    rules={[{ required: true, message: "กรอกชื่อ" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"lastname"} key={"lastname"} label="นามสกุล"
                    rules={[{ required: true, message: "กรอกนามสกุล" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"role_id"} key={"role_id"} label="ระดับผู้ใช้"
                    rules={[{ required: true, message: "เลือกระดับผู้ใช้" }]} >
                    <Select >
                        {roleData.map((item: any) => <Select.Option key={item.id} value={item.id}>{item.role_name}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name={"address"} key={"address"} label="ที่อยู่"
                    rules={[{ required: true, message: "กรอกที่อยู่" }]} >
                    <TextArea rows={2}></TextArea>
                </Form.Item>

                <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => formEdit.submit()} >
                    <Button type="primary" className=' w-full'>บันทึก</Button>
                </Popconfirm>
            </Form>

        </Modal>
    );
}

export default EditUserModal;