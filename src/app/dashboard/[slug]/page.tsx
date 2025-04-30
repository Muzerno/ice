'use client'
import { getExportData } from '@/utils/dashboardService';
import { findAllTransportationLine } from '@/utils/transpotationService';
import { Table, Select, DatePicker, Avatar, Divider, Button, Spin } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import './page.css'; // เพิ่มไฟล์ CSS สำหรับปรับแต่ง

import React, { useEffect, useState } from 'react';

const Page = () => {

    const router = useRouter();
    const [exportType, setExportType] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [exportData, setExportData] = useState<any>([]);
    const [exportData2, setExportData2] = useState<any>([]);
    const [total, setTotal] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [messageApi, contextHolder] = useMessage();
    const [transportationData, setTransportationData] = useState<any[]>([]);
    const [selectLine, setSelectLine] = useState<string | null>(null);
    const params = useParams();
    const slug = params ? String(params.slug) : '';
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [unit, setUnit] = useState('');


    useEffect(() => {
        let type = '';
        let unit = '';

        switch (slug) {
            case 'manufacture':
                type = 'manufacture';
                unit = 'รายการ';
                break;
            case 'withdraw':
                type = 'withdraw';
                unit = 'รายการ';
                break;
            case 'money':
                type = 'money';
                unit = 'บาท';
                break;
            case 'delivery':
                type = 'delivery';
                unit = 'รายการ';
                break;
            default:
                type = '';
                unit = '';
        }

        setExportType(type);
        setUnit(unit);
    }, [slug]);

    useEffect(() => {
        deliverLine()
    }, [exportType]);

    const deliverLine = async () => {
        const res = await findAllTransportationLine()
        if (res) {
            setTransportationData(res)
        }
    }

    const getExport = async () => {
        const response = await getExportData(dateFrom, dateTo, exportType, selectLine)

        if (response.length > 0) {
            let rowData: any[] = [];
            let total: number = 0;
            if (exportType === "withdraw") {
                // Group data by line_name and date_time
                const groupedData = response.reduce((acc: any, item: any) => {
                    const key = `${item.transportation_car.Lines[0].line_name}-${format(new Date(item.date_time), 'dd/MM/yyyy')}`;
                    if (!acc[key]) {
                        acc[key] = {
                            line_name: item.transportation_car.Lines[0].line_name,
                            date_time: format(new Date(item.date_time), 'dd/MM/yyyy'),
                            car_number: item.transportation_car.car_number,
                            amount: 0,
                            withdraw_details: [],
                            items: []
                        };
                    }
                    const totalWithdrawAmount = item.withdraw_details.reduce((sum: number, detail: any) => sum + detail.amount, 0);
                    acc[key].amount += totalWithdrawAmount;
                    acc[key].items.push(item);

                    acc[key].withdraw_details.push(...item.withdraw_details);
                    return acc;
                }, {});

                // Convert grouped data to array
                rowData = Object.values(groupedData).map((group: any, index: number) => ({
                    index: index + 1,
                    line_name: group.line_name,
                    date_time: group.date_time,
                    amount: group.amount,
                    items: group.items,
                    car_number: group.car_number,
                    withdraw_details: group.withdraw_details
                }));

                // Calculate total amount
                total = rowData.reduce((sum: number, group: any) => sum + group.amount, 0);

                // คำนวณผลรวมของ "รายการสินค้า/ถุง"
                const totalItems = rowData.reduce((sum: number, group: any) => {
                    return sum + group.withdraw_details.reduce((itemSum: number, detail: any) => itemSum + detail.amount, 0);
                }, 0);

                console.log("Total Items:", totalItems); // ตรวจสอบค่าใน console
                setExportData(rowData);
                setTotal(total);
                setTotalAmount(totalItems); // เก็บค่า totalItems ใน state
            }
            else if (exportType === "delivery") {
                const groupedData = response.reduce((acc: any, item: any) => {
                    const lineName = item?.line?.line_name || item?.car?.car_number;
                    const customerName = item?.customer?.name || item?.customer_order?.name;

                    if (!acc[lineName]) {
                        acc[lineName] = {
                            line_name: lineName,
                            customers: new Set(),
                        };
                    }
                    if (customerName) {
                        acc[lineName].customers.add(customerName);
                    }
                    return acc;
                }, {});

                // แปลงข้อมูลที่จัดกลุ่มแล้วเป็น array
                rowData = Object.values(groupedData).map((group: any, index: number) => ({
                    index: index + 1,
                    line_name: group.line_name,
                    customers: Array.from(group.customers as Set<string>).map((name: string, index: number) => ({ index: index + 1, customer_name: name })),
                }));

                // คำนวณจำนวน customer ทั้งหมด
                total = rowData.reduce((sum: number, group: any) => sum + group.customers.length, 0);
                console.log(rowData)
                setExportData(rowData)
                setTotal(total)
            }
            else if (exportType === "money") {
                const groupedData = response.reduce((acc: any, item: any) => {
                    const lineName = item?.delivery?.car?.Lines[0]?.line_name;
                    const date = format(new Date(item.date_time), 'dd/MM/yyyy');
                    const key = `${lineName}-${date}`;

                    if (!acc[key]) {
                        acc[key] = {
                            line_name: lineName,
                            date: date,
                            ice_details: {},
                            total_amount: 0
                        };
                    }

                    // รวมข้อมูลน้ำแข็งแต่ละประเภท
                    item.delivery.delivery_details.forEach((detail: any) => {
                        const productId = detail.product.id;
                        if (!acc[key].ice_details[productId]) {
                            acc[key].ice_details[productId] = {
                                name: detail.product.name,
                                amount: 0,
                                price: detail.price,
                                total: 0
                            };
                        }
                        acc[key].ice_details[productId].amount += detail.amount;
                        acc[key].ice_details[productId].total = acc[key].ice_details[productId].amount * detail.price;
                    });

                    acc[key].total_amount += item.amount;
                    return acc;
                }, {});

                // แปลงข้อมูลที่จัดกลุ่มแล้วเป็น array
                rowData = Object.values(groupedData).map((group: any, index: number) => ({
                    index: index + 1,
                    date: group.date,
                    line_name: group.line_name,
                    ice_list: Object.values(group.ice_details).map((ice: any, iceIndex: number) => ({
                        index: iceIndex + 1,
                        indexs: index + 1,
                        name: ice.name,
                        amount: ice.amount,
                        price: ice.price,
                        total: ice.total
                    })),
                    total_amount: group.total_amount
                }));

                // คำนวณยอดรวมทั้งหม
                total = rowData.reduce((sum: number, group: any) => sum + group.total_amount, 0);
                setExportData(rowData)
                setTotal(total)
            } else if (exportType === "manufacture") {
                // Group by date first
                const groupedByDate = response.reduce((acc: any, item: any) => {
                    const dateOnly = format(new Date(item.date_time), 'dd/MM/yyyy');
                    if (!acc[dateOnly]) {
                        acc[dateOnly] = {
                            products: {},
                            manufacture_amount_total: 0
                        };
                    }

                    const productId = item.products.id;
                    if (!acc[dateOnly].products[productId]) {
                        acc[dateOnly].products[productId] = {
                            ...item.products,
                            manufacture_amount: 0
                        };
                    }
                    acc[dateOnly].products[productId].manufacture_amount += item.manufacture_amount;
                    acc[dateOnly].manufacture_amount_total += item.manufacture_amount;
                    return acc;
                }, {});

                // Convert to final format with index starting from 1 for each date
                rowData = Object.entries(groupedByDate).map(([date, data]: [string, any]) => {
                    let dateIndex = 1;
                    const productsWithIndex = Object.values(data.products).map((product: any) => ({
                        index: dateIndex++,
                        ...product
                    }));

                    return {
                        date_time: date,
                        manufacture_amount_total: data.manufacture_amount_total,
                        products: productsWithIndex
                    };
                });

                const groupedData = response.reduce((acc: any, item: any) => {
                    const productName = item.products.name;
                    if (!acc[productName]) {
                        acc[productName] = {
                            product_name: productName,
                            manufacture_amount: 0,
                            items: []
                        };
                    }
                    acc[productName].manufacture_amount += item.manufacture_amount;
                    acc[productName].items.push(item);
                    return acc;
                }, {});

                // // Convert grouped data to array
                const rowData2 = Object.values(groupedData).map((group: any, index: number) => ({
                    index: index + 1,
                    product_name: group.product_name,
                    manufacture_amount: group.manufacture_amount,
                    items: group.items
                }));

                total = rowData2.reduce((sum: number, group: any) => sum + group.manufacture_amount, 0);
                console.log(rowData)
                setExportData(rowData)
                setTotal(total)
            }
        } else {
            messageApi.error('ไม่พบข้อมูล')
        }
    }


    const columnsManufacture = [
        {
            title: 'ลําดับ',
            dataIndex: '',
            key: '',
            render: (item: any, index: number, idx: number) => {
                return idx + 1
            }
        },
        {
            title: 'วันที่',
            dataIndex: 'date_time',
            key: 'date_time',
            render: (item: any) => {
                return item
            }
        },
        {
            title: 'ชื่อน้ำแข็ง / ถุง  ',
            dataIndex: 'products',
            key: 'name',
            render: (item: any) => {
                return item.map((item: any) => {
                    return <div key={item.index}>{item.name} x {item.manufacture_amount}</div>
                })
            }
        },
        {
            title: 'จำนวนรวม',
            dataIndex: 'manufacture_amount_total',
            key: 'manufacture_amount_total',
        },

    ]

    const columnsWithdraw = [
        {
            title: 'ลําดับ',
            dataIndex: '',
            key: '',
            render: (item: any, index: number, idx: number) => {
                return idx + 1
            }
        },
        {
            title: 'วันที่',
            dataIndex: 'date_time',
            key: 'date_time',
            render: (item: any) => {
                return item
            }
        },
        {
            title: 'ชื่อน้ำแข็ง / ถุง  ',
            dataIndex: 'items',
            key: 'name',
            render: (items: any) => {
                return items.map((item: any) => {
                    const withdrawDetails = item.withdraw_details.map((item: any) => {
                        return <div key={item.index}>{item.product.name} x {item.amount}</div>
                    })
                    console.log(withdrawDetails)
                    return <div key={item.index}>{item.car_number} {withdrawDetails}</div>
                })
            }
        },
        {
            title: 'จำนวนรวม',
            dataIndex: 'amount',
            key: 'amount',
            render: (_: any, record: any) => {
                // คำนวณจำนวนรวมจาก withdraw_details
                const totalAmount = record.withdraw_details.reduce((sum: number, detail: any) => sum + detail.amount, 0);
                return <div>{totalAmount}</div>;
            },
        }
    ]

    const columnsMoney = [
        {
            title: 'ลําดับ',
            dataIndex: 'indexs',
            key: 'indexs',
            render: (item: any, index: number, idx: number) => {
                return idx + 1
            }
        },
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'ชื่อสาย',
            dataIndex: 'line_name',
            key: 'line_name'
        },
        {
            title: 'รายละเอียด',
            dataIndex: 'ice_list',
            key: 'ice_list',
            render: (items: any[]) => {
                return items.map((item: any) => (
                    <div key={item.index}>
                        {item.name} x {item.amount} = {item.total} บาท
                    </div>
                ))
            }
        },
        {
            title: 'จำนวนเงินรวม',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (item: any) => {
                return `${item} บาท`
            }
        }
    ]

    const columnsDelivery = [
        {
            title: 'ลําดับ',
            dataIndex: '',
            key: '',
            render: (item: any, index: number, idx: number) => {
                return idx + 1
            }
        },
        {
            title: 'ชื่อสายรถ',
            dataIndex: 'line_name',
            key: 'line_name',
        },
        {
            title: 'ชื่อลูกค้า',
            dataIndex: 'customers',
            key: 'customers',
            render: (item: any) => {
                return item.map((item: any, indexs: number) => {
                    return <div key={indexs}> {indexs + 1}. {item.customer_name}</div>
                })
            }
        }

    ]

    const exportPDF = async () => {
        try {
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
                window.open(pdfPath, '_blank');
            }
        } catch (error) {
            console.error('Failed to export PDF', error);
        }
    };

    return (
        <Spin tip="Loading..." spinning={!isLoading}>
            <div>
                {contextHolder}
                <div className='flex justify-start mt-10 items-center'>
                    <div>
                        <Avatar src={'/logo.jpg'} alt='logo' size={150} />
                    </div>
                    <div className='text-sm text-start'>
                        ห้างหุ้นส่วนจำกัด โรงน้ำแข็งหลอดศรีนวล<br />
                        310 หมู่ 4, ถนนทางหลวงชนบท, ตำบลเมืองเก่า อำเภอเมืองขอนแก่น<br />
                        จังหวัดขอนแก่น 40000, Thailand โทร 043-222-300
                    </div>
                </div>
                <Divider />
                <div className='flex justify-center text-2xl font-bold'>
                    <div>
                        <h1>{exportType === "manufacture" ? "รายงานการผลิต" : exportType === "withdraw" ? "รายงานการเบิก" : exportType === "money" ? "รายงานการเงิน" : "รายงานการจัดสายรถ"}</h1>
                    </div>

                </div>
                <div className='flex justify-center mt-[20px]'>
                    {transportationData.length > 0 && (exportType === 'delivery' || exportType === "withdraw" || exportType === "money") &&
                        <div className='flex justify-center mt-5 items-center'>
                            <div className='pr-2 text-md'>เลือกสาย</div>
                            <div>
                                <Select title='Transportation' onChange={(value) => setSelectLine(value)} defaultValue={null} style={{ width: 220 }} size='large'>
                                    <Select.Option key='0' value={null}>เลือกทั้งหมด</Select.Option>
                                    {transportationData.map((item: any, index: number) => {
                                        return (
                                            <Select.Option key={index} value={item.id}>{item.line_name}</Select.Option>
                                        )
                                    })}
                                </Select>
                            </div>
                        </div>
                    }
                    <div className='flex mt-5 justify-center ml-5'>
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
                        <div className='flex justify-center items-center ml-5'>
                            <Button size='large' type='primary' onClick={getExport}>ดูรายงาน</Button>
                            <Button size='large' type='primary' style={{ backgroundColor: 'red', marginLeft: '10px' }} onClick={exportPDF}>ดาวน์โหลด PDF</Button>
                        </div>
                    </div>
                </div>
                <div className='mt-5 p-5 overflow-y-auto'>
                    {exportType === "manufacture" && (
                        <Table
                            className="custom-table"
                            style={{ width: '100%' }}
                            dataSource={exportData}
                            columns={columnsManufacture}
                            pagination={false}
                        />
                    )}
                    {exportType === "withdraw" && (
                        <Table
                            className="custom-table"
                            style={{ width: '100%' }}
                            dataSource={exportData}
                            columns={columnsWithdraw}
                            pagination={false}
                        />
                    )}
                    {exportType === "money" && (
                        <Table
                            className="custom-table"
                            style={{ width: '100%' }}
                            dataSource={exportData}
                            columns={columnsMoney}
                            pagination={false}
                        />
                    )}
                    {exportType === "delivery" && (
                        <Table
                            className="custom-table"
                            style={{ width: '100%' }}
                            dataSource={exportData}
                            columns={columnsDelivery}
                            pagination={false}
                        />
                    )}
                </div>
                <div className='flex justify-end mt-5 p-5'>
                    <div className='text-sm text-start'>รวมทั้งหมด: </div>
                    <div className='text-sm text-start'>{total} {unit}</div>
                </div>
                <div className='flex justify-center mt-5 p-5'>
                    <Button size='large' type='primary' style={{ backgroundColor: 'lightblue' }} onClick={() => router.back()}>ย้อนกลับ</Button>
                </div>
            </div>
        </Spin>
    );
}

export default Page;
