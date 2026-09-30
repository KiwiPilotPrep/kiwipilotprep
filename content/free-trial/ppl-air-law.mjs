/**
 * PPL Air Law — the free ten-question mock.
 *
 * Every question is written from this subject's own KiwiPilotPrep lessons and
 * is assigned to the section that teaches it. Nothing here states a rule the
 * course does not already teach: where a figure appears — a validity period,
 * a reserve, a minimum — it is the figure in the lesson, not one recalled
 * from elsewhere.
 */
export const subject = {
  course: "ppl-theory",
  subject: "air-law",
  questions: [
    {
      section: "Licences and Ratings",
      prompt: "The minimum age at which a person is eligible to be issued a Private Pilot Licence is:",
      options: ["16 years", "17 years", "18 years", "21 years"],
      answer: 1,
      explanation:
        "A PPL applicant must be at least 17 years old. Sixteen is the minimum age to fly solo as a student pilot, which is a separate requirement and is often confused with the licence age.",
    },
    {
      section: "Medical Requirements",
      prompt:
        "A Class 2 medical certificate issued to an applicant who is under 40 years of age is valid for a maximum of:",
      options: ["12 months", "24 months", "48 months", "60 months"],
      answer: 3,
      explanation:
        "A Class 2 medical is issued for no longer than 60 months for an applicant under 40, and 24 months for an applicant aged 40 or more. The age that counts is the applicant's age on the date the certificate was issued.",
    },
    {
      section: "Instruments, Avionics and Equipment",
      prompt:
        "An aircraft is to be operated over water more than 30 minutes flying time from the nearest shore. It must be equipped with:",
      options: [
        "A portable ELT only",
        "Approved two-way radio equipment and navigation equipment for the route",
        "A life raft for each person on board, and nothing further",
        "No additional equipment, provided the flight remains in sight of land",
      ],
      answer: 1,
      explanation:
        "Beyond 30 minutes flying time from the nearest shore, an aircraft must carry approved radio equipment capable of continuous two-way communication with an appropriate ATS unit, and navigation equipment suitable for the route. Life jacket and life raft requirements are set separately, by distance and by aircraft type.",
    },
    {
      section: "Right of Way Rules",
      prompt:
        "Two aircraft are converging at approximately the same altitude. Which aircraft is required to give way?",
      options: [
        "The faster aircraft",
        "The aircraft that has the other on its right",
        "The aircraft that has the other on its left",
        "The higher aircraft",
      ],
      answer: 1,
      explanation:
        "When two aircraft converge at about the same altitude, the aircraft that has the other on its right gives way. The category exceptions sit on top of this: power-driven aircraft give way to airships, gliders and balloons, airships give way to gliders and balloons, gliders give way to balloons, and all aircraft give way to parachutes.",
    },
    {
      section: "VFR Meteorological Minima",
      prompt: "Special VFR in a control zone requires, among other conditions:",
      options: [
        "Day or night, clear of cloud, with 3000 m visibility",
        "Day only, clear of cloud, a ceiling of at least 600 ft and 1500 m visibility",
        "Day only, 1000 ft vertically from cloud and 5 km visibility",
        "An instrument rating and an IFR flight plan",
      ],
      answer: 1,
      explanation:
        "Special VFR allows VFR operations in a control zone below the normal minima. It requires an ATC clearance, day only, clear of cloud, a ceiling of at least 600 ft, 1500 m visibility, and a radio-equipped aircraft.",
    },
    {
      section: "Flight Preparation and Fuel",
      prompt:
        "Before beginning a VFR flight by day, the pilot-in-command must have sufficient fuel to reach the first point of intended landing at normal cruising speed, and then to fly for at least a further:",
      options: ["10 minutes", "20 minutes", "30 minutes", "45 minutes"],
      answer: 2,
      explanation:
        "Part 91 requires fuel to the first point of intended landing at planned normal cruising speed, plus a reserve. By day that reserve is at least 30 minutes.",
    },
    {
      section: "Altimetry",
      prompt: "With the aerodrome QNH set on the subscale, the altimeter indicates:",
      options: [
        "Height above the aerodrome",
        "Altitude above mean sea level",
        "Pressure altitude",
        "Height above the highest obstacle in the circuit",
      ],
      answer: 1,
      explanation:
        "Aerodrome QNH is the calculated mean sea level pressure at the aerodrome, so with it set the altimeter reads altitude — the vertical distance above mean sea level. QFE is aerodrome-level pressure, and with QFE set the altimeter reads height above the aerodrome.",
    },
    {
      section: "Cruising Levels",
      prompt:
        "A VFR flight is in level cruise at 6500 ft AMSL, well above 1000 ft AGL. The magnetic track flown must lie between:",
      options: ["270°M through north to 089°M", "090°M through south to 269°M", "000°M and 179°M", "180°M and 359°M"],
      answer: 1,
      explanation:
        "Southerly tracks — any magnetic track from 090°M through south to 269°M — use even thousands plus 500 ft: 4500, 6500, 8500. Northerly tracks, 270°M through north to 089°M, use odd thousands plus 500 ft. The table applies to level VFR cruise above 3000 ft AMSL or 1000 ft AGL, whichever is higher.",
    },
    {
      section: "Airspace",
      prompt: "A VFR transit lane is:",
      options: [
        "Controlled airspace in which a clearance is required before entry",
        "Uncontrolled airspace established within controlled airspace, available by day, that needs no clearance",
        "A corridor reserved for IFR arrivals",
        "An area in which no radio is permitted at any time",
      ],
      answer: 1,
      explanation:
        "VFR transit lanes are areas of uncontrolled airspace established inside controlled airspace. They are active during daylight hours only, a VFR aircraft needs no clearance to use one, and they are drawn on visual navigation charts as solid blue lines.",
    },
    {
      section: "Incidents and Accidents",
      prompt:
        "Following an incident that has been notified to the Authority as soon as practicable, the written details must be submitted within:",
      options: ["24 hours", "7 days", "14 days", "30 days"],
      answer: 2,
      explanation:
        "The pilot-in-command must notify the Authority of an incident as soon as practicable, and the details must follow within 14 days of the occurrence. The initial notification and the written submission are two separate obligations.",
    },
  ],
};
