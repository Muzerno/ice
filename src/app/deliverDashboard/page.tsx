import LayoutComponent from '@/components/Layout';
import React from 'react';
import { Card, Col, Row } from "antd";
import { CarOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';
import LongdoMap from '@/components/LongdoMap';

const deliverDashboard = () => {
    return (
        <LayoutComponent>
            <div className='w-full'>
                <Row className='gap-1'>
                    <Col span={4}>
                        <Card className='mt-5 !bg-yellow-200 text-center'>
                            <CarOutlined className='mr-2 text-2xl ' />
                            จำนวนจุดจัดส่ง <span className='text-red-500'>20</span> จุด
                        </Card>
                    </Col>
                </Row>
                <Row className='mt-5'>
                    <Col span={24}>
                        <Card className='w-full'>
                            <LongdoMap width='100%' height='400px' isOpenButton={false} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </LayoutComponent>
    );
};

export default deliverDashboard;