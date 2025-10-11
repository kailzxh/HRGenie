import { Toaster } from 'sonner';

export function Notifications() {
  return (
    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
    />
  );
}