import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Lock,
  Phone,
  Users,
  Video,
} from "lucide-react";
import { ApiError } from "../api/client";
import { getCounsellor, getCounsellorAvailability } from "../api/counsellors";
import { createSessionRequest, getCounsellorSlots } from "../api/sessions";
import { sessionTopics } from "../constants/counsellorFilters";

const formatOptions = [
  { id: "in-person", label: "In Person", icon: Users },
  { id: "video", label: "Video Call", icon: Video },
  { id: "phone", label: "Phone Call", icon: Phone },
];

const NOTES_MAX_LENGTH = 500;

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function StepBadge({ number }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-accent/60 font-heading text-sm font-bold text-primary"
      aria-hidden="true"
    >
      {number}
    </span>
  );
}

function CounsellorNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-soft-teal bg-surface p-8 text-center shadow-sm">
      <h1 className="mb-2 font-heading text-xl font-semibold text-on-surface">
        Counsellor not found
      </h1>
      <p className="mb-6 font-body text-sm text-on-surface-muted">
        We could not find the counsellor you are trying to book with.
      </p>
      <Link
        to="/student/directory"
        className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Return to Directory
      </Link>
    </div>
  );
}

function BookingSuccess({ counsellor, onViewRequests }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-soft-teal bg-surface p-8 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
      </div>
      <h1 className="mb-2 font-heading text-2xl font-semibold text-on-surface">
        Request Sent
      </h1>
      <p className="mb-8 max-w-md font-body text-base text-on-surface-muted">
        Your request has been sent to {counsellor.fullName}. You will receive a
        response within 24 hours.
      </p>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => navigate("/student/directory")}
          className="rounded-2xl border border-soft-teal bg-surface px-6 py-3 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Return to Directory
        </button>
        <button
          type="button"
          onClick={onViewRequests}
          className="rounded-2xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-on-primary shadow-md transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          View My Requests
        </button>
      </div>
    </div>
  );
}

export default function SessionBookingPage() {
  const { counsellorId } = useParams();
  const navigate = useNavigate();
  const numericId = Number(counsellorId);

  const [counsellor, setCounsellor] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingCounsellor, setLoadingCounsellor] = useState(true);
  const [counsellorError, setCounsellorError] = useState("");

  const [topic, setTopic] = useState("");
  const [otherTopic, setOtherTopic] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionFormat, setSessionFormat] = useState("");
  const [notes, setNotes] = useState("");
  const [anonymousUntilAccepted, setAnonymousUntilAccepted] = useState(false);
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setLoadingCounsellor(false);
      return;
    }

    let cancelled = false;

    async function loadCounsellor() {
      setLoadingCounsellor(true);
      setCounsellorError("");
      try {
        const [profile, availability] = await Promise.all([
          getCounsellor(numericId),
          getCounsellorAvailability(numericId),
        ]);
        if (!cancelled) {
          setCounsellor(profile);
          setUnavailableDates(availability.unavailable_dates ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 404) {
            setCounsellor(null);
          } else {
            setCounsellorError(
              error.message || "Unable to load counsellor. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingCounsellor(false);
        }
      }
    }

    loadCounsellor();
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  useEffect(() => {
    if (!selectedDate || dateError || !Number.isInteger(numericId)) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const slots = await getCounsellorSlots(numericId, selectedDate);
        if (!cancelled) {
          setAvailableSlots(slots);
          setSelectedTime((current) =>
            current && slots.includes(current) ? current : "",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotsError(
            error.message || "Unable to load time slots. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, dateError, numericId]);

  if (loadingCounsellor) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-16">
        <p className="font-body text-sm text-on-surface-muted">
          Loading counsellor...
        </p>
      </div>
    );
  }

  if (counsellorError) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-soft-teal bg-surface p-8 text-center shadow-sm">
        <p className="mb-4 font-body text-sm text-danger">{counsellorError}</p>
        <Link
          to="/student/directory"
          className="font-heading text-sm font-semibold text-primary"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  if (!counsellor) {
    return <CounsellorNotFound />;
  }

  if (submitted) {
    return (
      <BookingSuccess
        counsellor={counsellor}
        onViewRequests={() => navigate("/student/sessions")}
      />
    );
  }

  const otherTopicRequired = topic === "Other";
  const otherTopicValid = !otherTopicRequired || otherTopic.trim().length > 0;
  const isFormValid =
    topic.length > 0 &&
    otherTopicValid &&
    selectedDate.length > 0 &&
    !dateError &&
    selectedTime.length > 0 &&
    sessionFormat.length > 0;

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    setSelectedDate(nextDate);
    setSelectedTime("");
    setTimeError("");
    setFieldErrors((prev) => ({ ...prev, preferred_date: undefined }));

    if (!nextDate) {
      setDateError("");
      return;
    }

    if (nextDate < getTodayKey()) {
      setDateError("Please choose a date from today onward.");
      return;
    }

    if (unavailableDates.includes(nextDate)) {
      setDateError("This date is unavailable. Please choose another day.");
      return;
    }

    setDateError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      await createSessionRequest({
        counsellorId: numericId,
        topic,
        otherTopic: otherTopicRequired ? otherTopic.trim() : null,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        format: sessionFormat,
        notes: notes.trim() || null,
        anonymousUntilAccepted,
      });
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          setFieldErrors(error.fieldErrors);
          if (error.fieldErrors.preferred_date) {
            setDateError(error.fieldErrors.preferred_date);
          }
          if (error.fieldErrors.preferred_time) {
            setTimeError(error.fieldErrors.preferred_time);
          }
        } else if (error.status === 403) {
          setSubmitError("You are not authorized to book sessions.");
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError("Unable to send request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const chipSelectedClasses =
    "border-primary bg-soft-teal text-primary ring-2 ring-primary/30";
  const chipBaseClasses =
    "rounded-xl border border-outline-muted px-3 py-3 text-center font-heading text-sm font-semibold transition-all duration-200 hover:bg-surface-muted focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <Link
        to={`/student/counsellors/${counsellor.id}`}
        className="mb-6 inline-flex items-center gap-2 self-start font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Counsellor Profile
      </Link>

      <article className="mb-6 rounded-2xl border border-soft-teal bg-surface p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            {counsellor.photoUrl ? (
              <img
                src={counsellor.photoUrl}
                alt={`Portrait of ${counsellor.fullName}`}
                className="h-20 w-20 rounded-full border-4 border-surface object-cover shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-soft-teal font-heading text-lg font-bold text-primary shadow-md">
                {counsellor.initials}
              </div>
            )}
            {counsellor.availabilityStatus === "available" && (
              <span
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface bg-success"
                aria-label="Available now"
              />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-semibold text-on-surface">
              {counsellor.fullName}
            </h1>
            <p className="font-body text-sm text-on-surface-muted">
              {counsellor.role}
            </p>
            <p className="mt-1 font-body text-sm font-medium text-primary">
              {counsellor.specialties.join(" • ")}
            </p>
            <p
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                counsellor.availabilityStatus === "available"
                  ? "bg-success/10 text-success"
                  : counsellor.availabilityStatus === "busy"
                    ? "bg-warning/10 text-warning"
                    : "bg-outline-muted/20 text-on-surface-subtle"
              }`}
            >
              {counsellor.availabilityNote}
            </p>
            <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-muted">
              {counsellor.bio}
            </p>
          </div>
        </div>
      </article>

      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/10 bg-soft-teal p-4">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-heading text-sm font-semibold text-primary-dark">
            Your request is private.
          </p>
          <p className="mt-1 font-body text-sm text-on-surface-muted">
            Your counsellor will only see your information after you submit the
            request.
          </p>
        </div>
      </div>

      {submitError ? (
        <p
          className="mb-4 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <form className="space-y-10" onSubmit={handleSubmit} noValidate>
        <section aria-labelledby="step-1-heading">
          <div className="mb-4 flex items-center gap-2">
            <StepBadge number={1} />
            <h2
              id="step-1-heading"
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Select Topic
            </h2>
          </div>
          <p
            id="topic-helper"
            className="mb-4 font-body text-sm text-on-surface-muted"
          >
            Choose one topic for your session request. Required.
          </p>
          <div
            role="radiogroup"
            aria-labelledby="step-1-heading"
            aria-describedby="topic-helper"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {sessionTopics.map((option) => {
              const isSelected = topic === option;
              return (
                <label
                  key={option}
                  className={`cursor-pointer ${chipBaseClasses} ${
                    isSelected ? chipSelectedClasses : "bg-surface text-on-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="session-topic"
                    value={option}
                    checked={isSelected}
                    onChange={() => setTopic(option)}
                    className="sr-only"
                  />
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.topic ? (
            <p className="mt-2 font-body text-sm text-danger">{fieldErrors.topic}</p>
          ) : null}

          {otherTopicRequired && (
            <div className="mt-4">
              <label
                htmlFor="other-topic"
                className="mb-2 block font-heading text-sm font-semibold text-on-surface"
              >
                What would you like support with?
                <span className="text-danger"> *</span>
              </label>
              <textarea
                id="other-topic"
                value={otherTopic}
                onChange={(event) => setOtherTopic(event.target.value)}
                required
                rows={3}
                placeholder="Briefly describe what you'd like to talk about..."
                className="w-full resize-none rounded-2xl border border-outline-muted bg-surface px-4 py-3 font-body text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {fieldErrors.other_topic ? (
                <p className="mt-2 font-body text-sm text-danger">
                  {fieldErrors.other_topic}
                </p>
              ) : null}
            </div>
          )}
        </section>

        <section aria-labelledby="step-2-heading">
          <div className="mb-4 flex items-center gap-2">
            <StepBadge number={2} />
            <h2
              id="step-2-heading"
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Choose Date
            </h2>
          </div>
          <p
            id="date-helper"
            className="mb-4 font-body text-sm text-on-surface-muted"
          >
            Choose a preferred date for your session request.
          </p>
          <div className="relative">
            <Calendar
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline"
              aria-hidden="true"
            />
            <input
              id="session-date"
              type="date"
              value={selectedDate}
              min={getTodayKey()}
              onChange={handleDateChange}
              required
              aria-describedby={`date-helper${dateError ? " date-error" : ""}`}
              aria-invalid={dateError ? "true" : "false"}
              className="w-full rounded-xl border border-outline-muted bg-surface py-3 pl-12 pr-4 font-body text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {dateError && (
            <p
              id="date-error"
              role="alert"
              className="mt-2 font-body text-sm text-danger"
            >
              {dateError}
            </p>
          )}
        </section>

        <section aria-labelledby="step-3-heading">
          <div className="mb-4 flex items-center gap-2">
            <StepBadge number={3} />
            <h2
              id="step-3-heading"
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Choose Time
            </h2>
          </div>
          {!selectedDate || dateError ? (
            <p className="font-body text-sm text-on-surface-muted">
              {dateError
                ? "Choose a valid available date to see open time slots."
                : "Select an available date first to see open time slots."}
            </p>
          ) : loadingSlots ? (
            <p className="font-body text-sm text-on-surface-muted">
              Loading available slots...
            </p>
          ) : slotsError ? (
            <p className="font-body text-sm text-danger">{slotsError}</p>
          ) : availableSlots.length === 0 ? (
            <p className="font-body text-sm text-on-surface-muted">
              No time slots are available on this date. Please choose another
              day.
            </p>
          ) : (
            <>
              <p
                id="time-helper"
                className="mb-4 font-body text-sm text-on-surface-muted"
              >
                Select one available time slot. Required.
              </p>
              <div
                role="radiogroup"
                aria-labelledby="step-3-heading"
                aria-describedby="time-helper"
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <label
                      key={slot}
                      className={`cursor-pointer ${chipBaseClasses} ${
                        isSelected
                          ? chipSelectedClasses
                          : "bg-surface text-on-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="session-time"
                        value={slot}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedTime(slot);
                          setTimeError("");
                        }}
                        className="sr-only"
                      />
                      <span className="inline-flex items-center justify-center gap-1.5">
                        {isSelected && (
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {slot}
                      </span>
                    </label>
                  );
                })}
              </div>
              {timeError ? (
                <p className="mt-2 font-body text-sm text-danger">{timeError}</p>
              ) : null}
            </>
          )}
        </section>

        <section aria-labelledby="step-4-heading">
          <div className="mb-4 flex items-center gap-2">
            <StepBadge number={4} />
            <h2
              id="step-4-heading"
              className="font-heading text-lg font-semibold text-on-surface"
            >
              Session Format
            </h2>
          </div>
          <p
            id="format-helper"
            className="mb-4 font-body text-sm text-on-surface-muted"
          >
            How would you like to meet? Required.
          </p>
          <div
            role="radiogroup"
            aria-labelledby="step-4-heading"
            aria-describedby="format-helper"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {formatOptions.map(({ id, label, icon: Icon }) => {
              const isSelected = sessionFormat === id;
              return (
                <label
                  key={id}
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border px-5 py-5 transition-all duration-200 hover:border-primary/40 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                    isSelected
                      ? "border-primary bg-soft-teal text-primary ring-2 ring-primary/30"
                      : "border-outline-muted bg-surface text-on-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="session-format"
                    value={id}
                    checked={isSelected}
                    onChange={() => setSessionFormat(id)}
                    className="sr-only"
                  />
                  <Icon className="h-8 w-8" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5 font-heading text-sm font-semibold">
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.format ? (
            <p className="mt-2 font-body text-sm text-danger">{fieldErrors.format}</p>
          ) : null}
        </section>

        <section aria-labelledby="notes-heading">
          <label
            htmlFor="session-notes"
            id="notes-heading"
            className="mb-2 block font-heading text-sm font-semibold text-on-surface"
          >
            Optional Notes
          </label>
          <textarea
            id="session-notes"
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value.slice(0, NOTES_MAX_LENGTH))
            }
            rows={4}
            placeholder="Anything you'd like your counsellor to know before the session?"
            className="w-full resize-none rounded-2xl border border-outline-muted bg-surface px-4 py-3 font-body text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-right font-body text-xs text-on-surface-subtle">
            {notes.length}/{NOTES_MAX_LENGTH}
          </p>
          {fieldErrors.notes ? (
            <p className="mt-2 font-body text-sm text-danger">{fieldErrors.notes}</p>
          ) : null}
        </section>

        <section aria-labelledby="privacy-pref-heading">
          <h2 id="privacy-pref-heading" className="sr-only">
            Privacy preference
          </h2>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-soft-teal bg-surface-muted/40 p-4 transition-colors hover:bg-surface-muted/70">
            <input
              type="checkbox"
              checked={anonymousUntilAccepted}
              onChange={(event) =>
                setAnonymousUntilAccepted(event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-outline-muted text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <span className="font-body text-sm text-on-surface-muted">
              Share my name only after the counsellor accepts my request
            </span>
          </label>
        </section>

        <div className="space-y-4 pt-2">
          {!isFormValid && (
            <p
              id="submit-helper"
              className="text-center font-body text-sm text-on-surface-muted"
            >
              Please complete all required fields before sending your request.
            </p>
          )}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            aria-describedby={!isFormValid ? "submit-helper" : undefined}
            className="w-full rounded-2xl bg-primary py-4 font-heading text-base font-semibold text-on-primary shadow-md transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {submitting ? "Sending Request..." : "Send Request"}
          </button>
          <p className="text-center font-body text-xs text-on-surface-subtle">
            By sending this request, you agree to our community guidelines.{" "}
            {counsellor.fullName.split(" ")[0]} will respond within 24 hours.
          </p>
        </div>
      </form>
    </div>
  );
}
