import http from "./http";

/**
 * Contact service — handles contact message API calls.
 */
export const contactService = {
  /**
   * Submit a public contact form message.
   * Used by the Contact page and does not require authentication.
   */
  submit: async (formData) => {
    const response = await http.post("/contact", formData);
    return response.data;
  },

  /** Get all contact messages (super admin only) */
  getAll: async (params = {}) => {
    const response = await http.get("/admin/contact-messages", { params });
    return response.data;
  },

  /** Mark a contact message as read (super admin only) */
  markAsRead: async (id) => {
    const response = await http.patch(`/admin/contact-messages/${id}/read`);
    return response.data;
  },

  /** Delete a contact message (super admin only) */
  delete: async (id) => {
    const response = await http.delete(`/admin/contact-messages/${id}`);
    return response.data;
  },
};
