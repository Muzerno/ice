import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import 'tailwindcss/tailwind.css';
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body className="">
      <AntdRegistry>{children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;