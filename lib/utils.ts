import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toLocalTime(date: string) {
  const datestr = new Date(date);
  const localDate = datestr.toLocaleString("sv-SE", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return localDate;
}
export function isDateInCurrentWeek(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();

  const currentDay = today.getDay();
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return inputDate >= startOfWeek && inputDate <= endOfWeek;
}

export function isDateInLastWeek(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  const currentDay = today.getDay();
  const daysToSubtract = currentDay === 0 ? 13 : currentDay + 6;
  const startOfLastWeek = new Date(today);
  startOfLastWeek.setDate(today.getDate() - daysToSubtract);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  endOfLastWeek.setHours(23, 59, 59, 999);

  return inputDate >= startOfLastWeek && inputDate <= endOfLastWeek;
}

export function isDateInNextWeek(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  const currentDay = today.getDay();
  const daysToAdd = currentDay === 0 ? 1 : 8 - currentDay;

  const startOfNextWeek = new Date(today);
  startOfNextWeek.setDate(today.getDate() + daysToAdd);
  startOfNextWeek.setHours(0, 0, 0, 0);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59, 999);

  return inputDate >= startOfNextWeek && inputDate <= endOfNextWeek;
}
