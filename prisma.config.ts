import type { PrismaConfig } from "prisma";

import "dotenv/config";

export default {
  schema: "./configs/prisma/schema.prisma"
} satisfies PrismaConfig;
