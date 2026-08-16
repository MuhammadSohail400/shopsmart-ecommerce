import { useMutation } from '@tanstack/react-query';
import { newsletterService } from '@/services/newsletter.service';

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (email: string) => newsletterService.subscribe(email),
  });
}
