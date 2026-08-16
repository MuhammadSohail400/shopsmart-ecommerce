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
};
