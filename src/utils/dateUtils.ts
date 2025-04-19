import { format, parse, isValid } from 'date-fns';

// Parse date string in dd/mm/yyyy format to Date object
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(date) ? date : null;
  } catch (error) {
    return null;
  }
};

// Format Date object to dd/mm/yyyy string
export const formatDateString = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Validate date string in dd/mm/yyyy format
export const isValidDateString = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateString)) return false;
  
  const parsed = parseDate(dateString);
  return parsed !== null;
};

// Get date range for a time period from today
export const getDateRangeForPeriod = (periodDays: number, baseDate: Date = new Date()): { fromDate: string, toDate: string } => {
  const toDate = new Date(baseDate);
  const fromDate = new Date(baseDate);
  fromDate.setDate(toDate.getDate() - periodDays + 1);
  
  return {
    fromDate: formatDateString(fromDate),
    toDate: formatDateString(toDate),
  };
};