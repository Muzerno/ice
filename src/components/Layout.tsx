'use client';
import { Layout, theme } from 'antd';
import React, { use, useContext, useEffect, useState } from 'react';
import HeaderDefault from './layout/Header';
import NavBarComponent from './layout/NavBar';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';


const { Sider, Content } = Layout;

const LayoutComponent = ({ children }: React.PropsWithChildren) => {
    const router = useRouter()
    const param = usePathname()
    const path = param.replace("/", "");
    const [collapsed, setCollapsed] = useState(false);
    const [menuSelect, setMenuSelect] = useState(path ?? 'dashboard')
    const { userLogin, setUserLogin } = useContext(UserContext)

    useEffect(() => {
        if (path === menuSelect) return
        router.push(`/${menuSelect}`)
    }, [menuSelect])

    useEffect(() => {
        const storageUserLogin = localStorage.getItem('payload')

        setUserLogin(JSON.parse(storageUserLogin!))
        if (!storageUserLogin) {
            router.push('/auth/login')
        }
    }, [])

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout className=''>
            <NavBarComponent collapsed={collapsed} setCollapsed={setCollapsed} setMenuSelect={setMenuSelect} menuSelect={menuSelect} />
            <Layout >
                <HeaderDefault collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 10,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutComponent;
