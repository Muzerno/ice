import { Button, Layout, theme } from 'antd';
import React from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header } = Layout
const HeaderDefault = (props: any) => {
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
        </Header>
    );
}
export default HeaderDefault;
