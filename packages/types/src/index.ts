export type ApiResponse<T> = { data: T; error?: never } | { data?: never; error: string }

export const formFieldKeys = [
  "signatureTire", "echeance1", "lieuA", "ribTire", "montant1",
  "tireur", "ordrePayer", "protestable", "montant2",
  "montantLettre", "montantLettreAr", "lieuCreation", "dateCreation",
  "echeance2", "nomCedant", "codesReserves", "ribTireur",
  "valeurEn", "qte", "domiciliation", "nomAdresseTire",
  "acceptation", "aval", "signatureTireur"
] as const

export type FormFieldKey = typeof formFieldKeys[number]

export type FieldPosition = {
  key: FormFieldKey
  left: number
  top: number
  width: number
  height: number
}

export type FormSavePayload = {
  values: Record<FormFieldKey, string | boolean>
  positions: FieldPosition[]
}