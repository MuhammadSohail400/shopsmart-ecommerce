import { useMutation } from '@tanstack/react-query';
import { contactService, CreateContactMessagePayload } from '@/services/contact.service';

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (data: CreateContactMessagePayload) => contactService.submitMessage(data),
  });
}
