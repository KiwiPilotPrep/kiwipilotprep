/**
 * CPL Meteorology — the curriculum.
 *
 * At 536 slides this is the largest of the six decks, and the best organised
 * after Navigation: twenty-two section dividers, and slide titles that are
 * almost all concept names rather than fragments. The curriculum keeps that
 * spine and subdivides the four sections that are too large to be one chapter
 * — Temperature and Heat Exchange (37 slides), Atmospheric Stability (35),
 * Thunderstorms (37) and Tropical Meteorology (60) — plus the 73-slide block
 * on meteorological services at the end, which contains six distinct products
 * a student has to be able to read separately.
 *
 * Seven slides carry a title and nothing else. They are the points at which the
 * classroom course plays a video: there is no video here and inventing a
 * description of one would be worse than saying nothing, so they are skipped
 * with that reason recorded. The teaching around them is untouched.
 *
 * Everything authored explains mechanism and consequence. It states no figure,
 * no lapse rate and no minimum the deck does not.
 */

export const subject = {
  slug: "meteorology",
  title: "CPL Meteorology",
  deck: "cpl-meteorology",

  skip: {
    1: "deck cover slide: the words \"CPL Meteorology\" over a photograph, with no body text",
    2: "section divider: the heading \"Weather Maps\" with no text of its own",
    32: "blank slide: no title, no text, no diagram",
    33: "carries the heading \"Aerosols Effects On Rainfall\" and nothing else — the point at which the classroom course plays a video. There is no video in this course and describing one would be inventing it",
    34: "blank slide: no title, no text, no diagram",
    35: "section divider: the heading \"Atmospheric Pressure\" with no text of its own",
    44: "section divider: the heading \"Temperature and Heat Exchange Processes\" with no text of its own",
    81: "section divider: the heading \"The Wind\" with no text of its own",
    85: "blank slide: no title, no text, no diagram",
    98: "section divider: the heading \"Atmospheric Moisture\" with no text of its own",
    117: "section divider: the heading \"Atmospheric Stability\" with no text of its own",
    152: "section divider: the heading \"Local Winds\" with no text of its own",
    180: "carries the heading \"Rotor Cloud\" and nothing else — a video point in the classroom course. Rotor cloud is taught in the mountain wave topic from the slides that do carry text",
    185: "section divider: the heading \"Inversions\" with no text of its own",
    198: "section divider: the heading \"Cloud and its Classification\" with no text of its own",
    221: "blank slide: no title, no text, no diagram",
    227: "section divider: the heading \"Precipitation\" with no text of its own",
    233: "section divider: the heading \"Visibility\" with no text of its own",
    242: "section divider: the heading \"Fog\" with no text of its own",
    245: "section divider: the heading \"Icing\" with no text of its own",
    263: "blank slide: no title, no text, no diagram",
    271: "section divider: the heading \"Thunderstorms\" with no text of its own",
    272: "blank slide: no title, no text, no diagram",
    293: "blank slide: no title, no text, no diagram",
    298: "blank slide: no title, no text, no diagram",
    299: "blank slide: no title, no text, no diagram",
    308: "section divider: the heading \"Anti-Cyclones\" with no text of its own",
    318: "section divider: the heading \"Fronts And Depressions\" with no text of its own",
    339: "blank slide: no title, no text, no diagram",
    340: "section divider: the heading \"Turbulence\" with no text of its own",
    347: "carries the heading \"Clear Air Turbulence\" and nothing else — a video point. Clear air turbulence is taught from the slides either side of it",
    348: "blank slide: no title, no text, no diagram",
    350: "carries the heading \"Wake Turbulence\" and nothing else — a video point. Wake turbulence is taught from the slides either side of it",
    352: "blank slide: no title, no text, no diagram",
    360: "section divider: the heading \"Hazardous Meteorological Conditions\" with no text of its own",
    363: "carries the heading \"Flying Through Ash Cloud\" and nothing else — a video point. The effects of flying through ash are taught from the slides around it",
    379: "section divider: the heading \"General Circulation\" with no text of its own",
    381: "blank slide: no title, no text, no diagram",
    387: "blank slide: no title, no text, no diagram",
    388: "carries the heading \"Jetstream's\" and nothing else — a video point. The jet streams are taught in the general circulation topic",
    393: "blank slide: no title, no text, no diagram",
    394: "section divider: the heading \"Tropical Meteorology\" with no text of its own",
    404: "carries the heading \"ITCZ\" and nothing else — a video point. The ITCZ is taught across the eleven slides that follow it",
    434: "blank slide: no title, no text, no diagram",
    446: "blank slide: no title, no text, no diagram",
    454: "section divider: the heading \"New Zealand Climatology\" with no text of its own",
    464: "section divider: the heading \"Meteorological Services, Reports And Forecasts\" with no text of its own",
    500: "blank slide: no title, no text, no diagram",
    536: "a version stamp naming the individual who last revised the deck and the syllabus revision it was written to. Attribution to a third party, and not teaching content",
  },

  chapters: [
    {
      title: "Reading a Weather Map",
      syllabus: ["20.4"],
      intro:
        "What the two kinds of chart are for, how systems move across New " +
        "Zealand, and the single index that predicts most of the country's " +
        "weather most of the time.",
      topics: [
        {
          title: "Analysis and Prognosis",
          pages: [3],
          intro:
            "Two charts that look similar and answer different questions — one " +
            "about now, one about later.",
        },
        {
          title: "Subsidence and the Movement of Pressure Systems",
          pages: [4, 5],
          intro:
            "Where the sub-tropical highs come from, and the direction systems " +
            "travel in the mid latitudes.",
        },
        {
          title: "The Westerly Index",
          pages: [6, 7, 8, 9, 10, 11],
          intro:
            "A single measure of how readily the westerlies cross the country, " +
            "and the two situations it distinguishes.",
          context:
            "The index is worth understanding rather than memorising, because it " +
            "is a shorthand for the whole synoptic picture. High index means the " +
            "highs sit north and the lows south, and the westerlies run straight " +
            "across; low index means the pattern has broken down into something " +
            "much less predictable.",
        },
        {
          title: "Weather in a High Westerly Index",
          pages: [12, 13, 14, 15, 16, 17],
          intro:
            "The situation that exists most of the time, and the sequence of " +
            "wind and weather that comes with it.",
          takeaway:
            "This is the ordinary New Zealand pattern: north-west ahead of a " +
            "front, a change as it passes, then south-west behind. Learn the " +
            "sequence and most days make sense before you have read a forecast.",
        },
        {
          title: "Weather in a Low Westerly Index",
          pages: [18, 19, 20],
          intro:
            "The rarer situation, and why it produces the weather that causes " +
            "trouble.",
        },
      ],
    },

    {
      title: "The Structure of the Atmosphere",
      syllabus: ["20.6"],
      intro:
        "The layers above the troposphere, and the two things suspended in the " +
        "air that make weather possible at all.",
      topics: [
        {
          title: "The Mesosphere and Thermosphere",
          pages: [21, 22, 23],
          intro:
            "The layers above the stratosphere, and where the homosphere ends.",
        },
        {
          title: "Tropopause Heights",
          pages: [24],
          intro:
            "How high the tropopause is at different latitudes, and why it is not " +
            "the same everywhere.",
          context:
            "The tropopause is a lid on the weather, and it sits highest where " +
            "the air is being heated hardest. That is why it is far higher over " +
            "the equator than over the poles, and why tropical convection can " +
            "reach heights temperate convection never does.",
        },
        {
          title: "Aerosols",
          pages: [25, 26, 27, 28],
          intro:
            "Where the particles in the air come from, the two kinds that matter, " +
            "and what they do.",
          takeaway:
            "Without aerosols there would be no cloud. Water vapour needs " +
            "something to condense onto, and the surface of the Earth supplies " +
            "it — which is why the cleanest air is also the air least willing to " +
            "form cloud.",
        },
        {
          title: "How Water Vapour and Aerosols Vary with Height",
          pages: [29, 30, 31],
          intro:
            "Why almost all the atmosphere's moisture is in the lowest part of " +
            "it, and how that varies from the equator to the poles.",
        },
      ],
    },

    {
      title: "Atmospheric Pressure and Altimetry",
      syllabus: ["20.10"],
      intro:
        "Barometric tendency, and the altimeter setting procedures that follow " +
        "from pressure not being the same everywhere. Air Law states the same " +
        "rules; here the interest is in the meteorology underneath them.",
      topics: [
        {
          title: "Barometric Tendency",
          pages: [36],
          intro:
            "The character and amount of pressure change over a period, and what " +
            "it tells you.",
        },
        {
          title: "Flight Levels and Altimeter Setting Procedures",
          pages: [37, 38, 39, 40, 41],
          intro:
            "The basic setting procedure, and the requirements within the New " +
            "Zealand FIR.",
        },
        {
          title: "The Transition Layer and QNH Settings",
          pages: [42, 43],
          intro:
            "How the transition layer changes with the area QNH, and the vertical " +
            "position requirements in controlled airspace.",
          context:
            "The layer's depth is not fixed, and the reason is meteorological " +
            "rather than legal: the transition altitude is a height above sea " +
            "level and the transition level is a pressure surface, so the gap " +
            "between them opens and closes as the QNH moves.",
        },
      ],
    },

    {
      title: "Heat Transfer and Surface Heating",
      syllabus: ["20.8"],
      intro:
        "How the atmosphere is heated. Almost none of it comes directly from " +
        "the sun — the surface absorbs the energy and then gives it to the air, " +
        "which is why the properties of the surface matter so much.",
      topics: [
        {
          title: "Advection and Convection",
          pages: [45, 46],
          intro:
            "Two ways heat moves horizontally and vertically, and the difference " +
            "between them.",
          misconception:
            "Treating advection as a kind of convection. They are distinguished " +
            "by what drives the movement: convection is powered by density " +
            "differences, advection is the horizontal movement of air carrying its " +
            "heat with it — the air was going to move anyway.",
        },
        {
          title: "Specific Heat",
          pages: [47],
          intro:
            "The quantity that decides how much a surface warms for a given " +
            "amount of energy.",
        },
        {
          title: "Albedo",
          pages: [48, 49],
          intro:
            "How much of the sun's energy a surface reflects rather than absorbs, " +
            "and what follows for its temperature.",
        },
        {
          title: "Heating of the Earth's Surface",
          pages: [50, 51, 52, 53],
          intro:
            "Specific heat and albedo working together, and why water moderates " +
            "temperature so strongly.",
          context:
            "Two properties of water do the same job from different directions. " +
            "Its high specific heat means it warms and cools slowly; evaporating " +
            "it consumes energy that would otherwise have raised a temperature. " +
            "Together they are why a coastal aerodrome and an inland one at the " +
            "same latitude behave quite differently.",
        },
        {
          title: "Measurement of Surface Air Temperature",
          pages: [54],
          intro:
            "Where the temperature that appears in a report is actually measured, " +
            "and why the height is specified.",
        },
      ],
    },

    {
      title: "Pressure, Density and What Changes Them",
      syllabus: ["20.10"],
      intro:
        "Four variables — pressure, temperature, altitude and moisture — and " +
        "what each does to density. Every performance problem in aviation comes " +
        "back to this chapter.",
      topics: [
        {
          title: "Pressure and Density",
          pages: [55, 56, 57],
          intro:
            "Partial pressure, and what air density actually is.",
        },
        {
          title: "The Effect of Pressure and Temperature",
          pages: [58, 59, 60, 61, 62],
          intro:
            "The two variables that move density in opposite directions, and the " +
            "summary the deck draws from them.",
          keyPoints: [
            "At the same temperature, the higher pressure has the higher density.",
            "At the same pressure, the lower temperature has the higher density.",
          ],
        },
        {
          title: "The Effect of Altitude and Moisture",
          pages: [63, 64, 65],
          intro:
            "Why density falls with height, and the one that surprises people — " +
            "what water vapour does to it.",
          misconception:
            "Assuming humid air is heavier. It is not: a water molecule is lighter " +
            "than the nitrogen or oxygen molecule it displaces, so moist air is " +
            "<em>less</em> dense than dry air at the same pressure and " +
            "temperature. A hot, humid day is the worst combination for " +
            "performance, not just a hot one.",
        },
        {
          title: "Density Altitude",
          pages: [66, 67],
          intro:
            "The single number that expresses how the air is performing, and how " +
            "it is calculated.",
          takeaway:
            "Density altitude is the altitude the aeroplane thinks it is at. Its " +
            "value is that it converts pressure, temperature and humidity into " +
            "one figure you can take straight into a performance chart.",
        },
        {
          title: "Worked Density Altitude Calculations",
          pages: [68, 69, 70, 71, 72, 73],
          intro:
            "The method applied to a worked example, then to three more for " +
            "practice with the answers that follow.",
        },
      ],
    },

    {
      title: "Localised Low Pressure",
      syllabus: ["20.10", "20.14"],
      intro:
        "Three ways a local area of low pressure forms without a synoptic " +
        "system being responsible, and the daily pressure cycle underneath all " +
        "of them.",
      topics: [
        {
          title: "Lee Side Troughs",
          pages: [74, 75, 76, 77],
          intro:
            "The depression that forms downwind of high ground in a strong " +
            "westerly.",
        },
        {
          title: "Thermal Lows and Thunderstorms",
          pages: [78, 79],
          intro:
            "Low pressure produced by heating, and the very local pressure " +
            "changes a thunderstorm creates.",
        },
        {
          title: "Diurnal Pressure Variation",
          pages: [80],
          intro:
            "The twice-daily cycle in atmospheric pressure.",
        },
      ],
    },

    {
      title: "The Wind and the Friction Layer",
      syllabus: ["20.12"],
      intro:
        "Why wind blows along the isobars rather than across them, and what " +
        "changes once the surface starts to interfere.",
      topics: [
        {
          title: "Geostrophic and Gradient Wind",
          pages: [82, 83, 84],
          intro:
            "The balance between the pressure gradient and the Coriolis force, " +
            "and what happens when the isobars are curved.",
          context:
            "Start from what the pressure gradient wants to do: push air straight " +
            "from high to low. The Coriolis force turns that flow until the two " +
            "balance, and the result is air moving <em>along</em> the isobars " +
            "instead of across them. Curved isobars add centripetal force to the " +
            "balance, which is the difference between the geostrophic and the " +
            "gradient wind.",
        },
        {
          title: "The Coriolis Force",
          pages: [86],
          intro:
            "What the magnitude of the force depends on.",
        },
        {
          title: "Frictional Forces and the Friction Layer",
          pages: [87, 88, 89],
          intro:
            "What the surface does to the wind, and how a deep friction layer " +
            "changes the surface wind relative to the gradient wind.",
          takeaway:
            "Friction slows the wind, and slowing it weakens the Coriolis force, " +
            "which lets the pressure gradient turn the flow back towards the low. " +
            "That is why the surface wind is both weaker than the gradient wind " +
            "and backed from it — and why the difference is larger over rough " +
            "ground than over the sea.",
        },
      ],
    },

    {
      title: "Windshear",
      syllabus: ["20.42"],
      intro:
        "A change in wind over a short distance. Whether it is dangerous " +
        "depends on how large the change is and how quickly you fly through it.",
      topics: [
        {
          title: "Vertical and Horizontal Windshear",
          pages: [90, 91, 92, 93],
          intro:
            "The two orientations, and what determines the severity of each.",
        },
        {
          title: "Positive and Negative Windshear",
          pages: [94, 95, 96, 97],
          intro:
            "The two directions the shear can act in on approach, and why one is " +
            "far more dangerous than the other.",
          context:
            "Positive shear increases the airspeed and gives you margin. Negative " +
            "shear takes airspeed away at the moment you have least height to " +
            "trade for it, and the aeroplane is already slow and configured. That " +
            "asymmetry — not the size of the shear — is what makes the negative " +
            "case the one that kills.",
        },
      ],
    },

    {
      title: "Atmospheric Moisture",
      syllabus: ["20.16"],
      intro:
        "How water moves between its three states in the atmosphere, and the " +
        "measures used to describe how much of it is present.",
      topics: [
        {
          title: "Condensation and Evaporation",
          pages: [99, 100, 101, 102, 103],
          intro:
            "The two changes of state that matter most, and what governs the rate " +
            "of each.",
        },
        {
          title: "Deposition and Sublimation",
          pages: [104, 105, 106],
          intro:
            "The two changes that skip the liquid stage entirely.",
        },
        {
          title: "Saturation Vapour Pressure",
          pages: [107, 108, 109],
          intro:
            "Partial pressure applied to water vapour, and the temperature at " +
            "which water is at its densest.",
        },
        {
          title: "Absolute Humidity, Mixing Ratio and Relative Humidity",
          pages: [110, 111, 112, 113, 114],
          intro:
            "Three ways to state how much moisture the air holds, and why the " +
            "third one behaves differently from the other two.",
          misconception:
            "Reading relative humidity as an amount of water. It is a ratio, and " +
            "temperature is in the denominator — so cooling air overnight can take " +
            "the relative humidity from comfortable to saturated without a single " +
            "extra gram of water entering it.",
        },
        {
          title: "Dew Point",
          pages: [115, 116],
          intro:
            "The temperature at which the air becomes saturated, and what moves " +
            "it.",
          takeaway:
            "The gap between temperature and dew point is the single most useful " +
            "number in an aerodrome report. A small and closing gap means cloud, " +
            "fog or both, and it closes fastest in the hours before dawn.",
        },
      ],
    },

    {
      title: "Stability and Lapse Rates",
      syllabus: ["20.18"],
      intro:
        "Whether a parcel of air that is displaced upwards keeps going or comes " +
        "back. The answer decides what kind of cloud forms, whether there is " +
        "turbulence, and whether a thunderstorm is possible.",
      topics: [
        {
          title: "Stable, Unstable and Neutrally Stable Air",
          pages: [118, 119, 120, 121],
          intro:
            "Three behaviours, defined by what a parcel does after it has been " +
            "disturbed.",
        },
        {
          title: "The Environmental Lapse Rate",
          pages: [122, 123],
          intro:
            "The temperature profile of the air actually present, and how it " +
            "varies.",
        },
        {
          title: "The Adiabatic Lapse Rate",
          pages: [124],
          intro:
            "What happens to a parcel's temperature when it rises without " +
            "exchanging heat with its surroundings.",
          context:
            "Adiabatic means no heat crosses the boundary of the parcel. It cools " +
            "as it rises anyway, because it expands into lower pressure and " +
            "expansion costs energy. That is the whole mechanism, and it is why " +
            "the parcel's temperature is predictable while the environment's is " +
            "not.",
        },
        {
          title: "Rising Dry Air",
          pages: [125, 126, 127, 128, 129, 130],
          intro:
            "The dry adiabatic lapse rate compared against the environmental " +
            "lapse rate, in both directions, with the graphs the deck uses.",
        },
        {
          title: "Rising Saturated Air",
          pages: [131, 132, 133, 134, 135, 136, 137],
          intro:
            "What changes once condensation begins, and why the saturated rate is " +
            "the lower of the two.",
          takeaway:
            "Condensation releases latent heat into the parcel, which slows its " +
            "cooling. A saturated parcel therefore stays warmer than a dry one " +
            "over the same climb — which is why saturated air is more readily " +
            "unstable, and why cloud, once started, tends to keep building.",
        },
        {
          title: "Combining Dry and Saturated Air",
          pages: [138, 139, 140],
          intro:
            "A parcel that begins dry and becomes saturated part way up, which is " +
            "what actually happens.",
        },
      ],
    },

    {
      title: "Condensation Levels and Convective Stability",
      syllabus: ["20.18"],
      intro:
        "The height at which cloud forms, arrived at two different ways " +
        "depending on what lifted the air.",
      topics: [
        {
          title: "The Rising Condensation Level",
          pages: [141, 142, 143, 144],
          intro:
            "Where cloud base sits when the air has been lifted mechanically.",
        },
        {
          title: "The Convective Condensation Level",
          pages: [145, 146, 147],
          intro:
            "Where cloud base sits when the air has risen because the surface " +
            "heated it.",
        },
        {
          title: "Required Surface Temperature for the CCL",
          pages: [148, 149],
          intro:
            "Working backwards: how warm the surface must become before " +
            "convective cloud will form.",
        },
        {
          title: "Convective Stability and Diurnal Variation",
          pages: [150, 151],
          intro:
            "How the stability of a layer changes when the whole layer is lifted, " +
            "and how it changes through the day.",
          context:
            "Stability is not a fixed property of an air mass. The same air is " +
            "typically most stable near dawn and least stable in the middle of the " +
            "afternoon, which is why a route that was smooth in the morning is " +
            "rough on the way home.",
        },
      ],
    },

    {
      title: "Sea, Land and Slope Winds",
      syllabus: ["20.14"],
      intro:
        "Local winds driven by differential heating rather than by the synoptic " +
        "pressure pattern. They are predictable, which makes them plannable.",
      topics: [
        {
          title: "The Sea Breeze",
          pages: [153, 154, 155, 156, 157, 158, 159],
          intro:
            "How it forms, when it starts, and the factors that decide its " +
            "strength and penetration.",
          context:
            "Everything about the sea breeze follows from water's high specific " +
            "heat: the land warms quickly, the sea does not, and the pressure " +
            "difference that opens between them drives air inland. That is also " +
            "why it takes until mid-morning to establish and dies in the evening.",
        },
        {
          title: "The Pseudo Sea Breeze and the Land Breeze",
          pages: [160, 161],
          intro:
            "A sea breeze that is not one, and the weaker overnight reversal.",
        },
        {
          title: "Katabatic and Anabatic Winds",
          pages: [162, 163, 164],
          intro:
            "Air draining down a slope and climbing up it, and the conditions " +
            "each needs.",
          takeaway:
            "Katabatic flow is the one to respect. Cold dense air draining down a " +
            "valley at night can be strong, is often shallow, and arrives at " +
            "exactly the sort of strip where you have least room to deal with it.",
        },
        {
          title: "Gusts and Squalls",
          pages: [165],
          intro:
            "The distinction between them, which is a matter of duration.",
        },
      ],
    },

    {
      title: "Föhn Winds and Mountain Waves",
      syllabus: ["20.14", "20.40"],
      intro:
        "What happens to an airstream forced over a mountain range. In New " +
        "Zealand this is not an exotic case — it is the ordinary consequence of " +
        "a westerly meeting the Southern Alps.",
      topics: [
        {
          title: "The Föhn Effect",
          pages: [166, 167, 168, 169, 170, 171, 172],
          intro:
            "Why air arriving on the lee side is warmer and drier than the air " +
            "that started up the windward slope.",
          context:
            "The mechanism is the two lapse rates from the stability chapter. " +
            "Going up, the air cools at the saturated rate once cloud forms and " +
            "loses its moisture as rain; coming down, with nothing left to " +
            "evaporate, it warms at the faster dry rate. It arrives lower down " +
            "warmer than it left — and that is the whole of the Föhn.",
        },
        {
          title: "Interference to Wind Flow",
          pages: [173],
          intro:
            "Small scale obstacles and what they do to the airflow.",
        },
        {
          title: "Mountain Waves",
          pages: [174, 175, 176, 177, 178],
          intro:
            "The standing wave that forms downwind of a range, and the two " +
            "measurements that describe it.",
        },
        {
          title: "Rotor Zones and Rotor Cloud",
          pages: [179, 181],
          intro:
            "The turbulent circulation beneath the wave crests, and the cloud " +
            "that marks it.",
          misconception:
            "Treating the wave itself as the hazard. The wave is usually smooth — " +
            "gliders use it. The danger is the rotor underneath it, which is " +
            "violently turbulent and sits at exactly the height a light aircraft " +
            "would choose to cross the range at.",
        },
        {
          title: "Dissipation, Rotor Streaming and Lee Troughs",
          pages: [182, 183, 184],
          intro:
            "What ends a mountain wave, and two related lee-side phenomena.",
        },
      ],
    },

    {
      title: "Inversions",
      syllabus: ["20.18"],
      intro:
        "A layer in which temperature rises with height instead of falling. " +
        "Inversions are lids: they stop vertical motion, and everything that " +
        "would have risen collects underneath them.",
      topics: [
        {
          title: "Inversions and Weather",
          pages: [186, 187],
          intro:
            "What an inversion does to the air below it.",
        },
        {
          title: "Radiation and Turbulence Inversions",
          pages: [188, 189, 190, 191, 192, 193],
          intro:
            "Two ways an inversion forms near the surface — one by the ground " +
            "cooling, one by mixing.",
        },
        {
          title: "Subsidence and Frontal Inversions",
          pages: [194, 195, 196, 197],
          intro:
            "Two ways an inversion forms aloft — one by air sinking and warming, " +
            "one by warm air overrunning cold.",
          takeaway:
            "Whatever forms it, the consequence is the same: smooth air above, " +
            "poor visibility and trapped moisture below, and a sharp change in " +
            "wind as you pass through. The last of those is why an inversion is " +
            "also a windshear.",
        },
      ],
    },

    {
      title: "Cloud Formation and Classification",
      syllabus: ["20.22"],
      intro:
        "Cloud is condensation made visible. This chapter is how it forms, how " +
        "it is named, and what each type tells you about the air it formed in.",
      topics: [
        {
          title: "Rising Air and Evaporation of Droplets",
          pages: [199, 200, 201],
          intro:
            "A recap of what lifts air, and what makes cloud disappear again.",
        },
        {
          title: "Cloud Classification",
          pages: [202, 203],
          intro:
            "How cloud is named, by height and by form.",
          context:
            "The naming system is descriptive rather than arbitrary. Once you know " +
            "that <em>cirro-</em> means high, <em>alto-</em> means middle, " +
            "<em>strato-</em> means layered and <em>cumulo-</em> means heaped, " +
            "almost every cloud name in the deck decodes itself — and the name " +
            "then tells you whether the air was stable or unstable.",
        },
        {
          title: "Cloud Characteristics",
          pages: [204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217],
          intro:
            "Each of the main cloud types in turn, with the deck's photographs.",
        },
        {
          title: "Cloud Types Worth Recognising",
          pages: [218, 219, 220, 222, 223, 224, 225],
          intro:
            "Seven less common types that each carry a specific message about the " +
            "air — asperitas, mammatus, lenticular, rotor, Kelvin-Helmholtz, " +
            "castellanus and banner cloud.",
          takeaway:
            "These are the clouds worth learning as warnings rather than as " +
            "names. Lenticular and rotor cloud mean mountain wave; castellanus " +
            "means instability aloft and thunderstorms later; Kelvin-Helmholtz " +
            "means shear you are about to fly through.",
        },
        {
          title: "Cloud Dispersal",
          pages: [226],
          intro:
            "What makes cloud clear away.",
        },
      ],
    },

    {
      title: "Precipitation",
      syllabus: ["20.24"],
      intro:
        "How cloud droplets become large enough to fall, and the forms " +
        "precipitation takes.",
      topics: [
        {
          title: "Precipitation and Coalescence",
          pages: [228, 229, 230, 231, 232],
          intro:
            "The process by which small droplets combine into drops heavy enough " +
            "to reach the ground.",
        },
      ],
    },

    {
      title: "Visibility",
      syllabus: ["20.26"],
      intro:
        "What visibility means, the different ways it is measured, and why the " +
        "figure you are given may not be the one you will experience.",
      topics: [
        {
          title: "Visibility Range",
          pages: [234, 235],
          intro:
            "How visibility is defined and reported.",
        },
        {
          title: "Slant Range and Runway Visual Range",
          pages: [236, 237],
          intro:
            "Two measurements that differ from horizontal visibility, and the one " +
            "that matters on approach.",
          misconception:
            "Assuming a reported visibility applies looking down. It does not — " +
            "slant visibility through a layer of haze or a thin cloud deck can be " +
            "far worse than the horizontal figure, and the approach is flown at a " +
            "slant.",
        },
        {
          title: "Altitude, Sensors and the Forward Scatter Meter",
          pages: [238, 239, 240, 241],
          intro:
            "How visibility changes with height, and the instruments that measure " +
            "it automatically.",
        },
      ],
    },

    {
      title: "Fog",
      syllabus: ["20.26"],
      intro:
        "Cloud at the surface. The deck presents this mainly in diagrams; the " +
        "mechanisms are the condensation processes already covered, operating " +
        "where the aircraft has to land.",
      topics: [
        {
          title: "How Fog Forms and Clears",
          pages: [243, 244],
          intro:
            "The forms fog takes and the conditions each needs.",
          context:
            "Every type of fog is the same event — air cooled to its dew point " +
            "at ground level — reached by a different route. Radiation fog cools " +
            "the air from below overnight; advection fog moves warm moist air over " +
            "a cold surface. Knowing which one you are dealing with tells you when " +
            "it will clear.",
        },
      ],
    },

    {
      title: "Airframe Icing",
      syllabus: ["20.28"],
      intro:
        "Ice forming on the aircraft in flight: what kind, in what conditions, " +
        "and what makes it worse.",
      topics: [
        {
          title: "Types of Ice",
          pages: [246, 247, 248, 249, 250, 251],
          intro:
            "Rime, clear and mixed ice, and the conditions that produce each.",
          context:
            "The distinction comes down to how quickly the droplet freezes. Small " +
            "droplets freeze on contact and trap air, giving opaque rime; large " +
            "droplets spread before freezing, giving clear ice that is heavier, " +
            "harder to remove and follows the aerofoil shape less forgivingly.",
        },
        {
          title: "Icing in Cloud and Droplet Size",
          pages: [252, 253, 254],
          intro:
            "What decides the severity of icing within cloud.",
        },
        {
          title: "The Freezing Level",
          pages: [255, 256, 257],
          intro:
            "Where it is, how it is reported, and why there can be more than one.",
        },
        {
          title: "What Makes Icing Worse",
          pages: [258, 259, 260, 261],
          intro:
            "Fronts, freezing rain, terrain and season — four factors that " +
            "intensify icing.",
          takeaway:
            "Freezing rain is the one to treat as a stop condition. It means " +
            "there is warmer air above you, the droplets are large, and the " +
            "accretion rate can exceed anything a light aircraft can shed. The " +
            "answer is to change altitude — usually to climb into the warm layer " +
            "the rain fell from.",
        },
        {
          title: "De-Icing and Anti-Icing",
          pages: [262, 264, 265],
          intro:
            "The distinction between removing ice and preventing it, and the " +
            "methods used for each.",
        },
        {
          title: "Carburettor and Intake Icing",
          pages: [266, 267, 268, 269],
          intro:
            "Ice forming in the induction system rather than on the airframe, and " +
            "why it can happen on a warm day.",
          misconception:
            "Expecting carburettor icing only when it is cold. The temperature " +
            "drop through the venturi and from fuel vaporising is large, so the " +
            "most likely conditions are warm and humid rather than freezing — " +
            "which is exactly when a pilot is least likely to be thinking about " +
            "ice.",
        },
        {
          title: "Classification of Icing",
          pages: [270],
          intro:
            "The severity categories used in reports and forecasts.",
        },
      ],
    },

    {
      title: "Thunderstorms: Formation and Types",
      syllabus: ["20.30"],
      intro:
        "What a thunderstorm needs in order to exist, the situations that " +
        "supply those conditions, and how a cell develops and dies.",
      topics: [
        {
          title: "Thunderstorm Requirements",
          pages: [273],
          intro:
            "The three conditions that must all be present.",
          takeaway:
            "Unstable air, moisture and a trigger to lift it. All three are " +
            "necessary — which is why a forecast can be humid and unstable and " +
            "still produce nothing until something arrives to start the lifting.",
        },
        {
          title: "Types of Thunderstorm",
          pages: [274, 275, 276, 277, 278, 279, 280],
          intro:
            "Seven situations that supply the trigger, from local convection to " +
            "an embedded warm front.",
          context:
            "The types are worth knowing because they behave differently in the " +
            "air. A localised convective cell can be seen and avoided; one " +
            "embedded in a frontal cloud mass cannot be seen at all, which is the " +
            "reason the distinction is drawn.",
        },
        {
          title: "Stages of a Thunderstorm",
          pages: [281, 282, 283],
          intro:
            "Developing, mature and dissipating — and what is happening inside " +
            "the cell at each.",
        },
        {
          title: "Regeneration and Multi-Cell Storms",
          pages: [284, 285],
          intro:
            "Why one storm can produce the next, and what makes a system last far " +
            "longer than a single cell.",
        },
      ],
    },

    {
      title: "Thunderstorm Hazards",
      syllabus: ["20.30", "20.42"],
      intro:
        "Every hazard aviation meteorology deals with is present in a " +
        "thunderstorm at the same time. This chapter is each of them in turn.",
      topics: [
        {
          title: "The Hazards in Summary",
          pages: [286],
          intro:
            "What a thunderstorm contains, listed before each is taken in turn.",
        },
        {
          title: "Icing",
          pages: [287],
          intro:
            "Why icing in a thunderstorm is worse than icing elsewhere.",
        },
        {
          title: "Microbursts",
          pages: [288, 289, 290, 291, 292],
          intro:
            "The concentrated downdraught and the wind pattern it produces at the " +
            "surface.",
          context:
            "A microburst is dangerous because of the sequence rather than the " +
            "strength. An aircraft flying through one meets an increasing " +
            "headwind first, which raises the airspeed and looks like " +
            "performance, then the downdraught, then a tailwind — and by the time " +
            "the airspeed is falling the height available to recover has already " +
            "been given away.",
        },
        {
          title: "The Gust Front",
          pages: [294, 295],
          intro:
            "The outflow boundary ahead of the storm, and how far ahead of it the " +
            "hazard extends.",
        },
        {
          title: "Electrical Phenomena",
          pages: [296],
          intro:
            "Lightning and the associated effects on the aircraft.",
        },
        {
          title: "Tornadoes",
          pages: [297],
          intro:
            "The most violent product of a thunderstorm.",
        },
        {
          title: "Hail",
          pages: [300, 301, 302, 303, 304],
          intro:
            "How hail forms, what it does to an aircraft, and where it can be " +
            "encountered.",
          takeaway:
            "Hail can be thrown out of the side of a storm and met in clear air " +
            "some distance from the cloud. Clearing the visible cloud is not the " +
            "same as clearing the storm.",
        },
        {
          title: "Poor Visibility and Weather Radar",
          pages: [305, 306, 307],
          intro:
            "Visibility within the storm, and what radar can and cannot show you " +
            "about it.",
        },
      ],
    },

    {
      title: "Anticyclones",
      syllabus: ["20.34"],
      intro:
        "High pressure. Usually the good weather, and carrying two hazards that " +
        "exist precisely because the air is sinking and going nowhere.",
      topics: [
        {
          title: "Formation of Anticyclones",
          pages: [309, 310, 311, 312],
          intro:
            "How an area of high pressure forms and what the air within it is " +
            "doing.",
        },
        {
          title: "Cold Highs",
          pages: [313, 314],
          intro:
            "The high that forms from cooling rather than from subsidence, and " +
            "how it differs.",
        },
        {
          title: "Hazards of Anticyclones",
          pages: [315, 316, 317],
          intro:
            "What goes wrong in settled weather.",
          context:
            "The subsidence inversion is the link back to an earlier chapter. " +
            "Sinking air warms and caps the layer below, so moisture, haze and " +
            "pollution accumulate underneath it with nowhere to go — which is why " +
            "a long anticyclonic spell ends with poor visibility and fog rather " +
            "than with clear skies.",
        },
      ],
    },

    {
      title: "Depressions",
      syllabus: ["20.36"],
      intro:
        "Low pressure in its several forms, from the mid-latitude systems that " +
        "cross New Zealand to the local depressions produced by terrain.",
      topics: [
        {
          title: "Mid-Latitude and Sub-Tropical Depressions",
          pages: [319, 320],
          intro:
            "The two synoptic-scale lows that affect the country.",
        },
        {
          title: "Tropical Cyclones as Depressions",
          pages: [321, 322, 323],
          intro:
            "The most intense form, introduced here and treated fully in the " +
            "tropical meteorology chapter.",
        },
        {
          title: "Lee Side and Thermal Depressions",
          pages: [324, 325, 326],
          intro:
            "Local lows produced by terrain and by heating.",
        },
        {
          title: "Mountain Depressions",
          pages: [327],
          intro:
            "Low pressure associated with mountainous terrain.",
        },
      ],
    },

    {
      title: "Air Masses and Fronts",
      syllabus: ["20.36"],
      intro:
        "A front is the boundary between two air masses with different " +
        "properties. Everything a front does follows from which air mass is " +
        "displacing which.",
      topics: [
        {
          title: "Air Mass Categories",
          pages: [328],
          intro:
            "How air masses are classified, by where they formed.",
        },
        {
          title: "Cold and Warm Advection",
          pages: [329, 330],
          intro:
            "Air of one temperature moving into a region of another, and what " +
            "each does to the stability there.",
        },
        {
          title: "Fronts",
          pages: [331],
          intro:
            "What a front is, and why the boundary slopes.",
        },
        {
          title: "The Cold Front",
          pages: [332, 333, 334],
          intro:
            "Cold air undercutting warm, and the weather sequence that produces.",
          context:
            "The cold front's steep slope is what makes its weather violent and " +
            "brief. Dense cold air undercuts the warm air sharply, forcing it up " +
            "quickly over a short distance — so the cloud is convective, the " +
            "rain heavy and the whole passage over in a fraction of the time a " +
            "warm front takes.",
        },
        {
          title: "The Warm Front",
          pages: [335, 336, 337, 338],
          intro:
            "Warm air overrunning cold, and the much longer sequence that " +
            "precedes it.",
        },
      ],
    },

    {
      title: "Turbulence",
      syllabus: ["20.40"],
      intro:
        "Four causes, each producing turbulence with a different character and " +
        "a different avoidance strategy.",
      topics: [
        {
          title: "Convective and Mechanical Turbulence",
          pages: [341, 342, 343],
          intro:
            "Turbulence caused by thermals, and turbulence caused by the surface " +
            "disturbing the airflow.",
        },
        {
          title: "Clear Air Turbulence",
          pages: [344, 345, 346],
          intro:
            "Turbulence with no cloud to warn you of it, and where it is found.",
          takeaway:
            "Clear air turbulence lives near the jet stream and near the " +
            "tropopause, where the vertical wind shear is greatest. It cannot be " +
            "seen and does not show on radar, so it is avoided by forecast and by " +
            "changing level rather than by looking.",
        },
        {
          title: "Wake Turbulence",
          pages: [349, 351, 353],
          intro:
            "Turbulence generated by another aircraft, the factors that make it " +
            "worse, and how to avoid it.",
          context:
            "Wake vortices are strongest when the generating aircraft is heavy, " +
            "slow and clean — which is precisely its configuration just after " +
            "take-off and just before landing, the two places you are most likely " +
            "to be behind it.",
        },
        {
          title: "Factors Enhancing Turbulence",
          pages: [354, 355, 356, 357],
          intro:
            "Stability, surface roughness, wind speed and vertical shear.",
        },
        {
          title: "Low Level Windshear",
          pages: [358, 359],
          intro:
            "Shear near the ground, and how it is avoided.",
        },
      ],
    },

    {
      title: "Volcanic Ash",
      syllabus: ["20.42"],
      intro:
        "A hazard specific to this part of the world, and one that is invisible " +
        "on radar and at night.",
      topics: [
        {
          title: "Ash Clouds and How Far They Travel",
          pages: [361, 362],
          intro:
            "What it is, how far it travels and why it is so damaging.",
        },
        {
          title: "Effects on the Aircraft",
          pages: [364, 365],
          intro:
            "Compressor blade damage and the other effects of flight through ash.",
          takeaway:
            "Ash is fine, hard and abrasive, and it melts in the hot section of a " +
            "turbine and re-solidifies on the cooler blades behind it. That is why " +
            "the damage is not gradual wear but a flameout — and why the response " +
            "is to reduce power and turn back rather than to press on.",
        },
        {
          title: "Eruption Notifications",
          pages: [366, 367],
          intro:
            "How the existence of ash is promulgated.",
        },
        {
          title: "Ash on the Runway",
          pages: [368, 369],
          intro:
            "The effect of ash contamination on the ground.",
        },
      ],
    },

    {
      title: "Dust Storms, Blizzards and Whiteout",
      syllabus: ["20.42"],
      intro:
        "Three conditions in which visibility is destroyed by something other " +
        "than cloud or fog.",
      topics: [
        {
          title: "Dust Storms",
          pages: [370, 371, 372],
          intro:
            "How they form and what they do to visibility.",
        },
        {
          title: "Blizzards",
          pages: [373],
          intro:
            "The defining conditions.",
        },
        {
          title: "Whiteout",
          pages: [374, 375, 376, 377],
          intro:
            "The loss of visual reference over snow, and why it is so " +
            "disorienting.",
          context:
            "Whiteout is not a visibility problem in the ordinary sense — the air " +
            "can be perfectly clear. It is the loss of contrast and of the " +
            "horizon, so there is nothing for the eye to fix on. The instruments " +
            "still work, and they are the answer.",
        },
        {
          title: "Blizzard Compared with Whiteout",
          pages: [378],
          intro:
            "The distinction between the two.",
        },
      ],
    },

    {
      title: "The General Circulation",
      syllabus: ["20.46"],
      intro:
        "The global pattern the local weather sits inside: three cells per " +
        "hemisphere, the jet streams at their boundaries, and the index that " +
        "describes how strongly the pattern is running.",
      topics: [
        {
          title: "The Three-Cell Pattern",
          pages: [380, 382, 383, 384, 385, 386],
          intro:
            "What drives the global pattern and the cells it organises itself " +
            "into.",
          context:
            "The whole pattern exists because the equator receives more energy " +
            "than the poles and the atmosphere is redistributing it. A single " +
            "overturning cell per hemisphere would do the job if the Earth did " +
            "not rotate; rotation breaks it into three, and the boundaries between " +
            "them are where the jet streams and the weather live.",
        },
        {
          title: "The Zonal Index and Blocking Anticyclones",
          pages: [389, 390, 391, 392],
          intro:
            "How strongly the westerly flow is running, and what happens when a " +
            "high stalls in its path.",
        },
      ],
    },

    {
      title: "The Tropics and the Hadley Cell",
      syllabus: ["20.48"],
      intro:
        "The circulation of the tropics, which supplies the air that eventually " +
        "reaches New Zealand and produces the systems that occasionally arrive " +
        "here intact.",
      topics: [
        {
          title: "The Tropics",
          pages: [395],
          intro:
            "What defines the region.",
        },
        {
          title: "The Hadley Cell",
          pages: [396, 397, 398, 399, 400, 401],
          intro:
            "The tropical overturning cell, seen from above and from the side.",
        },
      ],
    },

    {
      title: "The ITCZ and the SPCZ",
      syllabus: ["20.48"],
      intro:
        "Two convergence zones. Where air from both hemispheres meets it has " +
        "nowhere to go but up, and the weather that produces is the most " +
        "vigorous on Earth.",
      topics: [
        {
          title: "The Equatorial Trough and the ITCZ",
          pages: [402, 403],
          intro:
            "What the zone is and where it sits through the year.",
        },
        {
          title: "Weather in the ITCZ: Active and Inactive",
          pages: [405, 406],
          intro:
            "The two states of the zone, and how differently they behave.",
        },
        {
          title: "Icing, Turbulence and Cloud in the ITCZ",
          pages: [407, 408, 409, 410, 411, 412],
          intro:
            "Each hazard in both the active and the inactive state.",
          context:
            "The active/inactive distinction runs through all three hazards for " +
            "the same reason: an active zone has vigorous convection, and icing, " +
            "turbulence and cloud are all products of it. Learn the state and the " +
            "three hazards follow.",
        },
        {
          title: "The South Pacific Convergence Zone",
          pages: [413, 414, 415],
          intro:
            "The zone that matters most to operations in this region, and its " +
            "weather.",
        },
      ],
    },

    {
      title: "Trade Winds and the Monsoon",
      syllabus: ["20.48"],
      intro:
        "The steady flow of the tropics, and the seasonal reversal that " +
        "dominates the region to the north-west.",
      topics: [
        {
          title: "The Trade Winds",
          pages: [416, 417, 418, 419, 420],
          intro:
            "Where they originate, where they blow and why they are so " +
            "consistent.",
        },
        {
          title: "Trade Wind Weather",
          pages: [421, 422, 423],
          intro:
            "The weather within the trades, above them, and their effect at the " +
            "surface.",
        },
        {
          title: "The Monsoon",
          pages: [424, 425, 426],
          intro:
            "What a monsoon is, what causes the seasonal reversal, and the " +
            "Australian case.",
          takeaway:
            "A monsoon is a sea breeze on a continental scale and an annual " +
            "cycle. The land heats far more than the ocean in summer and cools " +
            "far more in winter, and the flow reverses to match — the same " +
            "mechanism as the sea breeze, three chapters back.",
        },
      ],
    },

    {
      title: "Tropical Cyclones",
      syllabus: ["20.48"],
      intro:
        "How they form, where, the stages they pass through, and what they do " +
        "when they reach these latitudes.",
      topics: [
        {
          title: "Formation and Development Areas",
          pages: [427, 428, 429],
          intro:
            "The conditions required and the regions that supply them.",
        },
        {
          title: "Stages of Development",
          pages: [430, 431, 432, 433],
          intro:
            "Formative, immature, mature and decaying.",
        },
        {
          title: "Cyclone Structure and Weather",
          pages: [435, 436, 437],
          intro:
            "The layout of the storm, and the weather in each part of it.",
          context:
            "A tropical cyclone that reaches New Zealand has usually lost its " +
            "warm core and become an ordinary — if very deep — mid-latitude low. " +
            "It is no longer a tropical cyclone by then, but the moisture it " +
            "carries is what produces the rainfall totals.",
        },
      ],
    },

    {
      title: "Walker Circulation and ENSO",
      syllabus: ["20.48"],
      intro:
        "The east–west circulation across the Pacific, and the oscillation that " +
        "reverses it — which is the single largest influence on a New Zealand " +
        "season.",
      topics: [
        {
          title: "The Walker Circulation",
          pages: [438, 439, 440],
          intro:
            "The normal state of the Pacific circulation, in plan and in section.",
        },
        {
          title: "The ENSO Index",
          pages: [441, 442],
          intro:
            "El Niño and La Niña as departures from that normal state.",
        },
        {
          title: "New Zealand Weather Under Each State",
          pages: [443, 444, 445],
          intro:
            "What normal, La Niña and El Niño conditions each mean for this " +
            "country.",
          takeaway:
            "The practical consequence is a change in the prevailing airflow. " +
            "That decides which side of the country gets the rain and which gets " +
            "the Föhn — so the same aerodrome can have a very different season " +
            "depending on which state the Pacific is in.",
        },
      ],
    },

    {
      title: "Streamline Analysis Charts",
      syllabus: ["20.2", "20.48"],
      intro:
        "The chart used in the tropics, where the pressure gradients are too " +
        "weak for isobars to be useful.",
      topics: [
        {
          title: "Reading a Streamline Chart",
          pages: [447, 448, 449, 451, 452, 453],
          intro:
            "What the lines represent, and the features to look for.",
          context:
            "Near the equator the Coriolis force is too weak for the geostrophic " +
            "relationship to hold, so isobars stop telling you which way the wind " +
            "blows. A streamline chart shows the flow directly instead — which is " +
            "why the tropics get a different chart rather than a different scale.",
        },
        {
          title: "Streamline Charts with Isotachs",
          pages: [450],
          intro:
            "Adding wind speed to the flow pattern.",
        },
      ],
    },

    {
      title: "New Zealand Climatology",
      syllabus: ["20.4"],
      intro:
        "Everything in this subject applied to one country: latitude, " +
        "topography and the airflow of the day.",
      topics: [
        {
          title: "New Zealand Weather",
          pages: [455, 456, 457],
          intro:
            "The country's position, and what its terrain does to the weather " +
            "crossing it.",
        },
        {
          title: "Latitude, Topography and Cold Fronts",
          pages: [458],
          intro:
            "How the same front produces different weather in different parts of " +
            "the country.",
        },
        {
          title: "Weather by Airflow",
          pages: [459, 460, 461, 462, 463],
          intro:
            "What to expect from each of the main airflow directions.",
          takeaway:
            "This is the most directly useful topic in the subject. Given the " +
            "airflow direction and the terrain, the weather at a given aerodrome " +
            "is largely predictable — and that judgement is faster than reading a " +
            "forecast and better than trusting one that is six hours old.",
        },
      ],
    },

    {
      title: "Charts and Forecast Products",
      syllabus: ["20.2"],
      intro:
        "The products issued for planning: what each covers, what it looks like " +
        "and what it is for.",
      topics: [
        {
          title: "The MSL Chart and GRAFOR",
          pages: [465, 466],
          intro:
            "The mean sea level analysis, and the graphical area forecast.",
        },
        {
          title: "Aviation Area Winds and Significant Weather",
          pages: [467, 468, 469],
          intro:
            "The upper wind product and the New Zealand significant weather " +
            "chart.",
        },
        {
          title: "SIGMET and the Graphical Sigmet Monitor",
          pages: [470],
          intro:
            "The warning issued for hazardous conditions in flight.",
          context:
            "A SIGMET is not a forecast — it is a warning that something " +
            "hazardous is happening or is expected imminently. It is issued " +
            "between the scheduled products precisely because the scheduled " +
            "products cannot wait for it.",
        },
      ],
    },

    {
      title: "Aerodrome Reports and Forecasts",
      syllabus: ["20.2"],
      intro:
        "The two products that describe one aerodrome — one predicting, one " +
        "reporting — and the broadcasts that carry them.",
      topics: [
        {
          title: "The TAF",
          pages: [471, 472],
          intro:
            "The terminal aerodrome forecast: what it covers and how it is " +
            "structured.",
        },
        {
          title: "METAR, SPECI and TEMPO",
          pages: [473, 474, 475, 476, 477],
          intro:
            "The routine report, the special report, and the change groups used " +
            "in both products.",
          misconception:
            "Reading a TAF as though it described the whole period equally. The " +
            "change groups are the substance of it — the base conditions plus " +
            "what is expected to change, when, and for how long. A TAF read " +
            "without them is not being read.",
        },
        {
          title: "ATIS and AWIB",
          pages: [478],
          intro:
            "The two broadcast services, and what each carries.",
        },
      ],
    },

    {
      title: "Route Forecasts",
      syllabus: ["20.2"],
      intro:
        "The ROFOR: a forecast along a route rather than for a point, and how " +
        "to decode it.",
      topics: [
        {
          title: "The ROFOR",
          pages: [479, 480, 481, 482, 483, 484],
          intro:
            "What it supplies, how it is determined and interpreted, and worked " +
            "decoding including ISA deviation.",
          takeaway:
            "The ROFOR is the product that turns a met briefing into flight plan " +
            "figures. The winds and temperatures it gives at each level are " +
            "exactly what the navigation computer needs, which is why decoding it " +
            "accurately matters more than it looks.",
        },
      ],
    },

    {
      title: "Volcanic Ash Advisories and Pilot Reports",
      syllabus: ["20.2", "20.42"],
      intro:
        "Two products with a common feature: both depend on somebody having " +
        "observed the thing they describe.",
      topics: [
        {
          title: "Volcanic Ash Advisories",
          pages: [485, 486, 487, 488],
          intro:
            "The advisory and the colour code used to describe volcanic alert " +
            "level.",
        },
        {
          title: "PIREP and AIREP",
          pages: [489, 490, 491],
          intro:
            "Reports made by pilots in flight, and how an AIREP is coded.",
          context:
            "These are the only products in the chapter generated by aircraft " +
            "rather than by instruments and models. That makes them the fastest " +
            "confirmation of a forecast — and it makes filing one a contribution " +
            "to everybody else's briefing.",
        },
      ],
    },

    {
      title: "Significant Weather and Upper Wind Charts",
      syllabus: ["20.2"],
      intro:
        "The charts used for the cruise: what is happening between the levels, " +
        "and what the wind and temperature will be at them.",
      topics: [
        {
          title: "Medium and High Level SIGWX Charts",
          pages: [492, 493, 494, 495, 496, 497],
          intro:
            "How significant weather is presented, and the symbols for " +
            "turbulence, embedded cloud, the tropopause and volcanic activity.",
        },
        {
          title: "Issue, Validity and Heights",
          pages: [498, 499, 501, 502],
          intro:
            "When the chart is issued, what period it covers and how heights are " +
            "shown on it.",
        },
        {
          title: "Upper Level Wind and Temperature Charts",
          pages: [503, 504, 505, 506],
          intro:
            "Reading wind and temperature at cruising levels, including ISA " +
            "deviation.",
        },
      ],
    },

    {
      title: "Satellite and Radar Imagery",
      syllabus: ["20.50"],
      intro:
        "Two ways of seeing the weather rather than reading about it, and the " +
        "features each is good at showing.",
      topics: [
        {
          title: "Satellite and Radar Images",
          pages: [507, 508, 509, 510, 511, 512, 513],
          intro:
            "What each instrument produces and what it is used for.",
        },
        {
          title: "Cloud Types in Stable and Unstable Air",
          pages: [514, 515, 516, 517],
          intro:
            "Recognising the stability of the air from the appearance of the " +
            "cloud.",
        },
        {
          title: "Speed, Timing and Expected Impact",
          pages: [518],
          intro:
            "Using a sequence of images to work out when weather will arrive.",
        },
        {
          title: "Visible and Infrared Imagery",
          pages: [519, 520, 521, 522, 523],
          intro:
            "Two channels that show different things, and how to decode each.",
          context:
            "Visible imagery shows reflected sunlight, so it shows how thick " +
            "cloud is and is useless at night. Infrared shows temperature, so it " +
            "shows how high cloud is and works in darkness. Reading them together " +
            "distinguishes a thick low deck from thin high cirrus, which neither " +
            "can do alone.",
        },
        {
          title: "Recognising Features on Imagery",
          pages: [524, 525, 526, 527, 528, 529, 530, 531, 532],
          intro:
            "Cirrus, fog, wave cloud and thunderstorms, a cold front, a cyclone " +
            "and mountain waves, each as they appear from orbit.",
        },
        {
          title: "Using the Products Together",
          pages: [533, 534, 535],
          intro:
            "Two worked examples combining the imagery with the charts.",
          takeaway:
            "No single product tells the whole story. The chart gives you the " +
            "pattern, the imagery confirms what is actually there, and the " +
            "aerodrome reports tell you what it is doing on the ground. A " +
            "briefing is the three read against each other.",
        },
      ],
    },
  ],
};
