/**
 * General Aircraft Technical Knowledge — the curriculum.
 *
 * This deck reports zero section dividers, which is why the imported course
 * cut it into seventeen equal-ish blocks and named each after whichever slide
 * fell first in it — producing a chapter called "THE OIL SYSTEM" that held the
 * propeller material and one called "ENGINE TEMPERATURE" that held the
 * altimeter and the vacuum system.
 *
 * The structure was there all along. Fourteen slides carry the single word
 * "CPL" as their title: a full-bleed faded wordmark used as a section break.
 * They sit at 35, 56, 64, 94, 104, 117, 138, 151, 164, 204, 213, 235, 252 and
 * 288, and every one of them falls exactly where the subject changes — from
 * carburation to induction, from propellers to electricity, from the airframe
 * to hydraulics. Those are the chapter boundaries used here, with two large
 * spans subdivided further because forty slides of flight instruments is not
 * one chapter.
 *
 * The deck is also the worst affected by PDF extraction: 751 distinct images
 * from 308 slides, of which 401 are the mirrored reflection of a slide heading
 * and thirteen are faded section-background photographs. Those are rejected as
 * classes in diagram-decisions.mjs; what remains is the real diagrams.
 */

export const subject = {
  slug: "aircraft-technical-knowledge",
  title: "General Aircraft Technical Knowledge",
  deck: "cpl-gatk",

  skip: {
    1: "deck cover slide: no title, no body text, and a background image",
    35: "section break: a full-bleed faded \"CPL\" wordmark with no text of its own, marking the change from engine fundamentals to carburation",
    56: "section break: the \"CPL\" wordmark, marking the change to induction systems",
    64: "section break: the \"CPL\" wordmark, marking the change to fuel systems",
    94: "section break: the \"CPL\" wordmark, marking the change to the oil and cooling systems",
    104: "section break: the \"CPL\" wordmark, marking the change to propellers",
    117: "section break: the \"CPL\" wordmark, marking the change to electricity and magnetism",
    138: "section break: the \"CPL\" wordmark, marking the change to aircraft electrical systems",
    151: "section break: the \"CPL\" wordmark, marking the change to engine instruments",
    164: "section break: the \"CPL\" wordmark, marking the change to flight instruments",
    204: "section break: the \"CPL\" wordmark, marking the change to the magnetic compass",
    213: "section break: the \"CPL\" wordmark, marking the change to electronic flight instrument systems",
    235: "section break: the \"CPL\" wordmark, marking the change to the airframe",
    252: "section break: the \"CPL\" wordmark, marking the change to hydraulics and undercarriage",
    288: "section break: the \"CPL\" wordmark, marking the change to weight and balance",
  },

  chapters: [
    {
      title: "Piston Engines: Configuration and Operating Cycle",
      syllabus: ["26.10", "26.20", "26.90"],
      intro:
        "How a piston aero engine is arranged and what happens inside it during " +
        "one cycle. Everything later in the engine chapters — mixture, " +
        "ignition, cooling, detonation — is a consequence of this cycle.",
      topics: [
        {
          title: "Engine Configurations and Operating Principle",
          pages: [2, 3, 4],
          intro:
            "How cylinders are arranged, and the principle every one of these " +
            "layouts is working on.",
        },
        {
          title: "Main Components and Terminology",
          pages: [5, 6, 7, 8, 9],
          intro:
            "The parts of the engine and the terms used to describe their " +
            "motion, including firing order.",
        },
        {
          title: "The Four-Stroke Cycle",
          pages: [10],
          intro:
            "Induction, compression, power and exhaust.",
        },
        {
          title: "The Valves and Valve Timing",
          pages: [11, 12, 13],
          intro:
            "What the valves do, and why they open and close at points other than " +
            "the obvious ones.",
          context:
            "Valve timing is about the gas having mass and taking time to move. " +
            "The exhaust valve opens before the piston has finished the power " +
            "stroke and closes after it has started the next one, because the " +
            "moving column of exhaust keeps scavenging on its own — the overlap is " +
            "using inertia rather than wasting stroke.",
        },
        {
          title: "Ignition Timing",
          pages: [14],
          intro:
            "Why the spark occurs before the piston reaches the top, expressed in " +
            "degrees of crankshaft rotation.",
        },
        {
          title: "Compression Ratio and Abnormal Combustion",
          pages: [15, 16, 17, 18],
          intro:
            "What compression ratio buys, and the two ways combustion goes wrong " +
            "when it is pushed too far.",
          misconception:
            "Treating detonation and pre-ignition as the same fault. Detonation " +
            "is the mixture exploding rather than burning after the spark; " +
            "pre-ignition is something hot lighting the mixture before the spark " +
            "arrives. They feel similar and are caused differently, and " +
            "pre-ignition can destroy an engine considerably faster.",
        },
        {
          title: "Diesel Engines",
          pages: [19, 20, 21],
          intro:
            "The compression-ignition alternative, its operating principle, and " +
            "diesel knock.",
        },
        {
          title: "Turbine Engines and the Turboprop",
          pages: [22, 23, 24],
          intro:
            "The gas turbine, the turboprop, and how it compares with a piston " +
            "engine.",
        },
      ],
    },

    {
      title: "Engine Power, Torque and Efficiency",
      syllabus: ["26.28"],
      intro:
        "How the work an engine does is measured, and the three efficiencies " +
        "that decide how much of the fuel's energy reaches the propeller.",
      topics: [
        {
          title: "Force, Work, Power, Energy and Torque",
          pages: [25, 26, 27],
          intro:
            "The physical quantities, and the difference between torque and " +
            "power.",
          context:
            "Torque is turning effort; power is torque multiplied by how fast it " +
            "is being applied. An engine can produce good torque at low rpm and " +
            "little power, which is why the two figures peak at different engine " +
            "speeds and why the propeller cares about one and the airframe about " +
            "the other.",
        },
        {
          title: "Measuring Engine Power and Rated Power",
          pages: [28, 29],
          intro:
            "How power is measured, and what a rating means.",
        },
        {
          title: "Thermal, Mechanical and Volumetric Efficiency",
          pages: [30, 31, 32],
          intro:
            "Three separate losses between the fuel and the propeller shaft.",
          takeaway:
            "Each efficiency answers a different question: how much of the fuel's " +
            "heat became work, how much of that work survived friction, and how " +
            "well the cylinder filled in the first place. Supercharging attacks " +
            "the third one — which is why it is in this subject at all.",
        },
        {
          title: "Practical Considerations and Flying for Efficiency",
          pages: [33, 34],
          intro:
            "What the pilot can do about any of this in the aircraft.",
        },
      ],
    },

    {
      title: "Carburation and Mixture Control",
      syllabus: ["26.12", "26.14"],
      intro:
        "Getting the right quantity of fuel into the right quantity of air, at " +
        "every power setting and every altitude. The carburettor does it " +
        "mechanically, and every one of its sub-systems exists to patch a case " +
        "the basic design gets wrong.",
      topics: [
        {
          title: "Fuel and the Float Chamber",
          pages: [36, 37],
          intro:
            "How a constant fuel level is maintained for the jet to draw from.",
        },
        {
          title: "Atomisation, Diffusion and the Accelerating System",
          pages: [38, 39],
          intro:
            "Turning liquid fuel into a combustible mixture, and the pump that " +
            "covers a sudden throttle opening.",
        },
        {
          title: "Idling and Power Enrichment",
          pages: [40, 41],
          intro:
            "Two more sub-systems, each covering a condition the main jet handles " +
            "badly.",
        },
        {
          title: "Mixture Control Systems",
          pages: [42, 43, 44, 45, 46, 47, 48],
          intro:
            "Back-suction, needle and automatic mixture control — three ways of " +
            "leaning the same engine.",
          context:
            "Mixture control exists because the carburettor meters fuel by " +
            "<em>volume</em> of air and the engine needs it by <em>mass</em>. As " +
            "the aircraft climbs the air thins, the volume through the venturi is " +
            "unchanged and the mixture goes progressively richer on its own. " +
            "Leaning is correcting that, not economising.",
        },
        {
          title: "Fuel Injection",
          pages: [49],
          intro:
            "The alternative that avoids most of the carburettor's limitations.",
        },
        {
          title: "Using the Mixture Control",
          pages: [50, 51],
          intro:
            "How the mixture is leaned in practice, and leaning by reference to " +
            "the instruments.",
        },
        {
          title: "Carburettor Icing",
          pages: [52, 53, 54, 55],
          intro:
            "The temperature drop through the venturi and from fuel vaporising, " +
            "and the impact icing that can accompany it.",
          misconception:
            "Expecting carburettor ice only when it is cold outside. The venturi " +
            "and the vaporising fuel together can drop the temperature far below " +
            "ambient, so the worst conditions are warm and humid — a day on which " +
            "nobody is thinking about ice.",
        },
      ],
    },

    {
      title: "Induction, Supercharging and Turbocharging",
      syllabus: ["26.16", "26.46"],
      intro:
        "Getting more air into the cylinder than the atmosphere will push in by " +
        "itself, which is the only way to hold power as the aircraft climbs.",
      topics: [
        {
          title: "Induction Systems and the Air Intake",
          pages: [57, 58, 59],
          intro:
            "How air reaches the engine and the alternate intake.",
        },
        {
          title: "Supercharging and the Geared Supercharger",
          pages: [60, 61],
          intro:
            "Compressing the induction air, driven from the engine.",
        },
        {
          title: "The Turbocharger and Waste Gate",
          pages: [62, 63],
          intro:
            "Compressing it using exhaust energy instead, and the valve that " +
            "regulates how much.",
          takeaway:
            "The difference is where the driving power comes from. A supercharger " +
            "takes it from the crankshaft, so it always costs something; a " +
            "turbocharger takes it from exhaust gas that was leaving anyway. That " +
            "is why the turbocharger became the norm, and why the waste gate " +
            "exists to stop it over-boosting at low level.",
        },
      ],
    },

    {
      title: "Fuel Systems, Fuels and Fuel Handling",
      syllabus: ["26.18", "26.32", "26.34", "26.42", "26.44"],
      intro:
        "Getting fuel from the tank to the engine, what the fuel itself is, and " +
        "the handling that keeps it clean.",
      topics: [
        {
          title: "Fuel System Layout and Tank Components",
          pages: [65, 66, 67, 68, 69, 70, 71, 72, 73],
          intro:
            "The pump-feed system, and the components in and around the tanks.",
        },
        {
          title: "Primers, Priming and Fuel Selection",
          pages: [74, 75],
          intro:
            "Getting fuel into a cold engine, and selecting between tanks.",
        },
        {
          title: "Octane Ratings and Performance Numbers",
          pages: [76, 77, 78],
          intro:
            "What the numbers on the fuel mean, the colour coding, and what " +
            "happens if the wrong grade is used.",
          context:
            "The octane rating measures resistance to detonation, not energy " +
            "content. A higher grade does not give more power — it allows the " +
            "engine to run the compression and boost it was designed for without " +
            "detonating. Using a lower grade than specified is what causes damage.",
        },
        {
          title: "AVTUR and Fuel Contaminants",
          pages: [79, 80],
          intro:
            "Turbine fuel, and what can be in fuel that should not be.",
        },
        {
          title: "Drums, Checks, Refuelling and Dipping",
          pages: [81, 82, 83, 84],
          intro:
            "Handling fuel on the ground and confirming what is actually in the " +
            "tanks.",
          takeaway:
            "Dipping the tanks is the only method that measures fuel rather than " +
            "inferring it. Gauges fail, refuellers misunderstand, and the paperwork " +
            "records what was ordered — the dipstick records what is there.",
        },
      ],
    },

    {
      title: "The Ignition System",
      syllabus: ["26.22", "26.24", "26.26"],
      intro:
        "Producing a spark at the right cylinder at the right instant, twice " +
        "over, without depending on the aircraft's electrical system.",
      topics: [
        {
          title: "Magnetos and the Distributor",
          pages: [85, 86, 87, 88],
          intro:
            "Why there are two magnetos, what each one runs, and how the spark is " +
            "routed to the correct cylinder.",
          context:
            "A magneto generates its own current, so the ignition keeps working " +
            "with the master switch off and the battery flat. That independence is " +
            "the whole reason for the design — and it is why a magneto switch left " +
            "on makes a propeller live.",
        },
        {
          title: "Spark Plugs and the Impulse Coupling",
          pages: [89, 90],
          intro:
            "The plugs themselves, and the device that produces a usable spark at " +
            "cranking speed.",
        },
        {
          title: "The Starter Motor and Magneto Checks",
          pages: [91, 92],
          intro:
            "Starting the engine, and the check that confirms both ignition " +
            "systems are working.",
          takeaway:
            "The magneto check is looking for two things: a drop on each magneto, " +
            "which proves the other one was carrying the engine, and a difference " +
            "between them that is within limits. No drop at all is a fault too — " +
            "it usually means a magneto is not being switched off.",
        },
        {
          title: "Electronic Ignition",
          pages: [93],
          intro:
            "The modern alternative and what it changes.",
        },
      ],
    },

    {
      title: "Oil and Cooling Systems",
      syllabus: ["26.36", "26.66"],
      intro:
        "Two systems doing overlapping jobs: the oil lubricates and also " +
        "carries heat away, and the cooling airflow deals with the rest.",
      topics: [
        {
          title: "Properties of Oil and the Oil System",
          pages: [95, 96, 97, 98, 99],
          intro:
            "What the oil has to do, and the layout of a typical system.",
        },
        {
          title: "Oil System Malfunctions",
          pages: [100, 101],
          intro:
            "What the pressure and temperature indications mean when they are " +
            "wrong.",
          context:
            "Read the two gauges together. Falling pressure with rising " +
            "temperature is the serious combination, because it usually means the " +
            "oil is no longer circulating — and the engine will run for a while " +
            "after that before it stops permanently.",
        },
        {
          title: "The Cooling System and Cowl Flaps",
          pages: [102, 103],
          intro:
            "How the airflow is directed around the cylinders, and the control " +
            "the pilot has over it.",
        },
      ],
    },

    {
      title: "Propellers and Constant Speed Units",
      syllabus: ["26.76"],
      intro:
        "Turning engine power into thrust, and the mechanism that lets the " +
        "blade angle change so the engine can work at its best speed whatever " +
        "the aircraft is doing.",
      topics: [
        {
          title: "Fixed Pitch and Constant Speed Propellers",
          pages: [105, 106, 107],
          intro:
            "The two arrangements, and what the second one makes possible.",
        },
        {
          title: "The Constant Speed Unit",
          pages: [108],
          intro:
            "How the governor holds a selected rpm as conditions change.",
        },
        {
          title: "Forces on the Propeller and Pitch Change Mechanisms",
          pages: [109, 110, 111],
          intro:
            "The forces the blade carries in flight, and the mechanisms that move " +
            "it against them.",
        },
        {
          title: "Feathering and Reverse Thrust",
          pages: [112, 113],
          intro:
            "Two extremes of blade angle, and what each is for.",
        },
        {
          title: "Operation, Power Changes and CSU Failure",
          pages: [114, 115, 116],
          intro:
            "Handling a constant speed propeller, the order of power changes, and " +
            "what happens when the unit fails.",
          takeaway:
            "The order matters and is the wrong way round from intuition: " +
            "increasing power, propeller first then throttle; reducing, throttle " +
            "first then propeller. Doing it the other way puts high manifold " +
            "pressure onto low rpm, which is the condition detonation likes best.",
        },
      ],
    },

    {
      title: "Electricity and Magnetism",
      syllabus: ["26.2"],
      intro:
        "The physics behind the aircraft's electrical system and behind several " +
        "of its instruments. Short, and assumed by everything after it.",
      topics: [
        {
          title: "Current, Voltage and Resistance",
          pages: [118, 119, 120, 121],
          intro:
            "The three quantities and the relationship between them.",
        },
        {
          title: "Circuits and Types of Current",
          pages: [122, 123, 124],
          intro:
            "Simple circuits, and the difference between direct and alternating " +
            "current.",
        },
        {
          title: "Magnets, Fields and Electromagnetism",
          pages: [125, 126, 127],
          intro:
            "Magnetic fields, and the link between electricity and magnetism that " +
            "the rest of the system depends on.",
        },
        {
          title: "Relays and the Electromagnetic Switch",
          pages: [128, 129],
          intro:
            "Using a small current to switch a large one.",
        },
        {
          title: "Generation of Electricity",
          pages: [130, 131, 132, 133, 134],
          intro:
            "Electromagnetic induction, and the alternator and generator " +
            "principles that follow from it, including rectification.",
          context:
            "An alternator naturally produces alternating current and the " +
            "aircraft's system runs on direct current, so the output has to be " +
            "rectified. That extra step is why the alternator replaced the " +
            "generator anyway: it produces useful output at much lower engine " +
            "speeds, which matters on the ground and in the circuit.",
        },
        {
          title: "Voltage Control and Batteries",
          pages: [135, 136, 137],
          intro:
            "Regulating the output, and the battery as a store and a buffer.",
        },
      ],
    },

    {
      title: "Aircraft Electrical Systems",
      syllabus: ["26.30"],
      intro:
        "The physics of the previous chapter assembled into the system in the " +
        "aircraft, and what the pilot sees of it.",
      topics: [
        {
          title: "The Battery and Ground Power",
          pages: [139, 140, 141, 142],
          intro:
            "The battery in service, and starting from an external source.",
        },
        {
          title: "The Alternator and the Bus Bar",
          pages: [143, 144],
          intro:
            "The generating source in the aircraft, and how power is distributed " +
            "from it.",
        },
        {
          title: "Ammeters",
          pages: [145, 146, 147],
          intro:
            "The two arrangements — left-zero and centre-zero — and what each is " +
            "telling you.",
          misconception:
            "Reading every ammeter the same way. A left-zero ammeter shows total " +
            "current being produced; a centre-zero one shows whether the battery " +
            "is charging or discharging. The same indication means quite different " +
            "things on the two instruments.",
        },
        {
          title: "Fuses, Circuit Breakers and the Master Switch",
          pages: [148, 149],
          intro:
            "Protecting the circuits, and the switch that isolates the system.",
        },
        {
          title: "Alternator Failure",
          pages: [150],
          intro:
            "How it shows, and what it means for the rest of the flight.",
          takeaway:
            "Once the alternator has failed the battery is a countdown. Load " +
            "shedding is what buys the time, and it should be done immediately " +
            "rather than when the radios begin to sound weak.",
        },
      ],
    },

    {
      title: "Engine Instruments",
      syllabus: ["26.50"],
      intro:
        "The instruments that report on the engine: how each one senses its " +
        "quantity and what it can be trusted to tell you.",
      topics: [
        {
          title: "Tachometers",
          pages: [152, 153, 154],
          intro:
            "Mechanical, electrical and electronic ways of measuring engine " +
            "speed.",
        },
        {
          title: "Pressure Instruments",
          pages: [155, 156, 157, 158, 159],
          intro:
            "Oil and fuel pressure gauges, including remote-indicating and synchro " +
            "types.",
        },
        {
          title: "Temperature and Other Engine Indications",
          pages: [160, 161, 162, 163],
          intro:
            "The remaining engine instruments and what each measures.",
          context:
            "Cylinder head and exhaust gas temperature are the two that reward " +
            "understanding rather than glancing. They are how the mixture is set " +
            "precisely, and they are the earliest warning of the abnormal " +
            "combustion the engine chapters described.",
        },
      ],
    },

    {
      title: "Pressure Flight Instruments",
      syllabus: ["26.52"],
      intro:
        "The three instruments driven by air pressure. They share a plumbing " +
        "system, which is why one blockage can affect all three in ways worth " +
        "being able to predict.",
      topics: [
        {
          title: "The Pitot-Static System",
          pages: [165, 166, 167],
          intro:
            "The three basic pressure instruments and the sources that feed them.",
        },
        {
          title: "The Airspeed Indicator",
          pages: [168, 169, 170, 171, 172],
          intro:
            "How it works, its markings, and the errors it is subject to.",
        },
        {
          title: "The Altimeter",
          pages: [173, 174, 175, 176, 177, 178],
          intro:
            "Construction, the subscale, and the errors — including the ones " +
            "Air Law and Navigation both return to.",
        },
        {
          title: "The Vertical Speed Indicator",
          pages: [179, 180, 181, 182],
          intro:
            "How the lag is produced, and the errors that follow from it.",
          takeaway:
            "The VSI is the one pressure instrument with a deliberate delay built " +
            "into it — the calibrated leak is what makes it work at all. That is " +
            "why it lags a change and why it is a trend instrument rather than a " +
            "precise one.",
        },
        {
          title: "Blockages and System Failures",
          pages: [183, 184, 185, 186, 187, 188],
          intro:
            "What each instrument does when the pitot or the static line is " +
            "blocked, and the alternate static source.",
          context:
            "Work these out from first principles rather than memorising them. " +
            "Ask what the trapped pressure is and what the other side is doing: a " +
            "blocked pitot with a clear static makes the airspeed indicator behave " +
            "like an altimeter, which is exactly what the geometry predicts.",
        },
      ],
    },

    {
      title: "Gyroscopic Instruments and the Vacuum System",
      syllabus: ["26.56"],
      intro:
        "Three instruments built on a spinning mass, the two properties they " +
        "exploit, and the system that drives them.",
      topics: [
        {
          title: "Gyroscopic Principles",
          pages: [189, 190, 191],
          intro:
            "Rigidity in space and precession, and which instrument uses which.",
        },
        {
          title: "The Attitude Indicator and Heading Indicator",
          pages: [192, 193, 194, 195, 196],
          intro:
            "Two instruments using rigidity, their construction and their errors.",
        },
        {
          title: "The Turn Indicator",
          pages: [197, 198, 199],
          intro:
            "The instrument that uses precession, and what it is actually " +
            "measuring.",
        },
        {
          title: "The Vacuum System and Incorrect Suction",
          pages: [200, 201, 202, 203],
          intro:
            "How the gyros are driven, and what happens when the suction is " +
            "wrong.",
          takeaway:
            "A vacuum failure is dangerous because it is quiet. The gyros run down " +
            "slowly, so the attitude and heading indications drift away from the " +
            "truth over minutes rather than failing outright — which is why the " +
            "suction gauge is part of the cruise check and not an afterthought.",
        },
      ],
    },

    {
      title: "The Magnetic Compass",
      syllabus: ["26.54"],
      intro:
        "The one instrument that needs no power and no engine, and the errors " +
        "that are the price of that independence.",
      topics: [
        {
          title: "The Earth's Field and Compass Construction",
          pages: [205, 206, 207],
          intro:
            "What the compass is aligning with, and how it is built to do it.",
        },
        {
          title: "Compass Errors",
          pages: [208, 209, 210, 211, 212],
          intro:
            "Deviation, turning and acceleration errors, and how each arises.",
          context:
            "Turning and acceleration errors both come from the same cause: the " +
            "magnet is trying to point <em>down</em> as well as north, and the " +
            "pivot lets that dip pull the card about when the aircraft " +
            "accelerates or banks. That is also why the errors behave differently " +
            "in the two hemispheres.",
        },
      ],
    },

    {
      title: "EFIS, Autopilots and Flight Displays",
      syllabus: ["26.60", "26.62", "26.86", "26.64", "26.58"],
      intro:
        "The glass equivalent of the instruments in the last four chapters, the " +
        "sensors that feed it, and the systems that fly the aircraft from it.",
      topics: [
        {
          title: "EFIS: the Primary Flight and Multi-Function Displays",
          pages: [214, 215, 216],
          intro:
            "What each screen presents and how the information is arranged.",
        },
        {
          title: "System Inputs and the AHRS",
          pages: [217, 218, 219],
          intro:
            "The attitude and heading reference system, the magnetometer, and the " +
            "other sensors behind the display.",
          context:
            "An AHRS replaces spinning gyros with solid-state sensors, so there " +
            "is no run-down and no vacuum system. The failure modes change rather " +
            "than disappear: it depends on electrical power, and it needs the " +
            "magnetometer for a heading reference.",
        },
        {
          title: "Engine Data and Alerting",
          pages: [220, 221, 222, 223, 224],
          intro:
            "How engine information and warnings are presented on a glass " +
            "cockpit.",
        },
        {
          title: "Autopilot Systems",
          pages: [225, 226, 227, 228, 229, 230, 231, 232, 233, 234],
          intro:
            "What an autopilot is doing, the modes available, and how it is " +
            "monitored and disconnected.",
          takeaway:
            "An autopilot flies what it has been told, not what you intended. The " +
            "single most useful habit with one is to confirm the mode annunciation " +
            "after every input — the accidents come from the aircraft doing " +
            "exactly what it was asked.",
        },
      ],
    },

    {
      title: "The Airframe: Structures and Loads",
      syllabus: ["26.84", "26.74"],
      intro:
        "What the aircraft is made of and how it is put together, expressed as " +
        "the loads the structure has to carry.",
      topics: [
        {
          title: "Loads and Stresses",
          pages: [236, 237],
          intro:
            "The loads acting on an airframe and how the resulting stresses are " +
            "classified.",
        },
        {
          title: "Truss, Monocoque and Stressed Skin Construction",
          pages: [238, 239, 240],
          intro:
            "Three ways of building an airframe, and what carries the load in " +
            "each.",
          context:
            "The progression is about making the skin do structural work. In a " +
            "truss the frame carries everything and the covering is just a " +
            "surface; in stressed skin the covering is part of the structure — " +
            "which is why damage to the skin is a structural matter and not " +
            "cosmetic.",
        },
        {
          title: "Wing Construction",
          pages: [241, 242, 243, 244, 245],
          intro:
            "Spars, ribs and skin, and how the wing carries and transmits its " +
            "load.",
        },
        {
          title: "Fatigue, Corrosion and Control Systems",
          pages: [246, 247, 248, 249, 250, 251],
          intro:
            "What degrades a structure over time, and how the controls are run " +
            "through it.",
        },
      ],
    },

    {
      title: "Hydraulic and Pneumatic Systems",
      syllabus: ["26.4", "26.38", "26.40"],
      intro:
        "The systems that provide force where it is needed, and the components " +
        "common to both.",
      topics: [
        {
          title: "Hydraulic Principles",
          pages: [253, 254],
          intro:
            "How force is multiplied by the difference in cylinder area.",
          context:
            "The multiplication is not free: the small cylinder has to move much " +
            "further than the large one. That is the trade in every hydraulic " +
            "system — force is bought with distance, and the pump supplies the " +
            "difference.",
        },
        {
          title: "Hydraulic Fluid and System Components",
          pages: [255, 256, 257, 258, 259, 260],
          intro:
            "What the fluid has to do, and the pumps, filters, accumulator and " +
            "relief valve that make up a system.",
        },
        {
          title: "Temporary Pressure and Pressurised Systems",
          pages: [261, 262, 263],
          intro:
            "Three system architectures, and what distinguishes them.",
        },
        {
          title: "Pneumatic Systems",
          pages: [264, 265, 266, 267, 268],
          intro:
            "Compressed air instead of fluid, the types in use, and the moisture " +
            "problem that comes with it.",
          takeaway:
            "The weakness of a pneumatic system is water. Any moisture carried " +
            "into it can freeze at altitude and block a line, which is why the " +
            "system carries driers and why they are a maintenance item rather " +
            "than an optional extra.",
        },
      ],
    },

    {
      title: "Brakes, Undercarriage, Tyres and Wheels",
      syllabus: ["26.68", "26.70", "26.72"],
      intro:
        "Everything between the aircraft and the runway: how it is retracted, " +
        "how it is stopped, and what carries the load at the point of contact.",
      topics: [
        {
          title: "Brake Systems",
          pages: [269, 270, 271],
          intro:
            "Why brakes matter, the hydraulic disc brake, and the independent " +
            "brake system most light aircraft use.",
        },
        {
          title: "Boosted and Power Brakes",
          pages: [272, 273],
          intro:
            "What changes when the aircraft is too heavy for a pilot's leg to " +
            "supply the pressure.",
        },
        {
          title: "Anti-Skid Units",
          pages: [274],
          intro:
            "Holding the wheel on the verge of a skid, and why that is where the " +
            "braking is best.",
          takeaway:
            "Maximum braking is obtained just short of a locked wheel, not at it. " +
            "A skidding tyre both stops less well and destroys itself, which is " +
            "why the anti-skid unit is releasing pressure rather than applying " +
            "more.",
        },
      ],
    },

    {
      title: "Ice Protection, Fire Systems and Oxygen",
      syllabus: ["26.46", "26.42", "26.44", "26.88"],
      intro:
        "Four aircraft systems that share nothing except that each exists for " +
        "an abnormal condition — ice, rain, fire, and air too thin to breathe.",
      topics: [
        {
          title: "Ice Protection Systems",
          pages: [275, 276, 277, 278],
          intro:
            "Mechanical, fluid and thermal systems, and the distinction between " +
            "de-icing and anti-icing.",
          misconception:
            "Using de-icing and anti-icing as synonyms. A de-icing system removes " +
            "ice that has already formed and needs an accumulation to work " +
            "against; an anti-icing system prevents it forming at all and is " +
            "switched on before entering the conditions. Running a boot too early " +
            "can leave a shell of ice the boot then inflates inside.",
        },
        {
          title: "Electrical Heating and Rain Removal",
          pages: [279, 280, 281, 282],
          intro:
            "Electrically heated propellers and airframe surfaces, and the " +
            "windscreen systems.",
        },
        {
          title: "Discharge Wicks and Bonding Strips",
          pages: [283],
          intro:
            "How static electricity built up in flight is dissipated, and why it " +
            "matters.",
        },
        {
          title: "Fire Protection and Extinguishing Systems",
          pages: [284, 285, 286],
          intro:
            "Detection, the extinguishing agents used in aircraft, and the " +
            "systems that deliver them.",
          context:
            "The agents are chosen to work in a place nobody can reach in flight: " +
            "they smother rather than cool, and they have to do it in one " +
            "discharge. That is why the older single-shot systems mattered so " +
            "much — there was no second attempt.",
        },
        {
          title: "Oxygen Systems",
          pages: [287],
          intro:
            "When oxygen is required, and the systems that supply it.",
          keyPoints: [
            "Oxygen is legally required above 13,000 ft, or above 10,000 ft for more than 30 minutes.",
            "A constant flow system reduces cylinder pressure through a regulator and delivers a steady flow.",
          ],
          context:
            "The system types differ in how efficiently they use a finite supply. " +
            "A constant flow system delivers oxygen whether or not the user is " +
            "inhaling, so a good proportion is lost to the cabin; a demand system " +
            "supplies it only on the inward breath, which makes the same cylinder " +
            "last considerably longer. That difference is why endurance figures " +
            "differ so much between installations.",
          takeaway:
            "Air Law states when oxygen must be carried and used; this is the " +
            "equipment that does it. Both matter, and the practical link between " +
            "them is duration — knowing the requirement is no help if the " +
            "cylinder will not last the leg.",
        },
      ],
    },

    {
      title: "Weight and Balance",
      syllabus: ["26.92", "26.94", "26.96"],
      intro:
        "Two separate questions that are always asked together: is the aircraft " +
        "light enough, and is the load in the right place. An aircraft can " +
        "easily fail one while passing the other.",
      topics: [
        {
          title: "Weight Terminology and Aircraft Weights",
          pages: [289, 290, 291],
          intro:
            "The defined weights, and the limits each imposes.",
        },
        {
          title: "Aircraft Balance",
          pages: [292],
          intro:
            "Why the position of the load matters as much as its size.",
        },
        {
          title: "Stability Against Controllability",
          pages: [293],
          intro:
            "What moving the centre of gravity does to how the aircraft handles.",
          context:
            "This is the Principles of Flight stability chapter expressed as a " +
            "loading limit. Forward of the limit the aircraft is very stable and " +
            "the elevator may not have the authority to flare; aft of it the " +
            "aircraft is light on the controls and may not recover from a stall. " +
            "The envelope is where both are acceptable.",
        },
        {
          title: "Calculating the Centre of Gravity",
          pages: [294, 295, 296, 297, 298, 299, 300],
          intro:
            "Moments, arms and the datum, and working the centre of gravity for a " +
            "loaded aircraft.",
        },
        {
          title: "Moving and Adding Weight",
          pages: [301, 302, 303, 304, 305, 306, 307, 308],
          intro:
            "Working out where to put load, what happens when it is moved, and " +
            "the effect of fuel burn during the flight.",
          takeaway:
            "The centre of gravity moves in flight as fuel burns, so a loading " +
            "that is legal at take-off can be outside the envelope on arrival. " +
            "The check is against the whole flight, not against the moment the " +
            "doors close.",
        },
      ],
    },
  ],
};
