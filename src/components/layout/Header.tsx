import { Button, Layout, theme, Typography } from 'antd';
import React, { useContext } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';
import Link from 'next/link';

const { Header } = Layout;
const { Text } = Typography;

const HeaderDefault = (props) => {
  const router = useRouter();
  const { userLogin } = useContext(UserContext);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { collapsed, setCollapsed } = props;

  // Blue theme colors
  const primaryBlue = '#1890ff';
  const darkBlue = '#0050b3';
  const lightBlue = '#e6f7ff';
  const navyBlue = '#003a8c';

  return (
    <Header 
      style={{ 
        padding: 0, 
        background: 'linear-gradient(to right, #1e3c72, #2a5298)',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <Button
        type="text"
        icon={collapsed ? 
          <MenuUnfoldOutlined style={{ color: '#fff' }} /> : 
          <MenuFoldOutlined style={{ color: '#fff' }} />
        }
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
          color: '#fff'
        }}
      />
      
      <div className='float-right flex items-center mr-4 justify-center mt-3'>
        <div 
          className='text-lg mr-5' 
          style={{ 
            border: "1px solid #91d5ff", 
            borderRadius: "5px", 
            padding: "5px 10px", 
            background: "#e6f7ff", 
            color: "#0050b3",
            fontWeight: "500"
          }}
        >
          {userLogin?.user?.role?.role_name}
        </div>
        
        <div 
          className='text-lg mr-5 flex items-center' 
          style={{ 
            border: "1px solid #91d5ff", 
            borderRadius: "5px", 
            padding: "5px 10px", 
            background: "#f0f5ff",
            color: "#0050b3"
          }}
        >
          <UserOutlined style={{ marginRight: '8px' }} /> 
          {userLogin?.user?.firstname} {userLogin?.user?.lastname}
        </div>
        
        <Button 
          type="primary" 
          icon={<LogoutOutlined />}
          style={{ 
            background: "#f5222d", 
            borderColor: "#f5222d",
            boxShadow: "0 2px 0 rgba(0,0,0,0.045)"
          }}
          onClick={() => {
            localStorage.removeItem('payload');
            router.push('/auth/login');
          }}
        >
          ออกจากระบบ
        </Button>
      </div>
    </Header>
  );
}

export default HeaderDefault;