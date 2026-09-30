/**
 * IR IFR Navigation — the free ten-question mock.
 *
 * Grounded in this subject's own lessons: minimum flight altitudes,
 * alternates, the ADF and VOR, DME slant range, and the RAIM tolerances
 * required for IFR use of GNSS.
 */
export const subject = {
  course: "ir-theory",
  subject: "ifr-navigation",
  questions: [
    {
      section: "Altimetry and Vertical Navigation",
      prompt: "The altimeter is calibrated for ISA conditions. Of the two departures from ISA that cause error:",
      options: [
        "Both pressure and temperature can be corrected in flight",
        "Pressure can be allowed for by updating the QNH; there is no temperature correction on the instrument",
        "Temperature can be corrected by the subscale; pressure cannot",
        "Neither can be allowed for once airborne",
      ],
      answer: 1,
      explanation:
        "Pressure variation is handled by keeping the subscale current. Temperature is not: the instrument has no correction for it, so on a day colder than standard the aircraft is lower than the altimeter says, and the allowance has to be made by the pilot.",
    },
    {
      section: "Charts, Publications and Route Information",
      prompt: "A minimum enroute altitude (MEA) published for a route segment guarantees:",
      options: [
        "Obstacle clearance only",
        "Navigation signal reception and obstacle clearance along the segment",
        "Radar coverage along the segment",
        "Freedom from icing along the segment",
      ],
      answer: 1,
      explanation:
        "An MEA is the altitude that assures both acceptable navigation signal coverage and the required obstacle clearance for the segment. An MRA assures reception alone, and a minimum safe altitude assures terrain clearance alone.",
    },
    {
      section: "Minimum Altitudes, Speeds and Alternates",
      prompt: "The minimum flight altitude for a route sector is:",
      options: [
        "The published route minimum safe altitude in all cases",
        "The highest of the applicable considerations, adjusted to a level the cruising table allows",
        "The lowest of the applicable considerations",
        "The altitude at which radar coverage begins",
      ],
      answer: 1,
      explanation:
        "The MFA is not a single published figure. It is the highest of the considerations that apply — route MSA, minimum reception altitude, minimum enroute altitude, volcanic hazard and the rest — and is then raised to a level the IFR cruising table permits.",
    },
    {
      section: "Minimum Altitudes, Speeds and Alternates",
      prompt: "An aerodrome may not be listed as an alternate on an IFR flight plan unless it is equipped with:",
      options: [
        "A control tower operating at the estimated time of arrival",
        "A secondary electric power supply for the navigation aids and lighting required",
        "A precision approach",
        "An on-field meteorological observer",
      ],
      answer: 1,
      explanation:
        "Beyond the forecast minima, the alternate must have a secondary electric power supply for the ground-based navigation aids and lighting the approach depends on. An alternate that stops working when its power fails is not an alternate.",
    },
    {
      section: "The ADF and the NDB",
      prompt:
        "An aircraft is on a heading of 070°M and the fixed-card ADF needle indicates a relative bearing of 040°. The magnetic bearing to the station is:",
      options: ["030°M", "070°M", "110°M", "140°M"],
      answer: 2,
      explanation:
        "Magnetic bearing to the station is heading plus relative bearing: 070 + 040 = 110°M. Where the sum exceeds 360, subtract 360. An RMI does this arithmetic for you by referencing the card to magnetic north continuously.",
    },
    {
      section: "The VOR",
      prompt: "A VOR determines the aircraft's radial from the station by:",
      options: [
        "Measuring the time for a pulse to travel to the aircraft and back",
        "Comparing the phase of an omnidirectional signal with that of a rotating directional signal",
        "Comparing the strength of a directional and a non-directional aerial",
        "Measuring the Doppler shift of the received carrier",
      ],
      answer: 1,
      explanation:
        "The station radiates an omnidirectional master signal and a highly directional signal rotating 30 times a second. The phase difference between the two equals the angular direction from the station, and that line of position is the radial.",
    },
    {
      section: "Distance Measuring Equipment",
      prompt: "A DME indicates:",
      options: [
        "Distance over the ground to the station",
        "Slant range to the station",
        "Distance to the nearest waypoint on the flight plan",
        "Ground distance corrected for aircraft altitude",
      ],
      answer: 1,
      explanation:
        "DME gives slant range — the distance through the air to the station — while the chart distance is measured across the ground. The two differ most when the aircraft is high and close, which is exactly where the reading is most likely to be used.",
    },
    {
      section: "Distance Measuring Equipment",
      prompt:
        "When a DME is tuned by selecting a co-located VOR, the DME identifier is distinguished by being:",
      options: [
        "Transmitted on a separate frequency",
        "Higher pitched, and heard once for every two or three VOR idents",
        "Lower pitched, and heard continuously",
        "Transmitted only when the aircraft is within 10 nm",
      ],
      answer: 1,
      explanation:
        "Two idents with the same code are heard. The DME's is the higher pitched one, transmitted once for every two or three VOR idents — which is how you confirm that the distance you are reading comes from the station you think it does.",
    },
    {
      section: "GNSS and Performance-Based Navigation",
      prompt: "For IFR use of GPS, RAIM must indicate an accuracy tolerance during an approach of:",
      options: ["2 nm", "1 nm", "0.3 nm", "0.1 nm"],
      answer: 2,
      explanation:
        "The required RAIM tolerances are 2 nm en route, 1 nm in terminal areas and 0.3 nm during an approach. RAIM is the receiver's own integrity check — its ability to tell you when it should not be trusted.",
    },
    {
      section: "IFR Flight Planning",
      prompt: "A standard terminal arrival route (STAR) is:",
      options: [
        "A designated IFR arrival route linking a significant point with an aerodrome",
        "A departure route from a runway to the en-route structure",
        "A holding pattern published for use in the event of a missed approach",
        "A radar vector issued by air traffic control",
      ],
      answer: 0,
      explanation:
        "A STAR links a significant point, normally on a designated air route, with the aerodrome. A SID does the reverse, linking a runway to the point at which the en-route phase begins.",
    },
  ],
};
