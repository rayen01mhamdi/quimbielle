import { prisma } from "../lib/prisma"

export async function getSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } })
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId } })
  }
  return settings
}

export async function updateSettings(userId: string, data: {
  inkColor?: string
  fontSize?: number
  pdfMode?: string
  xOffset?: number
  yOffset?: number
}) {
  return await prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })
}