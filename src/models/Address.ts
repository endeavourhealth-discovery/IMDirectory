import z from "zod";

// export interface Address {
//   Flat: string;
//   Building: string;
//   Number: string;
//   Dependent_thoroughfare: string;
//   Street: string;
//   Dependent_locality: string;
//   Locality: string;
//   Town: string;
//   Postcode: string;
//   Organisation: string;
// }

export const AddressSchema = z.strictObject({
  flat: z.string(),
  building: z.string(),
  number: z.string(),
  dependent_throughfare:z.string(),
  street:z.string(),
  dependent_locality:z.string(),
  locality:z.string(),
  town:z.string(),
  postcode:z.string(),
  organisation:z.string()
})

export type Address = z.output<typeof AddressSchema>

export function  isAddress(value:unknown): value is Address {
  return AddressSchema.safeParse(value).success
}
