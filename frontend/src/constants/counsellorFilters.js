export const sessionTopics = [
  "Academic Stress",
  "Anxiety",
  "Relationships",
  "Career Guidance",
  "Time Management",
  "Other",
];

export const counsellorSpecialties = [
  "Academic Stress",
  "Anxiety",
  "Depression",
  "Relationships",
  "Career Guidance",
  "Time Management",
  "Self-Esteem",
  "Grief & Loss",
  "Family Issues",
  "Adjustment to University Life",
];

export const directoryFilterChips = counsellorSpecialties.map((label) => ({
  id: label,
  label,
  type: "specialty",
}));

export const studyYears = [2, 3, 4];

export const counsellorLanguages = ["English", "Swahili", "French", "Arabic", "Spanish"];
