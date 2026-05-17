export const COLORS = {
  primary: '#FF69B4',
  primaryLight: '#FFB6C1',
  primaryDark: '#DB2779',
  background: '#FFF0F5',
  surface: '#FFFFFF',
  text: '#4A0E2E',
  textLight: '#9D5B7A',
  white: '#FFFFFF',
  black: '#000000',
  heartRed: '#FF1744',
  gold: '#FFD700',
};

export const BIRTHDAY = {
  day: 23,
  month: 10,
  year: 2006,
};

export function getAge(): number {
  const today = new Date();
  const birth = new Date(BIRTHDAY.year, BIRTHDAY.month - 1, BIRTHDAY.day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isBirthdayToday(): boolean {
  const today = new Date();
  return today.getMonth() === BIRTHDAY.month - 1 && today.getDate() === BIRTHDAY.day;
}

export function daysUntilBirthday(): number {
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), BIRTHDAY.month - 1, BIRTHDAY.day);
  if (today > nextBirthday) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const diff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
