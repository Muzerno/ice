import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import 'tailwindcss/tailwind.css';
import { UserProvider } from '@/context/userContext';


const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en" >
    <head> <script src={`https://api.longdo.com/map/?key=${process.env.MAP_API_KEY}`}></script></head>
    <body className="">
      <UserProvider>
        <AntdRegistry>{children}</AntdRegistry>
      </UserProvider>
    </body>
  </html>
);

export default RootLayout;