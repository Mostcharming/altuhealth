"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  sender?: "You";
  text: string;
};

export default function Chatbox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello. Welcome to AltuHealth. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    const text = trimmedInput.toLowerCase();
    let response =
      "Thank you for contacting AltuHealth. Our support team will assist you shortly.";

    if (text.includes("plan")) {
      response =
        "We offer Individual, Family, SME, and Corporate healthcare plans. Please visit the Plans section to learn more.";
    }

    if (text.includes("doctor")) {
      response =
        "You can speak with a doctor instantly through our telemedicine platform.";
    }

    if (text.includes("price")) {
      response =
        "Our plans start from ₦15k. You can compare all options in the Plans section.";
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "You", text: trimmedInput },
      { text: response },
    ]);
    setInput("");
  };

  return (
    <div className="chatbox">
      <div className="chat-header">AltuHealth AI Assistant</div>

      <div className="chat-body">
        {messages.map((message, index) => (
          <div key={index} className="chat-msg">
            {message.sender ? <strong>{message.sender}: </strong> : null}
            {message.text}
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
