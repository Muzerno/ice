'use client';
import { UserContext } from '@/context/userContext';
import {
    BarsOutlined,
    BoxPlotOutlined,
    CarOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useContext, useEffect, useState } from 'react';
interface IProps {
    collapsed: boolean
    // setNavBarMenu: any
    setCollapsed: any
    // navBarMenu: string
    setMenuSelect: any
    menuSelect: string
}

const NavBarComponent = (props: IProps) => {
    const { collapsed, setMenuSelect, menuSelect } = props
    const { userLogin } = useContext(UserContext)
    const [role, setRole] = useState({
        roleName: null,
        roleKey: null
    })
    useEffect(() => {
        console.log(userLogin)
        if (!userLogin) return
        setRole({
            roleName: userLogin.user?.role?.role_name,
            roleKey: userLogin?.user?.role?.role_key
        })
    }, [userLogin])
    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical text-center text-white p-5 text-2xl" >ICE FACTORY</div>
            <Menu
                theme="dark"
                mode="inline"
                className='mt-10'
                onClick={(item) => setMenuSelect(item.key)}
                selectedKeys={[menuSelect]}
                items={[
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'dashboard',
                        icon: <BarsOutlined />,
                        label: 'Dashboard',
                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'transportation',
                        icon: <CarOutlined />,
                        label: 'Transportation',
                    }
                        : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'product',
                        icon: <BoxPlotOutlined />,
                        label: 'Product',

                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'userManagement',
                        icon: <UserOutlined />,
                        label: 'User management',

                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'customer',
                        icon: <UserOutlined />,
                        label: 'Customer',

                    } : null,
                    role.roleKey === 'deliver' ? {
                        key: 'deliverDashboard',
                        icon: <CarOutlined />,
                        label: 'Delivery dashboard',

                    } : null,
                ]}
            />
        </Sider>
    );
}

export default NavBarComponent;
