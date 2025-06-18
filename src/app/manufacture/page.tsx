'use client';
import LayoutComponent from '@/components/Layout';
import { UserContext } from '@/context/userContext';
import { createManufacture, deleteManufacture, findAllManufacture, updateManufacture } from '@/utils/manufactureService';
import { findAllProduct, findAllProductDrowdown } from '@/utils/productService';
import { BoxPlotOutlined, DeleteOutlined, RestOutlined, StockOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Row, Select, Table, TableProps } from "antd";
import FormItem from 'antd/es/form/FormItem';
import { format, isValid, parseISO, set } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { render } from 'react-dom';
import moment from 'moment';
import { se } from 'date-fns/locale';
import dayjs from 'dayjs';
import { title } from 'process';

interface IProps {
    navBarMenu: number
}
export default function Manufacture(props: IProps) {


    const [productData, setProductData] = useState([]);
    const [data, setData] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const { userLogin } = useContext(UserContext)
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [openConfirmUuid, setOpenConfirmUuid] = useState<number | null>();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedProductsAmount, setSelectedProductsAmount] = useState<{ [key: number]: number }>({});
    useEffect(() => {
        fetchProduct()
        fetchManufacture()
    }, [])

    const fetchProduct = async () => {
        const res = await findAllProductDrowdown()
        if (res.status === 200) {
            setProductData(res.data);
        }

    }

    const fetchManufacture = async (date: any = new Date()) => {
        const res = await findAllManufacture(date.toISOString())
        if (res.status === 200) {
            setData(res.data);
        }
    }

    //test

    const create = async (values: any) => {
        if (selectedProducts.length === 0) {
            messageApi.error('กรุณาเลือกรายการสินค้า');
            return
        }
        if (Object.keys(selectedProductsAmount).length < selectedProducts.length) {
            messageApi.error('กรุณากรอกจํานวนสินค้า');
            return
        }
        if (selectedDate && selectedDate.isBefore(dayjs(), 'day')) {
            messageApi.error('ไม่สามารถเลือกวันที่ย้อนหลังได้');
            return;
        }
        const res = await createManufacture({
            user_id: userLogin?.user?.id,
            product_id: selectedProducts,
            amount: selectedProductsAmount,
            date_time: new Date()
        })
        if (res.status === 201) {
            fetchManufacture()
            fetchProduct()
            setSelectedProducts([])
            setSelectedProductsAmount({})
            messageApi.success('สร้างข้อมูลการผลิตสําเร็จ');
        } else {
            messageApi.error('สร้างข้อมูลการผลิตไม่สําเร็จ');
        }
    }
    const columns = [

        {
            title: 'เวลาที่ผลิต',
            dataIndex: ['manufacture', 'date_time'], // เข้าถึง manufacture.date_time
            key: 'date_time',
            render: (value: string) => format(new Date(value), 'HH:mm'),
        },
        {
            title: "ชื่อสินค้า",
            dataIndex: "products",
            key: "products",
            render: (item: any) => item?.name
        },
        {
            title: 'จำนวน',
            dataIndex: 'manufacture_amount',
            key: 'manufacture_amount',

        },
        // {
        //     title: "",
        //     dataIndex: "",
        //     key: "action",
        //     width: 100,
        //     render: (item: any) => {
        //         return (
        //             <>
        //                 <Button
        //                     type="primary"
        //                     className="!bg-yellow-300 mr-1"
        //                     icon={<ToolOutlined />}
        //                     onClick={() => {
        //                         setOpenModalEdit(true);

        //                         formEdit.setFieldsValue({
        //                             id: item?.id,
        //                             ice_id: item?.ice_id,
        //                             manufacture_id: item?.manufacture_id,
        //                             product_id: item?.products.id,
        //                             manufacture_amount: item?.manufacture_amount,
        //                             date_time: dayjs(item?.manufacture?.date_time),
        //                         });

        //                     }}
        //                 />
        //                 {/* <Popconfirm
        //                     key={item.manufacture_id}
        //                     title="ลบข้อมูลการผลิต"
        //                     description="คุณต้องการลบข้อมูลการผลิตหรือไม่"
        //                     onConfirm={() => onDelete(item.manufacture_id)}
        //                     okText="Yes"
        //                     cancelText="No"
        //                     open={openConfirmUuid === item.manufacture_id}
        //                     onOpenChange={(newOpen) => {
        //                         if (newOpen) {
        //                             setOpenConfirmUuid(item.manufacture_id);
        //                         } else {
        //                             setOpenConfirmUuid(null);
        //                         }
        //                     }}
        //                 >
        //                     <Button
        //                         type="primary"
        //                         className="!bg-red-500"
        //                         key={item.id}
        //                         icon={<RestOutlined />}
        //                     />
        //                 </Popconfirm> */}
        //             </>
        //         )
        //     }
        // }
    ]

    const ProductColumns = [
        // {
        //     title: 'ลำดับ',
        //     key: 'index',
        //     render: (_: any, __: any, index: number) => index + 1,
        //     sx: { width: '5%' },
        // },
        {
            title: 'รหัสสินค้า',
            dataIndex: 'ice_id',
            key: 'ice_id',
        },

        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'product_name',
        },

        {
            title: 'ราคา (บาท)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
        },
    ]
    const ProductSelectColumns = [
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'product_name',
        },
        {
            title: "จำนวน",
            dataIndex: "",
            key: "action",
            width: 160,
            render: (item: any) => {
                const isSelected = selectedProducts.includes(item.ice_id);
                return (
                    <div className='flex justify-center'>
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.ice_id]: Math.max((prevAmounts[item.ice_id] || 0) - 1, 0),
                                }));
                            }}
                        >
                            -
                        </Button>
                        <Input
                            className='w-[50px] text-center'
                            value={selectedProductsAmount[item.ice_id] || 0}
                            onChange={(e) => {
                                const newAmount = parseInt(e.target.value) || 0;
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.ice_id]: newAmount,
                                }));
                            }}
                            disabled={!isSelected}
                        />
                        <Button
                            disabled={!isSelected}
                            onClick={() => {
                                setSelectedProductsAmount((prevAmounts) => ({
                                    ...prevAmounts,
                                    [item.ice_id]: (prevAmounts[item.ice_id] || 0) + 1,
                                }));
                            }}
                        >
                            +
                        </Button>
                    </div>
                );
            }
        }
    ]

    const onDelete = async (id: number) => {
        const res = await deleteManufacture(id)
        if (res.status === 200) {
            messageApi.success('ลบข้อมูลการผลิตสําเร็จ');
            fetchManufacture()
        } else {
            messageApi.error('ลบข้อมูลการผลิตไม่สําเร็จ');
        }
    }

    const onUpdate = async (values: any) => {
        console.log('VALUES ที่ส่งมา:', values); // ✅ สำคัญมาก

        try {
            const payload = {
                ice_id: values.ice_id ?? values.products?.id,
                manufacture_id: values.manufacture_id ?? values.manufacture?.id,
                amount: Number(values.manufacture_amount),
                date_time: values.manufacture?.date_time,
            };

            if (!payload.ice_id || !payload.manufacture_id) {
                console.log('❌ payload ไม่สมบูรณ์:', payload);
                messageApi.error('ไม่พบข้อมูล ice_id หรือ manufacture_id');
                return;
            }

            const res = await updateManufacture(payload);

            if (res.status === 200) {
                messageApi.success('แก้ไขข้อมูลการผลิตสำเร็จ');
                setOpenModalEdit(false);
                fetchManufacture();
            } else {
                messageApi.error(`แก้ไขข้อมูลการผลิตไม่สำเร็จ: ${res.data?.message || ''}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            messageApi.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        }
    };




    const rowSelection: TableProps<any>['rowSelection'] = {
        selectedRowKeys: selectedProducts,
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            const customerArray = []
            for (const row of selectedRows) {
                customerArray.push(row.ice_id)
            }
            setSelectedProducts([...customerArray])
        },

    };

    return (
        <LayoutComponent >
            {contextHolder}
            <div className='w-full'>
                <Row className='mt-5'>
                    <Col span={16}>
                        <Row>
                            <Card className='w-full' title="สินค้าในคลัง">
                                <div className='h-[350px] overflow-y-scroll'>
                                    <Table columns={ProductColumns} dataSource={productData} pagination={false} />
                                </div>

                            </Card>
                        </Row>
                        <Row className='mt-5'>
                            <Card className='w-full' title="จัดการข้อมูลการผลิต" >
                                <Row >
                                    <Col span={12}>
                                        <div className='mb-2 float-start'>
                                            <DatePicker
                                                format={"DD/MM/YYYY"}
                                                size='large'
                                                defaultValue={selectedDate}
                                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                                                onChange={(date) => {
                                                    setSelectedDate(date);
                                                    fetchManufacture(date);
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className='mb-2 float-end'>
                                            <StockOutlined /> จำนวนทั้งหมดของวันนี้ {data.length} รายการ
                                        </div>
                                    </Col>


                                </Row>
                                <Row>
                                    <div className='w-full h-[350px] overflow-y-scroll'>
                                        <Table columns={columns} dataSource={data} pagination={false} />
                                    </div>
                                </Row>

                            </Card>
                        </Row>


                    </Col>
                    <Col span={8} className='pl-2'>
                        <Card className='w-full' title="เพิ่มข้อมูลการผลิต">
                            <Form layout='vertical' onFinish={create} form={form}>

                                <Table rowKey={(ice_id: any) => ice_id.ice_id} rowSelection={{ type: 'checkbox', ...rowSelection }} columns={ProductSelectColumns} dataSource={productData} pagination={{ pageSize: 5 }} />

                                <Button type="primary" className=' w-full' htmlType="submit" >บันทึก</Button>

                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
            <Modal open={openModalEdit} title="แก้ไขข้อมูลการผลิต" onCancel={() => setOpenModalEdit(false)} footer={[]}>
                <Form layout='vertical' onFinish={onUpdate} form={formEdit}>
                    <Form.Item name='id' hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name='ice_id' hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name='manufacture_id' hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name={"product_id"} className='w-full' label="สินค้า" rules={[{ required: true, message: "กรุณาเลือกสินค้า" }]}>
                        <Select className='w-full' disabled>
                            {productData.map((item: any) =>
                                <Select.Option key={item.id} value={item.id}>
                                    {item.name}
                                </Select.Option>
                            )}

                        </Select>
                    </Form.Item>

                    <Form.Item name={"manufacture_amount"} className='w-full' label="จำนวนที่ผลิต" rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}>
                        <Input className='w-full' />
                    </Form.Item>
                    <Popconfirm title="ต้องการบันทึกข้อมูลใช่หรือไม่?" description="บันทึกข้อมูล" onConfirm={() => formEdit.submit()}>
                        <Button type="primary" className=' w-full' >บันทึก</Button>
                    </Popconfirm>
                </Form>
            </Modal>
        </LayoutComponent>

    );
}


