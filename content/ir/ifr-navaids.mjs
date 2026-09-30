/**
 * IFR Navaids — the curriculum.
 *
 * The manual is a well-ordered deck: it does move through instruments, then
 * radio, then aids, and its own section dividers are mostly sound. What it
 * does not do is group at the right size. Followed literally it produces
 * thirty-three chapters, several of them a single page long — "Tracking To an
 * NDB", one topic — and names taken from whatever the divider said.
 *
 * The chapters below gather that material into twelve learning areas, and the
 * topics inside them are concepts rather than slides. Every page is claimed
 * exactly once and the builder proves it.
 *
 * Everything in `intro`, `definition`, `keyPoints`, `context`, `misconception`
 * and `takeaway` is written for this course. It explains and connects; it does
 * not state a frequency, a tolerance, a limit or a procedure that the manual
 * does not.
 */

export const subject = {
  slug: "ifr-navaids",
  title: "IFR Navaids",
  deck: "ir-navaids",

  skip: {
    // The only thing on it that is said nowhere else in the manual is "Exam 90
    // minutes", which is exam administration rather than subject knowledge. It
    // is not reproduced anywhere in the course; if it should be shown to
    // students it belongs on the subject or product page, not inside a topic.
    1: "title slide: the subject name, a photograph, and the line \"Exam 90 minutes\"",
    395: "section divider the manual never filled: 'Human Factors Considerations' with nothing behind it",
  },

  chapters: [
    /* ================================================================= 1 == */
    {
      title: "Pressure Instruments",
      intro:
        "The airspeed indicator, the altimeter and the vertical speed indicator " +
        "all read the same two pressures. Understanding the plumbing first is " +
        "what makes their errors and their failures predictable rather than " +
        "something to memorise.",
      topics: [
        {
          title: "The Pitot-Static System",
          pages: [2, 3, 7, 8, 9],
          intro:
            "Three instruments, two pressures, one system. Everything in this " +
            "chapter depends on that system delivering clean air.",
          keyPoints: [
            "The three basic pressure instruments are the ASI, the altimeter and the VSI.",
            "They need a reliable source of pitot and static pressure to work at all.",
            "The same system may feed air data computers for an EFIS.",
          ],
          context:
            "This is why a single blocked port can take out more than one " +
            "instrument at once — they are not independent, they share a supply.",
        },
        {
          title: "Static, Dynamic and Total Pressure",
          pages: [4, 5, 6],
          intro:
            "Three quantities that the rest of the chapter is built on. The " +
            "relationship between them is the whole of pressure instrumentation " +
            "in one line.",
          definition:
            "Static pressure is the prevailing pressure at a point, caused by " +
            "the weight of the air above it. Dynamic pressure is the pressure " +
            "above static created by movement. Total pressure is the sum of the " +
            "two, and is what the pitot tube measures.",
          term: "Static, dynamic and total pressure",
          keyPoints: [
            "Static pressure decreases as altitude increases.",
            "Dynamic pressure = ½ρv², where ρ is air density and v is true airspeed.",
            "Total pressure = p + ½ρV².",
            "Total minus static leaves dynamic — which is how the ASI works.",
          ],
          takeaway:
            "Total = static + dynamic. Every pressure instrument is an " +
            "arrangement for isolating one of those three.",
        },
        {
          title: "Position Error",
          pages: [10],
          intro:
            "Even a perfect instrument reads wrongly if the pressure it is given " +
            "is not the pressure that exists.",
          keyPoints: [
            "Caused by the difficulty of sampling the actual static and dynamic pressures.",
            "Worst at large angles of attack, in slip or skid, when lowering flaps or undercarriage, and in turbulence.",
          ],
          context:
            "Notice what the list has in common: every item is a change to the " +
            "airflow around the airframe. The instrument has not changed — the " +
            "air arriving at the port has.",
        },
        {
          title: "The Airspeed Indicator",
          pages: [11, 12, 13],
          intro:
            "A differential pressure gauge with a speed scale printed on it, and " +
            "a set of coloured markings that encode the aeroplane's limits.",
          keyPoints: [
            "The ASI subtracts static from total pressure, leaving dynamic pressure, and displays that as a speed.",
            "The markings — VSO, VS1, VMCA, VFE, VNO, VNE, VYSE — put the aeroplane's speed limits on the instrument itself.",
          ],
        },
        {
          title: "IAS, CAS, EAS and TAS",
          pages: [14, 15, 16],
          intro:
            "Four airspeeds, three corrections between them, and a memory aid " +
            "that gets you through the sequence in the right order.",
          keyPoints: [
            "The ASI can only be calibrated for one set of conditions — ISA.",
            "As density falls away from ISA (high temperature, low pressure, high altitude), TAS increases beyond IAS.",
            "Where density is better than ISA, IAS could exceed TAS — less likely, but possible.",
            "IAS → CAS: pressure (position) and instrument error. CAS → EAS: compressibility error. EAS → TAS: density error.",
            "The manual's mnemonic for the sequence: 'ice tea perfect cold drink'.",
          ],
          misconception:
            "Thinking TAS is the 'real' speed the aeroplane flies at, so IAS is " +
            "an approximation to be corrected away. IAS is what the wings feel, " +
            "which is why every handling speed on the instrument is an indicated " +
            "one.",
          takeaway:
            "Climb at constant IAS and your TAS rises the whole way up. That is " +
            "the relationship working, not the instrument failing.",
        },
        {
          title: "ASI Blockages, Leaks and Serviceability Checks",
          pages: [17, 18, 19],
          intro:
            "What happens when the plumbing fails, and the checks that catch it " +
            "before it matters.",
          keyPoints: [
            "A blockage may be in the pitot tube or in the static line, and the two behave differently.",
            "Pre-flight: covers removed, intakes clear, pitot heater working, instrument undamaged, pointer at zero.",
            "In-flight: the pointer should come off its stop shortly after the start of the take-off roll, then indicate normally.",
          ],
          context:
            "The take-off roll check is the last cheap chance to find a blocked " +
            "pitot. After that the aeroplane is committed and the failure has to " +
            "be handled in the air.",
        },
        {
          title: "The Altimeter",
          pages: [20, 21, 22, 23],
          intro:
            "A calibrated aneroid: it measures static pressure and reports the " +
            "altitude that pressure corresponds to in the standard atmosphere.",
          keyPoints: [
            "Calibrated against the pressure lapse rate in ISA.",
            "In ISA conditions the discrepancy between indicated and true altitude is negligible.",
            "The subscale setting is what relates the reading to a chosen datum.",
          ],
        },
        {
          title: "Altimeter Errors",
          pages: [24, 25, 26],
          intro:
            "Five named errors. Two are instrument imperfections, one is a " +
            "response delay, and two are the atmosphere refusing to be standard.",
          keyPoints: [
            "Instrument error, position error and lag are properties of the equipment and its installation.",
            "Barometric error arises when the subscale setting does not match the actual pressure datum.",
            "Temperature error arises because the instrument has no temperature input at all.",
          ],
          misconception:
            "Expecting a correct QNH to fix everything. It fixes barometric " +
            "error and does nothing for temperature error — which is the one " +
            "that puts you below your indicated altitude on a cold day.",
        },
        {
          title: "Altimeter Blockages and Serviceability Checks",
          pages: [27, 28],
          intro:
            "Failure modes, the emergency static source, and the tolerances an " +
            "altimeter has to meet.",
          keyPoints: [
            "Complete blockage and a leak in the static line behave differently.",
            "An emergency static source exists for exactly this failure.",
            "Generally serviceable if it reads within +30 and −45 ft.",
            "Bench testing requires a tolerance of ±25 ft.",
          ],
        },
        {
          title: "The Vertical Speed Indicator",
          pages: [29, 30, 31, 32, 33, 34],
          intro:
            "The only pressure instrument that measures a rate rather than a " +
            "value — which is exactly why it lags.",
          definition:
            "The VSI measures the rate of change of static pressure and converts " +
            "it to a rate of change of altitude in feet per minute.",
          term: "Vertical Speed Indicator (VSI)",
          keyPoints: [
            "A flexible capsule is exposed to static pressure; a metering unit restricts the flow into and out of the case.",
            "Lag is the biggest error and is inherent in the design.",
            "The instantaneous VSI reduces lag with an accelerometer-actuated dashpot pump.",
            "A complete blockage renders it unserviceable; a leak simply samples static pressure from elsewhere.",
            "Pre-flight it should read zero, with ±200 ft tolerance between −20°C and +50°C, and ±300 ft outside those.",
          ],
          context:
            "The metering unit is the instrument. It is a deliberate restriction " +
            "— the delay you are taught to allow for is the mechanism working as " +
            "designed, not wear.",
        },
        {
          title: "Pitot Protection",
          pages: [35],
          intro:
            "Two devices, one for the ground and one for the air.",
          keyPoints: [
            "The pitot heater protects against icing in flight.",
            "The pitot cover protects against contamination on the ground.",
          ],
          context:
            "Both devices have a handling catch. The heater is an electrical " +
            "element with no airflow over it on the ground, so it reaches a " +
            "much higher temperature there than it ever does in flight: run it " +
            "for longer than the check needs and it can damage itself, and a " +
            "hand laid flat on a heated probe will burn. Check it the way the " +
            "flight manual for your type says to — commonly a brief selection " +
            "with the load confirmed on the ammeter, or a cautious back-of-the-" +
            "hand check near the probe rather than on it. In the air the " +
            "mistake runs the other way: the heater is selected on before " +
            "entering visible moisture at low temperature, not after the " +
            "airspeed indication has already started to misbehave, because by " +
            "then the ice is in the tube and clearing it takes time.",
          misconception:
            "A pitot cover left on is not a small oversight. It blocks the " +
            "tube completely, so the airspeed indicator reads nothing useful " +
            "on the take-off roll, and the check for it belongs to the " +
            "walk-around rather than to a scan of the panel — by the time the " +
            "panel would show it you are committed.",
        },
        {
          title: "The Machmeter",
          pages: [36, 37, 38],
          intro:
            "At high level the limiting speed stops being a number of knots and " +
            "becomes a fraction of the local speed of sound.",
          keyPoints: [
            "The speed of sound is proportional to the square root of absolute temperature: a = 38.94√T, with T in Kelvin.",
            "Mach number is the ratio of TAS to the local speed of sound: M = V/a.",
            "The Machmeter measures the ratio of dynamic to static pressure, so density error is negligible — it affects both sides.",
            "Compressibility error is calibrated for within the instrument.",
          ],
          context:
            "Because the speed of sound depends on temperature alone, the same " +
            "Mach number is a different TAS on a different day. That is why a " +
            "jet's limiting speed changes character as it climbs.",
        },
      ],
    },

    /* ================================================================= 2 == */
    {
      title: "Gyroscopic Instruments",
      intro:
        "Two properties of a spinning mass — rigidity and precession — are made " +
        "to do three different jobs: attitude, direction and rate of turn. Which " +
        "property an instrument uses tells you what will go wrong with it.",
      topics: [
        {
          title: "Rigidity, Precession and Gimbals",
          pages: [39, 40, 41, 42, 43, 44],
          diagramNotes: {
            40:
              "The gyroscopic instruments on a light aircraft panel: the " +
              "artificial horizon, the direction indicator and the turn " +
              "coordinator. The airspeed indicator and altimeter beside them are " +
              "the pressure instruments from the previous chapter.",
            41:
              "A gyro in its gimbals, with the three axes marked. The rotor " +
              "spins about one axis and the gimbals let the aircraft move about " +
              "the other two without disturbing it — which is rigidity being put " +
              "to work.",
            42:
              "Precession. A force applied at A does not move the rotor at A: " +
              "the response appears 90° further round, at B, in the direction of " +
              "rotation. Every gyro error and every gyro correction in this " +
              "chapter is that one effect.",
            43:
              "An electrically-driven unit, with the torque motors and levelling " +
              "switches that erect it. Compare this with the air jet on a " +
              "suction-driven instrument — the same job, done with electricity " +
              "instead of airflow.",
          },
          intro:
            "The two properties every gyroscopic instrument exploits, what each " +
            "depends on, and how the gyro is mounted so the aeroplane can move " +
            "around it.",
          keyPoints: [
            "Rigidity depends on the mass of the rotor, its rotational velocity, and the distance of the mass from the axis of rotation.",
            "The rate of precession depends on the strength and direction of the applied force, the rotor's moment of inertia, and its rotational velocity.",
            "Gimbals are pivoting cages that hold the rotor and let the aircraft move around it.",
            "Four classes of gyro: space, tied, earth and rate.",
          ],
          takeaway:
            "Rigidity is what an instrument uses to stay put; precession is what " +
            "makes it drift, and also what is used to correct it.",
        },
        {
          title: "Power Sources: Suction and Electrical",
          pages: [45, 46, 47, 48],
          intro:
            "How the rotor is kept spinning, and why modern aircraft have mostly " +
            "moved from one method to the other.",
          keyPoints: [
            "Pneumatic systems, generally on light aircraft: an engine-driven pump evacuates the case and replacement air is drawn through a nozzle at the rotor buckets.",
            "Electrical advantages: cleaner power, less wear, higher and more precise rpm, greater accuracy.",
            "Electrical gimbals can be designed for greater freedom of movement.",
            "Electric gyros are not affected by lower air density at altitude.",
            "Erection rates can be varied automatically, and malfunction warning flags fitted.",
          ],
          context:
            "The altitude point is the operational one. A suction-driven gyro " +
            "gets weaker exactly where an instrument flight spends its time.",
        },
        {
          title: "The Turn Indicator",
          pages: [49, 50, 51, 52, 53, 54, 55],
          intro:
            "A rate gyro with a spring: how hard the spring is stretched is how " +
            "fast you are turning.",
          keyPoints: [
            "Indicates rate of turn, marked for a rate one turn of 3° per second.",
            "The gyro is normally air-driven at about 4000 rpm.",
            "It uses a rate gyro with freedom in two planes.",
            "A damping unit reduces the fluctuation caused by turbulence.",
            "The gimbal ring reaches a stop at about 20° per second, so the pointer stays at the stop rather than toppling.",
            "Errors: incorrect suction changes rotor speed and so the indicated rate; yaw with positive g makes it over-read.",
          ],
        },
        {
          title: "The Turn Coordinator and the Coordination Ball",
          pages: [56, 57, 58, 59, 60],
          intro:
            "A turn indicator with its gyro tilted, which buys one extra piece of " +
            "information: rate of roll.",
          keyPoints: [
            "The Turn Coordinator shows rate of heading change and rate of roll; the Turn Indicator shows only the former.",
            "The gyro is tilted 30° to the longitudinal axis, so it precesses on rolling as well as yawing.",
            "The aircraft silhouette tilts toward the direction of roll or yaw.",
            "Checks: gyro rotation, correct indications of both instrument and ball while taxiing, and in flight, timing a rate one turn through 180°.",
          ],
        },
        {
          title: "The Direction Indicator",
          pages: [61, 62, 63],
          intro:
            "A steady reference for heading that does not suffer the compass's " +
            "errors — at the cost of not knowing where north is on its own.",
          keyPoints: [
            "Uses a tied gyro spinning in the vertical plane, in two gimbal rings.",
            "The aircraft turns around a steady gyro; rigidity supplies the reference.",
            "An air jet keeps it spinning and provides a directional force that re-erects it in the vertical plane.",
          ],
          misconception:
            "Treating the DI as a compass. It has no idea which way north is — " +
            "it holds whatever you set, which is why it must be aligned to the " +
            "compass and re-aligned as it drifts.",
        },
        {
          title: "DI Errors: Gimbal Error, Apparent and Real Drift",
          pages: [64, 65, 66, 67],
          intro:
            "Three ways a direction indicator stops telling the truth: geometry, " +
            "the earth turning underneath it, and friction.",
          keyPoints: [
            "Gimbal error: an unavoidable unwanted precession when the gimbal system cannot keep the three axes at mutual right angles, during combined pitch and roll.",
            "Apparent drift is caused by the earth's rotation — maximum at the poles at 15° per hour, zero at the equator, and around 11° per hour in New Zealand.",
            "Apparent drift is corrected by a drift nut, or latitude rider.",
            "Real drift comes from friction in the rotor bearings and gimbals; the maximum allowed is 4° per 15 minutes, beyond which the DI is unserviceable.",
            "Incorrect suction affects the drift nut's precession — low suction increases the rate and reduces rigidity.",
          ],
          context:
            "Apparent drift is not a fault: the gyro is holding still in space " +
            "while the earth turns beneath it. The latitude rider is a " +
            "deliberate, calibrated error introduced to cancel a real one.",
        },
        {
          title: "DI Limitations, Checks and Electric DIs",
          pages: [68, 69, 70],
          intro:
            "How far you can manoeuvre before it topples, and what an electrical " +
            "drive buys.",
          keyPoints: [
            "The two gimbal rings limit pitch and roll before toppling — commonly around 55° in each.",
            "About 3 to 4 minutes to spool up.",
            "Taxi check: heading should increase in a right turn and decrease in a left.",
            "In flight it should not precess more than 4° per 15 minutes.",
            "Electric DIs: higher rpm and improved rigidity, greater freedom in pitch and roll, less real drift, faster erection.",
          ],
        },
        {
          title: "The Artificial Horizon",
          pages: [71, 72, 73],
          intro:
            "An earth gyro held pointing at the centre of the earth, so that the " +
            "aeroplane can be displayed against it.",
          keyPoints: [
            "Uses an earth gyro controlled to maintain a true vertical spin axis.",
            "Achieved by the rotor's rigidity and gravity acting on the pendulous unit.",
          ],
        },
        {
          title: "AH Errors: Acceleration and Turning",
          pages: [74, 75, 76, 77, 78],
          intro:
            "Two errors with one shared cause: the mechanism that keeps the gyro " +
            "vertical cannot tell gravity from acceleration.",
          keyPoints: [
            "Both arise from pendulosity and from erection to a false vertical.",
            "Acceleration error occurs in straight-line acceleration — inertia acting on the low centre of gravity of the pendulous unit, and on the pendulous vanes.",
            "Turning error occurs in a turn, with centrifugal force playing the part inertia plays in acceleration error.",
          ],
          context:
            "This is why the artificial horizon is misleading precisely when it " +
            "is being asked to work hardest — a rolling, accelerating departure " +
            "into cloud is the exact condition that erects it wrongly.",
        },
        {
          title: "AH Limitations and Electric Artificial Horizons",
          pages: [79, 80],
          intro:
            "Toppling limits, suction requirements, and what changes when the " +
            "instrument is driven electrically.",
          keyPoints: [
            "Usual limits of 55° in pitch and 90° in roll; beyond those it topples.",
            "Requires about 4 inHg of suction; below the minimum it becomes sluggish.",
            "Around three minutes to spool up, with the horizon bar stabilised after about one.",
            "Electric AHs spin at 20,000–23,000 rpm and use a different erection system — steel balls in some, torque motor and levelling switch in most.",
          ],
        },
        {
          title: "Telling the Artificial Horizon from the Turn Coordinator",
          pages: [81],
          intro:
            "Two instruments showing a tilted aeroplane, meaning entirely " +
            "different things.",
          keyPoints: [
            "The TC does not indicate bank angle; the AH does.",
            "The TC aircraft image is horizontal when the heading is constant.",
            "A banked aircraft is not necessarily changing direction.",
          ],
          takeaway:
            "The AH answers 'what attitude am I in'. The TC answers 'am I " +
            "turning, and how fast'. Confusing them in cloud is how a spiral " +
            "starts.",
        },
      ],
    },

    /* ================================================================= 3 == */
    {
      title: "Compasses and Heading Reference",
      intro:
        "From a magnet in a bowl to a flux valve in a wingtip. The direct-reading " +
        "compass is the only heading source that knows where north is, and " +
        "almost every one of its errors comes from one fact: the earth's field " +
        "does not run horizontally.",
      topics: [
        {
          title: "Terrestrial Magnetism and Magnetic Dip",
          pages: [82, 83, 84, 85],
          intro:
            "The field the compass is trying to align with, and the reason that " +
            "alignment is not flat.",
          keyPoints: [
            "The earth behaves as a magnet with flux lines the compass aligns to.",
            "Near the equator the flux lines are almost parallel with the surface; toward the poles they angle into the earth.",
            "A freely suspended magnet takes up the local angle of dip as well as the horizontal direction.",
            "The field resolves into a horizontal component H and a vertical component Z.",
            "As dip increases toward the poles, H decreases until the compass is unusable.",
          ],
          takeaway:
            "H is the component that makes the compass work. Z is the component " +
            "that causes almost all of its errors.",
        },
        {
          title: "Variation",
          pages: [86],
          intro:
            "The compass points at magnetic north. Charts are drawn to true " +
            "north. The difference has to be applied, and in the right direction.",
          definition:
            "Variation is the difference between true and magnetic direction, " +
            "shown on charts as isogonals and quoted as east or west.",
          term: "Variation",
          keyPoints: [
            "Variation must be allowed for when planning.",
            "It is added to or taken from true direction to give magnetic.",
            "The memory aid: in the east, magnetic is least; in the west, magnetic is best.",
          ],
        },
        {
          title: "The Direct-Reading Compass",
          pages: [87, 88, 89],
          intro:
            "A magnet in a liquid-filled bowl, and every part of that description " +
            "is doing a job.",
          keyPoints: [
            "A magnet system suspended in a liquid-filled bowl — two needle-type magnets, or one annular.",
            "Pendulously suspended from a pivot point.",
            "The fluid provides damping, buoyancy and lubrication; expansion capsules take up volume changes.",
            "Deviation compensation is normally by two permanent magnets.",
            "The pendulous suspension is what compensates for dip.",
          ],
        },
        {
          title: "Compass Acceleration Error",
          pages: [90],
          intro:
            "The pivot and the centre of gravity are not in the same place, so " +
            "any acceleration turns the card.",
          keyPoints: [
            "Arises from the offset between pivot axis and centre of gravity, which sets up a couple.",
            "Greatest on headings of east or west, where the offset distance is largest.",
            "Nil on north and south, where CG and pivot axis are aligned.",
            "Accelerating, the magnet is pulled ahead through the pivot while inertia holds the CG back; decelerating, the reverse.",
            "Remembered by SAND.",
          ],
          context:
            "Small in practice, because aeroplane acceleration rates are low — " +
            "but it is the error that catches people on an easterly or westerly " +
            "take-off run.",
        },
        {
          title: "Compass Turning Error",
          pages: [91, 92, 93, 94],
          intro:
            "The vertical component of the earth's field, which is harmless in " +
            "level flight, gets a grip on the magnet the moment you bank.",
          keyPoints: [
            "Arises because of component Z, which has little effect while the magnet is flat.",
            "Banking lets Z act to rotate the magnet, introducing the error.",
            "Maximum on headings of north or south, reducing to nil on east or west.",
            "Made worse by the centripetal force and centrifugal reaction acting through the pivot and the CG respectively, adding to the rotation.",
          ],
          misconception:
            "Expecting acceleration and turning error to peak on the same " +
            "headings. They are opposites: acceleration error is worst east and " +
            "west, turning error is worst north and south.",
        },
        {
          title: "Parallax, Deviation and Serviceability Checks",
          pages: [95, 96, 97],
          intro:
            "Two more errors — one from where the compass is mounted, one from " +
            "the aeroplane itself — and what to check before flight.",
          definition:
            "Deviation is the difference between magnetic heading and compass " +
            "indication, caused by disruption to the compass's magnetic field " +
            "and calibrated for in a compass swing.",
          term: "Deviation",
          keyPoints: [
            "The compass is mounted high and away from electrical interference, so it is not viewed square on — that is parallax error.",
            "Checks: mountings, cracks and leaks, correct deviation card, correct headings.",
          ],
        },
        {
          title: "Remote Indicating Compasses",
          pages: [98, 99, 100],
          intro:
            "Move the sensing element away from the aeroplane's own magnetism, " +
            "and almost every compass error goes with it.",
          keyPoints: [
            "Detect the earth's field electromagnetically through a flux valve.",
            "Sited where the aircraft's own magnetism has least effect, giving accuracy in the order of ±0.5°.",
            "Function on the principle of electromagnetic induction, with data transmitted through synchros.",
            "An emf is induced whenever a conductor cuts lines of magnetic force, or those lines are made to move across it.",
          ],
        },
        {
          title: "Synchros, the Flux Valve and the Direction Gyro Unit",
          pages: [101, 102, 103, 104, 105],
          intro:
            "The three components that get a magnetic direction from a wingtip to " +
            "an instrument on the panel.",
          keyPoints: [
            "A simple a.c. synchro is a transmitter and a receiver, each with a fixed three-coil stator 120° apart and a single-coil rotor on a single-phase a.c. supply.",
            "The flux valve operates as a special kind of transmitter in that system.",
            "The slaving synchro is where the flux valve's signal is compared against the gyro's alignment.",
            "The DGU sits remotely, usually in the avionics compartment, electrically powered, its rotor axis held horizontal by mercury levelling switches and a torque motor.",
          ],
        },
        {
          title: "How the Remote Compass Works End to End",
          pages: [106, 107, 108, 109, 110],
          intro:
            "The whole loop in sequence: detect, compare, correct, display. Read " +
            "it as one chain rather than five parts.",
          keyPoints: [
            "The flux valve detects the magnetic meridian and sends different voltages to each slaving synchro coil.",
            "Those voltages create an alternating resultant field aligned with the meridian.",
            "If the DGU is correctly aligned, the slaving synchro rotor lies at right angles to that field and no error signal is generated.",
            "If it is not, an error signal is generated, amplified and rectified, and fed to a torque motor that precesses the gyro until the error nulls out.",
            "The slaving synchro rotor also drives the heading synchro, so the compass card follows the DGU's alignment.",
          ],
          takeaway:
            "It is a servo loop. The flux valve says where north is, the gyro " +
            "holds steady between corrections, and the error signal is what " +
            "keeps them agreeing.",
        },
        {
          title: "The RMI and the HSI",
          pages: [111, 112],
          intro:
            "The two cockpit instruments that display gyro-magnetic heading, and " +
            "what each adds to it.",
          keyPoints: [
            "The RMI and the HSI both receive gyro-magnetic heading information.",
            "Both present bearing information against a card that is always aligned with magnetic north.",
          ],
        },
        {
          title: "Remote Compass Errors and Deviation Compensation",
          pages: [113, 114],
          intro:
            "Why the remote compass is treated as error-free, and what became of " +
            "the deviation card.",
          keyPoints: [
            "In practice it can be considered error free.",
            "The DGU's slaving rate is deliberately slow, 1–2° per minute, so short-term errors are not registered.",
            "Deviation is corrected in the RMI itself, so these systems do not need a deviation card.",
          ],
          context:
            "The slow slaving rate is the design doing the work: it means a " +
            "turn, an acceleration or a burst of turbulence cannot drag the " +
            "heading — the gyro rides through and the flux valve only wins over " +
            "the long run.",
        },
      ],
    },

    /* ================================================================= 4 == */
    {
      title: "Air Temperature Measurement",
      intro:
        "Above about 150 knots the aeroplane heats the air it is measuring. " +
        "Everything about temperature sensing at speed follows from having to " +
        "undo that.",
      topics: [
        {
          title: "Static Air Temperature, Ram Rise and TAT",
          pages: [115, 116, 119],
          intro:
            "The temperature you want, the temperature you can measure, and the " +
            "correction between them.",
          definition:
            "Static air temperature is the ambient temperature prevailing at a " +
            "point. Total air temperature is what a probe measures at speed, " +
            "static air temperature plus the ram rise caused by friction.",
          term: "SAT, ram rise and TAT",
          keyPoints: [
            "Below about 150 kt, a simple probe measures SAT directly.",
            "Above that, friction raises the measured temperature — the ram rise.",
            "SAT = TAT − (V/100)².",
          ],
          context:
            "Every temperature-dependent figure downstream — TAS, density " +
            "altitude, Mach number — needs SAT. TAT is what the sensor gives you " +
            "and is not the number those calculations want.",
        },
        {
          title: "Temperature Gauges",
          pages: [117, 118, 120],
          intro:
            "The instruments themselves: direct reading, and the mechanical bulb " +
            "type.",
        },
      ],
    },

    /* ================================================================= 5 == */
    {
      title: "Radio Principles",
      intro:
        "Every aid in the rest of this subject is a radio wave with something " +
        "done to it. This chapter is the vocabulary: what a wave is, how " +
        "information is put on it, and how it gets from the station to the " +
        "aeroplane.",
      topics: [
        {
          title: "Electromagnetic Waves and Radio Terminology",
          pages: [121, 122, 123, 124],
          intro:
            "The words that the rest of the subject uses without explanation.",
          keyPoints: [
            "Radio waves are electromagnetic — oscillating electric and magnetic waves travelling close to the speed of light.",
            "That speed: about 186,000 statute miles, 162,000 nautical miles, or 300,000 kilometres per second.",
            "A cycle is one complete rotation through all values of magnitude and direction.",
            "Frequency is cycles per second, in Hertz; wavelength is the physical distance between identical points on consecutive cycles.",
            "Wavelength and frequency are reciprocals of one another.",
          ],
        },
        {
          title: "Amplitude, Phase and Phase Difference",
          pages: [125, 126, 127],
          intro:
            "Three properties that matter later — amplitude for signal strength, " +
            "and phase because it is how the VOR encodes direction.",
          keyPoints: [
            "Amplitude is the maximum displacement from the mean during a cycle — measured mean to peak, not peak to peak — and measures the strength of the oscillation.",
            "Phase is the stage reached in a cycle, plotted as a vector rotating anticlockwise.",
            "A phase difference arises when two transmissions start at different times.",
            "Two transmissions 180° out of phase cancel each other out.",
          ],
          context:
            "Phase is worth the effort here. The VOR determines your bearing " +
            "from nothing but the phase difference between two signals, so this " +
            "page is the foundation of that chapter.",
        },
        {
          title: "Polarisation and Attenuation",
          pages: [128, 129],
          intro:
            "Which way a wave oscillates, and how it weakens with distance.",
          keyPoints: [
            "Polarisation is the plane in which the electrical component oscillates, and depends on aerial orientation.",
            "A vertical aerial produces a vertically polarised signal, and vice versa.",
            "Attenuation is the reduction in signal strength as distance increases.",
            "The largest factor is the square law: trebling the distance gives nine times the attenuation.",
          ],
          context:
            "Polarisation explains why the ADF loop is oriented as it is — the " +
            "NDB signal is vertically polarised, and the loop has to be able to " +
            "null it.",
        },
        {
          title: "Modulation: AM, FM and Single Sideband",
          pages: [130, 131, 132, 133],
          intro:
            "A bare carrier wave carries no information. Modulation is how " +
            "information is put onto it, and the choice of method has costs.",
          keyPoints: [
            "The carrier wave is the basic signal at the radio frequency; the modulating wave is what is added to it.",
            "AM needs more power than FM, and an unmodulated signal travels further than a modulated one for a given transmitter power.",
            "AM is vulnerable to atmospheric interference and static.",
            "FM needs less power and suffers little static because its amplitude is constant, but needs a more complex receiver and extra frequencies.",
            "SSB reduces bandwidth at the cost of construction complexity and higher cost.",
          ],
        },
        {
          title: "Radio Equipment and Basic Wave Properties",
          pages: [134, 135],
          intro:
            "The parts of a radio, and five properties of waves that explain most " +
            "of the propagation chapter that follows.",
          keyPoints: [
            "An oscillator produces the carrier; amplifiers strengthen the signals; a modulator and demodulator add and remove modulation; aerials produce and receive.",
            "Waves travel at more or less constant speed, which can change passing from one surface to another.",
            "They are least affected by smooth surfaces.",
            "Crossing between surfaces they bend toward the more unfavourable area.",
            "They can be reflected by objects, and absent other influences they travel in straight lines.",
          ],
        },
        {
          title: "Surface Waves",
          pages: [136, 137, 138, 139, 140],
          intro:
            "How a wave follows the curve of the earth, and what that costs it.",
          keyPoints: [
            "Radio waves are categorised as surface (ground) waves, sky waves and direct waves.",
            "Surface waves follow the curvature by two mechanisms: diffraction and scattering, and wave tilting.",
            "Diffraction and scattering by solid obstacles increases as frequency lessens.",
            "Wave tilting: the earth's surface bends and slows the wave so it adheres to the surface, degrading until undetectable.",
            "Attenuation is influenced by the type of surface and the frequency used.",
            "VLF attenuates least but brings low-efficiency aerials, interference, high power demand and high installation costs.",
          ],
        },
        {
          title: "Sky Waves, Skip Distance and Super Refraction",
          pages: [141, 142, 143],
          intro:
            "Waves that leave the surface, bounce off the ionosphere and come " +
            "back — and the gap they leave behind.",
          keyPoints: [
            "Sky waves are reflected by the ionosphere.",
            "Effectiveness of that reflection depends on frequency, the critical angle, and transmission power.",
            "Skip distance and dead spaces are the consequence: a region the signal does not reach.",
            "Super refraction, or duct propagation, can occur under conditions such as inversions, with multiple hops between the surface, the inversion and the ionosphere.",
          ],
          context:
            "This is the physics behind night effect on the ADF: the sky wave " +
            "returns and interferes with the surface wave, and the needle cannot " +
            "tell them apart.",
        },
        {
          title: "Direct Waves and Line of Sight",
          pages: [144],
          intro:
            "At higher frequencies the wave neither hugs the surface nor bounces " +
            "— it goes in a straight line, and range becomes geometry.",
          keyPoints: [
            "Range is affected by transmitter power and by slight bending, around 20%.",
            "Range = 1.25√(TX height) + 1.25√(RX height).",
          ],
          takeaway:
            "Anything on VHF or above — VOR, ILS, DME — is limited by this, " +
            "which is why altitude buys range with those aids and does not with " +
            "an NDB.",
        },
        {
          title: "Static and Atmospheric Attenuation",
          pages: [145],
          intro:
            "Noise from the atmosphere and beyond it, and when the atmosphere " +
            "absorbs the signal outright.",
          keyPoints: [
            "Static comes from atmospheric conditions or interstellar phenomena, most commonly electrical discharge.",
            "It is stronger in summer, in the tropics, and at night.",
            "Absorption by atmospheric gases or solid particles affects only the SHF band.",
          ],
        },
        {
          title: "Frequency Bands and Their Characteristics",
          pages: [146, 147, 148],
          intro:
            "The table that ties the whole chapter together: which band does " +
            "what, and how far each reaches.",
          keyPoints: [
            "VLF 3–30 kHz, LF 30–300 kHz, MF 300–3000 kHz, HF 3–30 MHz, VHF 30–300 MHz, UHF 300–3000 MHz, SHF 3000–30,000 MHz.",
            "Surface wave range falls as frequency rises: thousands of miles at VLF, 1500–2000 nm at LF, 300–500 nm at MF, about 100 nm at HF.",
            "Sky wave usefulness peaks at HF — long range — and is absent at VHF and above.",
            "From VHF upward, direct waves only, and range is line of sight.",
          ],
          takeaway:
            "Read the table as one trend: as frequency rises, range falls and " +
            "precision improves. Every aid in this subject sits somewhere on " +
            "that trade.",
        },
      ],
    },

    /* ================================================================= 6 == */
    {
      title: "Radar and the Transponder",
      intro:
        "Radar is the echo principle applied four different ways — surveillance, " +
        "secondary surveillance, distance measurement and weather detection. The " +
        "first two are how ATC sees you.",
      topics: [
        {
          title: "Radar Principles",
          pages: [149, 150],
          intro:
            "One idea — send a pulse, listen for the return — and the family of " +
            "applications built on it.",
          keyPoints: [
            "RADAR: radio detection and ranging.",
            "Primary radar produces a short pulse of radio energy and listens for a return.",
            "Applications include doppler, radar altimeters, DME and weather radar.",
          ],
        },
        {
          title: "Primary Surveillance Radar",
          pages: [151, 152, 153, 154, 155],
          intro:
            "A rotating antenna, a stopwatch and some trigonometry: how a return " +
            "becomes a range and a bearing.",
          keyPoints: [
            "PSR operates in UHF and SHF; shorter wavelengths give freedom from noise and ionospheric scatter, shorter pulses and narrower beams, and better reflections from small objects.",
            "Return strength depends on transmitter power, range, the object's shape and material, and its size relative to the wavelength.",
            "Range: distance = speed × time, then halved, because the pulse travels out and back.",
            "Bearing: the antenna rotates at 2–10 rpm, referenced to north, so the angle at which an echo returns gives the bearing.",
            "A narrow beam is what lets the radar distinguish two targets.",
          ],
        },
        {
          title: "PSR Range and Its Disadvantages",
          pages: [156, 157],
          intro:
            "What limits a primary radar, and the three weaknesses that led to " +
            "secondary radar.",
          keyPoints: [
            "Range is affected by transmitter power, elevation of the radar head, and aircraft height.",
            "Also by target characteristics — shape, size, surface, aspect — pulse recurrence frequency, pulse width, and precipitation and cloud returns.",
            "Disadvantages: clutter, variation in size and intensity of returns, and blind spots or shadows.",
          ],
        },
        {
          title: "Secondary Surveillance Radar",
          pages: [158, 159],
          intro:
            "Rather than listening for a faint reflection, ask the aeroplane to " +
            "answer.",
          keyPoints: [
            "SSR overcomes PSR's problems with a conspicuous, high-energy return pulse from a transponder.",
            "It is really two radars — one on the ground and one in the aircraft.",
            "Six SSR installations in New Zealand, on elevated sites to improve low-level coverage, with a maximum range of 256 nm.",
            "PSR and SSR returns are combined and processed by an ATC computer.",
          ],
        },
        {
          title: "The Transponder",
          pages: [160, 161, 162, 163, 164, 165, 166],
          intro:
            "The airborne half of secondary radar: what it listens on, what it " +
            "replies with, and the words ATC will use to operate it.",
          keyPoints: [
            "Receives on 1030 MHz, responding to an interrogation of two pulses 8 microseconds apart.",
            "Replies on 1090 MHz with a train of between 2 and 14 pulses taking 20.3 microseconds — the squawk.",
            "Mode A gives range, bearing and identification code; Mode C adds altitude.",
            "The reply monitor light flashes when replying, and glows steadily in TEST or when squawking IDENT.",
            "IDENT makes the aircraft symbol flash on the radar screen for positive identification.",
            "'Squawk' simply means transmit: squawk a code, squawk and ident, squawk ident, verify level, squawk standby.",
            "Separate codes exist for unlawful interference, radio failure and emergency.",
          ],
          context:
            "The three emergency codes are worth knowing cold rather than " +
            "looking up. Two of them cover situations in which you may not be " +
            "able to talk, and the third covers one in which you may not want " +
            "to. IR Air Law gives the codes themselves.",
        },
        {
          title: "SSR Advantages and Mode S",
          pages: [167, 168],
          intro:
            "What secondary radar bought, what it cost, and where it is going.",
          keyPoints: [
            "Advantages over PSR: longer range, no clutter or unwanted echoes, few blind spots and shadows, smaller radar head and less power, plus squawk and level information.",
            "The biggest disadvantage: the aircraft must carry a transponder.",
            "Mode S allows additional information to be sent to and from an aircraft, and is a component of ICAO's FANS programme.",
          ],
          context:
            "Two surveillance techniques have grown out of the transponder and " +
            "are worth understanding because they behave quite differently " +
            "when something goes wrong. Automatic dependent surveillance — " +
            "broadcast (ADS-B) is the aeroplane telling everyone where it " +
            "thinks it is: the transponder takes position from the aircraft's " +
            "own GNSS receiver, adds pressure altitude and identity, and " +
            "broadcasts the lot at intervals without being interrogated. " +
            "Ground stations and suitably equipped aircraft simply listen. " +
            "Multilateration works the other way: several ground receivers " +
            "time the arrival of the same transponder reply, and the " +
            "differences in arrival time fix the position on the ground rather " +
            "than in the aeroplane.",
          misconception:
            "\"Dependent\" in ADS-B is the word that matters. The position " +
            "broadcast is only as good as the aircraft's own navigation " +
            "source, and nothing on the ground verifies it independently, so a " +
            "bad GNSS position is broadcast as confidently as a good one. " +
            "Multilateration does not have that weakness, because it measures " +
            "the aircraft from outside — but it needs several receiving " +
            "stations with overlapping coverage to do it.",
        },
        {
          title: "Airborne Weather Radar",
          pages: [169, 170, 171, 172, 173],
          intro:
            "Radar pointed forward, tuned to see the water that matters and " +
            "ignore the water that does not.",
          keyPoints: [
            "Developed primarily to detect cumulonimbus cells, flight through which risks damage from turbulence, icing and hail.",
            "Consists of antenna, receiver/transmitter, control panel and display unit.",
            "Operates in the X-band, around 9 GHz and 4 cm.",
            "That wavelength detects larger precipitation without returning from dust, drizzle or cloud droplets.",
          ],
          misconception:
            "Reading a clear screen as clear air. The radar shows reflectivity " +
            "from larger precipitation — a cell that is not yet raining, or is " +
            "shielded behind one that is, does not paint.",
        },
      ],
    },

    /* ================================================================= 7 == */
    {
      title: "The NDB and the ADF",
      intro:
        "The simplest aid in the syllabus, and the one whose airborne equipment " +
        "does the most work. The ground station just radiates; everything " +
        "clever happens in the aeroplane.",
      topics: [
        {
          title: "The Non-Directional Beacon",
          pages: [174, 175, 176, 177, 178],
          intro:
            "A radio station that broadcasts equally in every direction, and the " +
            "three things that decide how far it reaches.",
          keyPoints: [
            "Radiates an identical vertically-polarised signal in all directions.",
            "Usually between 200 and 400 kHz — the upper LF and lower MF bands — with some up to 1750 kHz.",
            "Maximum operating range from as little as 30 nm to over 400 nm.",
            "Range depends on transmitter power (most beacons 100–500 watts), frequency (lower gives greater range), and time of day (reduced at night by night effect).",
            "Name, frequency, location and morse ident are shown on enroute and approach charts.",
          ],
          context:
            "It is simple, cheap and easy to maintain, which is why it was once " +
            "the most numerous aid in the world — and why its limitations are " +
            "tolerated rather than fixed.",
        },
        {
          title: "ADF Equipment and the Loop Antenna",
          pages: [179, 180, 181, 182],
          intro:
            "Direction finding starts with a loop that can be turned until it " +
            "hears nothing. The silence is the measurement.",
          keyPoints: [
            "Airborne components: receiver, loop antenna, sense aerial, control panel, and an RBI or RMI.",
            "Older systems rotated the loop until a null was found; modern systems use a fixed loop.",
            "The loop induces a very small voltage from the vertically-polarised NDB signal.",
            "With the incoming signal at right angles to the loop there is no induced voltage — both legs experience the same phase.",
            "There are two null positions, which is an ambiguity that has to be resolved.",
          ],
          takeaway:
            "The loop finds direction by finding the null, not the maximum. A " +
            "null is sharp; a maximum is broad, and a broad answer is a vague " +
            "bearing.",
        },
        {
          title: "Resolving the Ambiguity: the Sense Aerial",
          pages: [183, 184],
          intro:
            "Two nulls, 180° apart, and no way to tell which is the beacon. " +
            "Adding a second aerial collapses the figure-of-eight into a shape " +
            "with only one null.",
          keyPoints: [
            "The sense aerial is a single omni-directional aerial with a circular polar diagram, adjusted electromagnetically for magnitude and polarity.",
            "Adding the two aerials' fields produces a cardioid polar diagram.",
            "A cardioid has only one null position.",
            "The loop is rotated to that null and its position relayed by a synchro to the cockpit instrument.",
          ],
        },
        {
          title: "The Fixed Loop",
          pages: [185],
          intro:
            "Modern systems have no moving loop. Two loops at right angles and " +
            "some electronics do the same job.",
          keyPoints: [
            "Two loops at 90° to each other.",
            "Their output feeds the stator coils of a receiving resolver, setting up a field parallel to the received signal.",
            "It is the resolver, not the loop, that is moved to the null.",
          ],
        },
        {
          title: "Tuning and Identifying an NDB",
          pages: [186, 187, 188, 189],
          intro:
            "Three checks every time, and one class of station that must never " +
            "be used.",
          keyPoints: [
            "Every time an NDB is tuned: correct frequency, identified by morse, and a sensible bearing on the needle.",
            "MF broadcast stations must not be used for navigation — hard to identify, the transmitter may not be where you think, and they are not calibrated to air navigation standard.",
            "Mode selector: OFF; ADF or COMP for navigation; ANT for the sense aerial only, giving no navigation information; TEST, where the needle should deflect and return; BFO for unmodulated carriers; VOL for volume.",
          ],
          misconception:
            "Skipping the ident because the frequency is right. The frequency " +
            "being right is not evidence the station is the one you want, or " +
            "that it is serviceable.",
        },
        {
          title: "ADF Displays: RBI, Rotatable Card and RMI",
          pages: [190, 191, 192, 193],
          intro:
            "Three presentations, in increasing order of how much arithmetic they " +
            "do for you.",
          keyPoints: [
            "The fixed card ADF, the relative bearing indicator.",
            "The manually rotatable card — the notes' own phrase is 'poor man's RMI'.",
            "The Radio Magnetic Indicator, whose card is slaved to magnetic north.",
          ],
        },
        {
          title: "Instrument Interpretation",
          pages: [194, 195, 196, 197],
          intro:
            "Reading the needle: what a given indication says about where you " +
            "are relative to the beacon.",
        },
        {
          title: "Tracking From an NDB and Intercepting a Track",
          pages: [198, 199, 200],
          intro:
            "Outbound tracking, and joining a track you are not on.",
        },
        {
          title: "Tracking To an NDB",
          pages: [201, 202],
          intro:
            "Inbound tracking — the same problem as outbound, with the needle at " +
            "the other end. The manual teaches this one entirely in the diagram, " +
            "so read it a row at a time.",
          diagramNotes: {
            202:
              "Three positions on the same inbound track, read bottom to top. In " +
              "each row the HSI on the left and the RBI on the right show the " +
              "same aircraft: the HSI needle stays on the track while the RBI " +
              "needle sits off the nose by the drift being carried. Row A is " +
              "established with drift applied; the upper rows show the picture " +
              "as the aircraft closes on the beacon.",
          },
        },
        {
          title: "Using the RMI",
          pages: [203, 204, 205, 206],
          intro:
            "With the card slaved to magnetic north, the arithmetic disappears " +
            "and the picture becomes literal.",
          context:
            "This is the payoff for the earlier work. Everything you computed on " +
            "the fixed card is displayed directly, which frees attention for " +
            "flying the aeroplane.",
        },
        {
          title: "Station Passage",
          pages: [207],
          intro:
            "What the needle does overhead, and why the passage is a region " +
            "rather than an instant.",
          diagramNotes: {
            207:
              "Signal volume plotted against position as the aircraft crosses " +
              "the beacon. It rises to a peak either side and collapses directly " +
              "overhead — the shaded cone is the volume in which the bearing is " +
              "unusable, which is why station passage is a period of confusion " +
              "rather than a moment.",
          },
        },
        {
          title: "ADF Errors and Limitations",
          pages: [208, 209, 210, 211, 212, 213, 214],
          intro:
            "Five ways the signal can mislead you. Each has a cause in the radio " +
            "propagation chapter, and each has a practical answer.",
          keyPoints: [
            "Night effect: reflected sky waves interfering with surface waves. The usual skip distance is 70–80 miles, and at or beyond that the NDB is unreliable at night.",
            "Coastal refraction: signals crossing a coastline obliquely bend, and the beacon always appears closer to the coast than it is. Crossing at right angles, they do not bend.",
            "Mountain effect: terrain mixes signals like night effect; a higher frequency reduces it — the example given is Taumarunui at 1630 kHz — and flying higher helps.",
            "Precipitation static: charged precipitation interferes; a closer or more powerful NDB may help, or find the null manually with the loop.",
            "Thunderstorm effect: a special case of precipitation static, with storms radiating significant radio energy.",
          ],
          takeaway:
            "Close, high, and crossing the coast squarely is an ADF bearing you " +
            "can act on. Distant, low, at night, over mountains is one to " +
            "cross-check.",
        },
      ],
    },

    /* ================================================================= 8 == */
    {
      title: "The VOR",
      intro:
        "The workhorse of conventional IFR navigation. It gives a magnetic " +
        "bearing directly, and it does so using nothing but the phase difference " +
        "between two signals.",
      topics: [
        {
          title: "What the VOR Is and What It Is For",
          pages: [215, 216, 217, 218, 219],
          intro:
            "Where it sits in the spectrum, what it improves on, and the four " +
            "jobs it does.",
          keyPoints: [
            "VHF Omni-directional radio Range, transmitting between 112.00 and 117.95 MHz.",
            "Advantages over the NDB: much less susceptible to electrical and atmospheric interference including thunderstorms, and no night effect, because VHF is not reflected by the ionosphere.",
            "Used for orientation and position fixing, tracking to and from, holding, and instrument approaches.",
          ],
          context:
            "'No night effect' is the practical headline. It is the difference " +
            "between an aid you cross-check after dark and one you can simply " +
            "use.",
        },
        {
          title: "Principles: Reference and Variable Phase",
          pages: [220, 221, 222, 223],
          intro:
            "Two signals from one station. One is the same everywhere; the other " +
            "sweeps around. Where you are decides how far apart they arrive.",
          keyPoints: [
            "The reference phase signal is omni-directional, frequency modulated at 30 Hz on a sub-carrier, the same strength in all directions.",
            "The variable phase signal is directional and rotated horizontally and uniformly at 1800 rpm.",
            "At magnetic north the two are in phase.",
            "East is 90° of phase difference, south 180°, west 270°.",
          ],
          takeaway:
            "The phase difference is the radial. That is the whole principle, " +
            "and everything the cockpit instrument does is a way of showing it.",
        },
        {
          title: "The CDI, the OBS and TO/FROM",
          pages: [224, 225, 226, 227, 228, 229, 230, 231],
          diagramNotes: {
            224:
              "Why the bar alone is ambiguous. On the left the signals are in " +
              "phase, or 180° out, and the bar centres. On the right they are " +
              "neither, and the bar is displaced — but 'here or there' is the " +
              "point: the same displacement occurs on both sides of the aid.",
            225:
              "A VOR radiates a radial in every direction. 030 radial means 030 " +
              "outward from the station, which is the convention the whole aid " +
              "is built on — a radial is always measured away from it.",
            226:
              "The instrument, labelled. The OBS at the bottom right rotates " +
              "the course card; the TO/FROM flag resolves which hemisphere you " +
              "are in; the CDI is the vertical bar, read against the dots of " +
              "the deviation scale.",
            227:
              "The same aircraft position shown twice. Left: on the 000 and 180 " +
              "radials the signals are in phase and 180° out of phase " +
              "respectively. Right: off those radials, the phase relationship " +
              "and so the bar displacement change with position.",
            228:
              "The two hemispheres. Both aircraft are on the 000/180 line and " +
              "both have a centred bar — the flag reading FROM above the station " +
              "and TO below it is the only thing distinguishing them.",
            229:
              "Ten aircraft, all with the OBS set to 360, arranged around the " +
              "station. Read each little instrument face against the aircraft's " +
              "position: the flag flips as you cross the east-west line, and the " +
              "bar deflects toward the selected radial.",
            230:
              "The same exercise on the 040/220 radials, which is the version " +
              "worth working through — with the selected radial no longer " +
              "north-south, the relationship between heading, position and " +
              "indication has to be reasoned rather than recognised.",
            231:
              "The summary. One aircraft position, three equivalent ways of " +
              "describing it: the instrument indication, the radial as a line " +
              "from the station, and the TO/FROM hemispheres either side of it.",
          },
          intro:
            "Three controls and indications that together turn a phase " +
            "difference into a picture of where you are relative to a chosen " +
            "radial.",
          keyPoints: [
            "The CDI bar centres when the signals are in phase, or 180° out of phase.",
            "The OBS — sometimes called a phase shifter — internally shifts the reference phase by the number of degrees it is turned.",
            "Think of the OBS as rotating the VOR to align with your aircraft.",
            "Because the bar centres in two conditions, there is an ambiguity, and the TO/FROM indicator resolves it by showing which side of the aid you are on.",
            "The instrument effectively divides the world into two hemispheres.",
          ],
          misconception:
            "Reading TO and FROM as a description of which way you are flying. " +
            "They describe which hemisphere you are in relative to the selected " +
            "radial — you can be tracking away from the station with TO showing.",
        },
        {
          title: "Orientation with the CDI",
          pages: [232, 233, 234, 235, 239],
          intro:
            "Two steps to find out where you are, and how much deviation the " +
            "instrument can actually show you.",
          keyPoints: [
            "Turn the OBS until the CDI centres, then note whether TO or FROM is shown.",
            "The deviation scale is 2° per dot when tuned to a VOR.",
            "Up to 10° of deviation can be indicated.",
          ],
          context:
            "The 2°-per-dot figure matters more than it looks. Full-scale " +
            "deflection means at least 10° off — at range, that is a long way, " +
            "and the instrument cannot tell you how much further.",
        },
        {
          title: "Station Passage and Maintaining a Radial",
          pages: [236, 237, 238],
          intro:
            "Going overhead, and holding a radial in wind once you are " +
            "established.",
        },
        {
          title: "Intercepting a Radial",
          pages: [240, 241, 242, 243, 244],
          intro:
            "Joining a radial you are not on, outbound and inbound.",
        },
        {
          title: "The VOR on the RMI",
          pages: [245, 246, 247, 248, 249, 250, 251, 252],
          intro:
            "On an RMI the VOR needle behaves exactly like the ADF needle, which " +
            "means one technique covers both aids.",
          keyPoints: [
            "Inbound intercept: picture the aircraft on the tail of the needle heading to the 12 o'clock position; imagine a needle with its tail on the desired radial; fly a heading that drags the current needle's tail to the new position.",
            "The same procedure works outbound, using an imaginary needle for the required outbound track.",
            "Tracking to or from a VOR on an RMI is basically the same as with an NDB.",
            "If the needle moves away from the required radial, the drift correction is wrong and the heading must be adjusted to drag it back.",
          ],
        },
        {
          title: "The VOR on the HSI",
          pages: [253, 254, 255],
          intro:
            "The HSI combines the compass card and the CDI into one picture, " +
            "which removes the last piece of mental rotation.",
        },
        {
          title: "VOR Range and Identification",
          pages: [256, 257, 258],
          intro:
            "How far it reaches, and confirming you are receiving the station you " +
            "selected.",
          keyPoints: [
            "VHF, so range is approximately line of sight: 1.25 × TX height + 1.25 × RX height.",
            "Enroute charts show the MRA for some routes.",
            "Each VOR has a morse code identifier and a two-letter identifier.",
          ],
        },
        {
          title: "VOR Errors and Aggregate Accuracy",
          pages: [259, 260, 261, 262, 263, 264, 265],
          intro:
            "Five error sources, each small, and the combined figure that decides " +
            "what the aid may be used for.",
          keyPoints: [
            "Ground station error: usually less than ±2°.",
            "Site effect: any obstruction, even grass; less than ±3°. Sites are routinely cleared and signals calibrated.",
            "Terrain effect: ground reflections cause needle oscillation — rapid is scalloping, slow is radial bending — up to ±2°. Affected stations are noted in AIP Vol. 2.",
            "Airborne equipment error: usually less than ±2°, with equipment checked periodically to stay certified.",
            "Vertical polarisation error: rare; reflected signals become vertically polarised and are picked up when banked, causing large fluctuations that settle when the wings level.",
            "Aggregate error rarely exceeds ±5°, acceptable for IFR flight and non-precision approaches.",
          ],
          takeaway:
            "More accurate than an NDB, and still not a precision aid. ±5° is " +
            "the number that decides which approaches it may serve.",
        },
        {
          title: "A VOR Instrument Approach",
          pages: [266, 267, 268, 269],
          intro:
            "The whole aid put to work: joining overhead, and flying the " +
            "procedure.",
        },
        {
          title: "The DME Arc Approach",
          pages: [270, 271, 272],
          intro:
            "Flying a constant distance from a station rather than a constant " +
            "bearing to it.",
        },
        {
          title: "Speed Restrictions",
          pages: [273],
          intro:
            "Where the speed limits that apply to these procedures are published.",
        },
      ],
    },

    /* ================================================================= 9 == */
    {
      title: "Distance Measuring Equipment",
      intro:
        "The aid that answers 'how far'. Combined with a VOR bearing it gives a " +
        "position from a single station, which is why the two are so often " +
        "co-located.",
      topics: [
        {
          title: "How DME Works",
          pages: [274, 275, 276],
          intro:
            "Secondary radar with the roles reversed: the aeroplane asks and the " +
            "ground answers.",
          definition:
            "DME is a secondary radar system in the UHF band, between 960 and " +
            "1215 MHz, providing accurate and continuous slant range.",
          term: "Distance Measuring Equipment (DME)",
          keyPoints: [
            "Basically an SSR system in reverse — the aircraft interrogates the station.",
            "What is measured is slant range, the straight-line distance to the station.",
          ],
          misconception:
            "Treating DME as distance over the ground. Overhead a station at " +
            "altitude the reading is your height above it, not zero.",
        },
        {
          title: "DME Controls, Ident and Failure Warning",
          pages: [277, 278, 279],
          intro:
            "Confirming the station and recognising the loss of it.",
          keyPoints: [
            "Tuned through a co-located VOR, two idents with the same code are heard.",
            "The DME identifier is higher pitched, transmitted once for every two or three VOR idents.",
            "On losing the signal the equipment unlocks and searches, showing a readout scrolling between 0 and 200.",
            "An OFF flag appears, or a bar crosses a digital readout.",
          ],
        },
        {
          title: "DME Range, Accuracy and Saturation",
          pages: [280, 281, 282, 283],
          intro:
            "How far, how precise, and the single circumstance in which the " +
            "station stops answering you.",
          keyPoints: [
            "Designed maximum range 200 nm; operationally, line of sight, with the usual VHF/UHF factors.",
            "Reduced coverage is noted in AIP Volumes 2 and 3.",
            "Specified accuracy ±0.5 nm or ±3%; in practice ±0.2 nm or ±0.25%, worst case ±0.5 nm.",
            "A transponder serves at most 100 aircraft; when saturated the furthest are dropped first. Saturation is unlikely in New Zealand.",
          ],
        },
        {
          title: "VORTAC",
          pages: [284],
          intro:
            "A military and a civil aid on one site — and, in New Zealand, a " +
            "piece of history.",
          keyPoints: [
            "DME was developed from the military TACAN.",
            "At Whenuapai and Ohakea a VOR was combined with a TACAN, called a VORTAC.",
            "Tuned, a civil aircraft received bearing from the VOR and distance from the TACAN.",
            "These have been decommissioned; there are none in New Zealand.",
          ],
        },
      ],
    },

    /* ================================================================ 10 == */
    {
      title: "The Instrument Landing System",
      intro:
        "The only precision approach aid in this subject: it guides you in " +
        "azimuth and in the vertical, and that second guidance is what earns it " +
        "a decision altitude rather than a minimum descent altitude.",
      topics: [
        {
          title: "What an ILS Is",
          pages: [285, 286, 287, 288, 289],
          intro:
            "Four ground components and the airborne equipment that reads them.",
          definition:
            "The ILS is a precision approach aid, one which provides both " +
            "glideslope and tracking guidance.",
          term: "Instrument Landing System (ILS)",
          keyPoints: [
            "Four main ground components: a localiser, a glideslope, marker beacons and approach lights.",
            "There may also be associated NDBs and DME.",
          ],
        },
        {
          title: "The Localiser",
          pages: [290, 291, 292, 293],
          diagramNotes: {
            291: [
              "The two lobes seen from above. The 150 Hz lobe is the blue " +
              "sector and the 90 Hz lobe the yellow; where they overlap the " +
              "signal strengths are equal, and that line of equal strength is " +
              "the approach path.",
              "A localiser antenna array at the far end of a runway — the row " +
              "of elements is what produces the two overlapping lobes in the " +
              "diagram above.",
            ],
            292:
              "Coverage. The usable sector is 35° either side out to 17 nm and " +
              "10° either side out to 25 nm above 2000 ft. Outside 2.5° the " +
              "needle is fully deflected — 'pegged' — and stops telling you how " +
              "far off you are.",
            293:
              "The back beam: the same pattern radiated in the take-off " +
              "direction beyond the antenna. Note that the sense is reversed on " +
              "it, and that its use is not permitted in New Zealand.",
          },
          intro:
            "Azimuth guidance from two overlapping lobes, told apart by the rate " +
            "at which each is modulated.",
          keyPoints: [
            "Provides directional guidance along the extended approach centreline.",
            "The antenna may be up to 60 ft wide and 10 ft high, at the far end of the runway.",
            "Transmits on VHF between 108.10 and 111.95 MHz.",
            "Two overlapping lobes: left modulated at 90 Hz, right at 150 Hz, calibrated for equal strength on the centreline.",
            "A back beam may be transmitted in the take-off direction, but its use is not permitted in New Zealand.",
          ],
          context:
            "Equal signal strength is the centreline. The receiver is not " +
            "measuring an angle — it is comparing two depths of modulation and " +
            "reporting which one is winning.",
        },
        {
          title: "Localiser Indications and Tracking",
          pages: [294, 295, 296, 297],
          intro:
            "Reading the bar, and holding the centreline inbound and outbound.",
        },
        {
          title: "The Glideslope",
          pages: [298, 299, 300, 301, 302, 303, 304, 305],
          diagramNotes: {
            299:
              "The 3° slope as heights against distance: about 1500 ft at 5 nm " +
              "and 2100 ft at 7 nm above threshold elevation. These are the " +
              "numbers behind the 300 ft per nautical mile check.",
            301:
              "A glideslope antenna mast beside the runway, sited about 1000 ft " +
              "in from the landing threshold.",
            302:
              "The whole system in one drawing: the localiser giving horizontal " +
              "guidance along the centreline, the glideslope transmitter to one " +
              "side giving vertical guidance, and the outer and middle markers " +
              "as the two distance checkpoints along the beam.",
            303:
              "The glideslope lobes in side view, on the same principle as the " +
              "localiser: 90 Hz above and 150 Hz below, with the slope itself " +
              "the line of equal signal strength between them.",
            304:
              "False glideslopes. The lobe pattern repeats above the true slope, " +
              "so an aircraft intercepting from above can capture a signal at " +
              "roughly twice the angle. Intercepting from below, along the " +
              "optimum path, is what avoids it.",
            305:
              "What the needle is telling you. Three dots high means the slope " +
              "is below you and the instruction is fly down; three dots low " +
              "means fly up. The needle points at the slope, not at the " +
              "correction.",
          },
          intro:
            "Vertical guidance on the same principle, tilted up by about three " +
            "degrees.",
          keyPoints: [
            "The appropriate path for a large aircraft is about 3° — a gradient of 1 in 20, or 5% — intersecting the runway about 1000 ft in from the approach threshold.",
            "A 3° slope gives a descent of about 320 ft per nautical mile.",
            "The transmitting antenna is about 1000 ft in from the landing threshold, in the UHF band, again modulated at 90 and 150 Hz.",
            "The slope is usually about 3° but may vary between 2.5° and 3.5°.",
            "Threshold crossing height is the height of the glideslope receiver aerial crossing the threshold exactly on slope, specified on the approach chart with the glideslope angle.",
          ],
          context:
            "The TCH is quoted for the receiving aerial, not the wheels. On a " +
            "large aeroplane the parts below that aerial cross the threshold " +
            "lower than the number suggests, which is exactly why the notes " +
            "flags it.",
        },
        {
          title: "Marker Beacons and Locators",
          pages: [306, 307, 308, 309, 310, 311],
          intro:
            "Fixed points along the approach, identified by ear and by a coloured " +
            "light.",
          keyPoints: [
            "Marker beacons transmit a highly focused vertical pattern and can only be received directly overhead.",
            "A typical ILS has two, positioned along the localiser beam as distance-to-run checkpoints.",
            "Outer marker: continuous low-pitched dashes at two per second, and a flashing blue or purple light.",
            "Middle marker: alternating high-pitched dots and dashes transmitted continuously, and a flashing amber light.",
            "A locator beacon was a low-powered NDB aligned with the extended centreline, typical coverage 20 nm, used to guide aircraft to the descent point; tracking to it normally allows glideslope capture.",
          ],
        },
        {
          title: "The HSI and an ILS Approach",
          pages: [312, 313, 314, 315, 316],
          intro:
            "The instrument that makes an ILS readable at a glance, and a whole " +
            "approach flown on it.",
        },
        {
          title: "Rate of Descent and Advisory Altitudes",
          pages: [317, 318],
          intro:
            "Turning a glidepath angle into a rate you can fly, and the altitudes " +
            "printed on the profile as a cross-check.",
          keyPoints: [
            "For a 3° path: correct TAS for the wind component, then multiply groundspeed by 5 to get feet per minute.",
            "Advisory altitudes at each DME distance from the FAP to DA are primarily for a localiser-only approach, where glidepath information may be unavailable.",
            "On a normal ILS they serve as a check of the glidepath information.",
          ],
          example:
            "Groundspeed 120 kt × 5 = 600 ft/min. (From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
        },
        {
          title: "Decision Altitude, Threshold Elevation and TCH",
          pages: [319, 320, 321],
          intro:
            "Three heights that are easy to confuse and are measured from three " +
            "different places.",
          keyPoints: [
            "DA is the decision altitude in AMSL at which visual reference must be achieved; DH is the same point expressed above threshold elevation.",
            "If still in IMC at that point, a missed approach must be carried out.",
            "For a localiser-only approach the missed approach point is the middle marker or DME overhead.",
            "Threshold elevation is given at the top left of the approach chart, and can differ from aerodrome elevation and from the other end of the same runway.",
            "TCH is the height of the glidepath above the threshold.",
          ],
          misconception:
            "Assuming threshold elevation equals aerodrome elevation. On a " +
            "sloping runway the two ends differ from each other as well as from " +
            "the aerodrome figure.",
        },
        {
          title: "ILS Formulae",
          pages: [322],
          intro:
            "Four relationships worth carrying, for descent rate, height checks " +
            "and how far off you actually are.",
          keyPoints: [
            "Required rate of descent: groundspeed in knots × 5 = feet per minute.",
            "Check altitude on a 3° slope: distance to touchdown in nm × 300 + threshold elevation.",
            "Deviation from centreline: distance from transmitter in nm × dots × 50 ft.",
            "Deviation from glideslope, full-scale: nm from touchdown × 70 ft; half-scale: nm from touchdown × 35 ft.",
          ],
          context:
            "The deviation formulae are the useful ones and the least used. They " +
            "convert a needle displacement into feet — which is the unit in " +
            "which obstacle clearance is actually measured.",
        },
      ],
    },

    /* ================================================================ 11 == */
    {
      title: "Visual Landing Aids",
      intro:
        "Everything the instrument approach hands you over to. Lighting is a " +
        "language: colour, position, intensity and flash pattern each carry " +
        "meaning, and the whole chapter is learning to read it.",
      topics: [
        {
          title: "Approach Light Systems",
          pages: [323, 324, 325, 326, 327, 328, 329],
          intro:
            "The lead-in from the approach to the runway, in three grades " +
            "depending on what the runway is certified for.",
          keyPoints: [
            "An ALS extends from the approach end, with extended centreline lighting and crossbars at specified intervals.",
            "From around 1200 m for international aerodromes with a precision approach, down to 420 m for a simple ALS.",
            "LIH ALS: Calvert high intensity unidirectional white, on precision approach runways at international aerodromes, combined with low intensity red — Auckland and Christchurch.",
            "LIL ALS/2 bar: a single row of omni-directional red lights on the extended centreline with two crossbars, normally for a precision approach runway — Dunedin.",
            "LIL ALS/1 bar: a single row of omni-directional red lights 420 m from the threshold, with a single crossbar possible at 300 m, for non-precision runways — Gisborne.",
          ],
        },
        {
          title: "Circling Guidance and Runway Lead-in Lighting",
          pages: [330, 331],
          intro:
            "Two systems for when the approach does not deliver you straight at " +
            "the runway.",
          keyPoints: [
            "Circling guidance lights, normally fixed amber, provide positive tracking from terrain where a visual circling approach follows the instrument approach — Dunedin.",
            "A runway lead-in lighting system is provided where the instrument approach is not aligned with the runway — Whangarei.",
          ],
        },
        {
          title: "Visual Approach Slope Indicators",
          pages: [332, 333, 334, 335],
          diagramNotes: {
            333:
              "T-VASIS as seen from the approach. The wing bars stay visible " +
              "throughout; it is the extra lights above or below them that " +
              "appear when you are off slope, and the number showing is a " +
              "measure of how far off.",
            334:
              "The two-bar VASI logic in a single figure: below the glidepath " +
              "both bars read red, on the glidepath the near bar is red and the " +
              "far bar white, above it both are white.",
            335:
              "PAPI, with the tolerance for each indication. Two white and two " +
              "red is on slope at 3°; three or four red is progressively low; " +
              "three or four white is progressively high. The lower row repeats " +
              "the same three states as a pilot would see them.",
          },
          intro:
            "Three systems answering one question — am I on the slope — in three " +
            "different visual languages.",
          keyPoints: [
            "At night or in poor visibility the natural horizon may not be visible, making the approach slope hard to judge.",
            "T-VASIS: two horizontal wing-bars of four lights either side of the runway by the aiming point, with three additional lights in front and three behind, guiding a 3° slope. AT-VASIS has one side only.",
            "RAE red-white VASIS: eight units as two wing bars of four either side. Above slope all white; on slope upwind red and downwind white; below slope all red. A-VASIS is an abbreviated one-sided version with three lights per bar.",
            "PAPI is the most common in New Zealand, also for a 3° slope: on slope (3° ±10′) the two outer lights are white and the two inner red. APAPI has two lights.",
          ],
          takeaway:
            "For PAPI the shorthand is the number of red lights. Two red and two " +
            "white is on slope; more red is lower.",
        },
        {
          title: "VASIS Calibration, Availability and Errors",
          pages: [336, 337, 338, 339, 340, 341],
          intro:
            "How far the guidance reaches, how accurate it is, when it will be " +
            "on, and what can make it lie.",
          keyPoints: [
            "T-VASIS, VASIS and PAPI have up to 6° of vertical coverage; in azimuth, 5° either side of centreline by day and 7.5° by night. Designated range 4 nm.",
            "PAPI on-slope indications have a tolerance of ±10 minutes, about ±3 ft at the threshold.",
            "TCH for each installed system is in the aerodrome plates, generally around 50 ft with a tolerance of ±5 ft.",
            "As a rule, available for aircraft below 5700 kg MCTOW on a precision approach, and at other times on request.",
            "Refraction of light causes errors — haze, smoke, dust, rain, mist or light fog can cause colour changes, distortion of the approach angle, and extra lights.",
          ],
        },
        {
          title: "Runway Lighting",
          pages: [342, 343, 344, 345],
          intro:
            "The lights that define the landing area, and the colour convention " +
            "that tells you which end you are looking at.",
          keyPoints: [
            "Runway lighting defines the boundaries of the actual landing area, is used day and night, and its intensity is set by ATS to suit visibility — adjustable on request.",
            "Runway edge lighting (REDL): normally white for the usable portion.",
            "Runway landing threshold lighting (RTHL): unidirectional green, visible from the approach direction, across the full width.",
            "Runway end lighting (RENL): red across the full width, possibly with a clear central gap.",
            "Where a threshold is displaced, edge lighting between the landing threshold and runway end lights is unidirectional red from the approach end and white from the runway end, and green wing bars may mark the landing threshold.",
          ],
          context:
            "Green means the beginning and red means the end, seen from the " +
            "direction you are approaching. Every other runway light convention " +
            "hangs off that one idea.",
        },
        {
          title: "Centreline, Touchdown Zone and End Indicator Lighting",
          pages: [346, 347, 348],
          intro:
            "Three more systems, each answering a question the edge lights " +
            "cannot.",
          keyPoints: [
            "Runway centreline lighting (RCLL) on a precision approach runway: white from the threshold to the 900 m point, alternating red and white to the 300 m point, red from there to the end.",
            "Runway touchdown zone lighting (RTZL), where installed such as Wellington: a wing-bar display of white lights outboard of the runway lights.",
            "Runway end indicator lighting (REIL): very high intensity unidirectional projectors either side downwind of the landing threshold, flashing brilliant white 60 times a minute, adjustable to two intensities.",
          ],
          takeaway:
            "The centreline colour sequence is a distance-to-go tape. Alternating " +
            "red and white means 900 m remaining; solid red means 300 m.",
        },
        {
          title: "Pilot Activated and Remotely Controlled Lighting",
          pages: [349, 350],
          intro:
            "Turning the lights on at an aerodrome with nobody in the tower.",
          keyPoints: [
            "At some unattended aerodromes, keying the VHF transmitter on the appropriate frequency switches the lights on.",
            "The standard system for a 20-minute period: five rapid short transmissions to activate; after a 10-second warm-up, repeat the cycle holding down the last transmission to set brilliance and select the runway; any further transmission re-activates.",
            "Remote control other than PAL may be available by phone to the aerodrome operator or chief controller, or by radio to the Flight Information Centre.",
          ],
        },
        {
          title: "Taxiway Lighting, Wind Indicators and Aerodrome Beacons",
          pages: [351, 352, 353],
          intro:
            "Getting around on the ground, and finding the aerodrome in the first " +
            "place.",
          keyPoints: [
            "Taxiway lighting: blue side lighting, or green centreline lighting.",
            "Holding point lighting is three yellow lights indicating the direction of the approach to the runway.",
            "At aerodromes intended for night operations the primary wind indicator, and possibly another, is illuminated.",
            "Aerodrome beacons are commonly on a high aerodrome feature, flashing white or alternating green and white at a specified interval, to help locate the aerodrome at night or in poor visibility.",
          ],
        },
        {
          title: "Obstruction Lighting and Light Characteristics",
          pages: [354, 355, 356],
          intro:
            "Marking what you must not hit, and the abbreviations used to " +
            "describe every light in this chapter.",
          keyPoints: [
            "At aerodromes authorised for night operations, man-made obstacles and significant high ground are obstacle-lit.",
            "Low intensity steady red for most situations; medium intensity flashing red as a hazard beacon for early or special warning; flashing white strobe for day and night marking of tall structures.",
            "F — fixed, showing continuously and steadily.",
            "FLG — flashing, with periods of light shorter than periods of dark.",
            "Gp FLG — group flashing, a specified number of brief flashes.",
            "OCC — occulting, with periods of darkness shorter than periods of light.",
            "Alternating — showing different colours alternately.",
          ],
          context:
            "These abbreviations are how the aerodrome operational data " +
            "describes lighting. Reading a plate fluently means knowing them " +
            "without looking them up.",
        },
      ],
    },

    /* ================================================================ 12 == */
    {
      title: "The Global Positioning System",
      intro:
        "A system of three segments, one of which is in your aeroplane. The " +
        "examinable substance is mostly about integrity — how the receiver " +
        "decides whether to believe itself.",
      topics: [
        {
          title: "GNSS and the Space Segment",
          pages: [357, 358, 359, 360, 361],
          intro:
            "What the constellation is and how it is arranged, which is what " +
            "makes global coverage possible.",
          keyPoints: [
            "GNSS is ICAO's generic term for global position and time determination systems.",
            "24 satellites at just over 20,200 km in six circular orbital planes.",
            "Three are spares; the other 21 are sufficient for global navigation coverage.",
            "Each plane is inclined 55° to the equator, with an orbit taking around 12 hours.",
          ],
        },
        {
          title: "Satellite Transmissions and Codes",
          pages: [362, 363, 364],
          intro:
            "What each satellite actually broadcasts, and the difference between " +
            "the civil and military services.",
          keyPoints: [
            "Two L-band frequencies; civilian use is limited to 1575.42 MHz, the other being military.",
            "Each transmission is modulated with a 50 bit/sec navigation message and a unique pseudo-random code.",
            "Two types of pseudo-random code: coarse/acquisition (C/A), the Standard Positioning Service, and precision P(Y), the Precise Positioning Service.",
            "The navigation message carries satellite ephemeris, GPS time reference, clock corrections, almanac data and system maintenance status.",
          ],
        },
        {
          title: "The Control and User Segments",
          pages: [365, 366, 367],
          intro:
            "Who runs it, and what your receiver does in the first few seconds " +
            "after you switch it on.",
          keyPoints: [
            "The controlling authority is the US Department of Defense; by agreement civilian users have no-cost access to the C/A code.",
            "The control segment includes monitoring stations, ground antenna and up-links, and a master station.",
            "The receiver identifies each satellite by its pseudo-random code, then processes navigation information.",
            "Ephemeris data takes about 6 seconds to transmit; almanac data about 13, which is why the almanac is stored in the receiver.",
          ],
        },
        {
          title: "Fixing Position and Eliminating Clock Error",
          pages: [368, 369, 370],
          intro:
            "Each satellite puts you on a sphere. Intersecting spheres put you at " +
            "a point — and one extra measurement pays for a cheap clock.",
          keyPoints: [
            "A signal that has travelled a given time defines a range sphere around that satellite.",
            "Three satellites give an unambiguous position; four are needed for a three-dimensional fix.",
            "Synchronisation between receiver and satellite clocks is essential, and the receiver's computer detects and eliminates timing errors.",
          ],
        },
        {
          title: "RAIM and PDOP",
          pages: [371, 372, 373, 374],
          intro:
            "Integrity monitoring: the receiver checking its own satellites " +
            "against each other, and the geometry that decides how well it can.",
          definition:
            "RAIM is a receiver function that analyses signal integrity and the " +
            "relative positions of all satellites in view, selecting only the " +
            "best four or more and discarding anomalous ones.",
          term: "Receiver Autonomous Integrity Monitoring (RAIM)",
          diagramNotes: {
            373: "Two satellite arrangements. Bunched together, the overlapping range spheres cross at a shallow angle and the possible position is a long smear — a high PDOP. Spread widely, they cross steeply and the possible position closes to a small region — a low PDOP.",
          },
          keyPoints: [
            "At least five satellites in view for RAIM to find an anomaly; six to isolate the faulty one.",
            "PDOP depends on the satellites' positions relative to the fix, and its value determines the extent of range and position errors.",
            "RAIM tolerances required for IFR: 2 nm enroute, 1 nm terminal, 0.3 nm on approach.",
            "GDOP — geometric dilution of precision — is PDOP plus clock error.",
          ],
        },
        {
          title: "Barometric Aiding and the Masking Function",
          pages: [375, 376, 377],
          intro:
            "Two ways of coping with a poor view of the sky: borrow a " +
            "measurement, and refuse the worst signals.",
          keyPoints: [
            "Barometric aiding uses altimeter data as, in effect, the range to a simulated satellite directly overhead.",
            "It is available only when fewer than five satellites are in view and RAIM alone cannot be effective.",
            "The masking function ignores satellites below a fixed angle, whose signals must travel further through the ionosphere and troposphere.",
          ],
          context:
            "Both are the same instinct: a low satellite's range is more " +
            "corrupted by atmosphere than it is worth, and an altimeter directly " +
            "overhead is better than nothing.",
        },
        {
          title: "Receiver Operating Modes",
          pages: [378, 379],
          intro:
            "Three states, in descending order of how much you can trust the " +
            "position.",
          keyPoints: [
            "Navigation with RAIM.",
            "Navigation, 2D or 3D, without RAIM.",
            "Loss of navigation — dead reckoning.",
          ],
        },
        {
          title: "GPS Errors",
          pages: [380, 381, 382, 383, 384, 385, 386, 387],
          intro:
            "Six error sources and what each contributes, ending in the total " +
            "position error that all this integrity machinery exists to bound.",
          keyPoints: [
            "Ephemeris error: error in the data defining the satellite's current position.",
            "Multi-path error: a signal received after reflecting off the earth's surface.",
            "Ionospheric propagation: charged particles slow the signal; the receiver can offset this using data from the satellites.",
            "Tropospheric propagation: the same effect caused by water vapour, minimised by compensation modelling in the receiver.",
            "Receiver error: a small ranging error from matching the internal pseudo-random code to the satellites'.",
            "Interference: extreme care is taken to prevent interference with the weak GPS signals.",
            "Typical contributions: clock 2 m, ephemeris 2.5 m, ionospheric 5 m, tropospheric 0.5 m, receiver noise 1 m, multi-path 1 m — a total pseudo-range error of about 6 m, multiplied by a maximum PDOP factor of 3 for about 18 m of position error.",
          ],
          context:
            "Notice the arithmetic at the end. The pseudo-range error is six " +
            "metres and the position error is eighteen — geometry multiplies " +
            "the error, which is exactly why PDOP is worth monitoring.",
        },
        {
          title: "Operating Without RAIM",
          pages: [388, 389, 390],
          intro:
            "When integrity monitoring is lost, what you must do about it, and " +
            "the check that is required before you leave.",
          keyPoints: [
            "RAIM is lost, with an alerting message, when poor geometry puts PDOP outside tolerance for the phase of flight, or when too few satellites are in view.",
            "If a RAIM warning has shown enroute for more than 10 minutes, or the GPS has been in DR mode for more than one minute: advise ATC, and verify position every 10 minutes with another navigation system.",
            "An aircraft cannot be flown on a GPS-based instrument approach with a RAIM warning displayed.",
            "To use a GPS-based approach, a RAIM prediction for the expected ETA and destination must be obtained before departure, from an IFR-certified receiver or the IFIS website.",
          ],
          takeaway:
            "RAIM is not a nicety. Without it the receiver may still show a " +
            "position, and has no way to tell you that position is wrong.",
        },
        {
          title: "Geodetic Datum",
          pages: [391],
          intro:
            "Satellite positions and chart positions are quoted against " +
            "different models of the earth.",
          keyPoints: [
            "New Zealand's main geodetic datum has been NZGD 1949; GPS uses WGS 84.",
            "This can produce small discrepancies between GPS indications and mapped points.",
            "Charts updated to the newer datum bear 'WGS 84 co-ordinates'.",
          ],
        },
        {
          title: "Augmentation: DGPS and WAAS",
          pages: [392, 393, 394],
          intro:
            "Improving on the basic system by adding a known reference — on the " +
            "ground, or relayed by satellite.",
          context:
            "Augmentation is the general name for anything that makes a bare " +
            "GNSS position better, and the three families are worth holding " +
            "apart because which one you have decides which approaches you may " +
            "fly. Aircraft-based augmentation adds nothing outside the " +
            "aeroplane: the receiver checks itself, which is what RAIM and " +
            "fault detection and exclusion do, and barometric aiding is the " +
            "same idea using the altimeter as an extra input. Satellite-based " +
            "augmentation has ground stations measure the error over a known " +
            "position and broadcast the correction through a geostationary " +
            "satellite — WAAS is the American implementation, and an SBAS " +
            "receiver is what makes an approach to LPV minima possible. " +
            "Ground-based augmentation broadcasts its correction locally from " +
            "the aerodrome instead, and a landing system built on it is a GLS.",
          keyPoints: [
            "ABAS — aircraft-based augmentation. The receiver checks its own integrity: RAIM, fault detection and exclusion, and barometric aiding.",
            "SBAS — satellite-based augmentation. Ground reference stations measure the error and a geostationary satellite broadcasts the correction. WAAS is the American SBAS.",
            "GBAS — ground-based augmentation. The correction is broadcast locally from the aerodrome; a landing system built on it is a GLS.",
            "LP is localiser performance without vertical guidance; LPV is localiser performance with vertical guidance. Both are SBAS approach minima.",
            "Fault detection (FD) tells you a satellite signal has gone bad. Fault detection and exclusion (FDE) removes it and keeps navigating, which needs more satellites in view than detection alone.",
          ],
          takeaway:
            "Augmentation buys two different things: accuracy, and the " +
            "confidence that the position can be trusted. It is the second — " +
            "integrity, and being told promptly when it has been lost — that " +
            "decides whether a procedure may be flown.",
        },
      ],
    },
  ],
};

export default subject;
