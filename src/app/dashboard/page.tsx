'use client';
import LayoutComponent from '@/components/Layout';
import { findAllDashboard } from '@/utils/dashboardService';
import { findAllTransportationLine } from '@/utils/transpotationService';
import { BankOutlined, CarOutlined, DownSquareOutlined, HomeOutlined, StockOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Modal, Select, Spin, Statistic } from "antd";
import axios from 'axios';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { useEffect, useState } from 'react';


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
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [exportType, setExportType] = useState<string>('manufacture');
    const [transportationData, setTransportationData] = useState<any>([]);
    const [selectLine, setSelectLine] = useState<any>();
    useEffect(() => {
        fetchDashboard();
        deliverLine()
    }, []);

    const fetchDashboard = async () => {
        const res = await findAllDashboard();
        setData(res);
        setIsLoading(true)

    };

    const deliverLine = async () => {
        const res = await findAllTransportationLine()
        if (res) {
            console.log(res)
            setTransportationData(res)
        }
    }

    const exportPDF = async () => {
        try {
            setOpenModalEdit(false);
            setIsLoading(false);
            const response = await axios.get('/api/exportPdf', {
                params: {
                    type: exportType,
                    date_from: dateFrom,
                    date_to: dateTo,
                    line: selectLine
                }
            });
            if (response.data.pdfPath) {
                const pdfPath = `/report.pdf`
                const link = document.createElement('a');
                link.href = pdfPath;

                link.download = 'report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setIsLoading(true);
            }
        } catch (error) {
            console.error('Failed to export PDF', error);
        }
    };

    return (
        <Spin tip="Loading..." spinning={!isLoading}>
            <LayoutComponent>
                <div>
                    <div className='flex justify-end'>
                        <Button type="primary" className=' !bg-yellow-300' onClick={() => setOpenModalEdit(true)}>Export to PDF</Button>
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

                    </div>
                </div>
                <Modal title="Export PDF" open={openModalEdit} onCancel={() => setOpenModalEdit(false)} footer={[]}>
                    <div className='flex justify-center '>
                        <div className='pr-2 text-md'>ประเภทรายงาน</div>
                        <div>
                            <Select title='Export Type' onChange={(value) => setExportType(value)} defaultValue='manufacture' style={{ width: 220 }} size='large'>
                                <Select.Option key='1' value='manufacture'>รายการผลิต</Select.Option>
                                <Select.Option key='2' value='withdraw'>รายการเบิก</Select.Option>
                                <Select.Option key='3' value='money'>รายการเงิน</Select.Option>
                                <Select.Option key='3' value='delivery'>สรุปสาย</Select.Option>
                            </Select>
                        </div>
                    </div>
                    {transportationData.length > 0 && exportType === 'delivery' &&
                        <div className='flex justify-center mt-5'>
                            <div className='pr-2 text-md'>เลือกสาย</div>
                            <div>
                                <Select title='Transportation' onChange={(value) => setSelectLine(value)} defaultValue={transportationData[0].id} style={{ width: 220 }} size='large'>
                                    {transportationData.map((item: any, index: number) => {
                                        return (
                                            <Select.Option key={index} value={item.id}>{item.line_name}</Select.Option>
                                        )
                                    })}
                                </Select>
                            </div>
                        </div>
                    }

                    <div className='flex mt-5 justify-center'>
                        <div className='pr-5'>
                            <span className='pr-2'>วันที่</span>
                            <DatePicker
                                format={'YYYY-MM-DD'}
                                onChange={(value, dateString) => {
                                    if (typeof dateString === 'string') {
                                        setDateFrom(format(new Date(dateString), 'yyyy-MM-dd'))
                                    }
                                }}
                                size='large'
                            />
                        </div>
                        <div>
                            <span className='pr-2'>ถึง</span>
                            <DatePicker
                                format={'YYYY-MM-DD'}
                                onChange={(value, dateString) => {
                                    if (typeof dateString === 'string') {
                                        setDateTo(format(new Date(dateString), 'yyyy-MM-dd'))
                                    }
                                }}
                                size='large'
                            />
                        </div>

                    </div>
                    <div className='flex justify-center mt-5' >
                        <Button disabled={!dateFrom || !dateTo} type="primary" className=' !bg-green-300' onClick={exportPDF}>Export</Button>
                    </div>
                </Modal>

            </LayoutComponent>
        </Spin>
    );
}