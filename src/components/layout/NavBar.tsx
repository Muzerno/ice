'use client';
import { UserContext } from '@/context/userContext';
import { updateLocaltion } from '@/utils/dashboardService';

import {
    BarsOutlined,
    BoxPlotOutlined,
    CarOutlined,
    HomeOutlined,
    MoneyCollectFilled,
    PaperClipOutlined,
    TagOutlined,
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
    const [localtion, setLocaltion] = useState<any>()
    const [role, setRole] = useState({
        roleName: null,
        roleKey: null
    })

    useEffect(() => {
        if (!userLogin) return
        if (userLogin?.user?.role?.role_key === 'deliver') {
            fetchLocation();
        }
        const intervalId = setInterval(fetchLocation, 300000);
        return () => clearInterval(intervalId);
    }, [userLogin]);

    const fetchLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async ({ coords }) => {
                const { latitude, longitude } = coords;
                await updateLocaltion(userLogin?.user?.transportation_car?.id, { latitude, longitude })
            });
        }
    };
    useEffect(() => {
        if (!userLogin) return
        setRole({
            roleName: userLogin.user?.role?.role_name,
            roleKey: userLogin?.user?.role?.role_key
        })
    }, [userLogin])
    return (
        <Sider trigger={null} collapsible collapsed={collapsed} className='sticky'>
            {!collapsed && <div className="demo-logo-vertical text-center text-white p-5 text-2xl" >ICE FACTORY</div>}
            <Menu
                theme="dark"
                mode="inline"

                className='mt-10 sticky'
                onClick={(item) => setMenuSelect(item.key)}
                selectedKeys={[menuSelect]}
                items={[

                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'dashboard',
                        icon: <BarsOutlined />,
                        label: 'รายงาน',
                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'userManagement',
                        icon: <UserOutlined />,
                        label: 'จัดการข้อมูลผู้ใช้งาน',

                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'transportation',
                        icon: <CarOutlined />,
                        label: 'จัดการรถ',
                    }
                        : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'product',
                        icon: <BoxPlotOutlined />,
                        label: 'สินค้า',

                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'customer',
                        icon: <UserOutlined />,
                        label: 'จัดการข้อมูลลูกค้า',

                    } : null,
                    role.roleKey === 'admin' ? {
                        key: 'deliveryLine',
                        icon: <TagOutlined />,
                        label: 'จัดสายการเดินรถ',

                    } : null,
                    role.roleKey === 'admin' ? {
                        key: 'manufacture',
                        icon: <HomeOutlined />,
                        label: 'การผลิตสินค้า',

                    } : null,
                    role.roleKey === 'admin' ? {
                        key: 'order',
                        icon: <PaperClipOutlined />,
                        label: 'การเบิกสินค้า',

                    } : null,
                    // role.roleKey === 'deliver' ? {
                    //     key: 'deliverDashboard',
                    //     icon: <CarOutlined />,
                    //     label: 'แดชบอร์ดการขนส่ง',

                    // } : null,
                    role.roleKey === 'admin' ? {
                        key: 'order/vip',
                        icon: <CarOutlined />,
                        label: 'คำสั่งซื้อพิเศษ',

                    } : null,
                    role.roleKey === 'admin' || role.roleKey === 'owner' ? {
                        key: 'money',
                        icon: <MoneyCollectFilled />,
                        label: 'การเงิน',

                    } : null,
                    role.roleKey === 'deliver' ? {
                        key: 'delivery',
                        icon: <CarOutlined />,
                        label: 'การจัดส่ง',
                    } : null,
                ]}
            />
        </Sider>
    );
}

export default NavBarComponent;
