'use client';
import React, { useEffect, useState } from 'react';
import { Card, Col, Progress, Row, Spin, Statistic, Table, Button } from "antd";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { ArrowUpOutlined, BankOutlined, BoxPlotOutlined, CarOutlined, DownSquareOutlined, HomeOutlined, MoneyCollectFilled, MoneyCollectOutlined, StockOutlined, TeamOutlined } from '@ant-design/icons';
import { findAllDashboard, getLocationCar } from '@/utils/dashboardService';

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
    const [carLocation, setCarLocation] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDashboard();
        fetchCarLocation();
    }, []);

    const fetchDashboard = async () => {
        const res = await findAllDashboard();
        setData(res);
    };

    const fetchCarLocation = async () => {
        const res = await getLocationCar();
        if (res) {
            setCarLocation(res);
        }
        setIsLoading(true);
    };

    const exportPDF = () => {
        const input = document.getElementById('dashboard-content');
        if (input) {
            html2canvas(input, { useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 295; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save("dashboard.pdf");
            });
        }
    };

    if (!isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <h1>กําลังโหลดข้อมูล...</h1>
            </div>
        );
    }

    return (
        <Spin tip="Loading..." spinning={!isLoading}>
            <LayoutComponent>
                <div>
                    <div className='flex justify-end'>
                        <Button type="primary" className=' !bg-yellow-300' onClick={exportPDF}>Export to PDF</Button>
                    </div>
                    <div className='w-full' id="dashboard-content">
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
                                <LongdoMap width='100%' height='400px' isOpenButton={false} carLocation={carLocation} />
                            </Card>
                        </div>
                    </div>
                </div>


            </LayoutComponent>
        </Spin>
    );
}