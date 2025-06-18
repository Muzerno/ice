"use client";
import LayoutComponent from "@/components/Layout";
import { moneyPage, updateMoneyStatus } from "@/utils/dashboardService";
import { Button, Card, DatePicker, Modal, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { message } from "antd";

const MoneyOrderPage = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryDetail, setDeliveryDetail] = useState<any[]>([]);
  const [date, setDate] = useState(dayjs());
  const [selectedMoney, setSelectedMoney] = useState<any>(null);
  const [selectedMoneyIds, setSelectedMoneyIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoneyOrders();
  }, [date]);

  const fetchMoneyOrders = async () => {
    const res = await moneyPage(date.format("YYYY-MM-DD"));
    if (res) {
      setData(res);
    }
    setIsLoading(false);
  };

  const handelModal = (item: any) => {
    const arrayData = (item.delivery || []).map((deliveryItem: any) => ({
      ...deliveryItem,
      parentStatus: item.status, // เพิ่ม status จาก parent
    }));

    const moneyIds = arrayData.map(
      (deliveryItem: any) => deliveryItem.money_id
    );

    setSelectedMoney(item);
    setSelectedMoneyIds(moneyIds);
    setDeliveryDetail(arrayData); // <-- ตอนนี้แต่ละ item มี parentStatus แล้ว
    setIsModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    try {
      // ใช้ Promise.all เพื่ออัปเดตทั้งสองรายการพร้อมกัน
      await Promise.all(
        selectedMoneyIds.map((moneyId) =>
          updateMoneyStatus(moneyId, "confirmed")
        )
      );

      message.success("ยืนยันการชำระเงินสำเร็จ");
      fetchMoneyOrders(); // รีโหลดข้อมูล
      setIsModalOpen(false);
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
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
    {
      title: "สถานะ",
      key: "status",
      render: (item: any) => {
        return (
          <Tag color={item.parentStatus === "confirmed" ? "green" : "orange"}>
            {item.parentStatus === "confirmed" ? "ส่งเงินแล้ว" : "รอการส่งเงิน"}
          </Tag>
        );
      },
    },
  ];

  const totalAmount = deliveryDetail.reduce(
    (sum, item) => sum + item.amount * item.price,
    0
  );

  return (
    <LayoutComponent>
      <Card>
        <DatePicker
          onChange={(e) => {
            if (e) {
              setDate(e);
            }
          }}
          format={"DD/MM/YYYY"}
          size="large"
          maxDate={dayjs()}
          defaultValue={dayjs()}
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
        width={1000}
        style={{ maxHeight: 600, overflowY: "auto" }}
      >
        {deliveryDetail.length > 0 ? (
          <>
            <Table
              dataSource={deliveryDetail}
              columns={columnDetail}
              pagination={false}
            />
            <div className="pt-4 text-right font-bold">
              ยอดรวม : {totalAmount.toLocaleString()} บาท
            </div>
          </>
        ) : (
          <div className="text-center">ไม่มีข้อมูล</div>
        )}
        {[
          selectedMoney?.status !== "confirmed" && (
            <Button type="primary" onClick={handleConfirmStatus}>
              ยืนยันการชำระเงิน
            </Button>
          ),
        ]}
      </Modal>
    </LayoutComponent>
  );
};

export default MoneyOrderPage;
