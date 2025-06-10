import React, { useRef, useState } from "react";
import {
  Input,
  Button,
  message as antdMessage,
  Upload,
  Typography,
  Tooltip,
  Modal,
  Form,
  Tabs,
} from "antd";
import axios from "axios";
import {
  UploadOutlined,
  SendOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import "./App.css";
import KnowledgeBase from "./components/KnowledgeBase";

const { TextArea } = Input;
const { Title } = Typography;

interface ChatMessage {
  role: "user" | "assistant" | "loading";
  content: string;
}

const LoadingDots: React.FC = () => {
  return (
    <div className="loading-dots">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isTextModalVisible, setIsTextModalVisible] = useState(false);
  const [textForm] = Form.useForm();

  // 自动滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:3001/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      antdMessage.success("知识库已上传");
    } catch {
      antdMessage.error("上传失败");
    }
    return false;
  };

  // 伪流式显示AI回复
  const fakeStreamReply = (fullText: string) => {
    setStreaming(true);
    setStreamContent("");
    let i = 0;
    function showNext() {
      setStreamContent(fullText.slice(0, i + 1));
      scrollToBottom();
      if (i < fullText.length - 1) {
        i++;
        setTimeout(showNext, Math.floor(Math.random() * 30));
      } else {
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", content: fullText },
        ]);
        setStreaming(false);
        setStreamContent("");
        scrollToBottom();
      }
    }
    showNext();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput("");
    scrollToBottom();
    try {
      const res = await axios.post("http://localhost:3001/chat", {
        message: userMsg.content,
      });
      setMessages((prev) => prev.filter((msg) => msg.role !== "loading"));
      fakeStreamReply(res.data.reply);
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "assistant", content: "AI回复失败，请稍后重试。" },
      ]);
      antdMessage.error("请求后端失败，请检查服务是否启动");
      setStreaming(false);
      setStreamContent("");
      scrollToBottom();
    }
    setLoading(false);
  };

  const handleCopy = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageIndex);
      antdMessage.success("已复制到剪贴板");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      antdMessage.error("复制失败");
    }
  };

  const handleTextSubmit = async (values: {
    content: string;
    filename: string;
  }) => {
    try {
      await axios.post("http://localhost:3001/upload/text", values);
      antdMessage.success("文本已添加到知识库");
      setIsTextModalVisible(false);
      textForm.resetFields();
    } catch (error) {
      antdMessage.error("添加文本失败");
    }
  };

  const items = [
    {
      key: 'chat',
      label: 'AI 对话',
      children: (
        <div className="chat-container">
          <div className="chat-header">
            <Title level={4} style={{ margin: 0 }}>
              AI 智能助手
            </Title>
            <div className="upload-buttons">
              <Button
                onClick={() => setIsTextModalVisible(true)}
                style={{ marginRight: 8 }}
              >
                输入文本
              </Button>
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                className="upload-button"
              >
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
            </div>
          </div>

          <div className="chat-messages" ref={chatListRef}>
            {(streaming
              ? [...messages, { role: "assistant", content: streamContent }]
              : [
                  ...messages,
                  ...(loading ? [{ role: "loading", content: "" }] : []),
                ]
            ).map((item, index) => (
              <div
                key={index}
                className={`chat-message ${item.role === "user" ? "user" : ""}`}
              >
                <div className={`message-bubble ${item.role}`}>
                  <div className="message-header">
                    <div className="message-sender">
                      {item.role === "user"
                        ? "我"
                        : item.role === "loading"
                        ? "AI"
                        : "AI"}
                    </div>
                    {item.role !== "loading" && (
                      <Tooltip
                        title={copiedMessageId === index ? "已复制" : "复制内容"}
                      >
                        <Button
                          type="text"
                          className="copy-button"
                          icon={
                            copiedMessageId === index ? (
                              <CheckOutlined />
                            ) : (
                              <CopyOutlined />
                            )
                          }
                          onClick={() => handleCopy(item.content, index)}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <div className="message-content">
                    {item.role === "loading" ? <LoadingDots /> : item.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <TextArea
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onPressEnter={(e) => {
                  if (!e.shiftKey && !isComposing) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading || streaming}
                placeholder="输入消息，按 Enter 发送，Shift + Enter 换行..."
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <Button
                type="primary"
                className="send-button"
                onClick={sendMessage}
                loading={loading || streaming}
                disabled={!input.trim() || streaming}
                icon={<SendOutlined />}
              >
                {!loading && !streaming && "发送"}
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'knowledge',
      label: '知识库管理',
      children: <KnowledgeBase />,
    },
  ];

  return (
    <div className="app-wrapper">
      <Tabs
        defaultActiveKey="chat"
        items={items}
        className="app-tabs"
      />

      <Modal
        title="添加文本到知识库"
        open={isTextModalVisible}
        onCancel={() => {
          setIsTextModalVisible(false);
          textForm.resetFields();
        }}
        footer={null}
        centered
      >
        <Form form={textForm} onFinish={handleTextSubmit} layout="vertical">
          <Form.Item
            name="filename"
            label="文件名"
            rules={[{ required: true, message: "请输入文件名" }]}
          >
            <Input placeholder="请输入文件名（不需要.txt后缀）" />
          </Form.Item>
          <Form.Item
            name="content"
            label="文本内容"
            rules={[{ required: true, message: "请输入文本内容" }]}
          >
            <TextArea rows={6} placeholder="请输入要添加到知识库的文本内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
