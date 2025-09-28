import { TFunction } from 'i18next';

/**
 * Format a date string with i18n support for relative time display
 * @param dateString - The date string to format
 * @param t - The i18n translation function
 * @param locale - The current locale (optional, defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatRelativeTime(
  dateString: string,
  t: TFunction,
  locale: string = 'en-US'
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) {
    return t('time.justNow');
  } else if (diffMins === 1) {
    return t('time.minuteAgo', { count: 1 });
  } else if (diffMins < 60) {
    return t('time.minutesAgo', { count: diffMins });
  } else if (diffHours === 1) {
    return t('time.hourAgo', { count: 1 });
  } else if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours });
  } else if (diffDays === 1) {
    return t('time.dayAgo', { count: 1 });
  } else if (diffDays < 7) {
    return t('time.daysAgo', { count: diffDays });
  } else if (diffWeeks === 1) {
    return t('time.weekAgo', { count: 1 });
  } else if (diffWeeks < 4) {
    return t('time.weeksAgo', { count: diffWeeks });
  } else if (diffMonths === 1) {
    return t('time.monthAgo', { count: 1 });
  } else if (diffMonths < 12) {
    return t('time.monthsAgo', { count: diffMonths });
  } else {
    // For dates older than a year, use localized date format
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
}

/**
 * Format a date with edited indicator if applicable
 * @param createdAt - The creation date string
 * @param updatedAt - The update date string (optional)
 * @param t - The i18n translation function
 * @param locale - The current locale (optional)
 * @returns Formatted date string with optional edited indicator
 */
export function formatDateWithEdit(
  createdAt: string,
  updatedAt: string | undefined,
  t: TFunction,
  locale?: string
): string {
  const formattedDate = formatRelativeTime(createdAt, t, locale);
  const isEdited = updatedAt && updatedAt !== createdAt;

  if (isEdited) {
    return `${formattedDate} ${t('time.edited')}`;
  }

  return formattedDate;
}