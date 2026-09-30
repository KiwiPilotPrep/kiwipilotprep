/**
 * PPL Aircraft Technical Knowledge — the curriculum.
 *
 * This subject reached the platform differently from the other five. Air Law,
 * Navigation, Meteorology, Human Factors and Flight Radio each arrived as a
 * lecture deck, were extracted, and became a course. Aircraft Technical
 * Knowledge was never extracted at all: its material was attached to the CAA
 * syllabus rows themselves, so the subject had forty-two published syllabus
 * topics, two hundred and ten items, fourteen fragments of study content — and
 * no chapters and no lessons. A student who paid for PPL theory opened it and
 * was handed the regulator's checklist.
 *
 * The source is a 506-page book rather than a slide deck, and that is why it
 * can carry the whole subject on its own. `docs/cms/PPL-ATK-COVERAGE.md`
 * classifies every one of those pages; the counts there are the counts this
 * file has to account for:
 *
 *     410 teaching · 35 picture-only · 27 chapter-review · 22 chapter-opener
 *       6 video-cue ·  4 title-only  ·  1 section-opener ·  1 duplicate
 *
 * 445 pages are claimed by a topic below and 61 are skipped with a reason. The
 * builder refuses to finish if that does not add up to 506.
 *
 * Three decisions worth stating, because they are the ones that would be
 * argued with:
 *
 *   - The 27 chapter reviews are skipped. The coverage report expected them to
 *     be question material; opened, every one is a title card — "Chapter Review
 *     3" over the words "Basic Aerodynamic Theory" — with no questions under
 *     it. There is nothing behind them to move to a question bank.
 *
 *   - The 35 picture-only pages are not skipped. Each is a figure whose
 *     explanation is on the page before or after it, so each is claimed by the
 *     topic that explains it and lands beside its own text.
 *
 *   - The book's own 31 chapters are kept as the teaching order, but the long
 *     ones are split. Thirty-six pages of aerodynamics is not one chapter, and
 *     a chapter is the unit a student plans an evening around.
 *
 * Chapter titles are authored. The book's chapter headings survive in the PDF
 * as a heading run into the first sentence of the chapter — "FUEL INJECTION
 * SYSTEMS  Increasingly, aircraft engines are" — and are unusable as titles.
 * The teaching itself is never rewritten: source pages are pulled through
 * verbatim and tagged `source`, and everything written here is tagged
 * `authored`.
 */

export const subject = {
  slug: "aircraft-technical-knowledge",
  title: "Aircraft Technical Knowledge",
  deck: "ppl-atk",

  skip: {

    /* ---- the deck's cover ----------------------------------------------- */
    1:
      "The deck cover: the subject name, “90 minutes” and “45 Questions” over a photograph. That is the exam format, which the course page states already, and no part of it is teaching.",

    /* ---- chapter and section openers: the deck's own structural furniture */
    2:
      "Chapter opener: the words “Chapter 1 Definitions, Terminology, Units and Abbreviations” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    17:
      "Chapter opener: the words “Chapter 2 The Atmosphere” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    22:
      "Chapter opener: the words “CHAPTER 3 BASIC AERODYNAMIC THEORY” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    65:
      "Chapter opener: the words “CHAPTER 4 POWER PLANT AND SYSTEMS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    86:
      "Chapter opener: the words “CHAPTER 5 CARBURATION” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    116:
      "Chapter opener: the words “CHAPTER 7 FUEL” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    123:
      "Chapter opener: the words “CHAPTER 9 IGNITION SYSTEMS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    148:
      "Chapter opener: the words “ANCILLARY SYSTEMS CHAPTER 12 THE ELECTRICAL SYSTEM - DC” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    167:
      "Chapter opener: the words “CHAPTER 13 FUEL SYSTEM COMPONENTS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    189:
      "Chapter opener: the words “CHAPTER 14 LUBRICATION SYSTEMS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    206:
      "Chapter opener: the words “INSTRUMENTS CHAPTER 15 ENGINE INSTRUMENTS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    214:
      "Chapter opener: the words “CHAPTER 16 THE PRESSURE INSTRUMENTS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    275:
      "Chapter opener: the words “CHAPTER 19 ADVANCED SYSTEMS GNSS INSTRUMENTS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    295:
      "Section opener: the words “SECTION 2 AEROPLANE TECHNICAL KNOWLEDGE CHAPTER 20 ANCILLARY SYSTEMS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    302:
      "Chapter opener: the words “CHAPTER 21 BASIC FLYING CONTROLS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    324:
      "Chapter opener: the words “CHAPTER 22 THE FORCES ACTING ON THE AIRCRAFT” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    349:
      "Chapter opener: the words “CHAPTER 24 DESCENDING There are two ways in which an aircraft can desc” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    367:
      "Chapter opener: the words “CHAPTER 26 STALLING AND SPINNING” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    390:
      "Chapter opener: the words “STRUCTURE AND SYSTEMS CHAPTER 27 AIRFRAME STRUCTURE” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    403:
      "Chapter opener: the words “CHAPTER 28 PROPELLERS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    426:
      "Chapter opener: the words “CHAPTER 29 CONTROL SYSTEMS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    442:
      "Chapter opener: the words “CHAPTER 30 PERFORMANCE PERFORMANCE FACTORS” and nothing else. The chapter name is kept as course structure; the page itself teaches nothing.",
    481:
      "Chapter opener. Unlike the others it carries a line of its own — “when we consider weight and balance, we are concerned with: maximum weights; position of the centre of gravity” — which states what the chapter is about rather than teaching any of it. The chapter's own introduction says the same thing and says it better, so nothing on the page is lost with it.",

    /* ---- chapter reviews: a title card, not a set of questions ----------- */
    16:
      "Revision card closing the chapter: “Chapter Review 1 Definitions, Terminology, Units and Abbrevi” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    21:
      "Revision card closing the chapter: “Chapter Review 2 The Atmosphere” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    64:
      "Revision card closing the chapter: “Chapter Review 3 Basic Aerodynamic Theory” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    85:
      "Revision card closing the chapter: “CHAPTER REVIEW 4 Power Plant and Systems” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    115:
      "Revision card closing the chapter: “CHAPTER REVIEW 5 AND 6 Carburation and Fuel Injection” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    122:
      "Revision card closing the chapter: “CHAPTER REVIEW 7 AND 8 FUEL & EXHAUST SYSTEM” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    133:
      "Revision card closing the chapter: “CHAPTER REVIEW 9 AND 10 IGNITION SYSTEMS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    147:
      "Revision card closing the chapter: “CHAPTER REVIEW 11 ENGINE MANAGEMENT” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    166:
      "Revision card closing the chapter: “CHAPTER REVIEW 12 ELECTRICAL SYSTEMS - DC” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    188:
      "Revision card closing the chapter: “CHAPTER REVIEW 13 FUEL SYSTEM” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    205:
      "Revision card closing the chapter: “CHAPTER REVIEW 14 LUBRICATION SYSTEMS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    240:
      "Revision card closing the chapter: “CHAPTER REVIEW 15 AND 16 ENGINE AND PRESSURE INSTRUMENTS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    254:
      "Revision card closing the chapter: “CHAPTER REVIEW 17 MAGNETIC INSTRUMENTS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    274:
      "Revision card closing the chapter: “CHAPTER REVIEW 18 GYROSCOPIC INSTRUMENTS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    294:
      "Revision card closing the chapter: “CHAPTER REVIEW 19 GNSS, TCAS, TAWS, EFIS AND ELT” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    301:
      "Revision card closing the chapter: “CHAPTER REVIEW 20 COOLING SYSTEMS, UNDERCARRIAGE AND AEROPLA” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    323:
      "Revision card closing the chapter: “CHAPTER REVIEW 21 BASIC FLYING CONTROLS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    338:
      "Revision card closing the chapter: “CHAPTER REVIEW 22 STRAIGHT AND LEVEL FLIGHT” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    348:
      "Revision card closing the chapter: “CHAPTER REVIEW 23 CLIMBING” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    357:
      "Revision card closing the chapter: “CHAPTER REVIEW 24 DESCENDING” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    366:
      "Revision card closing the chapter: “CHAPTER REVIEW 25 TURNING FLIGHT” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    389:
      "Revision card closing the chapter: “CHAPTER REVIEW 26 STALLING AND SPINNING” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    402:
      "Revision card closing the chapter: “CHAPTER REVIEW 27 AIRFRAME STRUCTURE” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    425:
      "Revision card closing the chapter: “CHAPTER REVIEW 28 PROPELLERS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    430:
      "Revision card closing the chapter: “CHAPTER REVIEW 29 CONTROL SYSTEMS” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    479:
      "Revision card closing the chapter: “CHAPTER REVIEW 30 PERFORMANCE” set as a heading with no questions under it. There is nothing on the page for a student to read.",
    506:
      "Revision card closing the chapter: “CHAPTER REVIEW 31 WEIGHT AND BALANCE” set as a heading with no questions under it. There is nothing on the page for a student to read.",

    /* ---- classroom video cues: spoken to the room, not to a reader ------ */
    11:
      "A cue to play “Kinetic Energy Video” in class. No video came with the deck, and the page carries no text of its own.",
    15:
      "A cue to play “CPF Video” in class. No video came with the deck, and the page carries no text of its own.",
    30:
      "A cue to play “Venturi Video” in class. No video came with the deck, and the page carries no text of its own.",
    79:
      "A cue to play “C172S ENGINE COMPONENT VIDEO” in class. No video came with the deck, and the page carries no text of its own.",
    113:
      "A cue to play “FUEL INJECTION VIDEO” in class. No video came with the deck, and the page carries no text of its own.",
    222:
      "A cue to play “PITOT STATIC SYSTEM VIDEO” in class. No video came with the deck, and the page carries no text of its own.",

    /* ---- headings whose body is on the page overleaf -------------------- */
    196:
      "The heading “LUBRICATION SYSTEM” alone on a page, its body overleaf. The heading survives as the title of the topic that teaches it.",
    459:
      "The heading “FACTORS AFFECTING TAKE-OFF PERFORMANCE” alone on a page, its body overleaf. The heading survives as the title of the topic that teaches it.",
    468:
      "The heading “FACTORS AFFECTING LANDING PERFORMANCE” alone on a page, its body overleaf. The heading survives as the title of the topic that teaches it.",
    476:
      "The heading “PRACTICAL USE OF P-CHARTS” alone on a page, its body overleaf. The heading survives as the title of the topic that teaches it.",

    /* ---- said twice ------------------------------------------------------ */
    427:
      "Word-for-word repeat of page 303 (“THE FLIGHT CONTROLS”). The first occurrence is taught; this is the deck saying the same thing twice.",
  },
  chapters: [
    /* =====================================================================
     * Book chapters 1-2: the vocabulary and the air the aeroplane flies in.
     * ===================================================================== */
    {
      title: "Definitions, Terminology and Units",
      syllabus: ["12.2"],
      intro:
        "The quantities the rest of the subject is written in, and the units " +
        "aviation states them in. Almost every later chapter assumes these: " +
        "the lift formula assumes density, weight and balance assumes moments, " +
        "and turning flight assumes centripetal force.",
      topics: [
        {
          title: "Units of Measurement",
          pages: [3, 4],
          intro:
            "The SI unit for each quantity, and the unit aviation actually uses " +
            "in its place.",
          context:
            "Aviation is not consistent about units and there is a historical " +
            "reason for it: distance over the ground is nautical miles because a " +
            "nautical mile is a minute of latitude, height is feet because that is " +
            "what the altimeters were calibrated in, and fuel is litres or " +
            "kilograms depending on whether it is being bought or carried. Learn " +
            "the pairs rather than the SI unit alone.",
        },
        {
          title: "Mass, Weight, Density and Momentum",
          pages: [5, 6],
          intro:
            "What mass is, how weight differs from it, and the two quantities " +
            "built from mass that appear later — density in the lift formula, " +
            "momentum in landing distance.",
          misconception:
            "Using mass and weight as the same word. Mass is the amount of matter " +
            "and does not change; weight is the force gravity applies to that " +
            "mass. The distinction matters in weight and balance, where the " +
            "figures are masses in kilograms and the moments they produce are " +
            "forces.",
        },
        {
          title: "Force Vectors, Couples and Newton's Third Law",
          pages: [7, 8],
          intro:
            "Representing a force as an arrow, resolving one force into two, and " +
            "the pair of forces that produces a turning moment rather than a " +
            "movement.",
          takeaway:
            "Resolving the total reaction into lift and drag — done on page 7 with " +
            "an arrow — is the same operation performed on the aerofoil in the " +
            "aerodynamics chapter and on the propeller in the propeller chapter. " +
            "One technique, three uses.",
        },
        {
          title: "Motion, Energy, Work and Power",
          pages: [9, 10, 12],
          intro:
            "Velocity and acceleration, the two kinds of mechanical energy, and " +
            "the distinction between doing work and the rate of doing it.",
          context:
            "Kinetic energy rises with the square of speed. That single fact is " +
            "why landing distance grows so sharply with a small excess of speed " +
            "over the threshold, and it is worth carrying forward to the " +
            "performance chapter rather than meeting it again there as a surprise.",
        },
        {
          title: "Circular Motion and Centripetal Force",
          pages: [13, 14],
          intro:
            "Why a body following a curved path must be accelerated towards the " +
            "centre of the curve, and what decides how much force that takes.",
          takeaway:
            "Centripetal force rises with the square of velocity and falls with " +
            "radius. In the turning chapter this reappears as the reason a faster " +
            "aeroplane needs a greater angle of bank to hold the same rate of turn.",
        },
      ],
    },

    {
      title: "The Atmosphere",
      syllabus: ["12.4"],
      intro:
        "What the air is made of, what decides its density, and the agreed " +
        "yardstick — the International Standard Atmosphere — that performance " +
        "figures are quoted against.",
      topics: [
        {
          title: "Composition and Density of the Air",
          pages: [18, 19],
          intro:
            "The gases that make up the atmosphere, and how pressure and " +
            "temperature between them decide its density.",
          keyPoints: [
            "Nitrogen 78%, oxygen 21%, the remaining 1% trace gases.",
            "High pressure means high density; high temperature means low density.",
            "Density is the quantity the aeroplane actually responds to — the lift formula, engine power and propeller thrust all contain it.",
          ],
        },
        {
          title: "The International Standard Atmosphere",
          pages: [20],
          intro:
            "The hypothetical atmosphere that performance charts, altimeters and " +
            "airspeed indicators are all calibrated against.",
          context:
            "ISA is not a forecast and is not claimed to be. It is a fixed set of " +
            "conditions so that two aeroplanes, two charts or two altimeters can be " +
            "compared at all. The day is then described by how far it departs from " +
            "ISA, which is why performance work is done in terms of ISA deviation " +
            "rather than raw temperature.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 3, split in two: 36 pages of aerodynamics is not one
     * chapter. Lift up to and including contamination, then drag.
     * ===================================================================== */
    {
      title: "Aerofoils and the Production of Lift",
      syllabus: ["12.6"],
      intro:
        "How a wing makes lift: the shape, the angle it meets the air at, the " +
        "pressure difference that results, and the four things a pilot can " +
        "change that alter how much lift there is.",
      topics: [
        {
          title: "From a Flat Plate to an Aerofoil",
          pages: [23, 24],
          intro:
            "The simplest case first — a flat plate inclined to the airflow — and " +
            "then the shaped surface that does the same job far better.",
        },
        {
          title: "Aerofoil Terminology",
          pages: [25],
          intro:
            "Leading and trailing edge, chord, thickness, camber. The words every " +
            "later diagram is labelled in.",
        },
        {
          title: "Angle of Attack and Pressure Distribution",
          pages: [26, 27],
          intro:
            "The angle between the chord line and the relative airflow, and the " +
            "pressure pattern that angle produces around the section.",
          misconception:
            "Reading angle of attack as the aeroplane's attitude relative to the " +
            "ground. It is measured against the relative airflow, not the horizon, " +
            "which is why a wing can be stalled in a descent, in a climb, or in " +
            "level flight, at any airspeed and any attitude.",
        },
        {
          title: "Bernoulli's Theorem and the Venturi",
          pages: [28, 29],
          intro:
            "The energy statement behind the pressure difference, and the " +
            "convergent-divergent duct that demonstrates it.",
        },
        {
          title: "Airflow Around an Aerofoil",
          pages: [31, 32, 33],
          intro:
            "What the air does over the top and under the bottom of the section as " +
            "the angle of attack is increased, up to the point where it can no " +
            "longer follow the surface.",
          diagramNotes: {
            33: "The airflow below the wing, referred forward from page 32.",
          },
        },
        {
          title: "The Total Reaction and the Centre of Pressure",
          pages: [34, 35, 36],
          intro:
            "The single force the pressure distribution adds up to, the point it " +
            "acts through, and how that force is split into lift and drag.",
          keyPoints: [
            "On a cambered (non-symmetrical) aerofoil the centre of pressure moves forward as the angle of attack increases, and moves sharply rearward at the stall.",
            "On a symmetrical aerofoil it barely moves at all: the pressure pattern is the same shape above and below, so the point it acts through stays close to a quarter of the chord back from the leading edge until the stall.",
            "That difference is why a symmetrical section is used where a moving centre of pressure would be a nuisance — a tailplane, a fin, a helicopter rotor blade — and a cambered one where lift at low angles matters more.",
          ],
          takeaway:
            "The centre of pressure moves forward as angle of attack increases and " +
            "then moves sharply rearward at the stall. That rearward movement is " +
            "part of why the nose drops at the stall, which the stalling chapter " +
            "returns to.",
        },
        {
          title: "Lift and the Factors That Affect It",
          pages: [37, 38, 39],
          intro:
            "What lift is defined as, everything the amount of it depends on, and " +
            "the short list of those a pilot can do anything about in flight.",
        },
        {
          title: "The Lift Curve: CL Against Angle of Attack",
          pages: [40, 41, 42],
          intro:
            "The graph that governs the whole subject: lift coefficient plotted " +
            "against angle of attack, and the stalling angle at the top of it.",
          keyPoints: [
            "A cambered wing produces lift at zero angle of attack.",
            "CL rises steadily with angle of attack until the stalling angle.",
            "CL max occurs at the stalling angle — and that angle is the same whatever the aeroplane's speed, weight or attitude.",
          ],
        },
        {
          title: "Changing the Shape: Flaps",
          pages: [43, 44],
          intro:
            "Increasing the camber of the section to raise its lifting capability, " +
            "and what that does to the speed at which the stalling angle is " +
            "reached.",
        },
        {
          title: "The Lift Formula and the Effect of Speed",
          pages: [45],
          intro:
            "L = CL ½ρV²S — what each term is, and which of them the pilot moves.",
          definition:
            "Lift equals the coefficient of lift, times one half the air density, " +
            "times the square of the true airspeed, times the wing area. Because " +
            "velocity is squared, lift varies with the square of the speed: double " +
            "the speed at a constant angle of attack and there is four times the " +
            "lift.",
          term: "The lift formula",
        },
        {
          title: "Frost, Ice and Contamination",
          pages: [46],
          intro:
            "What a contaminated wing does to the figures the rest of this chapter " +
            "assumes.",
          context:
            "Contamination is the one item in this chapter that is entirely a " +
            "pre-flight matter. Ice, frost, snow, and anything else lying on the " +
            "wing all do the same thing: frost that looks like nothing more than a " +
            "dusting raises the stalling speed and cuts the lift available, and no " +
            "technique in the air recovers it. The precaution is the whole answer " +
            "— every surface is cleared on the ground, and if it cannot be, the " +
            "flight does not go.",
        },
      ],
    },

    {
      title: "Drag",
      syllabus: ["12.6"],
      intro:
        "The resistance the aeroplane must be pushed through the air against. " +
        "Drag divides into the part that is a by-product of making lift and the " +
        "part that is not, and the two behave in opposite ways as speed changes.",
      topics: [
        {
          title: "What Drag Is",
          pages: [47, 48],
          intro:
            "The direction drag acts in, and the relationship between drag and the " +
            "thrust required to balance it.",
        },
        {
          title: "Total Drag and the Drag Tree",
          pages: [49, 50],
          intro:
            "The two families every kind of drag falls into, laid out as a tree.",
        },
        {
          title: "Parasite Drag: Skin Friction and Form Drag",
          pages: [51, 52, 53, 54, 55, 56],
          intro:
            "The drag that has nothing to do with lift: friction along the " +
            "surface, the wake behind a shape, and what streamlining and fairings " +
            "do about them.",
          diagramNotes: {
            56: "Fairings on the airframe, continued from page 55.",
          },
        },
        {
          title: "Interference Drag, and Parasite Drag with Speed",
          pages: [57, 58],
          intro:
            "The drag produced where two airflows meet, and the way the whole " +
            "parasite family grows with airspeed.",
          keyPoints: [
            "Parasite drag varies with the square of the speed: double the airspeed and there is four times the parasite drag.",
          ],
        },
        {
          title: "Induced Drag",
          pages: [59, 60, 61],
          intro:
            "The drag that is the price of lift — where it comes from, why it is " +
            "worst at low speed, and why wing shape changes it.",
          misconception:
            "Assuming drag simply rises with speed. Induced drag does the " +
            "opposite: it is greatest at low airspeed and high angles of attack, " +
            "because that is when the spanwise flow and the wingtip vortices are " +
            "strongest. Slow flight is high-drag flight, which is why the approach " +
            "to a short field is flown with power on.",
        },
        {
          title: "Total Drag and the Lift/Drag Ratio",
          pages: [62, 63],
          intro:
            "The two curves added together, the speed at the bottom of the " +
            "resulting curve, and the angle of attack that gives the best ratio of " +
            "lift to drag.",
          keyPoints: [
            "Plotted against angle of attack, the L/D ratio rises steeply from zero, peaks at about 4°, and falls away again towards the stalling angle.",
            "A symmetrical aerofoil gives no lift at zero angle of attack, so its curve starts at the origin; a cambered one is already lifting there and its curve starts above zero.",
            "Both peak well below the stalling angle — the most efficient angle of attack is nowhere near the one that produces the most lift.",
          ],
          takeaway:
            "The best lift/drag ratio occurs at about 4° angle of attack, and the " +
            "speed that produces it is the one flown for maximum glide range. The " +
            "descending chapter uses this; it is worth arriving there already " +
            "knowing where the number comes from.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 4: the engine itself.
     * ===================================================================== */
    {
      title: "The Piston Engine",
      syllabus: ["12.10"],
      intro:
        "The engine in front of a training aeroplane: how its cylinders are " +
        "arranged and why, what the parts are called, the cycle it repeats, and " +
        "how its output is read in the cockpit.",
      topics: [
        {
          title: "Engine Types and Configurations",
          pages: [66, 67, 68, 69, 70, 71],
          intro:
            "Piston against gas turbine, then the ways cylinders can be arranged " +
            "— radial, inline, inverted inline, horizontally opposed — and what " +
            "each arrangement is good and bad at.",
          takeaway:
            "The horizontally opposed layout wins in light aircraft for four " +
            "reasons at once: low frontal drag, straightforward air cooling, good " +
            "forward visibility over the nose, and a crankshaft high enough to give " +
            "the propeller ground clearance. No single one of those decides it.",
        },
        {
          title: "Main Components and Operating Principle",
          pages: [72, 73],
          intro:
            "The parts of the engine, and the chain that turns burning fuel into a " +
            "turning crankshaft.",
          keyPoints: [
            "Cylinder and cylinder head, piston, connecting rod, crankshaft: the chain that turns expanding gas into rotation.",
            "Inlet and exhaust valves, opened and closed by the camshaft, which is driven off the crankshaft at half its speed.",
            "The spark plug on a spark-ignition engine, or the fuel injector on an injected one, delivering the ignition or the fuel into the cylinder itself.",
          ],
        },
        {
          title: "Measuring Power Output",
          pages: [74, 75],
          intro:
            "What the pilot reads to know how much power the engine is making — " +
            "and why that is one instrument on a fixed-pitch aeroplane and two on " +
            "a constant-speed one.",
          misconception:
            "Reading RPM as power on any aeroplane. With a fixed-pitch propeller " +
            "the tachometer does stand for power. With a constant-speed propeller " +
            "the governor holds RPM where it is set while the blade angle changes, " +
            "so RPM alone says nothing: power is manifold pressure and RPM read " +
            "together.",
        },
        {
          title: "The Four-Stroke Cycle",
          pages: [76, 77, 78],
          intro:
            "Intake, compression, power, exhaust — the Otto cycle, what happens on " +
            "each stroke, and what it costs in crankshaft revolutions.",
          keyPoints: [
            "One complete cycle is four strokes of the piston and two revolutions of the crankshaft.",
            "Only one stroke in four drives the crankshaft; the other three are driven by it.",
            "The power developed depends on the density of the fuel-air charge that reaches the cylinder — which is why density altitude and mixture both matter to power.",
          ],
        },
        {
          title: "The Valves and Valve Timing",
          pages: [80, 81, 82, 83],
          intro:
            "What the valves do, how they are driven, and why they open and close " +
            "at points other than the obvious top and bottom of the stroke.",
          context:
            "Valve lead, lag and overlap all exist because the gas has mass and " +
            "takes time to move. The exhaust valve opens before the power stroke " +
            "has finished and closes after the intake stroke has begun, because a " +
            "moving column of exhaust keeps scavenging on its own momentum. The " +
            "timing is using inertia rather than wasting stroke.",
        },
        {
          title: "Compression Ignition",
          pages: [84],
          intro:
            "The alternative to a spark: igniting the charge by compressing it " +
            "hard enough.",
          // The source page carries a single illegible photograph and no text
          // at all, and the syllabus asks for the differences between the two
          // kinds of ignition by name. Authored, and marked as such.
          context:
            "Compress a gas and it gets hot. A compression-ignition engine — a " +
            "diesel — uses a compression ratio high enough that the air in the " +
            "cylinder is already above the fuel's ignition temperature by the top " +
            "of the compression stroke, so fuel injected at that moment lights " +
            "itself. There is no spark, no magneto and no spark plug to foul, and " +
            "no carburettor: the power is set by how much fuel is injected rather " +
            "than by throttling the air. What it costs is weight, because the " +
            "cylinder and crankcase have to be built for far higher pressures.",
          keyPoints: [
            "Spark ignition: fuel and air mixed before the cylinder, compressed together, lit by a timed spark.",
            "Compression ignition: air alone compressed, fuel injected at the top of the stroke, lit by the heat of compression.",
            "Compression ratios are roughly twice those of a spark-ignition engine, which is where both the efficiency and the extra weight come from.",
            "Aviation diesels run on jet fuel rather than AVGAS — the one exception to the rule that AVTUR must not go into a piston engine.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapter 5, split three ways: the carburettor, what goes wrong
     * inside the cylinder, and what goes wrong inside the carburettor.
     * ===================================================================== */
    {
      title: "The Carburettor and Mixture",
      syllabus: ["12.12"],
      intro:
        "Getting fuel and air into the cylinder in the right proportion, across " +
        "the whole range from idle to full power, and giving the pilot a control " +
        "that keeps that proportion right as the air thins with altitude.",
      topics: [
        {
          title: "The Basic Principle",
          pages: [87],
          intro:
            "What the carburettor is for and the ratio it is holding.",
          definition:
            "Carburation is the process of mixing fuel with air in the proportion " +
            "the engine can burn, and the carburettor is the device that does it. " +
            "It meters fuel into the induction air to hold a mixture of roughly " +
            "one part fuel to twelve parts air, using the pressure drop through a " +
            "venturi to draw the fuel out of the float chamber. Everything else in " +
            "this chapter — the idling system, the accelerator pump, the mixture " +
            "control — exists because that one arrangement cannot hold the " +
            "proportion right on its own across the whole range of power and " +
            "altitude.",
          term: "Carburation",
        },
        {
          title: "The Float Carburettor",
          pages: [88],
          intro:
            "The float chamber, the venturi and the discharge nozzle, and how fuel " +
            "gets from one to the other.",
        },
        {
          title: "Atomisation and Diffusion",
          pages: [89],
          intro:
            "Breaking the fuel into a fine mist so that it mixes with the air " +
            "rather than arriving as droplets.",
        },
        {
          title: "The Accelerating and Idling Systems",
          pages: [90, 91],
          intro:
            "Two cases the main jet cannot handle on its own: the throttle opened " +
            "quickly, and the throttle closed altogether.",
          context:
            "Both of these are the same problem seen from opposite ends. Fuel " +
            "flows because of a pressure difference between the float chamber and " +
            "the venturi. Open the throttle suddenly and the air responds faster " +
            "than the fuel does, leaving the mixture briefly lean; close it to idle " +
            "and there is barely any pressure difference left to draw fuel at all. " +
            "Each needs its own system.",
        },
        {
          title: "The Power Enrichment System",
          pages: [92],
          intro:
            "Why the engine is deliberately given more fuel than it needs to burn " +
            "at high power.",
        },
        {
          title: "The Mixture Control",
          pages: [93, 94],
          intro:
            "Why a control is needed at all, and how it is used through a climb, " +
            "in the cruise and on descent.",
          misconception:
            "Thinking of the mixture control as a fuel tap for economy alone. The " +
            "reason it exists is that the correct mixture is a ratio by weight " +
            "while the carburettor meters by volume. As the aeroplane climbs the " +
            "air thins, the same volume of air weighs less, and an untouched " +
            "mixture control therefore gets richer and richer on its own.",
        },
        {
          title: "Incorrect Mixture, and Idle Cut-Off",
          pages: [95, 96],
          intro:
            "What too rich and too lean each do to the engine, and why the engine " +
            "is shut down with the mixture rather than the switches.",
        },
      ],
    },

    {
      title: "Abnormal Combustion",
      syllabus: ["12.12"],
      intro:
        "The two ways combustion goes wrong. They are commonly confused, they " +
        "have different causes, and one of them can destroy an engine in a very " +
        "short time.",
      topics: [
        {
          title: "The Two Kinds of Abnormal Combustion",
          pages: [97],
          intro:
            "Detonation and pre-ignition named and separated before either is " +
            "examined.",
          diagramNotes: {
            97: "Four panels contrasting the normal and the abnormal. Above: normal combustion, where the flame front spreads smoothly out from the spark, beside an explosion, where the charge goes off all at once. Below, the same idea as a hand on a piston crown: normal burning pushes the piston down steadily, detonation hits it like a hammer blow.",
          },
          context:
            "The two names are easy to confuse and the difference is one of " +
            "timing rather than of violence. Detonation is about how the charge " +
            "burns — it is lit normally by the spark and then the rest of it " +
            "explodes instead of burning progressively. Pre-ignition is about " +
            "when it is lit — something in the cylinder hot enough to be an " +
            "ignition source sets the charge off before the spark does. Each can " +
            "lead to the other, and the topics that follow take them one at a " +
            "time.",
        },
        {
          title: "Detonation",
          pages: [98, 99],
          intro:
            "The charge exploding rather than burning — what it does to a piston, " +
            "and everything that makes it more likely.",
          keyPoints: [
            "The primary cause is excessive temperature of the fuel-air charge entering the cylinder.",
            "Contributing factors: time-expired fuel, too low a fuel grade, an over-lean mixture, high power settings.",
            "Detonation occurs in all cylinders.",
          ],
        },
        {
          title: "Pre-Ignition, and How It Differs from Detonation",
          pages: [101, 102, 100],
          intro:
            "The charge lit by something hot before the spark arrives: its causes, " +
            "its symptoms, and the comparison with detonation set out side by side.",
          diagramNotes: {
            100: "Detonation and pre-ignition compared.",
          },
          misconception:
            "Treating the two as the same fault under two names. Detonation is the " +
            "mixture exploding after the spark; pre-ignition is a hot spot — " +
            "typically a lead deposit or an overheated plug — lighting the mixture " +
            "before the spark arrives. Pre-ignition can occur in one cylinder " +
            "alone, while detonation occurs in all of them, and that difference is " +
            "often what identifies which one is happening.",
        },
      ],
    },

    {
      title: "Carburettor Icing",
      syllabus: ["12.12"],
      intro:
        "Ice forming inside the induction system on a day well above freezing. " +
        "Three mechanisms produce it, the symptoms differ between fixed-pitch " +
        "and constant-speed aeroplanes, and the remedy has to be applied fully " +
        "and early.",
      topics: [
        {
          title: "Where Ice Forms, and the First Signs",
          pages: [103],
          intro:
            "The places ice forms in the carburettor and intake, and what the " +
            "pilot notices first.",
          context:
            "The single most important point in this chapter is that carburettor " +
            "ice forms at ambient temperatures well above freezing — the range to " +
            "hold on to is roughly −10°C to +25°C with visible moisture or high " +
            "humidity. A pilot who only expects it near 0°C will not go looking " +
            "for it on the day it actually happens.",
        },
        {
          title: "Refrigeration Ice",
          pages: [104],
          intro:
            "The temperature drop caused by the fuel vaporising in the airstream.",
        },
        {
          title: "Throttle Ice",
          pages: [105],
          intro:
            "The pressure drop past a partly closed throttle butterfly, and why a " +
            "low power setting is the dangerous one.",
        },
        {
          title: "Impact Ice",
          pages: [106, 107],
          intro:
            "Supercooled water freezing on the forward-facing surfaces of the air " +
            "intake.",
        },
        {
          title: "Using Carburettor Heat",
          pages: [108, 109, 110],
          intro:
            "The remedy: what carburettor heat does, how it is applied, what " +
            "happens while it works, and when it is used as a precaution.",
          keyPoints: [
            "Carburettor heat is applied fully, not partially — partial heat can raise the intake temperature into the icing range rather than out of it.",
            "Expect a power drop when it is selected; a further rough-running period as the ice melts is a sign it was working.",
            "It is normally on during a low-power descent, and removed on short final so full power is available for a go-around.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapters 6-8, taken together. Three short chapters that each hold
     * one idea; as chapters of their own they would be a page apiece.
     * ===================================================================== */
    {
      title: "Fuel Injection, Fuel and the Exhaust System",
      syllabus: ["12.14", "12.16", "12.18"],
      intro:
        "The alternative to the carburettor, the fuel that goes into either of " +
        "them, and the system that takes the gases away afterwards — including " +
        "the reason the exhaust system is a cabin safety item and not only an " +
        "engine one.",
      topics: [
        {
          title: "How Fuel Injection Works",
          pages: [111, 112],
          intro:
            "Metering fuel directly into the induction manifold, and what is left " +
            "of the carburettor once that is done.",
          keyPoints: [
            "Fuel control unit → fuel manifold (the spider) → one line per cylinder → the injector, which the source page calls the discharge nozzle. They are the same component under two names, and the exam uses \"injector\".",
            "The engine-driven fuel pump supplies the pressure the unit meters against; the boost pump does it for starting.",
          ],
          context:
            "Two arrangements go by the name. In indirect injection — which is " +
            "what a light aeroplane has — the injector sprays into the induction " +
            "port just upstream of the inlet valve, so the charge is still mixed " +
            "before it enters the cylinder. In direct injection the injector " +
            "sprays into the cylinder itself, against compression, which is what a " +
            "compression-ignition engine requires. Knowing which is which explains " +
            "why the light-aircraft system needs no high-pressure pump at the " +
            "cylinder and why it starts poorly hot: the fuel is sitting in a warm " +
            "line, not being forced in.",
        },
        {
          title: "Advantages and Disadvantages of Fuel Injection",
          pages: [114],
          intro:
            "What injection buys, and the two problems it introduces in exchange.",
          takeaway:
            "Injection removes refrigeration icing — there is no venturi cooling " +
            "the fuel — but introduces vapour locking and a harder hot start. It " +
            "trades a problem that appears in flight for problems that appear on " +
            "the ground.",
        },
        {
          title: "Fuel Types and Colour Identification",
          pages: [117, 118],
          intro:
            "The fuels in general aviation use and the colour each is dyed, which " +
            "is how the wrong one is caught before it is burnt.",
          keyPoints: [
            "AVGAS 100LL is blue, and is what most general aviation aeroplanes use.",
            "MOGAS 91 is purple, MOGAS 96 yellow, 100/130 green, 115/145 purple.",
            "The colour is checked in the fuel drain sample, not assumed from the pump.",
          ],
        },
        {
          title: "MOGAS and Its Risks",
          pages: [119],
          intro:
            "Why motor fuel is not simply cheaper aviation fuel: quality control, " +
            "volatility and vapour locking.",
        },
        {
          title: "The Exhaust Manifold and Carbon Monoxide",
          pages: [120, 121],
          intro:
            "What the exhaust manifold does, why its condition is checked, and the " +
            "gas that reaches the cabin when it leaks.",
          context:
            "Carbon monoxide is the reason a crack in an exhaust manifold is a " +
            "flight safety matter rather than a maintenance inconvenience. Cabin " +
            "heat is drawn over the exhaust, so a leak puts a colourless, " +
            "odourless product of combustion straight into the heater duct — and " +
            "the early symptoms are drowsiness and a headache, which a pilot is " +
            "liable to attribute to the flight rather than to the aeroplane.",
        },
      ],
    },

    /* =====================================================================
     * Book chapters 9-10: ignition, magneto and solid state together.
     * ===================================================================== */
    {
      title: "Ignition Systems",
      syllabus: ["12.20", "12.22"],
      intro:
        "Producing a high-voltage spark at the right moment in the cycle, twice " +
        "over. The magneto system is self-contained and independent of the " +
        "aircraft's electrical system, which is why the engine keeps running " +
        "when the battery does not.",
      topics: [
        {
          title: "Why the Spark Is Advanced",
          pages: [124],
          intro:
            "The spark occurs before the piston reaches top dead centre, and the " +
            "flame front is the reason.",
        },
        {
          title: "The Dual Ignition System",
          pages: [125],
          intro:
            "Two complete, independent ignition systems on one engine, and what " +
            "that buys beyond redundancy.",
          keyPoints: [
            "Two spark plugs per cylinder, two magnetos, two independent circuits.",
            "Redundancy is only half the reason: two flame fronts burn the charge more completely and more evenly than one.",
          ],
        },
        {
          title: "The Magneto",
          pages: [126, 127, 128],
          intro:
            "The self-contained generator that makes the high-tension current, " +
            "driven mechanically by the engine.",
          takeaway:
            "A magneto generates its own current from engine rotation. It needs " +
            "nothing from the battery or the alternator, which is why a total " +
            "electrical failure does not stop the engine — and why an ignition " +
            "switch left live means a propeller that can fire when it is moved by " +
            "hand.",
        },
        {
          title: "The Starter",
          pages: [129],
          intro:
            "The electric starter motor, the warning light, and what a light that " +
            "stays on is telling you.",
        },
        {
          title: "The Magneto Checks",
          pages: [130],
          intro:
            "Running the engine on each magneto in turn: what is being looked for, " +
            "and what a drop that is too large or too small means.",
        },
        {
          title: "Hand-Swinging a Propeller",
          pages: [131],
          intro:
            "The precautions, in order, for the case where the engine has to be " +
            "started by hand.",
          takeaway:
            "This is a long procedure and the length is the point: hand-swinging " +
            "is the one routine operation where a mistake is measured in fingers. " +
            "Two things run through every step. Somebody competent must be at the " +
            "controls with the brakes held and the aeroplane chocked, because an " +
            "engine that starts with nobody in it becomes an unmanned aircraft at " +
            "full power. And the person swinging works on the assumption that the " +
            "engine will fire on this swing — standing balanced, pulling the " +
            "blade down and stepping back clear, never pushing up into the arc.",
        },
        {
          title: "Electronic (Solid State) Ignition",
          pages: [132],
          intro:
            "The limitation of fixed magneto timing, and what variable timing does " +
            "about it.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 11: handling the engine, and the four things that go
     * wrong with it.
     * ===================================================================== */
    {
      title: "Engine Management",
      syllabus: ["12.24"],
      intro:
        "Operating the engine: starting it in the condition it is actually in, " +
        "handling the controls in a way that does not damage it, and the drills " +
        "for fire and failure. This chapter is the one that reads as procedure " +
        "rather than theory, and it is examinable as procedure.",
      topics: [
        {
          title: "Starting the Engine",
          pages: [134],
          intro:
            "The safety measures before the start, and the one indication that " +
            "must appear within seconds of it.",
          keyPoints: [
            "Oil pressure must rise within the time stated in the flight manual — if it does not, the engine is shut down.",
          ],
        },
        {
          title: "Starting Cold, Flooded and Hot Engines",
          pages: [135, 136, 137],
          intro:
            "Three different starts, and why the difference between them is mostly " +
            "a difference in priming.",
          misconception:
            "Pumping the throttle to prime. It is named specifically because it is " +
            "a common habit brought from cars, and on an aero engine it discharges " +
            "fuel into the induction system where a backfire can light it. Priming " +
            "is done with the primer.",
        },
        {
          title: "Stopping the Engine",
          pages: [138],
          intro:
            "The cooling period, the shutdown with the mixture, and the order the " +
            "controls come back in.",
        },
        {
          title: "Operating the Engine Well",
          pages: [139, 140, 141],
          intro:
            "Following the flight manual, cross-checking the gauges rather than " +
            "trusting one, and handling the throttle and mixture smoothly.",
          context:
            "Cross-referencing instruments is a habit worth forming here and " +
            "carrying into the instruments chapters. The oil pressure and oil " +
            "temperature gauges are the standard example: each is a check on the " +
            "other, and a reading that is impossible in combination with its " +
            "neighbour is more likely to be a failed gauge than a failed engine.",
        },
        {
          title: "Rough Running",
          pages: [142],
          intro:
            "The list of causes worth working through when the engine runs rough, " +
            "or when the vibration through the airframe changes.",
          keyPoints: [
            "Rough running and excessive vibration are the same signal: something is no longer firing evenly, or something turning is out of balance.",
            "Work the list in the order a pilot can act on it — carburettor heat, mixture, tank selection, magnetos — and note what changes with each.",
            "A vibration that appears suddenly and does not respond to any of those is a reason to land, not a reason to keep experimenting.",
          ],
        },
        {
          title: "Engine Fire on Start-Up",
          pages: [143],
          intro:
            "The drill for a fire in the air intake during the start, and the point " +
            "at which it becomes an evacuation.",
        },
        {
          title: "Engine Failure in Flight",
          pages: [144, 145],
          intro:
            "Fuel starvation and the ways it happens, and the mechanical failures " +
            "that a restart will not recover.",
          takeaway:
            "Fuel starvation remains a common cause of engine failure, and every " +
            "item on the list — insufficient fuel, the tank selector, the mixture " +
            "control, carburettor ice, contamination — is something the pilot did " +
            "or did not do. It is the most preventable failure in the subject.",
          context:
            "A stopped engine takes the ancillary equipment with it, and that is " +
            "the part people are not ready for. Everything driven off the engine " +
            "stops driving: the alternator stops charging, so the electrical " +
            "system is on battery alone and every unnecessary service should come " +
            "off; the vacuum pump stops, so the attitude indicator and the " +
            "direction indicator begin to run down and become unreliable within " +
            "minutes; on a geared or hydraulic aeroplane the pumps stop too. The " +
            "instruments that keep working are the pressure ones and the compass. " +
            "Plan the glide on those.",
        },
        {
          title: "Engine Fire in Flight",
          pages: [146],
          intro:
            "What the firewall is for, how the presence of a fire is confirmed, " +
            "and the drill.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 12: the DC electrical system.
     * ===================================================================== */
    {
      title: "The Electrical System",
      syllabus: ["12.26"],
      intro:
        "A light aeroplane's DC system: what generates the current, what stores " +
        "it, how it is distributed and protected, and what the ammeter is " +
        "telling you when something goes wrong. Note at the outset what is not " +
        "on it — the ignition system is self-contained.",
      topics: [
        {
          title: "The DC Electrical System",
          pages: [149],
          intro:
            "What the system powers, and the shape of it end to end.",
        },
        {
          title: "The Battery",
          pages: [150, 151],
          intro:
            "What the battery is for once the engine is running, how its capacity " +
            "is rated, and the two types fitted.",
          keyPoints: [
            "Battery capacity is rated in ampere-hours.",
            "Lead-acid batteries use a corrosive acid electrolyte; nickel-cadmium is the other type in service.",
            "Once the engine is running, the alternator or generator carries the load and the battery is a store, not a supply.",
          ],
        },
        {
          title: "Ground Power",
          pages: [152],
          intro:
            "Why an external supply is used for starting, and what the aeroplane " +
            "needs in order to accept one.",
        },
        {
          title: "The Alternator and the Generator",
          pages: [153, 154],
          intro:
            "The engine-driven source of current: the alternator in most light " +
            "aeroplanes, the generator in some older ones, and why the alternator " +
            "won.",
          takeaway:
            "An alternator produces AC and rectifies it to DC internally, and it " +
            "delivers useful output at low RPM. A generator is bigger and heavier " +
            "for the same output and gives little at low RPM — which is why on a " +
            "generator-equipped aeroplane the taxi is not the time to run every " +
            "electrical service.",
        },
        {
          title: "The Bus Bar and Overvoltage Protection",
          pages: [155],
          intro:
            "Where the power is distributed from, and what stops the alternator " +
            "putting out more voltage than the system can take.",
        },
        {
          title: "The Ammeter",
          pages: [156, 157, 158],
          intro:
            "The single best indication of how the electrical system is doing — " +
            "and the two quite different instruments that both go by that name.",
          misconception:
            "Reading any ammeter as though it showed the same thing. Where it sits " +
            "decides what it can tell you: a left-zero ammeter sits between the " +
            "alternator and the bus and shows alternator output, saying nothing " +
            "about the battery; a centre-zero ammeter sits between the bus and the " +
            "battery and shows the battery charging or discharging, saying nothing " +
            "about alternator output. Identify which one is fitted before " +
            "interpreting it.",
        },
        {
          title: "The Master Switch",
          pages: [159],
          intro:
            "What the master switch controls, what it deliberately does not, and " +
            "why it comes in two halves.",
          context:
            "The master switch does not control the ignition system. The magnetos " +
            "generate their own current, so an engine can run — and a propeller can " +
            "fire — with the master off. This is the single most consequential " +
            "line in the chapter and it is the reason a propeller is always " +
            "treated as live.",
        },
        {
          title: "Fuses and Circuit Breakers",
          pages: [160],
          intro:
            "Protecting the circuits from overload, and the three forms that " +
            "protection takes.",
        },
        {
          title: "A Typical Electrical System",
          pages: [161, 162],
          intro:
            "The system diagram in the flight manual, and what is generally on it.",
          diagramNotes: {
            162: "The electrical system schematic from a light aircraft flight manual: the battery and alternator feeding the bus bars through the master switch, the split between the primary bus and the avionics bus, and each circuit breaker leading off to the service it protects — lights, instruments, pumps, radios.",
          },
          context:
            "Two things on this diagram are worth finding in the aeroplane you " +
            "fly rather than reading about. The first is the split between the " +
            "main bus and the avionics bus: the avionics switch exists so that " +
            "the radios are isolated during start and shutdown, when the voltage " +
            "swings most. The second is the circuit breaker panel — the list of " +
            "what is on each breaker is the list of what stops working if one " +
            "pops, and it is much easier to read on the ground than in the air.",
        },
        {
          title: "Operating the Electrical System",
          pages: [163],
          intro:
            "The habits that keep the battery charged and the system healthy.",
        },
        {
          title: "Electrical Malfunctions",
          pages: [164, 165],
          intro:
            "The two faults the ammeter can show in flight, and the rule for a " +
            "popped circuit breaker or a blown fuse.",
          keyPoints: [
            "Reset a circuit breaker once only, and only if there is no burning smell. If it pops again, leave it.",
            "A fuse wire is replaced once, with the correct rating — never a heavier one.",
            "Insufficient charging current: shed unnecessary load and consider landing.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapter 13, split in two: the system that moves the fuel, then
     * the tanks it moves it from and the pilot's handling of them.
     * ===================================================================== */
    {
      title: "The Fuel System",
      syllabus: ["12.28"],
      intro:
        "Getting fuel from the tank to the engine: gravity where the geometry " +
        "allows it, pumps where it does not, and the selector valve that the " +
        "pilot has to get right.",
      topics: [
        {
          title: "Gravity Feed and Pump Feed",
          pages: [168, 169],
          intro:
            "Why a high-wing aeroplane can often feed its engine without a pump " +
            "and a low-wing one cannot.",
        },
        {
          title: "The Boost Pump and the Engine-Driven Pump",
          pages: [170, 171],
          intro:
            "The two pumps, what each is for, and the three jobs the boost pump " +
            "does besides standing by as a backup.",
        },
        {
          title: "Fuel Pressure",
          pages: [172],
          intro:
            "The fuel pressure gauge, and the action for a low indication in " +
            "flight.",
          diagramNotes: {
            172: "A fuel pressure gauge, calibrated 0 to 30 psi, with a green arc marking the normal operating range and red radial lines at the minimum and maximum limits.",
          },
          takeaway:
            "The gauge tells you whether fuel is reaching the engine at the " +
            "pressure it needs, which is a different question from how much is in " +
            "the tanks. A falling or low indication in flight is a sign that the " +
            "engine-driven pump is not keeping up, and the action is to turn the " +
            "auxiliary pump on — before the engine tells you, not afterwards.",
        },
        {
          title: "Selecting Tanks",
          pages: [173, 174],
          intro:
            "The fuel cock, running tanks evenly, and the checking discipline that " +
            "goes with a change of tank.",
          context:
            "Tank selection has its own topic because it has its own accident " +
            "record. The failure is rarely ignorance of the system; it is a " +
            "selector moved without being looked at, or moved to a detent between " +
            "two positions. Physically confirming the tank selected, and confirming " +
            "it has fuel in it, is the whole defence.",
        },
        {
          title: "Primers and Priming Systems",
          pages: [176],
          intro:
            "Why a carburetted engine needs raw fuel put into the cylinders to " +
            "start, and what the primer bypasses to do it.",
        },
      ],
    },

    {
      title: "Fuel Tanks and Fuel Management",
      syllabus: ["12.30"],
      intro:
        "What is inside a fuel tank and why each part is there, how quantity is " +
        "measured and how much to trust the measurement, and the ground " +
        "procedures — draining, dipping, refuelling — that decide whether the " +
        "fuel on board is the fuel you think it is.",
      topics: [
        {
          title: "Keeping Tanks Full, and Condensation",
          pages: [175],
          intro:
            "Filling the tanks overnight to keep water out, and the two reasons " +
            "not to do it without thinking.",
          misconception:
            "Treating full tanks as always the safe choice. Full tanks do minimise " +
            "condensation, but they also have to be flown within the take-off " +
            "weight next day, and fuel that warms up expands and can be vented " +
            "overboard. The decision is a trade, not a rule.",
        },
        {
          title: "Filler Caps, Vents and Expansion Space",
          pages: [177],
          intro:
            "The parts of a tank a pre-flight inspection actually looks at, and " +
            "what each one does.",
          takeaway:
            "A blocked vent is the quiet one. As fuel is drawn off, air has to " +
            "replace it; if it cannot, the tank goes to a lower pressure than " +
            "atmospheric and fuel stops flowing to an engine that was running " +
            "perfectly a moment before.",
        },
        {
          title: "Baffles, Sumps and Drains",
          pages: [178],
          intro:
            "Stopping the fuel sloshing, and giving contaminants somewhere to " +
            "settle where they can be drained off rather than burnt.",
          takeaway:
            "The tank outlet is usually a standpipe — a short pipe standing above " +
            "the floor of the tank — so that water and sediment collecting at the " +
            "lowest point are drawn off at the drain rather than into the engine. " +
            "It is also part of why the last few litres in a tank are unusable " +
            "fuel: below the top of the standpipe, the tank still has fuel in it " +
            "and the engine cannot have it.",
        },
        {
          title: "Fuel Quantity Detectors and Gauges",
          pages: [179, 180],
          intro:
            "Capacitance and float-type detectors, and the conditions under which " +
            "the cockpit gauge is worth reading.",
          keyPoints: [
            "Gauges are calibrated to be accurate in straight and level flight, and on the ground.",
            "Electric gauges need the master switch on to register.",
            "Cross-check the gauge against the dipped quantity and the time flown — never fly on the gauge alone.",
          ],
        },
        {
          title: "Strainers, Filters and the Selector Valve",
          pages: [181, 182],
          intro:
            "Everything the fuel passes through between the tank and the engine.",
        },
        {
          title: "Fuel Drums",
          pages: [183],
          intro:
            "Why fuel from a drum needs more care than fuel from a pump, and how " +
            "drums are stored.",
          keyPoints: [
            "Drums are stored on their side with the bungs at the three and nine o'clock positions, so neither bung sits in standing water.",
            "Rotate stock and check the age and grade before use — drummed fuel is the easiest way to put time-expired or wrong-grade fuel into an aeroplane.",
            "Decant through a filter, into an approved metal container that can be bonded to the aircraft. A plastic container cannot be earthed and will hold a static charge, which is the one hazard the whole refuelling drill exists to prevent.",
            "Let a drum settle before drawing from it, and drain the aircraft sumps afterwards as well as before.",
          ],
        },
        {
          title: "Fuel Checks and Draining",
          pages: [184],
          intro:
            "Draining the sumps before flight: how it is done, and how water shows " +
            "itself in the sample.",
          context:
            "Water is denser than fuel, so it collects at the lowest point and " +
            "shows as globules under the fuel in a clear container. Clear fuel is " +
            "not by itself proof of no water — a sample of pure water can look " +
            "clean — which is why the check is done with a clear container, in good " +
            "light, and with the colour of the fuel confirmed at the same time.",
        },
        {
          title: "Refuelling",
          pages: [185],
          intro:
            "The general rules, including the bonding that stops a static " +
            "discharge at the filler.",
        },
        {
          title: "Dipping Tanks",
          pages: [186],
          intro:
            "The dipstick, why it belongs to one aeroplane, and the ground it has " +
            "to be used on.",
        },
        {
          title: "Fuel Management",
          pages: [187],
          intro:
            "The pilot's fuel checklist, from grade and quantity through reserves " +
            "to leaks and caps.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 14: the oil system.
     * ===================================================================== */
    {
      title: "Lubrication Systems",
      syllabus: ["12.32"],
      intro:
        "Oil does three jobs in a piston engine, not one, and the gauges that " +
        "report on it are the pair a pilot watches most closely after the start. " +
        "This chapter covers what oil is doing, how the system moves it, and " +
        "what the temperatures and pressures mean when they move.",
      topics: [
        {
          title: "What the Oil System Does",
          pages: [190, 191],
          intro:
            "The three functions of engine oil, and the checks that confirm the " +
            "system is working.",
          keyPoints: [
            "Lubrication, cooling and cleaning — in that order of importance.",
            "Oil pressure should rise within about 30 seconds of the start; if it does not, shut down.",
            "Quantity is checked with the dipstick before flight; operation is monitored on the pressure and temperature gauges in flight.",
          ],
        },
        {
          title: "Oil Reduces Friction",
          pages: [192],
          intro:
            "Replacing metal-to-metal friction with friction inside a film of oil.",
        },
        {
          title: "Cooling and Cleaning",
          pages: [193],
          intro:
            "Carrying heat away from the working parts, and carrying dirt to the " +
            "filter.",
        },
        {
          title: "Viscosity and Oil Grades",
          pages: [194],
          intro:
            "The property that has to hold across the whole range of engine " +
            "temperatures, and what high and low viscosity mean in practice.",
        },
        {
          title: "Wet Sump and Dry Sump Systems",
          pages: [195, 197],
          intro:
            "Where the oil is stored between trips through the engine, and the two " +
            "answers to that question.",
        },
        {
          title: "Relief Valve, Screens and Filters",
          pages: [198, 199],
          intro:
            "Preventing over-pressure, and keeping the oil clean enough to be worth " +
            "circulating.",
          context:
            "Between the pump and the parts it lubricates, the oil travels through " +
            "passages drilled through the crankcase and the crankshaft itself — " +
            "the oil galleries. They are the reason the relief valve and the " +
            "filters matter as much as they do: a gallery is a small hole in a " +
            "large casting, it cannot be inspected, and anything that blocks one " +
            "starves whatever is at the end of it while the gauge on the panel " +
            "still reads a healthy pressure.",
        },
        {
          title: "Oil System Malfunctions",
          pages: [200, 201],
          intro:
            "Low or fluctuating oil pressure, and high oil temperature — what each " +
            "can mean and what to do about it.",
          context:
            "The oil gauges are read as a pair, which is why they are called the Ts " +
            "and Ps. Pressure falling while temperature rises is the combination " +
            "that suggests oil is actually being lost; pressure normal with " +
            "temperature high more often points at how the engine is being " +
            "operated — power, mixture, airspeed, outside air temperature. The " +
            "pairing is what separates a gauge fault from an engine fault.",
        },
        {
          title: "Pre-Flight Checks of the Oil System",
          pages: [202],
          intro:
            "What the oil cooler is inspected for, and why airflow through it " +
            "matters.",
        },
        {
          title: "Periodic Oil Changes",
          pages: [203],
          intro:
            "How oil degrades over time — contamination, oxidation, and water " +
            "absorbed as the engine cools.",
        },
        {
          title: "Wrong Oil, Wrong Quantity",
          pages: [204],
          intro:
            "What using the wrong grade does, what too little and too much oil " +
            "each do, and the replenishment procedure that keeps both faults away.",
          keyPoints: [
            "Check the quantity with the aeroplane on level ground, a few minutes after shutdown, so the oil has drained back but has not gone cold.",
            "Replenish with the grade and type the flight manual names — never mix types, and never top up an ashless dispersant engine from a mineral drum or the reverse without knowing what is in it.",
            "Fill to the level the manual gives, not to the top of the dipstick. Over-filling is thrown overboard through the breather and takes oil temperature with it.",
            "Secure the filler cap and dipstick, and check the cowling area for leaks before and after the next flight — a cap left loose empties the sump in minutes.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapter 15: the engine instruments.
     * ===================================================================== */
    {
      title: "Engine Instruments",
      syllabus: ["12.34"],
      intro:
        "The gauges that report on the engine, and the mechanism inside each " +
        "one. Knowing the mechanism is what lets a pilot work out which " +
        "indications are possible when one of them misreads.",
      topics: [
        {
          title: "Tachometers",
          pages: [207],
          intro:
            "Indicating crankshaft RPM mechanically, electrically and " +
            "electronically.",
        },
        {
          title: "The Manifold Pressure Gauge",
          pages: [208],
          intro:
            "Measuring the pressure of the charge before it enters the cylinder, " +
            "and the aeroplanes that need one.",
        },
        {
          title: "Oil Pressure Gauges",
          pages: [209, 210],
          intro:
            "Direct reading and remote indicating types, and why size of aircraft " +
            "decides which is fitted.",
        },
        {
          title: "Fuel Pressure and Vacuum Gauges",
          pages: [211],
          intro:
            "Two more pressure gauges, and the bourdon tube that reads suction.",
        },
        {
          title: "Outside Air Temperature",
          pages: [212],
          intro:
            "The bi-metallic strip, and the electrical bulb type that replaces it.",
        },
        {
          title: "Fuel Quantity and Fuel Flow",
          pages: [213],
          intro:
            "Variable resistance and capacitance quantity gauges, and the " +
            "instrument that measures fuel consumed rather than fuel remaining.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 16, split in two: the pressures themselves and the system
     * that senses them, then the three instruments driven by it.
     * ===================================================================== */
    {
      title: "Air Pressure and the Pitot-Static System",
      syllabus: ["12.36"],
      intro:
        "Three of the six basic flight instruments are pressure instruments, " +
        "and all three are wrong in the same way when the system feeding them " +
        "is blocked. Get the two pressures straight first and the instruments " +
        "and their errors follow from them.",
      topics: [
        {
          title: "The Two Families of Flight Instrument",
          pages: [215],
          intro:
            "Pressure instruments and gyroscopic instruments — the division the " +
            "next several chapters follow.",
          context:
            "This split organises the next several chapters, and it is worth " +
            "holding because it also organises the failures. The pressure " +
            "instruments — airspeed indicator, altimeter, vertical speed " +
            "indicator — all read from the pitot-static system, so one blocked " +
            "port can affect several of them at once. The gyroscopic instruments " +
            "— attitude indicator, direction indicator, turn coordinator — depend " +
            "on something spinning, so they fail with the vacuum pump or the " +
            "electrical supply that drives them. Knowing which family an " +
            "instrument belongs to tells you what else is likely to be wrong when " +
            "it misreads.",
        },
        {
          title: "Static Pressure",
          pages: [216, 217],
          intro:
            "The pressure of the surrounding air, exerted equally in all " +
            "directions, and what happens to it with height.",
        },
        {
          title: "Dynamic Pressure",
          pages: [218, 219, 220],
          intro:
            "The extra pressure on a forward-facing surface caused by motion, and " +
            "the two things that decide how strong it is.",
          takeaway:
            "Dynamic pressure depends on speed and on density. That is why the " +
            "airspeed indicator — which measures dynamic pressure — under-reads " +
            "true airspeed as the aeroplane climbs into thinner air, and it is the " +
            "same fact that appears again in the lift formula.",
        },
        {
          title: "Total Pressure",
          pages: [221],
          intro:
            "Static plus dynamic, which is what the pitot tube senses.",
          definition:
            "Total pressure, also called pitot pressure, is static pressure plus " +
            "dynamic pressure. Static pressure exists whether the aeroplane is " +
            "moving or not; dynamic pressure exists only when it is moving.",
          term: "Total pressure",
        },
        {
          title: "The Pitot-Static System",
          pages: [223],
          intro:
            "The static vent, the pitot tube, and which instrument each of them " +
            "feeds.",
          keyPoints: [
            "The static vent feeds the altimeter, the VSI and the ASI.",
            "The pitot tube feeds the ASI alone.",
            "The ASI is therefore the only instrument on both — which is why a pitot blockage affects it alone, and a static blockage affects all three.",
          ],
        },
      ],
    },

    {
      title: "The Airspeed Indicator, Altimeter and VSI",
      syllabus: ["12.36"],
      intro:
        "The three pressure instruments themselves: what each mechanism does " +
        "with the pressure it is given, the speeds and errors a pilot has to " +
        "know by name, and how each instrument behaves when its plumbing is " +
        "blocked.",
      topics: [
        {
          title: "How the Airspeed Indicator Works",
          pages: [224],
          intro:
            "Subtracting static from total pressure to leave dynamic pressure, and " +
            "what the resulting reading is proportional to.",
        },
        {
          title: "Colour Coding on the ASI",
          pages: [225],
          intro:
            "The arcs and their limits, which are the same on every aeroplane " +
            "whatever the numbers behind them.",
          context:
            "The arcs encode the V-speeds so that a pilot can fly an unfamiliar " +
            "type from the face of the instrument. The white arc runs from VS0 to " +
            "VFE and is the flap operating range; the green arc runs from VS1 to " +
            "VNO and is the normal operating range; the yellow arc is the caution " +
            "range, to be used only in smooth air; and the red line is VNE, which " +
            "is never exceeded.",
        },
        {
          title: "IAS, TAS and Groundspeed",
          pages: [226, 227, 228],
          intro:
            "Three speeds that get confused with one another, and the correction " +
            "that takes you from each to the next.",
          misconception:
            "Treating the airspeed indicator as broken because it does not show " +
            "the speed over the ground, or the true speed through the air. It is " +
            "calibrated for ISA sea level conditions and reads dynamic pressure, " +
            "which is exactly what the wing responds to — so the stall always " +
            "happens at the same indicated airspeed for a given weight and " +
            "configuration, at any altitude.",
        },
        {
          title: "Errors of the Airspeed Indicator",
          pages: [229],
          intro:
            "Instrument, pressure (position), compressibility and density errors, " +
            "and the mnemonic the book hangs them on.",
          keyPoints: [
            "Instrument error — the mechanism itself: manufacturing tolerances and wear in the capsule, linkage and pointer.",
            "Pressure, or position, error — the static vent cannot sample undisturbed air perfectly, and the error grows in unbalanced flight and at high angles of attack.",
            "Compressibility error — at higher speeds the air is compressed against the pitot rather than flowing round it, so the instrument over-reads. It is negligible at light aircraft speeds.",
            "Density error — the ASI is calibrated for sea level ISA density, so as the aeroplane climbs into thinner air the indicated airspeed reads progressively less than the true airspeed.",
          ],
          context:
            "The mnemonic on this page — Ice Tea, Perfect Cold Drink — is the " +
            "book's own way of holding the four errors: Instrument, Pressure " +
            "(position), Compressibility, Density. It is worth knowing the order " +
            "they are applied in as well: instrument and position error take the " +
            "indicated airspeed to calibrated airspeed, compressibility takes that " +
            "to equivalent airspeed, and density takes that to true airspeed.",
        },
        {
          title: "The Altimeter",
          pages: [230, 231, 232],
          intro:
            "The aneroid capsule, the subscale, and reading height from static " +
            "pressure.",
        },
        {
          title: "Altimeter Pressure and Temperature Errors",
          pages: [233, 234],
          intro:
            "The error you can set out — pressure — and the one you cannot: there " +
            "is no temperature correction on the instrument.",
          takeaway:
            "The altimeter is calibrated for ISA. Fly from high pressure to low, " +
            "or from warm air into cold, without updating the subscale and the " +
            "altimeter over-reads — the aeroplane is lower than indicated. \"High " +
            "to low, look out below\" is worth carrying into the navigation and " +
            "meteorology subjects, where it appears again.",
        },
        {
          title: "The Vertical Speed Indicator",
          pages: [235],
          intro:
            "Measuring the rate of change of static pressure with a capsule and a " +
            "calibrated leak.",
        },
        {
          title: "Errors of the VSI",
          pages: [236],
          intro:
            "Position error, lag, and the instantaneous VSI that addresses the " +
            "second of them.",
        },
        {
          title: "Pre-Flight Checks of the Pressure Instruments",
          pages: [237],
          intro:
            "What each of the three should read on the ground, and the one thing " +
            "never to do to a pitot tube.",
        },
        {
          title: "Blockages in Flight, and the Alternate Static Source",
          pages: [238, 239],
          intro:
            "How a blocked pitot tube behaves, how a blocked static vent behaves, " +
            "and what changes when cabin air is used as the static source.",
          keyPoints: [
            "Pitot blocked: the ASI alone is affected — it holds pressure, so the reading climbs in a climb and falls in a descent.",
            "Static blocked: all three instruments are affected, and the alternate static source is the remedy.",
            "On alternate static, cabin pressure is lower than outside: the ASI and altimeter read high, and the VSI settles down once it has adjusted.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapter 17: the magnetic compass.
     * ===================================================================== */
    {
      title: "Magnetic Instruments",
      syllabus: ["12.38"],
      intro:
        "The compass is the only direction instrument that needs no power and " +
        "keeps working when everything else has stopped. The price of that is a " +
        "list of errors, and every one of them follows from the same fact: the " +
        "Earth's flux lines do not run horizontally except near the equator.",
      topics: [
        {
          title: "Describing Direction",
          pages: [241],
          intro:
            "Cardinal points and the 360° graduated circle, measured from True or " +
            "Magnetic north.",
        },
        {
          title: "The Magnetic Compass",
          pages: [242],
          intro:
            "The compass window, the lubber line, and the permanent magnet that " +
            "needs no power source.",
        },
        {
          title: "The Earth's Magnetic Field and the Angle of Dip",
          pages: [243, 244],
          intro:
            "The field the compass is aligning with, and the angle its flux lines " +
            "make with the surface at different latitudes.",
          takeaway:
            "Dip is the root of the compass's two worst errors. Near the equator " +
            "the flux lines are close to horizontal and the magnet lies flat; " +
            "towards the poles they angle steeply into the ground and drag the " +
            "magnet with them. Acceleration error and turning error are both that " +
            "vertical component making itself felt.",
        },
        {
          title: "Construction of the Compass",
          pages: [245, 252],
          intro:
            "The pendulous suspension that keeps the magnet nearly level, the way " +
            "dip is compensated for, and the direct reading compass built around " +
            "it.",
          context:
            "Dip is compensated for by construction rather than by adjustment. The " +
            "magnet assembly is hung pendulously from a pivot above its own centre " +
            "of gravity, so it sits low and hangs nearly level whatever the flux " +
            "lines are doing — which leaves the horizontal component H doing " +
            "almost all the work of aligning it. The whole assembly sits in a " +
            "sealed, liquid-filled bowl, which damps the swinging and supports " +
            "the weight of the magnet on the pivot. What is left over is residual " +
            "dip: the small amount of tilt the compensation does not remove, " +
            "which grows with latitude and is the reason a compass is unusable " +
            "close to the magnetic poles.",
        },
        {
          title: "Acceleration and Turning Errors",
          pages: [246, 247],
          intro:
            "The two errors in flight: one that appears when speed changes, one " +
            "that appears when the aeroplane banks.",
          keyPoints: [
            "Acceleration error is greatest on easterly and westerly headings, and is nil on north and south.",
            "Turning error arises from the vertical component of the Earth's field acting on a banked magnet.",
            "Both mean the compass is only reliable in steady, level, unaccelerated flight — which is when the direction indicator is realigned against it.",
          ],
        },
        {
          title: "Parallax Error and Variation",
          pages: [248, 249],
          intro:
            "The error caused by reading the card from an angle, and the " +
            "difference between True and Magnetic direction.",
          definition:
            "Variation is the angular difference between True north and Magnetic " +
            "north at a given place. It is a property of the Earth, is printed on " +
            "the chart, and changes slowly over years.",
          term: "Variation",
        },
        {
          title: "Deviation",
          pages: [250, 251],
          intro:
            "The error caused by the aeroplane's own metal and electrical systems, " +
            "the correction card, and what a pilot can do to make it worse.",
          misconception:
            "Confusing deviation with variation. Variation belongs to the place " +
            "and is on the chart; deviation belongs to the individual aeroplane and " +
            "is on a card beside the compass, produced by an engineer during a " +
            "compass swing. A headset or a clipboard put down near the compass " +
            "invalidates that card without anyone noticing.",
        },
        {
          title: "Compass Serviceability Checks",
          pages: [253],
          intro:
            "What the pre-flight inspection looks for: security, leaks, bubbles, " +
            "discolouration, and a current deviation card.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 18, split in two: the principles and their power supply,
     * then the four instruments built on them.
     * ===================================================================== */
    {
      title: "Gyroscopic Principles and Power Supplies",
      syllabus: ["12.40"],
      intro:
        "Two properties of a fast-spinning rotor — rigidity and precession — " +
        "carry three of the six basic instruments. Both properties, and the " +
        "suction that keeps the rotor spinning, have to be understood before the " +
        "instruments make sense.",
      topics: [
        {
          title: "The Gyroscopic Instruments and How They Are Driven",
          pages: [255],
          intro:
            "Which instruments are gyroscopic, and the three ways of powering " +
            "them.",
          diagramNotes: {
            255: [
              "The artificial horizon, showing pitch against the horizon bar and bank against the scale of 10, 20, 30, 45 and 60 degrees around the top.",
              "The direction indicator, with the compass card around a fixed aircraft symbol.",
              "The turn coordinator, marked D.C. ELEC. for its power source, with the aircraft symbol showing rate of turn and the balance ball beneath it. The words NO PITCH INFORMATION are a warning that the wings on this instrument indicate turn only.",
            ],
          },
          takeaway:
            "The reason the power sources are worth learning is redundancy. In a " +
            "typical light aircraft the attitude indicator and direction " +
            "indicator run on the vacuum pump and the turn coordinator runs on " +
            "the electrical system, so a single failure takes out two instruments " +
            "and leaves the third. Knowing which of yours is on which supply is " +
            "what tells you, in the moment, which instrument to keep believing.",
        },
        {
          title: "The Vacuum System",
          pages: [256],
          intro:
            "The engine-driven pump, the suction it produces, and the relief valve " +
            "that regulates it.",
        },
        {
          title: "The Venturi",
          pages: [257],
          intro:
            "Suction from an airframe-mounted venturi, and the disadvantage that " +
            "comes with it.",
        },
        {
          title: "Gyroscopic Properties",
          pages: [258],
          intro:
            "What a gyroscope is, the speed it turns at, and the freedom of " +
            "movement its mounting gives it.",
        },
        {
          title: "Rigidity",
          pages: [259],
          intro:
            "The tendency of a spinning rotor to hold its alignment in space, and " +
            "what decides how strongly.",
        },
        {
          title: "Precession",
          pages: [260],
          intro:
            "A force applied to a spinning rotor taking effect 90° further round in " +
            "the direction of rotation.",
          context:
            "Precession is not only an error to be corrected. Rigidity is what the " +
            "direction indicator and the artificial horizon use to hold a " +
            "reference, while precession is what the turn indicator uses to measure " +
            "rate of turn. The same two properties, put to opposite purposes.",
        },
        {
          title: "Gimbal Rings",
          pages: [261, 262],
          intro:
            "Mounting the rotor so that the property you want is the one the " +
            "instrument displays.",
        },
      ],
    },

    {
      title: "The Gyroscopic Instruments",
      syllabus: ["12.40"],
      intro:
        "The turn indicator, the turn co-ordinator, the direction indicator and " +
        "the artificial horizon — what each shows, what it cannot show, and how " +
        "each behaves when the suction driving it is wrong.",
      topics: [
        {
          title: "The Turn Indicator",
          pages: [263, 264],
          intro:
            "Rate of turn measured by precession, and what happens to the " +
            "indication when suction is low or high.",
          misconception:
            "Reading the turn indicator as an angle of bank. It shows rate of turn " +
            "and nothing else. A heading change may well have been produced by " +
            "banking, but the instrument has no way of sensing bank and does not " +
            "display it.",
        },
        {
          title: "The Turn Co-ordinator",
          pages: [265],
          intro:
            "The same information presented as a small aeroplane, plus the one " +
            "thing it senses that the turn indicator does not.",
        },
        {
          title: "The Co-ordination Ball",
          pages: [266],
          intro:
            "The one instrument on the panel with no power source at all, working " +
            "under gravity and inertia alone.",
        },
        {
          title: "The Direction Indicator",
          pages: [267, 268],
          intro:
            "Rigidity used to hold a heading reference, the suction range it needs, " +
            "and what incorrect suction does to it.",
          takeaway:
            "The direction indicator has no idea where north is. It is a gyro " +
            "holding a direction you gave it, so it has to be set against the " +
            "magnetic compass in steady level flight — and it drifts, which is " +
            "why it is reset roughly every fifteen minutes. Everything else in " +
            "this topic follows from that one fact: it is precise and it is not " +
            "self-correcting, while the compass is self-correcting and imprecise, " +
            "and a pilot uses the two together.",
        },
        {
          title: "The Electrically Driven DI",
          pages: [269],
          intro:
            "What an electric drive buys over a suction drive.",
        },
        {
          title: "Realigning the DI",
          pages: [270],
          intro:
            "Why the DI drifts, how it is reset against the compass, and what " +
            "toppling looks like.",
          takeaway:
            "Synchronising the DI — realigning it against the magnetic compass — is " +
            "done in steady, level, unaccelerated flight, because that is the only " +
            "condition in which the compass itself is telling the truth. Do it " +
            "before every heading change that matters and roughly every fifteen " +
            "minutes in the cruise. The two instruments cover each other's " +
            "weaknesses exactly: the compass wanders in every turn and " +
            "acceleration but never drifts, the DI is steady through both but " +
            "drifts all the time.",
        },
        {
          title: "The Artificial Horizon",
          pages: [271, 272, 273],
          intro:
            "The earth gyro with a vertical spin axis, the pendulous unit that " +
            "keeps it upright, and its suction and start-up limitations.",
          keyPoints: [
            "The artificial horizon is the only instrument that shows both pitch attitude and bank angle directly.",
            "It needs about 3.5–4.5 inches of mercury; the bar should stabilise about a minute after start and reach operating RPM within three.",
            "Low suction makes it sluggish and inaccurate — a failure that develops slowly and is easy to miss.",
          ],
        },
      ],
    },

    /* =====================================================================
     * Book chapter 19, split in two: what the boxes do, then what the glass
     * cockpit does with what they produce.
     * ===================================================================== */
    {
      title: "GNSS, TCAS and TAWS",
      syllabus: ["12.42", "12.44", "12.46"],
      intro:
        "Satellite position fixing and the two warning systems built on knowing " +
        "where you are: one that watches other aeroplanes, one that watches the " +
        "ground.",
      topics: [
        {
          title: "The Global Positioning System",
          pages: [276],
          intro:
            "GNSS and GPS, who operates the system used in New Zealand, and on what " +
            "terms.",
        },
        {
          title: "Ranging",
          pages: [277],
          intro:
            "Measuring the time a coded signal takes to arrive and turning it into " +
            "a distance — and why the timing has to be so precise.",
        },
        {
          title: "Receiver Autonomous Integrity Monitoring",
          pages: [278],
          intro:
            "How the receiver checks satellites against one another and warns when " +
            "the position can no longer be trusted.",
          context:
            "RAIM matters because a GPS position is confidently displayed whether " +
            "it is right or not. The receiver has no independent view of the world, " +
            "so the only cross-check available is between satellites — which is " +
            "exactly what RAIM does, and why a RAIM warning is a reason to stop " +
            "navigating by it rather than a nuisance message.",
        },
        {
          title: "Accuracy",
          pages: [279],
          intro:
            "What degrades a GPS position: the ionosphere and troposphere, " +
            "interference, and the geometry of the satellites in view.",
        },
        {
          title: "Traffic Alert and Collision Avoidance System",
          pages: [280],
          intro:
            "Interrogating other aircraft's transponders to warn of a conflict, and " +
            "what the other aircraft must be doing for it to work.",
        },
        {
          title: "TAWS and GPWS",
          pages: [281, 282],
          intro:
            "Warning of controlled flight into terrain from a terrain database, and " +
            "the down-looking radio altimeter system that came before it.",
          takeaway:
            "GPWS looked down; TAWS looks ahead. That single difference is why GPWS " +
            "could give no warning of rising ground in front of an aeroplane in " +
            "level flight, and it is the reason the database-and-GPS approach " +
            "replaced it.",
        },
      ],
    },

    {
      title: "EFIS, Advanced Sensors and ELT",
      syllabus: ["12.48", "12.50"],
      intro:
        "The glass cockpit: what is on the two screens, where the data comes " +
        "from once there are no mechanical instruments left, and how failure is " +
        "handled. Then the emergency locator transmitter, which is the one " +
        "system in this chapter that matters most when everything else has " +
        "stopped.",
      topics: [
        {
          title: "The Glass Cockpit",
          pages: [283],
          intro:
            "What an Electronic Flight Information System is and the two displays " +
            "it typically has.",
        },
        {
          title: "The Primary Flight Display",
          pages: [284],
          intro:
            "The six conventional instruments gathered onto one screen, and what " +
            "surrounds them.",
        },
        {
          title: "The Multi-Function Display",
          pages: [285],
          intro:
            "Engine indications down one side, and everything else — mapping, " +
            "planning, terrain — on the rest.",
        },
        {
          title: "System Inputs and the Air Data Computer",
          pages: [286],
          intro:
            "Turning pitot and static pressure into digital data the displays can " +
            "use.",
        },
        {
          title: "AHRS and the Ring Laser Gyro",
          pages: [287, 288],
          intro:
            "The strapdown attitude and heading reference system that replaces the " +
            "spinning gyros, and the laser device at the heart of it.",
        },
        {
          title: "Magnetometers",
          pages: [289],
          intro:
            "Any device that aligns itself with the Earth's flux lines — including " +
            "the flux valve that feeds heading to the glass cockpit.",
        },
        {
          title: "Engine Data and System Architecture",
          pages: [290],
          intro:
            "How engine measurements reach the EFIS, and how the units are wired " +
            "together.",
        },
        {
          title: "Redundancy",
          pages: [291],
          intro:
            "What is flagged when a unit fails, and the decision that then belongs " +
            "to the pilot.",
        },
        {
          title: "Human Factors and Airmanship",
          pages: [292],
          intro:
            "What an integrated display does for the instrument scan, and the " +
            "habit it can quietly take away.",
          context:
            "This page is doing something the rest of the chapter is not: warning " +
            "that a better display can produce a worse pilot. A clean, integrated " +
            "screen makes the scan easier and situational awareness better, and it " +
            "also holds the eyes inside the cockpit. The lookout is not part of the " +
            "instrument scan and no display improves it.",
        },
        {
          title: "ELT Systems",
          pages: [293],
          intro:
            "The frequencies an emergency locator transmitter uses and what " +
            "triggers it.",
          definition:
            "An emergency locator transmitter is a self-contained, " +
            "battery-powered beacon that transmits a distress signal so search " +
            "and rescue can find the aeroplane. It is fired either by its own " +
            "impact switch — a G-switch that closes under the deceleration of a " +
            "crash — or by hand from the cockpit or from the unit itself.",
          term: "The ELT",
          keyPoints: [
            "406 MHz is the signal the satellite system listens for: it is digital, it carries a coded identity for the aircraft, and it transmits in short bursts rather than continuously.",
            "121.5 MHz is the analogue homing signal, transmitted continuously so an aircraft or a ground party can steer towards it once it is in the area.",
            "The coded identity only helps if it is registered, and it points at whoever registered it — an ELT that changes aeroplane, or an aeroplane that changes owner, needs the registration changed with it.",
            "The battery has an expiry date and the unit has an inspection interval; both are maintenance items, and both are worth knowing are in date before a flight over country you would not want to walk out of.",
          ],
          context:
            "The commonest ELT event is not a crash. It is an inadvertent " +
            "activation — a heavy landing, or a knock while the aeroplane is being " +
            "moved — and the pilot never knows unless they look. Listening on " +
            "121.5 after shutdown, or before leaving the aircraft, is a five " +
            "second check that saves a search being launched for an aeroplane " +
            "sitting safely on its stand.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 20: where the book's second section opens. Three small
     * subjects that share a chapter in the source and keep sharing one here.
     * ===================================================================== */
    {
      title: "Cooling Systems and the Undercarriage",
      syllabus: ["12.52", "12.54", "12.56"],
      intro:
        "How an air-cooled engine is kept cool and what the pilot does when it " +
        "is not, the landing gear that carries the aeroplane on the ground, and " +
        "a first look at what flaps do to the glide.",
      topics: [
        {
          title: "The Cooling System",
          pages: [296, 297],
          intro:
            "Cooling fins, cowling ducts, baffles and cowl flaps — and the flight " +
            "condition in which all of it works least well.",
          takeaway:
            "Air cooling is least effective at high power and low airspeed. That " +
            "is the climb after take-off, which is exactly when the engine is " +
            "working hardest — and it is why a prolonged climb at a low airspeed " +
            "is a temperature problem before it is anything else.",
        },
        {
          title: "Operating to Keep Temperatures Down",
          pages: [298],
          intro:
            "What to avoid when there is no cylinder head temperature gauge and no " +
            "cowl flaps to work with — and the opposite fault, which is cooling " +
            "the engine too fast.",
          context:
            "Overheating and overcooling are both handled with the throttle, in " +
            "opposite directions. Overheating comes from high power at low " +
            "airspeed — the long climb, the extended ground run — and the remedy " +
            "is to lower the nose for more airflow, enrich the mixture, or open " +
            "the cowl flaps. Overcooling comes from the reverse: closing the " +
            "throttle abruptly at altitude and descending fast leaves the " +
            "cylinders in a cold blast with no combustion warming them, and the " +
            "sudden contraction is what cracks cylinder heads. The precaution is " +
            "a gradual power reduction, a descent flown with some power on, and " +
            "carburettor heat where a long low-power descent cannot be avoided.",
        },
        {
          title: "The Undercarriage",
          pages: [299],
          intro:
            "Tricycle and tailwheel arrangements, what the gear does besides " +
            "carrying the weight, and retractable systems.",
        },
        {
          title: "Flaps and the Glide",
          pages: [300],
          intro:
            "What extending flap does to the lift/drag ratio, the attitude and the " +
            "stalling speed.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 21: the flying controls.
     * ===================================================================== */
    {
      title: "The Flying Controls",
      syllabus: ["12.58"],
      intro:
        "The three primary controls, the three axes they work about, and the " +
        "secondary devices — trim tabs, balance tabs, flaps — that make them " +
        "usable. Each primary control has a primary effect and, for two of " +
        "them, a further effect that has to be anticipated.",
      topics: [
        {
          title: "The Flight Controls",
          pages: [303],
          intro:
            "Ailerons, elevator and rudder, and the cables, pulleys and stops " +
            "between them and the cockpit.",
        },
        {
          title: "The Three Axes",
          pages: [304, 305, 306],
          intro:
            "Pitch about the lateral axis, roll about the longitudinal axis, yaw " +
            "about the normal axis — and which control produces each.",
          misconception:
            "Pairing the axis with the control by name. The elevator produces " +
            "pitch, which is rotation about the lateral axis — the one running " +
            "wingtip to wingtip; roll happens about the longitudinal axis, which " +
            "runs nose to tail. Learn each axis by the line it runs along and the " +
            "pairing stops being something to memorise.",
        },
        {
          title: "Associated Controls",
          pages: [307],
          intro:
            "Wing flaps and trim tabs — the controls that are not primary but are " +
            "used on every flight.",
          context:
            "The primary controls — ailerons, elevator and rudder — change the " +
            "aeroplane's attitude. These two do something different. Flaps change " +
            "the shape of the wing, so they change the lift and drag available at " +
            "a given speed and are used to steepen an approach and lower the " +
            "touchdown speed. Trim tabs change nothing about the aeroplane's " +
            "performance at all: they take the control load off the pilot so that " +
            "a chosen attitude can be held without holding the control. Both are " +
            "covered properly in the topics that follow.",
        },
        {
          title: "How Flight Control Is Achieved",
          pages: [308, 309, 310],
          intro:
            "What deflecting a control surface actually does to the aerofoil it is " +
            "part of.",
          // Three pages of drawings and not one word of text. The mechanism the
          // drawings show is written out here so they are explained rather than
          // merely displayed.
          context:
            "Every control works the same way: deflecting the surface changes the " +
            "camber of the aerofoil it belongs to, that aerofoil makes a force in " +
            "the new direction, and the force acts at a distance from the centre " +
            "of gravity — so the aeroplane rotates about the CG. Pull the control " +
            "column back and the elevator goes up, which makes a downward force " +
            "at the tail and lifts the nose. Move the column right and the right " +
            "aileron goes up while the left goes down, so the left wing makes more " +
            "lift than the right and the aeroplane rolls right. The surface never " +
            "pushes the aeroplane where you want it; it makes a force that turns " +
            "the aeroplane about its own centre of gravity.",
          diagramNotes: {
            308: "Column back, elevator up, a downward force at the tail — and the nose rises about the CG. Column forward does the reverse.",
            309: [
              "A fixed tailplane with a moving elevator, and an all-moving (slab) tailplane, which is the whole surface.",
              "A slab tailplane on the aeroplane: there is no separate elevator hinged to it.",
            ],
            310: "The ailerons: the down-going one adds camber and lift, the up-going one takes it away, and the aeroplane rolls about the CG.",
          },
        },
        {
          title: "Summary of the Main Flight Controls",
          pages: [311],
          intro:
            "The plane, axis, control, primary effect and further effect, set out " +
            "in one table.",
          keyPoints: [
            "Elevator: pitch about the lateral axis, no further effect.",
            "Ailerons: roll about the longitudinal axis, further effect yaw.",
            "Rudder: yaw about the normal axis, further effect roll.",
          ],
        },
        {
          title: "The Effect of Airspeed and Slipstream",
          pages: [312, 313, 314],
          intro:
            "Why the controls feel firmer as speed increases, and the two things " +
            "the propeller slipstream does that the airspeed alone does not.",
          context:
            "The slipstream reaches the elevator and rudder but not the ailerons. " +
            "That is why a burst of power gives an immediate response in pitch and " +
            "yaw at a speed where the ailerons are still soft, and it is worth " +
            "remembering when the aeroplane is slow and the power is up — the go " +
            "around, and the approach to the stall.",
        },
        {
          title: "Trim Controls",
          pages: [315],
          intro:
            "Relieving the pilot of a constant control load, and the small " +
            "aerodynamic force that does it.",
        },
        {
          title: "Balance of Controls",
          pages: [316, 317],
          intro:
            "Inset hinges, horn balances and balance tabs — three ways of reducing " +
            "the load a pilot feels.",
        },
        {
          title: "Anti-Balance Tabs",
          pages: [318, 319],
          intro:
            "The tab fitted to an all-moving tailplane, which adds feel rather " +
            "than removing it.",
        },
        {
          title: "The Flaps",
          pages: [320, 321],
          intro:
            "Changing the effective camber to raise lifting capacity, and what " +
            "that does to the nose attitude at a given indicated airspeed.",
        },
        {
          title: "Aircraft Response During Flap Extension",
          pages: [322],
          intro:
            "The pitching moment that comes with lowering or raising flap, and why " +
            "it differs between a high wing and a low wing.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 22: straight and level flight, and the performance that
     * follows from it.
     * ===================================================================== */
    {
      title: "Straight and Level Flight",
      syllabus: ["12.60"],
      intro:
        "The four forces in balance, what has to change when speed changes, and " +
        "the two curves — power required and power available — that decide " +
        "maximum speed, maximum range and maximum endurance.",
      topics: [
        {
          title: "The Four Forces",
          pages: [325],
          intro:
            "Lift, weight, thrust and drag, and where each acts.",
          keyPoints: [
            "Lift acts at right angles to the relative airflow, through the centre of pressure.",
            "Weight acts vertically downwards, through the centre of gravity.",
            "Thrust acts forward along the propeller's axis; drag acts backwards, parallel to the relative airflow.",
            "None of the four acts through the same point as another, which is why the aeroplane has pitching moments to be trimmed out — the subject of the next two topics.",
          ],
        },
        {
          title: "The Condition for Straight and Level Flight",
          pages: [326],
          intro:
            "Equilibrium: lift equal to weight, thrust equal to drag, wings level.",
        },
        {
          title: "Changing Speed in Level Flight",
          pages: [327, 328, 329],
          intro:
            "The relationship between power, attitude and speed — and what happens " +
            "if the speed is allowed to decay far enough.",
          takeaway:
            "Holding height while the speed changes means changing the angle of " +
            "attack to keep lift constant: nose down as it accelerates, nose up as " +
            "it slows. Take enough power off and the attitude required for level " +
            "flight reaches the critical angle — which is the slow flight " +
            "demonstration, and the reason it is flown with height in hand.",
        },
        {
          title: "Pitching Moments",
          pages: [330],
          intro:
            "Why the forces do not act through fixed points: the centre of gravity " +
            "moves with loading and fuel burn, the centre of pressure with angle of " +
            "attack.",
        },
        {
          title: "Power Required and Power Available",
          pages: [331, 332],
          intro:
            "The two curves, the maximum speed in level flight where they meet, " +
            "and the excess power between them.",
          keyPoints: [
            "Maximum level flight speed is where all the power available is being used to balance drag.",
            "The gap between the curves is excess power, and excess power is what climb performance is made of.",
          ],
        },
        {
          title: "Range and Endurance",
          pages: [333],
          intro:
            "The distinction between flying for distance and flying for time.",
          context:
            "The two words are used loosely in conversation and mean quite " +
            "different things here. Range is distance — how far the aeroplane can " +
            "go on the fuel it has. Endurance is time — how long it can stay " +
            "airborne on the same fuel. They are flown at different speeds and " +
            "they matter in different situations: range is what a cross-country " +
            "is planned on, and endurance is what decides how long you can hold " +
            "off an aerodrome that is not clear yet.",
        },
        {
          title: "Maximum Range Speed",
          pages: [334, 335],
          intro:
            "Greatest distance for the least fuel: where it is found on the power " +
            "curve, and how it is flown.",
        },
        {
          title: "Maximum Endurance Speed",
          pages: [336, 337],
          intro:
            "Greatest time in the air for the least fuel: the bottom of the power " +
            "required curve, and how it is flown.",
          misconception:
            "Assuming range and endurance are flown the same way because both " +
            "save fuel. They are different speeds and different altitudes: range " +
            "wants height and a favourable wind, endurance wants the lowest " +
            "practical altitude and the minimum power that holds level flight. " +
            "Flying one when you needed the other costs you the thing you were " +
            "short of.",
        },
      ],
    },

    /* =====================================================================
     * Book chapters 23-25: the climb, the descent and the turn.
     * ===================================================================== */
    {
      title: "Climbing",
      syllabus: ["12.62"],
      intro:
        "Climbing is spending energy the engine is producing, or spending speed " +
        "the aeroplane already had. The steady climb is the one that matters, " +
        "and everything about its performance comes back to how much power is " +
        "left over after level flight has been paid for.",
      topics: [
        {
          title: "Two Ways to Climb",
          pages: [339, 340, 341],
          intro:
            "The zoom climb, which trades speed for height, and the steady climb, " +
            "which trades excess power for a rate.",
        },
        {
          title: "The Forces in the Climb",
          pages: [342],
          intro:
            "Why the forces in a climb are not the four of level flight rearranged " +
            "— thrust is now carrying part of the weight.",
        },
        {
          title: "Climb Performance",
          pages: [343],
          intro:
            "The three things climb performance is made of: speed, rate and angle.",
          context:
            "Three separate things, and the two that matter most are easy to " +
            "confuse. Rate of climb is height gained per minute — the figure to " +
            "maximise when you want to reach a cruising level quickly, flown at " +
            "the best rate of climb speed. Angle of climb is height gained per " +
            "unit of distance over the ground — the figure to maximise when there " +
            "is an obstacle ahead, flown at the best angle of climb speed, which " +
            "is slower. The speed in the climb is what selects between them, and " +
            "the topics that follow take each in turn.",
        },
        {
          title: "Best Rate and Best Angle of Climb",
          pages: [344, 345],
          intro:
            "Two different speeds for two different problems, and the normal climb " +
            "speed that is deliberately a little faster than either.",
          misconception:
            "Using the two speeds interchangeably. Best rate of climb is the speed " +
            "with the greatest excess of power and gives the most height per " +
            "minute; best angle of climb is the speed with the greatest excess of " +
            "thrust and gives the most height per unit of distance travelled. " +
            "Best angle is the one for clearing an obstacle; best rate is the one " +
            "for getting to altitude.",
          takeaway:
            "The normal climb speed is usually a little above best rate, because " +
            "very little climb rate is lost for the extra forward speed — and the " +
            "extra speed buys better engine cooling and a better view over the " +
            "nose.",
        },
        {
          title: "Factors Affecting Climb Performance",
          pages: [346, 347],
          intro:
            "Power, airspeed, flap, weight, manoeuvring and wind — and the one of " +
            "them that changes the angle without changing the rate.",
          keyPoints: [
            "Headwind and tailwind change the climb angle over the ground; they do not change the rate of climb.",
            "Manoeuvring in the climb absorbs excess power, and excess power is the climb.",
          ],
        },
      ],
    },

    {
      title: "Descending",
      syllabus: ["12.64"],
      intro:
        "The glide, where the aeroplane is flown by the lift/drag ratio alone, " +
        "and the power-on descent, where the pilot chooses the rate and the " +
        "angle. Two of the results here surprise people, and both are worth " +
        "getting right the first time.",
      topics: [
        {
          title: "The Glide",
          pages: [350, 351, 352],
          intro:
            "Three forces rather than four, and the direct link between the " +
            "lift/drag ratio and the angle the aeroplane descends at.",
          takeaway:
            "Glide angle is decided by the lift/drag ratio and nothing else. The " +
            "best glide speed is the speed that produces the best L/D — which was " +
            "established back in the drag chapter at around 4° angle of attack. " +
            "Flying faster or slower than it steepens the descent either way.",
        },
        {
          title: "The Effect of Weight",
          pages: [353],
          intro:
            "What changing the weight does to the glide angle, and what it does " +
            "instead.",
          misconception:
            "Expecting a heavier aeroplane to glide less far. Weight does not " +
            "affect the glide angle: a heavier aeroplane reaches its best L/D at " +
            "a slightly higher speed and covers the same distance, arriving sooner. " +
            "What weight changes is the speed to fly and the rate of descent, not " +
            "the range.",
        },
        {
          title: "The Effect of Wind",
          pages: [354],
          intro:
            "Wind changes the angle of descent over the ground, and leaves the " +
            "rate alone.",
          diagramNotes: {
            354: "One glide angle through the air drawn as three paths over the ground: still air in the middle, a steeper path into a headwind, and a shallower path with a tailwind. The aeroplane is descending at the same rate in all three — the wind has moved where it reaches the ground, not how long it takes to get there.",
          },
          takeaway:
            "Wind changes where a glide ends, not how long it lasts. The rate of " +
            "descent is set by the aerodynamics and stays the same; the ground " +
            "covered while descending is the airspeed with the wind added or " +
            "subtracted. Into a headwind the glide steepens and you land shorter, " +
            "downwind it flattens and you land further on — which is why a forced " +
            "landing field chosen without thinking about the wind is chosen " +
            "wrongly.",
        },
        {
          title: "The Power-On Descent",
          pages: [355],
          intro:
            "Using power to choose the rate and the angle independently.",
          diagramNotes: {
            355: "The forces in a descent: lift, weight, thrust and drag, with the flight path inclined downward. Weight is resolved into two parts — one balanced by lift, and a component along the flight path that assists forward motion and balances part of the drag. That component is why an aeroplane accelerates in a descent unless something is done about it.",
          },
          context:
            "A glide gives you one descent path, because the angle is fixed by " +
            "the aerodynamics. Adding power gives you two independent controls: " +
            "power sets the rate of descent and attitude sets the speed, so the " +
            "same rate can be flown at different speeds and the same speed at " +
            "different rates. That is what makes a powered approach adjustable " +
            "while it is being flown, and it is why almost every approach is " +
            "flown with power rather than glided.",
        },
        {
          title: "The Effect of Flaps",
          pages: [356],
          intro:
            "Why flap steepens the glide, and what has to happen to the nose to " +
            "hold the speed.",
        },
      ],
    },

    {
      title: "Turning",
      syllabus: ["12.66"],
      intro:
        "A turn is an acceleration towards the centre of the curve, and the only " +
        "force available to produce it is lift. Everything else in this chapter " +
        "— the extra lift needed, the extra drag, the load factor, the raised " +
        "stalling speed — follows from that one requirement.",
      topics: [
        {
          title: "The Force That Turns the Aeroplane",
          pages: [358],
          intro:
            "Why a body in motion needs a force applied to change direction, and " +
            "where the aeroplane finds it.",
        },
        {
          title: "The Level Turn",
          pages: [359],
          intro:
            "Banking to tilt the lift vector, and increasing total lift so that its " +
            "vertical component still balances weight.",
        },
        {
          title: "Drag and Power in the Turn",
          pages: [360],
          intro:
            "The extra angle of attack brings extra drag, and holding the speed " +
            "therefore takes extra thrust.",
        },
        {
          title: "Load Factor",
          pages: [361],
          intro:
            "The ratio of lift produced to weight, what it is in level flight, and " +
            "what it becomes as bank is increased.",
          definition:
            "Load factor is the ratio of the lift being generated to the weight of " +
            "the aeroplane. In straight and level flight it is 1. In a level 60° " +
            "banked turn it is 2 — the wings are carrying twice the aeroplane's " +
            "weight.",
          term: "Load factor",
        },
        {
          title: "Turn Radius and Rate of Turn",
          pages: [362],
          intro:
            "How each of them changes with bank angle, how each changes with " +
            "speed, and the rule of thumb the page gives for the bank angle a " +
            "rate one turn needs.",
          keyPoints: [
            "For a given airspeed: more bank means a smaller radius and a higher rate of turn.",
            "For a given bank angle: more speed means a larger radius and a lower rate of turn.",
            "A rate one turn is 3° per second — 180° in one minute, a full circle in two — and it is the rate instrument procedures are flown at.",
          ],
        },
        {
          title: "Climbing and Descending Turns",
          pages: [363, 364],
          intro:
            "What a bank angle costs in rate of climb, what it adds to a rate of " +
            "descent, and the rolling tendencies in each.",
          context:
            "The rolling tendencies come from the outer wing travelling further " +
            "than the inner one in the same time, so it meets the air faster and " +
            "makes more lift. In a climbing turn that overbanking tendency rolls " +
            "the aeroplane further into the turn and has to be held off with " +
            "aileron. In a descending turn the effect works the other way — the " +
            "aeroplane tends to underbank, rolling out of the turn — so the bank " +
            "has to be held on. Neither is a fault in the aeroplane; both are " +
            "expected, and knowing which to expect is what stops a student " +
            "chasing the bank angle.",
        },
        {
          title: "Steep Turns",
          pages: [365],
          intro:
            "Beyond 30° of bank: the lift required, the power required, and the " +
            "stalling speed that has moved.",
          context:
            "The steep turn is where three chapters meet. The lift needed rises " +
            "with bank, which raises the load factor, which raises the stalling " +
            "speed — and the extra induced drag needs power to hold the speed up. " +
            "A steep turn flown without adding power is an approach to a stall at " +
            "a stalling speed that is higher than usual.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 26, split in two: the stall itself, then what happens
     * when one wing goes first.
     * ===================================================================== */
    {
      title: "Stalling",
      syllabus: ["12.68"],
      intro:
        "A wing stalls at an angle, not at a speed. That single sentence " +
        "organises the whole chapter: the stalling angle is essentially fixed, " +
        "and everything that appears to change \"the stalling speed\" is really " +
        "changing the speed at which that fixed angle is reached.",
      topics: [
        {
          title: "What a Stall Is",
          pages: [368, 369, 370],
          intro:
            "Exceeding the critical angle of attack, what the airflow does, and " +
            "the nose-down pitching moment that follows.",
        },
        {
          title: "Recognising a Stall",
          pages: [371, 372],
          intro:
            "The aerodynamic symptoms of an approaching stall, and the artificial " +
            "warning that is secondary to them.",
          misconception:
            "Waiting for the stall warner. It is a device — a horn, a light, a " +
            "whistle — and it can fail or be inhibited. The reducing airspeed, the " +
            "sloppy controls and the pre-stall buffet are the aeroplane itself " +
            "telling you, and they are the indications to fly on.",
        },
        {
          title: "The Stall Is Associated with an Angle, Not a Speed",
          pages: [373],
          intro:
            "The stalling angle for a training aeroplane, and the fact that the " +
            "speed at which it is reached varies.",
          diagramNotes: {
            373: "An aeroplane at 80 knots attempting a 3g pull-out from a dive and stalling anyway: the intended flight path curves away from the actual one, which continues down. The same aeroplane stalls straight and level at 50 knots. Both stalls happen at the same angle of attack; only the speed is different.",
          },
          takeaway:
            "This is the single most important idea in the chapter, and the " +
            "figure is worth sitting with. The wing stalls when the angle between " +
            "it and the airflow reaches about 15 or 16 degrees, whatever the " +
            "airspeed happens to be. The published stalling speed is only the " +
            "speed at which that angle is reached in one particular condition — " +
            "wings level, one g, at a stated weight. Pull hard enough, bank " +
            "steeply enough or load the aeroplane heavily enough and the same " +
            "angle arrives at a much higher speed. An aeroplane can be stalled at " +
            "any speed and in any attitude.",
        },
        {
          title: "Recovering from a Stall",
          pages: [374],
          intro:
            "Reducing the angle of attack, and everything that the relationship " +
            "between angle and speed depends on.",
        },
        {
          title: "Load Factor and the Accelerated Stall",
          pages: [375],
          intro:
            "Why any additional load factor raises the stalling speed, and why the " +
            "attitude may look nothing like the one from the training exercise.",
        },
        {
          title: "Weight and Stalling Speed",
          pages: [376],
          intro:
            "A heavier aeroplane needs a higher angle of attack at a given speed, " +
            "and therefore reaches the stalling angle sooner.",
        },
        {
          title: "Altitude and Stalling Speed",
          pages: [377],
          intro:
            "The indicated airspeed at which the aeroplane stalls does not change " +
            "with altitude.",
          takeaway:
            "This follows directly from the airspeed indicator chapter. The ASI " +
            "measures dynamic pressure, and the wing responds to dynamic pressure — " +
            "so the stall arrives at the same indicated airspeed however thin the " +
            "air is. The true airspeed at the stall does rise with altitude; the " +
            "indicated airspeed does not.",
        },
        {
          title: "Power and Stalling Speed",
          pages: [378],
          intro:
            "Why the aeroplane stalls at a lower speed with power on.",
        },
        {
          title: "Flap and Stalling Speed",
          pages: [379],
          intro:
            "The increase in camber, the lower speed the same load can be carried " +
            "at, and why this is the main advantage of flap.",
        },
        {
          title: "Ice and Contamination",
          pages: [380],
          intro:
            "The two effects of ice on the wing, and which of them matters more.",
          keyPoints: [
            "Ice adds weight — but the greater effect is that it makes the airflow separate at a lower angle of attack.",
            "The stall then arrives earlier than any speed or attitude a pilot is expecting.",
            "Contamination is removed before flight; there is no technique that manages it in the air.",
          ],
        },
      ],
    },

    {
      title: "Wing Drop, Spinning and the Spiral Dive",
      syllabus: ["12.68"],
      intro:
        "What happens when one wing stalls before the other, why the instinctive " +
        "control input makes it worse, and the two spiral descents — one " +
        "stalled, one not — that are recovered in opposite ways.",
      topics: [
        {
          title: "Flight Controls Near the Stall",
          pages: [381],
          intro:
            "Why the controls go sloppy, and why the tailplane is designed not to " +
            "stall with the wing.",
        },
        {
          title: "Ailerons and the Wing Drop",
          pages: [382, 383],
          intro:
            "Why one wing reaches the critical angle first, and why aileron is not " +
            "the answer to it.",
          context:
            "Lowering the aileron on the dropping wing increases that wing's angle " +
            "of attack — the wing that is already stalled. Instead of lifting it, " +
            "the input deepens the stall on that side and adds yaw towards it. " +
            "This is the mechanism that turns a wing drop into a spin, and it is " +
            "why the recovery is rudder to prevent yaw and forward movement to " +
            "reduce the angle of attack.",
        },
        {
          title: "Flow Strips",
          pages: [384],
          intro:
            "The inboard leading-edge strip that makes the wing root stall first, " +
            "on purpose.",
        },
        {
          title: "The Spin",
          pages: [385, 386],
          intro:
            "Stalled flight in a spiral descent about a vertical axis, and " +
            "everything the aeroplane is doing at once while it happens.",
          definition:
            "Autorotation is the self-sustaining roll and yaw that keeps a spin " +
            "going. Once a stalled wing drops, that wing meets the air at a " +
            "greater angle of attack than the rising one: past the stalling angle " +
            "it therefore produces even less lift and even more drag, so it keeps " +
            "dropping and keeps being dragged back. The rolling and the yawing " +
            "feed each other and need no further input from the pilot. The " +
            "conditions for it are the two that define a spin — the wing must be " +
            "stalled, and there must be yaw.",
          term: "Autorotation",
        },
        {
          title: "Spin Recovery",
          pages: [387],
          intro:
            "The recovery actions, in order, and why the order is the order.",
          diagramNotes: {
            387: "The view forward in a developed spin: the nose well down, the propeller blurred against a horizon that is rotating rather than tilted.",
          },
          context:
            "The order matters and each step has a reason. Throttle closed and " +
            "flaps up removes the power that would otherwise steepen the spin and " +
            "the flap that was never designed for it. Full opposite rudder " +
            "attacks the yaw, which is what is actually driving the rotation. The " +
            "pause is there because the rudder needs time to work and a pilot who " +
            "does not wait will assume it has not. Only then the check forward, " +
            "which reduces the angle of attack and unstalls the wings — done too " +
            "early it can accelerate the rotation. And centralising the rudder as " +
            "the spin stops prevents a spin the other way. Done out of order the " +
            "actions can each be correct and the recovery still fail.",
        },
        {
          title: "The Spiral Dive",
          pages: [388],
          intro:
            "An unstalled spiral descent, how it differs from a spin, and its own " +
            "recovery.",
          misconception:
            "Treating a spiral dive as a spin. A spin is stalled and the airspeed " +
            "is low and steady; a spiral dive is not stalled and the airspeed is " +
            "increasing rapidly. Applying spin recovery to a spiral dive — rudder " +
            "against the rotation and the control column forward — is applied to " +
            "an aeroplane that is already fast, and the airspeed and the load " +
            "factor both go where they must not.",
        },
      ],
    },

    /* =====================================================================
     * Book chapters 27 and 29: the airframe, and the control system that
     * runs through it. Chapter 29 in the source is two pages of controls
     * followed by eleven pages of air properties that belong to
     * performance; the controls join the structure here and the air
     * properties open the performance chapters below.
     * ===================================================================== */
    {
      title: "Airframe Structure and Control Systems",
      syllabus: ["12.70", "12.76"],
      intro:
        "What a light aeroplane is built from and how the parts carry their " +
        "loads, followed by the cables, pulleys, stops and locks that connect " +
        "the cockpit controls to the surfaces they move.",
      topics: [
        {
          title: "The Airframe and Its Components",
          pages: [391, 392, 393],
          intro:
            "The six major components of a light fixed-wing aeroplane.",
          diagramNotes: {
            391: "An early Avro biplane: an open framework of wood and wire with the pilot sitting in it, and every structural member visible from outside.",
            393: "A light training aeroplane with its parts labelled — fuselage, wings and wing root, ailerons, flaps, empennage with fin, rudder, tailplane and elevators, the trim tab, the undercarriage, the engine cowling, propeller and spinner, and the position, beacon and landing lights.",
          },
          context:
            "The two pictures are a hundred years apart and they carry the same " +
            "six components. That is the point of putting them together: the " +
            "biplane wears its structure on the outside where you can see how the " +
            "loads travel, and the modern aeroplane hides the same job under a " +
            "skin. The labelled drawing is worth returning to — the rest of this " +
            "chapter uses these names without explaining them again.",
        },
        {
          title: "The Fuselage",
          pages: [394, 395],
          intro:
            "Semi-monocoque construction, and what it takes from each of the two " +
            "approaches it sits between.",
          diagramNotes: {
            395: "A cutaway of a semi-monocoque fuselage: longerons running fore and aft, frames setting the cross-section, stringers between them, and the stressed skin over the whole assembly.",
          },
          context:
            "The two approaches it sits between are worth naming. A strut or " +
            "truss structure carries the loads in an internal framework and the " +
            "covering carries nothing — strong, and heavy for what it does. A " +
            "pure monocoque carries everything in the skin with no internal " +
            "framework at all — light, and it fails badly once the skin is " +
            "damaged. Semi-monocoque takes the frames and stringers from the " +
            "first and the stressed skin from the second, so the load is shared, " +
            "and that is why almost every light aeroplane is built this way.",
        },
        {
          title: "The Wings",
          pages: [396, 397, 398, 399, 400],
          intro:
            "Spars, ribs and struts, what else lives inside a wing, and the " +
            "monoplane and biplane arrangements.",
        },
        {
          title: "The Tail Section",
          pages: [401],
          intro:
            "The empennage: fin and rudder, tailplane and elevator, built the same " +
            "way as the wings.",
        },
        {
          // Authored outright. The book describes the airframe's parts and
          // never says what any of them is made of, while the syllabus asks
          // for the precautions and the damage indications of three
          // construction types by name. Nothing here is attributed to the
          // source, because none of it is in the source.
          title: "Airframe Materials, Damage and Care",
          pages: [],
          intro:
            "What a light airframe is built from, what damage looks like in each " +
            "material, and how the aeroplane is left when it is parked. The " +
            "walk-around is the only inspection most aeroplanes get between " +
            "scheduled maintenance, and it only works if you know what you are " +
            "looking at.",
          keyPoints: [
            "Aluminium alloy: look for corrosion, cracks radiating from rivets or corners, popped or smoking rivets, dents, and skin that has wrinkled or oil-canned — wrinkles mean the structure under them has been loaded.",
            "Composite: look for delamination, crazing or star-shaped cracks in the gel coat, soft or springy areas, and resin that has gone chalky in the sun. Impact damage often spreads under an unbroken surface, so anything that has been struck is a maintenance question, not a judgement call.",
            "Fabric: look for tears, chafing where it passes over structure, slack or drumming panels, and dope that has gone brittle or faded. Fabric loses strength to ultraviolet long before it looks worn out.",
            "All three: report what you find rather than deciding what it means. The pre-flight inspection finds damage; it does not clear it.",
          ],
          context:
            "The precautions that preserve an airframe are mostly about where it " +
            "spends its time. Hangar it where you can; keep composites and fabric " +
            "out of continuous sunlight; wash salt off after coastal flying, " +
            "because aluminium corrodes fastest in exactly the places you cannot " +
            "see; keep drain holes clear so water leaves the structure instead of " +
            "sitting in it; and do not use the wrong panel as a handhold — walk " +
            "only on the walkways, and lift only at the points the manual names.",
          takeaway:
            "Tying down is part of the same job. Park into wind where the layout " +
            "allows it, chock the wheels, and picket the aeroplane at the three " +
            "tie-down rings — one under each wing, one at the tail — with rope " +
            "that has a little slack rather than none, so a gust cannot load the " +
            "structure against a rigid line. Fit the control lock or secure the " +
            "controls with the seat belt, put the pitot cover on, and shut the " +
            "windows and vents. An aeroplane damaged on the ground in a gale was " +
            "usually left facing the wrong way.",
        },
        {
          title: "The Flight Control System",
          pages: [428, 429],
          intro:
            "The runs of cable and pulley between the controls and the surfaces, " +
            "the stops that limit them, and the control lock.",
          context:
            "The control lock is the item on this page with an accident record " +
            "attached. It exists to stop the surfaces being damaged by wind on the " +
            "ground, and it does its job perfectly well during a take-off run. The " +
            "full and free check before flight is what catches it, and it is a " +
            "check of movement to the stops in every direction, not a waggle.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 28, split in two: how any propeller works, then the
     * constant speed propeller and its handling.
     * ===================================================================== */
    {
      title: "The Propeller",
      syllabus: ["12.72"],
      intro:
        "A propeller is a rotating wing. Every idea from the aerodynamics " +
        "chapters applies to it — angle of attack, total reaction, lift and " +
        "drag resolved into components — with one addition: each part of the " +
        "blade is travelling at a different speed, so each part needs a " +
        "different blade angle.",
      topics: [
        {
          title: "The Engine and Propeller Installation",
          pages: [404, 405],
          intro:
            "Where the engine sits, what the firewall is for, and the job the " +
            "propeller does with the torque it is given.",
        },
        {
          title: "The Blade as an Aerofoil",
          pages: [406, 407],
          intro:
            "The blade section at an angle of attack, and the forward force that " +
            "results.",
          diagramNotes: {
            407: "A propeller blade in section, seen from the side of the aircraft: the plane of rotation as a vertical dashed line, the blade angle between the blade and that plane, the flat blade face and the cambered blade back, and the direction of flight arrow running forward past the spinner.",
          },
          context:
            "A propeller blade is a wing that goes round instead of forward, and " +
            "every term from the aerofoil chapter applies to it — chord, camber, " +
            "angle of attack, lift and drag. What changes is the geometry. The " +
            "blade's angle of attack is measured against the airflow it actually " +
            "meets, which is the combination of its own rotation and the " +
            "aircraft's forward speed, so the same blade angle gives different " +
            "angles of attack at different airspeeds. The lift it produces points " +
            "forward and is called thrust; the drag it produces resists the " +
            "rotation and is what the engine has to overcome.",
        },
        {
          title: "Rotational Velocity",
          pages: [408],
          intro:
            "Why a point near the tip is travelling much faster than a point near " +
            "the hub at the same RPM.",
          diagramNotes: {
            408: "The same propeller at 1200 and at 2400 RPM, with arrows along each blade showing the speed of successive sections. The arrows lengthen towards the tip in both, and every arrow is longer at the higher RPM.",
          },
          takeaway:
            "A section near the tip travels much further than one near the hub in " +
            "the same revolution, so it meets the air much faster. That is why a " +
            "propeller blade is twisted — the blade angle is reduced towards the " +
            "tip so that every section works at a sensible angle of attack " +
            "instead of the root stalling while the tip windmills. It is also why " +
            "tip speed limits propeller RPM: at high enough rotational velocity " +
            "the tips approach the speed of sound, where they become noisy and " +
            "inefficient.",
        },
        {
          title: "Forward Velocity and the Helix Angle",
          pages: [409],
          intro:
            "The second velocity vector, and the angle the two of them produce " +
            "together.",
        },
        {
          title: "Helical Motion and Blade Angle",
          pages: [410, 411],
          intro:
            "The corkscrew path each blade section follows, and how angle of " +
            "attack, helix angle and blade angle relate.",
          definition:
            "The blade angle is the angle of attack plus the helix angle. Angle of " +
            "attack is measured between the chord line and the relative airflow, " +
            "exactly as it is on a wing; the helix angle is set by the combination " +
            "of rotational and forward velocity.",
          term: "Blade angle",
        },
        {
          title: "Blade Twist",
          pages: [412, 413],
          intro:
            "Why the blade angle is not the same along the blade, and what would " +
            "happen if it were.",
          takeaway:
            "Rotational velocity increases towards the tip, so a blade of constant " +
            "angle would meet the airflow at a steadily increasing angle of attack " +
            "along its length. The blade is twisted — coarse at the root, fine at " +
            "the tip — so that every section works near its most efficient angle at " +
            "once.",
        },
        {
          title: "Forces Acting on a Blade Section",
          pages: [414, 415],
          intro:
            "The total reaction resolved into thrust and propeller torque force, " +
            "and what the torque force has to be balanced by.",
        },
        {
          title: "The RPM/Airspeed Relationship",
          pages: [416, 417],
          intro:
            "How changing forward speed or RPM changes the angle of attack of every " +
            "blade section, and what that means for a fixed-pitch propeller.",
          context:
            "This is the limitation the constant speed propeller exists to remove. " +
            "A fixed-pitch propeller is efficient at one combination of RPM and " +
            "forward speed; the designer picks which one, so a climb propeller and " +
            "a cruise propeller are different propellers on the same aeroplane " +
            "type.",
        },
        {
          title: "Propeller Performance",
          pages: [418],
          intro:
            "Typical efficiency, the effect of air density, and the problem that " +
            "appears when the tip approaches the speed of sound.",
        },
        {
          // Authored outright. The source raises tip speed as a limit on the
          // page before this one and then never says what is done about it,
          // while the syllabus asks for the function and operation of a
          // reduction gearbox by name.
          title: "Reduction Gearing",
          pages: [],
          intro:
            "The answer to the tip-speed problem the previous topic ends on: let " +
            "the engine turn faster than the propeller.",
          definition:
            "A reduction gearbox sits between the crankshaft and the propeller " +
            "shaft and turns the propeller more slowly than the engine — typically " +
            "somewhere around two engine turns to one of the propeller. The engine " +
            "is then free to run at the high RPM where it makes its power, while " +
            "the propeller stays at a speed where its blade tips are still well " +
            "below the speed of sound.",
          term: "A reduction gearbox",
          keyPoints: [
            "It is fitted where engine power is high enough that a direct drive would take the tips supersonic — larger piston engines, and every turboprop.",
            "Tip speed is the combination of rotational speed and forward speed, so the limit bites hardest at high RPM in the cruise.",
            "Beyond the tip speed problem it buys quieter operation and better propeller efficiency, because a large slow propeller moves more air more gently than a small fast one.",
            "A geared engine's tachometer still reads engine RPM, not propeller RPM. The two are no longer the same number, and the limitations in the flight manual are stated against the one the gauge shows.",
          ],
          context:
            "Most training aeroplanes are direct drive: the propeller is bolted to " +
            "the crankshaft and turns at engine speed, which is why the tachometer " +
            "can stand for both. Meeting a geared engine for the first time — a " +
            "higher-powered single, or a turboprop — is where the distinction " +
            "stops being academic.",
        },
      ],
    },

    {
      title: "Constant Speed Propellers",
      syllabus: ["12.72"],
      intro:
        "Varying the blade angle so that the propeller stays near its best " +
        "angle of attack across the speed range, and holding RPM constant while " +
        "it does so. Two levers instead of one, and an order in which they are " +
        "moved.",
      topics: [
        {
          title: "The Constant Speed Unit",
          pages: [419, 420],
          intro:
            "The two controls, and the governor that matches propeller torque to " +
            "engine torque whatever the airspeed is doing.",
        },
        {
          title: "How the CSU Responds",
          pages: [421],
          intro:
            "What the unit does to blade angle when the throttle is opened, closed, " +
            "or the airspeed changes.",
        },
        {
          title: "Operating a Constant Speed Propeller",
          pages: [422, 423, 424],
          intro:
            "Cycling the propeller during run-up, full fine for take-off and " +
            "landing, and the order the two controls are moved in.",
          keyPoints: [
            "To increase power: RPM first with the pitch control, then manifold pressure with the throttle.",
            "To decrease power: manifold pressure first with the throttle, then RPM with the pitch control.",
            "In a normally aspirated engine, manifold pressure falls about 1\" Hg per 1,000 ft as altitude is gained.",
            "Pitch control to full fine in the pre-landing checks, so full power is available for a go-around.",
          ],
          misconception:
            "Moving the two levers in whichever order comes to hand. The order " +
            "exists to keep the engine from being run at a high manifold pressure " +
            "with a low RPM — a high load on a slowly turning crankshaft — which is " +
            "the condition that invites detonation.",
        },
      ],
    },

    /* =====================================================================
     * Book chapter 29's second half, then chapters 30-31: the properties of
     * air, performance, and weight and balance.
     * ===================================================================== */
    {
      title: "The Properties of Air",
      syllabus: ["12.100"],
      intro:
        "Density, pressure, temperature and viscosity, revisited here because " +
        "performance is entirely a question of density and the two quantities " +
        "that decide it. Everything in the performance chapters that follows " +
        "reduces to \"how dense is the air the aeroplane is working in\".",
      topics: [
        {
          title: "Density",
          pages: [431, 432, 433],
          intro:
            "Molecules per unit volume, the sea level figure, and why density is " +
            "the determining factor for both engine and aerodynamic performance.",
        },
        {
          title: "Pressure",
          pages: [434],
          intro:
            "The force air exerts on a surface, and the units it is measured in.",
        },
        {
          title: "Temperature",
          pages: [435, 436, 437],
          intro:
            "What temperature is at molecular level, what heating air does when it " +
            "is contained and when it is not, and the two comparisons worth " +
            "remembering.",
          keyPoints: [
            "At the same temperature, the air mass with the higher pressure has the higher density.",
            "At the same pressure, the air mass with the lower temperature has the higher density.",
          ],
        },
        {
          title: "Density, Pressure and Temperature with Altitude",
          pages: [438, 439],
          intro:
            "How all three change as height is gained, and what each change does to " +
            "performance.",
        },
        {
          title: "Density Altitude and Humidity",
          pages: [440],
          intro:
            "The altitude in the standard atmosphere with the same density as the " +
            "air you are actually in — and the correction nobody makes for water " +
            "vapour.",
        },
        {
          title: "Viscosity",
          pages: [441],
          intro:
            "The tendency of the air to stick to a surface, which the boundary " +
            "layer depends on.",
        },
      ],
    },

    {
      title: "Performance Factors",
      syllabus: ["12.100", "12.106"],
      intro:
        "Pressure altitude and density altitude: what they mean, how each is " +
        "worked out, and why density altitude is the number that actually " +
        "predicts how the aeroplane will behave. The calculation is done here " +
        "step by step, because it is the one piece of arithmetic in this " +
        "subject that gets used on every hot day.",
      topics: [
        {
          title: "What Affects Performance",
          pages: [443],
          intro:
            "The four factors: pressure, temperature, humidity and all-up weight.",
          context:
            "Three of these four change the density of the air and the fourth " +
            "changes what the aeroplane has to lift. Low pressure, high " +
            "temperature and high humidity each make the air thinner, and thin " +
            "air means less lift from the wing, less thrust from the propeller " +
            "and less power from the engine, all at once. Weight is separate: it " +
            "acts on the aeroplane rather than on the air. Every performance " +
            "topic that follows is one of those four working through one of those " +
            "paths.",
        },
        {
          title: "Altitude",
          pages: [444],
          intro:
            "Why gaining altitude degrades both engine performance and aerodynamic " +
            "performance, by two separate routes.",
        },
        {
          title: "Pressure Altitude",
          pages: [445, 446, 447],
          intro:
            "The altitude in ISA with the same pressure as the one you are at, and " +
            "the two ways of finding it.",
          definition:
            "Pressure altitude is the altitude in the International Standard " +
            "Atmosphere that has the same pressure as the real altitude you are " +
            "flying at. It is found either by applying the pressure lapse rate to " +
            "the QNH, or by setting 1013 hPa on a sensitive altimeter and reading " +
            "it off.",
          term: "Pressure altitude",
        },
        {
          title: "Density Altitude",
          pages: [448, 449],
          intro:
            "Pressure altitude corrected for temperature deviation, and the three " +
            "ways of arriving at it.",
          diagramNotes: {
            449: "Air density falling with height, drawn as columns of increasingly widely spaced dots from the surface upwards — the same volume of air holding fewer molecules the higher it is sampled.",
          },
          takeaway:
            "Density altitude is the altitude the aeroplane thinks it is at. " +
            "Pressure altitude tells you the height of the pressure level you are " +
            "on; correcting it for how far the temperature sits from ISA tells " +
            "you the height at which the air would be this thin on a standard " +
            "day. On a hot day at a high aerodrome those two figures can be " +
            "thousands of feet apart, and it is the density altitude that the " +
            "take-off run, the climb rate and the service ceiling all answer to.",
        },
        {
          title: "Calculating Density Altitude",
          pages: [450, 451],
          intro:
            "The full worked example the book gives, from aerodrome elevation and " +
            "QNH through to a density altitude.",
          exampleTitle: "The worked example, step by step",
          example:
            "Elevation 3,000 ft, QNH 1009 hPa, ambient temperature +11°C. " +
            "First find pressure altitude: 1013 − 1009 = 4 hPa, and 4 × 30 ft = " +
            "120 ft, so pressure altitude is 3,120 ft. Then find the ISA " +
            "temperature at that pressure altitude, rounding to the nearest 500 ft: " +
            "15 − (2 × 3) = +9°C. Compare it with the actual temperature: +11°C " +
            "against +9°C is a deviation of ISA +2. Each degree above ISA is worth " +
            "120 ft, so 2 × 120 = 240 ft, added to the pressure altitude: a density " +
            "altitude of 3,360 ft. Work the steps in this order every time — the " +
            "errors come from skipping the rounding, not from the arithmetic.",
        },
        {
          title: "Temperature Deviation",
          pages: [452, 453, 454],
          intro:
            "The ISA lapse rate, the temperature it predicts at each level, and " +
            "the difference between that and what the thermometer says.",
          keyPoints: [
            "The ISA lapse rate is 1.98°C per 1,000 ft, simplified to 2°C per 1,000 ft for mental arithmetic.",
            "ISA temperature at mean sea level is +15°C.",
            "Deviation is the actual temperature minus the ISA temperature at that level, quoted as ISA +n or ISA −n.",
          ],
        },
        {
          title: "What Density Altitude Means in Practice",
          pages: [455],
          intro:
            "The summary: density altitude as the common measure of engine and " +
            "aerodynamic performance, and which way the effect runs.",
          takeaway:
            "When density altitude is higher than actual altitude, performance is " +
            "worse than the elevation suggests. A high aerodrome on a hot day with " +
            "a low QNH stacks all three effects in the same direction — and the " +
            "aeroplane performs as though it were thousands of feet higher than the " +
            "airfield sign says.",
        },
        {
          title: "Humidity",
          pages: [456],
          intro:
            "The factor that degrades performance and that the charts do not " +
            "correct for.",
        },
      ],
    },

    {
      title: "Take-Off and Landing Performance",
      syllabus: ["12.102", "12.104"],
      intro:
        "The two distances that have to be worked out before flight, everything " +
        "that lengthens them, and the charts they are read from. Note which " +
        "factors work the same way for take-off and landing and which reverse — " +
        "runway slope is the one that catches people.",
      topics: [
        {
          title: "Take-Off Distance Required",
          pages: [457, 458],
          intro:
            "TODR against TODA, where the chart figures come from, and the safety " +
            "margin built into them.",
        },
        {
          title: "Weight and Take-Off Distance",
          pages: [460],
          intro:
            "Two separate reasons a heavier aeroplane needs more runway.",
          diagramNotes: {
            460: "The same aeroplane taking off at 1000 kg and at 1200 kg, each shown reaching the 50 foot screen height. The heavier one needs a higher initial climb-out speed and a visibly longer take-off distance to get there.",
          },
          context:
            "Two effects compound, which is why the penalty is worse than it " +
            "looks. A heavier aeroplane accelerates more slowly, so it takes " +
            "longer to reach any given speed — and it has to reach a higher speed " +
            "before it can fly at all, because stalling speed rises with weight. " +
            "More runway used getting to a faster number. The same compounding is " +
            "why a small overload can cost a surprisingly large distance.",
        },
        {
          title: "Density and Take-Off Distance",
          pages: [461, 462],
          intro:
            "The three conditions that give low density, and the fact that the " +
            "P-chart already accounts for it.",
          diagramNotes: {
            462: "Two illustrations of thin air: cold dense air over low ground with an aeroplane at ease in it, and moist hot air over high terrain with the aeroplane labouring — high altitude and less dense air working together.",
          },
          takeaway:
            "The three conditions are worth checking together rather than " +
            "separately, because they arrive together on the days that matter: a " +
            "summer afternoon at an inland strip is high, hot and often " +
            "low-pressure all at once. The P-chart accounts for density, so the " +
            "arithmetic is done for you — the failure mode is not doing the " +
            "arithmetic at all, because the aeroplane got off the same strip " +
            "comfortably in the winter.",
        },
        {
          title: "Runway Slope and Surface",
          pages: [463, 464],
          intro:
            "What an up-slope costs in acceleration, and which surfaces the charts " +
            "distinguish between.",
          diagramNotes: {
            463: "Three runways drawn in profile with the same aeroplane lifting off from each: a two per cent upslope, where the lift-off point is furthest down the strip; a level runway; and a two per cent downslope, where it is earliest. The note beneath records that P-charts allow for a limited number of degrees of slope.",
          },
          context:
            "Slope and surface both act on the take-off run and they act in " +
            "different ways. An upslope means part of the aeroplane's weight is " +
            "working against the acceleration, so the run is longer. Surface acts " +
            "through friction: long or wet grass holds the wheels back where a " +
            "paved surface does not. The practical catch is that a P-chart offers " +
            "only paved or grass, and only a limited range of slope — a strip " +
            "outside those bounds is one the chart cannot answer for.",
        },
        {
          title: "Wind Component",
          pages: [465],
          intro:
            "What a headwind saves, and the disproportionate cost of even a small " +
            "tailwind.",
          context:
            "The tailwind figures are the ones to take seriously. A tailwind " +
            "component adds distance out of proportion to its strength, and the " +
            "temptation to accept one — because it saves a back-taxi, or because " +
            "the circuit direction is convenient — is exactly the decision the " +
            "chart is there to inform.",
        },
        {
          title: "Summary of Take-Off Factors",
          pages: [466],
          intro:
            "Everything that helps and everything that hurts, in one list.",
          takeaway:
            "The two lists are the same five factors read in opposite directions, " +
            "and they reduce to one sentence: anything that gives you more push " +
            "or less to push helps, and anything that does the reverse hurts. Two " +
            "of the five are chosen by the pilot on the day — the weight loaded, " +
            "and which end of the runway to use — and they are the two worth " +
            "deciding deliberately rather than by habit.",
        },
        {
          title: "Landing Distance Required",
          pages: [467],
          intro:
            "What the landing distance is measured from, the approach speed and " +
            "configuration it assumes, and what it must not exceed.",
          keyPoints: [
            "LDR is measured from a point 50 ft over the threshold, at 1.3 Vs, flaps set for landing, power off.",
            "The chart figure is only valid if the approach is flown that way — a fast or high approach is not the approach the chart describes.",
          ],
        },
        {
          title: "Factors Affecting Landing Distance",
          pages: [469, 470, 471, 472, 473],
          intro:
            "Weight, density, slope, surface and wind — and the two of them that " +
            "act in the opposite direction to take-off.",
          misconception:
            "Assuming a downhill runway is easier in both directions. A down-slope " +
            "shortens the take-off run and lengthens the landing distance, because " +
            "it encourages the aeroplane to keep its speed. An up-slope does the " +
            "reverse. Slope has to be considered separately for each phase.",
        },
        {
          title: "Windshear on Departure and Approach",
          pages: [474, 475],
          intro:
            "What a change of wind with height does to the climb after take-off " +
            "and to the approach to land.",
          // Three diagrams and seven words of text. The mechanism they show is
          // written out here, in the terms the diagrams themselves are labelled
          // in, so the drawings teach rather than decorate.
          context:
            "Windshear is a change of wind with height, and it matters because " +
            "the wing responds to airspeed, not groundspeed. Fly through a shear " +
            "and the aeroplane's momentum keeps its speed over the ground " +
            "constant for a moment while the air around it changes — so the " +
            "indicated airspeed jumps or drops until the aeroplane settles into " +
            "the new air. Losing a headwind, or gaining a tailwind, loses " +
            "airspeed: the approach steepens or the climb flattens, and the " +
            "answer is power on and the nose raised. Gaining a headwind, or " +
            "losing a tailwind, gains airspeed: the approach shallows, and the " +
            "answer is power off and the nose lowered. The dangerous case is the " +
            "first one close to the ground, and the dangerous version of it is a " +
            "downburst, where the shear is violent and the descending air is " +
            "working against you as well.",
          diagramNotes: {
            474: "Climbing out through a shear: 10 kt of headwind below becomes 10 kt of tailwind above, the airspeed falls, and the climb flattens — with a downburst at the far end of it.",
            475: [
              "On approach, losing a 20 kt headwind: the airspeed drops and the approach steepens, so power goes on and the nose comes up.",
              "On approach, a headwind becoming a tailwind: the airspeed increases and the approach shallows, so power comes off and the nose goes down.",
            ],
          },
        },
        {
          title: "Practical Use of P-Charts",
          pages: [477, 478],
          intro:
            "Working an actual take-off chart through, from the outside air " +
            "temperature and pressure altitude on one edge to a distance on the " +
            "other.",
          // The source gives the two charts and no instructions for reading
          // them. The method is written out here against what the charts on
          // this page are actually labelled.
          keyPoints: [
            "Start where the chart says START HERE — the ambient temperature scale — and go up to the line for your pressure altitude.",
            "Carry that across into the weight panel, follow the guide lines to your take-off weight, and across again.",
            "Then the slope panel, then the wind panel, taking each guide line in turn: every panel is a correction applied to the answer the panel before it gave.",
            "Read the distance off the right-hand scale. It is the distance to 50 ft, not the ground roll, and it already includes the CASO safety factors the chart names.",
            "The conditions printed on the chart — flaps, surface, full throttle before brake release — are conditions, not suggestions. A take-off flown differently is not the take-off the chart described.",
          ],
          diagramNotes: {
            477: "The take-off chart: temperature, then pressure altitude, then weight, then slope, then wind — and the distance required on the right-hand scale.",
            478: "The landing chart, read the same way, from a point 50 ft over the threshold.",
          },
        },
      ],
    },

    {
      title: "Weight and Balance",
      syllabus: ["12.108", "12.110"],
      intro:
        "Two separate limits, both of which have to be met: the aeroplane must " +
        "not be too heavy, and the centre of gravity must lie within its range. " +
        "A load can satisfy either one on its own and still be illegal, and an " +
        "aeroplane within weight but out of balance is the more dangerous of " +
        "the two.",
      topics: [
        {
          title: "Why Weight and Balance Matters",
          pages: [480, 482, 483],
          intro:
            "What the wings are actually carrying once load factor is included, " +
            "and everything a heavy aeroplane does worse.",
          keyPoints: [
            "Higher stalling speed, higher take-off speed and a longer take-off run.",
            "Poorer climb performance and a lower ceiling.",
            "Less manoeuvrability, higher fuel consumption, reduced cruise speed for a given power setting.",
          ],
        },
        {
          title: "The Defined Weights",
          pages: [484, 485, 486, 487, 488, 489],
          intro:
            "Basic empty weight, zero fuel weight, gross weight, and the three " +
            "maximum weights — ramp, take-off and landing.",
          context:
            "These definitions are worth learning precisely rather than " +
            "approximately, because the exam tests the boundaries between them: " +
            "basic empty weight includes full oil and unusable fuel; zero fuel " +
            "weight includes the people and the baggage but not the usable fuel; " +
            "and maximum ramp weight may legitimately exceed maximum take-off " +
            "weight by the start and taxi fuel.",
        },
        {
          title: "The Weight of Fuel",
          pages: [490],
          intro:
            "The specific gravity of AVGAS, and converting a volume of fuel into a " +
            "mass.",
          keyPoints: [
            "AVGAS has a specific gravity of about 0.72, so one litre weighs about 0.72 kg.",
          ],
        },
        {
          title: "The Moment of a Force",
          pages: [491, 492],
          intro:
            "Turning effect as force times arm, which is the whole of the balance " +
            "calculation in one line.",
        },
        {
          title: "Balancing a Suspended Beam",
          pages: [493, 494, 495, 496],
          intro:
            "The beam model the aeroplane is about to be treated as: what happens " +
            "when the pivot is displaced from the centre of gravity, and what it " +
            "takes to hold it level.",
        },
        {
          title: "Aircraft Balance and Longitudinal Stability",
          pages: [497],
          intro:
            "What a forward centre of gravity does to stability, and what an aft " +
            "one does.",
          takeaway:
            "The beam model pays off here. A forward CG gives the tailplane a long " +
            "moment arm and a very stable aeroplane — stable, but heavy in pitch " +
            "and needing more elevator to flare. An aft CG shortens that arm and " +
            "the aeroplane becomes less stable longitudinally. Both are limits, " +
            "and both are in the flight manual for a reason.",
        },
        {
          title: "Finding the Position of the CG",
          pages: [498],
          intro:
            "Summing the moments and dividing by the total weight.",
        },
        {
          title: "Datums and Arms",
          pages: [499],
          intro:
            "Station zero, where manufacturers put it, and what an arm is measured " +
            "from.",
        },
        {
          title: "Manual Calculation of CG Position",
          pages: [500],
          intro:
            "The full table worked through: each item's weight and arm, its moment, " +
            "and the totals at the bottom.",
        },
        {
          title: "Graphs to Calculate CG Position",
          pages: [501, 502, 503],
          intro:
            "The same answer read off the flight manual's loading graph and centre " +
            "of gravity envelope — and the index units the graph is drawn in.",
          // Three charts and no instructions for reading them; the method is
          // written out here against the panels these charts actually carry.
          keyPoints: [
            "The loading graph turns a weight into a moment: find the load on the weight scale, run across to the line for that item — pilot and front passenger, rear passengers, fuel, each baggage area — and read the moment off the top scale.",
            "Add the moments, including the basic empty weight's, and add the weights. Two totals, one sum each.",
            "The envelope takes those two totals: loaded weight up the side, total moment along the top. Where they meet must fall inside the envelope.",
            "The envelope has more than one region — normal category and utility category on these charts — and they are different limits for different kinds of flying, not alternatives to choose between.",
            "Inside on weight but outside on moment is still a load that may not fly. Both totals have to be in, together, at the same point.",
          ],
          diagramNotes: {
            501: "The loading graph: each load line turns a weight into a moment in index units — kg-mm/1000 on this chart.",
            502: "The moment envelope: loaded weight against total moment, with the normal and utility categories drawn separately.",
            503: "The same limits drawn against CG position instead of moment, in millimetres and inches aft of the datum.",
          },
          context:
            "A moment in kilogram-millimetres runs to six or seven digits, which " +
            "is unreadable on a graph and easy to mis-key on a form. So most " +
            "flight manuals work in index units: the moment divided by a " +
            "constant the manufacturer chooses — 1,000 is common — so that the " +
            "same calculation is done in three digits instead of seven. Nothing " +
            "about the arithmetic changes. Weight times arm still gives the " +
            "moment; the moment is simply carried in smaller units, and the " +
            "envelope on the chart is drawn in the same units, so the two agree. " +
            "Check which divisor the manual uses before trusting a number copied " +
            "from another aeroplane's sheet.",
        },
        {
          title: "Load Sheets",
          pages: [504, 505],
          intro:
            "Recording the weight and balance calculation, and what else the sheet " +
            "carries.",
          diagramNotes: {
            504: [
              "A completed load and trim sheet: the masses down the left, the distribution across the cabin in the middle, and the centre of gravity envelope plotted on the right so that the loading can be seen to fall inside it.",
            ],
            505: "A light aircraft trim sheet: the basic empty weight, arm and moment for each aeroplane in the fleet at the top, blank rows for fuel, crew, passengers and baggage beneath, and the centre of gravity envelope at the foot with the certification line for the pilot to sign.",
          },
          context:
            "A load sheet is the calculation written down rather than a different " +
            "calculation. Its value is that it is a record: it fixes what was " +
            "actually loaded and where, it is signed, and it can be produced " +
            "afterwards. Two habits go with it. Use the empty weight and arm for " +
            "the individual aeroplane, not the type — two aeroplanes off the same " +
            "line differ by tens of kilograms once radios and equipment have been " +
            "fitted. And plot the result on the envelope rather than trusting the " +
            "arithmetic, because a plotted point that sits outside the envelope " +
            "is obvious in a way that a number is not.",
        },
      ],
    },
  ],
};
