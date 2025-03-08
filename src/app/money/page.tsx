'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { moneyPage } from '@/utils/dashboardService';
import { Button, Card, DatePicker, Modal, Table } from 'antd';
import { format } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

const MoneyOrderPage = () => {
    const { userLogin } = useContext(UserContext);
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deliveryDetail, setDeliveryDetail] = useState<any[]>([]);
    const [date, setDate] = useState<string | any>(format(new Date(), 'yyyy-MM-dd'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMoneyOrders();
    }, [date]);

    const fetchMoneyOrders = async () => {

        const res = await moneyPage(date);
        if (res) {
            setData(res);

        }
        setIsLoading(false);
    };



    const handelModal = (item: any) => {
        const arrayData = []
        for (const data of item.delivery) {
            if (data.delivery_details.length !== 0) {
                arrayData.push(data)
            }

        }
        setDeliveryDetail(arrayData);
        setIsModalOpen(!isModalOpen);
    };

    const column = [
        {
            title: 'สายการเดินรถ',
            dataIndex: 'line_name',
            key: 'line_name',
        },
        {
            title: 'จำนวนเงิน (บาท)',
            dataIndex: 'total',
            key: 'total',
        },
        {
            title: "รายละเอียด",
            key: "action",
            render: (item: any, record: any) => (
                <Button type='primary' onClick={() => handelModal(record)}>ดูรายละเอียด</Button>
            )
        }
    ];

    const columnDetail = [
        {
            title: "ชื่อลูกค้า",
            dataIndex: "",
            key: " customer_name",
            render: (item: any) => {
                let customer_name = "";
                for (const i of item.delivery_details) {
                    customer_name = i.dropoffpoint.customer.name

                }
                return customer_name
            }
        },
        {
            title: "รายการสินค้า",
            dataIndex: "",
            key: "product_name",
            render: (item: any) => {
                console.log(item)
                let element = "";
                for (const i of item.delivery_details) {
                    element += `<div>${i.product.name} ${i.amount} ถุง </div>`;
                }
                return <div dangerouslySetInnerHTML={{ __html: element }} />;
            }
        },
        {
            title: "จํานวนเงิน (บาท)",
            dataIndex: "",
            key: "total",
            render: (item: any) => {
                let total = 0;
                for (const i of item.delivery_details) {
                    total += (i.price * i.amount)
                }
                return total
            }

        }
    ];

    return (
        <LayoutComponent>
            <Card>
                <DatePicker multiple={false} onChange={(e, dateString) => setDate(dateString)} format={"YYYY-MM-DD"} size='large' defaultValue={dayjs(new Date())} className='float-right pb-2' />
                {!isLoading && data.length > 0 ? (
                    <Table
                        className='pt-2'
                        dataSource={data}
                        columns={column}
                    />
                ) : (
                    <div className='pt-2 text-center'>ไม่มีข้อมูล</div>
                )}
            </Card>
            <Modal
                title="รายละเอียดการชําระเงิน"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[]}

            >
                {deliveryDetail.length > 0 ? (
                    <Table
                        dataSource={deliveryDetail}
                        columns={columnDetail}
                        pagination={false}
                    />
                ) : (
                    <div className='text-center'>ไม่มีข้อมูล</div>
                )}
            </Modal>
        </LayoutComponent>
    );
};

export default MoneyOrderPage;