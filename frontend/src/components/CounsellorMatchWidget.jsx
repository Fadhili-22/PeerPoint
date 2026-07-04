import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Loader2, RotateCcw, X } from "lucide-react";
import { listCounsellors } from "../api/counsellors";

const QUIZ_QUESTIONS = [
  {
    id: "main-concern",
    prompt: "What's mainly on your mind lately?",
    options: [
      {
        label: "Schoolwork, exams, or grades",
        specialties: [
          { name: "Academic Stress", points: 2 },
          { name: "Time Management", points: 1 },
        ],
      },
      {
        label: "Worry, stress, or feeling on edge",
        specialties: [{ name: "Anxiety", points: 2 }],
      },
      {
        label: "Feeling low, unmotivated, or down",
        specialties: [
          { name: "Depression", points: 2 },
          { name: "Self-Esteem", points: 1 },
        ],
      },
      {
        label: "Friends, dating, or social life",
        specialties: [{ name: "Relationships", points: 2 }],
      },
      {
        label: "Future plans or career direction",
        specialties: [{ name: "Career Guidance", points: 2 }],
      },
    ],
  },
  {
    id: "help-needed",
    prompt: "What would help most right now?",
    options: [
      {
        label: "Getting organized and less overwhelmed",
        specialties: [
          { name: "Time Management", points: 2 },
          { name: "Academic Stress", points: 1 },
        ],
      },
      {
        label: "Talking through family pressures",
        specialties: [{ name: "Family Issues", points: 2 }],
      },
      {
        label: "Settling into university life",
        specialties: [{ name: "Adjustment to University Life", points: 2 }],
      },
      {
        label: "Working through a painful loss",
        specialties: [{ name: "Grief & Loss", points: 2 }],
      },
      {
        label: "Feeling more confident in myself",
        specialties: [{ name: "Self-Esteem", points: 2 }],
      },
    ],
  },
  {
    id: "also-affecting",
    prompt: "Is anything else affecting you?",
    options: [
      {
        label: "Nothing else — just what I mentioned",
        specialties: [],
      },
      {
        label: "Deadlines or academic pressure",
        specialties: [{ name: "Academic Stress", points: 2 }],
      },
      {
        label: "Trouble sleeping or panicking",
        specialties: [{ name: "Anxiety", points: 2 }],
      },
      {
        label: "Feeling isolated or disconnected",
        specialties: [
          { name: "Relationships", points: 2 },
          { name: "Adjustment to University Life", points: 1 },
        ],
      },
    ],
  },
  {
    id: "comfort-fit",
    prompt: "What kind of support feels like the best fit?",
    options: [
      {
        label: "Someone who gets academic pressure",
        specialties: [{ name: "Academic Stress", points: 2 }],
      },
      {
        label: "Someone calm who understands anxiety",
        specialties: [{ name: "Anxiety", points: 2 }],
      },
      {
        label: "Someone to talk through career choices with",
        specialties: [{ name: "Career Guidance", points: 2 }],
      },
      {
        label: "Someone warm and easy to open up to",
        specialties: [
          { name: "Relationships", points: 2 },
          { name: "Self-Esteem", points: 1 },
        ],
      },
    ],
  },
];

function computeSpecialtyScores(answers) {
  const scores = {};
  answers.forEach((answer) => {
    answer.specialties.forEach(({ name, points }) => {
      scores[name] = (scores[name] ?? 0) + points;
    });
  });
  const specialtyNames = Object.keys(scores).filter((name) => scores[name] > 0);
  return { scores, specialtyNames };
}

function rankCounsellors(counsellors, studentScores) {
  return counsellors
    .map((counsellor) => {
      let matchScore = 0;
      let matchCount = 0;
      counsellor.specialties.forEach((specialty) => {
        if (studentScores[specialty] != null) {
          matchScore += studentScores[specialty];
          matchCount += 1;
        }
      });
      return { counsellor, matchScore, matchCount };
    })
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.matchCount - a.matchCount;
    })
    .slice(0, 3)
    .map((item) => item.counsellor);
}

function resetQuizState() {
  return {
    phase: "quiz",
    questionIndex: 0,
    answers: [],
    matches: [],
    collectedTags: [],
    loadError: "",
  };
}

export default function CounsellorMatchWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [collectedTags, setCollectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];

  const handleRetake = () => {
    const next = resetQuizState();
    setPhase(next.phase);
    setQuestionIndex(next.questionIndex);
    setAnswers(next.answers);
    setMatches(next.matches);
    setCollectedTags(next.collectedTags);
    setLoadError(next.loadError);
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const finishQuiz = async (finalAnswers) => {
    const { scores, specialtyNames } = computeSpecialtyScores(finalAnswers);
    setCollectedTags(specialtyNames);
    setLoading(true);
    setLoadError("");
    setPhase("results");

    try {
      const data = await listCounsellors({ specialties: specialtyNames });
      setMatches(rankCounsellors(data, scores));
    } catch (error) {
      setMatches([]);
      setLoadError(error.message || "Unable to load counsellors.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    const nextAnswers = [...answers, option];

    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setAnswers(nextAnswers);
      setQuestionIndex((index) => index + 1);
      return;
    }

    setAnswers(nextAnswers);
    finishQuiz(nextAnswers);
  };

  const handleBrowseDirectory = () => {
    setOpen(false);
    navigate("/student/directory", { state: { specialties: collectedTags } });
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="mb-3 w-80 max-h-[min(70vh,28rem)] overflow-hidden rounded-2xl border border-primary/20 bg-surface shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-outline-muted/15 p-4">
            <div>
              <p className="font-heading text-sm font-semibold text-primary-dark">
                Find My Counsellor
              </p>
              <p className="mt-1 font-body text-xs text-on-surface-muted">
                {phase === "quiz" && currentQuestion
                  ? `Question ${questionIndex + 1} of ${QUIZ_QUESTIONS.length}`
                  : phase === "results" && !loading
                    ? matches.length > 0
                      ? `${matches.length} possible match${matches.length === 1 ? "" : "es"}`
                      : "No exact match"
                    : "Finding counsellors for you…"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 text-on-surface-subtle transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close counsellor match panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(min(70vh,28rem)-8rem)] overflow-y-auto p-4">
            {phase === "quiz" && currentQuestion && (
              <div>
                <p className="mb-3 font-body text-sm text-on-surface">
                  {currentQuestion.prompt}
                </p>
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className="w-full rounded-xl border border-outline-muted/30 bg-surface-muted/30 px-3 py-2.5 text-left font-body text-sm text-on-surface transition-all duration-200 hover:border-primary/30 hover:bg-soft-teal/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "results" && loading && (
              <div className="flex items-center justify-center gap-2 py-8 font-body text-sm text-on-surface-muted">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                Loading matches…
              </div>
            )}

            {phase === "results" && !loading && loadError && (
              <div className="space-y-3">
                <p className="font-body text-sm text-danger">{loadError}</p>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retake quiz
                </button>
              </div>
            )}

            {phase === "results" && !loading && !loadError && matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((counsellor) => (
                  <article
                    key={counsellor.id}
                    className="rounded-xl border border-outline-muted/25 bg-surface-muted/30 p-3"
                  >
                    <h3 className="font-heading text-sm font-semibold text-on-surface">
                      {counsellor.shortName}
                    </h3>
                    <p className="mt-1 font-body text-xs text-on-surface-muted">
                      {counsellor.specialties.join(", ")}
                    </p>
                    <Link
                      to={`/student/counsellors/${counsellor.id}`}
                      onClick={handleClose}
                      className="mt-2 inline-block font-heading text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                    >
                      View profile
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {phase === "results" &&
              !loading &&
              !loadError &&
              matches.length === 0 && (
                <div className="space-y-3 text-center">
                  <p className="font-body text-sm text-on-surface-muted">
                    No exact match found for your answers. Browse the full directory
                    with your topics pre-selected.
                  </p>
                  <button
                    type="button"
                    onClick={handleBrowseDirectory}
                    className="w-full rounded-xl bg-primary py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Browse directory
                  </button>
                </div>
              )}
          </div>

          {(phase === "results" && !loading) || phase === "quiz" ? (
            <div className="border-t border-outline-muted/15 px-4 py-3">
              {phase === "results" && !loading && !loadError ? (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-surface py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:bg-soft-teal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retake quiz
                </button>
              ) : phase === "quiz" && questionIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-muted/30 py-2 font-heading text-xs font-semibold text-on-surface-muted transition-colors hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Start over
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close find my counsellor" : "Open find my counsellor"}
        className="flex items-center gap-2 rounded-full border border-primary/20 bg-soft-teal px-4 py-3 font-heading text-sm font-semibold text-primary-dark shadow-lg transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Compass className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Find My Counsellor</span>
      </button>
    </div>
  );
}
