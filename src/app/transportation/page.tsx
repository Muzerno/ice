'use client';
import CarManagement from '@/components/carManagement';
import LayoutComponent from '@/components/Layout';
import Shipping from '@/components/shiping';
import Transtabs from '@/components/Transtabs';
import { Card, Col, Row, Table, Tabs, TabsProps } from 'antd';

const transportation = () => {

    const items: TabsProps['items'] = [
        { key: '1', label: 'จัดการข้อมูลรถ', children: <CarManagement /> },
        { key: '2', label: 'จัดการข้อมูลการขนส่ง', children: <Shipping /> },
    ];

    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>จัดการข้อมูลการขนส่ง</h1>
            ]}>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </LayoutComponent>

    );
}

export default transportation;
