/**
 * IR IFR Navaids — the free ten-question mock.
 *
 * Grounded in this subject's own lessons: the pressure instruments and their
 * errors, the gyroscopic instruments and their toppling limits, compass
 * errors, secondary radar, the ILS and GPS.
 */
export const subject = {
  course: "ir-theory",
  subject: "ifr-navaids",
  questions: [
    {
      section: "Pressure Instruments",
      prompt: "An altimeter is generally considered serviceable on the ground if, with the correct QNH set, it reads aerodrome elevation within:",
      options: ["+10 and −10 ft", "+30 and −45 ft", "+50 and −50 ft", "+75 and −75 ft"],
      answer: 1,
      explanation:
        "The tolerance is +30 and −45 ft against known aerodrome elevation. Anything outside that calls for bench testing rather than an allowance in the air.",
    },
    {
      section: "Pressure Instruments",
      prompt: "The Machmeter becomes the limiting speed reference at high level because the speed of sound:",
      options: [
        "Is constant, while true airspeed increases",
        "Is proportional to the square root of the absolute temperature, and so falls as the air gets colder",
        "Increases with altitude as pressure falls",
        "Depends on the aircraft's indicated airspeed",
      ],
      answer: 1,
      explanation:
        "The local speed of sound varies with the square root of absolute temperature, so it falls as the air gets colder with height. Mach number is TAS divided by that local speed of sound, and at altitude it is the limit that arrives before the indicated airspeed limit does.",
    },
    {
      section: "Gyroscopic Instruments",
      prompt: "Rigidity in a gyroscope depends on the mass of the rotor, its rotational velocity and:",
      options: [
        "The strength of the applied force",
        "The distance of the mass from the axis of rotation",
        "The angle of the gimbal rings",
        "The suction available to drive it",
      ],
      answer: 1,
      explanation:
        "Mass, rotational velocity and the distance of that mass from the spin axis are the three. Precession is the separate property, and its rate depends on the strength and direction of the applied force and on those same rigidity factors.",
    },
    {
      section: "Gyroscopic Instruments",
      prompt: "Compared with an artificial horizon, a turn coordinator:",
      options: [
        "Indicates bank angle directly",
        "Does not indicate bank angle, but does indicate rate of roll",
        "Indicates pitch attitude as well as rate of turn",
        "Uses an earth gyro held to the vertical",
      ],
      answer: 1,
      explanation:
        "The turn coordinator's gyro is tilted about 30° to the longitudinal axis, which lets it show rate of roll as well as rate of heading change. It does not show bank angle — its aircraft symbol is level whenever the heading is constant, however the aeroplane is banked.",
    },
    {
      section: "Compasses and Heading Reference",
      prompt: "Compass acceleration error is greatest on headings of:",
      options: ["North and south", "East and west", "North-east and south-west", "It is the same on all headings"],
      answer: 1,
      explanation:
        "The error comes from the offset between the pivot axis and the magnet's centre of gravity, which sets up a couple under acceleration. It is greatest on east and west, where that offset has the most leverage, and nil on north and south.",
    },
    {
      section: "Radar and the Transponder",
      prompt: "A transponder receives interrogations on, and replies on:",
      options: [
        "1030 MHz and replies on 1090 MHz",
        "1090 MHz and replies on 1030 MHz",
        "978 MHz and replies on 1090 MHz",
        "1215 MHz and replies on 960 MHz",
      ],
      answer: 0,
      explanation:
        "Interrogation is received on 1030 MHz and the reply is sent on 1090 MHz. Secondary radar is really two radars — one on the ground and one in the aircraft — which is what gives it longer range and no clutter, at the cost of requiring the aircraft to carry equipment.",
    },
    {
      section: "The Instrument Landing System",
      prompt: "A 3° ILS glidepath corresponds to a descent of approximately:",
      options: ["150 ft per nautical mile", "220 ft per nautical mile", "320 ft per nautical mile", "500 ft per nautical mile"],
      answer: 2,
      explanation:
        "About 320 ft per nautical mile — a gradient of roughly 1 in 20. The rule of thumb for the rate of descent needed to hold it is groundspeed multiplied by 5, so 120 kt groundspeed calls for about 600 ft per minute.",
    },
    {
      section: "The Instrument Landing System",
      prompt: "The four main components of an ILS are the localiser, the glideslope, marker beacons and:",
      options: ["A DME", "Approach lighting", "A compass locator", "A radar altimeter"],
      answer: 1,
      explanation:
        "Localiser, glideslope, marker beacons and approach lighting. The localiser gives azimuth guidance along the extended centreline and the glideslope gives vertical guidance — together making the ILS a precision approach aid.",
    },
    {
      section: "The Global Positioning System",
      prompt: "A GPS receiver needs signals from a minimum of four satellites for a three-dimensional fix because the fourth:",
      options: [
        "Provides redundancy in case one is lost",
        "Resolves the receiver's own clock error",
        "Supplies the altitude component alone",
        "Confirms the integrity of the other three",
      ],
      answer: 1,
      explanation:
        "Three range spheres fix a position in space, but only if the receiver's clock is as accurate as the satellites' atomic ones. The fourth measurement solves for that clock error instead, which is what allows a cheap clock in the aircraft.",
    },
    {
      section: "The Global Positioning System",
      prompt: "Barometric aiding is available to a GPS receiver when:",
      options: [
        "There are fewer than five satellites in view, using altimeter data as a simulated satellite overhead",
        "RAIM has failed completely",
        "The aircraft is below the transition altitude",
        "More than eight satellites are in view",
      ],
      answer: 0,
      explanation:
        "Barometric aiding feeds pressure altimeter data to the receiver as the range readout of a simulated satellite directly overhead. It is available when there are fewer than five satellites in view, and it substitutes for the measurement the missing satellite would have provided.",
    },
  ],
};
