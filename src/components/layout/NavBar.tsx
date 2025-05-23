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
    UserOutlined,
    EnvironmentOutlined
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
        if (userLogin?.user?.role?.role_key !== 'deliver') return
        if (userLogin?.user?.role?.role_key === 'deliver') {
            console.log(userLogin?.user?.role.role_key)
            fetchLocation();
        }
        const intervalId = setInterval(fetchLocation, 300000);
        return () => clearInterval(intervalId);
    }, [userLogin]);

    const fetchLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async ({ coords }) => {
                const { latitude, longitude } = coords;
                await updateLocaltion(userLogin?.user?.transportation_car?.car_id, { latitude, longitude })
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
        // <Sider trigger={null} collapsible collapsed={collapsed} className='sticky'>
        //     {!collapsed && <div className="demo-logo-vertical text-center text-white p-5 text-md" >โรงน้ำแข็งหลอดศรีนวล</div>}
        //     <Menu
        //         theme="dark"
        //         mode="inline"
        //         className='mt-10 sticky'
        //         onClick={(item) => setMenuSelect(item.key)}
        //         selectedKeys={[menuSelect]}
        //         items={[

        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'dashboard',
        //                 icon: <BarsOutlined />,
        //                 label: 'รายงาน',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'dashboard/delivery',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'รายงานการจัดสาย',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'dashboard/withdraw',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'รายงานการเบิกสินค้า',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'dashboard/manufacture',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'รายงานการผลิต',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'dashboard/money',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'รายงานการเงิน',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'maps',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'ติดตามตำแหน่ง',
        //             } : null,
        //             role.roleKey === 'owner' ? {
        //                 key: 'userManagement',
        //                 icon: <UserOutlined />,
        //                 label: 'จัดการข้อมูลผู้ใช้งาน',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'transportation',
        //                 icon: <CarOutlined />,
        //                 label: 'จัดการรถ',
        //             }
        //                 : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'product',
        //                 icon: <BoxPlotOutlined />,
        //                 label: 'สินค้า',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'customer',
        //                 icon: <UserOutlined />,
        //                 label: 'จัดการข้อมูลลูกค้า',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'deliveryLine',
        //                 icon: <TagOutlined />,
        //                 label: 'จัดสายการเดินรถ',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'manufacture',
        //                 icon: <HomeOutlined />,
        //                 label: 'การผลิตสินค้า',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'order',
        //                 icon: <PaperClipOutlined />,
        //                 label: 'การเบิกสินค้า',

        //             } : null,
        //             role.roleKey === 'deliver' ? {
        //                 key: 'delivery',
        //                 icon: <CarOutlined />,
        //                 label: 'การจัดส่ง',
        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' || role.roleKey === 'deliver' ? {
        //                 key: 'order/vip',
        //                 icon: <CarOutlined />,
        //                 label: 'คำสั่งซื้อพิเศษ',

        //             } : null,
        //             role.roleKey === 'admin' || role.roleKey === 'owner' ? {
        //                 key: 'money',
        //                 icon: <MoneyCollectFilled />,
        //                 label: 'การเงิน',

        //             } : null,

        //         ]}
        //     />
        // </Sider>
        <Sider trigger={null} collapsible collapsed={collapsed} className='sticky'>
    {!collapsed && <div className="demo-logo-vertical text-center text-white p-5 text-md">โรงน้ำแข็งหลอดศรีนวล</div>}
    <Menu
    theme="dark"
    mode="inline"
    className='mt-10 sticky'
    onClick={(item) => setMenuSelect(item.key)}
    selectedKeys={[menuSelect]}
    inlineIndent={12} // ลดระยะห่างของเมนูย่อย
    >
        {(role.roleKey === 'admin' || role.roleKey === 'owner') && (
            <Menu.SubMenu key="reports" icon={<BarsOutlined />} title="รายงาน">
                <Menu.Item key="dashboard" icon={<PaperClipOutlined />}>รายงานภาพรวม</Menu.Item>
                <Menu.Item key="dashboard/delivery" icon={<PaperClipOutlined />}>รายงานการจัดสาย</Menu.Item>
                <Menu.Item key="dashboard/withdraw" icon={<PaperClipOutlined />}>รายงานการเบิกสินค้า</Menu.Item>
                <Menu.Item key="dashboard/manufacture" icon={<PaperClipOutlined />}>รายงานการผลิต</Menu.Item>
                <Menu.Item key="dashboard/money" icon={<PaperClipOutlined />}>รายงานการเงิน</Menu.Item>
            </Menu.SubMenu>
        )}

        {(role.roleKey === 'admin' || role.roleKey === 'owner') && (
            <Menu.Item key="maps" icon={<EnvironmentOutlined />}>ติดตามตำแหน่ง</Menu.Item>
        )}

        {role.roleKey === 'owner' && (
            <Menu.Item key="userManagement" icon={<UserOutlined />}>จัดการข้อมูลผู้ใช้งาน</Menu.Item>
        )}

        {(role.roleKey === 'admin' || role.roleKey === 'owner') && (
            <>
                <Menu.Item key="transportation" icon={<CarOutlined />}>จัดการรถ</Menu.Item>
                <Menu.Item key="product" icon={<BoxPlotOutlined />}>สินค้า</Menu.Item>
                <Menu.Item key="customer" icon={<UserOutlined />}>จัดการข้อมูลลูกค้า</Menu.Item>
                <Menu.Item key="deliveryLine" icon={<TagOutlined />}>จัดสายการเดินรถ</Menu.Item>
                <Menu.Item key="manufacture" icon={<HomeOutlined />}>การผลิตสินค้า</Menu.Item>
                <Menu.Item key="order" icon={<PaperClipOutlined />}>การเบิกสินค้า</Menu.Item>
                <Menu.Item key="money" icon={<MoneyCollectFilled />}>การเงิน</Menu.Item>
            </>
        )}

        {role.roleKey === 'deliver' && (
            <Menu.Item key="delivery" icon={<CarOutlined />}>การจัดส่ง</Menu.Item>
        )}

        {(role.roleKey === 'admin' || role.roleKey === 'owner' || role.roleKey === 'deliver') && (
            <Menu.Item key="order/vip" icon={<CarOutlined />}>คำสั่งซื้อพิเศษ</Menu.Item>
        )}
    </Menu>
</Sider>
    );
}

export default NavBarComponent;
