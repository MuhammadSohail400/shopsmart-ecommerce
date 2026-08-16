import { newsletterRepository } from './newsletter.repository';

export const newsletterService = {
  async subscribe(email: string) {
    const subscriber = await newsletterRepository.upsertSubscriber(email);
    return {
      message: 'Successfully subscribed to the newsletter',
      email: subscriber.email,
      subscribedAt: subscriber.createdAt,
    };
  },
};
