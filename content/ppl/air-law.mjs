/**
 * PPL Air Law — the curriculum.
 *
 * 381 slides, and the best-organised deck of the five: twenty-nine section
 * dividers that already read as a table of contents, from Aviation
 * Legislation through to Communications and Equipment. Almost all of that
 * order is kept, because in this subject order matters more than in any
 * other — the rules refer to each other, and a definition met after the rule
 * that uses it is a definition met too late.
 *
 * Four sections are folded into their neighbours, each time because the deck
 * split one idea across a divider:
 *
 *   - Instruments and Avionics (109) and Equipment (115) become one chapter.
 *     Both are Part 91 subpart F, both answer "what must be fitted and
 *     carried", and the deck's own slides cross between them.
 *
 *   - Flight Preparation (220) and Fuel Requirements (223) become one. Fuel
 *     planning is flight preparation; two slides and three slides are not two
 *     chapters.
 *
 *   - Clearances (242) absorbs the flight information service slides that
 *     follow it, which is where the deck already put them.
 *
 * Nothing is reordered. In a subject whose whole content is "what the rule
 * says", moving material around is a way of quietly changing what it says.
 *
 * A note on the many screenshots of rule text. Several slides carry an image
 * of the actual wording of a Civil Aviation Rule — firearms, fuelling,
 * accident definitions. Those are kept as figures and captioned rather than
 * paraphrased into prose, because the exact wording is the thing being
 * taught and a summary of a rule is not the rule.
 */
import { repairSlide } from "./deck-repairs.mjs";
import { isRejectedImage, isUpsideDown } from "./air-law-diagrams.mjs";

/** Repairs this deck needs that no other deck needs. */
const TABLES = {
  callouts: {},
  // Slide-by-slide corrections, each one checked against the slide it comes
  // from.
  substitutions: {
    // Slide 68 carries two CAA syllabus objectives verbatim as headings —
    // "State the normal currency period of the Land Transport medical
    // certificate (DL9)..." — with the answer on the line beneath. The answers
    // are the teaching and they stay; the instruction to an examination
    // candidate is replaced with the sentence it should have been.
    68: [
      [
        "State the normal currency period of the Land Transport medical certificate (DL9) for a holder who is under the age of 40 as per Rule 61",
        "A Land Transport medical certificate (DL9) held by a pilot who was under 40 on the date of examination is current for aviation purposes if it:",
      ],
      [
        "State the normal currency period of the Land Transport medical certificate (DL9) for a holder who is 40 years of age or more on the date that the certificate is issued as per Rule 61",
        "For a pilot who was 40 or more on the date of examination, the DL9 is current if it:",
      ],
    ],
    // The line reads "VFR Flights 4.2.2, CAR 91.313 requires the pilot...".
    // The rule reference is CAR 91.313; "4.2.2" is a paragraph number from the
    // document the slide was written against, and on a KiwiPilotPrep page it
    // reads as an internal code with nothing behind it.
    283: [["VFR Flights 4.2.2, CAR 91.313 requires", "CAR 91.313 requires"]],
  },
  titles: {
    // The layout split these titles across two boxes and the extractor kept
    // only the first half. The rest is the first line of the body, which the
    // echo check then removes.
    95: "Type Certificate & Type Acceptance Certificate",
    112: "Night VFR Instruments & Equipment",
    114: "Communication and Navigation Equipment – VFR over Water",
    219: "Information to Passengers and in Cargo Acceptance Areas",
    374: "Access to Aircraft Involved in an Accident",
  },
};

export const subject = {
  slug: "air-law",
  title: "Air Law",
  deck: "air-law",
  repairSlide: (blocks, context) => repairSlide(blocks, { ...context, tables: TABLES }),
  isRejectedImage,
  isUpsideDown,

  // The per-slide repair tables, exposed so the conservation test can tell a
  // hand-checked correction from a rewrite: a block whose words differ from
  // the slide's is a failure unless a substitution written down here is why.
  repairs: TABLES,

  skip: {
    1: "The deck cover: the subject name, with no teaching on it.",
    2: "The exam format — 70 minutes, 35 questions, NZAIP Vol 4 permitted. It belongs on the course page rather than in a lesson, and it is there.",
    3: "Section divider announcing “Aviation Legislation”. The name is kept as course structure; the slide carries nothing else.",
    29: "Section divider announcing “Licences and Ratings”.",
    56: "Section divider announcing “Competency & Currency”.",
    63: "Section divider announcing “Medical Requirements”.",
    69: "Section divider announcing “Definitions and Documentation”.",
    97: "Section divider announcing “Aircraft Maintenance”.",
    109: "Section divider announcing “Instruments and Avionics”.",
    115: "Section divider announcing “Equipment”.",
    126: "Section divider announcing “General Operating Requirements”.",
    145: "Section divider announcing “Operations at Aerodromes”.",
    160: "Section divider announcing “Right of Way Rules”.",
    174: "Section divider announcing “General Operating Restrictions”.",
    198: "Section divider announcing “VFR Meteorological Minima”.",
    205: "Section divider announcing “Carriage of Dangerous Goods”.",
    220: "Section divider announcing “Flight Preparation”.",
    223: "Section divider announcing “Fuel Requirements”.",
    227: "Section divider announcing “Flight Plans”.",
    233: "Section divider announcing “Communications”.",
    242: "Section divider announcing “Clearances”.",
    247: "Section divider announcing “Separation”.",
    254: "Section divider announcing “Radar Services”.",
    264: "Section divider announcing “Altimetry”.",
    276: "Section divider announcing “Cruising Levels”.",
    284: "Section divider announcing “Transponders”.",
    289: "Section divider announcing “Airspace”.",
    322: "Section divider announcing “Aerodromes”.",
    345: "Section divider announcing “Aerodrome Lighting”.",
    365: "Section divider announcing “Incidents and Accidents”.",
    376: "Section divider announcing “Communications and Equipment”.",
  },

  chapters: [
    {
      title: "Aviation Legislation",
      syllabus: ["4.2", "4.4", "4.6"],
      intro:
        "Where the rules come from, who writes each kind, and how a pilot is " +
        "supposed to find out that one has changed. Everything else in this " +
        "subject is a rule; this chapter is the machinery that produces them.",
      topics: [
        {
          title: "The Organisations",
          pages: [4, 5, 6],
          intro:
            "The CAA, ASPEQ and the National Briefing Office — three bodies with " +
            "very different jobs that a student pilot meets in the first month.",
        },
        {
          title: "Promulgation of Orders",
          pages: [7],
          intro:
            "The chain by which a decision becomes something you are required to " +
            "know.",
          takeaway:
            "The list on this slide is worth learning as a hierarchy rather than a " +
            "list. An Act is passed by Parliament, rules are made under the " +
            "authority of that Act, and advisory material explains how to comply " +
            "with the rules. What sits higher in the chain always wins, and knowing " +
            "the order tells you which document answers which kind of question.",
        },
        {
          title: "The Civil Aviation Act",
          pages: [8],
          intro:
            "The document at the top: what it does and who produced it.",
          diagramNotes: {
            8: "The title page of the Civil Aviation Act 2023, showing the date of assent and the commencement provision.",
          },
          keyPoints: [
            "An aviation document — a licence, a rating, a certificate — is issued only to a person the Director is satisfied is a fit and proper person, and it stays conditional on that remaining true.",
            "In deciding it, the Director must have regard to the person's history of compliance with transport safety and security requirements, in New Zealand or anywhere else.",
            "To their related experience in the transport industry, and to their knowledge of the civil aviation regulatory requirements.",
            "To any history of physical or mental health problems, or serious behavioural problems.",
            "To their use of drugs or alcohol.",
            "To any conviction for a transport safety offence, or an offence under the Health and Safety at Work Act — wherever the conviction was, and whether or not the offence predates the Act.",
            "And to any evidence of a transport safety offence or of failing to comply with civil aviation legislation, whether or not it led to a conviction.",
            "The list is not exhaustive: the Director may take any other relevant matter into account, and weighs each against how much involvement in the civil aviation system the person is asking for.",
          ],
          context:
            "The fit and proper person test is worth more attention than its two " +
            "words on the slide suggest, because it is the mechanism the whole " +
            "document system hangs on. It is not a one-off check at issue: it is " +
            "a condition of every current aviation document, so it can be " +
            "revisited at any time, and the matters the Director weighs reach " +
            "well beyond flying — health, alcohol and drug use, and convictions " +
            "in any transport context or under health and safety law. The " +
            "criteria were restated in the Civil Aviation Act 2023 and differ " +
            "slightly from the 1990 Act they replaced.",
        },
        {
          title: "Civil Aviation Rules",
          pages: [9, 10],
          intro:
            "The Parts, how they are numbered, and how to find the one you want.",
          diagramNotes: {
            10: [
              "The subparts of Part 61 — general, aircraft type ratings, student pilots, private, commercial and airline transport pilot licences, instructor ratings, and the specialist ratings — as they are listed in the rule.",
              "The Parts themselves, from Part 1 Definitions and Abbreviations through certification, maintenance and licensing to Part 63 Flight Engineer Licences.",
            ],
          },
        },
        {
          title: "Advisory Circulars",
          pages: [11, 12],
          intro:
            "What an AC is, what it is for, and the important thing it is not.",
          diagramNotes: {
            12: "The Advisory Circulars in the 61 series, one per licence or rating, each with the date it was issued.",
          },
          misconception:
            "Treating an Advisory Circular as a rule. An AC describes a means of " +
            "compliance that the Director has accepted — it tells you a way to " +
            "satisfy the rule, not the only way, and it is the rule itself that you " +
            "are obliged to meet. In practice following the AC is the simplest " +
            "route, which is exactly why it is easy to forget which document is " +
            "binding.",
        },
        {
          title: "The NZAIP",
          pages: [13, 14, 15],
          intro:
            "The Aeronautical Information Publication: who produces it, what is in " +
            "each volume, and the charts that come with it.",
          diagramNotes: {
            13: "The AIP New Zealand binders.",
          },
        },
        {
          title: "NOTAMs",
          pages: [16, 17, 18],
          intro:
            "Short-notice information: who issues it, what it covers, and the " +
            "different kinds.",
          diagramNotes: {
            17: "A page of NOTAMs as they are issued, showing the reference, the aerodrome, the validity period and the text of each.",
            18: "A trigger NOTAM: a short notice of an upcoming AIP amendment, pointing to the supplement that carries the detail.",
          },
        },
        {
          title: "Aeronautical Information Circulars",
          pages: [19, 20],
          intro:
            "The category that catches what a NOTAM cannot.",
          diagramNotes: {
            20: "The contents page of an AIC package, listing the circulars in force and the date each took effect.",
          },
          takeaway:
            "An AIC is the catch-all: information that affects flight safety, air " +
            "navigation or administration but does not qualify as a NOTAM, " +
            "because it is not urgent enough or not specific enough to one place. " +
            "It is where changes of procedure, seasonal warnings and explanatory " +
            "material live, and it is the part of the AIP a private pilot is " +
            "least likely to read and most likely to be surprised by.",
        },
        {
          title: "Currency of Documents",
          pages: [21],
          intro:
            "Amendment states, and the check that has to happen before the " +
            "document is any use.",
          takeaway:
            "An out-of-date document is more dangerous than no document, because " +
            "it answers your question confidently and wrongly. Checking the " +
            "amendment state is a thirty-second habit that decides whether " +
            "everything you look up afterwards is worth anything.",
        },
        {
          title: "Definitions and Abbreviations",
          pages: [22, 23],
          intro:
            "Why the ordinary meaning of a word is not the aviation meaning, and " +
            "where the official lists live.",
        },
        {
          title: "Units of Measurement",
          pages: [24, 25],
          intro:
            "The units New Zealand aviation uses, quantity by quantity.",
          context:
            "The list looks like something to skim, and it holds one trap worth " +
            "stopping on: bearings in New Zealand aviation are magnetic, but the " +
            "MetService gives wind direction in degrees true. Every forecast wind " +
            "therefore has to be converted before it is used against a runway " +
            "direction or a magnetic track, and the difference in New Zealand is " +
            "large enough to matter.",
        },
        {
          title: "The Time System",
          pages: [26],
          intro:
            "UTC, and the day it belongs to.",
          diagramNotes: {
            26: "A clock face showing the twenty-four hour convention used for aviation times.",
          },
        },
        {
          title: "Aircraft Operation and the Rule Parts",
          pages: [27],
          intro:
            "Which Part an operation falls under, and what decides it.",
          diagramNotes: {
            27: "A decision tree from CAR Part 91: the operations Part 91 covers, and the branches leading to the agricultural, aerial work and air transport Parts.",
          },
        },
        {
          title: "Offences and Penalties",
          pages: [28],
          intro:
            "What the Act says about operating an aircraft, and what follows if " +
            "you do not.",
        },
      ],
    },

    {
      title: "Licences and Ratings",
      syllabus: ["4.10", "4.12"],
      intro:
        "What a licence is, what it lets you do, and the several ratings that " +
        "sit on top of it. The chapter is long because the privileges and the " +
        "limitations are examined in detail, and because the definitions at the " +
        "front of it are used everywhere afterwards.",
      topics: [
        {
          title: "Licensing Definitions",
          pages: [30, 31, 32],
          intro:
            "Appropriate, dual flight time, night — three terms whose ordinary " +
            "meaning is not the legal one.",
          context:
            "The definition of night is the one that catches people out. It is not " +
            "sunset to sunrise and it is not darkness: it runs from the end of " +
            "evening civil twilight to the beginning of morning civil twilight, " +
            "which are calculated times published in the AIP. A flight that lands " +
            "after evening civil twilight has ended is a night flight in law, with " +
            "everything that follows for currency, ratings and equipment.",
        },
        {
          title: "Licences",
          pages: [33, 34],
          intro:
            "The requirement to hold one, the exception, and the note about " +
            "alcohol and drug convictions.",
        },
        {
          title: "Ratings",
          pages: [35],
          intro:
            "The ratings available, and what each one adds.",
        },
        {
          title: "Written Examinations",
          pages: [36],
          intro:
            "What you have to produce to sit one.",
        },
        {
          title: "Pilot Logbooks",
          pages: [37, 38, 39],
          intro:
            "What must be recorded, how soon, and what happens when the Director " +
            "wants to see it.",
          context:
            "This is a long rule and it answers four separate questions, which is " +
            "the easiest way to hold it. What is recorded: flight time and " +
            "instrument time, in ink, in an approved logbook. How soon: within a " +
            "set period after the flight, longer for private operations than for " +
            "hire or reward, and extended again when you are flying away from " +
            "where the logbook lives. How long it is kept: at least twelve months " +
            "from the last entry. And what a lost logbook costs you - flight time " +
            "in a logbook that no longer exists is credited only if it can be " +
            "verified some other way, which is why the record matters as much as " +
            "the flying it records.",
        },
        {
          title: "Student Pilots",
          pages: [40, 41, 42],
          intro:
            "Dual flight, the requirements for solo, and the limitations that " +
            "apply until a licence is issued.",
          takeaway:
            "Every one of these conditions has to be true at once before a " +
            "student flies solo, and three of them expire: the dual instruction " +
            "within the last five hours, the piloting experience within the " +
            "preceding thirty days, and the medical. A student who has been away " +
            "for six weeks has not broken a rule by being away, but has stopped " +
            "meeting one of the conditions, and the instructor's authorisation is " +
            "what puts it right.",
        },
        {
          title: "The Private Pilot Licence",
          pages: [43, 44],
          intro:
            "The eligibility requirements: age, medical, experience and " +
            "examinations.",
        },
        {
          title: "PPL Privileges and Limitations",
          pages: [45, 46, 47],
          intro:
            "What the licence authorises, what it does not, and the rules about " +
            "remuneration.",
          takeaway:
            "Almost every question in this area is really the same question: is " +
            "somebody paying you, and for what? The privileges hinge on it, the " +
            "cost-sharing rules exist because of it, and the line between a private " +
            "flight and an air operation is drawn along it.",
          keyPoints: [
            "A licence holder relying solely on a current DL9 medical must not act as pilot-in-command or co-pilot of an aircraft operated for remuneration or hire or reward.",
            "Nor of an aeroplane or helicopter with a maximum certificated take-off weight above 2,730 kg, or one carrying more than five passengers.",
            "Nor of an aircraft at night more than 25 NM from a lit aerodrome, or under IFR, whatever night or instrument privileges the licence itself carries.",
            "Nor of an aircraft performing aerobatics or spinning below 3,000 ft AGL or with a passenger on board, whatever aerobatic rating is held.",
            "Nor of an aircraft conducting agricultural operations, banner or drogue towing below 500 ft AGL, or parachute operations above 10,000 ft AMSL.",
            "Operating into or out of a controlled aerodrome requires radio contact with the ATS unit at all times, unless a colour vision deficiency test has been passed and ATS approves the operation.",
            "And a New Zealand registered aircraft may not be operated outside New Zealand airspace unless the foreign country permits it.",
          ],
          context:
            "There are two medical routes to a private pilot licence in New " +
            "Zealand: a CAA Class 2 medical certificate, or a Land Transport DL9 " +
            "medical certificate at class 2 with a passenger endorsement. The DL9 " +
            "is a genuine alternative and it is cheaper to obtain, and it costs " +
            "privileges — the list above is what a licence holder gives up by " +
            "relying on it alone. The limitations apply to the licence holder, " +
            "not to the aircraft, so they follow you into any aeroplane you fly.",
        },
        {
          title: "PPL Currency",
          pages: [48],
          intro:
            "What has to keep being true for the licence to stay current.",
        },
        {
          title: "Aircraft Type Ratings",
          pages: [49, 50],
          intro:
            "The requirements, and how the rating is recorded once it is issued.",
        },
        {
          title: "The Aerobatics Rating",
          pages: [51, 52, 53],
          intro:
            "The requirements to hold one, and the heights it does and does not " +
            "allow.",
          diagramNotes: {
            53: [
              "The upper band, above 3,000 feet AGL.",
              "The band between 1,500 and 3,000 feet AGL.",
              "The band below 1,500 feet AGL.",
              "The ground.",
            ],
          },
        },
        {
          title: "Examination for Proficiency",
          pages: [54],
          intro:
            "The Director's power to require one, and what it means for a licence " +
            "holder.",
        },
        {
          title: "Cost Sharing",
          pages: [55],
          intro:
            "Where a private flight stops being private, and the arithmetic that " +
            "decides it.",
        },
      ],
    },

    {
      title: "Competency and Currency",
      syllabus: ["4.14"],
      intro:
        "Holding a licence and being allowed to use it are two different " +
        "things. This chapter is the recent-experience requirements that stand " +
        "between them.",
      topics: [
        {
          title: "Recent Flight Experience — Day",
          pages: [57],
          intro:
            "What a private pilot must have done recently to carry passengers by " +
            "day.",
        },
        {
          title: "Recent Flight Experience — Night",
          pages: [58],
          intro:
            "The additional requirement that applies at night.",
        },
        {
          title: "Maintenance of Pilot Skills",
          pages: [59, 60],
          intro:
            "The periodic check, and who is exempt from it.",
        },
        {
          title: "Using a Lower Licence or Rating",
          pages: [61],
          intro:
            "What a pilot who has fallen out of currency at one level may still " +
            "do at another.",
        },
        {
          title: "Lapsed Licences",
          pages: [62],
          intro:
            "What happens when the privileges have not been exercised for a long " +
            "time.",
        },
      ],
    },

    {
      title: "Medical Requirements",
      syllabus: ["4.16"],
      intro:
        "The medical certificate classes, how long each lasts, and the " +
        "obligation that sits on the holder between examinations.",
      topics: [
        {
          title: "The Requirement",
          pages: [64],
          intro:
            "Why a medical standard exists in law, and the rule Part that sets it.",
        },
        {
          title: "Class 1 Medical",
          pages: [65],
          intro:
            "The validity periods, and how they change with age.",
        },
        {
          title: "Class 2 Medical",
          pages: [66],
          intro:
            "The class a private pilot holds, and how long it lasts.",
          takeaway:
            "Sixty months under 40 and twenty-four months from 40 is the pattern " +
            "every class follows: the older you are, the more often the CAA wants " +
            "to look at you. The age that counts is your age on the date of the " +
            "examination, not the date you happen to fly — so a certificate " +
            "issued the month before your fortieth birthday runs its full term.",
        },
        {
          title: "Class 3 Medical",
          pages: [67],
          intro:
            "The third class, and who needs it.",
          context:
            "Class 3 is the air traffic controller's medical, which is why it " +
            "appears in a pilot's syllabus at all: the examination can ask you to " +
            "tell the three apart. Class 1 is the commercial pilot's, Class 2 the " +
            "private pilot's, Class 3 the controller's, and the validity periods " +
            "differ between all three.",
        },
        {
          title: "Fitness Between Medicals",
          pages: [68],
          intro:
            "The obligation that applies on the day, regardless of what the " +
            "certificate says.",
          takeaway:
            "A current medical certificate is a statement about how you were on " +
            "the day you were examined. The rule that stops you flying when you are " +
            "unwell is separate from it and applies every single flight, which is " +
            "why a valid certificate is never an answer to “should I be flying " +
            "today”.",
        },
      ],
    },

    {
      title: "Definitions and Documentation",
      syllabus: ["4.4", "4.20"],
      intro:
        "What the words mean, what has to be in the aeroplane, and what each " +
        "of those documents certifies. This is the chapter the ramp check is " +
        "drawn from.",
      topics: [
        {
          title: "Definitions: Aircraft and Components",
          pages: [70, 71, 72, 73],
          intro:
            "Aircraft, aircraft component, helicopter, microlight — the categories " +
            "the rules are written against.",
          context:
            "A page of definitions is easy to skim and worth reading once " +
            "properly, because the rules that follow are written in these exact " +
            "words and mean exactly what is written here. Two are worth noticing. " +
            "Operate is far wider than fly - it covers causing or permitting an " +
            "aircraft to be used, or even to be in a place - so a rule about " +
            "operating an aircraft can bind somebody who never touched the " +
            "controls. And owner includes anyone lawfully entitled to possession " +
            "for twenty-eight days or longer, which puts a long-term hirer under " +
            "obligations that look at first sight as though they belong to the " +
            "person on the register.",
        },
        {
          title: "Documents to Be Carried",
          pages: [74],
          intro:
            "The list that must be in the aircraft before it is operated.",
          takeaway:
            "Learn this list as a list. It is the most directly examinable thing in " +
            "the chapter, it is the first thing an inspector asks for, and every " +
            "item on it is explained in the topics that follow.",
        },
        {
          title: "The Certificate of Registration",
          pages: [75, 76],
          intro:
            "What registration does, and what the certificate records.",
          diagramNotes: {
            76: "A New Zealand Certificate of Registration, showing the registration mark, the aircraft manufacturer and model, the serial number and the registered owner.",
          },
        },
        {
          title: "The Airworthiness Certificate",
          pages: [77, 78, 79],
          intro:
            "What it is issued against, what it permits, and the narrow " +
            "circumstances in which an aircraft may be flown without one.",
          takeaway:
            "Three things travel together and are easy to confuse. The type " +
            "certificate approves a design. The airworthiness certificate is " +
            "issued to one individual aircraft against that design. The category " +
            "on that certificate - standard, restricted or special - decides what " +
            "the aircraft may be used for. A perfectly airworthy aeroplane in the " +
            "wrong category for the operation is still not legal for it.",
        },
        {
          title: "Standard Category",
          pages: [80],
          intro:
            "The category most aircraft hold, and what it allows.",
          diagramNotes: {
            80: "A standard category New Zealand Airworthiness Certificate, showing the category, the flight manual reference and the period of validity.",
          },
          context:
            "Almost every aeroplane a private pilot will fly is in the standard " +
            "category, which is why the slide says so little about it: it is the " +
            "ordinary case, and the categories that follow are the exceptions. " +
            "What it buys is breadth. A standard category certificate does not " +
            "tie the aircraft to one kind of work, so the limits on a flight come " +
            "from the flight manual and the rules rather than from the " +
            "certificate itself.",
        },
        {
          title: "Restricted Category",
          pages: [81, 82],
          intro:
            "The category and the operating limitations that come with it.",
          diagramNotes: {
            81: "A restricted category Airworthiness Certificate, with the category and the operating limitations noted on the face of it.",
          },
        },
        {
          title: "Special Category",
          pages: [83],
          intro:
            "Aircraft that meet neither of the other two, and how they are " +
            "handled.",
          diagramNotes: {
            83: "Warbirds in formation — aircraft typically operated in the special category.",
          },
        },
        {
          title: "Special Flight Permits",
          pages: [84, 85, 86],
          intro:
            "The permit for a specific flight, and the limits attached to it.",
          diagramNotes: {
            86: "The rule text on standard and restricted category certificates issued to helicopters operating on external loads.",
          },
          context:
            "A special flight permit is the answer to a narrow problem: an " +
            "aircraft that is safe to fly but cannot at that moment meet the " +
            "requirements for an airworthiness certificate - a new aircraft being " +
            "delivered, one being flown to maintenance, or one on a test flight. " +
            "It is issued for a specific flight or series of flights, with " +
            "conditions attached, and it is not a way of operating an unairworthy " +
            "aeroplane in the ordinary run of things.",
        },
        {
          title: "The Technical Log",
          pages: [87, 88],
          intro:
            "What it tells the pilot before a flight, and what has to be entered " +
            "in it.",
          diagramNotes: {
            87: "A technical log in its holder in the aircraft, with the flight entries and defect columns visible.",
          },
        },
        {
          title: "The Flight Manual",
          pages: [89],
          intro:
            "Who writes it, what it contains, and why it is the final word on the " +
            "aeroplane.",
        },
        {
          title: "Aircraft Markings",
          pages: [90],
          intro:
            "What has to be displayed on the aeroplane, and where.",
          diagramNotes: {
            90: "A helicopter with its registration marking on the tail boom, circled.",
          },
        },
        {
          title: "Callsigns",
          pages: [91, 92, 93, 94],
          intro:
            "The registration, and the three types of callsign built from it.",
        },
        {
          title: "Type Certificates",
          pages: [95, 96],
          intro:
            "What certifies a design rather than an individual aeroplane, and how " +
            "a foreign type is accepted here.",
          diagramNotes: {
            96: "The CAA's published list of accepted aeroplane types, each entry linking to the type acceptance report for that model.",
          },
        },
      ],
    },

    {
      title: "Aircraft Maintenance",
      syllabus: ["4.22"],
      intro:
        "Whose job maintenance is, the short list of tasks a pilot may do, and " +
        "the paperwork that has to exist before the aeroplane flies again.",
      topics: [
        {
          title: "The Operator's Responsibility",
          pages: [98, 99],
          intro:
            "What the operator must ensure, including the replacement times a " +
            "manufacturer publishes.",
        },
        {
          title: "Pilot Maintenance",
          pages: [100, 101],
          intro:
            "Who may do it, and the list of tasks it covers.",
          diagramNotes: {
            100: "Maintenance being carried out on a propeller — the kind of work that is not pilot maintenance.",
          },
          misconception:
            "Reading the pilot maintenance list as a starting point rather than a " +
            "boundary. It is exhaustive: anything not on it is maintenance that " +
            "requires a licensed engineer, however simple it looks and however " +
            "confident you are with a spanner.",
        },
        {
          title: "Release to Service",
          pages: [102, 103],
          intro:
            "The entry that puts an aircraft back into service, and the rule about " +
            "flying before it exists.",
          diagramNotes: {
            102: "A certificate of release to service, with the description of the work, the airworthiness statement and the signature of the person issuing it.",
          },
        },
        {
          title: "Certification and Documents Under Part 91",
          pages: [104],
          intro:
            "What must be current before an aircraft is operated.",
        },
        {
          title: "Altimeter and Static System Tests",
          pages: [105],
          intro:
            "The periodic test, and what it covers.",
          takeaway:
            "Two conditions, and the second is the one that catches people: the " +
            "test is due every twenty-four calendar months and again after any " +
            "maintenance on the system. A static port sealed for painting or a " +
            "line disturbed during an inspection puts the aeroplane out of " +
            "certification until the test is repeated, whatever the calendar " +
            "says.",
        },
        {
          title: "Transponder Requirements",
          pages: [106],
          intro:
            "When one is required, and the testing that goes with it.",
        },
        {
          title: "ELT Tests and Inspections",
          pages: [107, 108],
          intro:
            "The inspection requirement, and the rules about testing one.",
          takeaway:
            "The instruction never to test an ELT in flight is absolute, and the " +
            "reason is that every test on the emergency frequency is " +
            "indistinguishable from a real distress signal until somebody has spent " +
            "time proving otherwise. Testing on the ground is done to a published " +
            "procedure and inside a published window for exactly the same reason.",
        },
      ],
    },

    {
      title: "Instruments, Avionics and Equipment",
      syllabus: ["4.24", "4.26"],
      intro:
        "What has to be fitted, what has to be carried, and what happens when " +
        "one of those things stops working. The requirements change with the " +
        "kind of flight, so the useful question is always “which operation is " +
        "this”.",
      topics: [
        {
          title: "Minimum Equipment for Powered Aircraft",
          pages: [110, 111],
          intro:
            "The Part 91 list for an aircraft with an Airworthiness Certificate.",
        },
        {
          title: "Night VFR Instruments and Equipment",
          pages: [112],
          intro:
            "What is added to the day list before a flight at night.",
        },
        {
          title: "Radio Equipment",
          pages: [113],
          intro:
            "What a VFR aircraft in controlled airspace must be equipped with.",
        },
        {
          title: "Communication and Navigation Equipment Over Water",
          pages: [114],
          intro:
            "The requirement that starts at a distance from the shore.",
        },
        {
          title: "Safety Equipment Over Water",
          pages: [116, 117, 118],
          intro:
            "Life jackets, rafts, and the distances at which each becomes " +
            "required.",
          diagramNotes: {
            118: "The over-water equipment requirements as bands of distance from shore, with the single-engine and multi-engine cases shown against each.",
          },
          takeaway:
            "The requirements step up with distance from shore and with what the " +
            "aircraft can do if the engine stops - a multi-engine aeroplane that " +
            "can hold height on one engine is treated differently from one that " +
            "cannot. Work the requirement out from the route rather than the " +
            "aeroplane: a coastal flight that cuts a corner across a bay can " +
            "cross the distance threshold without ever feeling like an over-water " +
            "flight.",
        },
        {
          title: "Emergency Equipment",
          pages: [119, 120, 121],
          intro:
            "First aid kits, hand-held fire extinguishers and megaphones, each " +
            "scaled to the number of passenger seats.",
          diagramNotes: {
            119: "Table 7: the number of first aid kits required against certificated passenger seating capacity.",
            120: "Table 8: hand-held fire extinguishers — where each must be located, and how many are required against passenger seating capacity.",
            121: "Table 9: megaphones required against passenger seating capacity, and where in the cabin each must be carried.",
          },
          takeaway:
            "All three tables scale with certificated passenger seating capacity, " +
            "and all three start above the size of aeroplane a private pilot " +
            "flies. The point of learning them is the shape rather than the rows: " +
            "the requirement steps up in bands as the cabin gets bigger, and " +
            "where each item has to be stowed matters as much as how many are " +
            "carried, because equipment nobody can reach is equipment that is not " +
            "there.",
        },
        {
          title: "Emergency Locator Transmitters",
          pages: [122],
          intro:
            "The carriage requirement, and the aircraft that are excepted from it.",
          diagramNotes: {
            122: [
              "An automatic fixed ELT of the type installed in an aircraft.",
              "A portable ELT with its own antenna, of the type carried in a survival kit.",
            ],
          },
        },
        {
          title: "Fuel and Oil Markings",
          pages: [123],
          intro:
            "What has to be marked where, and the reason the units are on the " +
            "placard.",
          diagramNotes: {
            123: "A filler cap placard: the minimum grade of aviation gasoline and the capacity of the tank in US gallons.",
          },
        },
        {
          title: "Instruments and Equipment by Operation",
          pages: [124],
          intro:
            "The minimum requirements, arranged by the kind of operation being " +
            "flown.",
        },
        {
          title: "Inoperative Instruments and Equipment",
          pages: [125],
          intro:
            "What may be done when something is unserviceable and there is no " +
            "minimum equipment list.",
        },
      ],
    },

    {
      title: "General Operating Requirements",
      syllabus: ["4.30", "4.80"],
      intro:
        "The pilot-in-command: what the role carries, what it obliges, and " +
        "what authority comes with it. Most of this chapter is Part 91, and " +
        "most of it is about responsibility rather than procedure.",
      topics: [
        {
          title: "Crew Members",
          pages: [127],
          intro:
            "The minimum crew, and what decides it.",
        },
        {
          title: "Simulated Instrument Flight",
          pages: [128],
          intro:
            "The safeguards required before flying under the hood in visual " +
            "conditions.",
        },
        {
          title: "Safety of the Aircraft",
          pages: [129],
          intro:
            "What the pilot-in-command must be satisfied of before flight.",
        },
        {
          title: "Authority of the Pilot-in-Command",
          pages: [130],
          intro:
            "The commands the role allows, and over whom.",
        },
        {
          title: "Responsibilities of the Pilot-in-Command",
          pages: [131, 132, 133],
          intro:
            "What the Act makes the pilot-in-command responsible for, and what it " +
            "says about breaching a rule in an emergency.",
          context:
            "The emergency provision is the part of this chapter worth " +
            "understanding rather than memorising. The Act does not hand a pilot a " +
            "licence to ignore the rules; it recognises that a genuine emergency " +
            "can make compliance impossible, and it attaches an obligation to " +
            "report what was done afterwards. Authority and accountability arrive " +
            "in the same sentence, which is the shape of the whole role.",
        },
        {
          title: "Nomination of the Pilot-in-Command",
          pages: [134],
          intro:
            "Who decides, and when it has to be decided.",
        },
        {
          title: "Seats and Safety Belts",
          pages: [135, 136],
          intro:
            "What has to be fitted, and when passengers must be using it.",
        },
        {
          title: "Oxygen",
          pages: [137, 138],
          intro:
            "The altitudes at which oxygen must be installed and used, and the " +
            "different requirements for crew and passengers.",
          diagramNotes: {
            138: "A pilot wearing a supplemental oxygen mask in the cockpit.",
          },
        },
        {
          title: "The Passenger Brief",
          pages: [139, 140],
          intro:
            "Who gives it, what it covers, and what passengers are required to do " +
            "in response.",
        },
        {
          title: "Operating Limitations",
          pages: [141],
          intro:
            "The requirement to operate within the limitations, and where those " +
            "limitations are published.",
        },
        {
          title: "Familiarity with Emergency Equipment",
          pages: [142],
          intro:
            "What the pilot-in-command must know before beginning a flight.",
          context:
            "Read this list as three different documents in three different " +
            "places. The flight manual is the book; the operating limitations are " +
            "on placards and in the instrument markings in front of you; the " +
            "emergency procedures and equipment are in the aeroplane itself. A " +
            "pilot who has read the manual but has never found the fire " +
            "extinguisher has met one of the three.",
        },
        {
          title: "Pre-Flight Responsibilities",
          pages: [143, 144],
          intro:
            "The information that must be obtained, including the performance data " +
            "for the day.",
        },
      ],
    },

    {
      title: "Operations at Aerodromes",
      syllabus: ["4.76"],
      intro:
        "How aerodrome traffic is organised, at the three kinds of aerodrome a " +
        "private pilot uses: controlled, flight service, and unattended. The " +
        "circuit and the overhead join are the heart of it.",
      topics: [
        {
          title: "Use of Aerodromes",
          pages: [146],
          intro:
            "What makes a place suitable, and the rule that governs using one.",
        },
        {
          title: "Aerodrome Traffic Rules",
          pages: [147],
          intro:
            "What is expected of a pilot in the vicinity of any aerodrome.",
        },
        {
          title: "Controlled Aerodromes",
          pages: [148],
          intro:
            "The communication requirement, and what “unless otherwise instructed” " +
            "covers.",
        },
        {
          title: "Flight Service Aerodromes",
          pages: [149, 150],
          intro:
            "What the service provides, and what a radio-equipped aircraft must " +
            "do.",
          diagramNotes: {
            150: [
              "Figure 4-2: the areas of an aerodrome — the landing area, the manoeuvring area, the movement area and the apron — drawn as nested regions with the definition of each.",
              "The same areas labelled on the plan of an aerodrome.",
            ],
          },
        },
        {
          title: "General Aerodrome Operations",
          pages: [151, 152],
          intro:
            "Operating where runways are defined and promulgated, and the taxiing " +
            "conventions that go with it.",
          diagramNotes: {
            152: "The keep-right conventions: leave room on the right for following aircraft to land and to take off, land to the right of aircraft landing ahead, take off to the right of aircraft taking off ahead, and give way when taxiing.",
          },
        },
        {
          title: "The Circuit",
          pages: [153],
          intro:
            "The definitions the circuit rules are written against.",
        },
        {
          title: "Circuit Joining",
          pages: [154, 155],
          intro:
            "The two ways of joining, and what each requires.",
          diagramNotes: {
            155: "Figure 4-5: a left-hand circuit including direct circuit joining procedures, showing the crosswind, downwind, base and final legs, the joining paths from each direction, and the non-traffic side.",
          },
        },
        {
          title: "The Standard Overhead Join",
          pages: [156, 157, 158],
          intro:
            "The procedure used at unattended aerodromes, step by step.",
          diagramNotes: {
            157: "Figure 4-6: the standard overhead circuit joining procedure, showing the arrival at 1,500 feet above aerodrome elevation, the descent on the non-traffic side to circuit height, and the join.",
            158: "The CAA's illustration of the standard overhead join, showing the whole procedure in three dimensions over an aerodrome.",
          },
          takeaway:
            "The overhead join exists to solve one problem: at an unattended " +
            "aerodrome you cannot know what is in the circuit until you have " +
            "looked. Arriving above circuit height and crossing the field gives you " +
            "the runway in use, the windsock and every aircraft below you before " +
            "you commit to anything.",
        },
        {
          title: "Aviation Events",
          pages: [159],
          intro:
            "What counts as one, and what changes when there is one on.",
        },
      ],
    },

    {
      title: "Right of Way Rules",
      syllabus: ["4.32"],
      intro:
        "Who gives way to whom, in the air and on the ground. The rules are " +
        "short, they are absolute, and every one of them starts from the same " +
        "sentence: you look out regardless.",
      topics: [
        {
          title: "The General Rule",
          pages: [161],
          intro:
            "The obligation that applies before any of the specific rules do.",
          takeaway:
            "The first line of the rule is the important one: when weather permits, " +
            "a pilot maintains vigilance to see and avoid other aircraft " +
            "regardless of whether the flight is under IFR or VFR and regardless of " +
            "who has right of way. Right of way decides who alters course; it never " +
            "decides who has to be looking.",
        },
        {
          title: "Head On",
          pages: [162],
          intro:
            "Two aircraft approaching each other, and the action both take.",
          diagramNotes: {
            162: "Two aircraft approaching head on, both turning right.",
          },
          misconception:
            "Thinking that one of the two has right of way. Neither does. Head on " +
            "is the only case where the rule puts the same obligation on both " +
            "pilots, and it works precisely because both do the same thing: each " +
            "alters heading to the right, so the two aeroplanes pass left side to " +
            "left side. Waiting to see what the other one does is the failure " +
            "mode.",
        },
        {
          title: "Converging",
          pages: [163],
          intro:
            "Two aircraft converging at about the same altitude, and which one " +
            "gives way.",
          diagramNotes: {
            163: "Two converging aircraft: the one with the other on its right gives way.",
          },
        },
        {
          title: "Overtaking",
          pages: [164],
          intro:
            "Who has right of way, and which side to pass on.",
          diagramNotes: {
            164: "An overtaking aircraft altering course to pass on the right of the aircraft being overtaken, which keeps right of way.",
          },
        },
        {
          title: "Landing",
          pages: [165],
          intro:
            "The priority an aircraft on approach has.",
        },
        {
          title: "Emergency Landing",
          pages: [166],
          intro:
            "The priority given to an aircraft compelled to land.",
          takeaway:
            "This is the one right-of-way rule with no conditions attached to it. " +
            "An aircraft compelled to land has priority over everything, " +
            "regardless of who was established first, who is higher, or what " +
            "stage of the approach anyone is at.",
        },
        {
          title: "Takeoff and Taxiing",
          pages: [167, 168],
          intro:
            "The rules on the ground and at the moment of departure.",
        },
        {
          title: "Operating Near Other Aircraft",
          pages: [169],
          intro:
            "The proximity rule, and formation flight.",
        },
        {
          title: "Aircraft Lighting",
          pages: [170, 171],
          intro:
            "What must be shown in a mandatory broadcast zone, and what must be " +
            "shown at night.",
        },
        {
          title: "Airport Security",
          pages: [172, 173],
          intro:
            "Identity documentation, security areas, and what applies where " +
            "security measures are in force.",
        },
      ],
    },

    {
      title: "General Operating Restrictions",
      syllabus: ["4.32"],
      intro:
        "The things a pilot may not do. Minimum heights, aerobatics, dropping " +
        "objects, towing, firearms — a long list with one theme, which is the " +
        "protection of people who did not choose to be part of the flight.",
      topics: [
        {
          title: "Interference with Aircraft",
          pages: [175],
          intro:
            "The offence, and what it covers.",
        },
        {
          title: "Smoking, Drugs and Alcohol",
          pages: [176],
          intro:
            "The offences relating to each.",
        },
        {
          title: "Electronic Devices",
          pages: [177],
          intro:
            "What may be operated on board, and who decides.",
        },
        {
          title: "Carriage of Firearms",
          pages: [178, 179],
          intro:
            "The general prohibition, its conditions, and the exceptions for " +
            "police and law enforcement.",
          diagramNotes: {
            178: [
              "The rule as written: a firearm may be carried in an aircraft only if it is stowed in a place inaccessible to every person during flight and is disabled, or is carried solely for the carriage of a person or group associated with it and is disabled.",
              "The paragraph permitting carriage where a firearm is to be used solely for the immobilisation of livestock for the safety of the aircraft or its occupants, with the conditions attached.",
              "The general prohibition: except as provided, no person may carry a firearm in an aircraft, cause one to be carried, or permit one to be carried.",
            ],
            179: [
              "The provision for firearms carried by police, law enforcement, military or Defence Force personnel performing an essential function.",
              "The conditions on approval by the Commissioner of Police and on the operator's obligation to inform the pilot-in-command of the number of persons carrying firearms.",
            ],
          },
          context:
            "The rule is shown as it is written because the exact wording is what " +
            "is examined, and a paraphrase of a rule is not the rule. Read it as " +
            "a prohibition with narrow exits: the default is that a firearm may " +
            "not be carried at all, and each numbered paragraph is a specific " +
            "case that lifts the prohibition on specific conditions - " +
            "inaccessible and disabled, or an agricultural need, or a police or " +
            "military duty with the Commissioner's approval. Meeting part of a " +
            "condition does not meet it.",
        },
        {
          title: "Discharge of Firearms",
          pages: [180],
          intro:
            "When a firearm may be discharged from an aircraft, and the conditions " +
            "on it.",
          diagramNotes: {
            180: [
              "The general prohibition on discharging a firearm on board an aircraft.",
              "The exception for the immobilisation of livestock and for shooting animals on the ground, with the conditions that the discharge must not hazard persons or property and must not be over a congested area or an open air assembly of persons.",
            ],
          },
          takeaway:
            "The prohibition on discharging a firearm from an aircraft is close " +
            "to absolute, and the exceptions are agricultural. Every one of them " +
            "carries the same two conditions - the discharge must not hazard " +
            "people or property, and it must not be over a congested area or an " +
            "open air assembly of persons - so the exceptions never reach the " +
            "situations where the risk to the public is highest.",
        },
        {
          title: "Baggage and Cargo",
          pages: [181, 182],
          intro:
            "Where baggage must be stowed for takeoff and landing, and why.",
          diagramNotes: {
            182: [
              "Cabin baggage stowed in an overhead locker.",
              "A bag restrained on a passenger seat by the seat belt.",
            ],
          },
        },
        {
          title: "Passenger Safety",
          pages: [183],
          intro:
            "Passengers who appear to be intoxicated or behaving unacceptably.",
        },
        {
          title: "Proximity and Dropping Objects",
          pages: [184, 185],
          intro:
            "Operating near other aircraft, and the rule about anything leaving " +
            "the aeroplane.",
        },
        {
          title: "Speed Restrictions",
          pages: [186],
          intro:
            "Where a speed limit applies, and what it is.",
        },
        {
          title: "Passengers Not to Be Carried",
          pages: [187],
          intro:
            "The operations on which passengers may not be carried.",
        },
        {
          title: "Minimum Safe Heights",
          pages: [188, 189],
          intro:
            "The heights below which you may not fly, over congested areas and " +
            "everywhere else.",
          diagramNotes: {
            189: "The two cases drawn side by side: over a congested area, high enough to make a safe forced landing and not lower than 1,000 feet above the area; elsewhere, not lower than 500 feet above the highest obstacle.",
          },
        },
        {
          title: "Exceptions to Minimum Heights",
          pages: [190, 191],
          intro:
            "The operations the height rules do not apply to, and the conditions " +
            "attached.",
        },
        {
          title: "Icing Conditions",
          pages: [192],
          intro:
            "The restriction on taking off under VFR when ice is a possibility.",
          misconception:
            "Reading this as a rule about flying into icing conditions. It is not " +
            "— it is a rule about the state of the aeroplane on the ground. Snow, " +
            "ice or frost adhering to a wing, stabiliser or control surface " +
            "prohibits the takeoff, and a thin layer of frost that you can see " +
            "the paint through is enough to do it. The contamination has to be " +
            "gone, not reduced.",
        },
        {
          title: "Aerobatic Flight",
          pages: [193],
          intro:
            "Where aerobatics may not be flown.",
        },
        {
          title: "Parachute Drop Operations",
          pages: [194, 195],
          intro:
            "What the pilot must hold, and the requirements on the aircraft.",
        },
        {
          title: "Towing",
          pages: [196, 197],
          intro:
            "Towing gliders, and towing anything else.",
        },
      ],
    },

    {
      title: "VFR Meteorological Minima",
      syllabus: ["4.34"],
      intro:
        "The weather a VFR flight is allowed to be in. It is a small chapter " +
        "with a table in the middle of it, and the table is one of the most " +
        "examinable things in the subject.",
      topics: [
        {
          title: "Visual Meteorological Conditions",
          pages: [199, 200, 201],
          intro:
            "The minima, by class of airspace: visibility, distance from cloud, " +
            "and the flight visibility required.",
          diagramNotes: {
            201: "The VMC minima drawn as a picture: each class of airspace with its required distance from cloud and flight visibility, and the low-level cases shown against the terrain.",
          },
          takeaway:
            "The table is easier to hold if you read it as a single idea with " +
            "exceptions: the more controlled the airspace and the higher you are, " +
            "the further you must stay from cloud, because the traffic you cannot " +
            "see is arriving faster. Learn the shape first and the numbers will " +
            "attach to it.",
        },
        {
          title: "Flight Visibility and Ceiling",
          pages: [202],
          intro:
            "Two terms that are measured differently and used together.",
          diagramNotes: {
            202: "Cloud layers at three heights with their coverage in oktas, and the ceiling identified as the base of the lowest layer covering more than half the sky.",
          },
        },
        {
          title: "Special VFR",
          pages: [203],
          intro:
            "VFR operations in a control zone below the normal minima, and what " +
            "they require.",
        },
        {
          title: "Aerodrome VFR Minima",
          pages: [204],
          intro:
            "What applies when the weather at an aerodrome falls below the " +
            "specified minima.",
        },
      ],
    },

    {
      title: "Carriage of Dangerous Goods",
      syllabus: ["4.36"],
      intro:
        "What may not be carried, what may be carried under conditions, and " +
        "the paperwork that goes with each. A private pilot meets this rule " +
        "most often through what a passenger has in a bag.",
      topics: [
        {
          title: "The Terms",
          pages: [206, 207],
          intro:
            "Technical Instructions, UN numbers, and the vocabulary the rule uses.",
          diagramNotes: {
            206: "The cover of ICAO Doc 9284, the Technical Instructions for the Safe Transport of Dangerous Goods by Air.",
            207: "A dangerous goods label: the UN number, the proper shipping name, the hazard class and the hazchem code.",
          },
        },
        {
          title: "The Requirements",
          pages: [208, 209],
          intro:
            "What must be true before dangerous goods are offered or accepted for " +
            "carriage.",
          diagramNotes: {
            209: [
              "The dangerous goods list as it is set out in the Technical Instructions: UN number, class, labels, packing instructions and quantity limits for passenger and cargo aircraft.",
              "The column headings of that list, showing what each field records.",
            ],
          },
        },
        {
          title: "Exceptions",
          pages: [210, 211],
          intro:
            "Carriage by police, and goods carried for the recreational use of " +
            "passengers.",
        },
        {
          title: "Carriage by Passengers and Crew",
          pages: [212],
          intro:
            "What a person on board may and may not have with them.",
        },
        {
          title: "Packaging, Labelling and Marking",
          pages: [213],
          intro:
            "The standard that applies, and where it comes from.",
        },
        {
          title: "Offering Goods for Carriage",
          pages: [214, 215],
          intro:
            "The declarations required for non-dangerous and for dangerous goods.",
        },
        {
          title: "Loading Restrictions",
          pages: [216],
          intro:
            "Where on the aircraft dangerous goods may and may not be carried.",
        },
        {
          title: "Damage and Leakage",
          pages: [217],
          intro:
            "What the operator must do when a package is found damaged.",
        },
        {
          title: "Information to the Pilot and to Passengers",
          pages: [218, 219],
          intro:
            "The form the pilot-in-command is given, and the notices that must be " +
            "displayed.",
        },
      ],
    },

    {
      title: "Flight Preparation and Fuel",
      syllabus: ["4.50", "4.54"],
      intro:
        "What the law requires you to know before you start, and how much " +
        "fuel it requires you to have. Both are pre-flight obligations, and " +
        "both are checked after an accident.",
      topics: [
        {
          title: "Planning of Flights",
          pages: [221, 222],
          intro:
            "The information the pilot-in-command must obtain and be familiar " +
            "with.",
        },
        {
          title: "Fuel Requirements",
          pages: [224],
          intro:
            "What Part 91 requires before beginning a VFR flight.",
          takeaway:
            "The rule sets a minimum, not a plan. It is written as fuel to reach " +
            "the destination plus a reserve, which means every unplanned diversion, " +
            "orbit and headwind comes out of the reserve. Planning to the legal " +
            "minimum is planning to arrive with nothing.",
        },
        {
          title: "Aircraft Fuelling",
          pages: [225, 226],
          intro:
            "The rules on fuelling with people on board, and where fuelling may " +
            "not be done.",
          diagramNotes: {
            225: "Rule 91.15 as written: the requirements on fuelling and defuelling, including the conditions on Class 3.1A, 3.1C and 3.1D flammable liquids while persons are embarking, on board or disembarking.",
          },
        },
      ],
    },

    {
      title: "Flight Plans",
      syllabus: ["4.56"],
      intro:
        "What a flight plan is for, when one must be filed, and the service " +
        "that exists because you filed it.",
      topics: [
        {
          title: "What a Flight Plan Does",
          pages: [228],
          intro:
            "The two objectives it achieves.",
        },
        {
          title: "Filing a VFR Flight Plan",
          pages: [229],
          intro:
            "The flights for which one must be filed.",
        },
        {
          title: "The Alerting Service",
          pages: [230],
          intro:
            "What is set in motion, and by whom, when an aircraft is overdue.",
        },
        {
          title: "Content of a VFR Flight Plan",
          pages: [231, 232],
          intro:
            "What must be in it, and what the pilot must do once it is filed.",
          takeaway:
            "The obligations that follow filing are the half that gets forgotten. " +
            "A plan filed and not terminated launches a search for an aeroplane " +
            "that is safely on the ground, and a plan filed and not updated sends " +
            "that search to the wrong place.",
        },
      ],
    },

    {
      title: "Communications",
      syllabus: ["4.60"],
      intro:
        "The services on the other end of the radio that are not air traffic " +
        "control, the position reports a VFR flight makes, and the signals " +
        "used when the radio has stopped working.",
      topics: [
        {
          title: "Services That Are Not Air Traffic Control",
          pages: [234, 235, 236, 241],
          intro:
            "Four things heard on a frequency, none of which is an air traffic " +
            "service: UNICOM, the aerodrome frequency response unit, the automatic " +
            "weather broadcast, and traffic information broadcast by the aircraft " +
            "themselves.",
          takeaway:
            "What these have in common is that nobody is separating anybody. They " +
            "supply information — an advisory, a confirmation that your " +
            "transmission was received, a weather report, another pilot's stated " +
            "position — and every decision made on that information stays with you. " +
            "Hearing one of them and behaving as though you are being controlled is " +
            "the mistake they are all capable of producing.",
        },
        {
          title: "Position Reports",
          pages: [237, 238],
          intro:
            "When a VFR flight reports, and what a report contains.",
        },
        {
          title: "Light Signals",
          pages: [239, 240],
          intro:
            "What a tower can say to an aircraft with no radio, and what each " +
            "signal means.",
        },
      ],
    },

    {
      title: "Clearances and Flight Information",
      syllabus: ["4.62"],
      intro:
        "What a clearance obliges you to do, what to do when you cannot " +
        "comply, and the information services available whether or not you are " +
        "being controlled.",
      topics: [
        {
          title: "Compliance with Clearances",
          pages: [243],
          intro:
            "The obligation, and what is required when a deviation becomes " +
            "necessary.",
        },
        {
          title: "Aerodrome Flight Information Service",
          pages: [244],
          intro:
            "What the service provides, and what it does not.",
          misconception:
            "Hearing an information service as a control service. AFIS and flight " +
            "information provide information and advice; they do not issue " +
            "clearances and they do not separate you from anything. The decision " +
            "and the responsibility stay with the pilot, which is a different " +
            "situation from the one a clearance puts you in.",
        },
        {
          title: "Flight Information",
          pages: [245, 246],
          intro:
            "What all ATS units provide, and who the main provider is in New " +
            "Zealand.",
        },
      ],
    },

    {
      title: "Separation",
      syllabus: ["4.63"],
      intro:
        "Who is separated from whom, by how much, and — for a VFR pilot — the " +
        "much more important question of when nobody is separating you from " +
        "anything at all.",
      topics: [
        {
          title: "The 12 Hour Clock Reference",
          pages: [248],
          intro:
            "How the direction of traffic is passed, and what it is relative to.",
          diagramNotes: {
            248: [
              "A clock face, used to give the direction of one aircraft from another.",
              "The aircraft at the centre of that clock, with twelve o'clock straight ahead.",
            ],
          },
        },
        {
          title: "ATC Separation",
          pages: [249],
          intro:
            "What is separated in each class of airspace, and the difference " +
            "between Class C and Class D.",
          takeaway:
            "The line to hold on to is that in Class G nobody is separating you " +
            "from anybody. Traffic information may be available and a service may " +
            "be provided, but the responsibility for not hitting anything is " +
            "entirely yours — which is the airspace most of a private pilot's " +
            "flying happens in.",
        },
        {
          title: "Visual Separation",
          pages: [250],
          intro:
            "The pilot's responsibility, and when it is the only separation there " +
            "is.",
        },
        {
          title: "Vertical Separation",
          pages: [251],
          intro:
            "The vertical distance that assures separation, and the level bands it " +
            "applies in.",
        },
        {
          title: "Horizontal Separation",
          pages: [252],
          intro:
            "Separation achieved by distance or by time.",
          context:
            "Three different things are all called horizontal separation, and a " +
            "controller may use whichever fits: a distance between aircraft, a " +
            "time interval between them, or a radar-measured distance. The " +
            "five-mile radar figure is the one worth remembering, because it is " +
            "the number behind most of the vectoring a VFR flight ever hears.",
        },
        {
          title: "Wake Turbulence",
          pages: [253],
          intro:
            "The separation minima published for arriving and departing aircraft " +
            "on the same runway.",
          diagramNotes: {
            253: "Table AD 1.6-4: time-based wake turbulence separation minima for arriving and departing flights in the same direction on one runway, by leading and following aircraft category.",
          },
          context:
            "The minima are stated as times rather than distances because what " +
            "matters is how long the vortices have had to sink and drift apart, " +
            "not how far behind you are. Two things follow for a light aircraft. " +
            "First, the table is written from the point of view of the following " +
            "aircraft, and the lightest category always waits longest. Second, a " +
            "published minimum is a minimum: a visual approach behind a heavy " +
            "aircraft on a still day is a place to add to it, not to accept it.",
        },
      ],
    },

    {
      title: "Radar Services",
      syllabus: ["4.66"],
      intro:
        "How the two kinds of radar work, what the national system is made " +
        "of, and what a VFR flight can ask it for.",
      topics: [
        {
          title: "Radar and VFR Flights",
          pages: [255],
          intro:
            "The services available to a VFR flight, and where.",
        },
        {
          title: "Control Centres",
          pages: [256],
          intro:
            "Which units provide area and approach control, and from where.",
          takeaway:
            "Most of the control of aircraft in New Zealand controlled airspace " +
            "comes from three radar-equipped centres rather than from the towers " +
            "you can see. That is why the frequency you are handed to often " +
            "belongs to a controller a hundred miles away, and why the service " +
            "available to you depends on radar coverage rather than on how close " +
            "an aerodrome is.",
        },
        {
          title: "The Two Kinds of Radar",
          pages: [257],
          intro:
            "Primary and secondary surveillance radar, and what separates them.",
          keyPoints: [
            "Primary Surveillance Radar (PSR) transmits a pulse and listens for the reflection off the aircraft itself, so it sees anything solid, with or without equipment on board.",
            "Secondary Surveillance Radar (SSR) interrogates the aircraft's transponder and reads the reply, so it sees only aircraft with a transponder switched on — but it gets identity and level with the position.",
            "The topics that follow take each apart; the difference between them is what decides what a controller can tell you about the traffic around you.",
          ],
        },
        {
          title: "Primary Surveillance Radar",
          pages: [258],
          intro:
            "Sending a signal and receiving a reflection — what that can and " +
            "cannot tell a controller.",
        },
        {
          title: "Secondary Surveillance Radar",
          pages: [259],
          intro:
            "Interrogation and reply, and what the reply carries.",
          context:
            "The difference between the two is worth holding clearly, because it " +
            "explains everything else in this chapter. Primary radar sees an echo " +
            "and knows only that something is there. Secondary radar asks a " +
            "question and gets an answer that includes the aircraft's identity and " +
            "its level — but only from an aircraft with a transponder that is " +
            "switched on. That is why transponder requirements and radar coverage " +
            "are taught together.",
        },
        {
          title: "Radar Coverage",
          pages: [260, 261, 262],
          intro:
            "Line of sight, the sites, and what the national system looks like.",
          diagramNotes: {
            260: "The line-of-sight limitation: coverage as a cone above each site, with low-level areas behind terrain unseen.",
            261: "Secondary surveillance radar coverage over New Zealand at three altitudes, showing how the covered area grows with height.",
            262: "The national radar system: nine sites feeding the primary and secondary radar pictures to the control centres.",
          },
        },
        {
          title: "What Radar Provides",
          pages: [263],
          intro:
            "The list of services, by airspace class.",
        },
      ],
    },

    {
      title: "Altimetry",
      syllabus: ["4.70"],
      intro:
        "Pressure settings and the vertical positions they produce. The " +
        "definitions come first because in this chapter the whole difficulty " +
        "is that four words all mean “how high”.",
      topics: [
        {
          title: "Altimetry Definitions",
          pages: [265, 266],
          intro:
            "Altitude, height, elevation and level — each measured from something " +
            "different.",
          diagramNotes: {
            266: "Altitude, height and elevation drawn against terrain: altitude always from mean sea level, height from any nominated point, elevation the height of a fixed point above mean sea level.",
          },
        },
        {
          title: "Altimeter Settings",
          pages: [267],
          intro:
            "What the subscale is set to below 13,000 feet.",
          context:
            "Below the transition altitude the subscale carries a real, measured " +
            "pressure, and which one depends on where you are: the aerodrome's " +
            "own QNH near an aerodrome, the area QNH for the zone you are " +
            "crossing between them. The point of the whole system is that " +
            "everybody in a given piece of sky is measuring from the same datum, " +
            "so that a thousand feet of separation is really a thousand feet.",
        },
        {
          title: "Aerodrome QNH",
          pages: [268],
          intro:
            "What it is, and what the altimeter reads when it is set.",
        },
        {
          title: "Area QNH Zones",
          pages: [269, 270],
          intro:
            "The zones, and the setting to use when you are between aerodromes.",
          diagramNotes: {
            269: "The area QNH zones over New Zealand.",
            270: "The vertical structure: aerodrome or zone QNH below the transition altitude, 1013.2 above the transition level, and the transition layer between them.",
          },
        },
        {
          title: "Aerodrome QFE",
          pages: [271],
          intro:
            "The setting that puts zero on the altimeter at the aerodrome, and " +
            "where it is used.",
          misconception:
            "Reading QFE as an alternative to QNH for normal flying. It is not " +
            "used for cruising or for separation in New Zealand — with QFE set " +
            "the altimeter reads zero on the aerodrome, so it reads height above " +
            "that aerodrome and nothing else, and it says nothing useful about " +
            "your clearance from terrain a few miles away. It is worth knowing " +
            "what the setting does; the setting you fly on is QNH.",
        },
        {
          title: "High Level Flight",
          pages: [272],
          intro:
            "Where altitudes stop and flight levels begin.",
          takeaway:
            "The change is not just a change of name. Below the transition " +
            "altitude you are flying an altitude measured from a real pressure " +
            "that changes with the weather; above the transition level you are " +
            "flying a flight level measured from a fixed 1013.2 hPa datum that " +
            "never changes. Two aircraft on flight levels are separated from each " +
            "other reliably, and neither of them knows its true height above the " +
            "sea.",
        },
        {
          title: "Transition Altitude, Level and Layer",
          pages: [273, 274, 275],
          intro:
            "The three terms, the direction each applies in, and the layer between " +
            "them.",
          misconception:
            "Treating the transition altitude and the transition level as the same " +
            "boundary seen twice. They are different values and they apply in " +
            "different directions: you change to the standard setting climbing " +
            "through the transition altitude, and back to QNH descending through " +
            "the transition level. The transition layer is the gap between them, " +
            "and it is not somewhere to cruise.",
        },
      ],
    },

    {
      title: "Cruising Levels",
      syllabus: ["4.72"],
      intro:
        "Which levels you may cruise at on a given track. It is a table, it " +
        "is memorised, and the exceptions to it are as examinable as the table " +
        "itself.",
      topics: [
        {
          title: "The Magnetic Track Rule",
          pages: [277, 278, 279],
          intro:
            "The requirement, and the levels it produces at and below 13,000 feet.",
          diagramNotes: {
            279: "The New Zealand table of cruising levels, giving the levels available for each band of magnetic track under IFR and VFR.",
          },
        },
        {
          title: "When the Table Does Not Apply",
          pages: [280],
          intro:
            "The aircraft and situations that are outside the rule.",
          diagramNotes: {
            280: "Three aircraft against rising terrain, with the boundary drawn as a dashed line that runs level over low ground and climbs to stay clear of the mountain. The aircraft above the line must comply with the magnetic track table; the one below it near the surface, and the one below it crossing the peak, do not. The point the drawing makes is that the boundary is not a single altitude — it is whichever of 3,000 feet AMSL and 1,000 feet above the ground is the higher, so it follows the terrain where the terrain is high. The label printed on the figure itself is superseded by the two the slide overlays on it.",
          },
        },
        {
          title: "Northerly and Southerly Tracks",
          pages: [281, 282],
          intro:
            "The two halves of the compass, and the levels each gives you.",
          diagramNotes: {
            281: "Southerly tracks — any magnetic track from 090°M through south to 269°M — with the levels available for level VFR flight above 3,000 feet AGL.",
            282: "Northerly tracks — any magnetic track from 270°M through north to 089°M — with the levels available for level VFR flight above 3,000 feet AGL.",
          },
          takeaway:
            "Two things make this stick. First, it is the magnetic track that " +
            "decides the level, not the heading — the wind may have the nose " +
            "pointing somewhere else, and the table does not care. Second, the " +
            "rule applies only in level cruising flight, and only above 3,000 feet " +
            "AMSL or 1,000 feet above the ground, whichever is the higher; a " +
            "training circuit, and a climb or descent through the band, are not " +
            "breaches of it.",
        },
        {
          title: "Non-Standard Levels",
          pages: [283],
          intro:
            "The provision for flying at a level the table does not give you.",
        },
      ],
    },

    {
      title: "Transponders",
      syllabus: ["4.74"],
      intro:
        "Where one is required, how the requirement is shown on a chart, and " +
        "the codes every pilot has to know without looking up.",
      topics: [
        {
          title: "Transponder Mandatory Airspace",
          pages: [285],
          intro:
            "The requirement, and what it applies to.",
        },
        {
          title: "Transponders on Charts",
          pages: [286],
          intro:
            "How transponder mandatory airspace is marked.",
          takeaway:
            "TM on a chart is a boundary you can be inside without noticing, " +
            "because unlike a control zone it needs no radio call to enter. Look " +
            "for it during chart preparation rather than in flight — the " +
            "equipment requirement applies from the moment you cross the line.",
        },
        {
          title: "Transponder Codes",
          pages: [287, 288],
          intro:
            "The permanently allocated codes, and the discrete codes a controller " +
            "assigns.",
          takeaway:
            "The permanently allocated codes are worth knowing cold, because the " +
            "situations they are for are the situations in which you will not have " +
            "time to look anything up. A code set correctly is also the fastest way " +
            "to tell everybody watching a radar screen what is happening to you " +
            "without saying a word.",
        },
      ],
    },

    {
      title: "Airspace",
      syllabus: ["4.75"],
      intro:
        "The classes, the volumes they are drawn as, and the special-use " +
        "airspace scattered between them. This is the longest chapter in the " +
        "subject and the one a cross-country flight uses most.",
      topics: [
        {
          title: "Classes of Airspace",
          pages: [290, 291, 292, 293],
          intro:
            "Classes A, C, D, E and G — clearance, separation and service in " +
            "each.",
          context:
            "Read the classes as answers to three questions, asked in the same " +
            "order every time: do I need a clearance, am I separated from anybody, " +
            "and what service will I get. Once the table is in that shape, the " +
            "difference between C and D is a single line rather than two " +
            "paragraphs, and Class G stops being an absence of rules and becomes a " +
            "specific set of them.",
        },
        {
          title: "Flight Information Regions",
          pages: [294, 295],
          intro:
            "What an FIR is, and the ones New Zealand is responsible for.",
          diagramNotes: {
            295: "The Auckland Oceanic FIR with the New Zealand domestic FIR inside it.",
          },
        },
        {
          title: "The Air Traffic Control Service",
          pages: [296],
          intro:
            "What the service is provided in order to do.",
        },
        {
          title: "Radios in Controlled Airspace",
          pages: [297],
          intro:
            "The equipment requirement, and the special cases.",
          context:
            "The rule and its exception are both worth holding. Controlled " +
            "airspace assumes two-way communication, so radio equipment is " +
            "required; a no-radio aircraft can still be accommodated, but only by " +
            "prior arrangement with ATC rather than by turning up. In Class G " +
            "neither applies — which is where the great majority of a private " +
            "pilot's flying is done, and where nobody is expecting to hear from " +
            "you unless a broadcast zone says otherwise.",
        },
        {
          title: "Control Zones",
          pages: [298, 299],
          intro:
            "What a CTR is, where it starts, and what shape it can be.",
          diagramNotes: {
            299: "Control zones drawn to suit the traffic, all of them starting at the surface, with the upper limits and transponder mandatory boundaries marked.",
          },
        },
        {
          title: "Control Areas",
          pages: [300, 301, 302],
          intro:
            "What a CTA is, and how it sits above and beside the zones.",
          diagramNotes: {
            301: "A cross-section through a control area and control zone at two aerodromes, with the lower and upper limits of each block marked.",
            302: "The same structure drawn in three dimensions: the CTA above, the CTR below it at the surface, a general aviation area alongside, and a VFR transit lane through it.",
          },
        },
        {
          title: "Airspace Boundaries",
          pages: [303],
          intro:
            "Which class applies at a common boundary between two of them.",
          misconception:
            "Assuming the stricter class wins at the boundary. It is the other " +
            "way round: at the common level between two classes stacked one above " +
            "the other, a pilot may comply with the requirements of the *less* " +
            "restrictive of the two. Flying exactly at the base of a control area " +
            "over Class G, the Class G requirements are enough.",
        },
        {
          title: "VFR Transit Lanes",
          pages: [304],
          intro:
            "Uncontrolled corridors through controlled airspace, and how they are " +
            "shown.",
          diagramNotes: {
            304: "A VFR transit lane on a visual navigation chart, with the lane shown as a blue line, its vertical limits, and the controlled airspace either side of it.",
          },
        },
        {
          title: "General Aviation Areas",
          pages: [305, 306],
          intro:
            "Areas established for training and gliding, and how they are " +
            "designated.",
          diagramNotes: {
            306: "A general aviation area in cross-section and plan: effectively Class G airspace inside a control area, with its upper and lower limits and the ATC approval it operates under.",
          },
        },
        {
          title: "Position Reports and Visual Reporting Points",
          pages: [307, 308],
          intro:
            "When a VFR flight reports in controlled airspace, and what a VRP is.",
        },
        {
          title: "ATC Hours of Service",
          pages: [309],
          intro:
            "What happens to the airspace when the unit is not operating.",
        },
        {
          title: "Restricted Areas and Military Operating Areas",
          pages: [310, 311],
          intro:
            "Why each is established, and what entering one requires.",
        },
        {
          title: "Mandatory Broadcast Zones",
          pages: [312, 313],
          intro:
            "What an MBZ protects, and the rule for aircraft without a radio.",
          diagramNotes: {
            313: "An MBZ on a chart, with the boundary, the vertical limits, the frequency and the broadcast interval.",
          },
        },
        {
          title: "Volcanic Hazard Zones",
          pages: [314],
          intro:
            "What they protect against, and where they are.",
        },
        {
          title: "Danger Areas",
          pages: [315],
          intro:
            "What they warn of, and how they are shown.",
          diagramNotes: {
            315: "A danger area on a chart, with its identifier, upper limit and activation note.",
          },
        },
        {
          title: "Low Flying Zones",
          pages: [316],
          intro:
            "What an LFZ is for, and what it permits.",
        },
        {
          title: "Common Frequency Zones",
          pages: [317, 318],
          intro:
            "The uncontrolled equivalent of the MBZ, and how it is shown.",
          diagramNotes: {
            318: "A common frequency zone on a chart, with its name, upper limit and frequency.",
          },
        },
        {
          title: "Temporary Airspace",
          pages: [319, 320],
          intro:
            "The Director's power to create airspace at short notice, and where it " +
            "is published.",
          diagramNotes: {
            320: "The legend of a visual navigation chart, showing the symbology used for every class of airspace and every kind of special use area.",
          },
        },
        {
          title: "Airspace Changes",
          pages: [321],
          intro:
            "How often charts change, and what that means for the one in your bag.",
          takeaway:
            "Airspace is the part of this subject with the shortest shelf life. A " +
            "chart is correct on the day it is published and drifts from then on, " +
            "which is why the amendment state and the NOTAMs are part of flight " +
            "preparation rather than an optional extra.",
        },
      ],
    },

    {
      title: "Aerodromes",
      syllabus: ["4.76"],
      intro:
        "The definitions used for the parts of an aerodrome, the categories " +
        "aerodromes fall into, and the services and priorities that operate at " +
        "them.",
      topics: [
        {
          title: "Aerodrome Definitions",
          pages: [323, 324, 325, 326],
          intro:
            "Aerodrome, runway strip, taxiway, manoeuvring area, movement area — " +
            "the words the rules are written in.",
          diagramNotes: {
            324: "A runway strip: the defined area symmetrically including the runway.",
            326: "Runway markings and designators on an aerodrome plan, with the runway dimensions and elevation.",
          },
          keyPoints: [
            "Aerodrome - any defined area of land or water intended or designed for the landing and take-off of aircraft.",
            "Runway strip - a defined area symmetrically including the runway, kept clear so that an aircraft leaving the runway has somewhere to go.",
            "Manoeuvring area - the part used for take-off and landing and the taxiing associated with it. It excludes the apron.",
            "Movement area - the manoeuvring area plus the apron: everything an aircraft moves on.",
            "The distinction that matters on the radio is the last two. A clearance to enter the manoeuvring area is not a clearance to be on the apron, and control of the apron is often somebody else's.",
          ],
        },
        {
          title: "Aerodrome Information",
          pages: [327],
          intro:
            "What makes a place usable as an aerodrome, and who decides.",
          takeaway:
            "The test is suitability for the aircraft concerned, and the person " +
            "who decides it is the pilot. There is no list of approved fields to " +
            "check against for an ordinary landing area: the obligation is to " +
            "satisfy yourself that the place will take the aeroplane you are " +
            "flying, on the day, in the conditions.",
        },
        {
          title: "Runway Designation",
          pages: [328],
          intro:
            "How runways are numbered, and what left, right and centre mean.",
          diagramNotes: {
            328: "Parallel runways designated 29L, 29 and 29R, with the magnetic heading each designator is derived from.",
          },
        },
        {
          title: "Obstruction Markers and Ground Signals",
          pages: [329, 330],
          intro:
            "The markers that identify unsafe areas, and the signals laid out on " +
            "the ground.",
          diagramNotes: {
            329: [
              "White crosses, placed on unsafe parts of the manoeuvring area or on the ends of unsafe portions of runways.",
              "White, yellow, red or orange marker boards and cones, placed on the edge of unsafe parts of the manoeuvring or movement area.",
            ],
            330: "Ground signals: the arrow of white fabric strips indicating gliding in progress, the red and white cone indicating parachute dropping, and the white letter A indicating agricultural operations.",
          },
          keyPoints: [
            "White crosses mark an unsafe part of the manoeuvring area, or the unsafe end of a runway. Do not use what is under them.",
            "White, yellow, red or orange marker boards and cones mark the edge of an unsafe area rather than the area itself.",
            "An arrow of white fabric strips means gliding is in progress and gliders are being towed off in the direction the arrow points.",
            "A red and white cone means parachute dropping is in progress.",
            "A white letter A means agricultural operations are being conducted, and those aircraft may not be following the circuit direction.",
          ],
        },
        {
          title: "Classification of Aerodromes",
          pages: [331],
          intro:
            "The categories New Zealand aerodromes are divided into.",
          context:
            "The split is certificated against non-certificated, and it decides " +
            "what you may assume. A certificated aerodrome is inspected against " +
            "Part 139 and its published information can be relied on. Everywhere " +
            "else — public and private strips alike — the surface, the obstacles " +
            "and the published details are your responsibility to check, which is " +
            "why the topics that follow deal with each kind separately.",
        },
        {
          title: "Certificated Aerodromes",
          pages: [332],
          intro:
            "What certification means, and the standards behind it.",
        },
        {
          title: "Non-Certificated Aerodromes",
          pages: [333, 334],
          intro:
            "Public and private, and the conditions on using each.",
        },
        {
          title: "Military Aerodromes",
          pages: [335],
          intro:
            "What a civil aircraft needs before using one.",
          takeaway:
            "Permission from the base commander is required in advance, and the " +
            "only exception is the one you would expect: ambulance and mercy " +
            "flights. A military aerodrome that looks open is not open.",
        },
        {
          title: "Aerodrome Control",
          pages: [336],
          intro:
            "What an aerodrome controller issues, and to whom.",
        },
        {
          title: "Priorities",
          pages: [337],
          intro:
            "The order in which ATC applies priority.",
        },
        {
          title: "Other Aerodrome Terms",
          pages: [338, 339],
          intro:
            "Controlled, attended and unattended, and where the services and " +
            "frequencies are published.",
        },
        {
          title: "Advising Intended Movement",
          pages: [340, 341],
          intro:
            "What must be advised, and the persons on board requirement.",
        },
        {
          title: "ATIS and AWIB",
          pages: [342],
          intro:
            "The two automatic broadcasts, and which aerodromes have which.",
        },
        {
          title: "Flying at a Controlled Aerodrome",
          pages: [343],
          intro:
            "What is required of a pilot in the vicinity of one.",
        },
        {
          title: "Group Rating",
          pages: [344],
          intro:
            "What the group rating number is used for.",
        },
      ],
    },

    {
      title: "Aerodrome Lighting",
      syllabus: ["4.78"],
      intro:
        "What every light on and around an aerodrome means. It is a long " +
        "chapter of short topics, and it is best learned by colour and " +
        "position rather than by name.",
      topics: [
        {
          title: "Runway Edge Lighting",
          pages: [346],
          intro:
            "White for the usable runway, and what the amber is telling you.",
          diagramNotes: {
            346: [
              "Runway edge lighting seen from the approach at night.",
              "The same lighting from closer in, with the edge lights defining the runway width.",
            ],
          },
          takeaway:
            "White edge lights define the usable width of the runway, and amber " +
            "towards the far end is a warning that the runway is running out. " +
            "Read those two colours together with the centreline coding in the " +
            "next topics and the lighting becomes a distance-to-go display rather " +
            "than a set of names to memorise.",
        },
        {
          title: "Threshold and End Lighting",
          pages: [347, 348],
          intro:
            "Green at one end, red at the other, and both unidirectional.",
          diagramNotes: {
            347: "Unidirectional green threshold lighting across the start of the runway.",
            348: [
              "Unidirectional red runway end lighting.",
              "The end lighting seen from the air at night.",
            ],
          },
          takeaway:
            "Green means the beginning and red means the end, and both are " +
            "unidirectional - visible only from the direction they are meant to " +
            "be seen from. That is why the threshold lights of the reciprocal " +
            "runway show red as you roll out towards them: from that side you are " +
            "looking at the end of a runway, and the lighting is telling you so.",
        },
        {
          title: "Runway Centreline Lighting",
          pages: [349, 350],
          intro:
            "White, then alternating red and white, then red — a distance-to-run " +
            "code built into the lights.",
          diagramNotes: {
            349: "Runway centreline lighting, white from the threshold to the 914 m to go point.",
            350: "The remainder of the centreline: alternating red and white to the 300 m point, then red to the runway end.",
          },
          takeaway:
            "The centreline colour change is a distance-to-go indication that works " +
            "without a single instrument. Alternating red and white means about " +
            "900 metres of runway left; solid red means about 300. On a wet night " +
            "at an unfamiliar aerodrome that is the most useful thing on the " +
            "runway.",
        },
        {
          title: "Runway End Identifier Lighting",
          pages: [351],
          intro:
            "Flashing white either side of the threshold, and what it is for.",
          diagramNotes: {
            351: "Runway end identifier lights flashing either side of the approach end, with the runway lighting beyond.",
          },
          context:
            "REIL exists for the case where the runway is hard to pick out - a " +
            "threshold lost in the lights of a town behind it, or an unlit " +
            "approach where nothing marks where the surface begins. A pair of " +
            "flashing white lights either side of the threshold is deliberately " +
            "unlike anything else on the aerodrome, and that is the whole design. " +
            "It is not there to guide the approach, only to say where the runway " +
            "starts.",
        },
        {
          title: "Circling and Lead-In Lighting",
          pages: [352, 353],
          intro:
            "Two systems that provide tracking guidance where terrain restricts " +
            "the circuit.",
          diagramNotes: {
            352: "Circling guidance lights, providing positive tracking in a terrain-restricted circuit.",
            353: "Runway lead-in lighting on the chart, marking the tracking to the threshold.",
          },
        },
        {
          title: "Pilot Activated Lighting",
          pages: [354, 355],
          intro:
            "How to turn the lights on from the aeroplane, and how long they stay " +
            "on.",
          diagramNotes: {
            355: "The AIP lighting entry for an aerodrome: the PAL frequency and pulse sequence, the duration, the voice message before the lights turn off, and the approach and runway lighting available on each runway.",
          },
        },
        {
          title: "The Aerodrome Beacon",
          pages: [356],
          intro:
            "What it flashes, and the timing that identifies it.",
          diagramNotes: {
            356: "An aerodrome beacon on its tower, showing the white and green sectors of the rotating light.",
          },
          takeaway:
            "The timing is what identifies it. Any bright light on the horizon at " +
            "night might be an aerodrome; a light with about three and three " +
            "quarter seconds of darkness between flashes is one. Alternating " +
            "green and white separates a civil aerodrome from the other flashing " +
            "white lights in the landscape.",
        },
        {
          title: "Approach Light Systems",
          pages: [357, 358, 359],
          intro:
            "The three systems, and the kind of approach each serves.",
          diagramNotes: {
            357: [
              "A high intensity approach light system seen from the approach.",
              "The layout of the approach lighting, with the crossbars and the centreline barrettes leading to the threshold.",
            ],
            358: "The two-bar low intensity approach light system, used on precision approach runways.",
            359: "The one-bar low intensity approach light system, used on non-precision approach runways.",
          },
          context:
            "The three systems differ in intensity and in how many crossbars they " +
            "carry, and the number of bars tells you what kind of approach the " +
            "runway serves - five at an international aerodrome with precision " +
            "approaches, two on a precision runway, one on a non-precision one. " +
            "For a VFR pilot the useful part is simpler than the names: approach " +
            "lighting extends the runway centreline out into the dark, so it " +
            "gives you the alignment before the runway itself is visible.",
        },
        {
          title: "Visual Landing Aids",
          pages: [360, 361],
          intro:
            "The approach slope indicators, their vertical coverage, and where " +
            "they are used.",
        },
        {
          title: "T-VASIS",
          pages: [362],
          intro:
            "The T-shaped system: what above, on slope and below each look like.",
          diagramNotes: {
            362: [
              "The T-VASIS pattern seen when above the glideslope.",
              "The pattern seen when on the glideslope.",
              "The pattern seen when below the glideslope.",
              "The bar arrangement on the ground beside the runway.",
              "The fly-down indication.",
              "The fly-up indication.",
            ],
          },
          takeaway:
            "The T-VASIS pattern reads as an instruction rather than as a colour " +
            "code: fly towards the bar. Above the slope the lights form a T with " +
            "the stem above the crossbar and you fly down; below it the stem is " +
            "beneath and you fly up; on slope the stem disappears and only the " +
            "crossbar is left. The three degree slope is visible from about four " +
            "miles by day, which is well before the point at which the approach " +
            "has to be right.",
        },
        {
          title: "VASIS",
          pages: [363],
          intro:
            "The two-bar system, and the three indications it gives.",
          diagramNotes: {
            363: "The VASIS indications: red over red below the glide path, red over white on it, and white over white above it.",
          },
          takeaway:
            "Red over white is the one to hold on to. Red over red is below the " +
            "path, white over white is above it, and the same logic runs the PAPI " +
            "beside it, where the four lights turn from white to red one at a " +
            "time as the aircraft goes low. The system gives you a slope to fly " +
            "without a single instrument, and it gives it to you early enough to " +
            "do something about.",
        },
        {
          title: "Obstruction Beacons",
          pages: [364],
          intro:
            "What is lit, and what the lights look like.",
          diagramNotes: {
            364: "Obstruction lighting on tall structures at night.",
          },
          context:
            "Steady low-intensity red is the convention for an obstacle, and the " +
            "two things it is put on are man-made structures and significant high " +
            "terrain. It is worth knowing that the lighting marks the obstacle " +
            "and not its full extent: a lit mast tells you where the top of it is " +
            "and says nothing about the guy wires running out from it to the " +
            "ground, which are the part that catches aircraft.",
        },
      ],
    },

    {
      title: "Incidents and Accidents",
      syllabus: ["4.80"],
      intro:
        "The definitions that decide which category an occurrence falls into, " +
        "who has to be told, and what must not be touched afterwards.",
      topics: [
        {
          title: "Incident and Accident Definitions",
          pages: [366, 367, 368],
          intro:
            "Aircraft incident, accident and airspace incident — three categories " +
            "with different consequences.",
          diagramNotes: {
            367: [
              "The definition of an accident as it is written in the rule: an occurrence associated with the operation of an aircraft, between the time a person boards and the time all persons have disembarked, in which a person is fatally or seriously injured, the aircraft sustains damage or structural failure, or the aircraft is missing or completely inaccessible.",
              "The definition of an incident: any occurrence, other than an accident, that is associated with the operation of an aircraft and affects or could affect the safety of operation.",
            ],
          },
        },
        {
          title: "Injury Definitions",
          pages: [369, 370],
          intro:
            "Fatal and serious injury, both defined by what happens and by when.",
        },
        {
          title: "Notification of an Accident",
          pages: [371],
          intro:
            "Who notifies, whom, and when.",
        },
        {
          title: "Notification of an Incident",
          pages: [372],
          intro:
            "The equivalent requirement for an incident.",
        },
        {
          title: "Deviation from the Rules",
          pages: [373],
          intro:
            "What must be reported after an emergency required a rule to be " +
            "broken.",
        },
        {
          title: "Access to an Aircraft",
          pages: [374],
          intro:
            "Who may approach an aircraft involved in an accident, and what may " +
            "not be moved.",
        },
        {
          title: "Preservation of Records",
          pages: [375],
          intro:
            "What the certificate holder must keep, and for how long.",
          takeaway:
            "The rules in this chapter exist to protect an investigation that has " +
            "not started yet. Every instinct after an accident — tidy up, move the " +
            "aircraft, correct the paperwork — destroys evidence somebody will need " +
            "to work out what happened, which is why the prohibition is worded so " +
            "broadly.",
        },
      ],
    },

    {
      title: "Emergency Communications and Signals",
      syllabus: ["4.82"],
      intro:
        "What to do when the radio has partly or entirely stopped working, " +
        "and the visual signals that take over when it has.",
      topics: [
        {
          title: "ATC Verification of Code 7500",
          pages: [377],
          intro:
            "What a controller does when that code appears, and why the exchange " +
            "is worded the way it is.",
        },
        {
          title: "The Speechless Technique",
          pages: [378],
          intro:
            "Communicating with carrier-wave transmissions when the microphone has " +
            "failed.",
          takeaway:
            "The speechless technique is worth reading twice even though it is " +
            "rarely used, because it is the only procedure in the subject designed " +
            "for a pilot who can hear but cannot speak. Knowing that a controller " +
            "will ask questions that can be answered with counted transmissions " +
            "turns a failed microphone from an emergency into an inconvenience.",
        },
        {
          title: "Ground-Air Visual Signals",
          pages: [379],
          intro:
            "The codes laid out on the ground by survivors and by rescue units.",
          diagramNotes: {
            379: "Table GEN 3.6-2: the ground-air visual signal code — the signals for use by survivors, the additional signal used in New Zealand only, and the signals used by rescue units.",
          },
          takeaway:
            "These are laid out on the ground with whatever is to hand - panels, " +
            "branches, boot prints in snow - and read from the air, which is why " +
            "every symbol in the table is a single large character. The two " +
            "halves of the table are different conversations: the survivor's " +
            "signals ask for something, and the rescue unit's signals report what " +
            "has been done. Learning V for assistance required, X for medical " +
            "assistance, and N and Y for no and yes covers most of what a " +
            "survivor needs.",
        },
        {
          title: "Directing Surface Craft and ELT Procedures",
          pages: [380, 381],
          intro:
            "The manoeuvres used to lead a boat to somebody in the water, and " +
            "where the emergency locator transmitter procedures are published.",
          takeaway:
            "Both halves of this belong to the same phase of an accident: somebody " +
            "is in the water or on the ground, and the job of everyone else is to " +
            "get help to them. An aeroplane overhead can do two useful things — " +
            "keep the position, and lead a surface craft to it — and both are " +
            "procedures worth having read before the day you need them.",
        },
      ],
    },
  ],
};
