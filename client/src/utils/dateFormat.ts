/**
 * Format date to DD/MM/YYYY format (Vietnam locale)
 * @param date - Date string, Date object, or timestamp
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string in DD/MM/YYYY or DD/MM/YYYY HH:mm format
 */
export const formatDateVN = (date: string | Date | number, includeTime: boolean = false): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    if (includeTime) {
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date to DD/MM/YYYY HH:mm format (Vietnam locale)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY HH:mm format
 */
export const formatDateTimeVN = (date: string | Date | number): string => {
  return formatDateVN(date, true);
};

