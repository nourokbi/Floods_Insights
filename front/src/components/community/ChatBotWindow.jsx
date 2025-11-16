import React from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import './ChatBotWindow.css';
const ChatBotWindow = ({
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    chatBodyRef,
    chatInput,
    setChatInput,
    sendMessage
    
}) => {
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

export default ChatBotWindow;