import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { isValidDateString, parseDate, formatDateString } from '../../utils/dateUtils';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  id: string;
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, id, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(parseDate(value) || new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Close the calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update tempValue when value prop changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);
  
  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempValue(newValue);
    
    if (isValidDateString(newValue)) {
      onChange(newValue);
    }
  };
  
  const handleDayClick = (day: number) => {
    if (currentMonth) {
      const newDate = new Date(currentMonth);
      newDate.setDate(day);
      const formattedDate = formatDateString(newDate);
      setTempValue(formattedDate);
      onChange(formattedDate);
      setIsOpen(false);
    }
  };
  
  const handlePrevMonth = () => {
    if (currentMonth) {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth) {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCurrentMonth(newMonth);
    }
  };
  
  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    if (!currentMonth) return [];
    
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const calendarDays = currentMonth ? generateCalendarDays() : [];
  const monthName = currentMonth ? currentMonth.toLocaleString('default', { month: 'long' }) : '';
  const yearName = currentMonth ? currentMonth.getFullYear() : '';
  
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={tempValue}
          onChange={handleInputChange}
          placeholder="dd/mm/yyyy"
          className="w-full p-2 bg-gray-700 rounded pr-8"
        />
        <button
          type="button"
          onClick={toggleCalendar}
          className="absolute right-2 top-2.5 text-gray-300 hover:text-white focus:outline-none"
        >
          <Calendar size={18} />
        </button>
      </div>
      
      {isOpen && (
        <div 
          ref={calendarRef}
          className="absolute z-10 mt-1 bg-gray-700 rounded shadow-lg p-2 w-64"
        >
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-600 rounded"
            >
              &lt;
            </button>
            <div className="font-medium">
              {monthName} {yearName}
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-600 rounded"
            >
              &gt;
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
              <div key={index} className="text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => (
              <div key={index}>
                {day !== null ? (
                  <button
                    onClick={() => handleDayClick(day)}
                    className="w-full p-1 hover:bg-blue-500 rounded text-sm focus:outline-none"
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-full p-1 text-sm invisible">x</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;