/**
 * IR Air Law — the free ten-question mock.
 *
 * Grounded in this subject's own lessons: the instrument rating currency
 * requirements, IFR equipment and maintenance intervals, the separation
 * standards, terrain clearance and the emergency procedures.
 */
export const subject = {
  course: "ir-theory",
  subject: "ir-air-law",
  questions: [
    {
      section: "Pilot Requirements",
      prompt: "Flight in simulated instrument conditions requires, among other things, that:",
      options: [
        "The aircraft has two pilot stations, one occupied by a safety pilot holding a current pilot licence",
        "An instrument rating is held by the pilot under the hood only",
        "The flight is conducted in Class G airspace only",
        "An instructor rating is held by the pilot flying",
      ],
      answer: 0,
      explanation:
        "The aircraft must have two pilot stations with a safety pilot, holding a current licence, occupying one of them and having adequate forward vision. The point of the rule is that somebody in the aeroplane is still looking outside.",
    },
    {
      section: "Pilot Requirements",
      prompt: "Instrument rating currency runs on two clocks. The requirements are set over the preceding:",
      options: ["6 months and 1 month", "12 months and 3 months", "24 months and 6 months", "12 months and 6 months"],
      answer: 1,
      explanation:
        "One requirement runs over the immediately preceding 12 months and the other over the preceding 3 months. Both must be satisfied at the same time — meeting one does not carry the other.",
    },
    {
      section: "Aircraft, Equipment and Airworthiness",
      prompt: "An aircraft operating under IFR must be equipped with communication equipment capable of:",
      options: [
        "Receiving the ATIS at the destination",
        "Providing continuous two-way communications with an appropriate ATS unit or aeronautical telecommunications facility",
        "Transmitting on the international distress frequency only",
        "Datalink communication with the area control centre",
      ],
      answer: 1,
      explanation:
        "The requirement is continuous two-way communication with an appropriate ATS unit or aeronautical telecommunications facility, and the equipment must meet the level 1 standards. The radios also carry their own test and inspection interval, separate from the airframe's maintenance.",
    },
    {
      section: "Aircraft, Equipment and Airworthiness",
      prompt:
        "A cellphone or other device designed to transmit electromagnetic energy may be operated:",
      options: [
        "At any time during an IFR flight",
        "Not at all while the aircraft is operating under IFR",
        "Only above 10,000 ft",
        "Only with the pilot-in-command's verbal approval",
      ],
      answer: 1,
      explanation:
        "No person may operate, and no operator or pilot-in-command may allow the operation of, a cellphone or other deliberate transmitter on an aircraft operating under IFR.",
    },
    {
      section: "Separation",
      prompt: "Vertical separation between controlled flights below FL290 is:",
      options: ["500 ft", "1000 ft", "2000 ft", "3000 ft"],
      answer: 1,
      explanation:
        "1000 ft below FL290 and 2000 ft above it, except in RVSM airspace where 1000 ft may be used above FL290 if both aircraft are approved. The 1000 ft standard can be reduced to 500 ft in some circumstances within controlled airspace.",
    },
    {
      section: "Separation",
      prompt: "Where radar separation is applied between controlled flights, and wake turbulence is not a factor, the minimum horizontal separation is:",
      options: ["3 nm", "5 nm", "8 nm", "10 nm"],
      answer: 1,
      explanation:
        "5 nm is the standard, reducible in defined circumstances such as operating within controlled airspace close to the radar heads. Wake turbulence is handled by its own distance and time standards on top of this.",
    },
    {
      section: "Separation",
      prompt:
        "An IFR flight must advise ATS of an inadvertent departure from the flight plan where the true airspeed varies by:",
      options: ["2% or more", "5% or more", "10% or more", "Any variation at all"],
      answer: 1,
      explanation:
        "A variation of 5% or more of the filed true airspeed, or ±0.01 or more of the filed Mach number, must be reported. Longitudinal separation was calculated using the speed you filed, so a change to it changes the spacing ATC believes exists.",
    },
    {
      section: "Terrain Clearance",
      prompt: "When an IFR aircraft is being radar vectored, terrain clearance is the responsibility of:",
      options: [
        "The pilot-in-command at all times",
        "The radar controller, who must also keep the aircraft within controlled airspace except in an emergency",
        "The pilot-in-command above the MSA and the controller below it",
        "Neither, once the aircraft is under radar control",
      ],
      answer: 1,
      explanation:
        "While vectoring, the radar controller is responsible for adequate terrain clearance and for keeping the aircraft inside controlled airspace, except in an emergency. Responsibility returns to the pilot when vectoring is terminated, which is why that moment is stated explicitly.",
    },
    {
      section: "Altimetry, Transponders and Airspace",
      prompt: "Under IFR in Class D, E, F or G airspace, the maximum indicated airspeed below 10,000 ft AMSL is:",
      options: ["200 kt", "250 kt", "280 kt", "300 kt"],
      answer: 1,
      explanation:
        "250 kt IAS below 10,000 ft AMSL. The exception is an aircraft whose prescribed minimum safe speed is higher, in which case it is flown at that minimum safe speed.",
    },
    {
      section: "Emergencies and Failures",
      prompt: "The transponder code to select in an emergency is:",
      options: ["7500", "7600", "7700", "2000"],
      answer: 2,
      explanation:
        "7700 for an emergency, 7600 for a communications failure and 7500 for unlawful interference. Selecting the code is part of declaring the emergency, not a substitute for the radio call where the radio still works.",
    },
  ],
};
