import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { ApiError } from "../api/client";
import {
  getMyCounsellorProfile,
  toOwnProfilePayload,
  updateMyCounsellorProfile,
} from "../api/counsellorProfile";
import ImageUploadControl from "../components/ImageUploadControl";
import {
  counsellorLanguages,
  counsellorSpecialties,
} from "../constants/counsellorFilters";
import { MAX_UPLOAD_SIZE_MB } from "../constants/media";

const inputClassName =
  "w-full rounded-xl border border-outline-muted/40 bg-surface px-4 py-2.5 font-body text-sm text-on-surface shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40";

function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-heading text-sm font-semibold text-on-surface"
    >
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-primary/5 bg-surface p-6 shadow-md">
      <div className="mb-5 border-b border-outline-muted/10 pb-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
        {description ? (
          <p className="mt-1 font-body text-sm text-on-surface-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ToggleChip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-all duration-200 ${
        selected
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-outline-muted/30 bg-surface-muted/40 text-on-surface-muted hover:border-primary/30 hover:text-primary-dark"
      }`}
    >
      {label}
    </button>
  );
}

export default function CounsellorProfileEdit() {
  const [form, setForm] = useState(null);
  const [initials, setInitials] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError("");
      try {
        const profile = await getMyCounsellorProfile();
        if (!cancelled) {
          setInitials(profile.initials);
          setFullName(profile.fullName);
          setForm({
            shortName: profile.shortName,
            bio: profile.bio,
            quote: profile.quote ?? "",
            specialties: [...profile.specialties],
            languages: [...profile.languages],
            photoUrl: profile.photoUrl,
            program: profile.program,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Unable to load your profile. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const specialtyChoices = useMemo(() => {
    if (!form) {
      return counsellorSpecialties;
    }
    return [...new Set([...counsellorSpecialties, ...form.specialties])];
  }, [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const toggleListItem = (field, value) => {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
    setSaveSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const updated = await updateMyCounsellorProfile(toOwnProfilePayload(form));
      setInitials(updated.initials);
      setFullName(updated.fullName);
      setForm({
        shortName: updated.shortName,
        bio: updated.bio,
        quote: updated.quote ?? "",
        specialties: [...updated.specialties],
        languages: [...updated.languages],
        photoUrl: updated.photoUrl,
        program: updated.program,
      });
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : "Unable to save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center py-16">
        <p className="font-body text-sm text-on-surface-muted">Loading profile...</p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center rounded-3xl border border-outline-muted/20 bg-surface px-6 py-16 text-center shadow-sm">
        <p className="font-body text-sm text-danger">
          {loadError || "Profile could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 pb-28">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">Edit Profile</h1>
        <p className="mt-1 font-body text-sm text-on-surface-muted">
          Update how students see you in the directory and on your profile page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <SectionCard
          title="Photo"
          description="Optional. Students see your initials when no photo is set."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.photoUrl ? (
              <img
                src={form.photoUrl}
                alt={`Portrait of ${fullName}`}
                className="h-24 w-24 rounded-2xl border border-outline-muted/20 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-outline-muted/20 bg-gradient-to-br from-primary/20 to-primary-accent/40 font-heading text-2xl font-bold text-primary-dark shadow-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 space-y-3">
              <FieldLabel htmlFor="profile-photo-url">Photo URL</FieldLabel>
              <input
                id="profile-photo-url"
                type="url"
                value={form.photoUrl}
                onChange={(event) => updateField("photoUrl", event.target.value)}
                placeholder="https://..."
                className={inputClassName}
              />
              <p className="font-body text-xs text-on-surface-muted">
                Or upload a photo (JPEG, PNG, or WebP, max {MAX_UPLOAD_SIZE_MB} MB).
              </p>
              <ImageUploadControl
                label="Upload photo"
                onUploaded={(url) => updateField("photoUrl", url)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Basics">
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="profile-short-name" required>
                Display name
              </FieldLabel>
              <input
                id="profile-short-name"
                type="text"
                required
                value={form.shortName}
                onChange={(event) => updateField("shortName", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <FieldLabel htmlFor="profile-program">Program</FieldLabel>
              <input
                id="profile-program"
                type="text"
                value={form.program}
                onChange={(event) => updateField("program", event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="About you">
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="profile-bio" required>
                Bio
              </FieldLabel>
              <textarea
                id="profile-bio"
                rows={5}
                required
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <FieldLabel htmlFor="profile-quote">Quote</FieldLabel>
              <textarea
                id="profile-quote"
                rows={3}
                value={form.quote}
                onChange={(event) => updateField("quote", event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Specialties">
          <div className="flex flex-wrap gap-2">
            {specialtyChoices.map((specialty) => (
              <ToggleChip
                key={specialty}
                label={specialty}
                selected={form.specialties.includes(specialty)}
                onToggle={() => toggleListItem("specialties", specialty)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Languages">
          <div className="flex flex-wrap gap-2">
            {counsellorLanguages.map((language) => (
              <ToggleChip
                key={language}
                label={language}
                selected={form.languages.includes(language)}
                onToggle={() => toggleListItem("languages", language)}
              />
            ))}
          </div>
        </SectionCard>

        {saveError ? (
          <p className="font-body text-sm text-danger">{saveError}</p>
        ) : null}
        {saveSuccess ? (
          <p className="font-body text-sm text-success">Profile saved successfully.</p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
