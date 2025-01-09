import LayoutComponent from '@/components/Layout';
import React from 'react';
import { Card, Col, Progress, Row, Table } from "antd";
import LongdoMap from '@/components/LongdoMap';
import { CarOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';


interface IProps {
    navBarMenu: number
}
export default function Dashboard(props: IProps) {
    return (
        <LayoutComponent >
            <div className='w-full'>
                <div className='flex flex-row justify-between'>
                    <div className='w-1/3 h-screen'>
                        <div>
                            <Card className='mt-5 !bg-yellow-200 text-center '>
                                <CarOutlined className='mr-2 text-2xl ' />
                                จำนวนรถ <span className='text-red-500'>20</span> คัน
                                {/* <Progress percent={30} type='circle' /> */}
                            </Card>
                        </div>

                        <div className='mt-2'>
                            <Card className='mt-5 !bg-gray-200 text-start '>
                                {/* <CarOutlined className='mr-2 text-2xl ' /> */}
                                รายการสินค้า <span className='text-red-500'>20</span> คัน
                                {/* <Progress percent={30} type='circle' /> */}
                                <Table columns={[]} />
                            </Card>
                        </div>
                    </div>
                    <div className='w-1/3'>
                        <Card className='mt-5 !bg-blue-200 text-center '>
                            <HomeOutlined className='mr-2 text-2xl ' />
                            จำนวนร้าน <span className='text-red-500'>20</span> ร้าน
                        </Card>
                    </div>
                    <div className='w-1/3'>
                        <Card className='mt-5 !bg-green-200 text-center '>
                            <TeamOutlined className='mr-2 text-2xl ' />
                            ผู้ใช้ในระบบ <span className='text-red-500'>20</span> รหัส
                        </Card>
                    </div>
                </div>
                {/* <Row className='mt-5'>
                    <Col span={24}>
                        <Card className='w-full'>
                            <LongdoMap width='100%' height='400px' isOpenButton={false} />
                        </Card>
                    </Col>
                </Row> */}


            </div>
        </LayoutComponent>

    );
}


