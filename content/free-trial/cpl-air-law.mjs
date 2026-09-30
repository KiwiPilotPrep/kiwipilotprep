/**
 * CPL Air Law — the free ten-question mock.
 *
 * Written from this subject's own lessons. The commercial material — hire or
 * reward, release to service, oxygen, dangerous goods — is what separates it
 * from the PPL paper, so the questions sit there rather than on the ground
 * the two subjects share.
 */
export const subject = {
  course: "cpl-theory",
  subject: "air-law",
  questions: [
    {
      section: "Operations for Hire or Reward",
      prompt: "In the context of an air operation, 'for hire or reward' means remuneration in the form of:",
      options: [
        "Money only",
        "Money or goods only",
        "Money, goods, credit or any other form for services rendered",
        "Any payment exceeding the direct cost of the flight",
      ],
      answer: 2,
      explanation:
        "The definition is deliberately broad: money, goods, credit or any other form of remuneration for services rendered. It is wider than cash, which is why a flight can become a commercial operation without money changing hands.",
    },
    {
      section: "Maintenance and Release to Service",
      prompt: "A release to service normally takes the form of:",
      options: [
        "An entry in the technical log",
        "An entry in the appropriate aircraft logbook",
        "A placard displayed in the cockpit",
        "A verbal advice from the engineer to the pilot",
      ],
      answer: 1,
      explanation:
        "The release to service is certified as an entry in the appropriate aircraft logbook. The technical log tells the pilot the maintenance status of the aircraft, but the full release to service does not appear on it.",
    },
    {
      section: "Emergency Equipment, ELTs and Oxygen",
      prompt:
        "In a non-pressurised aircraft, oxygen must be installed and used when operating:",
      options: [
        "Above 10,000 ft AMSL in all cases",
        "Above 13,000 ft AMSL, or between 10,000 and 13,000 ft for longer than 30 minutes",
        "Above 12,500 ft AMSL for longer than 60 minutes",
        "Only above 15,000 ft AMSL",
      ],
      answer: 1,
      explanation:
        "Oxygen is required above 13,000 ft AMSL, and also between 10,000 and 13,000 ft where that altitude band is occupied for more than 30 minutes. The duration condition is the part that catches people out.",
    },
    {
      section: "The Pilot-in-Command: Authority and Responsibilities",
      prompt:
        "Where the flight crew of an aircraft includes more than one pilot, the pilot-in-command for each period of flight is:",
      options: [
        "Agreed between the pilots before departure",
        "Designated by the operator",
        "Always the pilot occupying the left seat",
        "The pilot with the greater total flight time",
      ],
      answer: 1,
      explanation:
        "Command is designated, not negotiated. Part 91 requires the operator to designate one of the pilots as pilot-in-command for each period of flight, so that authority and responsibility are settled before the aircraft moves.",
    },
    {
      section: "Classes of Airspace",
      prompt:
        "In Class C, D and G airspace, the maximum indicated airspeed below 10,000 ft is:",
      options: ["200 kt", "250 kt", "300 kt", "There is no speed restriction"],
      answer: 1,
      explanation:
        "250 kt IAS below 10,000 ft applies in Classes C, D and G. The exception is an aircraft whose flight manual stipulates a minimum safe speed above 250 kt, which must then be flown at that minimum safe speed.",
    },
    {
      section: "Flight Plans and Fuel Requirements",
      prompt: "A flight plan achieves two objectives. Besides providing ATS with the intended route, it:",
      options: [
        "Reserves airspace along the route",
        "Provides a flight following service, so the authorities are notified if the aircraft becomes overdue",
        "Satisfies the fuel requirement of Part 91",
        "Constitutes a clearance into controlled airspace",
      ],
      answer: 1,
      explanation:
        "The second objective is flight following: if the aircraft becomes overdue, somebody is notified. That is the half of the flight plan that keeps working after everything else has stopped.",
    },
    {
      section: "VFR Meteorological Minima",
      prompt:
        "The aerodrome meteorological minima at a controlled aerodrome, by day and by night, are a minimum ceiling and visibility of:",
      options: ["600 ft and 1500 m", "1000 ft and 3 km", "1500 ft and 5 km", "2000 ft and 8 km"],
      answer: 2,
      explanation:
        "A controlled aerodrome has minima of 1500 ft ceiling and 5 km visibility, day and night. Below the specified minima an aircraft shall not take off or land there. Special VFR in a control zone is the separate provision, at 600 ft and 1500 m.",
    },
    {
      section: "Right of Way Rules",
      prompt: "An aircraft that is being overtaken:",
      options: [
        "Must give way to the overtaking aircraft",
        "Has the right of way, and the overtaking aircraft alters heading to the right",
        "Has the right of way, and the overtaking aircraft alters heading to the left",
        "Must descend to allow the overtaking aircraft to pass",
      ],
      answer: 1,
      explanation:
        "The aircraft being overtaken has the right of way. The overtaking pilot alters heading to the right, where a turn is required, until entirely past and clear.",
    },
    {
      section: "Altimeter Settings and the Transition Layer",
      prompt: "New Zealand is divided into QNH zones extending from the surface to 13,000 ft. The number of zones is:",
      options: ["6", "8", "12", "16"],
      answer: 2,
      explanation:
        "There are 12 area QNH zones from the surface to 13,000 ft. Area QNH is used outside the control zone and is transmitted by the appropriate ATS unit; above 13,000 ft the subscale goes to 1013.2 and altitudes become flight levels.",
    },
    {
      section: "Carriage of Dangerous Goods",
      prompt: "An operator shall not accept a consignment of dangerous goods for carriage by air unless it is accompanied by:",
      options: [
        "A single copy of the dangerous goods transport document",
        "Two copies of the dangerous goods transport document",
        "A verbal declaration from the shipper",
        "An approval from the pilot-in-command",
      ],
      answer: 1,
      explanation:
        "Two copies of the dangerous goods transport document are required, and the package must be correctly marked and labelled. Separately, the operator must present the pilot-in-command with a dedicated form stating the nature of the goods carried.",
    },
  ],
};
