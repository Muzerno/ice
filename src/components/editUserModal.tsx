'use client';
import { updateUser } from '@/utils/userService';
import { Button, Card, Form, FormInstance, Input, Modal } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { UUID } from 'crypto';
import React from 'react';

interface EditUserModalProps {
    openModalEdit: boolean;
    setOpenModalEdit: (open: boolean) => void;
    userEdit?: UUID
    formEdit: FormInstance
}

const EditUserModal: React.FC<EditUserModalProps> = ({ openModalEdit, setOpenModalEdit, userEdit, formEdit }) => {
    const [messageApi, contextHolder] = useMessage();

    const editUser = async (uuid: UUID, params: any) => {
        const res = await updateUser(uuid, params)
        return res
    }


    const onFinish = async (values: any) => {
        const res = await editUser(values.uuid, values)
        if (res.status === 200) {
            messageApi.success('User updated successfully!');
            setOpenModalEdit(false)
        }
    }
    return (

        <Modal title="Edit User" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
            {contextHolder}
            <Form layout='vertical' title={`Edit User${formEdit.getFieldValue('username')}`} form={formEdit} onFinish={(e) => onFinish(e)}>
                <Form.Item name={"uuid"} key={"uuid"} hidden={true} initialValue={userEdit} ></Form.Item>
                <Form.Item name={"username"} key={"username"} label="Username"
                    rules={[{ required: true, message: "Username is required" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"telephone"} key={"telephone"} label="Telephone"
                    rules={[{ required: true, message: "Telephone is required" }, { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }]} >
                    <Input type='text' />
                </Form.Item>
                <Form.Item name={"name"} key={"name"} label="Name"
                    rules={[{ required: true, message: "Name is required" }]} >
                    <Input type='text' />
                </Form.Item>

                <Button type="primary" className=' w-full' htmlType='submit'>Submit</Button>
            </Form>

        </Modal>
    );
}

export default EditUserModal;