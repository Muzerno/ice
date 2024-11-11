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
    handleSelectMenu: (key: string) => void
}
const NavBarComponent = (props: IProps) => {
    const { collapsed, handleSelectMenu } = props
    const param = usePathname()
    console.log(param.replace("/", ""));
    const path = param.replace("/", "");
    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical" ></div>
            <Menu
                theme="dark"
                mode="inline"
                className='mt-10'
                selectedKeys={[path ?? "dashboard"]}
                items={[
                    {
                        key: 'dashboard',
                        icon: <BarsOutlined />,
                        label: 'Dashboard',
                        onClick: () => { handleSelectMenu('dashboard') }
                    },

                    {
                        key: 'transportation',
                        icon: <CarOutlined />,
                        label: 'Transportation',
                        onClick: () => (handleSelectMenu('transportation'))

                    },
                    {
                        key: 'product',
                        icon: <BoxPlotOutlined />,
                        label: 'Product',
                        onClick: () => (handleSelectMenu('product'))
                    },
                    {
                        key: 'userManagement',
                        icon: <UserOutlined />,
                        label: 'User Management',
                        onClick: () => { handleSelectMenu('userManagement') }
                    },
                ]}
            />
        </Sider>
    );
}

export default NavBarComponent;
