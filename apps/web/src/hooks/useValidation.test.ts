import { describe, it, expect } from "vitest"
import { validateForm } from "./useValidation"

describe("validateForm", () => {
  it("returns error when beneficiary is missing", () => {
    const errors = validateForm({ montant1: "1000" })
    expect(errors.ordrePayer).toBeDefined()
  })

  it("returns error when amount is missing", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali" })
    expect(errors.montant1).toBeDefined()
  })

  it("returns error when amount is zero", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali", montant1: "0" })
    expect(errors.montant1).toBeDefined()
  })

  it("returns error for invalid date format", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali", montant1: "1000", echeance1: "2024-01-01" })
    expect(errors.echeance1).toBeDefined()
  })

  it("accepts valid date format", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali", montant1: "1000", echeance1: "01/01/2025" })
    expect(errors.echeance1).toBeUndefined()
  })

  it("returns error for RIB with wrong length", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali", montant1: "1000", ribTireur: "123" })
    expect(errors.ribTireur).toBeDefined()
  })

  it("no errors for valid form", () => {
    const errors = validateForm({ ordrePayer: "Ben Ali", montant1: "1000" })
    expect(Object.keys(errors).length).toBe(0)
  })
})