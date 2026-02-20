import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Bonjour! Je suis l'assistant virtuel d'Elite Drive. Comment puis-je vous aider aujourd'hui?",
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      return "Nos tarifs commencent à partir de 40 DT/jour pour les véhicules économiques. Pour plus de détails, consultez notre page Véhicules ou contactez-nous au +216 71 123 456.";
    } else if (
      lowerMessage.includes("réserver") ||
      lowerMessage.includes("reservation")
    ) {
      return "Pour réserver un véhicule, visitez notre page Véhicules, choisissez votre voiture préférée et cliquez sur 'Réserver maintenant'. Vous pouvez également nous appeler au +216 71 123 456.";
    } else if (
      lowerMessage.includes("horaire") ||
      lowerMessage.includes("ouvert")
    ) {
      return "Nos agences sont ouvertes du Lundi au Samedi de 8h00 à 19h00, et le Dimanche de 9h00 à 17h00.";
    } else if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("téléphone")
    ) {
      return "Vous pouvez nous contacter au +216 71 123 456 ou par email à contact@elitedrive.tn. Visitez aussi notre page Contact pour plus d'informations.";
    } else if (
      lowerMessage.includes("agence") ||
      lowerMessage.includes("adresse")
    ) {
      return "Nous avons plusieurs agences en Tunisie: Tunis Centre-Ville (45 Avenue Habib Bourguiba), La Marsa, et Sousse. Consultez notre page Contact pour toutes les adresses.";
    } else if (
      lowerMessage.includes("bonjour") ||
      lowerMessage.includes("salut")
    ) {
      return "Bonjour! Comment puis-je vous aider aujourd'hui? Je peux vous renseigner sur nos véhicules, tarifs, réservations, ou nos agences.";
    } else if (lowerMessage.includes("merci")) {
      return "Avec plaisir! N'hésitez pas si vous avez d'autres questions. Bonne journée! 😊";
    } else {
      return "Je suis là pour vous aider! Vous pouvez me poser des questions sur nos véhicules, tarifs, réservations, horaires ou nos agences. Pour une assistance personnalisée, appelez-nous au +216 71 123 456.";
    }
  };

  const quickQuestions = [
    "Quels sont vos tarifs?",
    "Comment réserver?",
    "Où êtes-vous situés?",
    "Quels sont vos horaires?",
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${
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
        className={`fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 flex items-center justify-between">
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
              <h3 className="font-bold text-lg">Elite Drive Assistant</h3>
              <p className="text-primary-100 text-xs">En ligne</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
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
          <div className="p-4 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">
              Questions fréquentes:
            </p>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                  }}
                  className="w-full text-left text-sm px-3 py-2 bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-600 rounded-lg transition-colors"
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
          className="p-4 bg-white border-t border-gray-200"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
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
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
