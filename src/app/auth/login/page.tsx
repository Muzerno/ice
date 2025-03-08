'use client';
import { login } from '@/utils/authService';
import { SettingTwoTone } from '@ant-design/icons';
import { Button, Card, Form, Image, Input } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useRouter } from 'next/navigation';

import { useState } from 'react';


const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [messageApi, contextHolder] = useMessage()
    const router = useRouter();
    const size = 'large';
    const onFinish = async (values: any) => {
        const res = await login(values)
        if (res.status === 200) {
            localStorage.setItem('payload', JSON.stringify(res.data.payload));
            messageApi.success('เข้าสู่ระบบสําเร็จ!');
            const user = res.data.payload.user
            if (user.role.role_key === 'admin' || user.role.role_key === 'owner') {
                router.push('/dashboard');
            } if (user.role.role_key === 'deliver') {
                router.push('/delivery');
            }

        } else {
            messageApi.error('เข้าสู่ระบบไม่สําเร็จ!');
        }
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className='flex flex-row h-screen'>
            <div className='h-screen w-full opacity-1'>
                {/* <h1 className='text-white  text-[100px] font-semibold text-center mt-[30%]'><SettingTwoTone /></h1> */}
                <img src={`/logo.jpg`} width={300} height={300} className='mx-auto mt-[25%] text-center' />
                <h1 className='text-black text-4xl font-semibold text-center mt-[5%]'>ห้างหุ้นส่วนจำกัด</h1>
                <h1 className='text-black text-3xl font-semibold text-center mt-[2%] gap-1'> โรงน้ำแข็งหลอดศรีนวล จังหวัดขอนแก่น</h1>
            </div>
            <div className='bg-blue-400 w-full justify-center h-screen flex'>
                {contextHolder}
                <div className='mt-[40%]'>
                    <Card title="เข้าสู่ระบบ" className=' w-[300px] h-fit justify-center text-center !bg-blue-100'>
                        <div className='w-full'>
                            <Form
                                name="basic"
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete={"off"}
                            >
                                <Form.Item
                                    className='w-full'
                                    name="username"
                                    vertical={false}
                                    rules={[{ required: true, message: 'กรุณากรอก ชื่อผู้ใช้งาน' }]}
                                >
                                    <Input placeholder='Username' style={{ width: '100%' }} type="text" size={size} value={username} onChange={(e) => setUsername(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'กรุณากรอก รหัสผ่าน' }]}
                                >
                                    <Input.Password value={password} placeholder='Password' size={size} onChange={(e) => setPassword(e.target.value)} />
                                </Form.Item>


                                <Button type="primary" className='w-full' size={size} htmlType="submit">
                                    เข้าสู่ระบบ
                                </Button>

                            </Form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;