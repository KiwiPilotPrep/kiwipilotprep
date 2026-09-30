/**
 * PPL Flight Radiotelephony — the free ten-question mock.
 *
 * Codes, frequencies and procedures are as this subject's own lessons give
 * them: the VHF band limits, the transponder codes and modes, the speechless
 * technique, the light signals and the ELT frequencies.
 */
export const subject = {
  course: "ppl-theory",
  subject: "flight-radiotelephony",
  questions: [
    {
      section: "How Radio Works",
      prompt: "The VHF band used for aviation communication covers:",
      options: ["3 MHz to 30 MHz", "30 MHz to 300 MHz", "300 MHz to 3 GHz", "108 MHz to 118 MHz only"],
      answer: 1,
      explanation:
        "VHF runs from 30 MHz to 300 MHz. HF, used for long-distance work, is 3 MHz to 30 MHz. VHF is preferred in aviation because there are more frequencies available in the band and it is less prone to atmospheric interference.",
    },
    {
      section: "How Radio Works",
      prompt: "The practical range of a VHF transmission is limited principally by:",
      options: [
        "Atmospheric absorption",
        "Line of sight, so range increases with altitude",
        "The ionosphere, which reflects the signal back to earth",
        "The transmitter power alone",
      ],
      answer: 1,
      explanation:
        "VHF works line of sight. The higher you fly the further you can see, and the further you can be heard — which is also why repeater equipment is sited on high ground.",
    },
    {
      section: "Transponders",
      prompt: "A transponder operating in Mode C transmits:",
      options: [
        "The four-digit code only",
        "The four-digit code and pressure altitude",
        "The four-digit code, pressure altitude and the aircraft registration",
        "Pressure altitude only",
      ],
      answer: 1,
      explanation:
        "Mode A returns the four-digit code alone; Mode C adds pressure altitude; Mode S adds the aircraft's identity as well. Selecting ALT on the control head is what brings Mode C into use.",
    },
    {
      section: "Transponders",
      prompt: "The transponder code for a communications failure is:",
      options: ["1200", "7500", "7600", "7700"],
      answer: 2,
      explanation:
        "7600 is communications failure. 7700 is an emergency, 7500 is unlawful interference, 1200 is VFR, and 2200 is VFR in the circuit at a controlled aerodrome.",
    },
    {
      section: "Words, Numbers and Time",
      prompt: 'On the radio, the number 9 is pronounced:',
      options: ["NINE", "NIN-er", "NOV-em", "NINE-ty"],
      answer: 1,
      explanation:
        "NIN-er. Three, four, five and nine are given altered pronunciations — TREE, FOW-er, FIFE and NIN-er — because they are the digits most easily confused with one another over a noisy channel.",
    },
    {
      section: "Callsigns",
      prompt: "A ground station using the callsign suffix 'Ground' is responsible for:",
      options: [
        "Area control",
        "Surface movement control",
        "Approach radar",
        "The flight information service",
      ],
      answer: 1,
      explanation:
        "'Ground' is surface movement control. 'Tower' is aerodrome control, 'Approach' is approach control, 'Control' covers the control area and approach radar, and 'Information' is the flight information service.",
    },
    {
      section: "When Communication Fails",
      prompt:
        "Using the speechless technique after a microphone failure, two clicks of the transmit button means:",
      options: ["Yes or roger", "No", "Say again", "I am at the nominated position"],
      answer: 1,
      explanation:
        "The number of clicks is the message: one for yes or roger, two for no, three for say again, four for at the nominated position. It is the fallback when the receiver works and the transmitter carries no voice.",
    },
    {
      section: "When Communication Fails",
      prompt: "A steady green light signal directed at an aircraft in flight means:",
      options: [
        "Return to the aerodrome for landing",
        "Cleared to land",
        "Give way to other aircraft and continue circling",
        "Airport unsafe, do not land",
      ],
      answer: 1,
      explanation:
        "Steady green in the air is cleared to land; on the ground it is cleared for take-off. Steady red in the air means give way and keep circling, and on the ground it means stop.",
    },
    {
      section: "Emergency Radio Procedures",
      prompt: "A PAN-PAN call is transmitted when:",
      options: [
        "The aircraft is in grave and imminent danger and requires immediate assistance",
        "There is a potential threat to the aircraft but immediate assistance is not required",
        "The pilot wishes to cancel a flight plan",
        "Radio contact has been lost",
      ],
      answer: 1,
      explanation:
        "PAN-PAN is the urgency call — a situation that services should know about, but which does not require immediate assistance. MAYDAY is the distress call for grave and imminent danger. A PAN-PAN can be upgraded to a MAYDAY, and a MAYDAY downgraded.",
    },
    {
      section: "Emergency Radio Procedures",
      prompt: "A modern ELT transmits on:",
      options: [
        "121.5 MHz continuously and 406.0 MHz once every 50 seconds",
        "406.0 MHz continuously only",
        "243.0 MHz continuously only",
        "121.5 MHz once every 50 seconds",
      ],
      answer: 0,
      explanation:
        "121.5 MHz is transmitted continuously and 406.0 MHz once every 50 seconds. The 406 MHz burst is the one received by the Cospas-Sarsat satellites and carries the identification that makes the alert useful.",
    },
  ],
};
