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
import { Menu, message } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useContext, useEffect, useState } from 'react';

interface IProps {
    collapsed: boolean
    setCollapsed: any
    setMenuSelect: any
    menuSelect: string
}

const NavBarComponent = (props: IProps) => {
    const { collapsed, setMenuSelect, menuSelect } = props
    const { userLogin } = useContext(UserContext)
    const [location, setLocation] = useState<any>()
    const [isTracking, setIsTracking] = useState(false)
    const [role, setRole] = useState({
        roleName: null,
        roleKey: null
    })

    useEffect(() => {
        if (!userLogin?.user?.role?.role_key) return
        
        if (userLogin.user.role.role_key !== 'deliver') return
        
        // console.log('User role:', userLogin.user.role.role_key)
        // console.log('Car ID:', userLogin.user.transportation_car?.car_id)
        
        // เริ่มติดตามตำแหน่งทันที
        fetchLocation();
        setIsTracking(true)
        
        // ตั้งค่า interval ทุก 5 นาที (300,000 ms)
        const intervalId = setInterval(() => {
            console.log('Fetching location via interval...')
            fetchLocation();
        }, 300000);
        
        return () => {
            clearInterval(intervalId);
            setIsTracking(false)
        }
    }, [userLogin]);

    const fetchLocation = () => {
        
        // ตรวจสอบว่ามี car_id หรือไม่
        if (!userLogin?.user?.transportation_car?.car_id) {
            console.error('No car ID found for user')
            message.error('ไม่พบข้อมูลรถของผู้ใช้')
            return
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const { latitude, longitude } = coords;
                    
                    try {
                        const result = await updateLocaltion(
                            userLogin.user.transportation_car.car_id, 
                            { latitude, longitude }
                        )
                        
                        setLocation({ latitude, longitude })
                        console.log('Location updated successfully:', result)
                        
                    } catch (error) {
                        console.error('Failed to update location:', error)
                        message.error('ไม่สามารถอัพเดทตำแหน่งได้')
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            console.error('User denied the request for Geolocation.')
                            message.error('กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์')
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.error('Location information is unavailable.')
                            message.error('ไม่สามารถหาตำแหน่งได้')
                            break;
                        case error.TIMEOUT:
                            console.error('The request to get user location timed out.')
                            message.error('หาตำแหน่งหมดเวลา')
                            break;
                        default:
                            console.error('An unknown error occurred.')
                            message.error('เกิดข้อผิดพลาดในการหาตำแหน่ง')
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.')
            message.error('เบราว์เซอร์ไม่รองรับการหาตำแหน่ง')
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
            {!collapsed && (
                <div className="demo-logo-vertical text-center text-white p-5 text-md">
                    โรงน้ำแข็งหลอดศรีนวล
                    {role.roleKey === 'deliver' && isTracking && (
                        <div className="text-xs text-green-400 mt-1">
                            🟢 กำลังติดตามตำแหน่ง
                        </div>
                    )}
                </div>
            )}
            <Menu
                theme="dark"
                mode="inline"
                className='mt-10 sticky'
                onClick={(item) => setMenuSelect(item.key)}
                selectedKeys={[menuSelect]}
                inlineIndent={12}
            >
                {(role.roleKey === 'admin' || role.roleKey === 'owner') && (
                    <Menu.SubMenu key="reports" icon={<BarsOutlined />} title="รายงาน">
                        <Menu.Item key="dashboard" icon={<PaperClipOutlined />}>รายงานภาพรวม</Menu.Item>
                        <Menu.Item key="dashboard/all" icon={<PaperClipOutlined />}>รายงาน</Menu.Item>
                    </Menu.SubMenu>
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
                    </>
                )}

                {role.roleKey === 'deliver' && (
                    <Menu.Item key="delivery" icon={<CarOutlined />}>การจัดส่ง</Menu.Item>
                )}

                {(role.roleKey === 'admin' || role.roleKey === 'owner' || role.roleKey === 'deliver') && (
                    <Menu.Item key="order/vip" icon={<CarOutlined />}>คำสั่งซื้อพิเศษ</Menu.Item>
                )}

                {(role.roleKey === 'admin' || role.roleKey === 'owner') && (
                    <>
                        <Menu.Item key="maps" icon={<EnvironmentOutlined />}>ติดตามตำแหน่ง</Menu.Item>
                        <Menu.Item key="money" icon={<MoneyCollectFilled />}>การเงิน</Menu.Item>
                    </>
                )}
            </Menu>
        </Sider>
    );
}

export default NavBarComponent;