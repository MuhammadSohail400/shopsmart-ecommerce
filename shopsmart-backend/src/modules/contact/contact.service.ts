import { contactRepository } from './contact.repository';
import type { CreateContactMessageBody } from './contact.validators';

export const contactService = {
  async submitMessage(data: CreateContactMessageBody) {
    const message = await contactRepository.createMessage(data);
    return {
      message: 'Your inquiry has been received. Our support team will respond shortly.',
      id: message.id,
      createdAt: message.createdAt,
    };
  },

  async listMessages(status?: string) {
    return contactRepository.listMessages(status);
  },

  async updateMessageStatus(id: string, status: string) {
    return contactRepository.updateStatus(id, status);
  },

  async deleteMessage(id: string) {
    return contactRepository.deleteMessage(id);
  },
};
