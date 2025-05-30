import React, { useRef, useState } from "react";
import {
  List,
  Input,
  Button,
  Card,
  message as antdMessage,
  Upload,
} from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import "./App.css";

const { TextArea } = Input;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [kbContent, setKbContent] = useState("");
  const chatListRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  // 自动滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleFileUpload = (file: File) => {
    if (file.type !== "text/plain") {
      antdMessage.error("只支持txt文本文件");
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setKbContent((e.target?.result as string) || "");
      antdMessage.success("知识库已加载");
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
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
        knowledge: kbContent,
      });
      fakeStreamReply(res.data.reply);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "AI回复失败，请稍后重试。" },
      ]);
      antdMessage.error("请求后端失败，请检查服务是否启动");
      setStreaming(false);
      setStreamContent("");
      scrollToBottom();
    }
    setLoading(false);
  };

  return (
    <Card
      title="AI 聊天室 (阿里百炼)"
      style={{ width: 600, margin: "40px auto" }}
    >
      <div style={{ marginBottom: 12 }}>
        <Upload
          beforeUpload={handleFileUpload}
          showUploadList={false}
          accept=".txt"
        >
          <Button icon={<UploadOutlined />}>上传知识库TXT</Button>
        </Upload>
        {kbContent && (
          <span style={{ marginLeft: 12, color: "#52c41a" }}>知识库已加载</span>
        )}
      </div>
      <div
        ref={chatListRef}
        style={{
          height: 360,
          overflowY: "auto",
          overflowX: "auto",
          marginBottom: 16,
          background: "#fafafa",
          borderRadius: 4,
          border: "1px solid #f0f0f0",
          padding: 8,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <List
          dataSource={
            streaming
              ? [...messages, { role: "assistant", content: streamContent }]
              : messages
          }
          renderItem={(item) => (
            <List.Item
              style={{
                display: "flex",
                justifyContent:
                  item.role === "user" ? "flex-end" : "flex-start",
                border: "none",
                padding: "4px 0",
                background: "none",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  background: item.role === "user" ? "#e6f4ff" : "#f5f5f5",
                  color: "#222",
                  borderRadius: 12,
                  padding: "8px 12px",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  marginLeft: item.role === "user" ? 40 : 0,
                  marginRight: item.role === "user" ? 0 : 40,
                }}
              >
                <b style={{ color: "#1677ff" }}>
                  {item.role === "user" ? "我" : "AI"}：
                </b>
                {item.content}
              </div>
            </List.Item>
          )}
          split={false}
        />
      </div>
      <TextArea
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        disabled={loading || streaming}
        placeholder="请输入你的问题..."
        style={{ resize: "none" }}
      />
      <Button
        type="primary"
        onClick={sendMessage}
        loading={loading || streaming}
        style={{ marginTop: 8, float: "right" }}
        disabled={streaming}
      >
        发送
      </Button>
    </Card>
  );
};

export default App;
