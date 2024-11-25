'use client';
import { login } from '@/utils/authService';
import { Button, Card, Form, Input } from 'antd';
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
            messageApi.success('Login successful!');
            const user = res.data.payload.user
            console.log(user.role.role_key)
            console.log(user.role.role_key === 'deviler')
            if (user.role.role_key === 'admin' || user.role.role_key === 'owner') {
                router.push('/dashboard');
            } if (user.role.role_key === 'deliver') {
                router.push('/deliverDashboard');
            }

        } else {
            messageApi.error('Login failed!');
        }
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className='w-full justify-center flex flex-row-reverse mt-[10%]'>
            {contextHolder}
            <Card title="เข้าสู่ระบบ" className='mt-50 w-[300px] justify-center text-center !bg-blue-100'>
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
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input placeholder='Username' style={{ width: '100%' }} type="text" size={size} value={username} onChange={(e) => setUsername(e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password value={password} placeholder='Password' size={size} onChange={(e) => setPassword(e.target.value)} />
                        </Form.Item>

                        <Form.Item className='items-center w-full'>
                            <Button type="primary" className='w-full' size={size} htmlType="submit">
                                เข้าสู่ระบบ
                            </Button>
                        </Form.Item>
                    </Form>

                </div>
            </Card>
        </div>
    );
};

export default LoginPage;