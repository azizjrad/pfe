import http from "./http";

export const chatbotService = {
  async sendMessage(message, history = []) {
    const response = await http.post("/chatbot/message", {
      message,
      history,
    });
    return response.data;
  },
};
