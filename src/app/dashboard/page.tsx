import LayoutComponent from '@/components/Layout';
import React from 'react';
import { Card, Col, Row } from "antd";
import LongdoMap from '@/components/LongdoMap';


interface IProps {
    navBarMenu: number
}
export default function Dashboard(props: IProps) {
    return (
        <LayoutComponent >
            <div className='w-full'>
                <Row>
                    <Col span={24}>
                        <Card className='w-full'>
                            <LongdoMap width='100%' height='400px' />

                        </Card>
                    </Col>
                </Row>
                <Row className='mt-5'>
                    <Col span={4}>
                        <Card className='mt-5'>
                            test
                        </Card>
                    </Col>
                </Row>

            </div>
        </LayoutComponent>

    );
}


