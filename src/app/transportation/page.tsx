'use client';
import CarManagement from '@/components/carManagement';
import LayoutComponent from '@/components/Layout';
import Shipping from '@/components/shiping';
import Transtabs from '@/components/Transtabs';
import { Card, Col, Row, Table, Tabs, TabsProps } from 'antd';

const transportation = () => {



    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>จัดการข้อมูลรถ</h1>
            ]}>
                <CarManagement />
            </Card>
        </LayoutComponent>

    );
}

export default transportation;
