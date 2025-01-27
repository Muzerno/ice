'use client'
import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { UserContext } from '@/context/userContext';
import { getDeliveryByCarId, updateDaliveryStatus } from '@/utils/transpotationService';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, message, Popconfirm, Table } from 'antd';
import { title } from 'process';
import { use, useContext, useEffect, useState } from 'react';

const DeliveryPage = () => {

    const [dropDayly, setDropDayly] = useState<any>([]);
    const [data, setData] = useState<any>([]);
    const [dropOrder, setDropOrder] = useState<any>([]);
    const [dataInMap, setDataInMap] = useState<any>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const { userLogin } = useContext(UserContext);

    useEffect(() => {
        fetchDataDelivery();
    }, []);
    const fetchDataDelivery = async () => {
        const res = await getDeliveryByCarId(userLogin?.user?.transportation_car?.id);
        if (res) {
            setDropDayly(res.drop_dayly)
            setDropOrder(res.drop_order)
            setData(res)
        }
    }

    useEffect(() => {
        if (data) {

            const dataMerge: any = [];
            if (Array.isArray(data.drop_dayly)) {
                data.drop_dayly.forEach((item: any) => {
                    dataMerge.push(item);
                });
            }

            if (Array.isArray(data.drop_order)) {
                data.drop_order.forEach((item: any) => {
                    dataMerge.push(item);
                });
            }

            const dataShowInMap = dataMerge.filter((item: any) => item.drop_status === "inprogress" || item.drop_status === "inprocess");
            setDataInMap(dataShowInMap);
        } else {
            console.error('Data is not provided or invalid:', data);
        }
    }, [data]);
    const handleSuccess = async (id: number) => {
        const res = await updateDaliveryStatus(id, { status: "success" });
        if (res) {
            fetchDataDelivery();
            messageApi.success("บันทึกสําเร็จ");
        }
    }

    const handleFail = async (id: number) => {
        const res = await updateDaliveryStatus(id, { status: "cancel" });
        if (res) {
            fetchDataDelivery();
            messageApi.success("บันทึกสําเร็จ");
        }
    }
    const columnDropDayly = [
        {
            title: 'ชื่อลูกค้า',
            dataIndex: 'customer',
            key: 'customer',
            render: (item: any) => item?.name,
        },
        {
            title: 'เบอร์โทรศัพท์',
            dataIndex: 'customer',
            key: 'customer',
            render: (item: any) => item?.telephone,
        },
        {
            title: 'ที่อยู่',
            dataIndex: 'customer',
            key: 'customer',
            render: (item: any) => {
                // return item.address
                const parsedAddress = JSON.parse(item.address);
                return (
                    <div>
                        {parsedAddress.road ? parsedAddress.road : ''} {parsedAddress.subdistrict} {parsedAddress.district} {parsedAddress.province} {parsedAddress.country} {parsedAddress.postcode}
                    </div>
                )
            }
        },
        {
            title: 'สถานะการจัดส่ง',
            dataIndex: 'drop_status',
            key: 'drop_status',
            render: (item: any) => {
                if (item === "inprocess" || item === "inprogress") {
                    return <span className='text-orange-300'>กําลังจัดส่ง</span>
                }
                if (item === "success") {
                    return <span className='text-green-400'>สําเร็จ</span>
                }
                if (item === "cancel") {
                    return <span className='text-red-400'>ยกเลิก</span>
                }
            }
        },
        {
            title: "อัพเดตสถานะ",
            key: "action",
            render: (item: any) => (
                <div>
                    <Popconfirm onConfirm={() => handleSuccess(item.id)} title="ยืนยันการจัดส่ง" description="แน่ใจหรือไม่">
                        <Button type='primary' icon={<CheckOutlined className='text-green-400' />}></Button>
                    </Popconfirm>
                    <Popconfirm onConfirm={() => handleFail(item.id)} title="ยกเลิกการจัดส่ง" description="แน่ใจหรือไม่">
                        <Button type='primary' danger className='ml-2' icon={<CloseOutlined className='text-red-400' />}></Button>
                    </Popconfirm>
                </div>
            )
        }
    ]

    return (
        <LayoutComponent>
            <div>
                {contextHolder}
                <div>
                    <Card>
                        <LongdoMap customerLocation={dataInMap} />
                    </Card>
                </div>
                <div className='mt-5'>
                    <Table columns={columnDropDayly} dataSource={dropDayly} pagination={{ pageSize: 5 }}></Table>
                </div>
            </div>
        </LayoutComponent>
    );
};

export default DeliveryPage;