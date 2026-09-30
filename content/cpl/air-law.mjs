/**
 * CPL Air Law — the curriculum.
 *
 * The deck is 423 slides and its own nineteen section dividers describe a
 * sensible order, which this curriculum largely keeps. Where it departs, it is
 * because a divider covers too much ground to be one chapter: "The Pilot" runs
 * from slide 83 to 151 and holds licensing, medicals, command responsibility,
 * passenger safety and currency, which are four different subjects a student
 * needs to be able to find separately. The Part 135 block at the end carries
 * its own unlabelled sub-headings ("Part 135 – Performance", "Part 135 –
 * Weight & Balance") and those become the chapter boundaries there.
 *
 * Air law is a subject where the source must lead completely. Every rule,
 * every figure, every period and every minimum below comes from the deck.
 * Authored blocks explain why a rule exists, how two rules relate, and where
 * candidates confuse them — they never state a requirement of their own.
 */

export const subject = {
  slug: "air-law",
  title: "CPL Air Law",
  deck: "cpl-air-law",

  skip: {
    1: "deck cover slide: the words \"CPL Air Law\" on a title layout, with no body text",
    2: "examination administration — two hours, 60 questions, the documents allowed. Belongs on the course page rather than inside a lesson on air law",
    3: "section divider: the heading \"Administration\" with no text of its own",
    28: "section divider: the heading \"The Aircraft\" with no text of its own",
    32: "section divider: the heading \"Certificates and Permits\" with no text of its own",
    83: "section divider: the heading \"The Pilot\" with no text of its own",
    126: "section divider: the heading \"Passengers\" with no text of its own",
    152: "section divider: the heading \"Crew Member Requirements\" with no text of its own",
    158: "section divider: the heading \"Aerodromes\" with no text of its own",
    191: "section divider: the heading \"Airspace\" with no text of its own",
    220: "section divider: the heading \"Air Traffic Services\" with no text of its own",
    243: "section divider: the heading \"Flight Planning\" with no text of its own",
    251: "section divider: the heading \"Radio Communications\" with no text of its own",
    253: "section divider: the heading \"VFR Meteorological Minima\" with no text of its own",
    270: "section divider: the heading \"Right of Way Rules\" with no text of its own",
    281: "section divider: the heading \"Heights and Cruising Levels\" with no text of its own",
    305: "section divider: the heading \"Miscellaneous Operations\" with no text of its own",
    306: "section divider: the heading \"Flight Over Water\" with no text of its own",
    340: "section divider: the heading \"Accidents and Incidents\" with no text of its own",
    350: "section divider: the heading \"Aerodrome Lighting\" with no text of its own",
    369: "sub-divider inside the Part 135 block: the line \"Part 135 – Air Operations Small Aeroplanes/Helicopters\" and nothing else",
    374: "sub-divider inside the Part 135 block: the line \"Part 135 – Flight Operations\" and nothing else",
    383: "sub-divider inside the Part 135 block: the line \"Part 135 – Operating Limitations and Weather\" and nothing else",
    388: "sub-divider inside the Part 135 block: the line \"Part 135 – Performance\" and nothing else",
    396: "sub-divider inside the Part 135 block: the line \"Part 135 – Weight & Balance\" and nothing else",
    400: "sub-divider inside the Part 135 block: the line \"Part 135 – Instruments & Equipment\" and nothing else",
    405: "sub-divider inside the Part 135 block: the line \"Part 135 – Crew Member Requirements\" and nothing else",
    409: "sub-divider inside the Part 135 block: the line \"Part 135 – Training/Competency Checks\" and nothing else",
    412: "sub-divider inside the Part 135 block: the line \"Part 135 – Fatigue of Flight Crew\" and nothing else",
    414: "sub-divider inside the Part 135 block: the line \"Part 135 – Manuals & Flight Docs\" and nothing else",
    418: "a second cover slide carrying the words \"CPL Air Law\" with no body text",
    419: "section divider: the heading \"Global Navigation Satellite System\" with no text of its own",
  },

  chapters: [
    {
      title: "The Regulatory Framework and Aeronautical Information",
      syllabus: ["16.2", "16.4", "16.6", "16.20"],
      intro:
        "Air law is a vocabulary and a hierarchy before it is a set of rules. " +
        "This chapter is who makes the rules, what each kind of document can " +
        "and cannot require of you, and how you know the copy in front of you " +
        "is still current.",
      topics: [
        {
          title: "Who Makes the Rules",
          pages: [4, 5, 6],
          intro:
            "Two organisations, and the form the rules take when they are made.",
          context:
            "Notice the split. One body sets policy and makes rules; the other " +
            "administers the examinations and licensing paperwork. Confusing them " +
            "is common and matters, because only one of them can change a rule.",
        },
        {
          title: "The Act, the Rules and Advisory Circulars",
          pages: [7, 8, 9, 10],
          intro:
            "Three documents in descending order of authority, and the different " +
            "job each one does.",
          keyPoints: [
            "The Civil Aviation Act is produced by Parliament and sets the framework.",
            "Civil Aviation Rules are produced by the CAA under the Act.",
            "Advisory Circulars are issued by the CAA and describe acceptable means of compliance.",
          ],
          misconception:
            "Treating an Advisory Circular as optional because it is called " +
            "advisory. It describes a way of meeting a rule that the Director has " +
            "already accepted — follow it and you are compliant without further " +
            "argument. Depart from it and the requirement has not gone away; you " +
            "have simply taken on the job of proving your alternative meets it.",
        },
        {
          title: "The NZAIP, Supplements and NOTAMs",
          pages: [11, 12, 13, 14, 15],
          intro:
            "Four publications that differ in one dimension: how quickly the " +
            "information in them changes.",
          context:
            "Read them as a sequence by permanence. The AIP holds information of " +
            "a lasting nature; the Supplement holds what is temporary or amends " +
            "it; a NOTAM holds what is urgent enough that neither can wait for it; " +
            "and an AIC holds what matters but qualifies as none of the three. A " +
            "NOTAM exists precisely because something in the AIP is no longer " +
            "true, which is why checking the AIP alone is never sufficient.",
        },
        {
          title: "Currency of Documents",
          pages: [16],
          intro:
            "The shortest rule in the chapter and one of the easiest to fail: an " +
            "out-of-date document is not a document.",
        },
        {
          title: "Definitions and Abbreviations",
          pages: [17, 18],
          intro:
            "Where the defined terms live, and why the definitions are worth " +
            "reading before the rules that use them.",
          takeaway:
            "Almost every rule later in this subject is written in terms defined " +
            "here. A definition read loosely is a rule applied wrongly, and in an " +
            "examination the difference between two answers is often one defined " +
            "word.",
        },
        {
          title: "Units of Measurement and the Time System",
          pages: [19, 20],
          intro:
            "Which units aviation in New Zealand uses for each quantity, and the " +
            "one place where two references are in play at once.",
          misconception:
            "Assuming everything is magnetic. Bearings are magnetic — except that " +
            "the Met Service works in true, which is exactly the trap that turns " +
            "a forecast wind into a crosswind calculation with the local variation " +
            "buried in it.",
        },
      ],
    },

    {
      title: "Operations for Hire or Reward",
      syllabus: ["16.30", "16.40"],
      intro:
        "Which Civil Aviation Rule Part applies to a flight depends on what the " +
        "flight is for and what it is being flown in. This chapter is the test " +
        "that decides, and it is the frame every operational rule later in the " +
        "subject sits inside.",
      topics: [
        {
          title: "Which Rule Part Applies",
          pages: [21],
          intro:
            "Aircraft size and passenger seating decide the Part, and the Part " +
            "decides the requirements.",
        },
        {
          title: "Hire or Reward",
          pages: [22, 23],
          intro:
            "The definition that turns a private flight into a commercial one, " +
            "and it is broader than money.",
          takeaway:
            "Reward is not only cash. Goods, credit or any other form of " +
            "consideration for services rendered brings the flight inside the " +
            "commercial rules — which is where a CPL holder spends their working " +
            "life, and where a PPL holder can end up by accident.",
        },
        {
          title: "Air Transport and Commercial Transport Operations",
          pages: [24, 25, 26],
          intro:
            "Two kinds of air operation, distinguished by what is being carried " +
            "and for whom — and the definition of a crew member that follows from " +
            "it.",
          context:
            "The crew-member definition matters more than it looks. A passenger " +
            "who helps with a task is still a passenger, which means every " +
            "passenger rule in this subject still applies to them and none of the " +
            "crew rules do.",
        },
        {
          title: "Offences and Penalties",
          pages: [27],
          intro:
            "What the Act requires of you personally, stated in the Act rather " +
            "than in a rule made under it.",
        },
      ],
    },

    {
      title: "Aircraft Definitions, Registration and Callsigns",
      syllabus: ["16.4", "16.20"],
      intro:
        "What counts as an aircraft in law, how one is entered on the New " +
        "Zealand register, and the three ways its callsign can be built.",
      topics: [
        {
          title: "Defined Terms for the Aircraft",
          pages: [29, 30, 31],
          intro:
            "Aircraft, approved, flight manual and maintenance — four definitions " +
            "the whole airworthiness chapter depends on.",
        },
        {
          title: "The Certificate of Registration",
          pages: [33],
          intro:
            "What registration establishes, and in whose name.",
        },
        {
          title: "Registration Markings",
          pages: [34],
          intro:
            "What must be displayed on the aircraft, and the extra requirement " +
            "that appears above a weight threshold.",
        },
        {
          title: "Callsigns: Types A, B and C",
          pages: [35, 36, 37, 38],
          intro:
            "One registration, three ways of saying it on the radio, chosen by " +
            "what kind of operation is being flown.",
          keyPoints: [
            "Type C is the aircraft type plus the last three letters of the registration.",
            "Type B is the operator's telephony designator plus the last three letters of the registration.",
            "Type A is the operator's telephony designator plus the flight identification.",
          ],
          context:
            "The progression is from identifying an aeroplane to identifying a " +
            "service. A training flight is a particular aircraft, so Type C says " +
            "which one. A scheduled service is a particular flight, and which " +
            "airframe is operating it is not what the controller needs.",
        },
      ],
    },

    {
      title: "Airworthiness Certificates and Categories",
      syllabus: ["16.20", "16.22"],
      intro:
        "An aircraft may only be operated in the ways its certificate allows. " +
        "This chapter is the certificate, the categories it can be issued in, " +
        "and what each category permits.",
      topics: [
        {
          title: "Type Certificates and Airworthiness Certificates",
          pages: [39, 40],
          intro:
            "Two different certificates: one for the design, one for the " +
            "individual aircraft.",
          context:
            "A type certificate says this design has been approved. An " +
            "airworthiness certificate says this particular aeroplane conforms to " +
            "that design and is in a fit condition. You need both, and only the " +
            "second one can be lost by neglect.",
        },
        {
          title: "Standard and Restricted Categories",
          pages: [41, 42],
          intro:
            "The category most aircraft hold, and the one that trades " +
            "operational freedom for load limits.",
        },
        {
          title: "Special Category and Experimental Certificates",
          pages: [43, 44],
          intro:
            "The category for aircraft that meet neither of the others, and its " +
            "subdivisions.",
        },
        {
          title: "Special Flight Permits and Multiple Categories",
          pages: [45, 46],
          intro:
            "Permission for a specific flight when the normal certificate cannot " +
            "cover it, and the aircraft that can hold more than one category.",
        },
        {
          title: "The Flight Permit",
          pages: [47],
          intro:
            "The microlight equivalent, and the conditions attached to it.",
        },
        {
          title: "The Flight Manual",
          pages: [48],
          intro:
            "The document the operating limitations actually live in, and who " +
            "writes it.",
          takeaway:
            "The Flight Manual is not background reading. Several rules later in " +
            "this subject are written as \"operate in compliance with the Flight " +
            "Manual\", so its limitations are legal limits, not manufacturer " +
            "advice.",
        },
      ],
    },

    {
      title: "Maintenance and Release to Service",
      syllabus: ["16.22"],
      intro:
        "Who may work on an aircraft, what has to be recorded, and the single " +
        "signature that decides whether it may fly again.",
      topics: [
        {
          title: "The Operator's Maintenance Obligations",
          pages: [49, 50],
          intro:
            "What the operator must ensure has been done, and the equipment with " +
            "its own inspection intervals.",
        },
        {
          title: "Maintenance for Air Operations",
          pages: [51],
          intro:
            "The additional requirements that attach once the aircraft is used " +
            "commercially.",
        },
        {
          title: "The Technical Log",
          pages: [52, 53],
          intro:
            "The document that tells the pilot the maintenance state of the " +
            "aircraft, and what has to be in it.",
          context:
            "The entry that matters most to you before a flight is the deferred " +
            "rectification: the list of what is unserviceable and the conditions " +
            "under which the aircraft may still be flown with it. That is the " +
            "difference between a defect somebody knows about and one you are " +
            "about to discover.",
        },
        {
          title: "Release to Service",
          pages: [54, 55],
          intro:
            "The certification that returns an aircraft to flying after " +
            "maintenance, and where it is recorded.",
        },
        {
          title: "The Operational Flight Check",
          pages: [56],
          intro:
            "When maintenance may have changed how the aircraft flies, and who " +
            "may check it.",
        },
        {
          title: "Pilot Maintenance",
          pages: [57, 58],
          intro:
            "The limited tasks a licensed pilot may carry out themselves, and the " +
            "authorisation required first.",
          misconception:
            "Reading the list as things a pilot may do. It is a list of things a " +
            "pilot with an appropriate type rating may do <em>when authorised by " +
            "the operator</em> — the rating alone is not the permission.",
        },
      ],
    },

    {
      title: "Documents to be Carried, Cargo and Load Manifests",
      syllabus: ["16.20"],
      intro:
        "What must physically be in the aircraft before it moves, and the " +
        "additional paperwork an air operation attracts.",
      topics: [
        {
          title: "Documents to be Carried",
          pages: [59, 60],
          intro:
            "The list for any flight, and the extra list for an air operation.",
        },
        {
          title: "Carriage of Cargo and Baggage",
          pages: [61],
          intro:
            "Where baggage may be during take-off and landing, and why the rule " +
            "is written the way it is.",
        },
        {
          title: "Load Manifests",
          pages: [62],
          intro:
            "Weight and centre of gravity as a documentation requirement rather " +
            "than a performance one, and which Part demands it.",
        },
      ],
    },

    {
      title: "Instruments and Equipment",
      syllabus: ["16.24", "16.26"],
      intro:
        "The minimum fit for the operation being flown. The lists build on each " +
        "other — day VFR, then air operations, then night — so read them as " +
        "layers rather than as separate lists.",
      topics: [
        {
          title: "Minimum Instruments and Equipment",
          pages: [63, 64, 65, 66],
          intro:
            "The base requirement: what the aircraft must be able to indicate, " +
            "and the restraint requirements that go with it.",
        },
        {
          title: "Air Transport Operation Requirements",
          pages: [67],
          intro:
            "What is added once passengers are being carried for reward.",
        },
        {
          title: "Night VFR Instruments and Equipment",
          pages: [68],
          intro:
            "The further layer for flight at night.",
          context:
            "The night list is the clearest illustration of the layering: it does " +
            "not replace the day requirements, it adds to them. An examination " +
            "question that names an operation is asking you to add up the layers " +
            "that apply to it.",
        },
        {
          title: "Fuel and Oil Markings",
          pages: [69],
          intro:
            "The placarding requirements around fuel, and the unit trap they " +
            "exist to prevent.",
        },
        {
          title: "Radio Equipment",
          pages: [70, 71],
          intro:
            "What must be fitted for controlled airspace, and the redundancy " +
            "requirement for air operations.",
        },
        {
          title: "Altimeter and Static System Tests",
          pages: [72],
          intro:
            "The inspection interval for the pressure instruments, and the events " +
            "that trigger a fresh test.",
        },
        {
          title: "Inoperative Instruments and Equipment",
          pages: [73],
          intro:
            "What may be unserviceable and the aircraft still flown, for aircraft " +
            "without a Minimum Equipment List.",
          takeaway:
            "The test is a series of exclusions rather than a permission. " +
            "Something may be inoperative only if it is not on any of the lists " +
            "that make it required — so the question to ask is never \"can I go " +
            "without this\" but \"is this required by anything that applies to " +
            "today's flight\".",
        },
      ],
    },

    {
      title: "Emergency Equipment, ELTs and Oxygen",
      syllabus: ["16.26"],
      intro:
        "Three requirements that turn on altitude, aircraft type and the kind " +
        "of operation rather than on a single rule.",
      topics: [
        {
          title: "Emergency Equipment",
          pages: [74],
          intro:
            "Where the legal requirement begins, and where it does not exist at " +
            "all under Part 91.",
        },
        {
          title: "Emergency Locator Transmitters",
          pages: [75, 76],
          intro:
            "Which aircraft must carry one, the exceptions, and the testing and " +
            "battery requirements.",
        },
        {
          title: "Oxygen Requirements",
          pages: [77, 78],
          intro:
            "The altitudes and durations at which oxygen must be installed and " +
            "used, and how the requirement changes as you go higher.",
          context:
            "There are two thresholds working together: an altitude above which " +
            "oxygen is required at all times, and a band below it where the " +
            "requirement depends on how long you stay there. That second one is " +
            "the one people forget, because nothing happens quickly enough at " +
            "those levels to remind you.",
        },
        {
          title: "Transponders",
          pages: [79],
          intro:
            "Where a transponder is required, and what an aircraft fitted with " +
            "one must do with it.",
        },
      ],
    },

    {
      title: "Aircraft Fuelling",
      syllabus: ["16.30"],
      intro:
        "The rules around putting fuel into an aircraft — a short chapter about " +
        "a routine operation that the rules treat as a hazardous one.",
      topics: [
        {
          title: "Fuelling and Defuelling",
          pages: [80],
          intro:
            "What the person carrying out the operation must ensure.",
        },
        {
          title: "Flammable Liquids and Refuelling Under Part 135",
          pages: [81, 82],
          intro:
            "The hazard classification behind the rule, and the additional " +
            "provision that applies to an air operation.",
        },
      ],
    },

    {
      title: "Licences, Ratings and Written Examinations",
      syllabus: ["16.10", "16.12"],
      intro:
        "What licences and ratings exist, what it takes to be issued one, and " +
        "the two ratings with requirements detailed enough to be examined on.",
      topics: [
        {
          title: "Defined Terms for Licensing",
          pages: [84, 85, 86],
          intro:
            "Appropriate, category, day, dual flight time and flight time — the " +
            "definitions every currency and experience rule is counted in.",
          misconception:
            "Using flight time loosely. It is measured from the moment the " +
            "aircraft first moves under its own power for the purpose of taking " +
            "off until it finally stops — not wheels-up to wheels-down. Every " +
            "experience requirement in this chapter is counted in that quantity.",
        },
        {
          title: "Licences and Ratings Available",
          pages: [87, 88, 89],
          intro:
            "The licences a pilot can hold, the ratings that can be added to " +
            "them, and the conduct that bears on fitness to hold either.",
        },
        {
          title: "Written Examinations",
          pages: [90],
          intro:
            "What an applicant must produce, and the standard required.",
        },
        {
          title: "Aircraft Type Ratings",
          pages: [91],
          intro:
            "Where the requirements are prescribed, and the shape of them.",
        },
        {
          title: "The Aerobatics Rating",
          pages: [92, 93, 94],
          intro:
            "Issue requirements, the privileges that come with the rating, and " +
            "what keeps it current.",
        },
      ],
    },

    {
      title: "Medical Requirements",
      syllabus: ["16.16"],
      intro:
        "Three classes of medical certificate, each with a validity that " +
        "depends on the holder's age and on what they are doing with the " +
        "licence.",
      topics: [
        {
          title: "Medical Standards",
          pages: [95],
          intro:
            "Where the standards are set and who assesses them.",
        },
        {
          title: "Class 1, 2 and 3 Medical Certificates",
          pages: [96, 97, 98],
          intro:
            "The maximum validity of each class, and the two variables that " +
            "shorten it.",
          context:
            "Two things reduce the period every time: being older, and doing more " +
            "demanding work with the certificate. Reading the classes side by " +
            "side rather than one at a time makes the pattern obvious and the " +
            "figures much easier to hold.",
        },
      ],
    },

    {
      title: "Student, Private and Commercial Licences",
      syllabus: ["16.10", "16.12"],
      intro:
        "Eligibility, privileges, limitations and currency for each licence in " +
        "turn. Read the CPL against the PPL: most of what it adds is the " +
        "removal of the words \"not for remuneration\".",
      topics: [
        {
          title: "Student Pilots",
          pages: [99, 100, 101],
          intro:
            "What a person may do before holding any licence, what has to be " +
            "certified in the logbook first, and the limitations that remain.",
        },
        {
          title: "The Private Pilot Licence",
          pages: [102, 103, 104, 105, 106],
          intro:
            "Eligibility, the examinations required, what the licence authorises, " +
            "what it forbids, and what keeps it current.",
        },
        {
          title: "The Commercial Pilot Licence",
          pages: [107, 108, 109, 110],
          intro:
            "The same four questions for the licence you are working towards.",
          takeaway:
            "The CPL does not replace the PPL's privileges — it adds to them. " +
            "That is why holding a current PPL is one of the eligibility " +
            "requirements, and why the CPL's own currency requirements are written " +
            "as additions rather than substitutions.",
        },
      ],
    },

    {
      title: "Recent Experience and Lapsed Licences",
      syllabus: ["16.14"],
      intro:
        "Holding a licence and being entitled to use it today are different " +
        "questions. This chapter is the second one.",
      topics: [
        {
          title: "Recent Flight Experience: Day",
          pages: [111],
          intro:
            "What must have been flown recently before acting as pilot-in-command " +
            "on an air operation by day.",
        },
        {
          title: "Recent Flight Experience: Night",
          pages: [112],
          intro:
            "The same requirement for night operations, and how it differs.",
        },
        {
          title: "Lapsed Licences",
          pages: [113],
          intro:
            "What is required when the privileges of a licence have not been " +
            "exercised for a long period.",
        },
      ],
    },

    {
      title: "The Pilot-in-Command: Authority and Responsibilities",
      syllabus: ["16.80"],
      intro:
        "The rules in this chapter are all addressed to one person. Most of " +
        "the time, that person is you — and the authority and the " +
        "responsibility are two halves of the same rule.",
      topics: [
        {
          title: "Safety of the Aircraft",
          pages: [114],
          intro:
            "What the pilot-in-command must be satisfied of before flight and " +
            "ensure during it.",
        },
        {
          title: "Nomination and Designation of the Pilot-in-Command",
          pages: [115],
          intro:
            "Who decides who is in command when more than one pilot is on board.",
          takeaway:
            "Command is designated, not negotiated in the cockpit. Where a flight " +
            "has two pilots, somebody has already decided which of them is " +
            "responsible, and that decision was made before the flight.",
        },
        {
          title: "Responsibilities for Certification and Documents",
          pages: [116, 117],
          intro:
            "What the pilot must confirm about the aircraft's certification " +
            "before operating it.",
        },
        {
          title: "Crew Members",
          pages: [118],
          intro:
            "The minimum crew requirement and where it is stated.",
        },
        {
          title: "The Authority of the Pilot-in-Command",
          pages: [119, 120],
          intro:
            "What the Act says the pilot-in-command is responsible for, and the " +
            "authority that goes with it.",
          context:
            "Read these two together and the structure is clear: the Act makes " +
            "you responsible for the safety of the aircraft and everyone in it, " +
            "and then gives you the authority to issue whatever commands that " +
            "responsibility requires. One would be unworkable without the other.",
        },
        {
          title: "Pre-Flight Responsibilities",
          pages: [121, 122],
          intro:
            "What the pilot must be familiar with, and what must be obtained, " +
            "before the flight begins.",
        },
        {
          title: "Manipulation of Controls",
          pages: [123],
          intro:
            "Who may fly the aircraft on an air operation.",
        },
        {
          title: "Flight and Duty Time Limitations",
          pages: [124, 125],
          intro:
            "The fatigue rules for air operations, and the personal obligation " +
            "that sits underneath them.",
          misconception:
            "Treating the duty limits as the whole of the fatigue rule. They set " +
            "an outer boundary; the separate requirement is that a crew member " +
            "must not fly when suffering from, or likely to suffer from, fatigue " +
            "that could endanger the flight. Being inside the limits is not the " +
            "same as being fit to fly.",
        },
      ],
    },

    {
      title: "Passengers and Cabin Safety",
      syllabus: ["16.32"],
      intro:
        "What must be done for the people in the back: seating and restraint, " +
        "briefing, baggage, and the circumstances in which passengers may not " +
        "be carried at all.",
      topics: [
        {
          title: "Seating and Safety Belts",
          pages: [127],
          intro:
            "When a passenger must be seated and belted.",
        },
        {
          title: "Passenger Weights",
          pages: [128],
          intro:
            "The two methods available for establishing what the people on board " +
            "weigh.",
          context:
            "The declared-weight option carries an addition for the same reason " +
            "the actual-weight option does not: people carry things and people " +
            "understate. The allowance is part of the method, not an optional " +
            "safety margin.",
        },
        {
          title: "Compliance with Crew Instructions",
          pages: [129],
          intro:
            "What passengers must do when notified by a crew member, a placard or " +
            "a sign.",
        },
        {
          title: "The Passenger Briefing",
          pages: [130],
          intro:
            "What the pilot-in-command must ensure passengers are told.",
        },
        {
          title: "Carry-on Baggage",
          pages: [131],
          intro:
            "Where baggage may be stowed for take-off and landing, and the " +
            "condition attached.",
        },
        {
          title: "When Passengers May Not Be Carried",
          pages: [132],
          intro:
            "The manoeuvres and operations during which only required persons may " +
            "be on board.",
        },
        {
          title: "Passenger Safety and Airport Security",
          pages: [133, 134],
          intro:
            "Refusing carriage, and the identification requirements in a security " +
            "area.",
        },
      ],
    },

    {
      title: "Maintaining Currency, Logbooks and Proficiency",
      syllabus: ["16.14", "16.20"],
      intro:
        "The record you keep, the checks that keep the licence usable, and the " +
        "options when currency has lapsed.",
      topics: [
        {
          title: "Maintenance of Pilot Skills",
          pages: [135],
          intro:
            "The period after which the privileges of a licence may not be " +
            "exercised without a further check.",
        },
        {
          title: "Simulated Instrument Flight",
          pages: [136],
          intro:
            "The safeguards required before flying on instruments in visual " +
            "conditions.",
          context:
            "Every one of these conditions exists because the pilot flying is " +
            "deliberately unable to see out. The safety pilot is not a formality — " +
            "they are the aircraft's entire collision avoidance.",
        },
        {
          title: "Interference with Aircraft",
          pages: [137],
          intro:
            "What no person may do to a crew member or to an aircraft.",
        },
        {
          title: "Pilot Logbooks",
          pages: [138, 139],
          intro:
            "What must be recorded, in what form, and for how long it must be " +
            "kept.",
        },
        {
          title: "Using a Lower Licence, and Examination for Proficiency",
          pages: [140, 141],
          intro:
            "The option when currency is met for a lower licence but not the one " +
            "held, and the Director's power to require a test.",
        },
      ],
    },

    {
      title: "Operating an Aircraft: the Standing Requirements",
      syllabus: ["16.30", "16.32"],
      intro:
        "A run of rules each beginning \"no person shall operate an aircraft " +
        "unless\". Taken together they are the checklist of what must be true " +
        "of any aircraft before it is flown at all.",
      topics: [
        {
          title: "Safety of the Aircraft and Designation of Command",
          pages: [142, 143],
          intro:
            "What must be satisfied before operating, and the designation " +
            "requirement for a multi-pilot flight.",
        },
        {
          title: "Airworthiness and Category Limitations",
          pages: [144, 145, 146],
          intro:
            "The airworthiness requirement, and the operating limitations that " +
            "come with a restricted or special category certificate.",
        },
        {
          title: "Registration, Flight Manual and Crew",
          pages: [147, 148, 149],
          intro:
            "Three more standing requirements, each stated in a single sentence.",
        },
        {
          title: "Further Responsibilities of the Pilot-in-Command",
          pages: [150, 151],
          intro:
            "What the Act adds, including the emergency provision that can " +
            "displace other requirements.",
        },
      ],
    },

    {
      title: "Crew Requirements for Air Operations",
      syllabus: ["16.40"],
      intro:
        "What an operator must establish about a pilot before assigning them to " +
        "a commercial flight.",
      topics: [
        {
          title: "Assignment of Duties",
          pages: [153],
          intro:
            "What the operator must ensure each flight crew member holds.",
        },
        {
          title: "Type Experience for the Pilot-in-Command",
          pages: [154],
          intro:
            "The operating experience required on the make and model before " +
            "acting in command.",
        },
        {
          title: "Flight Crew Competency Checks",
          pages: [155, 156],
          intro:
            "The checks required in the preceding period, and what each covers.",
        },
        {
          title: "Cost Sharing",
          pages: [157],
          intro:
            "Where the boundary sits between sharing costs and operating for hire " +
            "or reward.",
          takeaway:
            "This is the rule a newly-licensed commercial pilot is most likely to " +
            "cross without meaning to. If the arrangement looks like carriage for " +
            "reward, the operator certificate requirements apply — and they apply " +
            "to the operation, not to how it was described.",
        },
      ],
    },

    {
      title: "Aerodromes: Classification and Use",
      syllabus: ["16.76"],
      intro:
        "What an aerodrome is in law, the categories they fall into, and the " +
        "rules governing which of them you may use.",
      topics: [
        {
          title: "Aerodrome Definitions",
          pages: [159, 160, 161],
          intro:
            "Aerodrome, taxiway, movement area and manoeuvring area — four " +
            "defined areas that are easy to blur and are used precisely in the " +
            "rules that follow.",
          misconception:
            "Using movement area and manoeuvring area interchangeably. They are " +
            "not the same: the movement area is the larger of the two and " +
            "includes the aprons, and several clearance requirements turn on which " +
            "one you are about to enter.",
        },
        {
          title: "Classification of Aerodromes",
          pages: [162, 163, 164, 165, 166],
          intro:
            "Certificated, non-certificated public, non-certificated private and " +
            "military — and what each permits.",
        },
        {
          title: "Controlled, Uncontrolled and Attended Aerodromes",
          pages: [167, 168],
          intro:
            "The terms describing what service, if any, is being provided, and " +
            "where to find out which applies.",
        },
        {
          title: "Use of Aerodromes",
          pages: [169, 170, 171, 172],
          intro:
            "Which aerodromes may be used for which operation, and the " +
            "suitability the pilot must satisfy themselves of.",
        },
        {
          title: "Group Ratings",
          pages: [173],
          intro:
            "How a runway's group rating is used to establish performance " +
            "compliance, and the weight below which it applies.",
        },
      ],
    },

    {
      title: "Aerodrome Traffic Rules and the Circuit",
      syllabus: ["16.76"],
      intro:
        "How aircraft are expected to behave in the vicinity of an aerodrome, " +
        "and the two ways of joining a circuit.",
      topics: [
        {
          title: "Aerodrome Traffic Rules",
          pages: [174],
          intro:
            "What every pilot must do in the vicinity of an aerodrome, whatever " +
            "service is provided.",
        },
        {
          title: "Operations at Controlled and Flight Service Aerodromes",
          pages: [175, 176],
          intro:
            "The communication and clearance requirements at each, and where they " +
            "differ.",
          context:
            "The distinction is between a clearance and a notification. At a " +
            "controlled aerodrome you are asking permission; at a flight service " +
            "aerodrome you are telling them what you intend to do. Both require " +
            "the radio call — only one of them requires an answer before you act.",
        },
        {
          title: "General Aerodrome Operations",
          pages: [177, 178],
          intro:
            "Where take-offs and landings may occur, at aerodromes with and " +
            "without defined runways.",
        },
        {
          title: "The Circuit",
          pages: [179],
          intro:
            "The defined terms, and what counts as aerodrome traffic.",
        },
        {
          title: "Circuit Joining",
          pages: [180, 181],
          intro:
            "The two basic ways of joining, and when each is appropriate.",
        },
        {
          title: "The Standard Overhead Join",
          pages: [182, 183, 184],
          intro:
            "The procedure used at unattended aerodromes, step by step.",
          takeaway:
            "The overhead join exists to solve one problem: at an unattended " +
            "aerodrome you do not know what the traffic or the wind is doing until " +
            "you can see it. Every step of the procedure is about establishing " +
            "that before committing to a circuit direction.",
        },
      ],
    },

    {
      title: "Aerodrome Communications and Signals",
      syllabus: ["16.60", "16.76"],
      intro:
        "Telling the aerodrome what you intend, finding out what the conditions " +
        "are, and the signals used when the radio is not available.",
      topics: [
        {
          title: "Advice of Intended Movement and Persons on Board",
          pages: [185, 186],
          intro:
            "What must be notified to an ATS unit, and the number that must be " +
            "passed with it.",
          context:
            "The persons-on-board report has one purpose and it is not " +
            "administrative. If the aircraft is later the subject of a search, " +
            "that number is how many people are being searched for.",
        },
        {
          title: "ATIS and AWIB",
          pages: [187],
          intro:
            "The recorded broadcasts, what each carries, and where the frequency " +
            "is published.",
        },
        {
          title: "Listening Watch at Controlled Aerodromes",
          pages: [188],
          intro:
            "The continuous watch requirement in the vicinity of a controlled " +
            "aerodrome.",
        },
        {
          title: "Light Signals and Ground Signals",
          pages: [189, 190],
          intro:
            "What the tower's light signals mean, and where the ground signal " +
            "meanings are published.",
        },
      ],
    },

    {
      title: "Classes of Airspace",
      syllabus: ["16.75", "16.62"],
      intro:
        "Airspace is classified by the service provided in it and by who is " +
        "separated from whom. Learn the pattern rather than five separate " +
        "lists.",
      topics: [
        {
          title: "Classes A to G",
          pages: [192, 193, 194],
          intro:
            "The classes used in New Zealand, and what each requires and " +
            "provides.",
          context:
            "Read down the classes and two things change together: how much " +
            "service you receive, and how much freedom you give up to get it. In " +
            "the most controlled classes everyone is separated from everyone and a " +
            "clearance is always required; by Class G you are separated from " +
            "nobody and need no clearance at all. Every specific rule in the " +
            "chapter is a consequence of where the class sits on that scale.",
        },
        {
          title: "Speed Restrictions",
          pages: [195],
          intro:
            "The speed limit below a stated altitude, the classes it applies in, " +
            "and the exception.",
        },
        {
          title: "Radios, Position Reports and Transponders",
          pages: [196, 197, 198],
          intro:
            "The equipment and reporting requirements that follow from the class " +
            "of airspace you are in.",
        },
      ],
    },

    {
      title: "Types of Airspace",
      syllabus: ["16.75"],
      intro:
        "Class describes the service; type describes the shape and the purpose. " +
        "This chapter is the volumes themselves — where they begin, where they " +
        "end and what they are for.",
      topics: [
        {
          title: "Types Distinguished from Classes",
          pages: [199],
          intro:
            "The distinction the rest of the chapter depends on.",
          misconception:
            "Treating \"Class C\" and \"control zone\" as answers to the same " +
            "question. They are not: one tells you what service you get and what " +
            "clearance you need, the other tells you the dimensions and purpose of " +
            "the volume. A single control zone has a class; the class does not " +
            "tell you where the zone is.",
        },
        {
          title: "Flight Information Regions",
          pages: [200],
          intro:
            "What an FIR is, what is provided within it and how far it extends.",
        },
        {
          title: "Control Zones and Control Areas",
          pages: [201, 202, 203],
          intro:
            "Two controlled volumes distinguished by where their lower limit " +
            "sits.",
          takeaway:
            "A control zone starts at the surface and surrounds aerodromes; a " +
            "control area starts at a specified level above it. That single " +
            "difference is what the two names encode, and it is the fastest way to " +
            "keep them apart.",
        },
        {
          title: "VFR Transit Lanes and General Aviation Areas",
          pages: [204, 205, 206],
          intro:
            "Two arrangements that let VFR traffic operate without a clearance " +
            "inside otherwise controlled airspace.",
        },
        {
          title: "Airspace Boundaries and Clearances",
          pages: [207, 208, 209],
          intro:
            "What applies where two classes adjoin, when a clearance must be " +
            "obtained, and the obligation to comply with one.",
          context:
            "The instruction to request the clearance before you need it is the " +
            "practical point of the chapter. A clearance you are still waiting for " +
            "as you reach the boundary is not a clearance, and the aeroplane does " +
            "not stop.",
        },
      ],
    },

    {
      title: "Special Use Airspace",
      syllabus: ["16.75"],
      intro:
        "Volumes established for a particular purpose — protection, hazard " +
        "warning, military activity, training — each with its own entry " +
        "condition.",
      topics: [
        {
          title: "Restricted, Danger and Military Operational Areas",
          pages: [210, 211, 212, 213],
          intro:
            "Three designations that sound similar and impose quite different " +
            "obligations.",
          misconception:
            "Assuming all three must be avoided. They differ precisely in what " +
            "they require of you — one obliges you to give due consideration, " +
            "another requires a clearance from the controlling authority. Knowing " +
            "which is which is the whole of the topic.",
        },
        {
          title: "Low Flying Zones and Volcanic Hazard Zones",
          pages: [214, 215],
          intro:
            "Two zones established for opposite reasons: one to permit something, " +
            "one to protect against something.",
        },
        {
          title: "Mandatory Broadcast Zones and Common Frequency Zones",
          pages: [216, 217],
          intro:
            "Two arrangements that increase protection in uncontrolled airspace " +
            "through radio rather than through control.",
        },
        {
          title: "Temporary Airspace and Airspace Changes",
          pages: [218, 219],
          intro:
            "Airspace that did not exist yesterday, and how to find out about it.",
          takeaway:
            "Temporary airspace is the reason a current chart is not enough on " +
            "its own. The chart shows what is permanent; the NOTAMs and the AIP " +
            "ENR section show what has changed since it was printed.",
        },
      ],
    },

    {
      title: "Air Traffic Services",
      syllabus: ["16.62"],
      intro:
        "Four services with different names, different purposes and different " +
        "obligations attached. The differences matter because what you may " +
        "expect from a unit depends on which service it is providing.",
      topics: [
        {
          title: "The Air Traffic Control Service",
          pages: [221, 222],
          intro:
            "What control means, and what an aerodrome controller provides.",
        },
        {
          title: "Aerodrome Flight Information Service",
          pages: [223],
          intro:
            "Information and advice rather than control, and what follows from " +
            "that difference.",
          context:
            "The word to hold onto is <em>information</em>. A flight information " +
            "service tells you what is happening; it does not separate you from " +
            "it. The responsibility for avoiding other aircraft stays with the " +
            "pilots, which is not true under a control service.",
        },
        {
          title: "Flight Information and Alerting Services",
          pages: [224, 225],
          intro:
            "What flight information includes, and the service that begins to " +
            "operate when an aircraft is overdue.",
        },
        {
          title: "Control Centres",
          pages: [226],
          intro:
            "Where area and approach control are provided from.",
        },
      ],
    },

    {
      title: "Radar and Transponders",
      syllabus: ["16.66", "16.74"],
      intro:
        "The two kinds of radar used in New Zealand, what each can and cannot " +
        "see, and the codes an aircraft's transponder replies with.",
      topics: [
        {
          title: "Primary and Secondary Surveillance Radar",
          pages: [227, 228, 229, 230],
          intro:
            "One system that reflects a signal off the aircraft and one that asks " +
            "the aircraft to answer.",
          context:
            "The trade is visibility against information. Primary radar sees an " +
            "aircraft whether or not it wants to be seen, but learns nothing about " +
            "it. Secondary radar depends on the aircraft's own transponder " +
            "replying — so it can be told the identity and the level, and it sees " +
            "nothing at all if the transponder is off.",
        },
        {
          title: "Radar Sites and Coverage",
          pages: [231, 232, 233],
          intro:
            "Where the radars are, their range, and the reason coverage has " +
            "holes in it.",
          takeaway:
            "Both kinds rely on line of sight, so terrain blocks them. Radar " +
            "coverage is not a blanket over the country — being in radar contact " +
            "in one valley says nothing about the next one.",
        },
        {
          title: "Transponder Operation and Codes",
          pages: [234, 235, 236, 237],
          intro:
            "What must be done with the transponder in mandatory airspace, the " +
            "permanently allocated codes, and what radar can offer a VFR flight.",
        },
      ],
    },

    {
      title: "Separation and Priorities",
      syllabus: ["16.63"],
      intro:
        "How air traffic control keeps aircraft apart, and the order in which " +
        "it decides who is accommodated first when it cannot accommodate " +
        "everyone.",
      topics: [
        {
          title: "Visual, Vertical and Horizontal Separation",
          pages: [238, 239, 240],
          intro:
            "Three methods, and the minima applied by each.",
        },
        {
          title: "Priorities",
          pages: [241],
          intro:
            "The order in which ATC applies priority between aircraft.",
          context:
            "The list is worth knowing not so you can claim a place in it, but so " +
            "you understand what is happening when you are asked to orbit. " +
            "Somebody ahead of you on that list is being accommodated.",
        },
        {
          title: "The National Briefing Office",
          pages: [242],
          intro:
            "Where the flight information and NOTAM services are based.",
        },
      ],
    },

    {
      title: "Flight Plans and Fuel Requirements",
      syllabus: ["16.50", "16.54", "16.56"],
      intro:
        "What must be obtained before a flight, when a flight plan must be " +
        "filed, what goes in it, and the fuel the rules require you to carry.",
      topics: [
        {
          title: "Planning of Flights",
          pages: [244, 245],
          intro:
            "The information the pilot-in-command must obtain and be familiar " +
            "with before departure.",
        },
        {
          title: "The Purpose of a Flight Plan",
          pages: [246],
          intro:
            "Two objectives a flight plan achieves, only one of which is about " +
            "the route.",
          takeaway:
            "The second objective is the one that matters when things go wrong: " +
            "a filed plan is what causes somebody to start looking for you. " +
            "That is also why terminating it matters as much as filing it.",
        },
        {
          title: "Filing a VFR Flight Plan",
          pages: [247],
          intro:
            "The flights for which a plan must be filed under Part 91.",
        },
        {
          title: "Content of a VFR Flight Plan",
          pages: [248],
          intro:
            "What the plan must contain.",
        },
        {
          title: "Fuel Requirements",
          pages: [249, 250],
          intro:
            "The minimum fuel a VFR flight must begin with, and the operator's " +
            "obligation under Part 135.",
          context:
            "Note the difference in kind. Part 91 states a minimum you must have; " +
            "Part 135 requires the operator to have established a policy for " +
            "arriving at it. The commercial rule is about the method, because a " +
            "single figure cannot cover every aircraft an operator flies.",
        },
        {
          title: "Radio Communications",
          pages: [252],
          intro:
            "Where the radio requirements and procedures are covered.",
        },
      ],
    },

    {
      title: "VFR Meteorological Minima",
      syllabus: ["16.34", "16.44"],
      intro:
        "The whole basis of visual flight is being able to see and avoid. " +
        "These are the conditions in which that is considered possible, and " +
        "they change with airspace, altitude and the kind of operation.",
      topics: [
        {
          title: "The Basis of VFR",
          pages: [254, 255, 256, 257],
          intro:
            "What visual meteorological conditions means, and the three " +
            "quantities it is expressed in.",
          context:
            "Visibility, distance from cloud and ceiling are not three separate " +
            "tests to pass — they are three ways of asking the same question. Can " +
            "you see far enough, and are you far enough from cloud, to see another " +
            "aircraft in time to avoid it?",
        },
        {
          title: "Minima for VFR Air Operations",
          pages: [258, 259],
          intro:
            "The additional requirements once the flight is a commercial " +
            "operation, including flight above cloud.",
        },
        {
          title: "Flight Visibility and Ceiling",
          pages: [260, 261, 262, 263, 264, 265],
          intro:
            "The defined terms, and the diagrams the deck uses to set out the " +
            "requirements.",
        },
        {
          title: "Special VFR",
          pages: [266],
          intro:
            "Operating in a control zone below the normal minima, and the " +
            "conditions that make it possible.",
        },
        {
          title: "Aerodrome VFR Meteorological Minima",
          pages: [267, 268],
          intro:
            "The minima below which an aircraft may not take off or land, and how " +
            "they differ between controlled and uncontrolled aerodromes.",
        },
        {
          title: "Snow and Ice on the Aircraft",
          pages: [269],
          intro:
            "The prohibition on taking off with contamination adhering to the " +
            "aircraft.",
          takeaway:
            "This rule has no minima and no exceptions in it. Frost on a wing is " +
            "not a small amount of ice — it changes the shape the air flows over " +
            "at exactly the moment you need every bit of lift the wing can make.",
        },
      ],
    },

    {
      title: "Right of Way Rules",
      syllabus: ["16.32"],
      intro:
        "Eight situations and the rule for each. They are worth knowing as " +
        "reflexes rather than as recall, because the moment you need one there " +
        "is no time to work it out.",
      topics: [
        {
          title: "The General Obligation",
          pages: [271],
          intro:
            "The lookout requirement that applies whatever the rules of flight, " +
            "and which comes before any of the specific rules.",
        },
        {
          title: "Head On, Converging and Overtaking",
          pages: [272, 273, 274],
          intro:
            "The three in-flight encounters, and what each requires.",
          context:
            "There is a logic underneath the converging rule that makes it easier " +
            "to hold: the aircraft with less ability to manoeuvre or to see is " +
            "generally given way to. That is why the exceptions run in the " +
            "direction they do.",
        },
        {
          title: "Landing, Emergency Landing and Take-off",
          pages: [275, 276, 277],
          intro:
            "Right of way on and near the ground, including the aircraft that " +
            "takes priority over everything.",
        },
        {
          title: "Taxiing and Operating Near Other Aircraft",
          pages: [278, 279],
          intro:
            "Giving way on the ground, and the prohibition on operating close to " +
            "another aircraft.",
        },
        {
          title: "The 12-Hour Clock Reference",
          pages: [280],
          intro:
            "How the direction of one aircraft from another is expressed.",
          takeaway:
            "Traffic is always passed relative to the nose of your aircraft, not " +
            "relative to a compass. Turn, and the same traffic has a different " +
            "clock position — which is why the call is repeated as the geometry " +
            "changes.",
        },
      ],
    },

    {
      title: "Altimeter Settings and the Transition Layer",
      syllabus: ["16.70"],
      intro:
        "Which subscale setting to use and when to change it. The whole system " +
        "exists so that aircraft near the ground know their height above it, " +
        "and aircraft well above it stay separated from each other.",
      topics: [
        {
          title: "Vertical Reference Definitions",
          pages: [282, 283],
          intro:
            "Altitude, height, elevation and the datum each is measured from.",
        },
        {
          title: "Altimeter Settings Below the Transition Altitude",
          pages: [284, 285],
          intro:
            "What must be set below 13,000 feet, and what aerodrome QNH means.",
        },
        {
          title: "Area QNH Zones",
          pages: [286, 287],
          intro:
            "How the country is divided for QNH purposes, and how far up the " +
            "zones extend.",
        },
        {
          title: "Aerodrome QFE",
          pages: [288],
          intro:
            "The setting that makes the altimeter read height above the " +
            "aerodrome.",
        },
        {
          title: "Flight Levels and High Level Flight",
          pages: [289],
          intro:
            "What a flight level is, and the point above which altitudes become " +
            "levels.",
        },
        {
          title: "Transition Altitude, Level and Layer",
          pages: [290, 291, 292, 293],
          intro:
            "The three defined boundaries, when each setting changes, and why the " +
            "layer between them may not be cruised in.",
          context:
            "The layer exists because the changeover cannot happen at one height " +
            "for everybody. An aircraft climbing changes setting at the transition " +
            "altitude and one descending changes at the transition level, and the " +
            "gap between them is the buffer that keeps the two groups from ever " +
            "being at the same level on different settings. Cruising inside it " +
            "would put you in exactly the ambiguity the layer exists to prevent.",
        },
      ],
    },

    {
      title: "Minimum Heights and VFR Cruising Levels",
      syllabus: ["16.72", "16.32"],
      intro:
        "How low you may fly, the exceptions, and the level to choose when " +
        "cruising.",
      topics: [
        {
          title: "Minimum Safe Heights",
          pages: [294, 295],
          intro:
            "The heights below which an aircraft may not be flown, and what they " +
            "are measured against.",
        },
        {
          title: "Exceptions to the Minimum Height Rules",
          pages: [296, 297, 298],
          intro:
            "The operations during which the minimum heights do not apply, " +
            "including the additional provisions for commercial transport " +
            "operations.",
        },
        {
          title: "VFR Magnetic Track Altitude Requirements",
          pages: [299, 300, 301, 302, 303],
          intro:
            "The cruising level table, above and below the transition, and which " +
            "aircraft must comply with it.",
          keyPoints: [
            "The requirement applies to VFR flights in level cruising flight above 3,000 ft AMSL or 1,000 ft above the terrain.",
            "Northerly magnetic tracks — 270°M through north to 089°M — take one set of levels.",
            "Southerly magnetic tracks — 090°M through south to 269°M — take the other.",
            "Above FL150 the same split applies, expressed as flight levels.",
          ],
          misconception:
            "Choosing the level from the heading. It is the magnetic <em>track</em> " +
            "that decides, and on a windy day the two differ by the drift angle. " +
            "A track of 088°M flown on a heading of 095°M is still a northerly " +
            "track for the purposes of this table.",
        },
        {
          title: "ATC Instructions and the Cruising Level Table",
          pages: [304],
          intro:
            "When a controller's instruction overrides the table.",
        },
      ],
    },

    {
      title: "Flight Over Water",
      syllabus: ["16.26", "16.32"],
      intro:
        "The equipment required once the aircraft is far enough from shore " +
        "that a forced landing means a ditching, and how the requirement grows " +
        "with distance and with the kind of operation.",
      topics: [
        {
          title: "Communication and Navigation Equipment",
          pages: [307],
          intro:
            "What must be fitted beyond a stated flying time from shore.",
        },
        {
          title: "Safety Equipment Over Water",
          pages: [308, 309],
          intro:
            "Life jackets and the distances at which they become required, under " +
            "Part 91.",
        },
        {
          title: "Flight Over Water on Air Operations",
          pages: [310, 311],
          intro:
            "The additional requirements under Part 135, including life rafts and " +
            "when jackets must be worn.",
          context:
            "The two regimes differ in what they assume. Part 91 assumes you can " +
            "glide to shore and equips for the case where you cannot quite. Part " +
            "135 assumes you may be in the water for some time, which is why the " +
            "raft appears and why the jacket has to be worn rather than stowed.",
        },
      ],
    },

    {
      title: "Special Operations",
      syllabus: ["16.32"],
      intro:
        "Nine operations that each carry their own rating, permission or " +
        "restriction — the ones a commercial pilot is most likely to be asked " +
        "to fly and least likely to have been examined on before.",
      topics: [
        {
          title: "Parachute Drop Operations",
          pages: [312],
          intro:
            "The rating required and what the pilot must ensure.",
        },
        {
          title: "Towing Gliders and Other Objects",
          pages: [313, 314],
          intro:
            "The ratings and licence requirements for each kind of tow.",
        },
        {
          title: "Aviation Events",
          pages: [315],
          intro:
            "What counts as an aviation event, and the thresholds that decide " +
            "what approval is needed.",
        },
        {
          title: "Aerobatic Flight",
          pages: [316],
          intro:
            "Where aerobatic flight may not be conducted.",
        },
        {
          title: "Carriage and Discharge of Firearms",
          pages: [317, 318, 319],
          intro:
            "The rules on carrying firearms, the provision for Police, and the " +
            "prohibition on discharge. The deck sets these out as images of the " +
            "rule text, which are reproduced here as it published them.",
        },
        {
          title: "Dropping Objects",
          pages: [320],
          intro:
            "What the pilot must have done before anything is released from the " +
            "aircraft.",
        },
      ],
    },

    {
      title: "Carriage of Dangerous Goods",
      syllabus: ["16.36"],
      intro:
        "A long and specific chapter, and one that carries real consequences. " +
        "The structure is: what the classes are, who may offer goods, how they " +
        "must be packaged and documented, and what the operator and the pilot " +
        "must each be told.",
      topics: [
        {
          title: "Classes of Dangerous Goods",
          pages: [321],
          intro:
            "The classification system, and what falls into each class.",
        },
        {
          title: "Technical Instructions and UN Numbers",
          pages: [322, 323],
          intro:
            "The two references the rest of the chapter is written against.",
        },
        {
          title: "Requirements for Offering and Accepting",
          pages: [324, 325],
          intro:
            "The conditions that must all be met before dangerous goods may be " +
            "offered or accepted for carriage.",
        },
        {
          title: "Exceptions: Police and Recreational Goods",
          pages: [326, 327],
          intro:
            "The two circumstances in which otherwise forbidden goods may be " +
            "carried, and the conditions attached.",
        },
        {
          title: "Carriage by Passengers and Crew",
          pages: [328],
          intro:
            "What may not be carried in cabin baggage or on the person.",
        },
        {
          title: "Packaging, Labelling and Marking",
          pages: [329],
          intro:
            "Where the packaging conditions come from.",
        },
        {
          title: "Offering Goods for Carriage",
          pages: [330, 331],
          intro:
            "What must accompany non-dangerous goods, and what the offeror of " +
            "dangerous goods must ensure.",
          context:
            "The requirement for a signed statement on <em>non</em>-dangerous " +
            "goods is the one that surprises people. It exists because the whole " +
            "system depends on the shipper's declaration, so somebody has to be " +
            "accountable for the claim that a consignment is harmless.",
        },
        {
          title: "Handling by the Operator",
          pages: [332, 333, 334],
          intro:
            "What the operator must have before accepting a consignment, where " +
            "it may be carried, and how items must be separated and secured.",
        },
        {
          title: "Unloading, Damage and Leakage",
          pages: [335, 336],
          intro:
            "The inspection on unloading and what must be done if contamination " +
            "is found.",
        },
        {
          title: "Information to the Pilot and to Passengers",
          pages: [337, 338],
          intro:
            "What the pilot-in-command must be given, and what must be displayed " +
            "where cargo is accepted.",
          takeaway:
            "The pilot receiving a dedicated form is the safeguard that matters " +
            "to you personally. If there are dangerous goods aboard, you are " +
            "entitled to know what and where — and in an emergency that " +
            "information changes what the emergency services need to be told.",
        },
        {
          title: "Dangerous Goods Training",
          pages: [339],
          intro:
            "Who must be trained, and where the requirement is set.",
        },
      ],
    },

    {
      title: "Accidents and Incidents",
      syllabus: ["16.82"],
      intro:
        "What counts as each, who must be told, how quickly, and what must be " +
        "preserved afterwards.",
      topics: [
        {
          title: "What Counts as an Accident or an Incident",
          pages: [341, 342, 343, 344, 345],
          intro:
            "Accident, incident, aerodrome incident, airspace incident, details " +
            "and serious injury — the definitions that decide which obligations " +
            "apply.",
          misconception:
            "Deciding whether something was an accident by how serious it felt. " +
            "The definitions are specific — a defined injury threshold, defined " +
            "categories of occurrence — and the reporting obligation follows the " +
            "definition, not the impression.",
        },
        {
          title: "Notification of Accidents and Incidents",
          pages: [346, 347],
          intro:
            "Who must notify, to whom, and within what time.",
        },
        {
          title: "Access to Aircraft and Preservation of Records",
          pages: [348, 349],
          intro:
            "What may not be disturbed after an accident, and how long records " +
            "must be kept.",
          context:
            "The restriction on access is not about blame. An investigation " +
            "depends on the wreckage being where it came to rest, and moving " +
            "something to make the site tidy can destroy the evidence that would " +
            "have explained what happened.",
        },
      ],
    },

    {
      title: "Aerodrome Lighting",
      syllabus: ["16.78"],
      intro:
        "The lighting systems installed at aerodromes, what each is for, and " +
        "how a pilot activates them where no one is on duty.",
      topics: [
        {
          title: "Pilot Activated Lighting",
          pages: [351],
          intro:
            "How to turn the lights on from the aircraft, how long they stay on, " +
            "and how to change the intensity.",
          takeaway:
            "The duration is the part to remember in the air. The lights are on a " +
            "timer, and the moment to re-trigger them is before they go out on " +
            "short final — not after.",
        },
        {
          title: "Approach Light Systems",
          pages: [352, 353, 354],
          intro:
            "Three systems of differing intensity and configuration, and the kind " +
            "of approach each serves.",
        },
        {
          title: "Circling Guidance Lights and the Aerodrome Beacon",
          pages: [355, 356],
          intro:
            "Lighting that guides an aircraft around obstacles, and the beacon " +
            "that identifies the aerodrome itself.",
        },
      ],
    },

    {
      title: "Visual Slope Indicators and Runway Lighting",
      syllabus: ["16.78"],
      intro:
        "The lights that tell you whether you are on the correct approach " +
        "slope, and the lights that define the runway once you are on it.",
      topics: [
        {
          title: "Visual Landing Aids",
          pages: [357],
          intro:
            "The three approach slope indicators, their coverage, and the phase " +
            "of the approach they are used in.",
          misconception:
            "Using a slope indicator on base leg. The systems are designed for " +
            "final approach and have a limited vertical coverage; read on base " +
            "they can give an indication that is confidently wrong.",
        },
        {
          title: "PAPI, T-VASIS and VASIS",
          pages: [358, 359, 360],
          intro:
            "The three systems, where they are installed relative to the runway, " +
            "and how each indicates above, on and below slope.",
          // Slide 358's diagram of the light patterns was another site's
          // figure, signed with its author's copyright line, and was removed.
          // The slide's own words are a bare list of the labels that diagram
          // carried, so the patterns are stated here instead.
          term: "PAPI indications",
          definition:
            "PAPI shows four lights in a row, each of which reads white or red " +
            "depending on where you are relative to the slope. Four whites is " +
            "well above; three white and one red is slightly above; two white " +
            "and two red is on slope; one white and three red is slightly below; " +
            "four reds is well below.",
        },
        {
          title: "Runway Lead-in and Edge Lighting",
          pages: [361, 362],
          intro:
            "Lighting that leads to the aerodrome, and the lighting that marks " +
            "the usable runway.",
        },
        {
          title: "Threshold, End and Centreline Lighting",
          pages: [363, 364, 365, 366, 367],
          intro:
            "The colours that mark the beginning and end of the runway, and the " +
            "centreline coding that tells you how much is left.",
          context:
            "The centreline colour change is a distance-to-go code, and it is " +
            "worth internalising: the moment the lights stop being plain white you " +
            "are inside the last part of the runway, and by the time they are " +
            "solid red there is very little of it in front of you.",
        },
        {
          title: "Obstruction Beacons",
          pages: [368],
          intro:
            "What is lit, and how.",
        },
      ],
    },

    {
      title: "Part 135: Operating Requirements and Flight Planning",
      syllabus: ["16.42", "16.50", "16.54"],
      intro:
        "Part 135 is the rule set a commercial pilot will actually work under. " +
        "It restates much of Part 91 with the responsibility moved from the " +
        "pilot to the operator, and adds requirements Part 91 does not have.",
      topics: [
        {
          title: "Scope and Definitions",
          pages: [370, 371, 372],
          intro:
            "What Part 135 prescribes, and the defined terms — air operation and " +
            "consolidation — that the rest of it uses.",
        },
        {
          title: "Airworthiness Under Part 135",
          pages: [373],
          intro:
            "What the certificate holder must ensure about each aircraft it uses.",
        },
        {
          title: "Flight Operation and Flight Planning",
          pages: [375, 376, 377],
          intro:
            "The information that must be available, the pilot's briefing on a " +
            "plan they did not prepare, and the SARTIME requirement.",
          context:
            "The provision about a plan prepared by somebody else is the " +
            "distinctively commercial one. In a company operation the flight plan " +
            "may come from an operations desk — and the rule makes certain the " +
            "person who will fly it has been told what is in it.",
        },
        {
          title: "Emergency and Survival Equipment Information",
          pages: [378],
          intro:
            "What the operator must have ready to pass to a rescue coordination " +
            "centre.",
        },
        {
          title: "Fuel Policy, Cockpit Checks and Passenger Safety",
          pages: [379, 380, 381],
          intro:
            "Three operator obligations: establishing a fuel policy, providing a " +
            "checklist, and refusing carriage where necessary.",
        },
      ],
    },

    {
      title: "Part 135: Minimum Heights and Weather",
      syllabus: ["16.44"],
      intro:
        "Where a commercial operation may fly lower than Part 91 allows, and " +
        "the weather conditions it may begin in.",
      topics: [
        {
          title: "Minimum Heights for VFR Air Operations",
          pages: [382],
          intro:
            "The relief available where it is necessary for the proper " +
            "accomplishment of the operation.",
        },
        {
          title: "Meteorological Conditions for VFR Air Operations",
          pages: [384, 385],
          intro:
            "What must be indicated before a VFR flight is commenced, and the " +
            "condition on flight above cloud.",
        },
        {
          title: "Aerodrome Operating Minima",
          pages: [386, 387],
          intro:
            "The minima the operator must ensure are complied with, and the " +
            "circumstances permitting reduced take-off minima.",
        },
      ],
    },

    {
      title: "Part 135: Aeroplane Performance",
      syllabus: ["16.46", "16.58"],
      intro:
        "The performance the aeroplane must be able to demonstrate on paper " +
        "before it is loaded — take-off, landing, and the limit on how far " +
        "from an aerodrome a twin may be.",
      topics: [
        {
          title: "General Aeroplane Performance",
          pages: [389],
          intro:
            "The weight limits the operator must ensure are met at the start of " +
            "the take-off.",
        },
        {
          title: "Take-off Distance and Correction Factors",
          pages: [390, 391, 392],
          intro:
            "The take-off distance requirement, and the corrections applied for " +
            "runway surface and slope.",
          context:
            "The slope corrections are asymmetric on purpose, and the direction " +
            "of the asymmetry is conservative: the penalty for uphill is applied " +
            "in full while the credit for downhill is limited. Performance rules " +
            "are written so that the errors fall on the safe side.",
        },
        {
          title: "Landing Distance",
          pages: [393, 394],
          intro:
            "The landing weight requirement on a dry runway, and what changes " +
            "when the runway is wet or contaminated.",
        },
        {
          title: "The En Route 90-Minute Limitation",
          pages: [395],
          intro:
            "How far a twin-engine aeroplane may be from an aerodrome.",
        },
      ],
    },

    {
      title: "Part 135: Weight, Equipment and Seating",
      syllabus: ["16.42", "16.24"],
      intro:
        "How the weights that go into the loading calculation are established, " +
        "and the equipment a commercial aircraft must carry.",
      topics: [
        {
          title: "Weights of Goods, Passengers and Crew",
          pages: [397, 398, 399],
          intro:
            "The methods permitted for establishing each weight carried.",
        },
        {
          title: "Equipment Required for an Air Operation",
          pages: [401],
          intro:
            "What the aircraft must be equipped with before an air operation " +
            "begins.",
        },
        {
          title: "Seating, Restraints and Night Flight",
          pages: [402, 403],
          intro:
            "The restraint requirement, and the additional equipment for " +
            "operations at night.",
        },
        {
          title: "Responsibility for Airworthiness",
          pages: [404],
          intro:
            "Where responsibility for airworthiness sits under an air operator " +
            "certificate.",
          takeaway:
            "This is one of the clearest differences from Part 91. Under Part 91 " +
            "the responsibility rests with the operator of that flight; under an " +
            "air operator certificate it rests with the certificate holder for " +
            "every aircraft operated under it — including on days you are not " +
            "flying.",
        },
      ],
    },

    {
      title: "Part 135: Crew, Training and Records",
      syllabus: ["16.40", "16.14"],
      intro:
        "Who may be assigned to a flight, what training and checking is " +
        "required to keep them there, the fatigue scheme, and the records that " +
        "have to be kept.",
      topics: [
        {
          title: "Assignment of Flight Duties",
          pages: [406, 407],
          intro:
            "What the certificate holder must ensure about every person assigned " +
            "as flight crew.",
        },
        {
          title: "Pilot Consolidation Experience",
          pages: [408],
          intro:
            "The experience required before a pilot is designated as " +
            "pilot-in-command on an air operation.",
          context:
            "Consolidation was defined at the start of the Part 135 material for " +
            "this rule. Newly-acquired skills need practice before they are " +
            "reliable under pressure, and the requirement builds that period in " +
            "rather than leaving it to be found the hard way.",
        },
        {
          title: "Pilot Training and Competency Checks",
          pages: [410, 411],
          intro:
            "The training programme the operator must establish, and the checks " +
            "each pilot must pass.",
        },
        {
          title: "Fatigue of Flight Crew",
          pages: [413],
          intro:
            "The scheme the operator must have established before an operation " +
            "may be performed.",
        },
        {
          title: "Documents Carried and the Daily Flight Record",
          pages: [415, 416, 417],
          intro:
            "What must be on board each flight, and what the operator must record " +
            "for every aircraft.",
        },
      ],
    },

    {
      title: "GNSS Navigation Approval",
      syllabus: ["16.82"],
      intro:
        "What a GPS database and RAIM are in legal terms, and the distinction " +
        "between a system approved as sole means and one approved as primary " +
        "means.",
      topics: [
        {
          title: "The GPS Database and RAIM",
          pages: [420, 421],
          intro:
            "Two defined terms, and what each makes possible.",
        },
        {
          title: "Sole Means and Primary Means Navigation",
          pages: [422, 423],
          intro:
            "The two approval categories, and the requirements on a " +
            "pilot-in-command using GPS as a primary means within the New Zealand " +
            "FIR.",
          context:
            "The distinction is about what else must be available. A sole-means " +
            "system has to meet the requirement on its own; a primary-means " +
            "approval assumes something else is there as well — which is why the " +
            "obligations on the pilot differ between the two.",
        },
      ],
    },
  ],
};
