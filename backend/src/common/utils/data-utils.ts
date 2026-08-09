export class DateUtils {
  static createUTCDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  static toUTC(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  static toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  static normalizeToUTC(date: Date): Date {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  static createDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month - 1, day));
  }
}