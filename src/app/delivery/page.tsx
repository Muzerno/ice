'use client'
import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { UserContext } from '@/context/userContext';
import { StockInCar } from '@/utils/productService';
import { getDeliveryByCarId, updateDaliveryStatus } from '@/utils/transpotationService';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Input, message, Modal, Popconfirm, Row, Table } from 'antd';
import { format, parseISO, set } from 'date-fns';
import moment from 'moment';
import { title } from 'process';
import dayjs from 'dayjs';
import { use, useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';

const DeliveryPage = () => {

    const [dropDayly, setDropDayly] = useState<any>([]);
    const [data, setData] = useState<any>([]);
    const [dropOrder, setDropOrder] = useState<any>([]);
    const [dataInMap, setDataInMap] = useState<any>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const { userLogin, setUserLogin } = useContext(UserContext);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [selectedProductsAmount, setSelectedProductsAmount] = useState<{ [key: number]: number }>({});
    const [selectDate, setSelectDate] = useState<any>(dayjs(new Date()));
    const [currentIndex3, setCurrentIndex3] = useState(0);
    const [openDetail, setOpenDetail] = useState(false);
    const [detailData, setDetailData] = useState<any>([]);
    const [stock, setStock] = useState<any>([]);
    useEffect(() => {
        if (userLogin && userLogin?.user?.transportation_car?.id) {
            fetchDataDelivery();
            fetchStock();
        }
    }, [userLogin]);

    const fetchDataDelivery = async () => {
        const userId = userLogin?.user?.transportation_car?.id
        if (userId) {
            const res = await getDeliveryByCarId(userLogin?.user?.transportation_car?.id, dayjs(selectDate).format('YYYY-MM-DD'));
            if (res) {
                setDropDayly(res.drop_dayly)
                setDropOrder(res.drop_order)
                setData(res)
            }
        }
    }

    useEffect(() => {
        fetchDataDelivery()
    }, [selectDate])

    const fetchStock = async () => {
        const res = await StockInCar(userLogin?.user?.transportation_car?.id)
        if (res) {
            setStock(res)
        }
    }
    // const updateLocation = async () => {
    //     navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    //         const { latitude, longitude } = coords;
    //         const res = await 
    //     })
    // }
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
        if (selectedProducts.length < 0) {
            return messageApi.error("กรุณาเลือกรายการสินค้า");
        }
        if (Object.keys(selectedProductsAmount).length < selectedProducts.length) {
            return messageApi.error("กรุณากรอกจํานวนสินค้า");
        }
        const res = await updateDaliveryStatus(id, { products: selectedProducts, product_amount: selectedProductsAmount, car_id: userLogin?.user?.transportation_car?.id, status: "success" });
        if (res) {
            fetchDataDelivery();
            fetchStock();
            setSelectedProducts([])
            setSelectedProductsAmount({})
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
                let parsedAddress = JSON.parse(item.address);
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
                <div className='flex'>
                    {item.drop_status === "inprogress" &&
                        <>
                            <Popconfirm onConfirm={() => handleSuccess(item.id)} title="ยืนยันการจัดส่ง" description="แน่ใจหรือไม่">
                                <Button type='primary' icon={<CheckOutlined className='text-green-400' />}></Button>
                            </Popconfirm>
                            <Popconfirm onConfirm={() => handleFail(item.id)} title="ยกเลิกการจัดส่ง" description="แน่ใจหรือไม่">
                                <Button type='primary' danger className='ml-2' icon={<CloseOutlined className='text-red-400' />}></Button>
                            </Popconfirm>
                        </>
                    }

                </div>
            )
        }
    ]

    const columnDropOrder = [
        {
            title: 'ชื่อลูกค้า',
            dataIndex: 'customer_order',
            key: 'customer_order',
            render: (item: any) => item?.name,
        },
        {
            title: 'เบอร์โทรศัพท์',
            dataIndex: 'customer_order',
            key: 'customer_order',
            render: (item: any) => item?.telephone,
        },
        {
            title: 'ที่อยู่',
            dataIndex: 'customer_order',
            key: 'customer_order',
            render: (item: any) => {
                let parsedAddress = JSON.parse(item.address);
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
                <div className='flex'>
                    <Button type='primary' className='mr-2' onClick={() => { setOpenDetail(true), setDetailData(item.customer_order.order_customer_details) }} >ข้อมูลคำสั่งซื้อ</Button>
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

    const columnProductInCar = [
        {
            title: 'เลือก',
            dataIndex: 'id',
            key: 'id',
            width: "5%",
            render: (item: any) => {
                return (
                    <Checkbox
                        key={item}
                        checked={selectedProducts.includes(item)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, item]);
                            } else {
                                setSelectedProducts(
                                    selectedProducts.filter((id) => id !== item)
                                );
                                setSelectedProductsAmount((prevAmounts) => {
                                    const newAmounts = { ...prevAmounts };
                                    delete newAmounts[item];
                                    return newAmounts;
                                });
                            }
                        }}
                    />
                );
            }
        },
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => currentIndex + index + 1
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'product_name',
            key: 'product_name',

        },
        {
            title: 'ราคา',
            dataIndex: 'product_price',
            key: 'product_price',

        },
        {
            title: 'สินค้าคงเหลือ',
            dataIndex: 'stock_amount',
            key: 'stock_amount',

        },
        {
            title: "เลือกจำนวน",
            dataIndex: "",
            key: "action",
            width: 160,
            render: (item: any) => {
                const isSelected = selectedProducts.includes(item.id);
                return (
                    <div className='flex justify-center'>
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.id]: Math.max((prevAmounts[item.id] || 0) - 1, 0),
                                }));
                            }}
                        >
                            -
                        </Button>
                        <Input
                            className='text-center'
                            value={selectedProductsAmount[item.id] || 0}
                            onChange={(e) => {
                                const newAmount = parseInt(e.target.value) || 0;
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.id]: newAmount,
                                }));
                            }}
                            disabled={!isSelected}
                        />
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => {
                                    const newAmount = (prevAmounts[item.id] || 0) + 1;
                                    return {
                                        ...prevAmounts,
                                        [item.id]: Math.min(newAmount, item.stock_amount),
                                    };
                                });
                            }}
                        >
                            +
                        </Button>
                    </div>
                );
            }
        }
    ]
    const orderColumn = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => currentIndex3 + index + 1
        },
        {
            title: "ชื่อสินค้า",
            dataIndex: "product",
            key: "product",
            render: (item: any) => item.name
        }, {
            title: "จำนวน",
            dataIndex: "amount",
            key: "amount",
        }
    ]


    return (
        <LayoutComponent>
            <div>
                {contextHolder}
                <div>
                    <Card>
                        <Row>
                            <Col span={12} className='pr-2'>
                                <Card className='w-full' title="สินค้าในรถ">
                                    <Table columns={columnProductInCar} dataSource={stock} pagination={{ pageSize: 5 }}></Table>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <LongdoMap customerLocation={dataInMap} />
                            </Col>
                        </Row>

                    </Card>
                </div>

                <Row className='mt-5'>
                    <Col span={24}>   <div className='float-right p-2'>
                        <DatePicker size='large' defaultValue={selectDate} format={"YYYY-MM-DD"} onChange={(value, dateString) => setSelectDate(dateString)} />
                    </div>
                    </Col>
                    <Col span={12}>

                        <Card className='w-full' title="จัดส่งประจําวัน" >

                            <Table columns={columnDropDayly} dataSource={dropDayly} pagination={{ pageSize: 5 }}></Table>
                        </Card>
                    </Col>
                    <Col span={12} className='pl-2' >
                        <Card className='w-full' title='จุดจัดส่งพิเศษ'>
                            <Table columns={columnDropOrder} dataSource={dropOrder} pagination={{ pageSize: 5 }}></Table>
                        </Card>
                    </Col>
                </Row>
            </div>
            <Modal open={openDetail} onCancel={() => setOpenDetail(false)} footer={[]}>
                <Table columns={orderColumn} dataSource={detailData} />


            </Modal>
        </LayoutComponent>
    );
};

export default DeliveryPage;