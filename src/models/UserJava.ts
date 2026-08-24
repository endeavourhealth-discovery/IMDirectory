import { UserRole } from "@endeavour/vue-library/enums";
import { PrimeVuePresetThemes } from "@endeavour/vue-library/enums";
import { PrimeVueColors } from "@endeavour/vue-library/enums";
import { FontSize } from "@endeavour/vue-library/enums";
import { NamespacePermissionJavaSchema } from "@endeavour/vue-library/models";
import { RecentActivityItemDtoSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface UserJava {
//   id?: string;
//   username?: string;
//   email?: string;
//   displayName?: string;
//   password?: string;
//   avatar?: string;
//   roles?: UserRole[];
//   organisations?: string[];
//   theme?: PrimeVuePresetThemes;
//   primaryColor?: PrimeVueColors;
//   surfaceColor?: PrimeVueColors;
//   darkMode?: boolean;
//   fontSize?: FontSize;
//   favourites?: string[];
//   recentActivity?: RecentActivityItemDto[];
//   namespaces?: NamespacePermissionJava[];
// }

export const UserJavaSchema = z.strictObject({
  id: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  displayName: z.string().optional(),
  password: z.string().optional(),
  avatar: z.string().optional(),

  roles: z.enum(UserRole).optional(),
  organisations: z.array(z.string()).optional(),

  theme: z.enum(PrimeVuePresetThemes).optional(),
  primaryColor: z.enum(PrimeVueColors).optional(),
  surfaceColor: z.enum(PrimeVueColors).optional(),

  darkMode: z.boolean().optional(),

  fontSize: z.enum(FontSize).optional(),

  favourites: z.array(z.string()).optional(),
  recentActivity: z.array(RecentActivityItemDtoSchema).optional(),
  namespaces: z.array(NamespacePermissionJavaSchema).optional()
});

export type UserJava = z.infer<typeof UserJavaSchema>;

export function isUserJava(value: unknown): value is UserJava {
  return UserJavaSchema.safeParse(value).success;
}
