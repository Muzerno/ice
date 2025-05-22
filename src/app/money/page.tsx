"use client";
import LayoutComponent from "@/components/Layout";
import { UserContext } from "@/context/userContext";
import { moneyPage } from "@/utils/dashboardService";
import { Button, Card, DatePicker, Modal, Table } from "antd";
import { format } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";

const MoneyOrderPage = () => {
  const { userLogin } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryDetail, setDeliveryDetail] = useState<any[]>([]);
  const [date, setDate] = useState<string | any>(
    format(new Date(), "yyyy-MM-dd")
  );
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
    const arrayData = item.delivery || [];
    setDeliveryDetail(arrayData);
    setIsModalOpen(true);
  };

  const column = [
    {
      title: "สายการเดินรถ",
      dataIndex: "line_name",
      key: "line_name",
    },
    {
      title: "เลขทะเบียนรถ",
      dataIndex: "car_number",
      key: "car_number",
    },
    {
      title: "ชื่อคนขับ",
      key: "driver_name",
      render: (record: any) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "จำนวนเงิน (บาท)",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "รายละเอียด",
      key: "action",
      render: (item: any, record: any) => (
        <Button type="primary" onClick={() => handelModal(record)}>
          ดูรายละเอียด
        </Button>
      ),
    },
  ];

  const columnDetail = [
    {
      title: "เวลาส่ง",
      key: "delivery_time",
      render: (item: any) => {
        return dayjs(item.delivery_date).format("HH:mm");
      },
    },
    {
      title: "ชื่อลูกค้า",
      key: "customer_name",
      render: (item: any) => {
        return (
          item?.dropoffpoint?.customer?.name ||
          item?.dropoffpoint?.customer_order?.name ||
          "-"
        );
      },
    },
    {
      title: "รายการสินค้า",
      key: "product_name",
      render: (item: any) => {
        return `${item.product?.name}`;
      },
    },
    {
      title: "จํานวนถุง",
      key: "amount",
      render: (item: any) => {
        return item.amount;
      },
    },
    {
      title: "ราคาถุง (บาท)",
      key: "price",
      render: (item: any) => {
        return item.price;
      },
    },
    {
      title: "จํานวนเงิน (บาท)",
      key: "total",
      render: (item: any) => {
        return item.price * item.amount;
      },
    },
  ];

  return (
    <LayoutComponent>
      <Card>
        <DatePicker
          multiple={false}
          onChange={(e, date_time) => setDate(date_time)}
          format={"YYYY-MM-DD"}
          size="large"
          defaultValue={dayjs(new Date())}
          className="float-right pb-2"
        />
        {!isLoading && data.length > 0 ? (
          <Table className="pt-2" dataSource={data} columns={column} />
        ) : (
          <div className="pt-2 text-center">ไม่มีข้อมูล</div>
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
          <div className="text-center">ไม่มีข้อมูล</div>
        )}
      </Modal>
    </LayoutComponent>
  );
};

export default MoneyOrderPage;
