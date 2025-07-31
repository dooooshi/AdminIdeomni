/**
 * Format numbers based on locale
 */
export const formatNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format currency based on locale
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage based on locale
 */
export const formatPercentage = (
  value: number, 
  locale: string = 'en-US',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};

/**
 * Format date based on locale
 */
export const formatDate = (
  date: Date | string | number, 
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
};

/**
 * Format time based on locale
 */
export const formatTime = (
  date: Date | string | number, 
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  date: Date | string | number,
  locale: string = 'en-US'
): string => {
  if (!Intl.RelativeTimeFormat) {
    return formatDate(date, locale);
  }

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
  } else if (Math.abs(diffInSeconds) < 2592000) {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  } else if (Math.abs(diffInSeconds) < 31536000) {
    return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number, locale: string = 'en-US'): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  
  return `${formatNumber(size, locale)} ${sizes[i]}`;
};