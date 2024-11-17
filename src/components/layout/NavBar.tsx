import {
    BarsOutlined,
    BoxPlotOutlined,
    CarOutlined,
    UserOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { usePathname } from 'next/navigation';
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
                    {
                        key: 'dashboard',
                        icon: <BarsOutlined />,
                        label: 'Dashboard',

                    },

                    {
                        key: 'transportation',
                        icon: <CarOutlined />,
                        label: 'Transportation',


                    },
                    {
                        key: 'product',
                        icon: <BoxPlotOutlined />,
                        label: 'Product',

                    },
                    {
                        key: 'userManagement',
                        icon: <UserOutlined />,
                        label: 'User Management',

                    },
                ]}
            />
        </Sider>
    );
}

export default NavBarComponent;
