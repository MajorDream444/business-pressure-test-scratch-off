import { Question, Band } from './types';

export const QUESTIONS: Question[] = [
  {
    id: "q1_client_source",
    question: "How do most of your clients come in right now?",
    options: [
      { label: "Random referrals or word of mouth only", score: 0 },
      { label: "Mostly manual outreach", score: 2.5 },
      { label: "A mix of referrals and some content/inbound", score: 5 },
      { label: "Consistent inbound from one channel", score: 7.5 },
      { label: "Predictable inbound from multiple channels", score: 10 }
    ]
  },
  {
    id: "q2_two_week_test",
    question: "If you stopped working for 2 weeks, what would happen?",
    options: [
      { label: "Everything would stop", score: 0 },
      { label: "Most things would slow down badly", score: 2.5 },
      { label: "Some things would continue, but it would hurt", score: 5 },
      { label: "Core operations would continue", score: 7.5 },
      { label: "Business would keep running with minimal disruption", score: 10 }
    ]
  },
  {
    id: "q3_offer_clarity",
    question: "How clear is your offer?",
    options: [
      { label: "I am not fully sure what I sell", score: 0 },
      { label: "I have an offer, but people seem confused", score: 2.5 },
      { label: "My offer is decent, but inconsistent in conversion", score: 5 },
      { label: "My offer is clear and usually understood", score: 7.5 },
      { label: "My offer is clear, strong, and converts predictably", score: 10 }
    ]
  },
  {
    id: "q4_lead_flow",
    question: "How consistent is your lead flow?",
    options: [
      { label: "Totally inconsistent", score: 0 },
      { label: "Some weeks yes, some weeks no", score: 2.5 },
      { label: "I get leads, but not predictably", score: 5 },
      { label: "I usually know where leads will come from", score: 7.5 },
      { label: "I have a reliable lead generation system", score: 10 }
    ]
  },
  {
    id: "q5_follow_up",
    question: "What does your follow-up look like?",
    options: [
      { label: "I forget or do it randomly", score: 0 },
      { label: "I do it manually when I remember", score: 2.5 },
      { label: "I have some follow-up, but it is messy", score: 5 },
      { label: "I follow up consistently with a process", score: 7.5 },
      { label: "My follow-up is systemized or automated", score: 10 }
    ]
  },
  {
    id: "q6_backend",
    question: "How organized is your business backend?",
    options: [
      { label: "It is chaotic", score: 0 },
      { label: "Some parts are organized, most are not", score: 2.5 },
      { label: "It works, but it is messy", score: 5 },
      { label: "It is mostly organized", score: 7.5 },
      { label: "It is structured and easy to manage", score: 10 }
    ]
  },
  {
    id: "q7_revenue_visibility",
    question: "How well do you understand where your revenue actually comes from?",
    options: [
      { label: "I mostly guess", score: 0 },
      { label: "I have a rough idea", score: 2.5 },
      { label: "I can see some patterns", score: 5 },
      { label: "I track the main revenue drivers", score: 7.5 },
      { label: "I know exactly what channels and actions drive revenue", score: 10 }
    ]
  },
  {
    id: "q8_automation",
    question: "How much of your business is automated or systemized?",
    options: [
      { label: "Almost none of it", score: 0 },
      { label: "Very little", "score": 2.5 },
      { label: "Some key parts", score: 5 },
      { label: "A lot of the repeatable work", score: 7.5 },
      { label: "Most repeatable workflows are systemized", score: 10 }
    ]
  },
  {
    id: "q9_decision_clarity",
    question: "How clear are you on what is actually broken right now?",
    options: [
      { label: "I am not sure at all", score: 0 },
      { label: "I feel the problem, but cannot clearly define it", score: 2.5 },
      { label: "I know some of the issues", score: 5 },
      { label: "I know the main bottlenecks", score: 7.5 },
      { label: "I have clear visibility into the bottlenecks", score: 10 }
    ]
  },
  {
    id: "q10_scale_readiness",
    question: "How ready is your business to handle more demand right now?",
    options: [
      { label: "It would probably break", score: 0 },
      { label: "It would be stressful and messy", score: 2.5 },
      { label: "We could handle some growth", score: 5 },
      { label: "We are fairly ready", score: 7.5 },
      { label: "We are structurally ready to scale", score: 10 }
    ]
  }
];

export const BANDS: Band[] = [
  {
    key: "you_are_the_system",
    min: 0,
    max: 25,
    title: "You are the system",
    diagnosis: "Right now, the business depends heavily on your daily effort. If you stop, most things slow down or break.",
    leaks: [
      "Lead flow depends on personal effort",
      "Follow-up is inconsistent or manual",
      "Core operations are not structured"
    ],
    next_moves: [
      "Clarify one core offer",
      "Install one reliable lead path",
      "Create a simple follow-up system"
    ]
  },
  {
    key: "inconsistent_unstable",
    min: 26,
    max: 50,
    title: "Inconsistent / unstable",
    diagnosis: "You have some movement, but not enough structure. Revenue and client flow are too dependent on timing, energy, or luck.",
    leaks: [
      "Lead flow is inconsistent",
      "Offer is not converting predictably",
      "Backend process is loose"
    ],
    next_moves: [
      "Tighten offer positioning",
      "Systemize follow-up",
      "Build a more predictable client path"
    ]
  },
  {
    key: "functional_but_capped",
    min: 51,
    max: 75,
    title: "Functional but capped",
    diagnosis: "The business works, but it is likely hitting a ceiling. There is enough structure to function, but not enough to scale cleanly.",
    leaks: [
      "Growth channels are limited",
      "Offer or conversion path is under-optimized",
      "Delegation and automation are partial"
    ],
    next_moves: [
      "Improve conversion path",
      "Expand demand generation",
      "Strengthen automation and visibility"
    ]
  },
  {
    key: "structured_ready_to_scale",
    min: 76,
    max: 100,
    title: "Structured and ready to scale",
    diagnosis: "You have a solid foundation. The next move is not survival or cleanup — it is scale, leverage, and strategic expansion.",
    leaks: [
      "Scale path may be unclear",
      "Growth may still rely on a narrow channel mix",
      "Upsell / backend monetization may be underbuilt"
    ],
    next_moves: [
      "Expand acquisition channels",
      "Increase leverage through automation",
      "Build a clearer scale roadmap"
    ]
  }
];
