import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'MM/dd/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const getTodayRange = () => {
  const today = new Date();
  return {
    start: startOfDay(today),
    end: endOfDay(today),
  };
};

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const isDateInPeriod = (date: string, period: 'daily' | 'weekly' | 'monthly', referenceDate: Date = new Date()): boolean => {
  const expenseDate = parseISO(date);
  let range;

  switch (period) {
    case 'daily':
      range = getTodayRange();
      break;
    case 'weekly':
      range = getWeekRange(referenceDate);
      break;
    case 'monthly':
      range = getMonthRange(referenceDate);
      break;
  }

  return isWithinInterval(expenseDate, range);
};

export const getNextRecurrenceDate = (lastDate: string, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): string => {
  const date = parseISO(lastDate);
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = addDays(date, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(date, 1);
      break;
    case 'monthly':
      nextDate = addMonths(date, 1);
      break;
    case 'yearly':
      nextDate = addYears(date, 1);
      break;
  }

  return nextDate.toISOString();
};

export const getDateRange = (start: string, end: string) => {
  return {
    start: parseISO(start),
    end: parseISO(end),
  };
};

