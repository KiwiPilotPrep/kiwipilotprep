/**
 * PPL Aircraft Technical Knowledge — the free ten-question mock.
 *
 * Each question comes from this subject's own lessons: the lift formula, the
 * drag tree, the carburettor icing temperature band, the magneto check, the
 * pitot-static failure cases and the weight and balance definitions.
 */
export const subject = {
  course: "ppl-theory",
  subject: "aircraft-technical-knowledge",
  questions: [
    {
      section: "Aerofoils and the Production of Lift",
      prompt:
        "At a constant angle of attack, doubling the true airspeed will change the lift produced by a factor of:",
      options: ["Two", "Four", "One half", "No change"],
      answer: 1,
      explanation:
        "Lift = CL × ½ρV²S. Velocity is squared, so doubling the speed at a constant angle of attack gives four times the lift. It is the squared term that makes speed the most powerful of the variables a pilot can move.",
    },
    {
      section: "Drag",
      prompt: "Induced drag is:",
      options: [
        "Greatest at high airspeed, because parasite drag dominates there",
        "Greatest at low airspeed, because it is a by-product of producing lift at a high angle of attack",
        "Independent of airspeed",
        "Produced only by the fuselage and undercarriage",
      ],
      answer: 1,
      explanation:
        "Induced drag is the price of lift and is tied to the angle of attack, so it is greatest at low airspeed and falls as speed rises. Parasite drag does the opposite. Adding the two curves gives the total drag curve, and its lowest point is the best lift/drag speed.",
    },
    {
      section: "Carburettor Icing",
      prompt: "Refrigeration and throttle icing in a carburettor are most likely in outside air temperatures of:",
      options: ["Below −20°C only", "−10°C to +25°C", "Above +30°C only", "Exactly 0°C"],
      answer: 1,
      explanation:
        "Both forms can occur between about −10°C and +25°C — well above freezing — because the temperature drop happens inside the carburettor, from the pressure reduction past the butterfly and the latent heat taken up as the fuel vaporises. The first sign in a fixed-pitch aeroplane is a gradual loss of RPM.",
    },
    {
      section: "Ignition Systems",
      prompt: "The spark in a piston aero engine is timed to occur:",
      options: [
        "Exactly at top dead centre",
        "Slightly before top dead centre, so peak cylinder pressure develops just after it",
        "At bottom dead centre",
        "During the exhaust stroke",
      ],
      answer: 1,
      explanation:
        "The spark is advanced so the flame front has time to move through the compressed mixture and peak cylinder pressure arrives just after top dead centre, where it does useful work on the power stroke.",
    },
    {
      section: "The Electrical System",
      prompt: "In a typical light aircraft, the master switch does NOT control:",
      options: ["The starter motor", "The ignition system", "The landing light", "The radios"],
      answer: 1,
      explanation:
        "The ignition system is self-contained and separate from the electrical system — the magnetos generate their own current — so the master switch does not turn it off. That is precisely why a propeller must be treated as live even with the master off.",
    },
    {
      section: "The Airspeed Indicator, Altimeter and VSI",
      prompt:
        "The pitot tube becomes blocked by ice during a climb. The airspeed indicator will:",
      options: [
        "Read zero",
        "Read progressively high",
        "Read progressively low",
        "Be unaffected, as it is fed from the static system",
      ],
      answer: 1,
      explanation:
        "A blocked pitot traps the pressure inside the instrument. As the aircraft climbs the static pressure falls, so the trapped total pressure looks larger by comparison and the ASI over-reads. In a descent the same blockage makes it under-read.",
    },
    {
      section: "The Airspeed Indicator, Altimeter and VSI",
      prompt: "The white arc on an airspeed indicator runs from:",
      options: [
        "VS1 to VNO",
        "VS0 to VFE",
        "VNO to VNE",
        "VA to VNE",
      ],
      answer: 1,
      explanation:
        "The white arc is the flap operating range: it starts at VS0, the stalling speed in the landing configuration, and ends at VFE, the maximum flap extended speed. The colour coding is the same on every aeroplane even though the numbers behind it are not.",
    },
    {
      section: "Stalling",
      prompt: "The indicated airspeed at which a given aeroplane stalls, in a given configuration and at a given weight:",
      options: [
        "Increases with altitude",
        "Decreases with altitude",
        "Does not change with altitude",
        "Changes only above 10,000 ft",
      ],
      answer: 2,
      explanation:
        "The airspeed indicator measures dynamic pressure and the wing responds to dynamic pressure, so the stall arrives at the same indicated airspeed however thin the air is. The true airspeed at the stall does rise with altitude — the instrument reading does not.",
    },
    {
      section: "Stalling",
      prompt: "A wing stalls when:",
      options: [
        "The airspeed falls below a fixed figure printed in the flight manual",
        "The critical angle of attack is exceeded, at whatever speed that occurs",
        "The engine can no longer produce enough thrust",
        "The flaps are extended beyond their limiting speed",
      ],
      answer: 1,
      explanation:
        "A stall is an angle, not a speed. For most training aeroplanes the stalling angle is about 15 to 16°, and the speed at which that angle is reached varies with weight, load factor, bank, power and configuration.",
    },
    {
      section: "Weight and Balance",
      prompt: "Zero fuel weight is the gross weight of the aircraft:",
      options: [
        "Excluding usable fuel, but including pilot, passengers, baggage and cargo",
        "Excluding pilot, passengers and cargo, but including full fuel",
        "Including the airframe and engine only",
        "At the moment of touchdown",
      ],
      answer: 0,
      explanation:
        "Zero fuel weight excludes the usable fuel but includes everything else being carried — pilot, passengers, baggage and cargo. Basic empty weight is the different figure: airframe, engine, fixed equipment, unusable fuel and full oil.",
    },
  ],
};
