/**
 * Freight & Drayage Standard Week and Calendar Date Utilities
 */

export interface TargetWeekOption {
  weekNumber: number;
  year: number;
  label: string; // e.g. "Week 26 (Jun 21 - Jun 27, 2026)"
  shortLabel: string; // e.g. "W26"
  rangeLabel: string; // e.g. "Jun 21 - Jun 27, 2026"
  startDate: string; // "2026-06-21"
  endDate: string; // "2026-06-27"
  isCurrent?: boolean;
}

export interface DateRangeSelection {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  displayLabel: string;
  weekNumber?: number;
  type: 'standard_week' | 'preset' | 'custom';
}

/**
 * Calculates standard ISO/Calendar week number for a given Date
 */
export function getStandardWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format Date to "Mon DD, YYYY"
 */
export function formatMonthDayYear(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[date.getMonth()];
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

/**
 * Format a range of two dates into "Jun 21 - Jun 27, 2026"
 */
export function formatDateRangeLabel(start: Date, end: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startM = months[start.getMonth()];
  const startD = String(start.getDate()).padStart(2, '0');
  const endM = months[end.getMonth()];
  const endD = String(end.getDate()).padStart(2, '0');
  const startY = start.getFullYear();
  const endY = end.getFullYear();

  if (startY === endY) {
    if (startM === endM) {
      return `${startM} ${startD} - ${endM} ${endD}, ${startY}`;
    }
    return `${startM} ${startD} - ${endM} ${endD}, ${startY}`;
  }
  return `${startM} ${startD}, ${startY} - ${endM} ${endD}, ${endY}`;
}

/**
 * Generates standard list of target weeks for navigation
 */
export function getStandardTargetWeeks(year = 2026): TargetWeekOption[] {
  const weeks: TargetWeekOption[] = [
    {
      weekNumber: 22,
      year,
      label: 'Week 22 (May 24 - May 30, 2026)',
      shortLabel: 'W22',
      rangeLabel: 'May 24 - May 30, 2026',
      startDate: `${year}-05-24`,
      endDate: `${year}-05-30`
    },
    {
      weekNumber: 23,
      year,
      label: 'Week 23 (May 31 - Jun 06, 2026)',
      shortLabel: 'W23',
      rangeLabel: 'May 31 - Jun 06, 2026',
      startDate: `${year}-05-31`,
      endDate: `${year}-06-06`
    },
    {
      weekNumber: 24,
      year,
      label: 'Week 24 (Jun 07 - Jun 13, 2026)',
      shortLabel: 'W24',
      rangeLabel: 'Jun 07 - Jun 13, 2026',
      startDate: `${year}-06-07`,
      endDate: `${year}-06-13`
    },
    {
      weekNumber: 25,
      year,
      label: 'Week 25 (Jun 14 - Jun 20, 2026)',
      shortLabel: 'W25',
      rangeLabel: 'Jun 14 - Jun 20, 2026',
      startDate: `${year}-06-14`,
      endDate: `${year}-06-20`
    },
    {
      weekNumber: 26,
      year,
      label: 'Week 26 (Jun 21 - Jun 27, 2026)',
      shortLabel: 'W26',
      rangeLabel: 'Jun 21 - Jun 27, 2026',
      startDate: `${year}-06-21`,
      endDate: `${year}-06-27`,
      isCurrent: true
    },
    {
      weekNumber: 27,
      year,
      label: 'Week 27 (Jun 28 - Jul 04, 2026)',
      shortLabel: 'W27',
      rangeLabel: 'Jun 28 - Jul 04, 2026',
      startDate: `${year}-06-28`,
      endDate: `${year}-07-04`
    },
    {
      weekNumber: 28,
      year,
      label: 'Week 28 (Jul 05 - Jul 11, 2026)',
      shortLabel: 'W28',
      rangeLabel: 'Jul 05 - Jul 11, 2026',
      startDate: `${year}-07-05`,
      endDate: `${year}-07-11`
    },
    {
      weekNumber: 29,
      year,
      label: 'Week 29 (Jul 12 - Jul 18, 2026)',
      shortLabel: 'W29',
      rangeLabel: 'Jul 12 - Jul 18, 2026',
      startDate: `${year}-07-12`,
      endDate: `${year}-07-18`
    },
    {
      weekNumber: 30,
      year,
      label: 'Week 30 (Jul 19 - Jul 25, 2026)',
      shortLabel: 'W30',
      rangeLabel: 'Jul 19 - Jul 25, 2026',
      startDate: `${year}-07-19`,
      endDate: `${year}-07-25`
    },
    {
      weekNumber: 31,
      year,
      label: 'Week 31 (Jul 26 - Aug 01, 2026)',
      shortLabel: 'W31',
      rangeLabel: 'Jul 26 - Aug 01, 2026',
      startDate: `${year}-07-26`,
      endDate: `${year}-08-01`
    },
    {
      weekNumber: 32,
      year,
      label: 'Week 32 (Aug 02 - Aug 08, 2026)',
      shortLabel: 'W32',
      rangeLabel: 'Aug 02 - Aug 08, 2026',
      startDate: `${year}-08-02`,
      endDate: `${year}-08-08`
    },
    {
      weekNumber: 33,
      year,
      label: 'Week 33 (Aug 09 - Aug 15, 2026)',
      shortLabel: 'W33',
      rangeLabel: 'Aug 09 - Aug 15, 2026',
      startDate: `${year}-08-09`,
      endDate: `${year}-08-15`
    },
    {
      weekNumber: 34,
      year,
      label: 'Week 34 (Aug 16 - Aug 22, 2026)',
      shortLabel: 'W34',
      rangeLabel: 'Aug 16 - Aug 22, 2026',
      startDate: `${year}-08-16`,
      endDate: `${year}-08-22`
    },
    {
      weekNumber: 35,
      year,
      label: 'Week 35 (Aug 23 - Aug 29, 2026)',
      shortLabel: 'W35',
      rangeLabel: 'Aug 23 - Aug 29, 2026',
      startDate: `${year}-08-23`,
      endDate: `${year}-08-29`
    }
  ];
  return weeks;
}

/**
 * Normalizes any date input (Excel serial number, ISO string, MM/DD/YYYY, timestamp, etc.)
 * into a standard YYYY-MM-DD string.
 */
export function normalizeToIsoDate(raw: any): string | null {
  if (raw === undefined || raw === null) return null;
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return null;
    return formatDateIso(raw);
  }
  let str = String(raw).trim();
  if (!str) return null;

  // Month lookup dictionary
  const monthMap: Record<string, string> = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', sept: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // Handle Excel serial numeric dates (e.g. 35000 to 65000, and fractional e.g. 45823.5)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 25000 && num < 75000 && !str.includes('-') && !str.includes('/') && !str.includes(':') && !/[a-zA-Z]/.test(str)) {
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      // Use UTC values for Excel serial date conversion
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  // Handle 8-digit compact YYYYMMDD (e.g. 20260621)
  if (/^\d{8}$/.test(str)) {
    const y = str.substring(0, 4);
    const m = str.substring(4, 6);
    const d = str.substring(6, 8);
    const mm = parseInt(m, 10);
    const dd = parseInt(d, 10);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${y}-${m}-${d}`;
    }
  }

  // Strip trailing time portions like " 00:00:00", " 14:30:00", "T00:00:00.000Z", " 12:00:00 AM"
  if (str.includes('T')) {
    str = str.split('T')[0].trim();
  }
  if (str.includes(' ') && (str.includes(':') || str.toUpperCase().includes('AM') || str.toUpperCase().includes('PM'))) {
    // Only strip if the space separates date and time (not month name and day)
    const spaceParts = str.split(/\s+/);
    if (spaceParts.length >= 2 && (spaceParts[1].includes(':') || spaceParts[1].toUpperCase() === 'AM' || spaceParts[1].toUpperCase() === 'PM')) {
      str = spaceParts[0].trim();
    }
  }

  // Remove ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
  str = str.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

  // Handle text month formats: "15-Jun-2026", "21-MAY-26", "Jun 15, 2026", "15 June 2026"
  const textMonthMatch = str.match(/([a-zA-Z]+)[-/\s]+(\d{1,2})[-/,\s]+(\d{2,4})/) ||
                         str.match(/(\d{1,2})[-/\s]+([a-zA-Z]+)[-/,\s]+(\d{2,4})/) ||
                         str.match(/(\d{2,4})[-/\s]+([a-zA-Z]+)[-/\s]+(\d{1,2})/);
  if (textMonthMatch) {
    let rawM = '';
    let rawD = '';
    let rawY = '';

    if (isNaN(Number(textMonthMatch[1]))) {
      // Month first: "Jun 15, 2026"
      rawM = textMonthMatch[1].toLowerCase();
      rawD = textMonthMatch[2];
      rawY = textMonthMatch[3];
    } else if (isNaN(Number(textMonthMatch[2]))) {
      // Day first: "15-Jun-2026"
      rawD = textMonthMatch[1];
      rawM = textMonthMatch[2].toLowerCase();
      rawY = textMonthMatch[3];
    } else if (isNaN(Number(textMonthMatch[2]))) {
      // Year first: "2026-Jun-15"
      rawY = textMonthMatch[1];
      rawM = textMonthMatch[2].toLowerCase();
      rawD = textMonthMatch[3];
    }

    const mCode = monthMap[rawM] || monthMap[rawM.substring(0, 3)];
    if (mCode) {
      const dCode = rawD.padStart(2, '0');
      let yCode = rawY;
      if (yCode.length === 2) yCode = `20${yCode}`;
      return `${yCode}-${mCode}-${dCode}`;
    }
  }

  // Handle slash formats MM/DD/YYYY, M/D/YY, YYYY/MM/DD
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${y}-${m}-${d}`;
      } else {
        // MM/DD/YYYY or M/D/YY
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        let y = parts[2];
        if (y.length === 2) y = `20${y}`;
        return `${y}-${m}-${d}`;
      }
    }
  }

  // Handle hyphen formats YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${y}-${m}-${d}`;
      } else if (parts[2].length === 4 || parts[2].length === 2) {
        // MM-DD-YYYY or DD-MM-YYYY
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        let y = parts[2];
        if (y.length === 2) y = `20${y}`;
        return `${y}-${m}-${d}`;
      }
    }
  }

  // Handle dot formats DD.MM.YYYY or MM.DD.YYYY
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        let y = parts[2];
        if (y.length === 2) y = `20${y}`;
        return `${y}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
  }

  // Fallback: standard JavaScript Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return formatDateIso(parsed);
  }

  return null;
}

/**
 * Check if a date string falls between startDate and endDate (inclusive)
 */
export function isPickupDateInRange(dateStr: string | undefined | null, startIso: string, endIso: string): boolean {
  if (!dateStr) return false;
  const normalized = normalizeToIsoDate(dateStr);
  if (!normalized) return false;
  return normalized >= startIso && normalized <= endIso;
}

