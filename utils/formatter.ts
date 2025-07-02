import { format, isValid, parseISO } from "date-fns";

export const formatDate = (
  dateString: string | null | undefined
): string | null => {
  if (!dateString) return null;

  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) {
      return null;
    }
    return format(parsedDate, "yyyy-MM-dd");
  } catch {
    return null;
  }
};

export function normalizeTraveler(t: any) {
  // Helper to check if a string is valid and non-empty
  const isNonEmptyString = (str: any) =>
    typeof str === "string" && str.trim().length > 0;

  // Case 1: Nested name object exists and has valid firstName & lastName
  if (
    t.name &&
    isNonEmptyString(t.name.firstName) &&
    isNonEmptyString(t.name.lastName)
  ) {
    return {
      ...t,
      dateOfBirth: formatDate(t.dateOfBirth),
      contact: {
        emailAddress: t.contact?.emailAddress || t.email,
        phones:
          t.contact?.phones ||
          t.phones ||
          (t.phone
            ? [
                {
                  deviceType: "MOBILE",
                  countryCallingCode:
                    t.contact?.countryCallingCode || t.countryCode,
                  number: t.contact?.number || t.phone,
                },
              ]
            : []),
      },
      documents: t.documents || [],
    };
  }

  // Case 2: Flat structure — validate flat firstName and lastName
  if (!isNonEmptyString(t.firstName) || !isNonEmptyString(t.lastName)) {
    console.error(
      "[normalizeTraveler] Missing firstName or lastName in traveler:",
      t
    );
    // You can throw an error here or handle it gracefully
    throw new Error("Traveler must have firstName and lastName");
  }

  return {
    ...t,
    dateOfBirth: formatDate(t.dateOfBirth),
    name: {
      firstName: t.firstName.trim(),
      lastName: t.lastName.trim(),
    },
    contact: {
      emailAddress: t.email,
      phones:
        t.phones ||
        (t.phone
          ? [
              {
                deviceType: "MOBILE",
                countryCallingCode: t.countryCode,
                number: t.phone,
              },
            ]
          : []),
    },
    documents: t.documents || [],
  };
}
