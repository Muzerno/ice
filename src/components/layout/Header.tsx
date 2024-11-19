import { Button, Layout, theme } from 'antd';
import React from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header } = Layout
const HeaderDefault = (props: any) => {
    const router = useRouter()
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
            <Button type="primary" className='float-right m-5' danger onClick={() => {
                localStorage.removeItem('payload')
                router.push('/auth/login')
            }}>
                Logout
            </Button>
        </Header>
    );
}
export default HeaderDefault;
