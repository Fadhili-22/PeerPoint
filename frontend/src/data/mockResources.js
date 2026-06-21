export const resourceTopicCategories = [
  "Anxiety",
  "Depression",
  "Stress",
  "Academic Focus",
  "Self-Care",
  "Relationships",
];

export const resourceCategories = ["All Resources", ...resourceTopicCategories];

// Lifecycle statuses including counsellor submission workflow states.
export const RESOURCE_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
];

export const COUNSELLOR_AUTHOR_ROLE = "Peer Counsellor, PeerPoint";

export function emptySubmissionMetadata() {
  return {
    submittedBy: null,
    submittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  };
}

export const campusSupportOptions = [
  {
    id: "su-counsellors",
    title: "SU Counsellors",
    description:
      "Confidential, professional one-on-one sessions with university specialists.",
    actionLabel: "Book Session",
    icon: "psychology",
  },
  {
    id: "mental-health-club",
    title: "Mental Health Club",
    description:
      "Join a community of peers dedicated to breaking the stigma and providing mutual aid.",
    actionLabel: "Join Club",
    icon: "groups",
  },
];

export function slugifyTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatResourceDisplayDate(isoDate) {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function createInitialResources() {
  return [
    {
      id: "featured-exam-stress",
      slug: "featured-exam-stress",
      title: "Navigating Exam Stress with Mindfulness",
      category: "Stress",
      description:
        "Practical techniques to stay grounded during the most demanding weeks of the semester. Learn how five minutes of breathing can transform your focus.",
      readTime: "8 min read",
      author: "Dr. Amina Wanjiru",
      authorRole: "Lead Counsellor, SU Wellbeing Centre",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC1vTDSBSzDeznTLOEpj0OtMBEt06_64W4stn_SIhfIGbyLAhidO3h8qaltQWgxHvJniZEjyT1lDCspumuZD4BmbZuSkHtGLDXKXSC9_DxDxQohxVdi2etEZmFgi0slnf9KQsRRSIPpuzdxqJp1UR1TPGLU4C2U4ssY9dxbyHW0LCL-BXXd_CBujhmVR-rVQjJ_KRxFAQ-deIl8QCPmNRo0vW8UEHQXaQMK8WLyhBI6hKyTb2sXLNU6iYnv_uS0lGIashcFNcWI6qc",
      imageAlt:
        "A serene sunlit library interior with large windows overlooking a peaceful garden.",
      body: [
        "Exam season at Strathmore can feel relentless. Between back-to-back papers, group projects, and the pressure to perform, it's easy to lose sight of your wellbeing.",
        "Mindfulness doesn't require an hour of meditation. Start with five minutes of box breathing before you open your notes: inhale for four counts, hold for four, exhale for four, hold for four.",
        "Pair breathing with a simple grounding ritual — a cup of tea, a short walk around campus, or writing three things you're grateful for before studying.",
        "Remember: your worth is not defined by a single grade. Reach out to a peer counsellor if stress starts to feel unmanageable.",
      ],
      status: "published",
      featured: true,
      featuredOrder: 1,
      publishedAt: "2026-05-12T09:00:00.000Z",
      createdAt: "2026-05-01T09:00:00.000Z",
      updatedAt: "2026-05-12T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 1240,
      saves: 452,
    },
    {
      id: "nighttime-sleep-routine",
      slug: "nighttime-sleep-routine",
      title: "Creating a Nighttime Routine for Better Sleep",
      category: "Self-Care",
      description:
        "Consistent sleep is the foundation of mental clarity. Discover rituals to disconnect from screens and rest deeply.",
      readTime: "5 min read",
      author: "Brian Otieno",
      authorRole: "Peer Counsellor, PeerPoint",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAN5jWl_rP_bvEcHNJI_NLrsJig7ibJcDkuKnK0NkCxHYpusEbQTcl50B4TArKz-JjxXAbAqIxrXpWPEE_62TrQmohFCPX-EYK8qjAOn7OV8Fz7XsxNgRCZqisg5CCjhpnBolOubJc1j-zDHVFCCMvKHSnPPGahcqBemV2vhb3fAVIIcTaG-CpRbBbr-OmYUdfafVEMYjq0fQnOsXHQx9XluDFVC7NSW-RORpe9hnrpagr1OgjlyYuY7o7lJQghiAaXBSax_gXWJcA",
      imageAlt:
        "A minimalist workspace with a journal, a small plant, and a steaming cup of tea.",
      body: [
        "Sleep is when your brain consolidates what you learned during the day. Skimping on rest makes everything harder — focus, mood, and memory all suffer.",
        "Try a digital sunset: put your phone on charge in another corner of the room at least 30 minutes before bed.",
        "Build a short wind-down sequence — dim lights, light stretching, journaling three lines about tomorrow's top priority.",
        "Consistency matters more than perfection. Even shifting your bedtime by 15 minutes earlier each week can make a noticeable difference.",
      ],
      status: "published",
      featured: true,
      featuredOrder: 2,
      publishedAt: "2026-04-28T09:00:00.000Z",
      createdAt: "2026-04-20T09:00:00.000Z",
      updatedAt: "2026-04-28T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 856,
      saves: 289,
    },
    {
      id: "supporting-friend-in-distress",
      slug: "supporting-friend-in-distress",
      title: "Supporting a Friend in Distress",
      category: "Relationships",
      description:
        "How to listen actively and provide meaningful support without becoming overwhelmed yourself.",
      readTime: "6 min read",
      author: "Grace Njeri",
      authorRole: "Peer Counsellor, PeerPoint",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCcXeSQkAkDsRZ7te_zl0gK2WEG3FEA9JH4ifOBU9M0n84_ARQwBajQN6x2tN7IeFGYY11rMdrYba3GGRLGL5YxDApnLHdyt6yKOyvaSz5vtfXNIp42d1trXTRpweBdGm3OJGCeWHPIeQbDkRtn1K8druLpEABFh12tzh1a2UnMOxo4bLvrb_02d03Jq6hDHfBRxuI1YDejFntcsXAO1lyONnKvHySTS2jDICUDHr5yYLHrSpIc3Sansc3Fxp3XVl7vQFtv3J4Q7WA",
      imageAlt:
        "Two university students in supportive conversation in a brightly lit common area.",
      body: [
        "When a friend opens up about distress, your first job is to listen — not to fix.",
        "Use reflective phrases: 'That sounds really hard' or 'I'm glad you told me.' Avoid jumping to advice unless they ask for it.",
        "Know your limits. You can be a caring friend without being their only support. Encourage professional help when needed.",
        "Take care of yourself too. Supporting someone in crisis can be emotionally heavy — debrief with a counsellor if you need to.",
      ],
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: "2026-04-19T09:00:00.000Z",
      createdAt: "2026-04-10T09:00:00.000Z",
      updatedAt: "2026-04-19T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 980,
      saves: 312,
    },
    {
      id: "panic-attack-grounding",
      slug: "panic-attack-grounding",
      title: "Panic Attack SOS: Grounding Techniques",
      category: "Anxiety",
      description:
        "Immediate, evidence-based steps to manage physical symptoms of anxiety in public spaces.",
      readTime: "4 min read",
      author: "Dr. Amina Wanjiru",
      authorRole: "Lead Counsellor, SU Wellbeing Centre",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s",
      imageAlt:
        "A peaceful meditation studio with soft morning light and a teal yoga mat.",
      body: [
        "Panic attacks are frightening but not dangerous. Your body is flooding with adrenaline — it will pass, usually within 10–20 minutes.",
        "Try the 5-4-3-2-1 technique: name five things you see, four you hear, three you can touch, two you smell, and one you taste.",
        "Slow your breathing deliberately. Longer exhales than inhales signal safety to your nervous system.",
        "If panic attacks are recurring, book a session with a peer counsellor to build a personalised coping plan.",
      ],
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: "2026-04-10T09:00:00.000Z",
      createdAt: "2026-04-01T09:00:00.000Z",
      updatedAt: "2026-04-10T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 740,
      saves: 210,
    },
    {
      id: "understanding-low-mood",
      slug: "understanding-low-mood",
      title: "Understanding Low Mood and Depression",
      category: "Depression",
      description:
        "Recognise the signs of persistent low mood and learn when to reach out for professional support on campus.",
      readTime: "7 min read",
      author: "Dr. Samuel Kariuki",
      authorRole: "Clinical Psychologist, SU Wellbeing Centre",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA_0PV1bDE1y2FS_aaGF8mMP2IR4N-AUiTw9f7t0Eft6h2925k13Cs1kh_J6t-GuELqPOecr5xfytSeyiBq8q9oiT6Tf3CH2CuXPpq1TYJ5nW7L1UMqPBSzKQOpIfO7boaY5PVMfqEgoPJhsjHQw8DgR7Zi2yyJxDrjHZClej-PLhj2hvcmKjmFNhw03EF_PIkCAsLknFCQXVm_T8w8wC0eUZAZ2Z6L13VOK8Q6NOkV93icGSpfIu_AI71LmYrB3ecAWr4AcRQ5Kg8",
      imageAlt: "A calm desk scene with an open journal and soft natural light.",
      body: [
        "Low mood is more than a bad day. When sadness, fatigue, or loss of interest persist for two weeks or more, it's worth paying attention.",
        "Common signs include withdrawing from friends, struggling to attend lectures, or feeling hopeless about the future.",
        "Peer support helps, but depression often benefits from professional intervention. Strathmore's counselling services are confidential.",
        "Small steps count: one shower, one meal, one message to someone you trust. You don't have to do it all at once.",
      ],
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: "2026-03-30T09:00:00.000Z",
      createdAt: "2026-03-20T09:00:00.000Z",
      updatedAt: "2026-03-30T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 620,
      saves: 198,
    },
    {
      id: "exam-season-focus",
      slug: "exam-season-focus",
      title: "Staying Focused During Exam Season",
      category: "Academic Focus",
      description:
        "Build sustainable study habits that protect your wellbeing while meeting academic deadlines.",
      readTime: "6 min read",
      author: "Brian Otieno",
      authorRole: "Peer Counsellor, PeerPoint",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAajAnjD-DH_nDYYqSahNTTPhdo52Ub3qOmNlYmhc3J-3hIFHqTvYaqRzZ0KrefALO_xYE7om6J1MfSiF0ULEgRE4zHbt8lGnotNegiee8f8K--tr0tKY4HWb_7wwG59tESEp5NT9toCv8thFjV60dlCftvhWt2ZY4nuh6kBk7hKrVXjujWWoq6xeIFdG68IGFwdBs94QdSxy-2I0MGjNW0UglA3StntQPzyKK4wiUw2xVgmdyDpHqX6b2swxdOw7gTWkmNQNb3ryE",
      imageAlt: "A serene landscape with soft morning light over calm hills.",
      body: [
        "Exam season rewards consistency over cramming. Block study sessions in 45-minute chunks with 10-minute breaks.",
        "Protect your basics: sleep, meals, and movement. Sacrificing all three for extra study hours usually backfires.",
        "Use a weekly review every Sunday — what's due, what's started, and what can wait until after exams.",
        "If perfectionism is driving burnout, talk to a peer counsellor about setting kinder expectations for yourself.",
      ],
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: "2026-03-22T09:00:00.000Z",
      createdAt: "2026-03-15T09:00:00.000Z",
      updatedAt: "2026-03-22T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 540,
      saves: 175,
    },
    {
      id: "five-minute-mindfulness",
      slug: "five-minute-mindfulness",
      title: "Five-Minute Mindfulness Reset",
      category: "Self-Care",
      description:
        "A quick guided practice you can use between lectures to recentre and release tension.",
      readTime: "3 min read",
      author: "Grace Njeri",
      authorRole: "Peer Counsellor, PeerPoint",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s",
      imageAlt: "A yoga mat unrolled in a bright, peaceful room.",
      body: [
        "You don't need a silent room or 30 minutes. A mindfulness reset can happen between lectures in five minutes.",
        "Sit comfortably, close your eyes, and focus on the sensation of breath at your nostrils.",
        "When your mind wanders — and it will — gently return to the breath without judging yourself.",
        "Practice daily for a week and notice whether your baseline stress feels even slightly lower.",
      ],
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: "2026-03-15T09:00:00.000Z",
      createdAt: "2026-03-10T09:00:00.000Z",
      updatedAt: "2026-03-15T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 410,
      saves: 142,
    },
    {
      id: "social-anxiety-campus-draft",
      slug: "social-anxiety-campus-draft",
      title: "Managing Social Anxiety on Campus",
      category: "Anxiety",
      description:
        "Practical strategies for navigating social situations, group work, and campus events when anxiety feels overwhelming.",
      readTime: "6 min read",
      author: "Dr. Anne Kiama",
      authorRole: "SU Wellbeing Centre",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s",
      imageAlt: "Students walking together on a university campus pathway.",
      body: [
        "Social anxiety is common among students adjusting to university life. You're not alone, and small steps can make gatherings feel more manageable.",
        "Prepare conversation openers before events — a question about coursework or a club activity can ease the pressure to improvise.",
        "It's okay to step outside for a breather. Excusing yourself briefly is a valid coping strategy, not a failure.",
      ],
      status: "draft",
      featured: false,
      featuredOrder: null,
      publishedAt: null,
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: "2026-06-10T09:00:00.000Z",
      lastEditedBy: "Admin User",
      ...emptySubmissionMetadata(),
      views: 0,
      saves: 0,
    },
    {
      id: "sleep-hygiene-students",
      slug: "sleep-hygiene-students",
      title: "Sleep Hygiene for Students",
      category: "Self-Care",
      description:
        "Evidence-based habits to protect your rest during busy semesters — from screen boundaries to wind-down rituals.",
      readTime: "6 min read",
      author: "Jane Doe",
      authorRole: COUNSELLOR_AUTHOR_ROLE,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAN5jWl_rP_bvEcHNJI_NLrsJig7ibJcDkuKnK0NkCxHYpusEbQTcl50B4TArKz-JjxXAbAqIxrXpWPEE_62TrQmohFCPX-EYK8qjAOn7OV8Fz7XsxNgRCZqisg5CCjhpnBolOubJc1j-zDHVFCCMvKHSnPPGahcqBemV2vhb3fAVIIcTaG-CpRbBbr-OmYUdfafVEMYjq0fQnOsXHQx9XluDFVC7NSW-RORpe9hnrpagr1OgjlyYuY7o7lJQghiAaXBSax_gXWJcA",
      imageAlt: "A calm bedroom desk with a journal and soft lamp light.",
      body: [
        "Sleep is the foundation of focus, mood, and memory. During exam season, sacrificing rest often feels necessary — but it usually makes everything harder.",
        "Try a digital sunset: charge your phone away from your bed at least 30 minutes before sleep.",
        "Build a short wind-down sequence — dim lights, light stretching, and writing tomorrow's top priority in a notebook.",
      ],
      status: "pending_review",
      featured: false,
      featuredOrder: null,
      publishedAt: null,
      createdAt: "2026-06-15T09:00:00.000Z",
      updatedAt: "2026-06-18T14:00:00.000Z",
      lastEditedBy: "Jane Doe",
      submittedBy: {
        id: 2,
        fullName: "Jane Doe",
        email: "counsellor@strathmore.edu",
      },
      submittedAt: "2026-06-18T14:00:00.000Z",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      views: 0,
      saves: 0,
    },
    {
      id: "building-exam-resilience",
      slug: "building-exam-resilience",
      title: "Building Resilience During Exams",
      category: "Stress",
      description:
        "Practical reframes and grounding tools for when exam pressure starts to feel overwhelming.",
      readTime: "5 min read",
      author: "Jane Doe",
      authorRole: COUNSELLOR_AUTHOR_ROLE,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAajAnjD-DH_nDYYqSahNTTPhdo52Ub3qOmNlYmhc3J-3hIFHqTvYaqRzZ0KrefALO_xYE7om6J1MfSiF0ULEgRE4zHbt8lGnotNegiee8f8K--tr0tKY4HWb_7wwG59tESEp5NT9toCv8thFjV60dlCftvhWt2ZY4nuh6kBk7hKrVXjujWWoq6xeIFdG68IGFwdBs94QdSxy-2I0MGjNW0UglA3StntQPzyKK4wiUw2xVgmdyDpHqX6b2swxdOw7gTWkmNQNb3ryE",
      imageAlt: "Open textbooks and a cup of tea on a study desk.",
      body: [
        "Exam resilience is not about ignoring stress — it is about recovering quickly when pressure spikes.",
        "Name what you can control today: one revision block, one meal, one conversation with a friend.",
        "When perfectionism takes over, ask yourself what you would tell a friend in the same situation.",
      ],
      status: "rejected",
      featured: false,
      featuredOrder: null,
      publishedAt: null,
      createdAt: "2026-06-10T09:00:00.000Z",
      updatedAt: "2026-06-12T11:00:00.000Z",
      lastEditedBy: "Admin Sarah",
      submittedBy: {
        id: 2,
        fullName: "Jane Doe",
        email: "counsellor@strathmore.edu",
      },
      submittedAt: "2026-06-11T10:00:00.000Z",
      reviewedBy: "Admin Sarah",
      reviewedAt: "2026-06-12T11:00:00.000Z",
      rejectionReason:
        "Please add a clearer disclaimer that this is peer support content, not clinical advice. Resubmit once updated.",
      views: 0,
      saves: 0,
    },
  ];
}

export function sortFeaturedResources(resourceList) {
  return [...resourceList].sort((left, right) => {
    const leftOrder = left.featuredOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.featuredOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return new Date(right.publishedAt || 0) - new Date(left.publishedAt || 0);
  });
}

export function isResourceSubmittable(resource) {
  const body = (resource.body || []).map((p) => p.trim()).filter(Boolean);
  return Boolean(
    resource.title?.trim() &&
      resource.category &&
      resource.description?.trim() &&
      resource.image?.trim() &&
      resource.imageAlt?.trim() &&
      body.length > 0,
  );
}
