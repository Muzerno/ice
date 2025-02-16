'use client';
import LayoutComponent from '@/components/Layout';
import React, { useEffect, useState } from 'react';
import { Card, Col, Progress, Row, Statistic, Table } from "antd";
import LongdoMap from '@/components/LongdoMap';
import { ArrowUpOutlined, BankOutlined, BoxPlotOutlined, CarOutlined, DownSquareOutlined, HomeOutlined, MoneyCollectFilled, MoneyCollectOutlined, StockOutlined, TeamOutlined } from '@ant-design/icons';
import { findAllDashboard } from '@/utils/dashboardService';

interface IProps {
    navBarMenu: number;
}

interface DashboardData {
    countUser: number;
    countProduct: number;
    countCustomer: number;
    totalSell: string;
    countManufactureDetail: number;
    countSuccessDelivery: number;
    countCancelDelivery: number;
}

export default function Dashboard(props: IProps) {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        const res = await findAllDashboard();
        setData(res);
    };

    return (
        <LayoutComponent>
            <div className='w-full'>
                <div className='flex flex-row justify-center'>
                    <div className='w-1/2'>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนรถ"
                                    value={data?.countProduct || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<CarOutlined />}
                                    suffix="คัน"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนร้านค้า"
                                    value={data?.countCustomer || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<HomeOutlined />}
                                    suffix="ร้าน"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนผู้ใช้งาน"
                                    value={data?.countUser || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<TeamOutlined />}
                                    suffix="รหัส"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนการเบิก"
                                    value={data?.countManufactureDetail || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<BankOutlined />}
                                    suffix="รายการ"
                                />
                            </Card>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="ยอดขายวันนี้"
                                    value={data?.totalSell || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<BankOutlined />}
                                    suffix="บาท"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนการผลิตต่อวัน"
                                    value={data?.countManufactureDetail || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<HomeOutlined />}
                                    suffix="รายการ"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนการส่ง"
                                    value={data?.countSuccessDelivery || 0}

                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<StockOutlined />}
                                    suffix="ออเดอร์"
                                />
                            </Card>
                        </div>
                        <div className='m-2'>
                            <Card>
                                <Statistic
                                    title="จำนวนการยกเลิก"
                                    value={data?.countCancelDelivery || 0}

                                    valueStyle={{ color: 'red' }}
                                    prefix={<DownSquareOutlined />}
                                    suffix="ออเดอร์"
                                />
                            </Card>
                        </div>
                    </div>
                </div>
                <div className='mt-1 w-full'>
                    <Card className='w-full' title="ตำแหน่งรถ">
                        <LongdoMap width='100%' height='400px' isOpenButton={false} />
                    </Card>
                </div>
            </div>
        </LayoutComponent>
    );
}