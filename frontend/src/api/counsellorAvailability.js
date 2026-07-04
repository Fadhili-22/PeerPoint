import { apiFetch } from "./client";
import { TIME_SLOT_OPTIONS } from "../constants/timeSlots";

export { TIME_SLOT_OPTIONS };

const WEEKDAY_META = [
  { dayOfWeek: 0, id: "sun", day: "Sunday", short: "Sun" },
  { dayOfWeek: 1, id: "mon", day: "Monday", short: "Mon" },
  { dayOfWeek: 2, id: "tue", day: "Tuesday", short: "Tue" },
  { dayOfWeek: 3, id: "wed", day: "Wednesday", short: "Wed" },
  { dayOfWeek: 4, id: "thu", day: "Thursday", short: "Thu" },
  { dayOfWeek: 5, id: "fri", day: "Friday", short: "Fri" },
  { dayOfWeek: 6, id: "sat", day: "Saturday", short: "Sat" },
];

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function getWeekdayMeta(dayOfWeek) {
  return WEEKDAY_META.find((entry) => entry.dayOfWeek === dayOfWeek);
}

export function mapAvailabilityToSchedule(apiResponse) {
  const byDay = {};
  for (const row of apiResponse.schedule ?? []) {
    byDay[row.day_of_week] = row;
  }

  return DISPLAY_ORDER.map((dayOfWeek) => {
    const meta = getWeekdayMeta(dayOfWeek);
    const row = byDay[dayOfWeek];
    return {
      id: meta.id,
      day: meta.day,
      short: meta.short,
      dayOfWeek,
      enabled: row?.enabled ?? false,
      slots: row?.slots ?? [],
    };
  });
}

export function mapScheduleToApiPayload(schedule) {
  return {
    schedule: schedule.map((day) => ({
      day_of_week: day.dayOfWeek,
      enabled: day.enabled,
      slots: day.enabled
        ? day.slots.filter((slot) => TIME_SLOT_OPTIONS.includes(slot))
        : [],
    })),
  };
}

export async function getMyAvailability() {
  const data = await apiFetch("/counsellor/me/availability");
  return {
    schedule: mapAvailabilityToSchedule(data),
  };
}

export async function updateMyAvailability({ schedule }) {
  const data = await apiFetch("/counsellor/me/availability", {
    method: "PUT",
    body: mapScheduleToApiPayload(schedule),
  });
  return {
    schedule: mapAvailabilityToSchedule(data),
  };
}
