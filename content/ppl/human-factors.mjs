/**
 * PPL Human Factors in Aviation — the curriculum.
 *
 * 257 slides and, on the face of it, no structure: the extractor found two
 * section dividers in the whole deck. The structure is there, it is just not
 * marked. Twenty-odd times the deck stops, puts one line of text on an
 * otherwise empty slide — "Hypoxia", "Entrapped Gases", "Spatial
 * Orientation", "Sleep and Fatigue" — and starts a new run. Those unmarked
 * dividers are the deck's own chapter breaks, and they are what this
 * curriculum is built on.
 *
 * Three departures from the deck's order, all of them gathering rather than
 * moving:
 *
 *   - Flight anxiety (123–126) sits with stress (162–173). The deck teaches
 *     them a chapter apart; they are the same physiology, the same signs and
 *     the same management, and taught apart a student learns the list twice.
 *
 *   - Hyperventilation stays with hypoxia. The deck already runs them
 *     together and it is right to: the whole point of the pair is that they
 *     are hard to tell apart in the air.
 *
 *   - Motion sickness joins G forces. Both are the balance organs being asked
 *     for something they cannot give.
 *
 * The deck's own emphasis is kept. It spends a quarter of its slides on
 * vision and the illusions that come out of it, which is the right weight for
 * a VFR licence, and this course spends the same.
 *
 * The chapters map to Subject No. 10 Human Factors, from AC61-3 Revision 31
 * (5 April 2025). They did not for the first two rebuilds, because Subject
 * No. 10 was missing from the set of AC61-3 pages originally supplied, and the
 * only Human Factors syllabus in the database belonged to the CPL — Subject
 * No. 34, a different and larger syllabus written for commercial operations,
 * which these PPL lessons must never be mapped to. The subject is imported
 * from the CAA's own copy of AC61-3 now, and the codes below are its own.
 */
import { repairSlide } from "./deck-repairs.mjs";
import { isRejectedImage, isUpsideDown } from "./human-factors-diagrams.mjs";

/** Repairs this deck needs that no other deck needs. */
const TABLES = {
  // Lines that are not teaching: a cue to play a video, and a question the
  // instructor asks the room.
  callouts: {
    // Cues to play a video in a classroom. The videos are not part of what was
    // supplied, so the line is an instruction to nobody.
    36: ["Hyperventilation Video"],
    49: ["Explosive Decompression Video"],
    69: ["Flicker Vertigo; Jetranger Helicopter Video"],
    83: ["Glassy Water Landing Illusion Video"],
    168: ["AirAsiaX A330 Vibration Video"],
    249: ["The Office US-CPR Video"],
    251: ["Air NZ Safety Video - Bear Grylls"],
    254: ["Hypothermia Video"],
    // A question the instructor asks the room.
    176: ["How will these factors affect coping with environmental stressors?"],
  },

  substitutions: {},

  titles: {
    // The layout cut the title in half: "The Respiratory -". The whole title
    // is the first line of the body, which the echo check then removes.
    20: "The Respiratory System – External Respiration",
  },
};

export const subject = {
  slug: "human-factors",
  title: "Human Factors in Aviation",
  deck: "human-factors",

  repairSlide: (blocks, context) => repairSlide(blocks, { ...context, tables: TABLES }),
  isRejectedImage,
  isUpsideDown,

  // The per-slide repair tables, exposed so the conservation test can tell a
  // hand-checked correction from a rewrite: a block whose words differ from
  // the slide's is a failure unless a substitution written down here is why.
  repairs: TABLES,

  skip: {
    1: "The deck cover: the subject name, with no teaching on it.",
    2: "The exam format for both licences — 40 minutes and 33 questions at PPL, 90 minutes and 40 at CPL. It belongs on the course page, not in a lesson, and the PPL figures are already there.",
    14: "An unmarked section divider: the words “Physiology and the Effects of Flight” alone on a slide, over a stock illustration of a brain.",
    17: "An unmarked section divider: “Circulation and Respiratory Systems”, over a stock illustration of a torso.",
    26: "An unmarked section divider: the single word “Hypoxia”, over a photograph of the Earth from altitude.",
    39: "An unmarked section divider: “Entrapped Gases”, over a stock illustration of an ear.",
    50: "An unmarked section divider: “Vision and Visual Perception”, over a stock illustration of the brain and optic nerve.",
    84: "An unmarked section divider: “Hearing and Balance”, over a stock illustration of an ear.",
    96: "An unmarked section divider: “Spatial Orientation”, over a photograph of an airline flight deck.",
    112: "An unmarked section divider: “Gravitational Forces”, over a photograph of a fighter aircraft.",
    118: "An unmarked section divider: “Motion Sickness”, over a stock illustration of a passenger reading.",
    122: "An unmarked section divider: “Flight Anxiety”, over a stock illustration of an airline passenger.",
    127: "A section title slide — “Fitness to Fly” — carrying a flight deck photograph and no text.",
    131: "A section title slide — “Everyday Health & Wellbeing” — carrying a flight deck photograph and no text.",
    155: "An unmarked section divider: “Environmental Hazards”, over a photograph of a burning aircraft.",
    161: "An unmarked section divider: “Stress Management”, over a flight deck photograph.",
    174: "A section title slide — “Sleep and Fatigue” — carrying a cabin photograph and no text.",
    187: "A section title slide — “Information Processing” — carrying a flight deck photograph and no text.",
    200: "An unmarked section divider: “Situational Awareness, Judgement and Decision Making”, over a photograph of an aircraft on a stand.",
    214: "An unmarked section divider: “Social Psychology”, over a flight deck photograph.",
    218: "A section title slide — “Threat and Error Management” — carrying a flight deck photograph and no text.",
    225: "An unmarked section divider: “Culture”, over a photograph of a ground crew at work.",
    231: "A section title slide — “Instrumentation Displays and Alerts” — carrying a flight deck photograph and no text.",
    243: "An unmarked section divider: “Documents and Procedures”, over a flight deck photograph.",
    248: "An unmarked section divider: “First Aid & Survival”, over a photograph of an aircraft on an apron.",
    257: "The closing slide: the subject name again, with nothing behind it.",
  },

  chapters: [
    {
      title: "Airmanship and Human Factors",
      syllabus: ["10.2", "10.4"],
      intro:
        "Aeroplanes stopped being the main cause of aircraft accidents some " +
        "decades ago. People did not. This chapter is what the industry did " +
        "about that — the models, the programmes and the vocabulary the rest of " +
        "the subject uses.",
      topics: [
        {
          title: "Airmanship",
          pages: [3],
          intro:
            "The word the whole subject is really about, and what it looks like in " +
            "someone who has it.",
          takeaway:
            "Airmanship is not a skill you are examined on once. It is the sum of " +
            "every small decision made when nobody is watching — the walk-around " +
            "done properly on a rushed morning, the flight cancelled for weather " +
            "that was only probably going to be a problem, the question asked on " +
            "the radio rather than guessed at.",
        },
        {
          title: "Who You Are Responsible To",
          pages: [4],
          intro:
            "The list of people affected by a pilot's decisions, most of whom are " +
            "not in the aeroplane.",
          context:
            "The list is worth reading slowly because only one entry on it is " +
            "inside the aeroplane. The operator and the owner have entrusted you " +
            "with an asset; the passengers have entrusted you with themselves and " +
            "cannot assess what you are doing; the owner of the cargo is not " +
            "there at all; and the public underneath your track never agreed to " +
            "any of it. Responsibility in this subject means responsibility to " +
            "people who have no say in the decision and no way of checking it.",
        },
        {
          title: "Safety and the Air Transport Industry",
          pages: [6, 7],
          intro:
            "How the accident rate fell, and what stopped falling with it.",
          context:
            "The pattern the deck describes is the reason this subject exists. As " +
            "engines, structures and systems became reliable, the proportion of " +
            "accidents caused by the machine dropped and the proportion caused by " +
            "the people operating it rose — not because pilots got worse, but " +
            "because everything else got better. Improving the aeroplane further " +
            "buys very little now. Improving how people work is where the " +
            "remaining accidents are.",
        },
        {
          title: "What Human Factors Means",
          pages: [8, 5],
          intro:
            "The scope of the term, and where it came from.",
          diagramNotes: {
            5: "The elements human factors covers, set out as two wheels: on one, the areas a programme addresses — communication, fatigue, situational awareness, procedures and rules, skills and training, workload, decision making, trust; on the other, the human-machine interaction they all sit inside.",
          },
        },
        {
          title: "Human Factors Programmes",
          pages: [9],
          intro:
            "The four programmes the rest of this chapter unpacks, and the fact " +
            "that theory in this subject is compulsory.",
          takeaway:
            "Six items, and they answer the same question at different levels. " +
            "Crew resource management and threat and error management change how " +
            "an individual crew works. A safety management system changes how an " +
            "organisation works. Compulsory theory, regulated duty times and " +
            "standard operating procedures change what the industry requires of " +
            "everybody. The rest of this course takes the first three apart, and " +
            "the point of listing all six is that no single one of them is the " +
            "answer.",
        },
        {
          title: "Crew Resource Management",
          pages: [10],
          intro:
            "The first of the programmes: using everything and everyone available " +
            "to you.",
          misconception:
            "Reading CRM as something for two-crew airline flight decks and " +
            "therefore not yet your problem. The resources a single-pilot VFR " +
            "flight has are the same idea in smaller form: the passenger who can " +
            "hold the chart, the controller who can give you a position, the " +
            "instructor on the ground who can be telephoned before you start. " +
            "Refusing to use them is the failure CRM was invented to name.",
        },
        {
          title: "Threat and Error Management: The Idea",
          pages: [11],
          intro:
            "The second programme, and the assumption behind it: errors are " +
            "normal, so the system has to handle them. The chapter later in this " +
            "course takes it apart properly.",
        },
        {
          title: "Safety Management Systems",
          pages: [12],
          intro:
            "The third: a structured, documented way of controlling risk in an " +
            "operation.",
          context:
            "An SMS is what human factors looks like at the level of an " +
            "organisation rather than a person. Instead of relying on individuals " +
            "to notice hazards, it makes finding them somebody's documented job: " +
            "risks are identified, assessed, controlled and reviewed on a cycle, " +
            "and the results are communicated rather than filed. For a private " +
            "pilot the value is knowing what a good operator looks like: a flying " +
            "organisation with a real reporting system, and somebody whose job it " +
            "is to act on what gets reported, is a different place to learn than " +
            "one without.",
        },
        {
          title: "The SHELL Model",
          pages: [13],
          intro:
            "The model that names the interfaces where things go wrong.",
          diagramNotes: {
            13: "The SHELL model: Liveware — the person — at the centre, with Software, Hardware, Environment and other Liveware around it. The ragged edges are the point: it is the fit between the person and each of the others that matters, not the pieces themselves.",
          },
          keyPoints: [
            "S — Software: the procedures, checklists, manuals and symbology.",
            "H — Hardware: the aircraft, the controls, the seats and the instruments.",
            "E — Environment: everything outside, from weather and noise to the operating culture.",
            "L — Liveware: the person at the centre of the model, and the other people around them.",
          ],
        },
      ],
    },

    {
      title: "The Atmosphere, Respiration and Circulation",
      syllabus: ["10.6", "10.8"],
      intro:
        "Everything that goes wrong with a pilot at altitude goes wrong through " +
        "one mechanism: oxygen reaching the tissues, or not. That mechanism has " +
        "to be understood before hypoxia, hyperventilation, trapped gas or the " +
        "bends make any sense at all.",
      topics: [
        {
          title: "Composition of the Atmosphere",
          pages: [15],
          intro:
            "What the air is made of, and the law that turns that mixture into a " +
            "pressure the lungs can use.",
          diagramNotes: {
            15: "The composition of dry air by volume: nitrogen 78 per cent, oxygen 21 per cent, and one per cent of everything else.",
          },
          term: "Dalton's Law",
          definition:
            "The total pressure of a mixture of gases is equal to the sum of the " +
            "partial pressures of each gas in the mixture.",
        },
        {
          title: "Pressure and Density with Altitude",
          pages: [16],
          intro:
            "What happens to the proportion of oxygen as you climb — and what " +
            "happens to its pressure, which is the part that matters.",
          misconception:
            "Thinking the air runs out of oxygen with height. The proportion stays " +
            "at 21 per cent all the way up. What falls is total pressure, and with " +
            "it the partial pressure of oxygen, which is the force driving oxygen " +
            "across the wall of the alveolus into the blood. The air at 18,000 feet " +
            "has the same fifth of oxygen in it and roughly half the pressure to " +
            "push it into you.",
        },
        {
          title: "External Respiration",
          pages: [18, 19, 20],
          intro:
            "The first stage: air into the lungs, oxygen across into the blood, " +
            "carbon dioxide the other way.",
        },
        {
          title: "Internal Respiration",
          pages: [21],
          intro:
            "The second stage, at the far end of the circulation, where the oxygen " +
            "is actually used.",
        },
        {
          title: "The Heart",
          pages: [22],
          intro:
            "A muscular pump with two sides and four chambers, and what each side " +
            "is for.",
        },
        {
          title: "Blood",
          pages: [23],
          intro:
            "What blood is made of and what each part carries.",
        },
        {
          title: "Arteries, Capillaries and Veins",
          pages: [24],
          intro:
            "The three kinds of vessel, and the direction each runs.",
        },
        {
          title: "Systemic and Pulmonary Circulation",
          pages: [25],
          intro:
            "Two circuits driven by one pump: the body and the lungs.",
          takeaway:
            "Holding the two circuits separate in your head makes hypoxia easy to " +
            "reason about. The pulmonary circuit loads oxygen; the systemic circuit " +
            "delivers it. Anything that breaks the loading — low partial pressure " +
            "at altitude, carbon monoxide on the haemoglobin — starves the systemic " +
            "circuit no matter how well the heart is working.",
        },
      ],
    },

    {
      title: "Hypoxia and Hyperventilation",
      syllabus: ["10.10", "10.12"],
      intro:
        "The two conditions this subject exists to prevent. They have opposite " +
        "causes, overlapping symptoms and one shared piece of advice, and the " +
        "reason they are taught together is that in the air you will not " +
        "reliably be able to tell which one you have.",
      topics: [
        {
          title: "What Hypoxia Is",
          pages: [27],
          intro:
            "The definition, and the fact that it is a supply problem rather than " +
            "a breathing problem.",
          term: "Hypoxia",
          definition:
            "A condition in which the amount of oxygen carried by the blood is " +
            "reduced and becomes insufficient to meet tissue needs.",
        },
        {
          title: "Oxygen Partial Pressure",
          pages: [28],
          intro:
            "The numbers behind it: 150 mm Hg outside the lungs at sea level, " +
            "102 mm Hg inside them, and why the gap matters.",
        },
        {
          title: "Symptoms of Hypoxia",
          pages: [29, 30],
          intro:
            "What it does, grouped by the system it shows up in.",
          diagramNotes: {
            29: "The effects of oxygen starvation on the brain.",
          },
          context:
            "Read the behavioural group first and read it slowly. Loss of " +
            "self-criticism and judgement, euphoria, fixation — these are not " +
            "symptoms you notice and act on. They are symptoms that remove your " +
            "ability to notice and act. That is the whole danger of hypoxia, and it " +
            "is why the defence is altitude discipline on the ground rather than " +
            "vigilance in the air.",
        },
        {
          title: "Detecting Hypoxia",
          pages: [31],
          intro:
            "Which functions go first, and what that means for catching it.",
        },
        {
          title: "Individual Tolerance",
          pages: [32],
          intro:
            "Why two pilots at the same altitude are not equally affected.",
          takeaway:
            "Four of these five are things you arrive with, and the fifth is the " +
            "one you can do something about today. Age, fitness, illness and " +
            "lifestyle set how much hypoxia you can take before it shows; " +
            "training and recognition decide whether you notice it when it does. " +
            "That is the whole argument for having sat through this chapter.",
        },
        {
          title: "Preventing Hypoxia",
          pages: [33],
          intro:
            "Four defences, in the order a light-aircraft pilot can actually use " +
            "them.",
          context:
            "The four defences are in descending order of how much use they are " +
            "to a private pilot. Pressurisation solves the problem entirely and " +
            "almost no training aircraft has it. Supplemental oxygen solves it " +
            "where it is fitted. That leaves education and recognition, which is " +
            "why the syllabus spends so long on symptoms nobody can reliably " +
            "detect in themselves: for most light aircraft flying, the real " +
            "defence is the altitude discipline you decided on before takeoff.",
        },
        {
          title: "Time of Useful Consciousness",
          pages: [34],
          intro:
            "How long you have to do something about it, by altitude.",
          term: "Time of useful consciousness",
          definition:
            "The time in which a person can be expected to take effective " +
            "preventative measures.",
          takeaway:
            "The figures collapse far faster than the altitudes climb. That is the " +
            "shape worth remembering, more than any single number: there is no " +
            "altitude band where the margin shrinks gently.",
        },
        {
          title: "Treating Hypoxia",
          pages: [35],
          intro:
            "Oxygen, descent, and the trap that comes with the first of them.",
        },
        {
          title: "Hyperventilation",
          pages: [36],
          intro:
            "The opposite problem: too much breathing, and too little carbon " +
            "dioxide left in the blood.",
          diagramNotes: {
            36: "Somebody breathing into a paper bag — the classic treatment, which works by putting the exhaled carbon dioxide back into the air being breathed until the level in the blood returns to normal.",
          },
        },
        {
          title: "Causes of Hyperventilation",
          pages: [37],
          intro:
            "Fear, pain, and hypoxia itself.",
        },
        {
          title: "Treating Hyperventilation",
          pages: [38],
          intro:
            "How to tell it from hypoxia, and what to do when you cannot.",
          takeaway:
            "If in doubt, supply oxygen. Oxygen given to someone who is " +
            "hyperventilating does no harm; oxygen withheld from someone who is " +
            "hypoxic is the beginning of an accident. The asymmetry decides the " +
            "action, and it is the reason the rule is stated as a rule rather than " +
            "as a diagnosis.",
        },
      ],
    },

    {
      title: "Trapped Gases and Decompression",
      syllabus: ["10.14", "10.16"],
      intro:
        "Gas inside the body obeys the same law as gas outside it. When the " +
        "pressure around you changes and the gas cannot get out, something has " +
        "to give — and it is usually an eardrum, a sinus or a filling.",
      topics: [
        {
          title: "Barotrauma",
          pages: [40],
          intro:
            "What trapped gas does when the pressure around it changes, and why " +
            "body temperature makes the problem simpler than it looks.",
        },
        {
          title: "Ears and Sinuses",
          pages: [41, 42],
          intro:
            "The two cavities that cause almost all of the trouble, and the " +
            "passages that are supposed to vent them.",
        },
        {
          title: "Preventing and Treating Barotrauma",
          pages: [43],
          intro:
            "Why the descent is the dangerous half, and what to do about it.",
          misconception:
            "Assuming a light training aircraft cannot descend fast enough to " +
            "matter. The rate of pressure change, not the aeroplane's performance, " +
            "is what hurts — and a blocked Eustachian tube can fail to equalise on " +
            "any descent at all. Flying with a head cold is where this goes wrong, " +
            "which is why the rule about it is so firm.",
        },
        {
          title: "Decompression Sickness",
          pages: [44],
          intro:
            "Nitrogen coming out of solution, and where the name “the bends” comes " +
            "from.",
        },
        {
          title: "Symptoms of the Bends",
          pages: [45],
          intro:
            "What to look for, from joint pain to loss of control.",
          takeaway:
            "The list runs from joint pain to death and it is in roughly that " +
            "order for a reason: decompression sickness gets worse with time and " +
            "altitude, and it does not resolve by itself. The action that matters " +
            "is at the top of the list, not the bottom - joint pain and skin " +
            "tingling after a flight following a dive are the point at which to " +
            "descend, land and get medical help, not the point at which to see " +
            "whether it passes.",
        },
        {
          title: "Preventing and Treating the Bends",
          pages: [46, 47],
          intro:
            "The waiting times after diving, who is more susceptible, and why the " +
            "treatment cannot be given in the air.",
          takeaway:
            "The diving interval is the part of this that a PPL actually has to " +
            "act on. It is a planning decision made days ahead of the flight, not " +
            "a decision available on the morning, and nothing about how you feel " +
            "on the day changes it.",
        },
        {
          title: "Explosive Decompression",
          pages: [48, 49],
          intro:
            "The unlikely case, and what it does to an aircraft and the people in " +
            "it.",
          diagramNotes: {
            49: "The cabin of a Boeing 737 after an explosive decompression tore the upper fuselage away in flight. The passengers remained seated and belted; a member of the cabin crew, standing, did not survive.",
          },
        },
      ],
    },

    {
      title: "Vision",
      syllabus: ["10.18"],
      intro:
        "A VFR pilot's licence rests on one sense. This chapter is how it " +
        "works, the many specific ways it fails, and the techniques built to " +
        "work around the failures rather than pretend they are not there.",
      topics: [
        {
          title: "Anatomy of the Eye",
          pages: [51, 52],
          intro:
            "The parts light passes through, and the two kinds of receptor it " +
            "lands on.",
          keyPoints: [
            "Cornea — the transparent cap over the lens, providing the coarse focus.",
            "Iris — controls the amount of light admitted.",
            "Lens — provides the fine focus.",
            "Retina — the light-sensitive layer at the back, carrying two types of receptor.",
            "Cones — bright light, fine detail and colour, concentrated at the centre.",
            "Rods — low light and movement, spread across the periphery.",
          ],
        },
        {
          title: "How Vision Works",
          pages: [53],
          intro:
            "Looking, seeing and recognising — three things, only one of which " +
            "happens in the eye.",
        },
        {
          title: "Limitations of the Eye",
          pages: [54, 55, 56, 57],
          intro:
            "Empty field myopia, crossing wires, luminance and glare, colour, and " +
            "the blind spot.",
        },
        {
          title: "Night Vision",
          pages: [58, 59, 60],
          intro:
            "Dark adaptation, how long it takes, and how quickly it is thrown " +
            "away.",
          diagramNotes: {
            60: "Dark adaptation over time: the cone-mediated threshold falls quickly and then flattens, the rod-cone break follows, and rod-mediated sensitivity keeps improving for a further twenty to thirty minutes in darkness.",
          },
          takeaway:
            "Full dark adaptation is slow to gain and immediate to lose. That " +
            "asymmetry is the whole reason for dim instrument lighting and for not " +
            "looking at a landing light, a strobe or a phone screen: half a second " +
            "of bright light costs most of half an hour of adaptation.",
        },
        {
          title: "Vision Defects and Corrective Lenses",
          pages: [61, 62],
          intro:
            "Long and short sightedness, and the rules about flying with " +
            "spectacles or contact lenses.",
        },
        {
          title: "Sunglasses",
          pages: [63, 64],
          intro:
            "Tints that are recommended, the ones that are not, and what polarised " +
            "lenses do to a windscreen and a glass display.",
        },
        {
          title: "The Visual Resting State",
          pages: [65],
          intro:
            "What the eye does when there is nothing to focus on, and how far away " +
            "it settles.",
        },
        {
          title: "Visual Search Technique",
          pages: [66, 67],
          intro:
            "Why a sweeping scan finds nothing, and the technique that replaces " +
            "it.",
          context:
            "Vision is not instantaneous — the deck puts it at about 1.5 seconds " +
            "to acquire and interpret. That single figure is the whole argument for " +
            "the scan technique. An eye moved smoothly across the windscreen never " +
            "stays anywhere long enough to see anything, so the scan has to be a " +
            "series of stops: a sector, a pause, the next sector. The see-and-avoid " +
            "principle that VFR flight depends on is only as good as this habit.",
        },
        {
          title: "Autokinesis, Flicker Vertigo and Break-Off",
          pages: [68, 69, 70],
          intro:
            "Three things a low-stimulus environment does to a pilot who is " +
            "looking at very little.",
          diagramNotes: {
            69: "A rotor blade chopping across the low sun, seen from the cockpit — the interrupted bright light that produces flicker vertigo.",
          },
          takeaway:
            "All three of these are the same failure with different names: the " +
            "visual system given too little to work on begins to invent. " +
            "Autokinesis makes a stationary light move, flicker vertigo makes an " +
            "interrupted light disorienting, and break-off detaches the pilot " +
            "from the aeroplane entirely. The common defence is also one thing - " +
            "give the eyes something real to fix on. Look at an instrument, look " +
            "at another light, move your head, change the picture.",
        },
        {
          title: "The Black Hole Approach",
          pages: [71],
          intro:
            "An approach over unlit ground to a lit runway, and why it puts " +
            "aircraft into the terrain short of it.",
        },
      ],
    },

    {
      title: "Visual Illusions",
      syllabus: ["10.18"],
      intro:
        "Perception is interpretation, and interpretation can be wrong while " +
        "feeling completely certain. Every illusion in this chapter has an " +
        "accident behind it, and almost all of them happen on an approach.",
      topics: [
        {
          title: "Perception and the False Horizon",
          pages: [72, 73, 74],
          intro:
            "What perception is, the conditions that produce a false horizon, and " +
            "how much a pilot relies on the real one.",
        },
        {
          title: "Relative Motion",
          pages: [75],
          intro:
            "The motion of one aircraft against another, and the case where there " +
            "appears to be none.",
          takeaway:
            "The traffic that is not moving in your windscreen is the traffic on a " +
            "collision course. Everything else drifts across the glass. A stationary " +
            "speck that slowly grows is the single most important thing a lookout " +
            "can find, and it is the hardest, because the eye is drawn to movement.",
        },
        {
          title: "Fog, Haze and the Windscreen",
          pages: [76, 77],
          intro:
            "What reduced visibility does to judgement of distance, and how much " +
            "worse a dirty or scratched windscreen makes it.",
        },
        {
          title: "Runway Perspective",
          pages: [78, 79, 80, 81, 82],
          intro:
            "Length, width, slope, texture and lighting — five properties of a " +
            "runway, each of which will make you fly the approach wrong.",
          context:
            "There is a pattern under all of these, and learning the pattern is " +
            "worth more than memorising the list. The runway makes the approach " +
            "look wrong, and the pilot then corrects an error that is not there. A " +
            "long or narrow runway makes a correct approach look steep, so the " +
            "pilot flies lower; a short or wide one makes it look shallow, so the " +
            "pilot flies higher. A downslope reads as being low and produces a " +
            "high approach; an upslope reads as being high and produces a low one. " +
            "The dangerous half of that list is every case that ends in flying " +
            "lower than you should, because low is the direction with terrain in " +
            "it. The illusion is never in the aeroplane — it is in the runway — " +
            "and the defence is a briefed approach path flown to a profile rather " +
            "than judged by eye.",
        },
        {
          title: "Runway and Water Illusions",
          pages: [83],
          intro:
            "The illusions gathered, plus the one that has no runway in it at all.",
          diagramNotes: {
            83: "A narrow runway and a wide one drawn side by side: the narrow one makes a correct approach look high, so the pilot flies low; the wide one makes it look low, so the pilot flies high.",
          },
          takeaway:
            "The glassy water landing illusion is the one on this slide with no " +
            "runway in it, and it is the most dangerous of the set. Still water " +
            "gives the eye no texture and no shadow, so there is nothing to judge " +
            "height against and the surface can be flown into while the pilot is " +
            "still waiting to arrive. The answer is not to try harder to see it - " +
            "it is to fly a known attitude and power setting to a known rate of " +
            "descent, and let the aeroplane arrive.",
        },
      ],
    },

    {
      title: "Hearing and the Ear",
      syllabus: ["10.20"],
      intro:
        "The ear does two jobs, and the second one — balance — is the reason " +
        "the next chapter exists. This one is about the first: how sound gets " +
        "in, what damages it, and what a pilot can do about the noise they sit " +
        "in for hours.",
      topics: [
        {
          title: "Two Senses in One Organ",
          pages: [85],
          intro:
            "Hearing and balance, and the pressure waves the first of them works " +
            "on.",
        },
        {
          title: "Anatomy of the Ear",
          pages: [86, 87, 88],
          intro:
            "Outer, middle and inner — what each contains and what it does.",
          keyPoints: [
            "Outer ear — the pinna gathers sound and the canal carries it to the eardrum.",
            "Middle ear — an air-filled cavity kept at ambient pressure by the Eustachian tube, containing three small bones that amplify the vibration.",
            "Inner ear — the cochlea turns fluid movement into nerve signals, and the balance organs sit alongside it.",
          ],
        },
        {
          title: "Exposure to Noise",
          pages: [89, 91],
          intro:
            "What prolonged noise does to the cochlea, and the levels at which it " +
            "stops being gradual.",
        },
        {
          title: "Decibel Levels",
          pages: [92],
          intro:
            "A table of everyday noise sources against the damage each does and " +
            "the protection each needs.",
        },
        {
          title: "Hearing Protection",
          pages: [90],
          intro:
            "What is available, and why it has to be worn before you notice a " +
            "problem.",
          takeaway:
            "Noise-induced hearing loss is painless, gradual and permanent. There " +
            "is no point in the process at which it announces itself and no point " +
            "at which it can be reversed, which is why protection is a habit formed " +
            "at the first flying lesson rather than a response to a symptom.",
        },
        {
          title: "Hearing Loss",
          pages: [93],
          intro:
            "The two causes: noise, and getting older.",
        },
        {
          title: "Pressure Changes and Illness",
          pages: [94, 95],
          intro:
            "What a pressure difference does to the eardrum, and what a cold does " +
            "to your ability to relieve it.",
        },
      ],
    },

    {
      title: "Spatial Orientation and Disorientation",
      syllabus: ["10.22"],
      intro:
        "Three systems tell you which way up you are, and only one of them is " +
        "reliable without a visible horizon. This chapter is what the other two " +
        "do when they are asked a question they cannot answer, and why the " +
        "answers they give are so convincing.",
      topics: [
        {
          title: "Spatial Orientation",
          pages: [97],
          intro:
            "The three inputs that combine to tell you your attitude relative to " +
            "the Earth.",
        },
        {
          title: "The Vestibular System",
          pages: [98],
          intro:
            "The balance organs, and where they sit.",
          diagramNotes: {
            98: "The vestibular system inside the inner ear: the three semi-circular canals set at right angles to each other, and the utricle and saccule in the vestibule below them, alongside the cochlea.",
          },
        },
        {
          title: "The Semi-Circular Canals",
          pages: [99],
          intro:
            "Three fluid-filled canals at right angles, and the one thing they " +
            "sense.",
        },
        {
          title: "The Vestibular Sacs",
          pages: [100, 101],
          intro:
            "The otolith organs: accelerometers for linear acceleration and for " +
            "which way is down.",
        },
        {
          title: "The Proprioceptive System",
          pages: [102],
          intro:
            "The “seat of the pants”, and what it is actually measuring.",
          misconception:
            "Trusting it. Pressure and stretch receptors report the total force " +
            "through the seat, and they cannot separate the pull of gravity from " +
            "the pull of a manoeuvre. In a steady, coordinated turn they report a " +
            "force straight down through the seat — exactly what they report in " +
            "level flight. Seat-of-the-pants flying works only when the eyes are " +
            "supplying a horizon to check it against.",
        },
        {
          title: "Vision and the Vestibular System Together",
          pages: [103],
          intro:
            "The oculogyral reflex, and the link that keeps your eyes still while " +
            "your head moves.",
        },
        {
          title: "Disorientation",
          pages: [104],
          intro:
            "What is left when the visual system is taken away.",
          diagramNotes: {
            104: "A pilot in cloud with no horizon, relying on the vestibular and proprioceptive senses alone — the situation every spatial illusion in this chapter needs before it can take hold.",
          },
        },
        {
          title: "The Leans",
          pages: [105],
          intro:
            "A roll slow enough that the canals never notice it, and the " +
            "conviction that follows.",
        },
        {
          title: "Somatogravic Illusions",
          pages: [106],
          intro:
            "Acceleration read as a pitch-up, and the accident that comes from " +
            "correcting it.",
          context:
            "The deck's example is worth sitting with: an aircraft accelerating " +
            "from 100 to 130 knots in ten seconds. The otolith organs cannot tell " +
            "that forward acceleration from being tilted back, so the pilot feels a " +
            "climb that is not happening and pushes forward to fix it. At night or " +
            "over water, with nothing to check it against, that push is toward the " +
            "surface, and it feels like the right thing to do the whole way down.",
        },
        {
          title: "Somatogyral Illusions",
          pages: [107, 108],
          intro:
            "The turn that stops being felt, and what that does in a spin.",
        },
        {
          title: "Cross-Coupled Turning",
          pages: [109],
          intro:
            "The Coriolis effect: a head movement in a turn, and the tumbling " +
            "sensation it produces.",
        },
        {
          title: "Pressure Vertigo",
          pages: [110],
          intro:
            "Vertigo from a blocked Eustachian tube — where this chapter meets the " +
            "one on trapped gases.",
        },
        {
          title: "Susceptibility and Prevention",
          pages: [111],
          intro:
            "Who it happens to, and the single defence available to a VFR pilot.",
          takeaway:
            "Knowing that these illusions exist is itself most of the defence. A " +
            "pilot who has never heard of the leans has no reason to distrust an " +
            "overwhelming feeling of bank; a pilot who has, has a reason to look at " +
            "the attitude indicator and believe it instead.",
        },
      ],
    },

    {
      title: "G Forces and Motion Sickness",
      syllabus: ["10.24", "10.26"],
      intro:
        "Acceleration applied to a body of fluid, in two forms: the kind that " +
        "moves blood away from the brain, and the kind that upsets the balance " +
        "organs until you are sick.",
      topics: [
        {
          title: "Positive G",
          pages: [113],
          intro:
            "Blood forced away from the head, and the sequence of symptoms that " +
            "follows.",
        },
        {
          title: "Negative G",
          pages: [114],
          intro:
            "The opposite, and why it is less tolerable than positive G.",
        },
        {
          title: "Human G Tolerance",
          pages: [115],
          intro:
            "What the body compensates for on its own, how long that takes, and " +
            "the shape of the tolerance curve.",
          diagramNotes: {
            115: "G tolerance against time: the physiological reserve zone, the region of gradual onset a body can compensate for, and the rapid-onset region where visual symptoms and unconsciousness arrive before compensation can begin.",
          },
        },
        {
          title: "Increasing and Decreasing G Tolerance",
          pages: [116, 117],
          intro:
            "The straining manoeuvre and what supports it, and the everyday things " +
            "that take tolerance away.",
        },
        {
          title: "Motion Sickness",
          pages: [119],
          intro:
            "Prolonged motion overloading the orientation systems, and what makes " +
            "it worse.",
        },
        {
          title: "Preventing Motion Sickness",
          pages: [120],
          intro:
            "Exposure, medication, remedies — and the caution attached to the " +
            "middle one.",
        },
        {
          title: "Treating Motion Sickness",
          pages: [121],
          intro:
            "What to do in the aeroplane, starting with getting out of the " +
            "situation.",
        },
      ],
    },

    {
      title: "Fitness to Fly",
      syllabus: ["10.30"],
      intro:
        "The legal side of being well enough to fly, and the responsibility " +
        "that stays with you between medicals.",
      topics: [
        {
          title: "Fitness to Fly and the Legal Requirements",
          pages: [128],
          intro:
            "What a pilot must be, and what a pilot must hold.",
        },
        {
          title: "Aviation Medical Certificates",
          pages: [129, 130],
          intro:
            "Your responsibility to report a change in health, and an accident " +
            "that shows why.",
          takeaway:
            "A medical certificate is a snapshot, not a licence to stop thinking " +
            "about your health. The obligation it creates is continuous: if " +
            "something changes that could affect your fitness, the certificate does " +
            "not cover you until an aviation medical examiner says it does.",
          context:
            "A private pilot in New Zealand may hold either a CAA Class 2 medical " +
            "certificate or a Land Transport DL9 medical certificate, and the " +
            "obligation when something changes is the same for both. If the " +
            "holder becomes aware of, or has reasonable grounds to suspect, a " +
            "change in their medical condition - or a condition they did not know " +
            "about - that could interfere with the safe exercise of the licence, " +
            "they must stop exercising its privileges until a health practitioner " +
            "confirms they are fit to hold the certificate. For a pilot on a DL9 " +
            "that means a new DL9 issued by their medical examiner. The " +
            "certificate in your pocket does not cover a condition that arrived " +
            "after it was written.",
          diagramNotes: {
            130: "The CAA's I'M SAFE checklist — the six questions to ask yourself before every flight. Illness: free of illness and symptoms. Medication: safe medication only. Stress: managing stress well at home and at work. Alcohol and drugs: free of them and of their after-effects. Fatigue: rested and sleeping well. Eating: fed, watered and ready to go. It takes about ten seconds and it is the only fitness assessment most private flights ever get.",
          },
        },
      ],
    },

    {
      title: "Health, Diet and Lifestyle",
      syllabus: ["10.30"],
      intro:
        "The conditions that end flying careers, and the everyday choices that " +
        "decide how likely each of them is. Most of this chapter is about " +
        "things that are still preventable at the age a PPL is issued.",
      topics: [
        {
          title: "Pregnancy and Flying",
          pages: [132],
          intro:
            "The conditions under which it is not a problem.",
        },
        {
          title: "Arterial Disease",
          pages: [133, 134],
          intro:
            "Coronary artery disease and cerebrovascular disease — the same " +
            "process in two different sets of vessels.",
        },
        {
          title: "Heart Attacks",
          pages: [135],
          intro:
            "What a coronary artery blockage does, and what leads up to it.",
        },
        {
          title: "Cardiovascular Risk Factors",
          pages: [136],
          intro:
            "The list, split — usefully — into the ones you can do something about " +
            "and the ones you cannot.",
        },
        {
          title: "Blood Pressure",
          pages: [137, 138],
          intro:
            "What the two numbers mean, and what high readings do to the arteries " +
            "over time.",
        },
        {
          title: "Diet",
          pages: [139],
          intro:
            "Eating sensibly for a long career, and the specific warning about " +
            "crash dieting.",
        },
        {
          title: "Exercise",
          pages: [140],
          intro:
            "How much, how often, and what counts.",
        },
        {
          title: "Obesity",
          pages: [141],
          intro:
            "What it is, and the conditions it is linked to.",
        },
        {
          title: "Smoking",
          pages: [142],
          intro:
            "The two major health effects, and the one that matters in flight " +
            "before either of them.",
          context:
            "Smoking is worth separating into two problems, because they act on " +
            "completely different timescales. The long-term one is the cancer and " +
            "cardiovascular risk. The immediate one is carbon monoxide occupying " +
            "haemoglobin that oxygen should be on, which raises a smoker's " +
            "effective altitude before the aeroplane has left the ground — the same " +
            "mechanism as the environmental hazard chapter, arriving by choice.",
        },
        {
          title: "Respiratory Tract Infections",
          pages: [143],
          intro:
            "Sinusitis and the rest, and why a minor illness on the ground is a " +
            "serious one in the air.",
        },
        {
          title: "Gastroenteritis",
          pages: [144, 145],
          intro:
            "What it is, where it comes from, and how to avoid it — which matters " +
            "most on the trip before the flight.",
        },
        {
          title: "Neurological Problems",
          pages: [146],
          intro:
            "Seizures, epilepsy and head injuries, and what they mean for " +
            "certification.",
        },
        {
          title: "Depression and Anxiety",
          pages: [147],
          intro:
            "Clinical depression as a medical condition, and how it is treated in " +
            "the certification system.",
        },
      ],
    },

    {
      title: "Alcohol, Medication and Drugs",
      syllabus: ["10.32", "10.34"],
      intro:
        "Substances that reach the brain, and the rules and intervals built " +
        "around them. The theme running through the chapter is that the " +
        "impairment outlasts the feeling of impairment, every time.",
      topics: [
        {
          title: "Alcohol",
          pages: [148, 149],
          intro:
            "What it does, how long it lasts, and the interval that follows from " +
            "that.",
          takeaway:
            "Alcohol's effects on the brain outlive its presence in the blood. " +
            "That is why the rule is a fixed number of hours rather than a " +
            "self-assessment, and why feeling fine is not evidence of anything.",
        },
        {
          title: "The Hangover",
          pages: [150],
          intro:
            "Why the bottle-to-throttle rule is a floor rather than a guarantee.",
        },
        {
          title: "Medication",
          pages: [151, 152],
          intro:
            "Side effects, the general rule about flying on drugs, and how to test " +
            "a new one safely.",
          misconception:
            "Treating over-the-counter medicines as safe because they need no " +
            "prescription. Antihistamines and cold remedies are among the most " +
            "sedating things a pilot can take, and the illness they are treating is " +
            "usually itself a reason not to fly. The rule the deck gives — trial " +
            "any new drug on the ground first — exists because the side effect you " +
            "have not met before will meet you in the circuit.",
        },
        {
          title: "Recreational Drugs",
          pages: [153],
          intro:
            "What they do to the central nervous system, and to a career.",
          takeaway:
            "Three reasons, and each one alone is enough. They act directly on " +
            "the central nervous system, which is the part of a pilot doing the " +
            "flying. Their effects and their duration are unpredictable, because " +
            "neither the dose nor the purity is known. And they are illegal, so " +
            "their use cannot be declared to an aviation medical examiner, which " +
            "means the one safeguard the system has - an honest conversation with " +
            "a doctor - is closed off by the act of using them.",
        },
        {
          title: "Blood Donation",
          pages: [154],
          intro:
            "A good thing to do, with an interval attached to it.",
        },
      ],
    },

    {
      title: "Environmental Hazards",
      syllabus: ["10.36"],
      intro:
        "Things in and around a light aircraft that can poison you. The first " +
        "of them is the one that kills pilots in New Zealand: an exhaust leak " +
        "into a cabin heater.",
      topics: [
        {
          title: "Carbon Monoxide",
          pages: [156],
          intro:
            "What it is, and how it gets into the cabin of an aeroplane with a " +
            "piston engine.",
          context:
            "Carbon monoxide is dangerous out of all proportion to how much of it " +
            "there is, because haemoglobin prefers it to oxygen by a very large " +
            "margin. Once a molecule of it is bound, that site is out of service " +
            "for hours. So a leak that adds a trace of it to the cabin air " +
            "progressively removes the blood's ability to carry oxygen, and " +
            "produces hypoxia at circuit height in an aeroplane that is working " +
            "perfectly.",
        },
        {
          title: "Symptoms and Corrective Action",
          pages: [157],
          intro:
            "What it feels like, what to do about it, and the detector that costs " +
            "almost nothing.",
          diagramNotes: {
            157: "The symptoms of carbon monoxide poisoning in the order they usually arrive: headache, nausea, dizziness, breathlessness, collapse, and loss of consciousness.",
          },
          takeaway:
            "The symptoms are the problem: a headache and slight nausea in a warm " +
            "cockpit are exactly what a long flight feels like anyway, so carbon " +
            "monoxide is rarely suspected until it is well advanced. That is why " +
            "the corrective actions are worth doing on suspicion rather than on " +
            "certainty - turning the cabin heat off and the ventilation up costs " +
            "nothing and removes the source, and a colour-spot detector on the " +
            "panel costs a few dollars and is the only thing in the aeroplane " +
            "that will tell you before you feel it.",
        },
        {
          title: "Carbon Monoxide and Mixture",
          pages: [158],
          intro:
            "How much of it the exhaust carries, and what mixture setting changes " +
            "that.",
        },
        {
          title: "Fuels and Oils",
          pages: [159],
          intro:
            "Lead in avgas, and what it does through the skin, the mouth and the " +
            "eyes.",
        },
        {
          title: "Other Toxic Hazards",
          pages: [160],
          intro:
            "De-icing fluids, extinguishants, and agricultural chemicals.",
        },
      ],
    },

    {
      title: "Stress and Anxiety",
      syllabus: ["10.28", "10.38"],
      intro:
        "Stress is not the enemy — too little of it is as bad as too much. " +
        "This chapter is what stress actually is, the curve that governs " +
        "performance under it, where it comes from, and what to do about it. " +
        "Flight anxiety is gathered in here because it is the same physiology " +
        "with a specific trigger.",
      topics: [
        {
          title: "Stress and Arousal",
          pages: [162],
          intro:
            "Two words that are used loosely and mean different things.",
        },
        {
          title: "The Model of Stress",
          pages: [163],
          intro:
            "The relationship between arousal and performance, and where a pilot " +
            "wants to sit on it.",
          diagramNotes: {
            163: "The Yerkes-Dodson curve: performance rises with arousal to an optimum and then falls away, so that both a bored pilot and an overwhelmed one perform worse than an alert one.",
          },
          takeaway:
            "The curve has two failing ends, and the left-hand one is the surprise. " +
            "A long, easy, familiar cruise puts a pilot low on the curve, where " +
            "attention wanders and things get missed — which is why boredom is a " +
            "flight safety problem and not just an inconvenience.",
        },
        {
          title: "Types of Stressor",
          pages: [164],
          intro:
            "Where stress comes from: the flying environment, the operation, and " +
            "life.",
        },
        {
          title: "Environmental Stressors",
          pages: [165, 166, 167, 168],
          intro:
            "Temperature, humidity, noise and vibration — four things in the " +
            "cockpit that degrade performance before anyone notices.",
          takeaway:
            "What these four have in common is that they work slowly and are " +
            "invisible from inside. Nobody notices becoming 10 per cent less " +
            "accurate because the cockpit is 34 degrees, or because they have " +
            "been sitting in 90 decibels and vibration for two hours. They are " +
            "cumulative, they add to whatever else the day is doing to you, and " +
            "every one of them is easier to manage before the flight - hydration, " +
            "a headset, a shaded cockpit - than during it.",
        },
        {
          title: "Flight Anxiety",
          pages: [123, 124],
          intro:
            "Fear with a specific object, in pilots of every level of experience.",
        },
        {
          title: "Signs of Anxiety",
          pages: [125],
          intro:
            "What it looks like from outside, which is how it is usually caught.",
        },
        {
          title: "Relieving Flight Anxiety",
          pages: [126],
          intro:
            "Knowledge, counselling, and the reason the first of them works.",
        },
        {
          title: "Physiological Effects of Stress",
          pages: [169],
          intro:
            "Acute and chronic — the fight-or-flight response, and what happens " +
            "when it never switches off.",
        },
        {
          title: "Psychological Effects of Stress",
          pages: [170],
          intro:
            "The mental and behavioural side, including the one that matters most " +
            "in an aeroplane.",
          context:
            "Narrowing of attention is the item on this list with a direct " +
            "accident chain attached to it. Under load, attention contracts onto " +
            "whatever seems most urgent, and everything outside that shrinking " +
            "circle stops being processed — the fuel state, the other traffic, the " +
            "aeroplane's attitude. Almost every fixation accident is this effect " +
            "doing exactly what it evolved to do, in a situation where it is " +
            "precisely wrong.",
        },
        {
          title: "Identifying Stress",
          pages: [171],
          intro:
            "Signs you can observe in yourself and in others.",
          context:
            "Every sign on this list is behavioural and most of them are easier " +
            "to see in somebody else than in yourself, which is the practical " +
            "point of the topic. A pilot under chronic stress rarely reports it; " +
            "what shows is a short temper, uncharacteristic mistakes and a change " +
            "in how they are. That makes noticing it a job for the people around " +
            "a pilot, and makes being noticed something to accept rather than " +
            "resist.",
        },
        {
          title: "Managing Stress",
          pages: [172, 173],
          intro:
            "The physical and psychological approaches, and two techniques worth " +
            "practising before you need them.",
        },
      ],
    },

    {
      title: "Sleep and Fatigue",
      syllabus: ["10.40", "10.42"],
      intro:
        "Fatigue is the impairment nobody self-diagnoses. This chapter is what " +
        "sleep is for, the clock that governs it, what its absence does to a " +
        "pilot, and the fact that ageing changes all of it.",
      topics: [
        {
          title: "Sleep",
          pages: [175],
          intro:
            "What it is, and how much of a life it takes up.",
          context:
            "How much sleep a person needs is individual, and it does not change " +
            "to suit a schedule. Most adults need somewhere around seven to nine " +
            "hours, and where a particular person sits in that range is set by " +
            "their physiology rather than their willingness - so a pilot who " +
            "needs eight and plans on six is running a deficit whatever anybody " +
            "else manages on. Age shifts it, and so does recovery from illness or " +
            "unusual exertion. The practical point is to know your own figure and " +
            "plan against that rather than against an average.",
        },
        {
          title: "Sleep Deprivation",
          pages: [176],
          intro:
            "What goes wrong across the body when sleep is short.",
          diagramNotes: {
            176: "The systems insufficient sleep affects: mental health, immune function, cardiovascular disease, diabetes, obesity, hormone imbalance and pain.",
          },
          takeaway:
            "The figure makes the point better than a list would: sleep is not " +
            "one system's problem. Short sleep shows up in mental health, immune " +
            "function, cardiovascular disease, diabetes, obesity, hormone balance " +
            "and pain, which is why fatigue is treated in aviation as a flight " +
            "safety issue rather than a personal one.",
          context:
            "Some people are short of sleep because of what they are doing, and " +
            "some because of a disorder that stops them sleeping properly however " +
            "long they spend in bed. Insomnia, and sleep apnoea - where breathing " +
            "is interrupted repeatedly through the night - both produce daytime " +
            "sleepiness and degraded performance in someone who believes they " +
            "slept. That is why persistent tiredness that rest does not fix is a " +
            "matter for a doctor and for an aviation medical examiner, and not " +
            "something to be managed with more coffee.",
        },
        {
          title: "The Sleep Cycle",
          pages: [177],
          intro:
            "The stages a night runs through, and how they change from the first " +
            "cycle to the last.",
          diagramNotes: {
            177: "A night's sleep as five cycles: each descends through the stages into deep sleep and back up, with deep sleep dominating the early cycles and REM lengthening towards morning.",
          },
          context:
            "A night is not a single block of sleep but four or five cycles, and " +
            "they are not interchangeable. The early cycles hold most of the deep " +
            "sleep that restores the body; the later ones hold progressively more " +
            "REM sleep, which is where memory and learning are consolidated. " +
            "Cutting a night short does not remove a proportional slice of each - " +
            "it removes the REM at the end, which is why a short night costs more " +
            "than the hours suggest.",
        },
        {
          title: "Sleep Terms",
          pages: [178],
          intro:
            "The vocabulary: the biological clock, and the rhythms it drives.",
        },
        {
          title: "Circadian Rhythm",
          pages: [179],
          intro:
            "The twenty-four hour cycle, and what it is doing at each point in the " +
            "day.",
          diagramNotes: {
            179: "The circadian cycle around a twenty-four hour clock, with the body's functions — temperature, alertness, hormone release, digestion — placed at the hours they peak and trough.",
          },
          takeaway:
            "The body has a clock and it does not care what your roster says. " +
            "Alertness, temperature, digestion and hormone release all run on " +
            "roughly a twenty-four hour cycle, with a marked low in the small " +
            "hours and a smaller one in the early afternoon. Flying through one " +
            "of those troughs is flying with degraded performance that no amount " +
            "of willingness makes up for, and the only real remedies are sleep " +
            "before it and a plan that does not need you at your best.",
        },
        {
          title: "The Body Temperature Cycle",
          pages: [180],
          intro:
            "The simplest measure of where you are in the cycle.",
          diagramNotes: {
            180: "Body temperature across a day and night: falling through the evening to a minimum in the small hours and rising again before waking.",
          },
        },
        {
          title: "Napping",
          pages: [181],
          intro:
            "How long a useful nap is, and what happens if it goes on longer.",
        },
        {
          title: "Fatigue",
          pages: [182],
          intro:
            "The definition, and the several different things that cause it.",
          term: "Fatigue",
          definition: "The accumulation of unrelieved stress.",
        },
        {
          title: "Effects of Fatigue",
          pages: [183],
          intro:
            "What it does to performance, and the item on the list that makes it " +
            "dangerous.",
          takeaway:
            "“Decline in performance without recognition” is the whole problem in " +
            "five words. Fatigue removes the faculty that would otherwise notice " +
            "fatigue, so the only reliable defence is a decision made in advance — " +
            "a duty limit, a rest plan, a flight not taken — rather than an " +
            "assessment made on the day.",
        },
        {
          title: "Managing Fatigue",
          pages: [184],
          intro:
            "Routine, what to avoid before bed, and why the answers are so " +
            "unglamorous.",
        },
        {
          title: "Ageing",
          pages: [185],
          intro:
            "The physical changes that come with age, and what they mean for " +
            "flying.",
          takeaway:
            "The picture is not one of decline in everything. Physically the " +
            "senses, strength and reaction times all fall away; behaviourally the " +
            "older pilot is less impulsive and has fewer accidents in the places " +
            "where skill and judgement decide. What has to be watched is the " +
            "middle ground - information processing speed and memory - and the " +
            "deck's own advice is the right one: it is not inevitable, and it " +
            "responds to being used.",
        },
        {
          title: "Cognitive Impairment",
          pages: [186],
          intro:
            "Dementia and the symptoms that describe it.",
        },
      ],
    },

    {
      title: "Information Processing",
      syllabus: ["10.44"],
      intro:
        "How a pilot turns what the senses collect into a decision — and, more " +
        "usefully for this exam, all the places along that path where the " +
        "process quietly fails.",
      topics: [
        {
          title: "Acquiring Information",
          pages: [188],
          intro:
            "The senses that feed the process, and what the brain does with what " +
            "they send.",
          diagramNotes: {
            188: "The lobes of the brain and what each is responsible for — frontal, parietal, temporal and occipital, with the cerebellum and spinal cord beneath.",
          },
        },
        {
          title: "The Brain",
          pages: [189],
          intro:
            "The lobes and what each is responsible for.",
        },
        {
          title: "The Information Processing Model",
          pages: [190],
          intro:
            "The whole path in one diagram: input, attention, memory, response.",
          diagramNotes: {
            190: "The information processing model: sensory input reaches sensory memory, attention selects what passes into short-term memory, encoding moves it to long-term memory and retrieval brings it back — with unattended, unrehearsed and unused information lost at each stage.",
          },
          takeaway:
            "Read the model as a series of filters rather than a pipeline, " +
            "because information is lost at every stage and it is the losses that " +
            "matter. Most of what reaches the senses is never attended to; most " +
            "of what reaches short-term memory is never encoded; and what does " +
            "get stored can still fail to come back. A checklist, a written " +
            "clearance and a briefing are all the same trick - they take a step " +
            "out of the fragile part of the chain.",
        },
        {
          title: "Attention",
          pages: [191, 192],
          intro:
            "The control you have over what gets processed, and what happens to a " +
            "receptor left on one stimulus too long.",
        },
        {
          title: "Memory",
          pages: [193],
          intro:
            "Sensory, working and long-term — three stores with very different " +
            "capacities.",
        },
        {
          title: "Limitations and Failures",
          pages: [194],
          intro:
            "Where the process breaks: threshold, capacity, and everything after.",
          context:
            "Six failure points, and the useful way to hold them is as one path " +
            "with holes in it. Information can fail to get in at all (threshold), " +
            "fail to be attended to (capacity), be attended to and understood " +
            "wrongly (perceptual error), be knocked out of working memory by " +
            "something else (interference), be confused with something learned " +
            "earlier (associative interference), or be stored correctly and " +
            "refuse to come back (retrieval). Almost every everyday piloting " +
            "error is one of those six with a name on it.",
        },
        {
          title: "Retaining and Retrieving Information",
          pages: [195],
          intro:
            "Chunking, rehearsal, and the techniques that make a readback " +
            "possible.",
          example:
            "A clearance read as “one two three point four five, squawk four six " +
            "two one, climb five thousand five hundred” is thirteen digits, which " +
            "is more than working memory holds. Read as three chunks — a " +
            "frequency, a squawk, a level — it is three things, which is " +
            "comfortably inside it. This is why pilots who write nothing down can " +
            "still read back a long clearance, and why the ones who cannot are " +
            "usually trying to hold digits rather than meanings.",
          exampleTitle: "Chunking a clearance",
        },
        {
          title: "Mental Workload",
          pages: [196],
          intro:
            "What the tasks of flying actually demand, and how that demand adds " +
            "up.",
        },
        {
          title: "Overloading",
          pages: [197],
          intro:
            "Managing the load so it never arrives all at once.",
          takeaway:
            "The four defences here all work by moving load off the moment it " +
            "would otherwise arrive. Learned automatic responses take the " +
            "thinking out of the urgent thing. Writing it down takes it out of " +
            "memory. Prioritising decides in advance what gets dropped. " +
            "Preparation moves the whole task to the ground where there is time. " +
            "None of them increases capacity - they reduce demand, which is the " +
            "only lever a pilot actually has.",
        },
        {
          title: "Perception",
          pages: [198],
          intro:
            "The mental model, and what it is compared against.",
        },
        {
          title: "Experience and Expectation",
          pages: [199],
          intro:
            "How experience speeds up perception — and how expectation makes it " +
            "wrong.",
          misconception:
            "Assuming experience only helps. The same mechanism that lets an " +
            "experienced pilot absorb a familiar picture instantly also lets them " +
            "hear the clearance they expected instead of the one that was given, " +
            "and see the runway they expected instead of the parallel one beside " +
            "it. Expectation bias is experience working exactly as designed on the " +
            "wrong day.",
        },
      ],
    },

    {
      title: "Situational Awareness and Decision Making",
      syllabus: ["10.46", "10.48"],
      intro:
        "Knowing what is going on, deciding what to do about it, and the " +
        "attitudes that stop both. This is where the physiology of the earlier " +
        "chapters turns into behaviour.",
      topics: [
        {
          title: "Situational Awareness",
          pages: [201],
          intro:
            "The mental picture, and where losing it costs most.",
        },
        {
          title: "Maintaining Situational Awareness",
          pages: [202],
          intro:
            "The habits that keep the picture current.",
          takeaway:
            "The last item is the one to carry. Confirmation bias is what turns a " +
            "lost mental picture into an accident: once you have decided which " +
            "town that is, every feature you see afterwards gets fitted to the " +
            "decision instead of testing it. The defence is to look for the thing " +
            "that would prove you wrong rather than the thing that would prove " +
            "you right, and to say out loud - or on the radio - what you think is " +
            "happening, because that is when it gets checked.",
        },
        {
          title: "Skills, Knowledge and Attitudes",
          pages: [203],
          intro:
            "Judgement as a product of experience and training, rather than of " +
            "character.",
        },
        {
          title: "Hazardous Attitudes",
          pages: [204],
          intro:
            "The five named attitudes, each with an accident behind it.",
          takeaway:
            "The reason these five are named and memorised is that they are " +
            "invisible from inside. Nobody experiences themselves as impulsive or " +
            "anti-authority in the moment; they experience themselves as being " +
            "decisive or as knowing better than a rule written for someone else. " +
            "Having the list means you can recognise the pattern in your own " +
            "reasoning while there is still time to change it.",
        },
        {
          title: "The Error Chain",
          pages: [205],
          intro:
            "Why accidents are almost never one mistake.",
        },
        {
          title: "The Red Flags",
          pages: [206],
          intro:
            "The warning signs that a chain is forming, in time to break it.",
          context:
            "These are not signs that something has gone wrong; they are signs " +
            "that something is going wrong while there is still time. Three of " +
            "them are worth singling out because they can be checked in a second: " +
            "is anybody flying the aircraft, is anybody looking out of the " +
            "window, and is there a discrepancy nobody has resolved. In a " +
            "single-pilot aeroplane the answer to the first two is you, which " +
            "makes noticing them entirely your job.",
        },
        {
          title: "Decision Making",
          pages: [207],
          intro:
            "What happens after perception, and the shape of a decision.",
          context:
            "Underneath every model in the next topic is the same sequence, and " +
            "it is worth having in general terms before the mnemonics arrive. " +
            "Something changes. It is noticed, or it is not. It is judged to " +
            "matter, or it is not. Options are generated, one is chosen, it is " +
            "carried out, and the result is checked - which either closes the " +
            "problem or starts the sequence again. Two of those steps are where " +
            "flights go wrong: noticing, and checking the result afterwards. The " +
            "models exist to stop a pilot skipping straight from noticing to " +
            "acting.",
        },
        {
          title: "Risk Assessment",
          pages: [208],
          intro:
            "Assessing the flight's risk on the ground, across pilot, aircraft, " +
            "environment and operation.",
          takeaway:
            "The most useful thing to come out of a risk assessment is a set of " +
            "personal limits and decision points fixed before the flight - a " +
            "crosswind you will not accept, a cloud base you will turn back at, a " +
            "time by which you will have landed, a fuel state at which you " +
            "divert. They work because they are decided when there is nothing at " +
            "stake, and they are checked at a point on the map rather than at the " +
            "moment of maximum pressure. A limit you set in the air is not a " +
            "limit.",
        },
        {
          title: "Decision Making Models",
          pages: [209, 210, 211],
          intro:
            "Three models, each a mnemonic for the same sequence, and one of them " +
            "starting where every model should.",
          context:
            "Notice what the third model puts first: fly the aircraft. Every one " +
            "of these frameworks is useless in an aeroplane that has been allowed " +
            "to stop being flown while the pilot works through it. The models are " +
            "worth learning as a way of ordering thought when there is time to " +
            "think — and the first line of the third one is worth learning as the " +
            "thing that has to be true before any of the others apply.",
          keyPoints: [
            "DECIDE — Detect a change, Estimate its significance, Choose a safe outcome, Identify the available options, Do put the chosen one into effect, Evaluate the effect.",
            "SADIE — Share information, Analyse it, Develop the best solution, Implement the decision, Evaluate the outcome.",
            "FDODAR — Fly the aircraft, Diagnose the problem, consider the Options, Decide, Act or assign, Review.",
            "The initial letters are the model: each list above is the same set of steps the slides give, and the mnemonic is what makes them retrievable under load.",
          ],
        },
        {
          title: "Factors Influencing Decision Making",
          pages: [212],
          intro:
            "The four headings that a decision on the day actually depends on.",
        },
        {
          title: "Get-Home-Itis",
          pages: [213],
          intro:
            "The single most reliable killer of VFR pilots, and what it looks like " +
            "from inside.",
        },
      ],
    },

    {
      title: "Social Psychology and Flight Deck Management",
      syllabus: ["10.50"],
      intro:
        "Flying with other people in the system: personality, culture, and the " +
        "communication between a pilot and everyone else on the frequency.",
      topics: [
        {
          title: "Personality and Behaviour",
          pages: [215],
          intro:
            "Personality as a pattern rather than a label, and how much of it can " +
            "change.",
          misconception:
            "Reading the four temperaments as a test that sorts pilots into safe " +
            "and unsafe types. They do not. Personality is described here as a " +
            "pattern of behaviour a person uses to adjust to their environment, " +
            "and the value of knowing your own pattern is knowing which way you " +
            "will lean when the pressure comes on - towards pressing on or " +
            "towards freezing, towards asking or towards guessing. Personality is " +
            "stable; behaviour is a choice, and it is behaviour the rules and the " +
            "training are aimed at.",
        },
        {
          title: "Flight Deck Management",
          pages: [216],
          intro:
            "Operators and pilots as partners in risk management, and the culture " +
            "that makes that work.",
        },
        {
          title: "Communication with ATC",
          pages: [217],
          intro:
            "Readback, plain language, and timeliness — the three things that stop " +
            "a misunderstanding.",
          takeaway:
            "The three things that stop a misunderstanding are the same in every " +
            "direction on this slide: say it back, say it in time, and say it in " +
            "plain language when the standard phrase does not fit. The last one " +
            "is worth stating explicitly, because pilots under pressure reach for " +
            "phraseology they half remember rather than saying what they mean. A " +
            "controller would rather hear an ordinary English sentence than a " +
            "wrong standard phrase.",
        },
      ],
    },

    {
      title: "Threat and Error Management",
      syllabus: ["10.52"],
      intro:
        "The framework that assumes error rather than forbidding it. Human " +
        "error is inevitable, so the useful questions are where it comes from, " +
        "what catches it, and what to do once an aircraft is already in an " +
        "undesired state.",
      topics: [
        {
          title: "Threat and Error Management",
          pages: [219],
          intro:
            "The premise, and what it says about how accidents are actually " +
            "caused.",
        },
        {
          title: "Active Threats and Errors",
          pages: [220],
          intro:
            "The ones at the sharp end: slips, lapses, fumbles and mistakes.",
          diagramNotes: {
            220: "Water lying across an apron with cones around it and an aircraft parked beyond — the kind of hazard that is present, visible and in direct contact with the operation.",
          },
        },
        {
          title: "Latent Threats and Errors",
          pages: [221],
          intro:
            "The ones written into the system long before the flight, by people " +
            "who will never be on it.",
        },
        {
          title: "The Swiss Cheese Model",
          pages: [222],
          intro:
            "Why defences in depth fail: not because a barrier is missing, but " +
            "because the holes line up.",
          diagramNotes: {
            222: "James Reason's model: successive slices of defence — organisational influences, supervision, preconditions and specific acts — each with holes in it, and an accident trajectory passing through a moment when the holes align.",
          },
        },
        {
          title: "Error Avoidance Techniques",
          pages: [223],
          intro:
            "What actually reduces the error rate, including one item that is not " +
            "a technique at all.",
          misconception:
            "Reading intuition as a technique like the others. It is not, and the " +
            "slide is right to list it anyway. A gut feeling is fast pattern " +
            "recognition working below the level you can explain, and it is very " +
            "good at telling you that something is wrong and very bad at telling " +
            "you what. Treat it as a prompt to check, never as a conclusion to " +
            "act on - and never let it override a checked fact.",
        },
        {
          title: "Responding to an Undesired State",
          pages: [224],
          intro:
            "Mitigate, exacerbate, or fail to respond — the three outcomes, and " +
            "the only acceptable one.",
        },
      ],
    },

    {
      title: "Safety Culture and Reporting",
      syllabus: ["10.54"],
      intro:
        "What a group expects of its members, how that shapes what gets " +
        "reported, and the New Zealand reporting rules that depend on it.",
      topics: [
        {
          title: "Culture",
          pages: [226],
          intro:
            "The group and its protocols, and the several groups a pilot belongs " +
            "to at once.",
        },
        {
          title: "Safety Culture",
          pages: [227],
          intro:
            "An ongoing process rather than a state, and what it has to eliminate.",
        },
        {
          title: "The Safety Reporting System",
          pages: [228],
          intro:
            "What the CAA requires to be reported, and the rule parts that require " +
            "it.",
        },
        {
          title: "Safe Behaviour",
          pages: [229],
          intro:
            "Error is possible in any behaviour; at-risk and high-culpability " +
            "behaviour makes it likely.",
          context:
            "The slide names at-risk and high-culpability behaviour; the " +
            "distinction underneath them is between negligence and recklessness, " +
            "and it decides how an occurrence is treated. Negligence is failing " +
            "to take the care a reasonable pilot would have taken - the check not " +
            "done, the figure not looked up - without any intention to run a " +
            "risk. Recklessness is knowing the risk is there and going anyway. A " +
            "just culture treats the first as something to learn from and the " +
            "second as something to answer for, and the difference is what the " +
            "person knew at the time, not how badly it turned out.",
        },
        {
          title: "Punitive Sanction",
          pages: [230],
          intro:
            "Where penalties are appropriate, and where they destroy the reporting " +
            "the system depends on.",
          diagramNotes: {
            230: "The penalty provision as it is written: on conviction, imprisonment of up to 12 months or a fine of up to $10,000 for an individual, and a fine of up to $100,000 for a body corporate.",
          },
          context:
            "The tension in this chapter is real and it is not resolved by " +
            "pretending it is not there. A system that punishes every error stops " +
            "hearing about errors, and loses the information it needs to prevent " +
            "the next one. A system that punishes nothing has no answer to " +
            "deliberate recklessness. The line the just-culture idea draws is " +
            "between honest error, which is reported and learned from, and chosen " +
            "risk, which is not.",
        },
      ],
    },

    {
      title: "Instruments, Displays and Alerts",
      syllabus: ["10.60"],
      intro:
        "The hardware half of the SHELL model. Everything here is about the " +
        "fit between an instrument and the person reading it — which is a " +
        "design problem that has been solved, unsolved and solved again over a " +
        "century of cockpits.",
      topics: [
        {
          title: "How Cockpits Got This Way",
          pages: [232],
          intro:
            "Early cockpits, and the problems that produced the standard layout.",
        },
        {
          title: "Conventional Flight Decks",
          pages: [233, 234],
          intro:
            "The airliner flight deck of the 1960s and the light twin of today — " +
            "the same six instruments in the same places.",
          diagramNotes: {
            233: "The flight deck of a Boeing 737-200: analogue instruments spread across the panel, with the primary six grouped in front of each pilot.",
            234: "The panel of a Piper PA-44 Seminole, with the standard six-pack arrangement in front of the left seat.",
          },
          context:
            "Two flight decks fifty years and several thousand kilograms apart, " +
            "showing the same thing: the basic six instruments in the same " +
            "arrangement in front of each pilot. That standardisation is a human " +
            "factors achievement rather than an engineering one. It means a pilot " +
            "who learns the scan in a light twin can read the panel of an " +
            "airliner, and it is why the layout has survived the change from " +
            "mechanical instruments to glass.",
        },
        {
          title: "Glass Cockpits",
          pages: [235, 236],
          intro:
            "The same information on screens, in a light twin and in an airliner.",
          diagramNotes: {
            235: "A Garmin G1000 installation in a Diamond DA-42: primary flight display and multi-function display replacing the analogue panel.",
            236: "The flight deck of a Boeing 787, with large-format displays and the same underlying arrangement of information.",
          },
          takeaway:
            "A glass cockpit changes the display, not the information. The same " +
            "six parameters are still there and still in the same relative places " +
            "on the primary flight display, which is deliberate. What genuinely " +
            "changes is the amount of extra information available and the number " +
            "of ways it can be configured - which is a workload problem in " +
            "itself, and the reason the alerts topic later in this chapter " +
            "matters more in a modern aeroplane than an old one.",
        },
        {
          title: "Designing a Display",
          pages: [237, 238],
          intro:
            "Size, position, legibility and scale — the properties a display has " +
            "to get right before its accuracy matters at all.",
          keyPoints: [
            "Colour on an aviation instrument or display is a convention, not decoration, and it is consistent so that it can be read without being interpreted.",
            "Green marks the normal operating range - the arc on an airspeed indicator, a normal indication on a display.",
            "Yellow or amber marks caution: a range to be used only in smooth air, or a condition that needs attention but not immediate action.",
            "Red marks a limit or a warning: never exceed, or an immediate action.",
            "A white arc has its own specific meaning on an airspeed indicator - the flap operating range - which is why the colours are learnt per instrument as well as in general.",
          ],
        },
        {
          title: "Parallax Error",
          pages: [239],
          intro:
            "The error introduced by reading an instrument from the wrong seat.",
          diagramNotes: {
            239: "The same fuel gauge photographed from two positions: read from directly in front the needle sits at one value, and read from the side it appears to sit at another. Nothing about the instrument has changed.",
          },
        },
        {
          title: "The Three-Pointer Altimeter",
          pages: [240],
          intro:
            "The classic case of a display that was accurate and still killed " +
            "people, and what replaced it.",
          takeaway:
            "The three-pointer altimeter is the standing example in this subject " +
            "of a design that met its specification and failed its user. Nothing " +
            "about it was inaccurate. It simply took too long to read correctly " +
            "and was too easy to read wrongly by ten thousand feet, which is the " +
            "definition of a human factors problem rather than an engineering one.",
        },
        {
          title: "Alerts",
          pages: [241, 242],
          intro:
            "What an alert has to do to work, and how a well-meant one is " +
            "misread.",
        },
      ],
    },

    {
      title: "Checklists and Documents",
      syllabus: ["10.62"],
      intro:
        "The software half of the SHELL model: the paper and procedures that " +
        "carry the parts of the job memory is bad at.",
      topics: [
        {
          title: "Why Checklists and SOPs Exist",
          pages: [244],
          intro:
            "What flight deck documentation covers, and the job it is doing.",
        },
        {
          title: "Types of Checklist",
          pages: [245],
          intro:
            "Normal and emergency, challenge-and-response and read-and-do, and " +
            "which parts are memorised.",
          context:
            "Two distinctions matter here. Normal checklists are used in the " +
            "ordinary running of a flight and can be read; emergency checklists " +
            "contain immediate actions that have to be done from memory first, " +
            "with the written list used afterwards to confirm nothing was missed. " +
            "And challenge and response - one person reads, the other checks and " +
            "answers - is a different tool from read and do, where the reader " +
            "does each item as it is read. Single-pilot flying uses read and do, " +
            "which is why the discipline of touching each item as you read it is " +
            "the only cross-check there is.",
        },
        {
          title: "Critical Phases of Flight",
          pages: [246],
          intro:
            "Where checklist misuse turns into accidents, and the human " +
            "characteristic behind it.",
        },
        {
          title: "Checklist Complacency",
          pages: [247],
          intro:
            "What routine use does to a checklist, and how to keep it doing its " +
            "job.",
          misconception:
            "Believing that knowing the checklist by heart is the goal. A " +
            "checklist recited from memory has stopped being a check — it is now " +
            "the same fallible memory it was supposed to back up, with the " +
            "confidence of a procedure attached to it. The value is in reading the " +
            "item and then looking at the thing.",
        },
      ],
    },

    {
      title: "First Aid and Survival",
      syllabus: ["10.64", "10.66"],
      intro:
        "What to do after the flight has gone wrong: the immediate first aid " +
        "sequence, the briefing that should have happened before takeoff, and " +
        "staying alive until somebody arrives.",
      topics: [
        {
          title: "First Aid",
          pages: [249],
          intro:
            "The sequence, in the order it is done.",
          takeaway:
            "DRSABCD is a sequence, and the order is the teaching. Danger comes " +
            "first because a rescuer who becomes a second casualty helps nobody, " +
            "and at an aircraft accident the danger is fuel. Send for help early, " +
            "because everything after it takes time you do not have. Only then " +
            "the airway, breathing and circulation, in that order, because there " +
            "is no point circulating blood that carries no oxygen.",
        },
        {
          title: "Cardiopulmonary Resuscitation",
          pages: [250],
          intro:
            "When to start, and the ratio to work at.",
        },
        {
          title: "Passenger Briefing",
          pages: [251],
          intro:
            "What every passenger has to be told, and when.",
        },
        {
          title: "Principles of Survival",
          pages: [252],
          intro:
            "Five principles in priority order, and why the first one is first.",
        },
        {
          title: "Survival Equipment",
          pages: [253],
          intro:
            "What to carry, decided by the terrain and the climate rather than by " +
            "the aeroplane.",
          takeaway:
            "In New Zealand the terrain decides the kit, and most cross-country " +
            "flying here is over bush-clad or mountainous country where a " +
            "survivable forced landing can still leave you a long way from " +
            "anybody. That argues for the things in the list that let you be " +
            "found and stay warm - the ELT and a radio, a signalling mirror, " +
            "fire, shelter and warm clothing you are actually wearing rather than " +
            "packed in the baggage locker. Water crossings change the answer " +
            "again, towards flotation and immersion protection.",
        },
        {
          title: "Hypothermia",
          pages: [254, 255],
          intro:
            "What it is, the sequence of symptoms, and the point at which the " +
            "person stops being able to help themselves.",
        },
        {
          title: "Treating Hypothermia",
          pages: [256],
          intro:
            "Warm gradually — and the two things not to do.",
          takeaway:
            "The instructions here are mostly negative — do not rub the skin, do " +
            "not warm quickly — and that is deliberate. The obvious, instinctive " +
            "responses to a very cold person are the harmful ones, so the treatment " +
            "has to be learned rather than worked out on the spot.",
        },
      ],
    },
  ],
};
