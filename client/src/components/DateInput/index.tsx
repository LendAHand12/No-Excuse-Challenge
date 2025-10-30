import React from 'react';
import type { RegisterOptions, UseFormRegister } from 'react-hook-form';

type DateInputProps = {
  register: UseFormRegister<any>;
  name: string;
  rules?: RegisterOptions;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

const DateInput: React.FC<DateInputProps> = ({
  register,
  name,
  rules,
  className,
  placeholder = 'DD/MM/YYYY',
  disabled,
}) => {
  const mergedRules: RegisterOptions = {
    ...rules,
    pattern: rules?.pattern || {
      value: /^\d{2}\/\d{2}\/\d{4}$/,
      message: 'Please enter date as DD/MM/YYYY',
    },
    validate: (value: string) => {
      if (!value) return true;
      const parts = value.split('/');
      if (parts.length !== 3) return 'Please enter date as DD/MM/YYYY';
      const [dStr, mStr, yStr] = parts;
      const d = Number(dStr);
      const m = Number(mStr);
      const y = Number(yStr);
      if (!y || !m || !d) return 'Invalid date';
      if (m < 1 || m > 12) return 'Invalid month';
      const daysInMonth = new Date(y, m, 0).getDate();
      if (d < 1 || d > daysInMonth) return 'Invalid day';
      return true;
    },
    onChange: (e: any) => {
      // Allow only digits and '/'; auto-insert '/' at positions 2 and 5 when typing forward
      let v: string = e.target.value || '';
      v = v.replace(/[^0-9/]/g, '');
      v = v.replace(/\/+/g, '/');
      if (/^\d{2}$/.test(v)) v = v + '/';
      else if (/^\d{2}\/\d{2}$/.test(v)) v = v + '/';
      if (v.length > 10) v = v.slice(0, 10);
      e.target.value = v;
      return e;
    },
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      {...register(name, mergedRules)}
    />
  );
};

export default DateInput;


