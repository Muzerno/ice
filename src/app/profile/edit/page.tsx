"use client";

import React, { useState, useContext, useEffect } from "react";
import LayoutComponent from "@/components/Layout";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  Divider,
  Space,
} from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { updateUser } from "@/utils/userService";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/userContext";

const { Title, Text } = Typography;

const ProfileEdit = () => {
  const router = useRouter();
  const { userLogin, setUserLogin } = useContext(UserContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLogin?.user) {
      form.setFieldsValue({
        username: userLogin.user.username,
        password: userLogin.user.password,
        firstname: userLogin.user.firstname,
        lastname: userLogin.user.lastname,
        email: userLogin.user.email,
        telephone: userLogin.user.telephone,
        address: userLogin.user.address,
      });
    }
  }, [userLogin, form]);

  const editUser = async (id: number, params: any) => {
    const { username, ...dataToUpdate } = params;
    const res = await updateUser(id, dataToUpdate);
    return res;
  };

  const handleSubmit = async (values: any) => {
    try {
      const userId = userLogin?.user?.id; // ดึง id จาก userLogin

      if (!userId) {
        message.error("ไม่พบข้อมูลผู้ใช้งาน");
        return;
      }

      const res = await editUser(userId, values);

      if (res.data.success) {
        message.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
        router.back();
      } else {
        message.error(res.data.message || "ไม่สามารถอัปเดตได้");
      }
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการอัปเดต");
      console.error(err);
    }
  };

  return (
    <LayoutComponent>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <Title
                level={2}
                style={{
                  margin: 0,
                  background: "linear-gradient(45deg, #1890ff, #722ed1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <EditOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                แก้ไขข้อมูลส่วนตัว
              </Title>
            </div>
          </div>

          {/* Avatar Section */}
          {/* <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Avatar
                size={120}
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{
                  border: '4px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <div style={{ marginTop: '16px' }}>
                <Upload
                  name="avatar"
                  listType="picture"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="/api/upload" // เปลี่ยนเป็น API endpoint ของคุณ
                  beforeUpload={(file) => {
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                    if (!isJpgOrPng) {
                      message.error('คุณสามารถอัพโหลดไฟล์ JPG/PNG เท่านั้น!');
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      message.error('ขนาดไฟล์ต้องไม่เกิน 2MB!');
                    }
                    return isJpgOrPng && isLt2M;
                  }}
                  onChange={handleAvatarUpload}
                >
                  <Button icon={<UploadOutlined />} size="small">
                    เปลี่ยนรูปโปรไฟล์
                  </Button>
                </Upload>
              </div>
            </div> */}

          <Divider />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="ชื่อผู้ใช้"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อผู้ใช้" },
                    { min: 2, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
                  ]}
                >
                  <Input
                    placeholder="กรอกชื่อผู้ใช้"
                    disabled
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="รหัสผ่าน"
                  rules={[
                    { required: true, message: "กรุณากรอกรหัสผ่าน" },
                    { min: 2, message: "รหัสผ่านต้องมีอย่างน้อย 2 ตัวอักษร" },
                  ]}
                >
                  <Input.Password
                    placeholder="กรอกรหัสผ่าน"
                    style={{ borderRadius: "8px" }}
                    visibilityToggle // (ค่า default คือ true อยู่แล้ว)
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstname"
                  label="ชื่อ"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อ" },
                    { min: 2, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
                  ]}
                >
                  <Input
                    placeholder="กรอกชื่อ"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastname"
                  label="นามสกุล"
                  rules={[
                    { required: true, message: "กรุณากรอกนามสกุล" },
                    { min: 2, message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร" },
                  ]}
                >
                  <Input
                    placeholder="กรอกนามสกุล"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="telephone"
              label="เบอร์โทรศัพท์"
              rules={[
                { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก",
                },
              ]}
            >
              <Input
                placeholder="กรอกเบอร์โทรศัพท์"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="ที่อยู่"
              rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="กรอกที่อยู่"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            {/* Role Display */}
            <Form.Item label="ตำแหน่ง">
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f0f5ff",
                  border: "1px solid #d6e4ff",
                  borderRadius: "8px",
                  color: "#0050b3",
                }}
              >
                <Text strong>{userLogin?.user?.role?.role_name}</Text>
              </div>
            </Form.Item>

            {/* Buttons */}
            <Form.Item style={{ marginTop: "32px" }}>
              <Space
                size="middle"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Button
                  size="large"
                  onClick={() => router.back()}
                  style={{
                    borderRadius: "8px",
                    minWidth: "120px",
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{
                    borderRadius: "8px",
                    minWidth: "120px",
                    background: "linear-gradient(45deg, #1890ff, #722ed1)",
                    border: "none",
                  }}
                >
                  บันทึกข้อมูล
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </LayoutComponent>
  );
};

export default ProfileEdit;
