export const CRITERIA = [
  {
    key: "Q1",
    label: "Problem Statement",
    desc: "Is the problem clearly defined and significant?",
    weightage: 1,
    color: "text-brand",
    bg: "bg-brand/5",
  },
  {
    key: "Q2",
    label: "Solution Provided",
    desc: "Is the solution well-defined and viable?",
    weightage: 1,
    color: "text-sky",
    bg: "bg-sky/5",
  },
  {
    key: "Q3",
    label: "USP",
    desc: "Does it have a unique selling proposition?",
    weightage: 2,
    color: "text-jade",
    bg: "bg-jade/5",
  },
  {
    key: "Q4",
    label: "Market Scalability Potential",
    desc: "Can this scale to a significant market?",
    weightage: 4,
    color: "text-gold",
    bg: "bg-gold/5",
  },
  {
    key: "Q5",
    label: "Presentation",
    desc: "Was the pitch clear and engaging?",
    weightage: 3,
    color: "text-rose",
    bg: "bg-rose/5",
  },
  {
    key: "Q6",
    label: "Founder's Knowledge & Confidence",
    desc: "Does the founder demonstrate expertise?",
    weightage: 2,
    color: "text-sky",
    bg: "bg-sky/5",
  },
  {
    key: "Q7",
    label: "Answers to Jury Question",
    desc: "Quality of responses to jury questions?",
    weightage: 3,
    color: "text-jade",
    bg: "bg-jade/5",
  },
  {
    key: "Q8",
    label: "Other",
    desc: "Additional relevant factors?",
    weightage: 1,
    color: "text-amber",
    bg: "bg-amber/5",
  },
];

export const MAX_SCORE = CRITERIA.reduce(
  (total, criterion) => total + criterion.weightage * 5,
  0
);
