'use client';
import { updateUser } from '@/utils/userService';
import { Button, Card, Form, FormInstance, Input, Modal, Popconfirm, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import useMessage from 'antd/es/message/useMessage';

import { UUID } from 'crypto';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
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
        // ไม่ต้องส่ง username เนื่องจาก API ไม่จำเป็นต้องตรวจสอบ username อีกต่อไป
        const { username, ...dataToUpdate } = params;
        const res = await updateUser(id, dataToUpdate);
        return res;
    }

    const onFinish = async (values: any) => {
        try {
            const res = await editUser(values.id, values);
            
            if (res.status === 200) {
                // ตรวจสอบข้อมูลจาก response
                if (res.data && res.data.success) {
                    messageApi.success('แก้ไขข้อมูลสําเร็จ!');
                    setOpenModalEdit(false);
                } else {
                    // กรณีที่ API ตอบกลับแล้วแต่ไม่สำเร็จ
                    messageApi.error(res.data?.message || 'แก้ไขข้อมูลไม่สําเร็จ');
                }
            } else if (res.status === 400) {
                // รับข้อความ error จาก API ที่ส่งกลับมาพร้อม status 400
                messageApi.error(res.data?.message || 'แก้ไขข้อมูลไม่สําเร็จ');
            } else {
                messageApi.error('แก้ไขข้อมูลไม่สําเร็จ');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            messageApi.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        }
    }

    return (

        <Modal
        title="แก้ไขผู้ใช้"
        open={openModalEdit}
        onCancel={() => setOpenModalEdit(false)}
        footer={[]}
    >
        {contextHolder}
        <Form
            layout='vertical'
            form={formEdit}
            onFinish={onFinish}
        >
            <Form.Item name="id" hidden initialValue={userEdit} />

            <Form.Item name="username" label="ชื่อผู้ใช้">
                <Input readOnly disabled />
            </Form.Item>

            <Form.Item
                name="password"
                label="รหัสผ่าน"
                rules={[{ required: true, message: "กรอกรหัสผ่าน" }]}
            >
                <Input.Password
                    iconRender={visible => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                />
            </Form.Item>

            <Form.Item
                name="telephone"
                label="เบอร์โทรศัพท์"
                rules={[
                    { required: true, message: "กรอกเบอร์โทรศัพท์" },
                    { pattern: /^[0-9]{10}$/, message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 ตัว" }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="firstname"
                label="ชื่อ"
                rules={[{ required: true, message: "กรอกชื่อ" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="lastname"
                label="นามสกุล"
                rules={[{ required: true, message: "กรอกนามสกุล" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="role_id"
                label="ระดับผู้ใช้"
                rules={[{ required: true, message: "เลือกระดับผู้ใช้" }]}
            >
                <Select>
                    {roleData.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.role_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="address"
                label="ที่อยู่"
                rules={[{ required: true, message: "กรอกที่อยู่" }]}
            >
                <TextArea rows={2} />
            </Form.Item>

            <Popconfirm
                title="ต้องการบันทึกข้อมูลใช่หรือไม่?"
                onConfirm={() => formEdit.submit()}
            >
                <Button type="primary" className="w-full">บันทึก</Button>
            </Popconfirm>
        </Form>
    </Modal>
    );
}

export default EditUserModal;