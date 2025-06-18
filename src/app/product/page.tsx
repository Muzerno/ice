"use client";
import EditProductModal from "@/components/editProductModal";
import LayoutComponent from "@/components/Layout";
import { ICreateProduct } from "@/interface/product";
import {
  createProduct,
  deleteProduct,
  findAllProduct,
} from "@/utils/productService";
import { RestOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Table,
} from "antd";
import useMessage from "antd/es/message/useMessage";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import { render } from "react-dom";

const ProdectManagement = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = useMessage();
  const [data, setData] = React.useState<any[]>([]);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [productEdit, setProductEdit] = useState<number | null>();
  const [formEdit] = Form.useForm();

  const onFinish = async (values: ICreateProduct) => {
    try {
      const res = await createProduct(values);

      if (res.status === 201) {
        fetchProductData();
        messageApi.success("สินค้าเพิ่มสําเร็จ");
        form.resetFields();
      }
    } catch (error: any) {
      // ตรวจสอบว่า message จาก backend คือเรื่อง ice_id ซ้ำ
      if (
        error.response?.status === 409 ||
        error.message.includes("ICE ID ซ้ำ")
      ) {
        messageApi.error("ไม่สามารถเพิ่มสินค้าได้: รหัสสินค้าซ้ำกับสินค้าเดิม");
      } else {
        messageApi.error("เกิดข้อผิดพลาด: " + error.message);
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [openModalEdit]);

  const fetchProductData = async () => {
    const res = await findAllProduct();
    if (res.status === 200) {
      setData(res.data);
    }
  };

  const removeProduct = async (ice_id: number) => {
    const product = await deleteProduct(ice_id);
    if (product.status === 200) {
      messageApi.success("ลบสินค้าสําเร็จ");
      fetchProductData();
    }
  };
  const handleEdit = (item: any) => {
    setOpenModalEdit(true);
    setProductEdit(item.ice_id);
    formEdit.setFieldsValue({
      ...item,
    });
  };

  const columns = [
    {
      title: "รหัสสินค้า",
      dataIndex: "ice_id",
      key: "ice_id",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "product_name",
    },

    {
      title: "ราคา (บาท)",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "จำนวน",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "จัดการ",
      dataIndex: "action",
      key: "action",
      render: (text: any, record: any) => (
        <div className="flex justify-center">
          <Button
            type="primary"
            className="mr-2  !bg-yellow-300"
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            onConfirm={() => removeProduct(record.ice_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              <RestOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <LayoutComponent>
      {contextHolder}
      <Card className="w-full" title={[<h1>จัดการสินค้า</h1>]}>
        <Row className="w-full  ">
          <Col span={18} className="pr-2">
            <Card
              key={"tableProduct"}
              className="w-full h-[500px] "
              style={{ overflowY: "scroll" }}
            >
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
              ></Table>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              key={"formProduct"}
              className="w-full !bg-slate-100"
              title="เพิ่มข้อมูลสินค้า"
            >
              <div>
                <Form
                  layout="vertical"
                  title="Add User"
                  form={form}
                  onFinish={(e) => onFinish(e)}
                >
                  <Form.Item
                    name={"ice_id"}
                    key={"ice_id"}
                    label="รหัสสินค้า"
                    rules={[
                      { required: true, message: "กรุณากรอกรหัสสินค้า" },
                      {
                        pattern: /^[a-zA-Z0-9]{6}$/,
                        message:
                          "รหัสสินค้าต้องมี 6 ตัวอักษรหรือตัวเลขเท่านั้น",
                      },
                      {
                        validator: (_, value) => {
                          if (value && value.length === 6) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("รหัสสินค้าต้องมี 6 ตัวอักษรเท่านั้น")
                          );
                        },
                      },
                    ]}
                  >
                    <Input type="text" maxLength={6} />
                  </Form.Item>
                  <Form.Item
                    name={"name"}
                    key={"product_name"}
                    label="ชื่อสินค้า"
                    rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}
                  >
                    <Input type="text" />
                  </Form.Item>
                  <Form.Item
                    name={"price"}
                    key={"price"}
                    label="ราคา"
                    rules={[{ required: true, message: "กรุณากรอกราคา" }]}
                  >
                    <Input type="number" />
                  </Form.Item>

                  <Row>
                    <Col span={12} className="mr-1">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className=" w-full"
                      >
                        บันทึก
                      </Button>
                    </Col>
                    <Col span={11}>
                      <Button
                        type="default"
                        className="w-full"
                        htmlType="reset"
                      >
                        รีเซ็ต
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
      <EditProductModal
        openModalEdit={openModalEdit}
        setOpenModalEdit={setOpenModalEdit}
        productEdit={productEdit}
        formEdit={formEdit}
      />
    </LayoutComponent>
  );
};

export default ProdectManagement;
