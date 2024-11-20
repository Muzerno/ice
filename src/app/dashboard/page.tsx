import LayoutComponent from '@/components/Layout';
import React from 'react';
import { Card, Col, Row } from "antd";
import LongdoMap from '@/components/LongdoMap';
import { CarOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';


interface IProps {
    navBarMenu: number
}
export default function Dashboard(props: IProps) {
    return (
        <LayoutComponent >
            <div className='w-full'>
                <Row className=' gap-1'>
                    <Col span={4}>
                        <Card className='mt-5 !bg-yellow-200 text-center'>
                            <CarOutlined className='mr-2 text-2xl ' />
                            จำนวนรถ <span className='text-red-500'>20</span> คัน
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card className='mt-5 !bg-blue-200 text-end'>
                            <HomeOutlined className='mr-2 text-2xl ' />
                            จำนวนร้าน <span className='text-red-500'>20</span> ร้าน
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card className='mt-5 !bg-green-200 text-end'>
                            <TeamOutlined className='mr-2 text-2xl ' />
                            ผู้ใช้ในระบบ <span className='text-red-500'>20</span> รหัส
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
}


