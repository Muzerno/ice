'use client';
import { Button, Card, Form, Input } from 'antd';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const size = 'large';
    const onFinish = (values: any) => {
        // Handle login logic here, e.g., send a request to your backend
        console.log('Success:', values);
        // Redirect to the desired page after successful login
        router.push('/dashboard'); // Replace '/dashboard' with your desired route
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (

        <div className='w-full'>
            <Card title="Login">
                <div className=' w-full'>
                    <Form
                        name="basic"

                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        className='w-full flex'
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

                        <Form.Item className='items-center flex'>
                            <Button type="primary" size={size} htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>


    );
};

export default LoginPage;