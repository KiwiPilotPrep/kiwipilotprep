/**
 * CPL Human Factors — the free ten-question mock.
 *
 * Grounded in this subject's own lessons. The weight sits where the CPL
 * syllabus puts it: decision making, the error chain, crew resource
 * management and threat and error management, alongside the physiology.
 */
export const subject = {
  course: "cpl-theory",
  subject: "human-factors",
  questions: [
    {
      section: "Hypoxia",
      prompt: "The partial pressure of oxygen at sea level is approximately:",
      options: [
        "150 mm Hg outside the lungs and 102 mm Hg inside them",
        "102 mm Hg outside the lungs and 150 mm Hg inside them",
        "760 mm Hg outside the lungs and 150 mm Hg inside them",
        "21 mm Hg outside the lungs and 15 mm Hg inside them",
      ],
      answer: 0,
      explanation:
        "150 mm Hg outside the lungs and 102 mm Hg inside them. Gas exchange depends on that differential across the alveolar surface, so anything that reduces the outside partial pressure reduces the transfer and produces hypoxia.",
    },
    {
      section: "Hyperventilation",
      prompt: "Hyperventilation results in:",
      options: [
        "Too little oxygen reaching the tissues because of reduced partial pressure",
        "Too much carbon dioxide being eliminated from the bloodstream",
        "Nitrogen coming out of solution in the blood",
        "Trapped gas expanding in the sinuses",
      ],
      answer: 1,
      explanation:
        "Over-breathing washes out carbon dioxide, giving tingling, visual disturbance, hot and cold flushes, anxiety and impaired performance. It can be hard to distinguish from hypoxia, and the rule is that if in doubt you supply oxygen.",
    },
    {
      section: "Decompression Sickness",
      prompt: "Decompression sickness occurs when a reduction in surrounding pressure causes:",
      options: [
        "Oxygen to leave the haemoglobin",
        "Nitrogen dissolved in the blood to come out of solution as bubbles",
        "Carbon dioxide to accumulate in the tissues",
        "Trapped gas in the middle ear to expand",
      ],
      answer: 1,
      explanation:
        "Nitrogen bubbles out of solution and lodges in the joints, brain, spinal cord and under the skin. Treatment is urgent recompression in a hyperbaric chamber, which is why it cannot be dealt with in the air — the response is to descend and land.",
    },
    {
      section: "Visual Illusions and Runway Perspective",
      prompt: "Approaching a runway that is longer than the pilot is accustomed to tends to produce:",
      options: [
        "The picture of a steep approach, tempting the pilot to fly lower",
        "The picture of a low approach, tempting the pilot to fly higher",
        "No change to the approach picture",
        "An illusion of excessive groundspeed",
      ],
      answer: 0,
      explanation:
        "A longer runway gives the same picture a steep approach gives, so the correction the pilot is drawn to make is to descend — flying the approach lower than it should be. A shorter or narrower runway does the reverse.",
    },
    {
      section: "Sleep, Fatigue and Alertness",
      prompt: "Body temperature, which tracks the circadian rhythm, is typically lowest:",
      options: ["Between 3 and 5 am", "Between 7 and 8 am", "Between 1 and 3 pm", "Between 7 and 8 pm"],
      answer: 0,
      explanation:
        "Temperature peaks around 7 to 8 pm and bottoms out between 3 and 5 am. Performance tracks it: people are most alert when temperature is highest and least alert when it is lowest, which is what makes early-hours flying a performance issue rather than a willpower one.",
    },
    {
      section: "Sleep, Fatigue and Alertness",
      prompt: "Fatigue is defined as:",
      options: [
        "A shortage of sleep on a single night",
        "The accumulation of unrelieved stress",
        "A medical condition requiring a certificate endorsement",
        "The effect of flying across more than three time zones",
      ],
      answer: 1,
      explanation:
        "Fatigue is the accumulation of unrelieved stress. It can come from short sleep, environmental stressors, excessive mental or physical activity or disrupted sleep patterns, and it can be acute or chronic — the chronic form being the serious one.",
    },
    {
      section: "Drugs and Alcohol",
      prompt: "A potentiating agent is a drug that:",
      options: [
        "Has a long half-life and remains in the body for days",
        "Changes or exaggerates the effect of another drug",
        "Is available without prescription",
        "Affects only the central nervous system",
      ],
      answer: 1,
      explanation:
        "A potentiating agent changes or exaggerates the effect of another drug taken alongside it. It sits beside the other concern — a long half-life, which leaves a drug's concentration high long after the dose, as with sleeping tablets.",
    },
    {
      section: "Judgement and Decision Making",
      prompt: "In an error chain leading to an accident:",
      options: [
        "One poor decision increases the probability of another, and the alternatives for safe flight decrease",
        "Each error is independent of the ones before it",
        "The final error is always the most serious one",
        "Breaking the chain is only possible before departure",
      ],
      answer: 0,
      explanation:
        "Most accidents come from a combination of circumstances rather than one cause. Each poor judgement makes the next more likely and narrows the options left, which is why the chain has to be broken as early as it is noticed.",
    },
    {
      section: "Judgement and Decision Making",
      prompt: "In risk assessment, a hazard is distinguished from a risk in that a hazard is:",
      options: [
        "The likelihood that harm occurs",
        "The potential to cause harm",
        "The consequence once harm has occurred",
        "An event that has already happened",
      ],
      answer: 1,
      explanation:
        "A hazard is the potential to cause harm; the risk is the likelihood of that harm being realised. Keeping them apart is what lets personal minimums be set on the ground and held to in the air, rather than renegotiated each time.",
    },
    {
      section: "Social Psychology and Crew Resource Management",
      prompt: "Cognitive dissonance describes:",
      options: [
        "The inability to hear a radio call over cockpit noise",
        "The mental discomfort of simultaneously holding contradictory beliefs or values",
        "Misreading an instrument because of expectation",
        "A steep authority gradient in a two-crew cockpit",
      ],
      answer: 1,
      explanation:
        "Cognitive dissonance is the discomfort of holding two contradictory beliefs, ideas or values at once — and the pressure to resolve it is what can push a pilot to discount information that conflicts with a plan already made.",
    },
  ],
};
