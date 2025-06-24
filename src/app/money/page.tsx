"use client";
import LayoutComponent from "@/components/Layout";
import { moneyPage, updateMoneyStatus } from "@/utils/dashboardService";
import { Button, Card, DatePicker, Modal, Table, Tag, Popconfirm } from "antd";
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
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

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

  // ฟังก์ชันสำหรับจัดกลุ่มข้อมูลตามลูกค้า
  const groupDeliveryByCustomer = (deliveryData: any[]) => {
    const grouped = deliveryData.reduce((acc: any, item: any) => {
      const customerId =
        item.dropoffpoint?.customer?.customer_id ||
        item.dropoffpoint?.customer_order?.customer_id ||
        "unknown";

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          customer_name:
            item.dropoffpoint?.customer?.name ||
            item.dropoffpoint?.customer_order?.name ||
            "ไม่ระบุ",
          customer_phone:
            item.dropoffpoint?.customer?.telephone ||
            item.dropoffpoint?.customer_order?.telephone ||
            "-",
          deliveries: [],
          total_amount: 0,
        };
      }

      acc[customerId].deliveries.push(item);
      acc[customerId].total_amount += item.price * item.amount;

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const handelModal = (item: any) => {
    const arrayData = (item.delivery || []).map((deliveryItem: any) => ({
      ...deliveryItem,
      parentStatus: item.status,
    }));

    console.log(arrayData);

    const moneyIds = arrayData.map(
      (deliveryItem: any) => deliveryItem.money_id
    );

    setSelectedMoney(item);
    setSelectedMoneyIds(moneyIds);

    // จัดกลุ่มข้อมูลตามลูกค้า
    const groupedData = groupDeliveryByCustomer(arrayData);
    setDeliveryDetail(groupedData);
    setIsModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    try {
      await Promise.all(
        selectedMoneyIds.map((moneyId) =>
          updateMoneyStatus(moneyId, "confirmed")
        )
      );

      message.success("ยืนยันการชำระเงินสำเร็จ");
      fetchMoneyOrders();
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

  const totalAmount = deliveryDetail.reduce(
    (sum: number, customerGroup: any) => sum + customerGroup.total_amount,
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
        title="รายละเอียดการชำระเงิน"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setExpandedRowKey(null);
        }}
        footer={[]}
        width={1200}
        style={{ maxHeight: 600, overflowY: "auto" }}
      >
        {deliveryDetail.length > 0 ? (
          <>
          <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">สถานะการชำระเงิน:</span>
                <Tag 
                  color={selectedMoney?.status === "confirmed" ? "green" : "orange"}
                  className="text-lg px-3 py-1"
                >
                  {selectedMoney?.status === "confirmed" ? "ส่งเงินแล้ว" : "รอการส่งเงิน"}
                </Tag>
              </div>
            </div>
            <Table
              dataSource={deliveryDetail}
              columns={[
                {
                  title: "ชื่อลูกค้า",
                  key: "customer_name",
                  render: (customerGroup: any) => (
                    <div>
                      <div className="font-semibold">
                        {customerGroup.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        รหัสลูกค้า: {customerGroup.customer_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        เบอร์โทร: {customerGroup.customer_phone}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "จำนวนรายการ",
                  key: "delivery_count",
                  render: (customerGroup: any) => (
                    <span className="font-semibold">
                      {customerGroup.deliveries.length} รายการ
                    </span>
                  ),
                },
                {
                  title: "ยอดรวม (บาท)",
                  key: "total_amount",
                  render: (customerGroup: any) => (
                    <span className="font-semibold text-green-600">
                      {customerGroup.total_amount.toLocaleString()} บาท
                    </span>
                  ),
                },
              ]}
              expandable={{
                expandedRowRender: (customerGroup: any) => (
                  <div className="pl-4 pr-4">
                    <Table
                      dataSource={customerGroup.deliveries}
                      columns={[
                        {
                          title: "เวลาส่ง",
                          key: "delivery_time",
                          render: (item: any) =>
                            dayjs(item.delivery_date).format("HH:mm"),
                        },
                        {
                          title: "รายการสินค้า",
                          key: "product_name",
                          render: (item: any) => item.product?.name,
                        },
                        {
                          title: "จำนวนถุง",
                          key: "amount",
                          render: (item: any) => item.amount,
                        },
                        {
                          title: "ราคาถุง (บาท)",
                          key: "price",
                          render: (item: any) => item.price,
                        },
                        {
                          title: "จำนวนเงิน (บาท)",
                          key: "total",
                          render: (item: any) =>
                            (item.price * item.amount).toLocaleString(),
                        },
                        // {
                        //   title: "สถานะ",
                        //   key: "status",
                        //   render: (item: any) => (
                        //     <Tag
                        //       color={
                        //         item.parentStatus === "confirmed"
                        //           ? "green"
                        //           : "orange"
                        //       }
                        //     >
                        //       {item.parentStatus === "confirmed"
                        //         ? "ส่งเงินแล้ว"
                        //         : "รอการส่งเงิน"}
                        //     </Tag>
                        //   ),
                        // },
                      ]}
                      pagination={false}
                      rowKey={(item) => item.money_id}
                    />
                  </div>
                ),
                rowExpandable: () => true,
                expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
                onExpand: (expanded, record) => {
                  setExpandedRowKey(expanded ? record.customer_id : null);
                },
              }}
              pagination={false}
              rowKey={(customerGroup) => customerGroup.customer_id}
            />
            <div className="pt-4 text-right font-bold">
              ยอดรวมทั้งหมด : {totalAmount.toLocaleString()} บาท
            </div>
          </>
        ) : (
          <div className="text-center">ไม่มีข้อมูล</div>
        )}

        {selectedMoney?.status !== "confirmed" && (
          <div className="pt-4 text-right">
            <Popconfirm
              title="ยืนยันการชำระเงิน"
              description={`คุณต้องการยืนยันการชำระเงินจำนวน ${totalAmount.toLocaleString()} บาท ใช่หรือไม่?`}
              onConfirm={handleConfirmStatus}
              okText="ยืนยัน"
              cancelText="ยกเลิก"
            >
              <Button type="primary">
                ยืนยันการชำระเงิน
              </Button>
            </Popconfirm>
          </div>
        )}
      </Modal>
    </LayoutComponent>
  );
};

export default MoneyOrderPage;
