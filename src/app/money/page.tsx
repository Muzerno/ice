'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { moneyPage } from '@/utils/dashboardService';
// import { createMoneyOrder, findAllMoneyOrders, updateMoneyOrder, deleteMoneyOrder } from '@/utils/moneyOrderService';
// import { findAllMoneyProducts } from '@/utils/moneyProductService';
import { Button, Card, Form, Input, message, Popconfirm, Select, Table } from 'antd';
import { format } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';

const MoneyOrderPage = () => {
    const { userLogin } = useContext(UserContext);
    const [data, setData] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchMoneyOrders();
    }, []);

    const fetchMoneyOrders = async () => {
        const res = await moneyPage();
        if (res) {
            setData(res);
        }
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
            title: 'วันที่',
            dataIndex: 'date_time',
            key: 'date_time',
            render: (item: any) => format(new Date(item), 'yyyy-MM-dd')

        },
    ];

    return (
        <LayoutComponent>
            <Card>

                <Table
                    dataSource={data}
                    columns={column}
                />
            </Card>
        </LayoutComponent>
    );
};

export default MoneyOrderPage;

