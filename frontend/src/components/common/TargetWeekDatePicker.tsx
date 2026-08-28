import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarDays,
  Clock,
  RotateCcw
} from 'lucide-react';
import {
  getStandardTargetWeeks,
  TargetWeekOption,
  formatDateIso,
  formatDateRangeLabel,
  formatMonthDayYear,
  getStandardWeekNumber
} from '../../utils/dateWeekUtils';

export interface DateRangeState {
  startDate: string; // "2026-06-21"
  endDate: string; // "2026-06-27"
  label: string; // "Week 26 (Jun 21 - Jun 27, 2026)" or "Custom: Jun 15 - Jul 05, 2026"
  weekNumber?: number;
  isCustom?: boolean;
}

interface TargetWeekDatePickerProps {
  currentRange: DateRangeState;
  onRangeChange: (range: DateRangeState) => void;
}

export const TargetWeekDatePicker: React.FC<TargetWeekDatePickerProps> = ({
  currentRange,
  onRangeChange
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'weeks' | 'calendar'>('weeks');

  // Calendar month state (default to June 2026)
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(5); // 0-indexed (5 = June)

  // Custom selection staging
  const [tempStart, setTempStart] = useState<string>(currentRange.startDate);
  const [tempEnd, setTempEnd] = useState<string>(currentRange.endDate);

  const standardWeeks = getStandardTargetWeeks(calendarYear);

  // Month navigation
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleSelectStandardWeek = (week: TargetWeekOption) => {
    onRangeChange({
      startDate: week.startDate,
      endDate: week.endDate,
      label: week.label,
      weekNumber: week.weekNumber,
      isCustom: false
    });
    setIsOpen(false);
  };

  const handleApplyPreset = (presetType: 'this_week' | 'last_week' | 'last_2_weeks' | 'month_june' | 'month_july') => {
    if (presetType === 'this_week') {
      const w26 = standardWeeks.find((w) => w.weekNumber === 26) || standardWeeks[4];
      handleSelectStandardWeek(w26);
    } else if (presetType === 'last_week') {
      const w25 = standardWeeks.find((w) => w.weekNumber === 25) || standardWeeks[3];
      handleSelectStandardWeek(w25);
    } else if (presetType === 'last_2_weeks') {
      onRangeChange({
        startDate: '2026-06-14',
        endDate: '2026-06-27',
        label: 'Weeks 25–26 (Jun 14 - Jun 27, 2026)',
        weekNumber: 26,
        isCustom: false
      });
      setIsOpen(false);
    } else if (presetType === 'month_june') {
      onRangeChange({
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        label: 'Full Month: June 2026 (Weeks 23–27)',
        isCustom: true
      });
      setIsOpen(false);
    } else if (presetType === 'month_july') {
      onRangeChange({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        label: 'Full Month: July 2026 (Weeks 27–31)',
        isCustom: true
      });
      setIsOpen(false);
    }
  };

  // Calendar Day Generation
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDayClick = (day: number) => {
    const d = new Date(calendarYear, calendarMonth, day);
    const dateStr = formatDateIso(d);

    if (!tempStart || (tempStart && tempEnd)) {
      // Start a fresh selection
      setTempStart(dateStr);
      setTempEnd('');
    } else {
      // Finish selection
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleApplyCustomCalendar = () => {
    if (!tempStart) return;
    const finalEnd = tempEnd || tempStart;
    const sDate = new Date(`${tempStart}T00:00:00`);
    const eDate = new Date(`${finalEnd}T00:00:00`);
    const weekNo = getStandardWeekNumber(sDate);
    const rangeText = formatDateRangeLabel(sDate, eDate);

    onRangeChange({
      startDate: tempStart,
      endDate: finalEnd,
      label: `Custom: ${rangeText} (Pickup Dates)`,
      weekNumber: weekNo,
      isCustom: true
    });
    setIsOpen(false);
  };

  const handleResetToCurrentWeek = () => {
    const w26 = standardWeeks.find((w) => w.weekNumber === 26) || standardWeeks[4];
    handleSelectStandardWeek(w26);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        id="btn-target-week-selector"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-[#D8E1EB] hover:border-[#1769FF] rounded-lg px-3 py-1.5 shadow-sm hover:bg-[#F8FAFC] transition-all text-xs font-semibold text-[#0F172A] cursor-pointer group"
      >
        <span className="p-1 rounded bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center">
          <CalendarIcon className="w-3.5 h-3.5" />
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-[#64748B] font-bold">
            Pickup Date Range
          </span>
          <span className="font-bold text-[#0F172A] text-xs">
            {currentRange.label}
          </span>
        </div>
        <span className="material-symbols-outlined text-[#64748B] text-base group-hover:text-[#1769FF] transition-colors ml-1">
          expand_more
        </span>
      </button>

      {/* Dropdown Menu & Calendar Drawer */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[380px] sm:w-[460px] bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0F172A]">Select Target Week & Timeframe</h4>
                <p className="text-[10px] text-[#64748B]">Filter loads & actuals by load pickup date</p>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewTab('weeks')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewTab === 'weeks'
                    ? 'bg-white text-[#1769FF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Standard Weeks
              </button>
              <button
                type="button"
                onClick={() => setViewTab('calendar')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewTab === 'calendar'
                    ? 'bg-white text-[#1769FF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Custom Calendar
              </button>
            </div>
          </div>

          {/* TAB 1: STANDARD TARGET WEEKS LIST */}
          {viewTab === 'weeks' && (
            <div className="space-y-3">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('this_week')}
                  className="px-2 py-1 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] font-bold text-[10px] rounded-md transition-colors"
                >
                  Active Week 26
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('last_week')}
                  className="px-2 py-1 bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] font-semibold text-[10px] rounded-md transition-colors"
                >
                  Last Week (W25)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('last_2_weeks')}
                  className="px-2 py-1 bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] font-semibold text-[10px] rounded-md transition-colors"
                >
                  Last 2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('month_june')}
                  className="px-2 py-1 bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] font-semibold text-[10px] rounded-md transition-colors"
                >
                  Full June 2026
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('month_july')}
                  className="px-2 py-1 bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] font-semibold text-[10px] rounded-md transition-colors"
                >
                  Full July 2026
                </button>
              </div>

              {/* Scrollable Standard Weeks List */}
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {standardWeeks.map((week) => {
                  const isSelected =
                    currentRange.startDate === week.startDate &&
                    currentRange.endDate === week.endDate;

                  return (
                    <button
                      key={`week-${week.weekNumber}`}
                      type="button"
                      onClick={() => handleSelectStandardWeek(week)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1769FF] text-white font-bold shadow-sm'
                          : 'hover:bg-[#F8FAFC] text-[#0F172A] border border-transparent hover:border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : week.isCurrent
                              ? 'bg-[#EFF6FF] text-[#1769FF]'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          W{week.weekNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">
                              Week {week.weekNumber}
                            </span>
                            {week.isCurrent && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                  isSelected
                                    ? 'bg-white text-[#1769FF]'
                                    : 'bg-[#EAF7EE] text-[#15803D]'
                                }`}
                              >
                                Current Baseline
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] block mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-[#64748B]'
                            }`}
                          >
                            {week.rangeLabel}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CALENDAR FOR CUSTOM PICKUP DATE RANGE */}
          {viewTab === 'calendar' && (
            <div className="space-y-3">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="font-bold text-xs text-[#0F172A]">
                  {monthNames[calendarMonth]} {calendarYear}
                </div>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#64748B]">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Empty slots before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDateIso(new Date(calendarYear, calendarMonth, day));
                  const isStart = tempStart === dateStr;
                  const isEnd = tempEnd === dateStr;
                  const isInRange =
                    tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;

                  let cellClass = 'hover:bg-[#EFF6FF] text-[#0F172A]';
                  if (isStart || isEnd) {
                    cellClass = 'bg-[#1769FF] text-white font-bold rounded-lg shadow-xs';
                  } else if (isInRange) {
                    cellClass = 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold rounded-none';
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`h-7 flex items-center justify-center text-xs transition-colors rounded-lg ${cellClass}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Selection Summary */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-[11px] space-y-1">
                <div className="flex justify-between items-center text-[#64748B]">
                  <span>Pickup Start Date:</span>
                  <strong className="text-[#0F172A]">
                    {tempStart ? formatMonthDayYear(new Date(`${tempStart}T00:00:00`)) : 'Select date'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[#64748B]">
                  <span>Pickup End Date:</span>
                  <strong className="text-[#0F172A]">
                    {tempEnd ? formatMonthDayYear(new Date(`${tempEnd}T00:00:00`)) : tempStart ? 'Select end date (or click Apply)' : 'Select date'}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTempStart('');
                    setTempEnd('');
                  }}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg text-xs font-semibold"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!tempStart}
                  onClick={handleApplyCustomCalendar}
                  className="flex-1 py-1.5 bg-[#1769FF] disabled:bg-[#94A3B8] text-white font-bold rounded-lg text-xs hover:bg-[#1769FF]/90 transition-all shadow-sm cursor-pointer"
                >
                  Apply Pickup Date Range
                </button>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#1769FF]" />
              Pickup date indexing ensures load pay matches shipping week
            </span>
            <button
              type="button"
              onClick={handleResetToCurrentWeek}
              className="text-[#1769FF] hover:underline font-bold flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset W26
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
