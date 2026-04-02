/**
 * Parse a booking_notice string like "2 days", "12 hours", "1 Day", "3 Days"
 * and return the minimum required advance notice in hours.
 */
export const parseNoticeHours = (notice?: string | null): number => {
  if (!notice) return 0;
  const lower = notice.toLowerCase().trim();
  const num = parseFloat(lower);
  if (isNaN(num)) return 0;
  if (lower.includes("hour")) return num;
  if (lower.includes("day")) return num * 24;
  return 0;
};

export interface DateOption {
  label: string;
  date: string;   // YYYY-MM-DD
  display: string; // "01 Apr"
}

/**
 * Build date options starting from the first valid date given the notice period.
 * Shows 10 dates total from the earliest available one.
 */
export const getAvailableDates = (noticeHours: number): DateOption[] => {
  const options: DateOption[] = [];
  // Check up to 30 days ahead to find 10 valid dates
  for (let i = 0; i <= 30 && options.length < 10; i++) {
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + i);
    candidate.setHours(0, 0, 0, 0);

    const dateStr = candidate.toISOString().split("T")[0];

    // Only include this date if it has at least one available slot
    if (getAvailableSlotsForDate(dateStr, noticeHours).length === 0) continue;

    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(candidate);

    options.push({
      label,
      date: dateStr,
      display: new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" }).format(candidate),
    });
  }

  return options;
};

const ALL_SLOTS = [
  "9:00 AM",
  "10:30 AM",
  "12:00 PM",
  "1:30 PM",
  "3:00 PM",
  "4:30 PM",
  "6:00 PM",
  "7:30 PM",
  "9:00 PM",
];

/** Convert "9:00 AM" / "7:30 PM" → hour (24h) as a decimal */
const slotToHour = (slot: string): number => {
  const [time, meridiem] = slot.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h + m / 60;
  if (meridiem === "PM" && h !== 12) hour += 12;
  if (meridiem === "AM" && h === 12) hour = m / 60;
  return hour;
};

/**
 * For a given date string (YYYY-MM-DD) and notice hours,
 * return the subset of slots that are valid (after now + notice period).
 */
export const getAvailableSlotsForDate = (dateStr: string, noticeHours: number): string[] => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + noticeHours * 60 * 60 * 1000);

  return ALL_SLOTS.filter((slot) => {
    const slotDate = new Date(dateStr);
    const slotHour = Math.floor(slotToHour(slot));
    const slotMin = Math.round((slotToHour(slot) - slotHour) * 60);
    slotDate.setHours(slotHour, slotMin, 0, 0);
    return slotDate >= cutoff;
  });
};

export const TIME_GROUPS_FROM_SLOTS = (slots: string[]) => [
  { label: "Morning" as const, slots: slots.filter((s) => ["9:00 AM", "10:30 AM", "12:00 PM"].includes(s)) },
  { label: "Afternoon" as const, slots: slots.filter((s) => ["1:30 PM", "3:00 PM", "4:30 PM"].includes(s)) },
  { label: "Evening" as const, slots: slots.filter((s) => ["6:00 PM", "7:30 PM", "9:00 PM"].includes(s)) },
];
