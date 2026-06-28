import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  isSameDay, isSameMonth, isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  value: string;       // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha' }: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value + 'T00:00:00') : new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T00:00:00'));
  }, [value]);

  function getDays() {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 }),
    });
  }

  function selectDay(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'));
    setOpen(false);
  }

  const displayValue = selectedDate
    ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    : '';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        <CalendarDays size={15} className="text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-left ${!displayValue ? 'text-gray-400' : ''}`}>
          {displayValue || placeholder}
        </span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[10000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-64 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
              {format(viewDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {getDays().map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrentMonth = isSameMonth(day, viewDate);
              const _isToday = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={[
                    'text-xs w-8 h-8 rounded-lg flex items-center justify-center transition-colors mx-auto',
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : _isToday
                      ? 'border border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                      : isCurrentMonth
                      ? 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                      : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => selectDay(new Date())}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
