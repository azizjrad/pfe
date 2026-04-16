import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

export const chatbotService = {
  async sendMessage(message, history = []) {
    const response = await http.post("/chatbot/message", {
      message,
      history,
    });
    return normalizeApiResponse(response);
  },
};
