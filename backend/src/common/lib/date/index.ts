import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
@Injectable()
export class DateService {
  private dayjs = dayjs;

  getIsoDate() {
    const isoDate = dayjs().toISOString();
    return isoDate;
  }
  getCurrentDate() {
    const currentDate = dayjs().format('YYYY-MM-DD');
    return currentDate;
  }

  getCurrentYear() {
    const currentYear = dayjs().format('YYYY');
    return currentYear;
  }

  getCurrentMonth() {
    const currentMonth = dayjs().format('MM');
    return currentMonth;
  }

  getCurrentDay() {
    const currentDay = dayjs().format('DD');
    return currentDay;
  }

  getCurrentTime(): string {
    return dayjs().format('HH:mm:ss ');
  }

  getCurrentDateTime(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  addDays(days: number, date: string = this.getCurrentDate()): string {
    return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
  }

  addMonths(months: number, date: string = this.getCurrentDate()): string {
    return dayjs(date).add(months, 'month').format('YYYY-MM-DD');
  }

  addYears(years: number, date: string = this.getCurrentDate()): string {
    return dayjs(date).add(years, 'year').format('YYYY-MM-DD');
  }

  addHours(hours: number, date: string = this.getCurrentDateTime()): string {
    return dayjs(date).add(hours, 'hour').format('YYYY-MM-DD HH:mm:ss');
  }

  startOfDay(date: string | Date): string {
    return dayjs(date).startOf('day').toISOString();
  }

  endOfDay(date: string | Date): string {
    return dayjs(date).endOf('day').toISOString();
  }

  getStartOfDay(date: string | Date): string {
    return dayjs(date).startOf('day').toISOString();
  }

  getEndOfDay(date: string | Date): string {
    return dayjs(date).endOf('day').toISOString();
  }

  // get current time in 12 hours format timezone
  getCurrentTimeIn12Hours(): string {
    return dayjs().format('h:mm A');
  }

  // get current time in 24 hours format
  getCurrentTimeIn24Hours(): string {
    return dayjs().format('HH:mm');
  }
}
