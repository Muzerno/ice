"use client";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, Modal, Button, Space } from "antd";
import { useState, useEffect, useRef } from "react";
import { UpOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';

function Row(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props["data-row-key"],
    });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}

export default function SortableCustomerTable({
  data,
  onReorder,
  deleteLine,
  onMoveUp, 
  onMoveDown 
}: any) {
  const [items, setItems] = useState(data || []);
  const isInitialized = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor));

  // ทำการอัพเดทเมื่อข้อมูลเปลี่ยนแปลงครั้งแรกเท่านั้น
  useEffect(() => {
    if (data && data.length > 0) {
      const dataWithSteps = data
        .sort((a: any, b: any) => (a.step || 0) - (b.step || 0))
        .map((item: any, index: number) => ({
          ...item,
          step: item.step !== undefined ? item.step : index + 1,
        }));

      setItems(dataWithSteps);
    } else {
      setItems([]);
    }
  }, [data]);

  // Reset เมื่อ data เปลี่ยนแปลงจากภายนอก (เช่น เปิด modal ใหม่)
  useEffect(() => {
    if (data && data.length > 0) {
      const currentIds = items.map((item) => item.customer_id).sort();
      const newIds = data.map((item) => item.customer_id).sort();

      // ถ้าลิสต์ลูกค้าเปลี่ยน ให้ reset
      if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
        isInitialized.current = false;
      }
    }
  }, [data, items]);

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over?.id) {
      console.log("Drag ended:", { activeId: active.id, overId: over?.id });

      const oldIndex = items.findIndex(
        (item: any) => item.customer_id === active.id
      );
      const newIndex = items.findIndex(
        (item: any) => item.customer_id === over.id
      );

      console.log("Moving from index", oldIndex, "to index", newIndex);

      // สร้างข้อมูลใหม่ด้วย arrayMove
      const newData = arrayMove(items, oldIndex, newIndex);

      // อัพเดท step ให้กับทุกรายการตามลำดับใหม่
      const updatedData = newData.map((item: any, index: number) => ({
        ...item,
        step: index + 1,
      }));

      console.log(
        "Before reorder:",
        items.map((item) => ({ id: item.customer_id, step: item.step }))
      );
      console.log(
        "After reorder:",
        updatedData.map((item) => ({ id: item.customer_id, step: item.step }))
      );

      setItems(updatedData);
      onReorder(updatedData);
    }
  };

  const handleDelete = (lineId: number, cusId: number) => {
    Modal.confirm({
      title: "ลบลูกค้า",
      content: "คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้ารายนี้?",
      okText: "ใช่",
      cancelText: "ไม่",
      centered: true,
      onOk: () => {
        deleteLine(lineId, cusId);
      },
    });
  };

  // ฟังก์ชันสำหรับเลื่อนรายการขึ้น/ลง
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newData = [...items];
      [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
      
      // อัปเดต step ให้เป็นลำดับใหม่
      const updatedData = newData.map((item: any, idx: number) => ({
        ...item,
        step: idx + 1,
      }));
      
      setItems(updatedData);
      onMoveUp(index);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < items.length - 1) {
      const newData = [...items];
      [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
      
      // อัปเดต step ให้เป็นลำดับใหม่
      const updatedData = newData.map((item: any, idx: number) => ({
        ...item,
        step: idx + 1,
      }));
      
      setItems(updatedData);
      onMoveDown(index);
    }
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item: any) => item.customer_id)}
          strategy={verticalListSortingStrategy}
        >
          <Table
            components={{ body: { row: Row } }}
            rowKey="customer_id"
            dataSource={items}
            columns={[
              {
                title: "การดำเนินการ",
                key: "action",
                width: 200,
                align: "center",
                render: (text, record, index) => (
                  <div
                    style={{
                      pointerEvents: "auto",
                      cursor: "default",
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Space>
                      <Button
                        type="text"
                        icon={<UpOutlined />}
                        size="small"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        title="เลื่อนขึ้น"
                      />
                      <Button
                        type="text"
                        icon={<DownOutlined />}
                        size="small"
                        disabled={index === items.length - 1} // แก้ไขจาก data.length เป็น items.length
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        title="เลื่อนลง"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Delete button clicked for:", record.customer_id);
                          handleDelete(record.line_id, record.customer_id);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        title="ลบ"
                      />
                    </Space>
                  </div>
                ),
              },
              {
                title: "ลำดับ",
                dataIndex: "step",
                key: "step",
                width: 80,
                render: (step: number, record: any, index: number) => (
                  <span style={{ fontWeight: "bold", color: "#1890ff" }}>
                    {step || index + 1}
                  </span>
                ),
              },
              {
                title: "รหัสลูกค้า",
                dataIndex: "customer_id",
                key: "customer_id",
                width: 120,
              },
              {
                title: "ชื่อ",
                dataIndex: "name",
                key: "name",
                width: 120,
              },
              {
                title: "เบอร์โทร",
                dataIndex: "telephone",
                key: "telephone",
                width: 120,
              },
              {
                title: "ที่อยู่",
                dataIndex: "address",
                key: "address",
                width: 400,
                render: (address: any) => {
                  if (!address) return "-";

                  // แยกส่วนที่อยู่ที่กรอกเองและที่อยู่จากแผนที่
                  const [manualAddress, mapAddressPart] = address.split(
                    "\n\n[ที่อยู่จากแผนที่]: "
                  );

                  // พยายาม parse ที่อยู่จากแผนที่ถ้ามี
                  let mapAddress = null;
                  if (mapAddressPart) {
                    try {
                      mapAddress = JSON.parse(mapAddressPart);
                    } catch (err) {
                      console.error("Failed to parse map address:", err);
                      // ถ้า parse ไม่ได้ ให้แสดงข้อมูลดิบ
                      return (
                        <div>
                          <div>{manualAddress || "-"}</div>
                          {mapAddressPart && (
                            <div className="text-gray-500">
                              {mapAddressPart}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }

                  return (
                    <div>
                      <div>{manualAddress || "-"}</div>
                      {mapAddress && (
                        <div className="text-gray-500">
                          {mapAddress.road && <span>{mapAddress.road}</span>}
                          {mapAddress.subdistrict && (
                            <span>
                              , {mapAddress.subdistrict.replace("ต.", "ตำบล")}
                            </span>
                          )}
                          {mapAddress.district && (
                            <span>
                              , {mapAddress.district.replace("อ.", "อำเภอ")}
                            </span>
                          )}
                          {mapAddress.province && (
                            <span>
                              , {mapAddress.province.replace("จ.", "จังหวัด")}
                            </span>
                          )}
                          {mapAddress.postcode && (
                            <span> {mapAddress.postcode}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              },
              // ลบคอลัมน์ปุ่มลบที่ซ้ำซ้อนออก เพราะมีในคอลัมน์การดำเนินการแล้ว
            ]}
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
}