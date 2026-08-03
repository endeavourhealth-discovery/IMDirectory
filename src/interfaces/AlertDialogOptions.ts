// export interface AlertDialogOptions {
//   title?: string;
//   text?: string;
//   html?: string;
//   icon?: string;
//   confirmButtonText?: string;
//   denyButtonText?: string;
//   cancelButtonText?: string;
//   reverseButtons?: boolean;
//   showCancelButton?: boolean;
//   preConfirm?: (...args: unknown[]) => Promise<boolean>;
// }

import { z } from "zod";

export const AlertDialogOptionsSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  icon: z.string().optional(),
  confirmButtonText: z.string().optional(),
  denyButtonText: z.string().optional(),
  cancelButtonText: z.string().optional(),
  reverseButtons: z.boolean().optional(),
  showCancelButton: z.boolean().optional(),
  preConfirm: z
    .function({
      input: [z.array(z.unknown())],
      output: z.promise(z.boolean()),
    })
    .optional(),
});

export type AlertDialogOptions = z.output<typeof AlertDialogOptionsSchema>;

export function isAlertDialogOptions(value:unknown):value is AlertDialogOptions {
  return AlertDialogOptionsSchema.safeParse(value).success
}
