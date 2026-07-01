import { prisma } from "../lib/prisma"
import { validateForm } from "@quimbielle/types"

export async function getDefaultTemplate() {
  const template = await prisma.formTemplate.findFirst({
    where: { name: "Lettre de Change — Kambiale" }
  })
  if (!template) throw { status: 404, message: "No template found." }
  return template
}

export async function saveForm(userId: string, values: Record<string, string>, positions: any[], templateId?: string) {
  const errors = validateForm(values)
  if (Object.keys(errors).length > 0) throw { status: 400, message: "Validation failed.", details: errors }

  let tid = templateId
  if (!tid) {
    const template = await getDefaultTemplate()
    tid = template.id
  }

  if (positions && Array.isArray(positions)) {
    for (const pos of positions) {
      await prisma.fieldPosition.upsert({
        where: { userId_templateId_fieldKey: { userId, templateId: tid, fieldKey: pos.key } },
        update: { left: pos.left, top: pos.top, width: pos.width, height: pos.height },
        create: { userId, templateId: tid, fieldKey: pos.key, left: pos.left, top: pos.top, width: pos.width, height: pos.height },
      })
    }
  }

  return await prisma.form.create({
    data: {
      userId,
      templateId: tid,
      beneficiary: values.ordrePayer || "",
      amount: parseFloat(values.montant1) || 0,
      dueDate: values.echeance1 || "",
      ribTireur: values.ribTireur || "",
      ribTire: values.ribTire || "",
      lieuCreation: values.lieuCreation || "",
      dateCreation: values.dateCreation || "",
      status: "DRAFT",
      fieldValues: values,
    },
  })
}

export async function listForms(userId: string, page: number, limit: number, search: string) {
  const where: any = { userId }
  if (search) where.beneficiary = { contains: search, mode: "insensitive" }

  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, beneficiary: true, amount: true, dueDate: true, status: true, createdAt: true, fieldValues: true }
    }),
    prisma.form.count({ where })
  ])

  return { forms, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function getFormById(id: string, userId: string) {
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) throw { status: 404, message: "Form not found." }

  const positions = await prisma.fieldPosition.findMany({
    where: { userId, templateId: form.templateId }
  })

  return {
    ...form,
    values: form.fieldValues,
    positions: positions.map(p => ({ key: p.fieldKey, left: p.left, top: p.top, width: p.width, height: p.height }))
  }
}

export async function deleteForm(id: string, userId: string) {
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) throw { status: 404, message: "Form not found." }
  await prisma.form.delete({ where: { id } })
  return { ok: true }
}

export async function duplicateForm(id: string, userId: string) {
  const original = await prisma.form.findFirst({ where: { id, userId } })
  if (!original) throw { status: 404, message: "Form not found." }

  return await prisma.form.create({
    data: {
      userId: original.userId,
      templateId: original.templateId,
      beneficiary: original.beneficiary,
      amount: original.amount,
      dueDate: original.dueDate,
      ribTireur: original.ribTireur,
      ribTire: original.ribTire,
      lieuCreation: original.lieuCreation,
      dateCreation: original.dateCreation,
      status: "DRAFT",
      fieldValues: original.fieldValues as any,
    }
  })
}