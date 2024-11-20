'use client';
import CarManagement from '@/components/carManagement';
import LayoutComponent from '@/components/Layout';
import Shipping from '@/components/shiping';
import Transtabs from '@/components/Transtabs';
import { Card, Col, Row, Table, Tabs, TabsProps } from 'antd';

const transportation = () => {

    const items: TabsProps['items'] = [
        { key: '1', label: 'Car Management', children: <CarManagement /> },
        { key: '2', label: 'Delivery', children: <Shipping /> },
    ];

    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>Transportation</h1>
            ]}>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </LayoutComponent>

    );
}

export default transportation;
