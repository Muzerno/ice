import { Button, Layout, theme } from 'antd';
import React, { useContext } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';

const { Header } = Layout
const HeaderDefault = (props: any) => {
    const router = useRouter()
    const { userLogin } = useContext(UserContext)
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { collapsed, setCollapsed } = props
    return (
        <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                }}
            />
            <span className='float-right'>
                <span className='text-lg mr-5  ' style={{ border: "1px solid black", borderRadius: "5px", padding: "5px", background: "lightblue" }}>
                    {userLogin?.user?.role?.role_name}
                </span>
                <span style={{ border: "1px solid black", borderRadius: "5px", padding: "5px", }} className='text-lg mr-5  '> <UserOutlined /> {userLogin?.user?.firstname}  {userLogin?.user?.lastname}</span>
                <Button type="primary" className='' danger onClick={() => {
                    localStorage.removeItem('payload')
                    router.push('/auth/login')
                }}>
                    ออกจากระบบ
                </Button>
            </span>
        </Header>
    );
}
export default HeaderDefault;
