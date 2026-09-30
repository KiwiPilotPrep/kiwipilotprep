/**
 * CPL General Aircraft Technical Knowledge — the free ten-question mock.
 *
 * Grounded in this subject's own lessons. The material is the commercial
 * one: the Otto cycle in detail, forced induction, the constant speed unit,
 * the instruments and the weight terminology a loading calculation uses.
 */
export const subject = {
  course: "cpl-theory",
  subject: "aircraft-technical-knowledge",
  questions: [
    {
      section: "Piston Engines: Configuration and Operating Cycle",
      prompt: "The four strokes of the Otto cycle, in order, are:",
      options: [
        "Compression, induction, power, exhaust",
        "Induction, compression, power, exhaust",
        "Induction, power, compression, exhaust",
        "Compression, power, induction, exhaust",
      ],
      answer: 1,
      explanation:
        "Induction, compression, power, exhaust — four strokes making one cycle. The power developed depends on the density of the fuel/air charge drawn in on the induction stroke, which is why anything that raises that density raises the power available.",
    },
    {
      section: "Piston Engines: Configuration and Operating Cycle",
      prompt: "Compression ratio is defined as:",
      options: [
        "Swept volume divided by clearance volume",
        "(Swept volume + clearance volume) divided by clearance volume",
        "Clearance volume divided by swept volume",
        "Cylinder bore divided by piston stroke",
      ],
      answer: 1,
      explanation:
        "Compression ratio is the total cylinder volume — swept plus clearance — divided by the clearance volume. A higher ratio gets more power from a given quantity of charge, but it also raises the temperature of the compressed charge, which is where detonation comes from.",
    },
    {
      section: "Induction, Supercharging and Turbocharging",
      prompt: "A turbocharger differs from a geared supercharger in that its impeller is driven by:",
      options: [
        "An electric motor",
        "A turbine in the exhaust gas stream",
        "The camshaft",
        "A belt from the crankshaft",
      ],
      answer: 1,
      explanation:
        "Both compress the induction charge with an impeller. The supercharger takes its drive from the engine; the turbocharger takes it from a turbine in the exhaust stream, recovering energy that would otherwise be thrown away. A waste gate regulates how much of that exhaust flow reaches the turbine.",
    },
    {
      section: "Propellers and Constant Speed Units",
      prompt: "Feathering a propeller after an engine failure:",
      options: [
        "Increases windmilling drag but protects the engine",
        "Reduces windmilling drag by setting a blade angle at which the propeller does not rotate",
        "Sets the blades to fully fine so the propeller turns freely",
        "Reverses the direction of the thrust produced",
      ],
      answer: 1,
      explanation:
        "Feathering twists the blade so the sections near the hub carry a positive angle of attack and those near the tips a negative one. The two cancel, the propeller stops turning, and the windmilling drag goes with it.",
    },
    {
      section: "Propellers and Constant Speed Units",
      prompt: "On a constant speed propeller, the centrifugal twisting moment tends to move the blades towards:",
      options: ["Coarse pitch", "Fine pitch", "The feathered position", "Reverse pitch"],
      answer: 1,
      explanation:
        "The centrifugal twisting moment arises from the propeller's rotational speed and pulls the blades towards fine. The aerodynamic twisting moment, from where the total reaction acts on the blade, works the other way. Both have to be overcome by the pitch change mechanism.",
    },
    {
      section: "The Ignition System",
      prompt: "Spark advance in a light aircraft piston engine is required because:",
      options: [
        "The mixture burns instantaneously and must be lit exactly at top dead centre",
        "The flame front takes time to travel, and peak cylinder pressure should arrive just after top dead centre",
        "The magneto cannot produce a spark at top dead centre",
        "It reduces the load on the starter motor",
      ],
      answer: 1,
      explanation:
        "Combustion is progressive, not instantaneous. Lighting the charge before top dead centre gives the flame front time to develop so that peak cylinder pressure arrives just after it, where it pushes the piston down rather than resisting its rise.",
    },
    {
      section: "Pressure Flight Instruments",
      prompt: "The green arc on an airspeed indicator represents:",
      options: [
        "The flap operating range, VS0 to VFE",
        "The normal operating range, VS1 to VNO",
        "The caution range, VNO to VNE",
        "The range between VA and VNE",
      ],
      answer: 1,
      explanation:
        "The green arc is the normal operating range: from VS1, the stalling speed in the clean configuration, to VNO, the maximum structural cruising speed. The white arc below it is the flap range, and the yellow caution range runs from VNO to VNE.",
    },
    {
      section: "The Magnetic Compass",
      prompt: "The magnetic compass requires no electrical supply because:",
      options: [
        "It is driven by the vacuum system",
        "A permanent magnet aligns itself with the Earth's magnetic field",
        "It is mechanically linked to the directional gyro",
        "It uses a self-generating flux valve",
      ],
      answer: 1,
      explanation:
        "The compass uses a permanent magnet that aligns with the Earth's field, so it needs no power. That independence is why it remains the primary direction reference and the reference the directional gyro is set against.",
    },
    {
      section: "Weight and Balance",
      prompt: "Maximum certified take-off weight is:",
      options: [
        "A performance limitation that varies with density altitude",
        "A structural limitation giving the permitted gross weight for take-off",
        "The weight of the aircraft at engine start, including taxi fuel",
        "The aircraft weight with no usable fuel on board",
      ],
      answer: 1,
      explanation:
        "MCTOW is a structural limit. Ramp weight is the greater figure permitted before taxiing, allowing for taxi fuel; zero fuel weight is the one with no usable fuel aboard. A performance-limited take-off weight on the day can of course be lower than the structural limit.",
    },
    {
      section: "Weight and Balance",
      prompt: "For an aircraft, a moment is taken as positive when it:",
      options: [
        "Produces a nose-up pitching reaction, from a station behind the datum",
        "Produces a nose-down pitching reaction, from a station behind the datum",
        "Acts at the datum itself",
        "Comes from fuel rather than payload",
      ],
      answer: 0,
      explanation:
        "Stations behind the datum give positive moments and a nose-up reaction; stations ahead of it give negative moments and a nose-down reaction. Consistent signs are what make the arithmetic of a loading sheet come out right.",
    },
  ],
};
