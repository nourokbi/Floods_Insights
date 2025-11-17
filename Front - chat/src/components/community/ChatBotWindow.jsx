import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import './ChatBotWindow.css';

export default function ChatBotWindow() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            sender: "bot",
            text: "مرحباً! أنا روبوت الدردشة المتخصص في نظم المعلومات الجغرافية. كيف يمكنني المساعدة؟",
        },
    ])
    const [chatInput, setChatInput] = useState("");
    const chatBodyRef = useRef(null);
    const sendMessage = async () => {
        const message = chatInput.trim();
        if (message === "") return;

        setChatMessages((prev) => [...prev, { sender: "user", text: message }]);

        setChatMessages((prev) => [
            ...prev,
            { sender: "bot", text: "جاري الكتابة...", loading: true },
        ]);
        setChatInput("");

        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message }),
            });

            const data = await response.json();

            setChatMessages((prev) => prev.filter((msg) => !msg.loading));
            setChatMessages((prev) => [
                ...prev,
                { sender: "bot", text: data.response },
            ]);
        } catch (error) {
            console.error("Error communicating with the chatbot server:", error);
            setChatMessages((prev) => prev.filter((msg) => !msg.loading));
            setChatMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "عذراً، حدث خطأ في الاتصال بالخادم. تأكد من تشغيل Node.js server على المنفذ 3000.",
                },
            ]);
        }
    };
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatMessages, isChatOpen]);


    return (<>
        <button
            id="chat-toggle-btn"
            className="chat-toggle-btn"
            onClick={() => setIsChatOpen(prev => !prev)}
        >
            <MessageSquare />
        </button>
        <div id="chat-window" className={`chat-window ${isChatOpen ? '' : 'hidden'}`}>
            <div className="chat-header">
                <h3>Let's Chat!</h3>
                <button
                    id="chat-close-btn"
                    className="chat-close-btn"
                    onClick={() => setIsChatOpen(false)}
                >
                    <X />
                </button>
            </div>
            <div id="chat-body" className="chat-body" ref={chatBodyRef}>
                {chatMessages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}-message`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    id="user-input"
                    placeholder="Write your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                />
                <button id="send-btn" className="send-btn" onClick={sendMessage}>
                    <Send />
                </button>
            </div>
        </div>
    </>
    );
};