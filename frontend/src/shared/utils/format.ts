import { format as dateFnsFormat } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: es });
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatCedula = (cedula: string): string => {
  // Formato: 1.234.567.890
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatPhone = (phone: string): string => {
  // Formato: (123) 456-7890
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
