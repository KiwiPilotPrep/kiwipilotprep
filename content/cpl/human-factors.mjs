/**
 * Human Factors — the curriculum.
 *
 * A PDF of 377 slides that reports a single section divider, so the imported
 * course chaptered it by cutting the deck into equal spans and naming each
 * after a slide inside it — "Arterial Disease" for a 25-slide chapter,
 * "Automation - Advantages" for a nine-slide one.
 *
 * The structure is recoverable a different way. Around thirty slides carry a
 * title, no body text and one image: the PDF's version of a section slide.
 * Read in order they give the subject's real spine, and it lines up almost
 * exactly with the examinable areas — which is unsurprising, since the deck
 * was written to them. The chapters below follow it, with the two largest
 * spans split because twenty-two slides of visual illusions is not one
 * chapter.
 *
 * Of the six CPL decks this is the cleanest for images: 254 distinct pictures,
 * no academy branding, no repeated backgrounds and nothing measuring blank.
 * Nothing is rejected from it, which is a finding rather than an omission.
 *
 * Human Factors is also the subject where authored teaching earns its place
 * most easily. The deck is largely accurate lists; what a student needs is the
 * mechanism underneath them and the reason each matters in an aeroplane.
 */

export const subject = {
  slug: "human-factors",
  title: "Human Factors",
  deck: "cpl-human-factors",

  skip: {
    1: "deck cover slide: the words \"HUMAN FACTORS - CPL\" with no body text and no diagram",
  },

  chapters: [
    {
      title: "Professionalism, Responsibility and Airmanship",
      syllabus: ["34.2"],
      intro:
        "The subject opens with an attitude rather than a fact, and it is the " +
        "right place to start: almost everything that follows is about a person " +
        "who is capable of the task and has to decide whether they are fit to " +
        "do it today.",
      topics: [
        {
          title: "Professionalism in Aviation",
          pages: [2, 3, 4],
          intro:
            "What the word means in an occupation where nobody is watching most " +
            "of the time.",
        },
        {
          title: "Responsibility and Airmanship",
          pages: [5, 6],
          intro:
            "What a commercial pilot is responsible for, and the quality that is " +
            "easier to recognise than to define.",
          context:
            "Airmanship is the part of the job no rule can specify. The rules set " +
            "a floor; airmanship is everything you do above it because you " +
            "understood the situation — and it is what this whole subject is " +
            "trying to build.",
        },
      ],
    },

    {
      title: "Human Factors Models and Programmes",
      syllabus: ["34.4"],
      intro:
        "Why the industry studies this at all, what the accident record showed, " +
        "and the frameworks built in response.",
      topics: [
        {
          title: "The Air Transport Industry and its Safety Record",
          pages: [7, 8, 9],
          intro:
            "How safety improved, and what became the limiting factor once the " +
            "machinery stopped failing.",
          context:
            "As engineering reliability improved, the proportion of accidents " +
            "caused by the machine fell and the proportion caused by people rose " +
            "— not because pilots got worse, but because the other cause was " +
            "being eliminated. That is the observation the whole discipline grew " +
            "out of.",
        },
        {
          title: "Human Factors in Aviation",
          pages: [10],
          intro:
            "What the field covers.",
        },
        {
          title: "CRM, TEM and Safety Management Systems",
          pages: [11, 12, 13, 14],
          intro:
            "Three programmes, each attacking the problem from a different " +
            "direction.",
        },
        {
          title: "The SHELL Model",
          pages: [15, 16],
          intro:
            "A conceptual model of the interfaces between the person and " +
            "everything around them.",
          takeaway:
            "The value of SHELL is that it puts the human at the centre and makes " +
            "every problem an <em>interface</em> problem. It is rarely the person " +
            "or the equipment that failed — it is the fit between them, and that " +
            "is something that can be designed.",
        },
      ],
    },

    {
      title: "The Atmosphere and the Physiology of Flight",
      syllabus: ["34.6"],
      intro:
        "The gas laws applied to a person. Everything in the next four chapters " +
        "follows from partial pressure falling as the aircraft climbs.",
      topics: [
        {
          title: "Composition of the Atmosphere and Dalton's Law",
          pages: [17, 18],
          intro:
            "What the air is made of, and the law that governs how much of each " +
            "gas is available to you.",
          // Slide 18's pie chart held the composition figures and carried a
          // publisher's watermark, so it was removed. The lesson is named for
          // those figures, and the slide never states them in words.
          term: "The composition of the atmosphere",
          definition:
            "Dry air is about 78% nitrogen and 21% oxygen by volume, the " +
            "remaining 1% being argon, carbon dioxide and traces of others. " +
            "Those proportions hold throughout the height band an aeroplane " +
            "operates in. What falls with altitude is the total pressure, and " +
            "with it the amount of oxygen in any one breath.",
        },
        {
          title: "Variation of Pressure with Altitude",
          pages: [19],
          intro:
            "How quickly pressure falls, expressed as a proportion of the sea " +
            "level value.",
          context:
            "The proportion of oxygen in the air does not change with height — " +
            "it is about a fifth all the way up. What falls is the total " +
            "pressure, and therefore the partial pressure of oxygen. That single " +
            "fact is the whole of the hypoxia chapter.",
        },
      ],
    },

    {
      title: "Circulation and Respiration",
      syllabus: ["34.8"],
      intro:
        "The two systems that get oxygen from the air to the tissues, and the " +
        "points at which each can fail.",
      topics: [
        {
          title: "The Respiratory System",
          pages: [20, 21, 22, 23, 24],
          intro:
            "External and internal respiration, and what happens at each stage.",
        },
        {
          title: "The Circulatory System",
          pages: [25, 26, 27, 28],
          intro:
            "The heart, the blood vessels and what the blood is carrying.",
        },
      ],
    },

    {
      title: "Hypoxia",
      syllabus: ["34.10"],
      intro:
        "Not enough oxygen reaching the tissues. The most important thing about " +
        "it is that the symptom which would tell you it is happening — " +
        "judgement — is one of the first things it takes away.",
      topics: [
        {
          title: "Oxygen Partial Pressure and Hypoxia",
          pages: [29, 30, 31],
          intro:
            "The mechanism, and what the condition actually is.",
        },
        {
          title: "Symptoms and Detection",
          pages: [32, 33, 34],
          intro:
            "The behavioural and physiological signs, and how they are " +
            "recognised.",
          misconception:
            "Expecting to notice hypoxia by feeling short of breath. The urge to " +
            "breathe is driven by carbon dioxide, not by oxygen — so at altitude " +
            "you can be dangerously hypoxic and entirely comfortable, which is " +
            "precisely why it kills.",
        },
        {
          title: "Prevention, Tolerance and Treatment",
          pages: [35, 36, 37],
          intro:
            "How it is avoided, what makes an individual more or less " +
            "susceptible, and what is done about it.",
        },
        {
          title: "Time of Useful Consciousness",
          pages: [38],
          intro:
            "The period between losing the oxygen supply and being unable to do " +
            "anything about it.",
          takeaway:
            "Time of useful consciousness is not time until unconsciousness — it " +
            "is time until you can no longer act usefully, which is much shorter. " +
            "At altitude it can be measured in seconds, which is why the drill is " +
            "practised rather than reasoned out.",
        },
      ],
    },

    {
      title: "Hyperventilation",
      syllabus: ["34.12"],
      intro:
        "Breathing too much rather than too little, and the reason it is so " +
        "easily confused with the chapter before it.",
      topics: [
        {
          title: "Causes and Effects",
          pages: [39, 40, 41, 42],
          intro:
            "What triggers it, and what removing too much carbon dioxide does to " +
            "the body.",
          context:
            "Hypoxia can cause hyperventilation, and the symptoms overlap heavily " +
            "— which is a genuine diagnostic problem in the air. The safe " +
            "response is to treat for hypoxia first: oxygen will not harm someone " +
            "who is hyperventilating, and withholding it from someone who is " +
            "hypoxic will.",
        },
        {
          title: "Treating Hyperventilation",
          pages: [43],
          intro:
            "What is done once the cause is established.",
        },
      ],
    },

    {
      title: "Entrapped Gases and Barotrauma",
      syllabus: ["34.14"],
      intro:
        "Boyle's law applied to the cavities of the body. Gas trapped anywhere " +
        "expands as the aircraft climbs, and if it cannot escape it causes " +
        "pain or damage.",
      topics: [
        {
          title: "Barotrauma",
          pages: [44, 45],
          intro:
            "What it is and how it is caused.",
        },
        {
          title: "Effects on the Body",
          pages: [46, 47],
          intro:
            "The ears, the sinuses, the teeth and the gut, and what happens in " +
            "each.",
          takeaway:
            "The ear is the one that matters most because the eustachian tube " +
            "vents outwards more easily than inwards. That is why a descent with " +
            "a head cold hurts far more than the climb did — and why flying with " +
            "a blocked sinus is a genuine hazard rather than discomfort.",
        },
        {
          title: "Prevention and Treatment",
          pages: [48],
          intro:
            "What can be done, and what is taught during training.",
        },
      ],
    },

    {
      title: "Decompression Sickness",
      syllabus: ["34.16"],
      intro:
        "Nitrogen coming out of solution in the body as pressure falls — the " +
        "diver's problem, met from the other direction.",
      topics: [
        {
          title: "Decompression Sickness and the Bends",
          pages: [49, 50, 51, 52],
          intro:
            "The mechanism, the forms it takes, and the symptoms.",
        },
        {
          title: "Reducing the Risk of Decompression Sickness",
          pages: [53],
          intro:
            "What reduces the risk and what is done if it occurs.",
          context:
            "The interval between diving and flying is the practical point here. " +
            "A dive loads the body with dissolved nitrogen, and climbing shortly " +
            "afterwards drops the pressure again before it has cleared — which " +
            "produces the condition at altitudes that would otherwise be " +
            "harmless.",
        },
        {
          title: "Explosive Decompression",
          pages: [54],
          intro:
            "The rapid case, and what makes it different.",
        },
      ],
    },

    {
      title: "Vision and the Eye",
      syllabus: ["34.18"],
      intro:
        "Most of the information a pilot uses arrives through the eye, and the " +
        "eye is considerably less reliable than it feels. This chapter is how " +
        "it works and where it fails.",
      topics: [
        {
          title: "Anatomy of the Eye",
          pages: [55, 56, 57],
          intro:
            "The structures and what each does.",
        },
        {
          title: "Vision and its Limitations",
          pages: [58, 59, 60, 61, 62],
          intro:
            "Empty field myopia, the blind spot, luminance, colour perception and " +
            "the limits of acuity.",
          context:
            "The blind spot demonstration on these slides is worth doing " +
            "properly. Everyone has a hole in each visual field where the optic " +
            "nerve leaves, the brain fills it in convincingly, and an aircraft can " +
            "sit in it — which is one reason a scan works by moving in steps " +
            "rather than sweeping.",
        },
        {
          title: "Night Vision",
          pages: [63, 64],
          intro:
            "How the eye adapts to darkness and what that costs.",
        },
        {
          title: "Cockpit and Flight Deck Lighting",
          pages: [65, 66],
          intro:
            "Red and white lighting, and the trade between them.",
        },
        {
          title: "Vision Defects, Lenses and Sunglasses",
          pages: [67, 68, 69, 70],
          intro:
            "Long and short sightedness, corrective lenses, and why polarised " +
            "lenses are a problem in an aircraft.",
          misconception:
            "Assuming polarised sunglasses are simply better. In an aircraft they " +
            "can black out parts of an LCD display and can hide the glint of " +
            "another aircraft's canopy or windscreen — which is one of the few " +
            "ways a distant aircraft becomes visible at all.",
        },
        {
          title: "Visual Search and See-and-Avoid",
          pages: [71, 72, 73, 74],
          intro:
            "The visual resting state, scanning technique, and the principle the " +
            "whole of uncontrolled airspace depends on.",
          takeaway:
            "The eye cannot detect anything while it is moving, so a smooth sweep " +
            "of the sky sees nothing. An effective scan is a series of short " +
            "stops — and each stop needs long enough for the eye to focus, which " +
            "is why it feels unnaturally slow.",
        },
      ],
    },

    {
      title: "Visual Illusions and Runway Perspective",
      syllabus: ["34.18"],
      intro:
        "The eye reports what it sees; the brain decides what it means, and it " +
        "is guessing from experience. On approach those guesses are wrong in " +
        "predictable ways.",
      topics: [
        {
          title: "Visual Illusions",
          pages: [75, 76, 77, 78, 79],
          intro:
            "Autokinesis, flicker vertigo, and the illusions that arise from " +
            "flying in cloud or at night.",
        },
        {
          title: "Whiteout and the Black Hole",
          pages: [80, 81],
          intro:
            "Two conditions in which there is nothing for the eye to fix on.",
          context:
            "The black hole approach is the one that reaches New Zealand aerodromes " +
            "regularly: a lit runway with unlit ground in front of it and no " +
            "horizon. With nothing between the aircraft and the runway to judge " +
            "against, the approach flown by eye is consistently too low.",
        },
        {
          title: "Visual Perception and the False Horizon",
          pages: [82, 83, 84, 85],
          intro:
            "How perception is constructed, and what happens when the reference " +
            "it uses is wrong.",
        },
        {
          title: "Fog, Haze, Rain and the Windscreen",
          pages: [86, 87, 88],
          intro:
            "What atmospheric conditions and the windscreen itself do to what you " +
            "see.",
          takeaway:
            "Rain on the windscreen bends the light downwards, so the runway " +
            "appears lower than it is — and the natural correction is to fly " +
            "lower still. Haze makes things look further away, with the same " +
            "result. Both illusions push in the dangerous direction.",
        },
        {
          title: "Runway Perspective",
          pages: [89, 90, 91, 92, 93],
          intro:
            "How runway length, width and slope change the approach picture.",
          misconception:
            "Trusting the picture at an unfamiliar aerodrome. A narrower or " +
            "up-sloping runway looks like you are too high, and correcting for it " +
            "puts the aircraft low; a wider one does the opposite. The instruments " +
            "and the slope indicator are what resolve it.",
        },
        {
          title: "Runway Lighting and Visual Illusions",
          pages: [94, 95, 96],
          intro:
            "How lighting changes the perception of the approach.",
        },
      ],
    },

    {
      title: "Hearing, Noise and Hearing Loss",
      syllabus: ["34.20"],
      intro:
        "The ear as a sense and as a vulnerability. Hearing damage in aviation " +
        "is cumulative, painless and permanent, which is a bad combination.",
      topics: [
        {
          title: "Anatomy of the Ear",
          pages: [97, 98, 99, 100, 101],
          intro:
            "The outer, middle and inner ear, and what each contributes.",
        },
        {
          title: "Exposure to Noise and Hearing Protection",
          pages: [102, 103, 104],
          intro:
            "What prolonged exposure does, and the protection available.",
        },
        {
          title: "Decibel Levels",
          pages: [105, 106, 107, 108, 109, 110, 111],
          intro:
            "A scale of familiar sounds, from a lawn mower to an explosion.",
          context:
            "The decibel scale is logarithmic, so the numbers understate the " +
            "difference badly — a rise of ten is ten times the intensity. A light " +
            "aircraft cockpit sits high enough on this list that a career in one " +
            "without protection has a predictable outcome.",
        },
        {
          title: "Hearing Loss",
          pages: [112, 113],
          intro:
            "How the damage occurs and why it does not recover.",
        },
        {
          title: "Pressure Changes and Illness",
          pages: [114, 115],
          intro:
            "What pressure change and infection do to hearing.",
        },
      ],
    },

    {
      title: "Spatial Orientation and Disorientation",
      syllabus: ["34.22"],
      intro:
        "Three systems tell you which way up you are, and two of them can be " +
        "fooled completely. Disorientation is not a failure of skill — it is " +
        "the predictable output of the equipment.",
      topics: [
        {
          title: "Spatial Orientation",
          pages: [116, 117, 118],
          intro:
            "How orientation is maintained, and what contributes to it.",
        },
        {
          title: "The Vestibular System",
          pages: [119, 120, 121, 122],
          intro:
            "The semi-circular canals and the vestibular sacs, and what each " +
            "detects.",
          context:
            "The canals detect <em>changes</em> in rotation, not rotation itself. " +
            "Hold a steady turn long enough and the fluid catches up, the sensation " +
            "stops, and rolling level then feels like a turn the other way. That " +
            "is the mechanism behind most of the illusions in this chapter.",
        },
        {
          title: "The Proprioceptive System and Sensory Interconnection",
          pages: [123, 124],
          intro:
            "The seat-of-the-pants sense, and how vision and the vestibular " +
            "system are connected.",
        },
        {
          title: "Disorientation and the Leans",
          pages: [125, 126],
          intro:
            "What disorientation is, and the commonest form of it.",
        },
        {
          title: "Somatogravic and Somatogyral Illusions",
          pages: [127, 128, 129, 130, 131],
          intro:
            "Illusions of pitch produced by acceleration, and illusions of " +
            "rotation produced by the canals, with the accidents they have caused.",
          takeaway:
            "The somatogravic illusion is the one that kills on a night or " +
            "instrument take-off: acceleration feels exactly like a nose-up " +
            "attitude, and the instinctive correction is to push. The only defence " +
            "is to believe the instruments from the moment the wheels leave the " +
            "ground.",
        },
        {
          title: "Coriolis Effect and Pressure Vertigo",
          pages: [132, 133],
          intro:
            "The disorientation caused by moving the head during a turn, and the " +
            "form caused by pressure change.",
        },
        {
          title: "Susceptibility and Prevention",
          pages: [134],
          intro:
            "What increases the risk, and what reduces it.",
        },
      ],
    },

    {
      title: "Gravitational Forces",
      syllabus: ["34.24"],
      intro:
        "What acceleration does to the body, in both directions, and what " +
        "changes how much of it a person can take.",
      topics: [
        {
          title: "Positive and Negative G",
          pages: [135, 136, 137, 138],
          intro:
            "The two directions, and the physiological effect of each.",
        },
        {
          title: "Human G Tolerance",
          pages: [139, 140],
          intro:
            "How much can be tolerated, and for how long.",
        },
        {
          title: "Factors Affecting G Tolerance",
          pages: [141, 142, 143, 144],
          intro:
            "What increases tolerance and what reduces it.",
          context:
            "Positive G drains blood away from the head, so the symptoms appear " +
            "in the eyes before the brain — grey-out, then tunnel vision, then " +
            "blackout, with consciousness lasting a little longer. That sequence " +
            "is a warning system, and it is why the visual symptoms are worth " +
            "recognising rather than pushing through.",
        },
      ],
    },

    {
      title: "Motion Sickness",
      syllabus: ["34.26"],
      intro:
        "A conflict between what the eyes report and what the vestibular system " +
        "reports, and what can be done about it.",
      topics: [
        {
          title: "Causes, Prevention and Treatment",
          pages: [145, 146, 147, 148],
          intro:
            "Why it happens, how to reduce the chance of it, and what helps once " +
            "it has started.",
          takeaway:
            "It is a sensory conflict, which is why it is worse for a passenger " +
            "than a pilot: the pilot is anticipating the motion and looking " +
            "outside, so the two senses agree. Giving a queasy passenger the " +
            "horizon to look at is treating the actual cause.",
        },
      ],
    },

    {
      title: "Flight Anxiety",
      syllabus: ["34.28"],
      intro:
        "Fear of flying in passengers and in pilots, and what can be done for " +
        "each.",
      topics: [
        {
          title: "Recognising Flight Anxiety",
          pages: [149, 150, 151],
          intro:
            "What it is and how it presents.",
        },
        {
          title: "Relieving Flight Anxiety",
          pages: [152],
          intro:
            "What helps.",
        },
      ],
    },

    {
      title: "Fitness to Fly",
      syllabus: ["34.30"],
      intro:
        "The decision that is made before every flight and is entirely the " +
        "pilot's own: am I fit to do this today.",
      topics: [
        {
          title: "Fitness to Fly and the Legal Requirements",
          pages: [153, 154, 155, 156],
          intro:
            "The self-assessment, and the medical certificate that sits behind " +
            "it.",
          context:
            "The medical certificate says you were fit on the day you were " +
            "examined. Everything since then is your own assessment, and the rule " +
            "is not that you must be perfect — it is that you must not fly when " +
            "you know, or should know, that you are not fit.",
        },
        {
          title: "An Accident Example",
          pages: [157, 158],
          intro:
            "A case in which fitness to fly was the determining factor.",
        },
        {
          title: "Pregnancy and Flying",
          pages: [159, 160],
          intro:
            "The considerations, for crew and for passengers.",
        },
      ],
    },

    {
      title: "Cardiovascular Health",
      syllabus: ["34.30"],
      intro:
        "The commonest cause of sudden incapacitation, and the one over which " +
        "a pilot has the most control.",
      topics: [
        {
          title: "Arterial Disease and Heart Attacks",
          pages: [161, 162, 163],
          intro:
            "What the disease is and how it presents.",
        },
        {
          title: "Risk Factors and Minimising Them",
          pages: [164, 165],
          intro:
            "What raises the risk, and what reduces it.",
        },
        {
          title: "Blood Pressure",
          pages: [166, 167],
          intro:
            "What it measures, the risks, and how they are minimised.",
        },
        {
          title: "Diet, Exercise, Obesity and Smoking",
          pages: [168, 169, 170, 171],
          intro:
            "Four factors within the individual's control.",
          takeaway:
            "Smoking appears twice in this subject and for two different reasons: " +
            "the cardiovascular risk here, and the carbon monoxide in the blood " +
            "that raises your effective altitude before you have left the ground.",
        },
      ],
    },

    {
      title: "Illness, Infection and Neurological Problems",
      syllabus: ["34.30"],
      intro:
        "Common conditions that are minor on the ground and are not minor at " +
        "altitude.",
      topics: [
        {
          title: "Respiratory Tract Infections",
          pages: [172],
          intro:
            "Why a head cold matters in an aircraft.",
        },
        {
          title: "Gastroenteritis",
          pages: [173, 174],
          intro:
            "The risk it presents and how it is avoided.",
          context:
            "The reason crew are advised not to eat the same meal is not " +
            "superstition. Gastroenteritis is incapacitating and fast, and the " +
            "one arrangement that guarantees both pilots are affected at the same " +
            "time is a shared meal.",
        },
        {
          title: "Neurological Problems",
          pages: [175],
          intro:
            "The conditions of concern.",
        },
        {
          title: "Depression and Anxiety",
          pages: [176, 177],
          intro:
            "Mental health as a fitness-to-fly question.",
        },
      ],
    },

    {
      title: "Drugs and Alcohol",
      syllabus: ["34.32", "34.34"],
      intro:
        "Substances that change performance, including several that are not " +
        "thought of as drugs at all.",
      topics: [
        {
          title: "Alcohol",
          pages: [178, 179, 180, 181],
          intro:
            "Its effects, how it is cleared, and the hangover.",
          misconception:
            "Believing the hangover is the safe state. Alcohol is gone from the " +
            "blood long before its effects are, and the dehydration and disturbed " +
            "sleep that follow degrade performance for many hours after any " +
            "reading would be zero.",
        },
        {
          title: "Over-the-Counter and Recreational Drugs",
          pages: [182, 183],
          intro:
            "Common medications and their effects, and the recreational case.",
          context:
            "The everyday antihistamines and cold remedies are the ones that " +
            "catch people: they are bought without advice, taken for exactly the " +
            "illness that would ground you anyway, and several of them are " +
            "sedating. If the label warns about operating machinery, it means an " +
            "aircraft too.",
        },
        {
          title: "An Accident Example and Blood Donation",
          pages: [184, 185, 186],
          intro:
            "A case involving substance use, and the interval required after " +
            "giving blood.",
        },
      ],
    },

    {
      title: "Environmental Hazards",
      syllabus: ["34.36"],
      intro:
        "Things in the aircraft's own environment that affect the person flying " +
        "it — and the first of them is produced by the engine.",
      topics: [
        {
          title: "Carbon Monoxide",
          pages: [187, 188, 189, 190, 191],
          intro:
            "Where it comes from, what it does, and an accident caused by it.",
          takeaway:
            "Carbon monoxide binds to haemoglobin far more readily than oxygen " +
            "does, so a small concentration takes a large share of your " +
            "oxygen-carrying capacity — and produces hypoxia at sea level. In a " +
            "piston single the source is usually the cabin heater, which is why " +
            "the detector belongs on the panel and gets replaced.",
        },
        {
          title: "Fuels, Oils and Other Toxic Hazards",
          pages: [192, 193],
          intro:
            "The substances handled routinely, and their effects.",
        },
      ],
    },

    {
      title: "Stress",
      syllabus: ["34.38"],
      intro:
        "The body's response to demand. Some of it improves performance and " +
        "some destroys it, and the difference is largely a matter of how much " +
        "and for how long.",
      topics: [
        {
          title: "Stress and the Model of Stress",
          pages: [194, 195, 196],
          intro:
            "What stress is, and the model used to describe the response.",
        },
        {
          title: "Types of Stressor",
          pages: [197, 198, 199, 200],
          intro:
            "Physical, physiological, psychological and environmental sources.",
        },
        {
          title: "Acute and Chronic Effects",
          pages: [201, 202, 203, 204],
          intro:
            "The short-term physiological response, what changes when it becomes " +
            "sustained, and the psychological effects.",
          context:
            "The acute response evolved to handle a threat lasting seconds: heart " +
            "rate up, attention narrowed, non-essential systems shut down. " +
            "Narrowed attention is exactly wrong in a cockpit, and sustaining the " +
            "response for weeks is what turns a useful reflex into a health " +
            "problem.",
        },
        {
          title: "Identifying and Managing Stress",
          pages: [205, 206, 207],
          intro:
            "Recognising it in yourself, and what actually helps.",
        },
      ],
    },

    {
      title: "Sleep, Fatigue and Alertness",
      syllabus: ["34.40"],
      intro:
        "The most reliably predictable performance hazard in aviation, and one " +
        "that can be planned for because the body clock runs to a schedule.",
      topics: [
        {
          title: "Sleep and Sleep Requirements",
          pages: [208, 209, 210],
          intro:
            "What sleep is for and how much is needed.",
        },
        {
          title: "Sleep Deprivation and the Sleep Cycle",
          pages: [211, 212, 213],
          intro:
            "What is lost when sleep is short, and the structure of a night's " +
            "sleep.",
          context:
            "Sleep is not uniform — it cycles through stages, and the restorative " +
            "ones are unevenly distributed through the night. That is why five " +
            "hours is not five-eighths of eight hours, and why sleep debt " +
            "accumulates rather than averaging out.",
        },
        {
          title: "Circadian Rhythm and Body Temperature",
          pages: [214, 215],
          intro:
            "The body clock, and the temperature cycle that tracks it.",
        },
        {
          title: "Alertness Management",
          pages: [216],
          intro:
            "The techniques available.",
        },
        {
          title: "Sleep Disorders",
          pages: [217, 218, 219],
          intro:
            "The disorders of concern and their effect on fitness to fly.",
        },
        {
          title: "Fatigue and Managing It",
          pages: [220, 221, 222, 223],
          intro:
            "Acute and chronic fatigue, what they do to performance, and how they " +
            "are managed.",
          takeaway:
            "Fatigue degrades judgement before it degrades handling, so the pilot " +
            "least able to assess their own fatigue is the fatigued one. That is " +
            "why the defence is a rule made in advance — a duty limit, a personal " +
            "minimum — rather than a decision made at the end of a long day.",
        },
      ],
    },

    {
      title: "Ageing",
      syllabus: ["34.42"],
      intro:
        "What changes with age, and what does not.",
      topics: [
        {
          title: "Ageing and Cognitive Impairment",
          pages: [224, 225, 226],
          intro:
            "The physical and cognitive changes, and their significance for " +
            "flying.",
          context:
            "The picture is not simply decline. Speed of processing and night " +
            "vision fall; judgement built on experience improves. The risk is " +
            "specific rather than general, which is why the medical requirements " +
            "tighten with age rather than ending at one.",
        },
      ],
    },

    {
      title: "Information Processing and Memory",
      syllabus: ["34.44"],
      intro:
        "How a person takes in, stores and retrieves information, and where the " +
        "bottlenecks are.",
      topics: [
        {
          title: "Information Processing",
          pages: [227, 228],
          intro:
            "The stages between a stimulus and a response.",
        },
        {
          title: "Memory",
          pages: [229, 230],
          intro:
            "The kinds of memory and what each holds.",
        },
        {
          title: "Attention",
          pages: [231, 232, 233],
          intro:
            "Selective and divided attention, and how they fail.",
          takeaway:
            "Attention is a single resource being shared, not several running in " +
            "parallel. Anything demanding enough takes the whole of it — which is " +
            "how a crew can fly a serviceable aeroplane into the ground while " +
            "everyone is busy with an unserviceable light.",
        },
        {
          title: "Retaining and Retrieving Information",
          pages: [234, 235],
          intro:
            "How information is held and got back, including chunking.",
        },
      ],
    },

    {
      title: "Mental Workload and Behaviour",
      syllabus: ["34.44"],
      intro:
        "How much a person can do at once, and the three modes in which skilled " +
        "behaviour is produced.",
      topics: [
        {
          title: "Mental Workload and Overloading",
          pages: [236, 237],
          intro:
            "What workload is, and what happens at both ends of the scale.",
          misconception:
            "Assuming only high workload is dangerous. Under-load is a hazard " +
            "too: attention wanders, monitoring degrades, and the transition from " +
            "very low to very high workload is where errors cluster.",
        },
        {
          title: "Skill, Rule and Knowledge Based Behaviour",
          pages: [238, 239, 240, 241],
          intro:
            "Three levels of behaviour, and the different errors each produces.",
          context:
            "The three levels fail differently, which is why the distinction is " +
            "useful. Skill-based behaviour is fast and produces slips; rule-based " +
            "behaviour applies a remembered procedure and produces the wrong rule; " +
            "knowledge-based behaviour is slow, effortful and produces mistakes of " +
            "reasoning. Recognising which level you are operating at tells you " +
            "which error to guard against.",
        },
      ],
    },

    {
      title: "Perception and Situational Awareness",
      syllabus: ["34.46"],
      intro:
        "Knowing what is happening around you, why you have lost it, and what " +
        "gets it back.",
      topics: [
        {
          title: "Confirmation Bias, Perception and Expectation",
          pages: [242, 243, 244],
          intro:
            "How expectation shapes what is perceived.",
          takeaway:
            "You tend to see and hear what you expected. That is why a readback " +
            "of the clearance you were anticipating can go unchallenged, and why " +
            "the deliberate habit of asking what would prove me wrong is worth " +
            "more than confidence.",
        },
        {
          title: "Situational Awareness",
          pages: [245, 246, 247],
          intro:
            "What it means and the levels it is described in.",
        },
        {
          title: "Losing and Maintaining Situational Awareness",
          pages: [248, 249, 250],
          intro:
            "An accident example, and what maintains awareness.",
        },
      ],
    },

    {
      title: "Judgement and Decision Making",
      syllabus: ["34.48"],
      intro:
        "The end product of everything before it. Most accidents are not caused " +
        "by a lack of skill but by a sequence of decisions that each seemed " +
        "reasonable.",
      topics: [
        {
          title: "Skills, Knowledge and Attitudes",
          pages: [251, 252],
          intro:
            "The three components of judgement.",
        },
        {
          title: "Hazardous Attitudes",
          pages: [253],
          intro:
            "The five recognised attitudes and their antidotes.",
        },
        {
          title: "The Error Chain and the Red Flags",
          pages: [254, 255, 256],
          intro:
            "How accidents accumulate, an example, and the warning signs that a " +
            "chain is forming.",
          context:
            "The value of the chain idea is that it has many links, and breaking " +
            "any one of them stops the accident. The red flags are the points at " +
            "which a link is being added — and almost all of them are visible " +
            "before the outcome is.",
        },
        {
          title: "Risk Assessment",
          pages: [257, 258, 259],
          intro:
            "Assessing risk, the techniques available, and identifying levels.",
        },
        {
          title: "The Decision Making Process and Models",
          pages: [260, 261, 262, 263],
          intro:
            "How a decision is structured, and the models used to teach it.",
        },
        {
          title: "Influences on Decision Making",
          pages: [264, 265, 266],
          intro:
            "What pushes a decision, including the pressure to complete the " +
            "flight.",
          takeaway:
            "Get-home-itis is the single most cited factor in this subject. The " +
            "defence is a decision made before departure — a point, a time or a " +
            "condition at which you will turn back — because it is made by " +
            "somebody who is not yet tired, late and nearly there.",
        },
      ],
    },

    {
      title: "Social Psychology and Crew Resource Management",
      syllabus: ["34.50"],
      intro:
        "Two or more people in a cockpit are not simply two pilots. How they " +
        "relate decides whether the second person is a safeguard or a bystander.",
      topics: [
        {
          title: "Social Psychology",
          pages: [267],
          intro:
            "How people behave in groups.",
        },
        {
          title: "Crew Resource Management",
          pages: [268, 269, 270, 271],
          intro:
            "What CRM is, and what maximises it.",
          context:
            "CRM began as a response to accidents in which somebody knew and did " +
            "not say. Everything in it — briefings, standard phrases, the " +
            "expectation of challenge — exists to make speaking up the normal " +
            "thing rather than an act of courage.",
        },
        {
          title: "Teamwork and Group Decision Making",
          pages: [272, 273, 274],
          intro:
            "How teams work, and how group decisions can be better or worse than " +
            "individual ones.",
        },
        {
          title: "Leadership Styles",
          pages: [275, 276, 277, 278, 279],
          intro:
            "The recognised styles, and which suits which situation.",
          misconception:
            "Looking for the best style. There is not one: the authoritative " +
            "style that is right in an emergency is corrosive on a routine sector, " +
            "and the consultative style that builds a good crew is too slow when " +
            "the aircraft is on fire. The skill is changing style to match the " +
            "situation.",
        },
      ],
    },

    {
      title: "Communication",
      syllabus: ["34.50"],
      intro:
        "The process, where it breaks down, and what reduces the error rate.",
      topics: [
        {
          title: "The Communication Process",
          pages: [280, 281],
          intro:
            "Encoding, transmission, decoding and feedback.",
        },
        {
          title: "Cockpit Communication and its Barriers",
          pages: [282, 283],
          intro:
            "What gets in the way.",
        },
        {
          title: "Reducing Communication Errors",
          pages: [284, 285],
          intro:
            "The techniques that work.",
          takeaway:
            "The readback exists because the model has a feedback loop in it. A " +
            "message is not communicated when it has been transmitted — only when " +
            "the sender has heard it come back correctly.",
        },
      ],
    },

    {
      title: "Threat and Error Management",
      syllabus: ["34.52"],
      intro:
        "A framework that assumes errors will happen and organises the defences " +
        "around that assumption rather than around blame.",
      topics: [
        {
          title: "The Purpose of Threat and Error Management",
          pages: [286, 287],
          intro:
            "What the framework is and what it is trying to do.",
        },
        {
          title: "Error Classification",
          pages: [288, 289, 290],
          intro:
            "Random, sporadic and systematic errors, with examples.",
        },
        {
          title: "Active and Latent Threats",
          pages: [291, 292],
          intro:
            "The error made now, and the condition that was waiting for it.",
        },
        {
          title: "The Swiss Cheese Model",
          pages: [293],
          intro:
            "Reason's model of defences and how accidents pass through them.",
          context:
            "The model's point is that every defence has holes and no single one " +
            "is expected to stop everything. An accident needs the holes to line " +
            "up — which means the useful question after an incident is not who " +
            "made the error but which defences nearly failed.",
        },
        {
          title: "Error Management, Avoidance and Response",
          pages: [294, 295, 296, 297, 298],
          intro:
            "Avoiding errors, responding to them, and dealing with the undesired " +
            "state they produce.",
          takeaway:
            "Managing the undesired aircraft state comes before diagnosing how " +
            "you got there. Fly the aeroplane first — the investigation can wait " +
            "until it is somewhere safe.",
        },
        {
          title: "Overt and Active Threats",
          pages: [299, 300, 301, 302],
          intro:
            "Threats that are visible and threats that are not.",
        },
      ],
    },

    {
      title: "Culture",
      syllabus: ["34.54"],
      intro:
        "The environment an organisation creates, and how strongly it decides " +
        "whether people report what went wrong.",
      topics: [
        {
          title: "Safety Culture and Reporting Systems",
          pages: [303, 304, 305],
          intro:
            "What a safety culture is, and the reporting system that expresses " +
            "it.",
        },
        {
          title: "Workplace Harassment and the Just Culture",
          pages: [306, 307],
          intro:
            "The behaviours that damage a culture, and the approach that " +
            "distinguishes error from recklessness.",
          context:
            "A just culture is not a blame-free one. It draws a line between " +
            "honest error, which is reported and learned from, and deliberate " +
            "disregard, which is not excused. Without that line people either get " +
            "punished for mistakes or nothing is ever taken seriously.",
        },
        {
          title: "Behaviour, Risk Creep and Sanctions",
          pages: [308, 309, 310],
          intro:
            "How standards drift over time, and the role of sanction.",
          takeaway:
            "Risk creep is the dangerous one because nothing goes wrong. Each " +
            "small departure works, becomes normal, and the margin quietly " +
            "disappears — until the day the conditions are not forgiving.",
        },
      ],
    },

    {
      title: "Flight Deck Design and Automation",
      syllabus: ["34.56"],
      intro:
        "Designing the cockpit around the person in it, and what happens when " +
        "the machine takes over part of the task.",
      topics: [
        {
          title: "Flight Deck Design",
          pages: [311, 312, 313],
          intro:
            "The principles, and what the design is trying to achieve.",
        },
        {
          title: "Biomechanics, Anthropometry and Design Eye Position",
          pages: [314, 315, 316, 317],
          intro:
            "Fitting the cockpit to the range of people who will sit in it.",
          context:
            "Design eye position is the small idea with the largest consequence. " +
            "The instruments, the glareshield and the view over the nose are all " +
            "arranged for eyes in one place — so a seat set too low changes the " +
            "approach picture and the panel geometry at the same time.",
        },
        {
          title: "Automation and its Advantages",
          pages: [318, 319],
          intro:
            "What automation does well.",
        },
        {
          title: "Disadvantages, Mode Awareness and the Solution",
          pages: [320, 321, 322, 323],
          intro:
            "What it does badly, the mode awareness problem, and the response.",
          misconception:
            "Believing automation reduces workload. It redistributes it — down " +
            "when things are routine, sharply up at exactly the moment something " +
            "goes wrong and the crew has to work out what the aircraft was doing " +
            "and why.",
        },
      ],
    },

    {
      title: "Design of Controls",
      syllabus: ["34.58"],
      intro:
        "Making controls that cannot be confused with each other, in the dark, " +
        "by a tired person.",
      topics: [
        {
          title: "The Importance of Control Design",
          pages: [324, 325],
          intro:
            "Why it matters, with the errors it prevents.",
        },
        {
          title: "Principles of Control Design",
          pages: [326, 327, 328, 329, 330, 331, 332],
          intro:
            "Shape, location, movement and coding.",
          takeaway:
            "Shape coding is the clearest example: the undercarriage selector " +
            "has a wheel on it and the flap selector a flap-shaped paddle. That " +
            "convention exists because retracting the gear instead of the flap " +
            "after landing was common enough to design against.",
        },
      ],
    },

    {
      title: "Instrumentation, Displays and Alerts",
      syllabus: ["34.60"],
      intro:
        "Presenting information so it can be read correctly at a glance, and " +
        "the history of getting that wrong.",
      topics: [
        {
          title: "From Early Cockpits to Glass",
          pages: [333, 334, 335, 336, 337, 338, 339],
          intro:
            "How instrument panels developed, the standard six-pack arrangement, " +
            "and the glass cockpit.",
        },
        {
          title: "Display Principles",
          pages: [340, 341, 342, 343],
          intro:
            "How information should be arranged and presented.",
        },
        {
          title: "The Three-Pointer Altimeter",
          pages: [344],
          intro:
            "A design that was misread often enough to become a case study.",
          context:
            "The three-pointer altimeter is in this subject as a warning about " +
            "display design rather than as equipment you will meet. It was " +
            "accurate and unambiguous on the ground and misread by a whole " +
            "thousand feet in the air — because being readable and being readable " +
            "under pressure are different requirements.",
        },
        {
          title: "Alerts and the Artificial Horizon",
          pages: [345, 346, 347, 348],
          intro:
            "How warnings are prioritised and presented, and the display " +
            "conventions of the attitude indicator.",
        },
      ],
    },

    {
      title: "Documents, Checklists and Procedures",
      syllabus: ["34.62"],
      intro:
        "The written defences: what they are for, the ways they are used badly, " +
        "and why a checklist is not a to-do list.",
      topics: [
        {
          title: "Documents and Procedures",
          pages: [349, 350],
          intro:
            "What the documentation is for.",
        },
        {
          title: "The Rationale of Checklists and SOPs",
          pages: [351],
          intro:
            "Why they exist at all.",
        },
        {
          title: "Types of Checklist",
          pages: [352, 353, 354, 355],
          intro:
            "Read-and-do, challenge-and-response and the others, and when each is " +
            "appropriate.",
          context:
            "A checklist is generally a <em>check</em> list, not a do-list: the " +
            "actions are carried out from flow and the list confirms them. Using " +
            "it as a set of instructions is slower and, more importantly, means " +
            "nothing is being checked.",
        },
        {
          title: "Critical Phases and Checklist Use",
          pages: [356, 357],
          intro:
            "When checklists are used and when interruption is not acceptable.",
        },
        {
          title: "Complacency and Standard Operating Procedures",
          pages: [358, 359],
          intro:
            "What happens when a checklist becomes a ritual, and the role of " +
            "SOPs.",
          takeaway:
            "The failure mode of a familiar checklist is reciting it rather than " +
            "checking it. If you cannot remember what the last item actually " +
            "showed, it was not read — and the item most likely to be missed is " +
            "the one that has never been wrong before.",
        },
      ],
    },

    {
      title: "First Aid, Passenger Briefing and Survival",
      syllabus: ["34.64", "34.66"],
      intro:
        "What the pilot is expected to do when something has already gone " +
        "wrong: for an ill passenger, before departure, and after an arrival " +
        "nobody planned.",
      topics: [
        {
          title: "First Aid and Resuscitation",
          pages: [360, 361, 362],
          intro:
            "The principles, and cardiopulmonary resuscitation.",
        },
        {
          title: "Passenger Briefings",
          pages: [363, 364, 365, 366, 367, 368, 369],
          intro:
            "What must be covered, and how to brief so that it is remembered.",
          takeaway:
            "The briefing is delivered to people who are not listening, before " +
            "anything has gone wrong. That is why it is scripted, why it is " +
            "physical rather than verbal where possible, and why pointing at the " +
            "exit beats naming it.",
        },
        {
          title: "Basic Principles of Survival",
          pages: [370, 371, 372, 373, 374, 375],
          intro:
            "The priorities after a forced landing, in the order they matter.",
        },
        {
          title: "Hypothermia",
          pages: [376, 377],
          intro:
            "What it is, the process by which it develops, and why it is the " +
            "first danger in this country.",
          context:
            "In New Zealand conditions exposure is a faster threat than thirst or " +
            "hunger, and water takes heat from the body far quicker than air " +
            "does. That is the reasoning behind the order of the survival " +
            "priorities on the slides before this one — shelter and warmth come " +
            "before almost everything else.",
        },
      ],
    },
  ],
};
