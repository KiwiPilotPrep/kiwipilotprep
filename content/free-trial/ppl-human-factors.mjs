/**
 * PPL Human Factors — the free ten-question mock.
 *
 * Grounded in this subject's own lessons: the times of useful consciousness,
 * the dark adaptation figures, the bottle-to-throttle interval and the named
 * hazardous attitudes are all the ones the course teaches.
 */
export const subject = {
  course: "ppl-theory",
  subject: "human-factors",
  questions: [
    {
      section: "Hypoxia and Hyperventilation",
      prompt: "Hypoxia is most difficult to detect in oneself because it first affects:",
      options: [
        "Muscular strength in the arms and legs",
        "The higher mental functions, including judgement and self-criticism",
        "Hearing, before anything else",
        "The sense of balance",
      ],
      answer: 1,
      explanation:
        "Brain tissue and the eyes are the most sensitive to a shortage of oxygen, so the higher mental functions go first. Euphoria combined with poor judgement is the dangerous pairing: the faculty needed to notice the problem is the faculty being lost.",
    },
    {
      section: "Hypoxia and Hyperventilation",
      prompt: "The time of useful consciousness at 25,000 ft is approximately:",
      options: ["15 to 30 minutes", "3 to 5 minutes", "45 to 60 seconds", "10 to 15 seconds"],
      answer: 1,
      explanation:
        "Time of useful consciousness — the time in which a person can be expected to take effective preventive measures — is 15 to 30 minutes at 18,000 ft, 3 to 5 minutes at 25,000 ft, and only 45 to 60 seconds at 35,000 ft.",
    },
    {
      section: "Trapped Gases and Decompression",
      prompt:
        "Trapped gas in the middle ear and sinuses is most likely to cause pain and damage:",
      options: [
        "During the climb, as the trapped gas expands",
        "During the descent, as the surrounding pressure increases",
        "Only in pressurised aircraft",
        "Only above 10,000 ft",
      ],
      answer: 1,
      explanation:
        "The descent is the dangerous half. Climbing, expanding gas usually vents itself; descending, the pressure outside rises and gas has to be forced back in through passages that a cold can swell shut. Even a low-powered aeroplane can descend fast enough to make that painful.",
    },
    {
      section: "Vision",
      prompt: "Dark adaptation of the eye is approximately:",
      options: [
        "Complete after 5 minutes",
        "50% complete after 10 minutes and full after 30 minutes",
        "Full after 10 minutes, and unaffected by bright light",
        "Only possible with the use of red cockpit lighting",
      ],
      answer: 1,
      explanation:
        "The eye is about 50% dark adapted after 10 minutes and fully adapted after 30. It is also asymmetric: adaptation takes half an hour to build and a moment of bright light to destroy.",
    },
    {
      section: "Visual Illusions",
      prompt:
        "An approach flown to a runway that is narrower than the pilot is used to will tend to give the impression that the aircraft is:",
      options: [
        "Too high, leading to a low approach",
        "Too low, leading to a high approach",
        "On the correct profile",
        "Too fast, leading to a low approach",
      ],
      answer: 0,
      explanation:
        "Runway perspective drives the judgement. A steep approach makes a runway look longer and narrower, so a runway that is genuinely narrower reads as though the aircraft is high — and the correction for being high is to descend, which flies the approach low.",
    },
    {
      section: "Spatial Orientation and Disorientation",
      prompt: "The three systems the body uses to establish its orientation in space are:",
      options: [
        "Vision, the vestibular system and the proprioceptive senses",
        "Vision, hearing and touch",
        "The vestibular system, hearing and taste",
        "Vision, the vestibular system and hearing",
      ],
      answer: 0,
      explanation:
        "Orientation comes from vision, the vestibular apparatus of the inner ear, and the proprioceptive or 'seat of the pants' senses. Disorientation follows when the three disagree, and vision is the one that resolves the argument — which is why losing the horizon is what starts the trouble.",
    },
    {
      section: "Alcohol, Medication and Drugs",
      prompt: "Following a single unit blood donation of 600 mL, a pilot must wait before flying:",
      options: ["8 hours", "12 hours", "24 hours", "48 hours"],
      answer: 2,
      explanation:
        "Twenty-four hours must elapse after donating a unit of blood. Donation reduces circulating volume, which can cause low blood pressure and fainting, and it reduces tolerance to both hypoxia and G forces.",
    },
    {
      section: "Sleep and Fatigue",
      prompt: "A useful nap for a fatigued pilot is generally:",
      options: [
        "10 to 20 minutes, remaining in the light stages of sleep",
        "45 to 60 minutes, to complete a full cycle",
        "Two hours or more",
        "Of no value at any duration",
      ],
      answer: 0,
      explanation:
        "Ten to twenty minutes keeps the sleeper in stages 1 and 2 and avoids waking from deep sleep. Caffeine is not an alternative — it postpones the effects of sleep loss without removing them.",
    },
    {
      section: "Information Processing",
      prompt: "Grouping a string of numbers into blocks so that more of it can be held in working memory is called:",
      options: ["Coding", "Rehearsal", "Chunking", "Selective attention"],
      answer: 2,
      explanation:
        "Chunking groups items so that working memory, which holds only a few separate items, carries more. Rehearsal is repetition to move information into long-term memory, and coding attaches new information to something already known.",
    },
    {
      section: "Situational Awareness and Decision Making",
      prompt: "Which of the following is one of the recognised hazardous attitudes?",
      options: ["Scepticism", "Anti-authority", "Deliberation", "Assertiveness"],
      answer: 1,
      explanation:
        "Anti-authority — 'rules are for fools' — is one of the named hazardous attitudes, alongside impulsivity, invulnerability, macho and resignation. Each is named because each has accidents behind it, and naming one is how a pilot catches it in themselves.",
    },
  ],
};
