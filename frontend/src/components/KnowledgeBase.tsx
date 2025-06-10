import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import type { RcFile } from "antd/es/upload";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const KnowledgeBase: React.FC = () => {
  const [data, setData] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/knowledge/list");
      setData(response.data);
    } catch (error) {
      message.error("获取知识库列表失败");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: KnowledgeItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/knowledge/delete/${id}`);
      message.success("删除成功");
      fetchData();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.title) {
        values.title = "";
      }
      if (editingItem) {
        await axios.post(
          `http://localhost:3001/knowledge/update/${editingItem.id}`,
          values
        );
        message.success("更新成功");
      } else {
        await axios.post("http://localhost:3001/knowledge/create", values);
        message.success("创建成功");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(editingItem ? "更新失败" : "创建失败");
    }
  };

  const handleFileRead = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (file: RcFile) => {
    if (file.type !== 'text/plain') {
      message.error('只能上传 TXT 文件！');
      return false;
    }

    try {
      const content = await handleFileRead(file);
      form.setFieldsValue({ content });
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('文件读取失败');
      return false;
    }
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: KnowledgeItem) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加知识
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? "编辑知识" : "添加知识"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题">
            <Input placeholder="如果标题为空将由ai进行总结并取标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入内容或上传TXT文件"
            />
          </Form.Item>
          <Form.Item label="上传TXT文件">
            <Upload
              accept=".txt"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择TXT文件</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666' }}>
              支持上传TXT文件，文件内容将自动填充到内容框中
            </div>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea
              placeholder="请输入描述（选填）"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
