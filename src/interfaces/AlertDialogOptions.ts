export interface AlertDialogOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: string;
  confirmButtonText?: string;
  denyButtonText?: string;
  cancelButtonText?: string;
  reverseButtons?: boolean;
  showCancelButton?: boolean;
  preConfirm?: (...args: unknown[]) => Promise<boolean>;
}
