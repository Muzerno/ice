'use client';
import LayoutComponent from '@/components/Layout';
import Shipping from '@/components/shiping';
import { Card, Tabs } from 'antd';
import React from 'react';

const Page = () => {
    return (
        <LayoutComponent>
            {/* <Card className='w-full h-fit'> */}

            <Tabs defaultActiveKey="1" items={[{ key: '1', label: 'จัดการข้อมูลการขนส่ง', children: <Shipping /> }]} />

            {/* </Card> */}

        </LayoutComponent>
    );
}

export default Page;
