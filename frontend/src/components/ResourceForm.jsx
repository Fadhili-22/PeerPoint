import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import ImageUploadControl from "./ImageUploadControl";
import { resourceTopicCategories } from "../data/mockResources";
import { MAX_UPLOAD_SIZE_MB } from "../constants/media";

export const emptyResourceForm = {
  title: "",
  category: resourceTopicCategories[0],
  description: "",
  readTime: "5 min read",
  author: "",
  authorRole: "",
  image: "",
  imageAlt: "",
  body: [""],
  featured: false,
  featuredOrder: "",
};

export function formFromResource(resource) {
  return {
    title: resource.title,
    category: resource.category,
    description: resource.description,
    readTime: resource.readTime,
    author: resource.author,
    authorRole: resource.authorRole,
    image: resource.image,
    imageAlt: resource.imageAlt,
    body: resource.body.length > 0 ? resource.body : [""],
    featured: resource.featured,
    featuredOrder:
      resource.featuredOrder != null ? String(resource.featuredOrder) : "",
  };
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

const inputClassName =
  "w-full rounded-xl border border-outline-muted/40 bg-surface px-4 py-2.5 font-body text-sm text-on-surface shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40";

const readOnlyInputClassName =
  "w-full rounded-xl border border-outline-muted/30 bg-surface-muted/60 px-4 py-2.5 font-body text-sm text-on-surface-muted shadow-sm cursor-not-allowed";

function buildPayload(form) {
  return {
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    readTime: form.readTime.trim() || "5 min read",
    author: form.author.trim(),
    authorRole: form.authorRole.trim(),
    image: form.image.trim(),
    imageAlt: form.imageAlt.trim(),
    body: form.body,
    featured: form.featured,
    featuredOrder:
      form.featured && form.featuredOrder.trim()
        ? Number(form.featuredOrder)
        : form.featured
          ? null
          : null,
  };
}

export default function ResourceForm({
  mode = "admin",
  pageTitle,
  backTo,
  backLabel,
  editHint,
  initialForm,
  lockedAuthor,
  onSaveDraft,
  onPublish,
  onSubmitForReview,
}) {
  const isCounsellorMode = mode === "counsellor";
  const [form, setForm] = useState(() => {
    const base = initialForm || emptyResourceForm;
    if (isCounsellorMode && lockedAuthor) {
      return {
        ...base,
        author: lockedAuthor.author,
        authorRole: lockedAuthor.authorRole,
      };
    }
    return base;
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.category) nextErrors.category = "Category is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!isCounsellorMode && !form.author.trim()) {
      nextErrors.author = "Author is required.";
    }
    if (!form.image.trim()) nextErrors.image = "Image URL is required.";
    if (!form.imageAlt.trim()) nextErrors.imageAlt = "Image alt text is required.";
    const paragraphs = form.body.map((paragraph) => paragraph.trim()).filter(Boolean);
    if (paragraphs.length === 0) {
      nextErrors.body = "Add at least one content paragraph.";
    }
    if (!isCounsellorMode && form.featured && form.featuredOrder.trim()) {
      const order = Number(form.featuredOrder);
      if (!Number.isInteger(order) || order < 1) {
        nextErrors.featuredOrder = "Featured order must be a positive whole number.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    onSaveDraft(buildPayload(form));
  };

  const handlePublish = () => {
    if (!validate()) return;
    onPublish?.(buildPayload(form));
  };

  const handleSubmitForReview = () => {
    if (!validate()) return;
    onSubmitForReview?.(buildPayload(form));
  };

  const updateField = (field, value) => {
    if (isCounsellorMode && (field === "author" || field === "authorRole")) return;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateParagraph = (index, value) => {
    setForm((prev) => {
      const body = [...prev.body];
      body[index] = value;
      return { ...prev, body };
    });
  };

  const addParagraph = () => {
    setForm((prev) => ({ ...prev, body: [...prev.body, ""] }));
  };

  const removeParagraph = (index) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 self-start font-heading text-sm font-semibold text-primary transition-all duration-200 hover:gap-3 hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
        {editHint ? (
          <p className="font-body text-sm text-on-surface-muted">{editHint}</p>
        ) : null}
      </div>

      <header>
        <p className="mb-1 font-body text-sm font-medium text-on-surface-muted">
          {isCounsellorMode ? "Resource submissions" : "Content management"}
        </p>
        <h1 className="font-heading text-2xl font-semibold text-on-surface md:text-[32px] md:leading-10">
          {pageTitle}
        </h1>
      </header>

      <div className="flex flex-col gap-6">
        <SectionCard
          title="Basic information"
          description="Title, category, and the short description shown on resource cards."
        >
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="resource-title" required>
                Title
              </FieldLabel>
              <input
                id="resource-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClassName}
              />
              {errors.title ? (
                <p className="mt-1 font-body text-xs text-danger">{errors.title}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="resource-category" required>
                  Category
                </FieldLabel>
                <select
                  id="resource-category"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className={inputClassName}
                >
                  {resourceTopicCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="resource-read-time">Read time</FieldLabel>
                <input
                  id="resource-read-time"
                  type="text"
                  value={form.readTime}
                  onChange={(event) => updateField("readTime", event.target.value)}
                  placeholder="5 min read"
                  className={inputClassName}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="resource-description" required>
                Description
              </FieldLabel>
              <textarea
                id="resource-description"
                rows={3}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={inputClassName}
              />
              {errors.description ? (
                <p className="mt-1 font-body text-xs text-danger">{errors.description}</p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Content"
          description="Article body paragraphs. Each block becomes a paragraph on the published page."
        >
          <div className="space-y-4">
            {form.body.map((paragraph, index) => (
              <div key={`paragraph-${index}`}>
                <div className="mb-1.5 flex items-center justify-between">
                  <FieldLabel htmlFor={`paragraph-${index}`}>
                    Paragraph {index + 1}
                  </FieldLabel>
                  {form.body.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeParagraph(index)}
                      className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-danger transition-colors hover:text-danger/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <textarea
                  id={`paragraph-${index}`}
                  rows={4}
                  value={paragraph}
                  onChange={(event) => updateParagraph(index, event.target.value)}
                  className={inputClassName}
                />
              </div>
            ))}
            {errors.body ? (
              <p className="font-body text-xs text-danger">{errors.body}</p>
            ) : null}
            <button
              type="button"
              onClick={addParagraph}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add paragraph
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Media"
          description="Cover image shown on cards and the article header."
        >
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="resource-image" required>
                Image URL
              </FieldLabel>
              <input
                id="resource-image"
                type="url"
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                className={inputClassName}
              />
              {errors.image ? (
                <p className="mt-1 font-body text-xs text-danger">{errors.image}</p>
              ) : null}
            </div>
            <div>
              <p className="mb-2 font-body text-xs text-on-surface-muted">
                Or upload an image (JPEG, PNG, or WebP, max {MAX_UPLOAD_SIZE_MB} MB).
              </p>
              <ImageUploadControl
                label="Upload image"
                onUploaded={(url) => updateField("image", url)}
              />
            </div>
            {form.image ? (
              <div className="overflow-hidden rounded-xl border border-outline-muted/20">
                <img
                  src={form.image}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : null}
            <div>
              <FieldLabel htmlFor="resource-image-alt" required>
                Image alt text
              </FieldLabel>
              <input
                id="resource-image-alt"
                type="text"
                value={form.imageAlt}
                onChange={(event) => updateField("imageAlt", event.target.value)}
                className={inputClassName}
              />
              {errors.imageAlt ? (
                <p className="mt-1 font-body text-xs text-danger">{errors.imageAlt}</p>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Author & publishing"
          description={
            isCounsellorMode
              ? "Your name is shown as the article author. Admins may adjust attribution during review."
              : "Attribution and visibility settings."
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="resource-author" required>
                  Author name
                </FieldLabel>
                <input
                  id="resource-author"
                  type="text"
                  value={form.author}
                  readOnly={isCounsellorMode}
                  onChange={(event) => updateField("author", event.target.value)}
                  className={isCounsellorMode ? readOnlyInputClassName : inputClassName}
                  aria-readonly={isCounsellorMode}
                />
                {errors.author ? (
                  <p className="mt-1 font-body text-xs text-danger">{errors.author}</p>
                ) : null}
              </div>
              <div>
                <FieldLabel htmlFor="resource-author-role">Author role</FieldLabel>
                <input
                  id="resource-author-role"
                  type="text"
                  value={form.authorRole}
                  readOnly={isCounsellorMode}
                  onChange={(event) => updateField("authorRole", event.target.value)}
                  className={isCounsellorMode ? readOnlyInputClassName : inputClassName}
                  aria-readonly={isCounsellorMode}
                />
              </div>
            </div>

            {!isCounsellorMode ? (
              <div className="rounded-xl border border-outline-muted/30 bg-surface-muted/40 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateField("featured", event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-outline-muted text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block font-heading text-sm font-semibold text-on-surface">
                      Feature this resource
                    </span>
                    <span className="block font-body text-xs text-on-surface-muted">
                      Featured resources can appear in the student hub hero section. Multiple
                      resources may be featured at once.
                    </span>
                  </span>
                </label>

                {form.featured ? (
                  <div className="mt-4">
                    <FieldLabel htmlFor="resource-featured-order">
                      Featured order
                    </FieldLabel>
                    <input
                      id="resource-featured-order"
                      type="number"
                      min="1"
                      value={form.featuredOrder}
                      onChange={(event) => updateField("featuredOrder", event.target.value)}
                      placeholder="1 = highest priority"
                      className={`${inputClassName} max-w-xs`}
                    />
                    {errors.featuredOrder ? (
                      <p className="mt-1 font-body text-xs text-danger">
                        {errors.featuredOrder}
                      </p>
                    ) : (
                      <p className="mt-1 font-body text-xs text-on-surface-muted">
                        Lower numbers appear first in the featured section. Leave blank to
                        sort after ordered items.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/10 bg-surface/95 px-4 py-4 backdrop-blur-sm md:px-6">
        <div className="mx-auto flex w-full max-w-[900px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to={backTo}
            className="inline-flex items-center justify-center rounded-xl border border-outline-muted/40 bg-surface px-5 py-2.5 font-heading text-sm font-semibold text-on-surface transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Save Draft
          </button>
          {isCounsellorMode ? (
            <button
              type="button"
              onClick={handleSubmitForReview}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Submit for Review
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
