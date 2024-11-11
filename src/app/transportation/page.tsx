'use client';
import LayoutComponent from '@/components/Layout';
import Transtabs from '@/components/Transtabs';
import { Button, Card, Col, Form, Input, Row, Table, Tabs, TabsProps } from 'antd';
import React from 'react';

const transportation = () => {

    const columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    }]
    const items: TabsProps['items'] = [
        { key: '1', label: 'Car', children: <Transtabs /> },
        { key: '2', label: 'Tab 2', children: 'Content of Tab Pane 2' },
        { key: '3', label: 'Tab 3', children: 'Content of Tab Pane 3' },
    ];

    return (
        <LayoutComponent>
            <Card className="w-full" title={[
                <h1>Transportation</h1>
            ]}>
                <Row className='w-full  '>
                    <Col span={18} className='pr-2'>
                        <Card className='w-full !bg-slate-100'>
                            <Row>
                                <Col span={24}>
                                    <Table columns={columns} className='h-[300px]' >
                                    </Table>
                                </Col>
                            </Row>
                            <Row className='mt-5'>
                                <Col span={24}>
                                    <Table columns={columns} className='h-[300px]'>
                                    </Table>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Tabs defaultActiveKey="1" items={items} />



                    </Col>


                </Row>

            </Card>
        </LayoutComponent>

    );
}

export default transportation;
