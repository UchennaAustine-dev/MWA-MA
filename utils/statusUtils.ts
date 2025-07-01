/**
 * Status utility functions
 * Provides consistent status styling across the app
 */

export const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        backgroundColor: "#dcfce7",
        textColor: "#166534",
        borderColor: "#bbf7d0",
      };
    case "PENDING":
      return {
        backgroundColor: "#fef3c7",
        textColor: "#92400e",
        borderColor: "#fde68a",
      };
    case "CANCELLED":
      return {
        backgroundColor: "#fee2e2",
        textColor: "#991b1b",
        borderColor: "#fecaca",
      };
    default:
      return {
        backgroundColor: "#f3f4f6",
        textColor: "#374151",
        borderColor: "#d1d5db",
      };
  }
};
