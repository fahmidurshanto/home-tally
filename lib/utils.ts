import * as Location from 'expo-location';

// Best-effort device metadata for the Register API (lat, lng, ip_addr).
// Any step that fails falls back to an empty string so registration still proceeds.
export async function getDeviceMeta(): Promise<{ lat: string; lng: string; ip_addr: string }> {
  let lat = '';
  let lng = '';
  let ip_addr = '';

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({});
      lat = String(pos.coords.latitude);
      lng = String(pos.coords.longitude);
    }
  } catch {
    // ignore — keep defaults
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const json = await res.json();
    ip_addr = json.ip ?? '';
  } catch {
    // ignore — keep defaults
  }

  return { lat, lng, ip_addr };
}

export function formatBDT(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return '৳' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function currentMonthPrefix(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getLast30Days(): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function groupByDate(expenses: { date: string }[]): Record<string, typeof expenses> {
  return expenses.reduce((acc, item) => {
    const key = item.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof expenses>);
}
