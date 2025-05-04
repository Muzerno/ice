'use client'
import LayoutComponent from '@/components/Layout';
import LongdoMap from '@/components/LongdoMap';
import { UserContext } from '@/context/userContext';
import { StockInCar } from '@/utils/productService';
import { getDeliveryByCarId,updateDeliveryStatus } from '@/utils/transpotationService';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Input, message, Modal, Popconfirm, Row, Table, TableProps } from 'antd';
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
    // const [rowSelectList, setRowSelectList] = useState<any[]>([]);
    const [selectedProductsAmount, setSelectedProductsAmount] = useState<{ [key: number]: number }>({});
    const [selectDate, setSelectDate] = useState<any>(dayjs(new Date()));
    const [currentIndex3, setCurrentIndex3] = useState(0);
    const [openDetail, setOpenDetail] = useState(false);
    const [detailData, setDetailData] = useState<any>([]);
    const [stock, setStock] = useState<any>([]);
    const [openModal, setOpenModal] = useState(false);
    const [productSelect, setProductSelect] = useState<any>([]);
    const [totalPrice, setTotalPrice] = useState(0);
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
            console.log(res);
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
        try {
            // Validation checks
            if (selectedProducts.length <= 0) {
                messageApi.error("กรุณาเลือกรายการสินค้า");
                return;
            }
            
            if (Object.keys(selectedProductsAmount).length < selectedProducts.length) {
                messageApi.error("กรุณากรอกจํานวนสินค้า");
                return;
            }
    
            // 1. เรียก API และรอผลลัพธ์
            const { data: res, error } = await updateDeliveryStatus(id, {
                products: selectedProducts,
                product_amount: selectedProductsAmount,
                car_id: userLogin?.user?.transportation_car?.id,
                delivery_status: "success"
            });
    
            // 2. ตรวจสอบผลลัพธ์แบบละเอียด
            if (!error && res?.success) {
                // 3. รีเฟรชข้อมูลแบบขนาน
                await Promise.allSettled([
                    fetchDataDelivery(),
                    fetchStock()
                ]);
                
                // 4. รีเซ็ตสถานะ
                setSelectedProducts([]);
                setSelectedProductsAmount({});
                
                // 5. แจ้งเตือนสำเร็จ
                messageApi.success("บันทึกสําเร็จ");
            } else {
                // แจ้งเตือนข้อความจากเซิร์ฟเวอร์ หรือข้อความทั่วไป
                messageApi.error(res?.message || error?.message || "บันทึกไม่สําเร็จ");
            }
        } catch (error) {
            console.error("Error in handleSuccess:", error);
            messageApi.error("เกิดข้อผิดพลาดในการบันทึก");
        }
    }

    const handleOpenModal = (item: any) => {
        setProductSelect(item)
        setOpenModal(true);
        let totalPrice = 0;
        for (const product of item) {
            totalPrice += product.price * product.amount;
        }
        setTotalPrice(totalPrice);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenModalDetail = (item: any) => {
        // setProductSelect(item)
        setDetailData(item.customer_order.order_customer_details)
        setOpenDetail(true);
        let totalPrice = 0;

        for (const product of item.customer_order.order_customer_details) {
            totalPrice += product.product.price * product.amount;
        }
        setTotalPrice(totalPrice);
    };

    const handleCloseModalDetail = () => {
        setOpenDetail(false);
    };

    const handleFail = async (id: number) => {
        const res = await updateDeliveryStatus(id, { delivery_status: "cancel" });
        if (res) {
            fetchDataDelivery();
            messageApi.success("บันทึกสําเร็จ");
        } else {
            messageApi.error("บันทึกไม่สําเร็จ");
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
                if (!item?.address) return '-';

                const [manualAddress, mapAddressPart] = item.address.split('\n\n[ที่อยู่จากแผนที่]: ');

                let mapAddress = null;
                if (mapAddressPart) {
                    try {
                        mapAddress = JSON.parse(mapAddressPart);
                    } catch (err) {
                        console.error('Failed to parse map address:', err);
                        return (
                            <div>
                                <div>{manualAddress || '-'}</div>
                                <div className="text-gray-500">{mapAddressPart}</div>
                            </div>
                        );
                    }
                }

                return (
                    <div>
                        <div>{manualAddress || '-'}</div>
                        {mapAddress && (
                            <div className="text-gray-500">
                                {mapAddress.road && <span>{mapAddress.road}</span>}
                                {mapAddress.subdistrict && <span>, {mapAddress.subdistrict.replace('ต.', 'ตำบล')}</span>}
                                {mapAddress.district && <span>, {mapAddress.district.replace('อ.', 'อำเภอ')}</span>}
                                {mapAddress.province && <span>, {mapAddress.province.replace('จ.', 'จังหวัด')}</span>}
                                {mapAddress.postcode && <span> {mapAddress.postcode}</span>}
                            </div>
                        )}
                    </div>
                );
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
                    {item.drop_status === "success" &&
                        <Button type='primary' className='!bg-green-300' onClick={() => handleOpenModal(item.delivery_details)} >รายการจัดส่ง</Button>
                    }
                    {item.drop_status === "inprogress" &&
                        <>
                            <Popconfirm onConfirm={() => handleSuccess(item.id)} title="ยืนยันการจัดส่ง">
                                <Button type='primary' icon={<CheckOutlined className='text-green-400' />}></Button>
                            </Popconfirm>
                            <Popconfirm onConfirm={() => handleFail(item.id)} title="ยกเลิกการจัดส่ง">
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
                if (!item?.address) return '-';

                const [manualAddress, mapAddressPart] = item.address.split('\n\n[ที่อยู่จากแผนที่]: ');

                let mapAddress = null;
                if (mapAddressPart) {
                    try {
                        mapAddress = JSON.parse(mapAddressPart);
                    } catch (err) {
                        console.error('Failed to parse map address:', err);
                        return (
                            <div>
                                <div>{manualAddress || '-'}</div>
                                <div className="text-gray-500">{mapAddressPart}</div>
                            </div>
                        );
                    }
                }

                return (
                    <div>
                        <div>{manualAddress || '-'}</div>
                        {mapAddress && (
                            <div className="text-gray-500">
                                {mapAddress.road && <span>{mapAddress.road}</span>}
                                {mapAddress.subdistrict && <span>, {mapAddress.subdistrict.replace('ต.', 'ตำบล')}</span>}
                                {mapAddress.district && <span>, {mapAddress.district.replace('อ.', 'อำเภอ')}</span>}
                                {mapAddress.province && <span>, {mapAddress.province.replace('จ.', 'จังหวัด')}</span>}
                                {mapAddress.postcode && <span> {mapAddress.postcode}</span>}
                            </div>
                        )}
                    </div>
                );
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

                    {item.drop_status === "success" &&
                        <Button type='primary' className='!bg-green-300' onClick={() => handleOpenModal(item.delivery_details)} >รายการจัดส่ง</Button>
                    }
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

    const columnProductInCar = [
        // {
        //     title: 'เลือก',
        //     dataIndex: 'id',
        //     key: 'id',
        //     width: "5%",
        //     render: (item: any) => {
        //         return (
        //             <Checkbox
        //                 key={item}
        //                 checked={selectedProducts.includes(item)}
        //                 onChange={(e) => {
        //                     if (e.target.checked) {
        //                         setSelectedProducts([...selectedProducts, item]);
        //                     } else {
        //                         setSelectedProducts(
        //                             selectedProducts.filter((id) => id !== item)
        //                         );
        //                         setSelectedProductsAmount((prevAmounts) => {
        //                             const newAmounts = { ...prevAmounts };
        //                             delete newAmounts[item];
        //                             return newAmounts;
        //                         });
        //                     }
        //                 }}
        //             />
        //         );
        //     }
        // },
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
            title: 'ราคา (บาท)',
            dataIndex: 'product_price',
            key: 'product_price',

        },
        {
            title: 'สินค้าคงเหลือ (ถุง)',
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
                                    [item.id]: Math.min(newAmount, item.stock_amount),
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
            title: "จำนวน(ถุง)",
            dataIndex: "amount",
            key: "amount",
        },
        {
            title: "ราคา(บาท)/ถุง",
            dataIndex: "product",
            key: "product",
            render: (item: any) => item.price
        }
    ]
    const productDeliveryColumn = [
        {
            title: 'ลำดับ',
            dataIndex: 'id',
            key: 'id',
            render: (text: any, record: any, index: any) => index + 1
        },
        {
            title: "ชื่อสินค้า",
            dataIndex: "product",
            key: "product",
            render: (item: any) => item.name
        }, {
            title: "จำนวน(ถุง)",
            dataIndex: "amount",
            key: "amount",
        },
        {
            title: "ราคา(บาท)/ถุง",
            dataIndex: "price",
            key: "price",
        }
    ]

    const rowSelection: TableProps<any>['rowSelection'] = {
        selectedRowKeys: selectedProducts,
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            const rowArray = []
            for (const row of selectedRows) {
                rowArray.push(row.id)
                console.log(row)
            }
            setSelectedProducts([...rowArray])
        },
        getCheckboxProps: (record: any) => ({
            name: record.name,
        }),

    };
    console.log(dropOrder)

    return (
        <LayoutComponent>
            <div>
                {contextHolder}

                <Row className=''>
                    <Col span={24}>   <div className='float-right p-2'>
                        <DatePicker size='large' defaultValue={selectDate} format={"YYYY-MM-DD"} onChange={(value, dateString) => setSelectDate(dateString)} />
                    </div>
                    </Col>
                    <Col span={12}>
                        <Card className='w-full' title="จัดส่งประจําวัน" >
                            <div className='h-[300px] overflow-y-scroll'>
                                <Table columns={columnDropDayly} dataSource={dropDayly} pagination={false}></Table>
                            </div>
                        </Card>
                    </Col>
                    <Col span={12} className='pl-2' >
                        <Card className='w-full' title='จุดจัดส่งพิเศษ'>
                            <div className='h-[300px] overflow-y-scroll'>
                                <Table columns={columnDropOrder} dataSource={dropOrder} pagination={false}></Table>
                            </div>

                        </Card>
                    </Col>
                </Row>
                <div className='mt-5'>
                    <Card>
                        <Row>
                            <Col span={12} className='pr-2'>
                                <Card className='w-full' title="สินค้าในรถ">
                                    <div className='h-[300px] overflow-y-scroll'>
                                        <Table
                                            rowSelection={{
                                                type: "checkbox",
                                                ...rowSelection,
                                            }}
                                            rowKey={(id: any) => id.id}
                                            columns={columnProductInCar} dataSource={stock} pagination={false}></Table>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <LongdoMap customerLocation={dataInMap} />
                            </Col>
                        </Row>

                    </Card>
                </div>

            </div>
            <Modal open={openDetail} onCancel={() => handleCloseModalDetail()} footer={[
                <div key={"detail-footer"}>
                    ยอดรวม <span className='text-blue-500 text-2xl'>{totalPrice}</span> บาท
                </div>
            ]}>
                <Table columns={orderColumn} dataSource={detailData} pagination={false} />


            </Modal>
            <Modal title="รายการจัดส่ง" open={openModal} onCancel={() => handleCloseModal()}
                footer={[
                    <div key={"daly-footer"}>
                        ยอดรวม <span className='text-blue-500 text-2xl'>{totalPrice}</span> บาท
                    </div>
                ]}>
                <Table columns={productDeliveryColumn} dataSource={productSelect} pagination={false} />
            </Modal>
        </LayoutComponent>
    );
};

export default DeliveryPage;