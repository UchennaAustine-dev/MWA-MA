// import { format, isValid, parseISO } from "date-fns";

// export const formatDate = (
//   dateString: string | null | undefined
// ): string | null => {
//   if (!dateString) return null;

//   try {
//     const parsedDate = parseISO(dateString);
//     if (!isValid(parsedDate)) {
//       return null;
//     }
//     return format(parsedDate, "yyyy-MM-dd");
//   } catch {
//     return null;
//   }
// };

// export function normalizeTraveler(t: any) {
//   // Helper to check if a string is valid and non-empty
//   const isNonEmptyString = (str: any) =>
//     typeof str === "string" && str.trim().length > 0;

//   // Case 1: Nested name object exists and has valid firstName & lastName
//   if (
//     t.name &&
//     isNonEmptyString(t.name.firstName) &&
//     isNonEmptyString(t.name.lastName)
//   ) {
//     return {
//       ...t,
//       dateOfBirth: formatDate(t.dateOfBirth),
//       contact: {
//         emailAddress: t.contact?.emailAddress || t.email,
//         phones:
//           t.contact?.phones ||
//           t.phones ||
//           (t.phone
//             ? [
//                 {
//                   deviceType: "MOBILE",
//                   countryCallingCode:
//                     t.contact?.countryCallingCode || t.countryCode,
//                   number: t.contact?.number || t.phone,
//                 },
//               ]
//             : []),
//       },
//       documents: t.documents || [],
//     };
//   }

//   // Case 2: Flat structure — validate flat firstName and lastName
//   if (!isNonEmptyString(t.firstName) || !isNonEmptyString(t.lastName)) {
//     console.error(
//       "[normalizeTraveler] Missing firstName or lastName in traveler:",
//       t
//     );
//     // You can throw an error here or handle it gracefully
//     throw new Error("Traveler must have firstName and lastName");
//   }

//   return {
//     ...t,
//     dateOfBirth: formatDate(t.dateOfBirth),
//     name: {
//       firstName: t.firstName.trim(),
//       lastName: t.lastName.trim(),
//     },
//     contact: {
//       emailAddress: t.email,
//       phones:
//         t.phones ||
//         (t.phone
//           ? [
//               {
//                 deviceType: "MOBILE",
//                 countryCallingCode: t.countryCode,
//                 number: t.phone,
//               },
//             ]
//           : []),
//     },
//     documents: t.documents || [],
//   };
// }
import { format, isValid, parseISO } from "date-fns";

// Map full country names to ISO 2-letter codes for conversion
const countryNameToISO: Record<string, string> = {
  Nigeria: "NG",
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  India: "IN",
  China: "CN",
  Japan: "JP",
  // Add more countries as needed
};

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

const countryCallingCodes: Record<string, string> = {
  NG: "234",
  US: "1",
  GB: "44",
  CA: "1",
  AU: "61",
  DE: "49",
  FR: "33",
  IN: "91",
  CN: "86",
  JP: "81",
  // Add more as needed
};

const getISOFromCountryName = (
  name: string | undefined
): string | undefined => {
  if (!name) return undefined;
  return countryNameToISO[name.trim()] || undefined;
};

const getCallingCode = (isoCode: string | undefined): string | undefined => {
  if (!isoCode) return undefined;
  const code = countryCallingCodes[isoCode.toUpperCase()];
  return code || undefined;
};

const sanitizePhoneNumber = (phone: string | undefined): string | undefined => {
  if (!phone) return undefined;
  return phone.replace(/\D/g, "");
};

export function normalizeTraveler(t: any) {
  const isNonEmptyString = (str: any) =>
    typeof str === "string" && str.trim().length > 0;

  // Convert countryCode from full name to ISO if needed
  let countryCode = t.countryCode;
  if (countryCode && countryCode.length > 2) {
    const iso = getISOFromCountryName(countryCode);
    if (iso) {
      countryCode = iso;
    }
  }

  // Prefer contact.countryCallingCode (e.g. "+234") or fallback to converted countryCode (ISO)
  const rawCountryCode = t.contact?.countryCallingCode || countryCode;

  const countryCallingCode = rawCountryCode?.startsWith("+")
    ? rawCountryCode.replace("+", "")
    : getCallingCode(rawCountryCode) || rawCountryCode;

  if (
    t.name &&
    isNonEmptyString(t.name.firstName) &&
    isNonEmptyString(t.name.lastName)
  ) {
    return {
      ...t,
      countryCode, // ensure ISO code here
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
                  countryCallingCode,
                  number: sanitizePhoneNumber(t.contact?.number || t.phone),
                },
              ]
            : []),
      },
      documents: t.documents || [],
    };
  }

  if (!isNonEmptyString(t.firstName) || !isNonEmptyString(t.lastName)) {
    throw new Error("Traveler must have firstName and lastName");
  }

  return {
    ...t,
    countryCode,
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
                countryCallingCode,
                number: sanitizePhoneNumber(t.phone),
              },
            ]
          : []),
    },
    documents: t.documents || [],
  };
}
