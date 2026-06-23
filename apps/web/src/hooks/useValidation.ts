export type ValidationErrors = {
  [key: string]: string
}

export function validateForm(values: Record<string, string>): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!values.ordrePayer || values.ordrePayer.trim().length < 2) {
    errors.ordrePayer = "Le beneficiaire est requis."
  }

  if (!values.montant1) {
    errors.montant1 = "Le montant est requis."
  } else if (isNaN(parseFloat(values.montant1)) || parseFloat(values.montant1) <= 0) {
    errors.montant1 = "Le montant doit etre un nombre positif."
  }

  if (values.echeance1) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = values.echeance1.match(dateRegex)
    if (!match) {
      errors.echeance1 = "Format de date invalide (JJ/MM/AAAA)."
    } else {
      const [, day, month, year] = match
      const date = new Date(`${year}-${month}-${day}`)
      if (isNaN(date.getTime())) {
        errors.echeance1 = "Date invalide."
      }
    }
  }

  if (values.ribTireur) {
    const rib = values.ribTireur.replace(/\s/g, "")
    if (!/^\d{20}$/.test(rib)) {
      errors.ribTireur = "Le RIB doit contenir 20 chiffres."
    }
  }

  if (values.ribTire) {
    const rib = values.ribTire.replace(/\s/g, "")
    if (!/^\d{20}$/.test(rib)) {
      errors.ribTire = "Le RIB doit contenir 20 chiffres."
    }
  }

  return errors
}