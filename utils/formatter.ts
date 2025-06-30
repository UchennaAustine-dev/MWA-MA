import { format, isValid, parseISO } from "date-fns";

export const formatDate = (
  dateString: string | null | undefined
): string | null => {
  if (!dateString) return null;

  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) {
      // Invalid date string
      return null;
    }
    return format(parsedDate, "yyyy-MM-dd"); // Correct format for API
  } catch {
    return null;
  }
};

export function normalizeTraveler(t: any) {
  if (t.name && t.name.firstName && t.name.lastName) {
    return {
      ...t,
      dateOfBirth: formatDate(t.dateOfBirth), // Normalize dateOfBirth here
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

  // If flat structure, convert to nested and normalize dateOfBirth
  return {
    ...t,
    dateOfBirth: formatDate(t.dateOfBirth),
    name: {
      firstName: t.firstName,
      lastName: t.lastName,
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
