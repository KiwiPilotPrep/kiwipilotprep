/**
 * IR Air Law — the curriculum.
 *
 * This manual is nearly four hundred pages and opens with seventy-seven pages
 * of definitions in alphabetical-ish order. Followed literally it produces a
 * course whose first chapter is a glossary and whose chapter names are
 * whatever word happened to head a run of slides — "Aviation", "Precision",
 * "Datum", "Based".
 *
 * The definitions are not dropped: they are grouped by what they define, so a
 * student meets airspace vocabulary with airspace and approach vocabulary with
 * approaches. After that the deck's own sections are largely sound and are
 * kept, with the operational material gathered into the phase of flight it
 * belongs to.
 *
 * Everything in `intro`, `definition`, `keyPoints`, `context`, `misconception`
 * and `takeaway` is written for this course. It explains and connects; it
 * never states a rule, a minimum, a separation standard or a code that the
 * manual does not.
 */

export const subject = {
  slug: "ir-air-law",
  title: "IR Air Law",
  deck: "ir-law",

  skip: {
    113: "section divider: the heading \"General Operating Requirements\" over a stock photograph, with no text of its own",
  },

  chapters: [
    /* ================================================================= 1 == */
    {
      title: "The Legal Framework and the Language of the Rules",
      intro:
        "Air law is a vocabulary problem before it is a memory problem. Almost " +
        "every rule later in this subject is written in terms defined here, and " +
        "a definition read loosely is a rule applied wrongly.",
      topics: [
        {
          title: "The Legislative Framework",
          pages: [1, 2, 3, 6, 61, 62, 63, 64, 65, 77],
          intro:
            "Where the rules come from: an Act of Parliament, the rules made " +
            "under it, and the process by which they are promulgated.",
          keyPoints: [
            "The Civil Aviation Act 1990 is the primary legislation.",
            "Civil Aviation Rules are made under the Act.",
            "Orders are promulgated through a defined process.",
          ],
          context:
            "The hierarchy matters when two documents seem to disagree. An " +
            "advisory circular explains; a rule requires; the Act empowers. " +
            "Only one of those three can be argued with.",
        },
        {
          title: "Duties of the Pilot in Command",
          pages: [4],
          intro:
            "The responsibilities that attach to the person in command, stated " +
            "in the Act itself rather than in a rule.",
          takeaway:
            "Every other rule in this subject is addressed to somebody. Most of " +
            "the time, that somebody is you.",
        },
        {
          title: "Publications: the AIP, Circulars and NOTAMs",
          pages: [9, 10, 11, 12, 50, 66, 67, 68, 69, 70],
          intro:
            "Four kinds of document, differing in what they contain and how " +
            "quickly they change.",
          keyPoints: [
            "The NZAIP is the standing publication of aeronautical information.",
            "Aeronautical Information Circulars carry information that does not belong in the AIP.",
            "NOTAMs carry information too urgent or too temporary for either.",
            "Currency of documents is itself a requirement — an out-of-date document is not a document.",
          ],
          misconception:
            "Treating a NOTAM as optional reading because the AIP already " +
            "covers the aerodrome. The NOTAM exists precisely because something " +
            "in the AIP is no longer true.",
        },
        {
          title: "Definitions: Aerodromes, Airspace and Air Traffic Services",
          pages: [5, 7, 8, 13, 14, 15, 20, 21, 29, 30, 43, 44, 71],
          intro:
            "The vocabulary of where you fly and who is looking after you there.",
          context:
            "Read these against each other rather than one at a time. The " +
            "difference between a control service, an information service and no " +
            "service is the difference between being separated, being told, and " +
            "being on your own.",
        },
        {
          title: "Classes of Airspace",
          pages: [31, 32, 33, 34],
          intro:
            "Seven classes, each defined by what is allowed in it and what " +
            "service is provided. This is the single most examinable table in " +
            "the subject.",
          keyPoints: [
            "Each class specifies which flights are permitted, what service is provided, and what separation is applied.",
            "Controlled flight is defined by reference to these classes.",
          ],
          takeaway:
            "Learn the classes as a progression rather than as seven separate " +
            "facts: as you go from A toward G, less is separated for you and " +
            "more is left to you.",
        },
        {
          title: "Definitions: Altitudes, Minima and Approaches",
          pages: [18, 22, 23, 24, 38, 39, 46, 48, 49, 51, 56],
          intro:
            "The vertical vocabulary — altitude, minimum safe altitude, decision " +
            "altitude, obstacle clearance altitude — and the approach terms that " +
            "use them.",
          misconception:
            "Using 'altitude', 'height' and 'elevation' as synonyms. Each is " +
            "measured from a different datum, and the rules use them precisely.",
        },
        {
          title: "Definitions: Flight Crew, Ratings and Flight Time",
          pages: [35, 36, 37, 41, 42, 45],
          intro:
            "Who is who on the flight deck, and what counts as flight time — " +
            "which is the currency every licence and rating is denominated in.",
        },
        {
          title: "Definitions: Navigation Performance and Operations",
          pages: [19, 27, 28, 47, 52, 53, 54, 55, 57],
          intro:
            "Area navigation, required navigation performance, rated coverage, " +
            "reporting points and the operational terms that go with them.",
          keyPoints: [
            "RNP — required navigation performance — is a statement of accuracy, not of equipment.",
            "RVR — runway visual range — is a measured value, distinct from reported visibility.",
            "Rated coverage defines where an aid may be relied on.",
          ],
        },
        {
          title: "Meteorological Terms",
          pages: [25, 26],
          intro:
            "The weather vocabulary the rules use, which is narrower and more " +
            "precise than everyday usage.",
        },
        {
          title: "Visual Flight Parameters and Transitions",
          pages: [58, 59, 60],
          intro:
            "The conditions that define visual flight, and the transitions " +
            "between flight rules.",
        },
        {
          title: "Time, Units and Abbreviations",
          pages: [40, 72, 73, 74, 75, 76],
          intro:
            "Time of day, the time system used in aviation, the units the rules " +
            "are written in, and the abbreviations that carry them.",
          context:
            "Every time in a flight plan, a NOTAM or a clearance is UTC. The " +
            "commonest arithmetic error in this subject is a local-time answer " +
            "to a Zulu-time question.",
        },
        {
          title: "The Airworthiness Certificate and the Alternate Aerodrome",
          pages: [16, 17],
          intro:
            "Two definitions that carry more weight than most: what makes an " +
            "aircraft legal to fly, and what makes an aerodrome legal to nominate.",
        },
      ],
    },

    /* ================================================================= 2 == */
    {
      title: "Pilot Requirements",
      intro:
        "What you must hold, what you must have done recently, and what you may " +
        "do with it. Currency is the part that catches people: the rating does " +
        "not expire, but the privileges attached to it lapse.",
      topics: [
        {
          title: "Licences and Type Ratings",
          pages: [78, 79, 80, 81, 82],
          intro:
            "The licences the rules recognise, and the ratings that attach to " +
            "them.",
        },
        {
          title: "Logbook Requirements",
          pages: [83, 84, 85],
          intro:
            "What must be recorded, and the additional entries required for " +
            "instrument flight.",
          context:
            "The logbook is the evidence for every currency claim in this " +
            "chapter. An entry that does not record what the rule requires " +
            "cannot support the privilege it is meant to.",
        },
        {
          title: "Simulated Instrument Flight",
          pages: [86, 87],
          intro:
            "When flight in simulated instrument conditions counts, and the " +
            "conditions attached to it.",
        },
        {
          title: "Instrument Rating Eligibility",
          pages: [88, 89, 90, 91],
          intro:
            "What has to be held, flown and passed before the rating can be " +
            "issued.",
        },
        {
          title: "IR Privileges and Limitations",
          pages: [92, 93],
          intro:
            "What the rating permits, and the accrediting requirements that go " +
            "with instrument flight.",
        },
        {
          title: "Currency Requirements",
          pages: [94, 95, 96],
          intro:
            "Two clocks run at once: a twelve-month requirement and a " +
            "three-month one. Both must be satisfied.",
          keyPoints: [
            "Twelve-month currency requirements apply to the rating.",
            "Three-month currency requirements apply to recent instrument experience.",
            "Similar navigation systems are treated together for currency purposes.",
          ],
          misconception:
            "Assuming a valid rating means valid privileges. The rating and the " +
            "currency are separate, and it is the currency that runs out first.",
        },
        {
          title: "Technically Advanced Aircraft",
          pages: [97, 98],
          intro:
            "A separate currency regime for aircraft whose systems change how " +
            "the flying is done.",
        },
        {
          title: "Medical Certificates",
          pages: [99, 100],
          intro:
            "Class 1 and Class 2, and which licence each supports.",
        },
      ],
    },

    /* ================================================================= 3 == */
    {
      title: "Aircraft, Equipment and Airworthiness",
      intro:
        "An instrument flight has an equipment list, and most of it is not " +
        "optional. This chapter is what must be fitted, what must be maintained, " +
        "and how recently.",
      topics: [
        {
          title: "Airworthiness and Documentation",
          pages: [101, 102],
          intro:
            "What makes an aircraft legally airworthy, and what must be carried " +
            "to prove it.",
        },
        {
          title: "Maintenance: Radios, Altimeters, Transponders and ELTs",
          pages: [103, 104],
          intro:
            "Four items with their own maintenance intervals, because their " +
            "failure modes are invisible in normal operation.",
          context:
            "These are the instruments that lie quietly. A radio that will not " +
            "transmit announces itself; an altimeter that is 200 ft out does " +
            "not, which is why the interval exists rather than an inspection.",
        },
        {
          title: "IFR Communication and Navigation Equipment",
          pages: [105],
          intro:
            "The equipment an aircraft must carry to be flown under IFR.",
        },
        {
          title: "MNPS and RVSM Equipment",
          pages: [106, 107],
          intro:
            "Two airspace regimes with equipment requirements of their own, both " +
            "about keeping aircraft apart with less margin.",
        },
        {
          title: "IFR Instruments and Equipment",
          pages: [108, 109, 110],
          intro:
            "The instrument fit for IFR, the additions for night, and assigned " +
            "altitude indicating.",
        },
        {
          title: "Emergency Location Systems and ELTs",
          pages: [111, 112],
          intro:
            "What must be carried so that you can be found, and the rules " +
            "governing it.",
        },
        {
          title: "Portable Electronic Devices",
          pages: [114, 115],
          intro:
            "What may be used on board, and when.",
        },
        {
          title: "Speed Restrictions and Flight in Icing Conditions",
          pages: [116, 117, 118],
          intro:
            "Two operating limits: how fast you may go, and when you may not go " +
            "at all.",
          context:
            "The icing rule is an equipment rule wearing operational clothes. " +
            "What decides it is not the weather but what the aircraft is " +
            "certified and equipped to fly in.",
        },
        {
          title: "Minimum Altitudes for IFR Flight",
          pages: [119],
          intro:
            "The rule that underlies every minimum altitude figure in this " +
            "subject.",
        },
      ],
    },

    /* ================================================================= 4 == */
    {
      title: "Flight Planning and Preparation",
      intro:
        "What must be found out before departure, what must be filed, and the " +
        "minima that decide whether the flight can be planned at all.",
      topics: [
        {
          title: "Preflight Action and Information",
          pages: [120, 121, 122],
          intro:
            "The information a pilot in command is required to obtain before " +
            "flight — a rule, not a good habit.",
          takeaway:
            "Everything else in this chapter assumes this step happened. A plan " +
            "built on information you did not check is a plan whose minima you " +
            "cannot defend.",
        },
        {
          title: "Route and Aerodrome Publications",
          pages: [123, 124],
          intro:
            "The documents that carry the route and aerodrome information the " +
            "preflight rule demands.",
        },
        {
          title: "Departure and Enroute Charts",
          pages: [125, 126, 127, 128, 129, 130, 131],
          intro:
            "Worked chart extracts: what is on a departure chart and an enroute " +
            "chart, and where to find each figure.",
        },
        {
          title: "Approach Charts by Aid Type",
          pages: [132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143],
          intro:
            "The approach chart family, one aid at a time, up to the RNAV " +
            "variants with vertical guidance.",
          context:
            "The layout is deliberately identical across the family. Once you " +
            "can read one, the differences between them are the aid, the minima " +
            "and the missed approach.",
        },
        {
          title: "Alternate Aerodrome Requirements",
          pages: [144, 145, 146, 147],
          intro:
            "When an alternate must be listed, what minima it must meet, and " +
            "what equipment it must have.",
          misconception:
            "Reading the three requirements as alternatives. They stack: the " +
            "circumstances that require an alternate, the minima that make an " +
            "aerodrome eligible, and the equipment it must have are all tests " +
            "the same aerodrome has to pass.",
        },
        {
          title: "Take-off Meteorological Minima",
          pages: [148, 149, 326, 327],
          intro:
            "What must be visible before departure, and the reference datum the " +
            "figure is measured from. The manual returns to this under " +
            "departures; both treatments are gathered here.",
        },
        {
          title: "Approach and Landing Minima",
          pages: [150, 151, 152, 153, 154, 155, 156],
          intro:
            "The minima that govern the approach, the landing, and the point " +
            "below which you may not go without visual reference.",
          keyPoints: [
            "There is an instrument approach requirement, a set of approach minima, and rules for operating below them.",
            "Landing meteorological minima are stated against a reference datum.",
            "Alternate aerodrome meteorological minima are a separate set again.",
          ],
        },
        {
          title: "IFR Fuel Requirements",
          pages: [157],
          intro:
            "The fuel that must be on board before an IFR flight may depart.",
          context:
            "Fuel is where the alternate rules become a number. Whether an " +
            "alternate is required, and which one, changes the required fuel " +
            "load — which is why the two are worked together rather than in " +
            "sequence.",
          takeaway:
            "Fuel planning is a legal minimum with a safety margin on top, not a " +
            "safety margin that happens to be legal.",
        },
        {
          title: "IFR Flight Plan Requirements",
          pages: [158, 159, 160],
          intro:
            "What a flight plan must contain, and when one must be filed.",
        },
        {
          title: "Flight Plan Adherence, Changes and Termination",
          pages: [161, 162, 163, 164, 165],
          intro:
            "Flying the plan you filed, telling somebody when you cannot, and " +
            "closing it at the end.",
          keyPoints: [
            "Adherence to the filed plan is required.",
            "Changes must be notified.",
            "An inadvertent departure from the plan has its own procedure.",
            "Termination at a non-ATS aerodrome is the pilot's responsibility.",
          ],
          context:
            "Outside radar coverage the plan is what ATC is separating you " +
            "from other traffic with. Departing from it silently removes the " +
            "basis of that separation.",
        },
      ],
    },

    /* ================================================================= 5 == */
    {
      title: "Communications",
      intro:
        "What must be reported, when, in what format, and to whom. Position " +
        "reporting is the backbone: outside radar it is the only thing telling " +
        "ATC where you are.",
      topics: [
        {
          title: "Position Reporting Requirements",
          pages: [166, 167, 168, 169],
          intro:
            "The requirement appears in three places — the rules, the AIP, and " +
            "a relaxation that applies when the transponder is working. Read all " +
            "three together, because the relaxation is conditional.",
          context:
            "Outside radar and ADS-B coverage your position report is the whole " +
            "of what ATC knows. That is why the intervals are specified rather " +
            "than left to judgement.",
        },
        {
          title: "Position Reports: Departure and Enroute",
          pages: [170, 171, 172],
          intro:
            "What to say leaving, what to say along the way, and the order to " +
            "say it in.",
          context:
            "The format exists so the controller can write it down in the order " +
            "they need it. Reporting the same facts in a different order costs " +
            "them time on a busy frequency.",
        },
        {
          title: "Position Reports: Holding, STAR and Approach",
          pages: [173, 174, 175, 176],
          intro:
            "Reporting through the arrival phases, including the missed approach " +
            "and the visual approach.",
        },
        {
          title: "UNICOM, AFRU and AWIB",
          pages: [177, 178, 179],
          intro:
            "Three services at aerodromes without a control tower, each doing " +
            "something quite different.",
          keyPoints: [
            "UNICOM is a non-ATS information service.",
            "The Aerodrome Frequency Response Unit confirms you are on the right frequency.",
            "The Aerodrome and Weather Information Broadcast provides recorded information.",
          ],
          misconception:
            "Hearing an AFRU response as a reply from a person. It is an " +
            "automatic confirmation that your transmission was received on that " +
            "frequency, and nothing more.",
        },
        {
          title: "Light Signals",
          pages: [180],
          intro:
            "The signals used when radio is not available, and what each means " +
            "to an aircraft in flight and on the ground.",
        },
        {
          title: "Traffic Information Broadcasts by Aircraft",
          pages: [181, 182, 183],
          intro:
            "Where there is no air traffic service, aircraft broadcast to each " +
            "other. TIBA is that procedure.",
        },
        {
          title: "ATC Clearances and Compliance",
          pages: [184, 185, 188, 189, 190],
          intro:
            "What a clearance is, what compliance requires, and where a " +
            "clearance ends.",
          keyPoints: [
            "Compliance with clearances and instructions is required.",
            "An IFR clearance has a defined content.",
            "A clearance limit is where the clearance stops, and it must be known.",
            "Coordination with AFIS applies where that service is provided.",
          ],
        },
        {
          title: "Clearance Readbacks",
          pages: [186, 187],
          intro:
            "What must be read back, word for word, and why the list is what it " +
            "is.",
          takeaway:
            "The readback list is the list of things that kill people when " +
            "misheard: levels, headings, runways, clearances onto or across " +
            "them.",
        },
      ],
    },

    /* ================================================================= 6 == */
    {
      title: "Separation",
      intro:
        "How aircraft are kept apart, and by whom. Which standard applies " +
        "depends on the airspace class, the phase of flight and whether anyone " +
        "can see anyone else.",
      topics: [
        {
          title: "Separation by Airspace Class",
          pages: [191, 192, 193, 194, 195, 196, 197, 198, 199],
          intro:
            "Class by class, from A to G: what ATC separates and what it does " +
            "not. Four of the seven are not currently used in New Zealand, which " +
            "makes the three that are worth knowing exactly.",
          keyPoints: [
            "Class A: IFR only, all flights separated from each other.",
            "Class C: IFR separated from IFR, from VFR and from SVFR; VFR separated from IFR but not from other VFR, who get traffic information instead.",
            "Class D: IFR separated from IFR and from SVFR, but not from VFR — VFR and IFR get traffic information about each other, and avoidance advice on request.",
            "Class G: IFR and VFR both permitted, flight information service on request, and no separation at all.",
            "Classes B, E and F are not currently used in New Zealand.",
          ],
          misconception:
            "Reading Class D as 'controlled, therefore separated'. In Class D an " +
            "IFR flight is separated from other IFR flights and told about VFR " +
            "ones — the VFR traffic is information, not separation.",
          takeaway:
            "The question to ask of any airspace is not 'is it controlled' but " +
            "'what is separated from what here'. The answer changes at every " +
            "class boundary.",
        },
        {
          title: "Vertical Separation",
          pages: [200, 201],
          intro:
            "The standards for keeping aircraft apart in the vertical, and the " +
            "rules that apply while a level change is in progress.",
          keyPoints: [
            "1000 ft below FL290, 2000 ft above it — reduced to 1000 ft in RVSM airspace where both aircraft are RVSM approved.",
            "Reducible to 500 ft in controlled airspace where both aircraft are medium or light and the lower one is VFR or SVFR at 4500 ft or below.",
            "Climb or descent must be started promptly on acknowledging the clearance, or ATC advised.",
            "Change level at an optimum rate to 1000 ft from the assigned level, then reduce the rate as appropriate.",
            "Advise ATC before levelling at an interim level or substantially changing the rate.",
            "Where ATC specifies a rate, comply or say immediately that you cannot.",
          ],
          context:
            "The reason for reporting a level-off is arithmetic, not courtesy. " +
            "Longitudinal and vertical separation are being computed from an " +
            "assumed profile, and an aeroplane that stops climbing is no longer " +
            "on it.",
          misconception:
            "Treating a specified rate of climb from departure as advisory. The " +
            "rule requires it be one the aircraft can sustain *and* one that " +
            "gives terrain clearance — if it is neither, the answer is to say so, " +
            "not to try.",
        },
        {
          title: "Horizontal, Longitudinal and Lateral Separation",
          pages: [202, 203, 204, 205],
          intro:
            "Three ways to be apart in the horizontal plane: along the track, " +
            "across it, and on reciprocal tracks.",
        },
        {
          title: "Radar and Geographical Separation",
          pages: [206, 207],
          intro:
            "Separation by radar-measured distance, and by position relative to " +
            "geographical features.",
          keyPoints: [
            "Radar separation between controlled flights is 5 NM horizontally, except where wake turbulence applies.",
            "Reducible to 3 NM within 60 NM of Auckland, Ohakea, Wellington or Christchurch, or within 60 NM of the Te Weraiti SSR site.",
            "Once aircraft on reciprocal tracks have passed and their radar symbols have separated, radar separation exists.",
            "Geographical separation uses prominent features, landmarks, visual reporting points or specified CTR/CTA sectors, and may be applied in terminal control areas and CTRs up to 6000 ft AMSL.",
            "It requires visual navigation charts, or an electronic equivalent, to be carried.",
          ],
          context:
            "Geographical separation is why a visual arrival can be issued at all " +
            "— but it puts the chart in your hands. If a visual departure or " +
            "arrival is even possible on the day, the chart needs to be on board.",
        },
        {
          title: "Visual Separation",
          pages: [208, 209, 210, 211],
          intro:
            "Reduced separation where somebody can see somebody else — beyond " +
            "the vicinity of an aerodrome, near one, and the composite case.",
          keyPoints: [
            "Beyond the vicinity of an aerodrome it applies in Classes C and D, by day only, at the pilot's specific request, with both aircraft in VMC, both pilots concurring, on the same frequency, each continuously visible to the other, and no possibility of misidentification.",
            "In the vicinity of an aerodrome it may rest on the controller seeing both aircraft, on each pilot seeing the other, or on the following pilot seeing the aircraft ahead.",
            "Composite visual separation is used where the controller can see only one of the two, and the other's position and track are known.",
            "Accepting FOLLOW or MAINTAIN VISUAL SEPARATION FROM is accepting responsibility for manoeuvring to keep clear, in the air or on the ground.",
            "If visual contact is lost or cannot be maintained, ATC must be told.",
            "At night, visual separation is applied only on or in the vicinity of aerodromes.",
          ],
          context:
            "Visual separation transfers part of the responsibility to the " +
            "flight deck. Accepting it is accepting that job, which is why the " +
            "conditions are specific — and why 'continuously' is defined: it " +
            "means being able to see the other aircraft at any moment you need " +
            "to, not having seen it once.",
          misconception:
            "Accepting a visual approach to follow a preceding aircraft as " +
            "though it were only a tracking instruction. It also makes the " +
            "landing interval, the wake turbulence separation and compliance " +
            "with noise abatement yours.",
        },
        {
          title: "Maintaining Own Separation in VMC",
          pages: [212],
          intro:
            "When an IFR flight may be cleared to keep itself apart from one " +
            "other IFR flight — a narrow permission with seven conditions on it.",
          keyPoints: [
            "Class D airspace, and from one other IFR flight only.",
            "At the specific request of the pilot, by day, where a radar control service is not available.",
            "For a specified portion of the flight at or below 10,000 ft AMSL, during climb or descent to a defined separation level, position or time.",
            "The other IFR pilot must agree, essential traffic information must be passed, and both must be on the same frequency.",
            "Alternative instructions must be available for loss of VMC — without them the clearance is not issued.",
            "If VMC is about to become impossible, tell ATC and get those instructions before entering IMC.",
          ],
          takeaway:
            "The whole clearance rests on staying in VMC. The moment that is in " +
            "doubt, the plan is the alternative instructions — obtained before " +
            "you need them, not after.",
        },
        {
          title: "Separation Outside Controlled Airspace",
          pages: [213, 214],
          intro:
            "Outside controlled airspace the pilot is responsible for separation. " +
            "What ATS provides instead is information — and only if you ask for " +
            "most of it.",
          keyPoints: [
            "The pilot is responsible for maintaining separation from other traffic.",
            "On request, ATS will pass information on other IFR movements before departure, before a level change, before vacating controlled airspace, enroute as required, and before commencing an instrument approach.",
            "\u201cNO REPORTED IFR TRAFFIC\u201d means no IFR flights are known to be in the area.",
            "Departing an unattended aerodrome, obtain traffic information by telephone or by radio before departure or before entering IMC.",
            "Maintain a listening watch, and report: departure time, position at intervals not exceeding 30 minutes, level changes, before entering controlled airspace, and before commencing an instrument approach at an unattended aerodrome.",
          ],
          misconception:
            "Hearing \u201cno reported IFR traffic\u201d as \u201cno traffic\u201d. It is a statement " +
            "about what ATS knows of IFR flights, not about what is in the sky.",
        },
        {
          title: "Essential Traffic and RNP 10 Separation",
          pages: [215, 216],
          intro:
            "Traffic information that must be passed, and a separation standard " +
            "that depends on navigation performance rather than on radar.",
        },
        {
          title: "Flight Plan Speed Deviation",
          pages: [217],
          intro:
            "When a change in speed has to be reported, because separation was " +
            "calculated using the speed you filed.",
        },
        {
          title: "Wake Turbulence Separation",
          pages: [218, 219, 220, 221, 222, 223, 224, 225, 226, 227],
          intro:
            "Separation from something invisible. Distance-based and time-based " +
            "standards, and the runway geometry that decides which applies.",
          keyPoints: [
            "Aircraft are grouped as heavy, medium and light, with distance-based minima between them.",
            "Time-based separation applies to same-direction runway operations, opposite-direction operations, and crossing or non-intersecting runways with crossing flight paths.",
          ],
          misconception:
            "Treating wake turbulence separation as a radar-only concern. The " +
            "time-based standards exist for exactly the situations radar " +
            "distance cannot describe — two aircraft using the same piece of " +
            "runway minutes apart.",
        },
        {
          title: "Speed Restrictions and Approaches at Uncontrolled Aerodromes",
          pages: [228, 229],
          intro:
            "IFR speed limits, and how an instrument approach works where nobody " +
            "is separating anybody.",
        },
      ],
    },

    /* ================================================================= 7 == */
    {
      title: "Terrain Clearance",
      intro:
        "The rules that keep an instrument flight above the ground it cannot " +
        "see. Everything here is a minimum altitude and the circumstances in " +
        "which it may be left.",
      topics: [
        {
          title: "Minimum Flight Altitudes",
          pages: [230, 231],
          intro:
            "The altitude an IFR flight must not go below. It is not published " +
            "as one number — it is the highest of five considerations, then " +
            "rounded to a legal cruising level.",
          keyPoints: [
            "Take the highest of: route MSA, MRA for a VOR sector, MEA for an NDB sector, volcanic hazard zone upper limit, and danger or restricted area upper limit with its buffer.",
            "Then apply the IFR table of cruising levels.",
            "Where the next sector needs a higher MFA, that sector must not be entered below it unless a crossing altitude is promulgated.",
            "Aircraft with approved enroute area navigation equipment need not comply with MRA and MEA.",
          ],
          takeaway:
            "MFA is a maximum of minima. Taking any single one of the five and " +
            "stopping there is how an aircraft ends up legally planned and " +
            "physically too low.",
        },
        {
          title: "Climbing to and Descending Below the MFA",
          pages: [232, 233, 234],
          intro:
            "The three cases in which the minimum flight altitude may be left: " +
            "on the way up, on the way down, and in an emergency.",
          keyPoints: [
            "Climbing: to MSA at the promulgated minimum net climb gradient for the departure procedure, then at not less than 3.3% (200 ft/NM) to MFA unless something more restrictive is published.",
            "Descending: in accordance with published enroute descent (distance) steps, VORSEC/VORTAC chart steps, or under radar control.",
            "Before the first step, only with a positive fix — an unambiguous DME readout held 15 seconds, or an off-track VOR or NDB cutting at 45° or more — plus a positive tracking indication for 15 seconds, and navigation actively monitored throughout.",
            "Descent is then limited to the higher of MSA or the relevant hazard-area upper limit, on an optimum 5% (300 ft/NM) gradient to the first step.",
            "Within 10 NM of the aid or fix for the approach, descent is limited to the higher of minimum holding altitude, procedure commencement altitude or MSA.",
            "In an emergency descent below MEA or MRA, the navigation tolerance the MSA was built on may no longer hold.",
          ],
          context:
            "The 15-second requirements are the interesting part. A DME that " +
            "flickers to the right number is not a fix — the rule is asking for " +
            "evidence that the indication is stable, not that it once appeared.",
          takeaway:
            "Descent below MFA is not a judgement call. It is permitted in named " +
            "circumstances, and outside those the altitude is a floor.",
        },
        {
          title: "VORSEC Charts, MSA and Terminal Arrival Altitude",
          pages: [235, 236],
          intro:
            "Three published ways of expressing a safe altitude near an " +
            "aerodrome, and how to read each.",
        },
        {
          title: "Radar Terrain Clearance and Vectoring",
          pages: [237, 238],
          intro:
            "When you are being vectored, terrain clearance becomes a shared " +
            "responsibility — and this is where the line falls.",
          keyPoints: [
            "While vectoring, the radar controller is responsible for adequate terrain clearance and for keeping the aircraft in controlled airspace, except in an emergency.",
            "When vectoring ends other than with an approach clearance, you will be told to resume own navigation.",
            "Assigned levels come from radar contour levels (1000 ft clearance, 2000 ft over mountainous zones, 3000 ft over volcanic hazard zones at Alert Level One), the route or procedure MSA, an approved area MSA, the 25 NM minimum sector altitude, or a TAA.",
            "In VMC by day you may be permitted to arrange your own terrain clearance — the instruction is \u201cMAINTAIN TERRAIN CLEARANCE VISUALLY\u201d.",
            "Where clearances are based on the radar terrain contour map, the first transmission is appended \u201c...RADAR TERRAIN\u201d.",
            "Having accepted visual terrain clearance, it stays yours until an alternative procedure applies, a specified limit is reached, or you land.",
          ],
          context:
            "This is one of the few places in the subject where responsibility " +
            "genuinely transfers. Knowing exactly when it does, and when it " +
            "comes back, is the point of the topic.",
        },
        {
          title: "DME Steps and Departure Climb Profiles",
          pages: [239, 240],
          intro:
            "Stepped minimum altitudes on departure and arrival, and how to use " +
            "them.",
        },
        {
          title: "Deviating Off Track for Weather",
          pages: [241],
          intro:
            "Leaving the cleared track to avoid weather, and what that does to " +
            "your terrain clearance.",
        },
      ],
    },

    /* ================================================================= 8 == */
    {
      title: "Radar Services and GNSS Operations",
      intro:
        "What a radar service actually provides, and the separate question of " +
        "what satellite navigation may be used for.",
      topics: [
        {
          title: "Radar Services Available to IFR Flights",
          pages: [242, 243],
          intro:
            "The services a radar-equipped unit can offer, and their limits.",
        },
        {
          title: "Speed Requirements Under Radar Control",
          pages: [244, 245],
          intro:
            "Speed control as a separation tool, and what may be asked of an " +
            "arriving aircraft.",
        },
        {
          title: "Radar Vectoring for a Visual Approach",
          pages: [246],
          intro:
            "Being vectored to a position from which the approach can be " +
            "completed visually.",
        },
        {
          title: "Collision Hazard Information",
          pages: [247, 248, 249],
          intro:
            "What a controller must tell you about traffic that is a hazard, in " +
            "each of the circumstances the rules describe.",
        },
        {
          title: "GNSS: Primary and Sole Means Operations",
          pages: [250, 251, 252, 253, 254, 255],
          intro:
            "The legal categories of satellite navigation use, which are about " +
            "what else you must carry rather than about accuracy.",
          keyPoints: [
            "Primary means and sole means are defined categories with different requirements.",
            "Which category applies decides what other navigation capability the aircraft must have.",
          ],
          misconception:
            "Reading 'sole means' as 'the only equipment fitted'. It is an " +
            "approval category — the standard the system has to meet before it " +
            "may be relied on alone.",
        },
        {
          title: "Random Flight Routing and Pilot Qualification",
          pages: [256, 257],
          intro:
            "Flying routes that are not published, and the qualification " +
            "required to do it.",
        },
      ],
    },

    /* ================================================================= 9 == */
    {
      title: "Altimetry, Transponders and Airspace",
      intro:
        "Three subjects that share one purpose: making sure everyone is " +
        "measuring height the same way, is visible to the same system, and knows " +
        "which volume of air they are in.",
      topics: [
        {
          title: "Altimeter Setting Requirements",
          pages: [258, 259, 260],
          intro:
            "Which setting to use where, when to change it, and the one " +
            "circumstance that moves the boundary.",
          keyPoints: [
            "At or above the transition level of FL150, vertical position is maintained on 1013.2 hPa.",
            "At or below the transition altitude of 13,000 ft, on the QNH setting.",
            "Between the two, on the setting ATC advises.",
            "Climbing above 13,000 ft, set 1013.2; descending through FL150, set the appropriate zone area or aerodrome QNH.",
            "The transition layer is for climbing or descending, or for cruising only with ATS approval.",
            "The layer gives adequate separation while the Zone Area QNH is above 980 hPa; at 980 hPa or below, the minimum usable flight level for that zone rises to FL160.",
          ],
          misconception:
            "Treating the transition level as fixed. FL150 is the usual answer, " +
            "and a low Zone Area QNH pushes the lowest usable level up to FL160 " +
            "— the layer thins as the pressure falls.",
          takeaway:
            "Below the transition altitude everyone uses a local setting; above " +
            "the transition level everyone uses the standard one. The layer " +
            "between exists so nobody is caught changing.",
        },
        {
          title: "QNH Settings and QNH Zones",
          pages: [261, 262, 263],
          intro:
            "Which QNH applies where — and it is not always the aerodrome's.",
          keyPoints: [
            "In Class C and D airspace, use the QNH advised by ATS.",
            "In Class G, use the Zone Area QNH.",
            "Except that the aerodrome QNH is used for take-off, landing and flight in the circuit, and for the intermediate and final approach segments of an instrument approach.",
            "Departing where no QNH is available: set aerodrome elevation before departure, and obtain a setting from an ATS unit as soon as possible — in any case before entering IMC.",
          ],
          context:
            "The switch from zone to aerodrome QNH on the intermediate segment " +
            "is the one that matters. Every minimum on the approach chart is " +
            "measured against the aerodrome's pressure datum, not the zone's.",
        },
        {
          title: "Cruising Levels",
          pages: [264, 265],
          intro:
            "The levels available to you, by magnetic track, in each of the two " +
            "FIRs — and how to ask for one that is not on the table.",
          keyPoints: [
            "CAR 91.425 requires level cruising flight under IFR to be at a level appropriate to the track, from the New Zealand FIR table.",
            "The exception is where ATC authorises otherwise within, entering or leaving controlled airspace.",
            "A level outside the IFR column must be requested prefixed \u201c... NON-STANDARD ...\u201d.",
            "The Auckland Oceanic FIR has its own table, and its own non-standard prefix within Class A.",
            "Calibration flights, aerial work, aircraft unable to maintain a level, and cruise-climb operations may be cleared between a specified upper and lower limit instead.",
            "International flights transiting the New Zealand FIR may plan that portion on the Auckland Oceanic table.",
          ],
        },
        {
          title: "Use of the Transponder",
          pages: [266, 267, 268, 269],
          intro:
            "When it must be on, what to squawk, and the codes reserved for IFR " +
            "flights.",
        },
        {
          title: "Mode C Verification and Transponder Failure",
          pages: [270, 271],
          intro:
            "How the altitude readout is checked, and the procedures when the " +
            "transponder stops working.",
        },
        {
          title: "Control Zones and Controlled Areas",
          pages: [272, 273, 274, 275, 276],
          intro:
            "The two building blocks of controlled airspace, and how they are " +
            "depicted.",
        },
        {
          title: "Transit Lanes, General Aviation Areas and Visual Reporting Points",
          pages: [277, 278, 279, 280],
          intro:
            "Three constructs that let VFR traffic move through or beside " +
            "controlled airspace.",
        },
        {
          title: "When Controlled Airspace Is Not Operative",
          pages: [281],
          intro:
            "What a CTA or CTR becomes outside its hours of operation.",
        },
        {
          title: "Restricted Areas, Military Operating Areas and Mandatory Broadcast Zones",
          pages: [282, 283, 284],
          intro:
            "Three kinds of special use airspace, each with a different " +
            "obligation attached.",
        },
        {
          title: "Volcanic Hazard Zones",
          pages: [285, 286, 287],
          intro:
            "Airspace defined by a hazard that changes, with alert levels and " +
            "air traffic procedures that change with it.",
          context:
            "New Zealand is one of the few places where this is routine rather " +
            "than exceptional, which is why it has its own alert-level structure " +
            "and its own ATS procedures.",
        },
        {
          title: "Danger Areas, Parachute Landing Areas and Common Frequency Zones",
          pages: [288, 289, 290],
          intro:
            "Three more designations, and what each requires of a transiting " +
            "aircraft.",
        },
        {
          title: "Temporary Hazards and Temporary Airspace",
          pages: [291],
          intro:
            "Airspace that exists for days rather than years, and where to find " +
            "out about it.",
        },
        {
          title: "RNP Airspace",
          pages: [292],
          intro:
            "Airspace where entry depends on demonstrated navigation performance.",
        },
      ],
    },

    /* ================================================================ 10 == */
    {
      title: "Aerodromes, Charts and Lighting",
      intro:
        "The aerodrome as the rules describe it: what may be used, how it is " +
        "drawn, and how it is lit.",
      topics: [
        {
          title: "Use of Aerodromes and the Movement Area",
          pages: [293, 294, 295, 296],
          intro:
            "Which aerodromes may be used, how runways are designated, and what " +
            "counts as the movement area.",
        },
        {
          title: "Aerodrome and Chart Symbols",
          pages: [297, 298, 299, 300, 301],
          intro:
            "The symbology of aerodrome, radio-navigation and instrument charts, " +
            "and the format of a landing minima box.",
        },
        {
          title: "Aerodrome and Runway Lighting",
          pages: [302, 303, 304],
          intro:
            "The lighting that defines the runway, including centreline lights " +
            "and their colour sequence.",
        },
        {
          title: "Approach Light Systems",
          pages: [305, 306, 307, 308],
          intro:
            "The three grades of approach lighting and the runways each serves.",
        },
        {
          title: "Circling Guidance and Runway Lead-in Lighting",
          pages: [309, 310],
          intro:
            "Lighting for the cases where the approach does not deliver you " +
            "straight down the runway centreline.",
        },
        {
          title: "Visual Approach Slope Indicators",
          pages: [311, 312, 313],
          intro:
            "PAPI, VASIS and T-VASIS: three ways of showing the same three " +
            "degrees.",
        },
        {
          title: "Aerodrome Beacons",
          pages: [314],
          intro:
            "The light that says 'the aerodrome is here', and how it is " +
            "characterised.",
        },
      ],
    },

    /* ================================================================ 11 == */
    {
      title: "Departures",
      intro:
        "From the runway into the enroute structure, and the rules that govern " +
        "each way of getting there.",
      topics: [
        {
          title: "Standard Instrument Departures",
          pages: [315, 316, 317, 318, 319],
          intro:
            "What a SID is, what it requires of you, and what it guarantees in " +
            "return.",
        },
        {
          title: "End of Departure",
          pages: [320],
          intro:
            "Where the departure procedure stops and the enroute phase begins — " +
            "which is also where the procedure's terrain protection stops.",
        },
        {
          title: "Departure Charts in Practice",
          pages: [321, 322, 323, 324, 325],
          intro:
            "Worked departure charts, read the way you would read them in the " +
            "aeroplane.",
        },
        {
          title: "Radar Departure Limitations",
          pages: [328],
          intro:
            "What a radar departure can and cannot do for you.",
        },
        {
          title: "Departures from Uncontrolled Aerodromes",
          pages: [329],
          intro:
            "Leaving an aerodrome in uncontrolled airspace under IFR, where " +
            "nobody is clearing you and the responsibility is entirely yours.",
        },
        {
          title: "Visual Departures and Secondary Runways",
          pages: [330, 331],
          intro:
            "Two variations on the standard departure and the conditions " +
            "attached to each.",
        },
      ],
    },

    /* ================================================================ 12 == */
    {
      title: "Holding and Arrival Procedures",
      intro:
        "The largest operational chapter in the subject: holding, arriving, " +
        "approaching, and the point at which an approach must be abandoned.",
      topics: [
        {
          title: "Holding Speeds and Patterns",
          pages: [332, 333, 334],
          intro:
            "The shape of a hold and the speeds that may be flown in it — " +
            "including what to do when you cannot fly them.",
          keyPoints: [
            "Where the speed for a particular approach differs from the published table, it is annotated on the chart.",
            "Subject to ATC clearance, 280 kt is available for all enroute holding patterns, and for approach holding under radar control.",
            "An aircraft that cannot comply must advise ATC and request an acceptable speed.",
            "Either accommodation may bring a requirement to raise the minimum holding altitude.",
          ],
          context:
            "The link between speed and altitude is the protected airspace. A " +
            "faster hold needs a bigger pattern, and where the terrain does not " +
            "allow a bigger pattern, the answer is a higher one.",
        },
        {
          title: "Holding Pattern Entry",
          pages: [335, 336, 337, 338, 339],
          diagramNotes: {
            335:
              "The three entry sectors drawn around the holding fix, for a right " +
              "and a left hand pattern. The sector your inbound track falls in " +
              "decides the entry, and the 5° zone either side of a boundary is " +
              "the flexibility the text describes.",
            339:
              "The special VOR/DME fix hold: the entry point is the fix itself " +
              "and the outbound leg is limited by DME distance rather than by " +
              "time, which is what the 'DME outbound limiting distance' arrow " +
              "marks.",
          },
          intro:
            "Three entry sectors, the DME arc case, the special VOR/DME fix " +
            "entry, and how long to fly outbound.",
          keyPoints: [
            "Sector 1, the parallel entry: at the fix turn to the reciprocal of the inbound track, fly the period or limiting distance, turn onto the holding side to intercept the inbound track to the fix, then follow the pattern.",
            "Sector 2, the offset entry: at the fix take up a track 30° from the reciprocal of the inbound track on the holding side, fly the time or limiting distance — or the limiting radial, whichever comes first — then intercept the inbound track.",
            "Sector 3, the direct entry: at the fix, simply follow the pattern.",
            "From a DME arc, enter by either the sector 1 or the sector 3 procedure.",
            "Still-air outbound time on a sector 1 or 2 entry: not more than one minute at or below 14,000 ft, one and a half minutes above it. The leg may be specified as a distance instead.",
          ],
          takeaway:
            "Work out the entry sector before you get there. Deciding it " +
            "overhead the fix is how an entry becomes an improvisation.",
        },
        {
          title: "Onwards Clearance, Expected Approach Time and Holding Turns",
          pages: [340, 341],
          intro:
            "Two different times, given in two different situations, and the " +
            "bank angle that applies to every turn in the pattern.",
          keyPoints: [
            "Held enroute, or anywhere other than the initial approach fix, you are given an onwards clearance time — when you can expect to leave the hold.",
            "Held at an initial approach fix with a delay exceeding five minutes, you are given an expected approach time.",
            "All turns are made at 25° of bank, or 3° per second, whichever requires the lesser bank.",
          ],
          misconception:
            "Using the two times interchangeably. An onwards clearance time says " +
            "when you leave the hold; an expected approach time says when the " +
            "approach begins — and it is the second that the communication " +
            "failure procedures are built around.",
        },
        {
          title: "The Approach and Descent Below MFA",
          pages: [342, 343],
          intro:
            "Where the approach begins, and the conditions under which the " +
            "minimum flight altitude may be left to fly it.",
        },
        {
          title: "Standard Arrival Routes",
          pages: [344, 345, 346, 347, 348],
          intro:
            "STARs, how they connect the enroute structure to the approach, and " +
            "the PBN limitations that apply to some of them.",
        },
        {
          title: "Minimum Initial Approach Altitude",
          pages: [349, 350],
          intro:
            "The altitude at which the approach may be commenced, and how it is " +
            "determined.",
        },
        {
          title: "Approach Charts in Practice",
          pages: [351, 352, 353, 354, 355, 356, 357],
          intro:
            "Worked approach charts across the aid types, read as you would in " +
            "the aircraft.",
        },
        {
          title: "Operating Below DA, DH or MDA",
          pages: [358, 370],
          intro:
            "The visual reference required before descent may continue below the " +
            "minimum — the single most consequential rule in the subject.",
          takeaway:
            "The rule is not about how much you can see. It is about what you " +
            "must be able to see, and identify, before you may go lower.",
        },
        {
          title: "Base Turn Approaches and Descent Restrictions",
          pages: [359, 360],
          intro:
            "Joining a navigation aid for a base turn, and the descent " +
            "limitations that apply.",
        },
        {
          title: "Visual Approaches",
          pages: [361, 362, 363],
          intro:
            "Completing an instrument arrival visually, inside and outside " +
            "controlled airspace, and what ATC must have available first.",
        },
        {
          title: "Aircraft Categories and Procedure Speeds",
          pages: [364, 365],
          intro:
            "Your category decides which set of minima and which protected " +
            "airspace you are flying inside.",
        },
        {
          title: "Position Reporting During Arrival",
          pages: [366, 367],
          intro:
            "What to report during a STAR and approach at a controlled " +
            "aerodrome, and at an unattended one.",
        },
        {
          title: "Approaches at Unattended Aerodromes and Remote QNH",
          pages: [368, 369],
          intro:
            "Flying an instrument approach where nobody is there, including what " +
            "to do about the altimeter setting.",
          context:
            "Using a remote QNH means accepting a pressure datum measured " +
            "somewhere else. That is why its use is bounded rather than general.",
        },
        {
          title: "Missed Approach Procedures",
          pages: [371, 372, 373],
          intro:
            "Going around from the approach, and the separate case of losing " +
            "visual reference while circling.",
          misconception:
            "Treating the circling case as an ordinary missed approach. Losing " +
            "visual reference in the circuit has its own procedure, because you " +
            "are no longer on the protected approach path.",
        },
      ],
    },

    /* ================================================================ 13 == */
    {
      title: "Emergencies and Failures",
      intro:
        "What to do when something stops working. The communication failure " +
        "procedures are the largest part and the most examinable: they are what " +
        "ATC will assume you are doing.",
      topics: [
        {
          title: "Emergency Transponder Codes",
          pages: [374, 375],
          intro:
            "Three codes that say what you may not be able to.",
        },
        {
          title: "Unlawful Interference",
          pages: [376],
          intro:
            "Confirming an unlawful interference squawk, and what follows.",
        },
        {
          title: "Speechless Technique and Distress",
          pages: [377, 378],
          intro:
            "Communicating without speech when the transmitter works and you " +
            "cannot, and the distress procedure.",
        },
        {
          title: "ELT Activation, Testing and Reporting",
          pages: [379, 380, 381],
          intro:
            "Inadvertent activation, permitted testing, and the reports " +
            "required.",
        },
        {
          title: "Communication and Navigation Aid Failures",
          pages: [382, 383],
          intro:
            "The general framework for a failure of communications or of an aid.",
        },
        {
          title: "Radar and Radio Failure Procedures",
          pages: [384, 385, 386],
          intro:
            "What ATC does when it loses you, and what you should be doing while " +
            "it happens.",
        },
        {
          title: "IFR Communication Failure: General Principles",
          pages: [387],
          intro:
            "The first actions, in order, and the assumption ATC will be making " +
            "about you while you carry them out.",
          keyPoints: [
            "Maintain terrain clearance throughout every one of these procedures.",
            "Squawk 7600, or the communication failure mode on ADS-B.",
            "Try the alternate then the secondary published ATS frequencies, and check your own equipment.",
            "Listen to the ATIS if you can.",
            "If the transmitter may still work, transmit position and intentions prefixed \u201cTRANSMITTING BLIND\u201d.",
            "Turn on landing lights, beacons and strobes.",
            "A mobile phone in the aircraft may reach Control or Information directly.",
            "If the destination is inside an MBZ, divert — unless diverting is clearly the greater risk.",
          ],
          misconception:
            "Going quiet because the receiver has failed. A failed receiver and " +
            "a failed transmitter are different failures: if the transmitter may " +
            "still be working, blind transmissions are what let ATC plan around " +
            "you.",
          takeaway:
            "The whole doctrine is: be predictable. ATC will clear the airspace " +
            "around what they expect you to do, so do that.",
        },
        {
          title: "Communication Failure in VMC",
          pages: [388],
          intro:
            "The simplest case, and the only one that ends the instrument flight " +
            "early.",
          keyPoints: [
            "Remain in VMC and continue the flight under VFR.",
            "Proceed to a suitable aerodrome and land.",
            "Report arrival to the appropriate ATS unit by the quickest means available.",
          ],
          takeaway:
            "The reporting step is not paperwork. Until it happens, an alerting " +
            "service is running on your behalf.",
        },
        {
          title: "Communication Failure in IMC",
          pages: [389],
          intro:
            "The procedure when you are in IMC, or cannot be certain of " +
            "maintaining VMC. Everything rests on being where ATC assumes you " +
            "are.",
          keyPoints: [
            "What you do depends on the destination aids, the airspace procedures, and the weather enroute and at destination.",
            "ATC will separate other traffic on the assumption that you follow these procedures unless strong reasons dictate otherwise.",
            "Proceed in accordance with the current flight plan as confirmed by the last acknowledged clearance.",
            "ATC will assume you climb to the flight planned level, or to the last level you requested and they acknowledged.",
          ],
          context:
            "Note that uncertainty is treated as IMC. The rule does not ask you " +
            "to gamble on the weather holding.",
        },
        {
          title: "Communication Failure on Departure",
          pages: [390, 391],
          intro:
            "Two departure cases, each with its own waiting period before you " +
            "revert to the flight plan.",
          keyPoints: [
            "Under a level restriction: maintain the last assigned level to the points specified, then climb to the flight-planned level.",
            "Where no points were specified: maintain the last assigned level, or minimum flight altitude if that is higher, for five minutes, then climb to the flight-planned level.",
            "Under radar vectors: maintain the last assigned vector for two minutes, climbing to minimum safe altitude if terrain requires it, then rejoin the flight-planned route.",
          ],
          context:
            "The two waiting periods — five minutes on a level restriction, two " +
            "on a vector — exist so the controller can predict your next move. " +
            "They are the difference between a silent aeroplane and an unknown " +
            "one.",
        },
        {
          title: "Communication Failure on Arrival",
          pages: [392, 393, 394],
          intro:
            "Arriving without a radio: in general, at or within 25 NM of " +
            "destination, and while being radar vectored.",
          keyPoints: [
            "Track to the destination aid or fix — or, if ATC specified none, the one for the known or forecast runway.",
            "If you hold an arrival clearance, track via it; then descend to the initial approach altitude per the last acknowledged clearance and standard procedure.",
            "At or within 25 NM: arrive over the fix at the last assigned level, as near as possible to the expected approach time, and commence the approach.",
            "Too high: descend in the holding pattern to a level convenient for approach.",
            "On initial approach but not cleared for it: continue the procedure at the last assigned level until established on final approach track, then commence approach.",
            "Under radar vectors: maintain the last vector for two minutes, climbing to MSA if terrain requires, then proceed to the aid or fix.",
          ],
          misconception:
            "Descending toward the aerodrome because you are close to it. The " +
            "level is held until the procedure gives you one — the expected " +
            "approach time, not proximity, is what starts the approach.",
        },
        {
          title: "Communication Failure and Diversion",
          pages: [395],
          intro:
            "When the approach does not work, and the clock that decides how many " +
            "attempts you get.",
          keyPoints: [
            "Unable to land: carry out the missed approach.",
            "A second approach may be made if a landing can be achieved within 30 minutes of the expected approach time or the ETA, whichever is later.",
            "If that is unsuccessful, divert to the alternate.",
            "Holding because the destination has closed: hold until the divert time notified to ATC, then depart for the alternate.",
          ],
          takeaway:
            "The 30-minute window is the whole rule. Past it, the decision has " +
            "been made for you.",
        },
        {
          title: "Approach Aid Failure",
          pages: [396],
          intro:
            "When the aid you were going to use stops working, and what remains " +
            "available.",
        },
      ],
    },
  ],
};

export default subject;
