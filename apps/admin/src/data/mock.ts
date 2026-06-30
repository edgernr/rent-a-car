// Sample data ported from Vendor Dashboard.dc.html — used for views that have
// no backend yet (bookings/clients/cleaning). Replaced with live data in Phase 2/3.

export type BookingStatus = 'active' | 'ending' | 'upcoming' | 'completed';
export type Priority = 'high' | 'medium' | 'low';

export const BOOKINGS: {
  id: string;
  client: string;
  country: string;
  car: string;
  start: string;
  end: string;
  daysLeft: number;
  status: BookingStatus;
  total: number;
  loc: string;
}[] = [
  { id: 'b1', client: 'Lena Brandt', country: 'Germany', car: 'Chevrolet Tracker', start: 'Jun 26', end: 'Jul 2', daysLeft: 2, status: 'ending', total: 336, loc: 'Samarkand drop' },
  { id: 'b2', client: 'Aiko Tanaka', country: 'Japan', car: 'Chevrolet Cobalt', start: 'Jun 28', end: 'Jul 3', daysLeft: 3, status: 'active', total: 168, loc: 'Downtown hub' },
  { id: 'b3', client: 'James Okonkwo', country: 'United Kingdom', car: 'Chevrolet Captiva', start: 'Jun 20', end: 'Jun 30', daysLeft: 0, status: 'ending', total: 650, loc: 'Tashkent Airport' },
  { id: 'b4', client: 'Marco Rossi', country: 'Italy', car: 'Chevrolet Malibu', start: 'Jul 1', end: 'Jul 8', daysLeft: 9, status: 'upcoming', total: 385, loc: 'Tashkent Airport' },
  { id: 'b5', client: 'Sofia García', country: 'Spain', car: 'BYD Song Plus EV', start: 'Jun 29', end: 'Jul 5', daysLeft: 5, status: 'active', total: 348, loc: 'Downtown hub' },
  { id: 'b6', client: 'Chen Wei', country: 'China', car: 'Chevrolet Tahoe', start: 'Jul 2', end: 'Jul 6', daysLeft: 10, status: 'upcoming', total: 480, loc: 'Tashkent Airport' },
  { id: 'b7', client: 'Omar Farouk', country: 'UAE', car: 'Chery Tiggo 8 Pro', start: 'Jun 22', end: 'Jun 29', daysLeft: -1, status: 'completed', total: 378, loc: 'Downtown hub' },
];

export const CLIENTS: {
  name: string;
  email: string;
  country: string;
  trips: number;
  current: string;
  status: BookingStatus;
}[] = [
  { name: 'Lena Brandt', email: 'lena.brandt@mail.de', country: 'Germany', trips: 3, current: 'Chevrolet Tracker', status: 'active' },
  { name: 'Aiko Tanaka', email: 'aiko.t@mail.jp', country: 'Japan', trips: 2, current: 'Chevrolet Cobalt', status: 'active' },
  { name: 'James Okonkwo', email: 'j.okonkwo@mail.co.uk', country: 'United Kingdom', trips: 1, current: 'Chevrolet Captiva', status: 'ending' },
  { name: 'Sofia García', email: 'sofia.g@mail.es', country: 'Spain', trips: 4, current: 'BYD Song Plus EV', status: 'active' },
  { name: 'Marco Rossi', email: 'm.rossi@mail.it', country: 'Italy', trips: 1, current: '—', status: 'upcoming' },
  { name: 'Chen Wei', email: 'chen.wei@mail.cn', country: 'China', trips: 2, current: '—', status: 'upcoming' },
];

export const CLEANING: {
  id: string;
  car: string;
  plate: string;
  returned: string;
  location: string;
  priority: Priority;
}[] = [
  { id: 'c1', car: 'Chevrolet Captiva', plate: '01 D 234 HI', returned: 'Today 2:10 PM', location: 'Tashkent Airport', priority: 'high' },
  { id: 'c2', car: 'Chery Tiggo 8 Pro', plate: '01 H 246 PQ', returned: 'Today 1:40 PM', location: 'Downtown hub', priority: 'high' },
  { id: 'c3', car: 'Chevrolet Gentra', plate: '01 A 901 RS', returned: 'Today 11:20 AM', location: 'Samarkand drop', priority: 'medium' },
  { id: 'c4', car: 'Chevrolet Equinox', plate: '01 B 345 TU', returned: 'Today 9:05 AM', location: 'Tashkent Airport', priority: 'medium' },
  { id: 'c5', car: 'Chevrolet Spark', plate: '01 C 678 VW', returned: 'Yesterday 7:30 PM', location: 'Downtown hub', priority: 'low' },
];

export const CHART = [
  { d: 'Mon', v: 5 },
  { d: 'Tue', v: 7 },
  { d: 'Wed', v: 6 },
  { d: 'Thu', v: 9 },
  { d: 'Fri', v: 8 },
  { d: 'Sat', v: 11 },
  { d: 'Sun', v: 6 },
];

export const BOOKING_STATUS: Record<BookingStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: '#3ECABB', bg: 'rgba(43,184,173,.15)' },
  ending: { label: 'Ending soon', fg: '#ECB65E', bg: 'rgba(224,169,59,.16)' },
  upcoming: { label: 'Upcoming', fg: '#7CC6ED', bg: 'rgba(58,160,214,.16)' },
  completed: { label: 'Completed', fg: '#8DA2AA', bg: 'rgba(141,162,170,.14)' },
};

export const PRIORITY: Record<Priority, { label: string; fg: string; bg: string; dot: string }> = {
  high: { label: 'High', fg: '#E6A684', bg: 'rgba(217,140,106,.17)', dot: '#D98C6A' },
  medium: { label: 'Medium', fg: '#ECB65E', bg: 'rgba(224,169,59,.16)', dot: '#E0A93B' },
  low: { label: 'Low', fg: '#3ECABB', bg: 'rgba(43,184,173,.15)', dot: '#2BB8AD' },
};

export const AVATARS = [
  'linear-gradient(135deg,#2BB8AD,#3AA0D6)',
  'linear-gradient(135deg,#E0A93B,#D98C6A)',
  'linear-gradient(135deg,#3AA0D6,#6B8DD6)',
  'linear-gradient(135deg,#2BB8AD,#7BC86B)',
];

export const initials = (n: string): string =>
  n
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
