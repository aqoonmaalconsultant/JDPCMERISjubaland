import { z } from "zod";

export const createProjectLocationSchema = z.object({

  project: z.string().min(1),

  region: z.string().min(1),

  district: z.string().min(1),

  village: z.string().optional(),

  siteName: z
    .string()
    .trim()
    .min(3)
    .max(150),

  latitude: z
    .number()
    .min(-90)
    .max(90),

  longitude: z
    .number()
    .min(-180)
    .max(180),

  locationType: z.enum([
    "Project Site",
    "Office",
    "Warehouse",
    "Hospital",
    "School",
    "Water Point",
    "Borehole",
    "Road",
    "Bridge",
    "Solar Plant",
    "Camp",
    "Other",
  ]),

  status: z.enum([
    "Active",
    "Completed",
    "Inactive",
  ]),

  remarks: z.string().optional(),

});

export const updateProjectLocationSchema =
  createProjectLocationSchema.partial();