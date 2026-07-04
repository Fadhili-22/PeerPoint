import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Clock,
  Edit3,
  Plus,
  Save,
  X,
} from "lucide-react";
import { ApiError } from "../api/client";
import {
  TIME_SLOT_OPTIONS,
  getMyAvailability,
  updateMyAvailability,
} from "../api/counsellorAvailability";

function DayCard({ day, isEditing, onToggleDay, onRemoveSlot, onAddSlot }) {
  const availableOptions = TIME_SLOT_OPTIONS.filter(
    (slot) => !day.slots.includes(slot),
  );

  return (
    <article
      className={`rounded-2xl border p-5 shadow-md transition-all duration-200 ${
        day.enabled
          ? "border-primary/10 bg-surface"
          : "border-outline-muted/20 bg-surface-muted/40"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-on-surface">
            {day.day}
          </h3>
          <p className="font-body text-xs text-on-surface-subtle">
            {day.enabled
              ? `${day.slots.length} ${day.slots.length === 1 ? "slot" : "slots"}`
              : "Unavailable"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-heading text-xs font-semibold ${
              day.enabled ? "text-primary" : "text-on-surface-subtle"
            }`}
          >
            {day.enabled ? "Available" : "Off"}
          </span>
          {isEditing && (
            <button
              type="button"
              role="switch"
              aria-checked={day.enabled}
              aria-label={`Toggle availability for ${day.day}`}
              onClick={() => onToggleDay(day.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                day.enabled ? "bg-primary" : "bg-outline-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform duration-200 ${
                  day.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {day.enabled && (
        <div className="space-y-2">
          {day.slots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center gap-1.5 rounded-full bg-soft-teal px-3 py-1.5 font-heading text-xs font-semibold text-primary-dark"
                >
                  {slot}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(day.id, slot)}
                      className="rounded-full p-0.5 text-primary transition-colors hover:bg-primary/10"
                      aria-label={`Remove ${slot}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-on-surface-subtle">
              No slots added yet.
            </p>
          )}

          {isEditing && availableOptions.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 font-heading text-[10px] font-bold uppercase tracking-wider text-on-surface-subtle">
                Add slot
              </p>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onAddSlot(day.id, slot)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-surface px-3 py-1.5 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:bg-soft-teal"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function CounsellorAvailability() {
  const [schedule, setSchedule] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getMyAvailability();
        if (!cancelled) {
          setSchedule(data.schedule);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error.message || "Unable to load availability. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const activeDays = schedule.filter((day) => day.enabled);
    const totalSlots = activeDays.reduce(
      (total, day) => total + day.slots.length,
      0,
    );
    return { activeDayCount: activeDays.length, totalSlots };
  }, [schedule]);

  const toggleDay = (id) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, enabled: !day.enabled } : day,
      ),
    );
  };

  const addSlot = (id, slot) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === id
          ? {
              ...day,
              slots: [...day.slots, slot].sort(
                (a, b) =>
                  TIME_SLOT_OPTIONS.indexOf(a) - TIME_SLOT_OPTIONS.indexOf(b),
              ),
            }
          : day,
      ),
    );
  };

  const removeSlot = (id, slot) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === id
          ? { ...day, slots: day.slots.filter((value) => value !== slot) }
          : day,
      ),
    );
  };

  const persistAvailability = async (nextSchedule) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const result = await updateMyAvailability({
        schedule: nextSchedule,
      });
      setSchedule(result.schedule);
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message || "Unable to save schedule."
          : "Unable to save schedule.";
      setSaveError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = async () => {
    if (!isEditing) {
      setSaveError("");
      setSaveSuccess("");
      setIsEditing(true);
      return;
    }

    const saved = await persistAvailability(schedule);
    if (saved) {
      setIsEditing(false);
      setSaveSuccess("Schedule saved successfully.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center py-16">
        <p className="font-body text-sm text-on-surface-muted">
          Loading availability...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center py-16">
        <p className="mb-4 font-body text-sm text-danger">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-semibold text-on-surface md:text-[28px] md:leading-9">
            My Availability
          </h1>
          <p className="font-body text-base text-on-surface-muted">
            Set the days and time slots students can book you for.
          </p>
        </div>
        <button
          type="button"
          onClick={handleEditToggle}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isEditing
              ? "bg-primary text-on-primary hover:bg-primary-light"
              : "border-2 border-primary/20 text-primary hover:bg-soft-teal"
          }`}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving..." : "Save Schedule"}
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit Schedule
            </>
          )}
        </button>
      </header>

      {saveError && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary/10 bg-soft-teal/60 px-4 py-3 font-body text-sm text-primary-dark">
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          {saveSuccess}
        </div>
      )}

      <section
        aria-label="Availability summary"
        className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <article className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
          <CalendarClock className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <p className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
            Available Days
          </p>
          <p className="font-heading text-3xl font-bold text-primary">
            {String(summary.activeDayCount).padStart(2, "0")}
          </p>
        </article>

        <article className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
          <Clock className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <p className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
            Weekly Time Slots
          </p>
          <p className="font-heading text-3xl font-bold text-on-surface">
            {String(summary.totalSlots).padStart(2, "0")}
          </p>
        </article>
      </section>

      {isEditing && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary/10 bg-soft-teal/60 px-4 py-3 font-body text-sm text-primary-dark">
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          Editing mode is on. Toggle days and add or remove slots, then save your
          schedule.
        </div>
      )}

      <section aria-label="Weekly schedule">
        <h2 className="mb-4 font-heading text-lg font-semibold text-on-surface">
          Weekly Schedule
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schedule.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              isEditing={isEditing}
              onToggleDay={toggleDay}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
