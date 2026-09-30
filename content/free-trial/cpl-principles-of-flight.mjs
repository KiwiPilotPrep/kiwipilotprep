/**
 * CPL Principles of Flight and Aircraft Performance — the free ten-question
 * mock.
 *
 * Grounded in this subject's own lessons: density altitude, the speed chain,
 * the drag families, lift augmentation, the stall and spin, load factor,
 * stability and asymmetric flight.
 */
export const subject = {
  course: "cpl-theory",
  subject: "principles-of-flight",
  questions: [
    {
      section: "The Atmosphere and Density Altitude",
      prompt: "Density altitude is:",
      options: [
        "The altitude shown on the altimeter with 1013.2 hPa set",
        "The altitude in the standard atmosphere at which the air density equals the actual density on the day",
        "The height above the aerodrome at which the air is half as dense as at sea level",
        "Pressure altitude corrected for humidity only",
      ],
      answer: 1,
      explanation:
        "Density altitude is the altitude in ISA where the density matches what the air is actually doing today. Comparing the two is how a performance chart drawn against a standard atmosphere is made to say something useful about a hot day at a high aerodrome.",
    },
    {
      section: "Pressure, Airspeed and the Speed Definitions",
      prompt: "Calibrated airspeed is indicated airspeed corrected for:",
      options: [
        "Density error",
        "Compressibility error",
        "Instrument and pressure (position) error",
        "Temperature deviation from ISA",
      ],
      answer: 2,
      explanation:
        "CAS is IAS corrected for instrument and pressure error. Correcting CAS for compressibility gives EAS, and correcting for density gives TAS. Each step in the chain removes one specific error, which is why the order matters.",
    },
    {
      section: "Drag",
      prompt: "Profile drag comprises:",
      options: [
        "Skin friction drag and form drag",
        "Induced drag and interference drag",
        "Form drag and induced drag",
        "Skin friction drag and induced drag",
      ],
      answer: 0,
      explanation:
        "Profile drag is skin friction plus form drag, and it is present whenever the aeroplane is moving through the air — even taxiing, with no lift being made. Induced drag is the separate family that exists only as a by-product of producing lift.",
    },
    {
      section: "Drag",
      prompt: "Increasing the aspect ratio of a wing:",
      options: [
        "Increases induced drag, because more of the wing is exposed to tip vortices",
        "Reduces induced drag, because less of the aerofoil is exposed to the tip vortices",
        "Has no effect on induced drag",
        "Reduces parasite drag but not induced drag",
      ],
      answer: 1,
      explanation:
        "Aspect ratio is span divided by chord. A higher aspect ratio means a proportionally smaller part of the wing sits in the influence of the tip vortices, so the induced drag falls. Taper and washout work towards the same end by different means.",
    },
    {
      section: "Lift Augmentation",
      prompt: "A leading-edge slat, used without trailing-edge flap:",
      options: [
        "Reduces the stalling angle of attack",
        "Increases the stalling angle of attack",
        "Leaves the stalling angle unchanged but reduces drag",
        "Acts as a spoiler at high angles of attack",
      ],
      answer: 1,
      explanation:
        "A slat forms a slot through which higher-pressure air passes to re-energise the boundary layer on the upper surface, so the airflow stays attached to a greater angle of attack. The stalling angle increases, and with it the nose attitude the aeroplane can be flown at.",
    },
    {
      section: "Stalling and Spinning",
      prompt: "A stall is broken by:",
      options: [
        "Applying full power",
        "Reducing the angle of attack",
        "Rolling the wings level with aileron",
        "Increasing back pressure to raise the nose",
      ],
      answer: 1,
      explanation:
        "Only reducing the angle of attack ends a stall. Power helps the recovery and reduces the height lost, but an aeroplane held at the critical angle with full power applied is still stalled.",
    },
    {
      section: "Stalling and Spinning",
      prompt: "Autorotation leading to a spin occurs when:",
      options: [
        "Both wings stall simultaneously",
        "One wing is more deeply stalled than the other, and continues to roll and yaw",
        "The rudder is held central through the stall",
        "The aircraft stalls at a high indicated airspeed",
      ],
      answer: 1,
      explanation:
        "Autorotation is the state where one wing is more deeply stalled than the other. The dropping wing yaws the aeroplane, which deepens the stall on that side, which rolls it further — and left uncorrected the sequence becomes a spin.",
    },
    {
      section: "Turning and Load Factor",
      prompt: "In a level turn at 30° angle of bank, the load factor is approximately:",
      options: ["1.0 g", "1.15 g", "1.41 g", "2.0 g"],
      answer: 1,
      explanation:
        "About 1.15 g at 30° of bank, rising to 1.41 g at 45° and 2 g at 60°. Load factor is an apparent increase in weight, so the stalling speed rises with it.",
    },
    {
      section: "Stability",
      prompt: "Directional stability about the normal axis is provided principally by:",
      options: ["Dihedral", "The tailfin", "Wing sweepback", "The tailplane"],
      answer: 1,
      explanation:
        "Yaw increases the angle of attack of the tailfin, which generates a sideways lift force and a restoring moment. A larger fin, and a greater distance between fin and centre of gravity, both increase that moment. Dihedral and sweepback give lateral stability; the tailplane gives longitudinal stability.",
    },
    {
      section: "Asymmetric Flight",
      prompt: "Following an engine failure in a twin, the pilot's first actions are to:",
      options: [
        "Identify and feather the failed engine before anything else",
        "Prevent further yaw with rudder and unwanted roll with aileron",
        "Reduce power on the live engine to reduce the asymmetry",
        "Lower the undercarriage to increase directional stability",
      ],
      answer: 1,
      explanation:
        "Control comes first: stop the yaw with rudder and the roll with aileron. Identifying and securing the failed engine follows, and identifying it before the aeroplane is under control is how a survivable failure becomes a loss of control.",
    },
  ],
};
