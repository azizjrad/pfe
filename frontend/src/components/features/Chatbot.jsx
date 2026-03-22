import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: t("chatbot.greeting"),
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const autoResizeTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      type: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: botResponse,
          time: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("prix") || lowerMessage.includes("tarif")) {
      return t("chatbot.responses.pricing");
    } else if (
      lowerMessage.includes("réserver") ||
      lowerMessage.includes("reservation") ||
      lowerMessage.includes("reserver")
    ) {
      return t("chatbot.responses.booking");
    } else if (
      lowerMessage.includes("horaire") ||
      lowerMessage.includes("ouvert") ||
      lowerMessage.includes("fermé")
    ) {
      return t("chatbot.responses.hours");
    } else if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("téléphone") ||
      lowerMessage.includes("email")
    ) {
      return t("chatbot.responses.contact");
    } else if (
      lowerMessage.includes("agence") ||
      lowerMessage.includes("adresse") ||
      lowerMessage.includes("où")
    ) {
      return t("chatbot.responses.location");
    } else if (
      lowerMessage.includes("bonjour") ||
      lowerMessage.includes("salut") ||
      lowerMessage.includes("coucou")
    ) {
      return t("chatbot.responses.greeting");
    } else if (lowerMessage.includes("merci")) {
      return t("chatbot.responses.thanks");
    } else {
      return t("chatbot.responses.default");
    }
  };

  const quickQuestions = [
    t("chatbot.faq.q1"),
    t("chatbot.faq.q2"),
    t("chatbot.faq.q3"),
    t("chatbot.faq.q4"),
  ];

  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          aria-label={t("chatbot.closeButton")}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] sm:hidden"
        />
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("chatbot.openButton")}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <svg
          className="w-8 h-8 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 w-full h-[100dvh] bg-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[390px] sm:h-[620px] sm:rounded-3xl ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none sm:translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {t("chatbot.title")}
              </h3>
              <p className="text-primary-100 text-xs">{t("chatbot.status")}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                  message.type === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed break-words">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === "user"
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-3 py-3 sm:p-4 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">
              {t("chatbot.faqTitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                    requestAnimationFrame(() => autoResizeTextarea());
                  }}
                  className="text-left text-xs sm:text-sm px-3 py-2 bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-600 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="px-3 py-3 sm:p-4 bg-white border-t border-gray-200"
        >
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder={t("chatbot.placeholder")}
              rows={1}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm resize-none overflow-y-auto leading-5 max-h-32"
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="sr-only">{t("chatbot.send")}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
