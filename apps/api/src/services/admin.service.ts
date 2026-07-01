import { prisma } from "../lib/prisma"

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, isAdmin: true, createdAt: true,
      _count: { select: { forms: true } }
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllForms(page: number, limit: number) {
  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.form.count()
  ])
  return { forms, total, page, pages: Math.ceil(total / limit) }
}