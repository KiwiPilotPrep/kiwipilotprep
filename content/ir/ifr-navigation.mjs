/**
 * IFR Navigation — the curriculum.
 *
 * The manual this is built from is a lecture deck. It introduces altimetry on
 * page 3, comes back to it on page 9, and again on page 75; it teaches the ADF
 * across forty pages with the position-line material cut into the middle of
 * it. Followed page by page that produces a course that jumps, and chapters
 * named after whatever heading happened to open a run of slides.
 *
 * So the chapters below are concept areas, in the order a student meets them,
 * and each topic names the pages it is built from. Pages that belong together
 * are gathered even where the manual separated them; pages the manual repeated
 * are claimed once. The builder proves every page of the manual is claimed
 * exactly once, so reorganising cannot quietly lose material.
 *
 * Everything in `intro`, `definition`, `keyPoints`, `context`, `misconception`
 * and `takeaway` is written for this course. It explains, connects and warns —
 * it never states a rule, a minimum, a limit or a value that the source does
 * not. Where a number appears in the writing it is a number the manual gives.
 */

export const subject = {
  slug: "ifr-navigation",
  title: "IFR Navigation",
  deck: "ir-navigation",

  /** Pages that carry no teaching. Recorded so the audit can still balance. */
  skip: {
    1: "blank leading page",
    2: "title slide: the word \"Navigation\" under the heading, and a stock photograph already rejected on review",
  },

  chapters: [
    /* ================================================================= 1 == */
    {
      title: "Altimetry and Vertical Navigation",
      intro:
        "Everything in instrument flight is measured against a datum, and the " +
        "altimeter is the instrument that reports it. This chapter settles what " +
        "the vertical measurements mean, how the standard atmosphere lets you " +
        "compare one day with another, and the two errors that make the " +
        "altimeter disagree with the ground.",
      topics: [
        {
          title: "Altitude, Height and Elevation",
          pages: [3],
          intro:
            "Three words that all describe a vertical distance, and are not " +
            "interchangeable. Which one a chart or a clearance uses tells you " +
            "what it is measured from.",
          keyPoints: [
            "Altitude is measured from mean sea level.",
            "Height is measured from a specified datum — often the aerodrome, sometimes an obstacle.",
            "The datum is the whole difference: the same aircraft has one altitude and many possible heights.",
            "The subscale setting decides which you are reading: QNH puts mean sea level at zero so the altimeter shows altitude; QFE puts the aerodrome at zero so it shows height above it, and reads zero on landing.",
            "Above the transition altitude levels are flown on the standard setting as flight levels; the transition layer is the buffer between the transition altitude below it and the lowest usable flight level above it, and is not used for level flight.",
          ],
          context:
            "An approach chart gives you both, and mixing them up puts you a " +
            "full aerodrome elevation out. A minimum stated as a height above " +
            "an aerodrome that sits at 1,335 ft is not the same number you set " +
            "on the altimeter.",
          takeaway:
            "Before you use a vertical figure, ask what it is measured from.",
        },
        {
          title: "The International Standard Atmosphere",
          pages: [5, 6],
          intro:
            "The atmosphere is different every day, so performance figures are " +
            "quoted against an agreed imaginary one. ISA is that agreement.",
          definition:
            "The International Standard Atmosphere is a fixed set of sea-level " +
            "conditions and lapse rates used as a common reference, so aircraft " +
            "performance and altimetry can be compared between days and places.",
          term: "International Standard Atmosphere (ISA)",
          keyPoints: [
            "Sea level: 1013 hPa and 15°C.",
            "Temperature falls 2°C per 1,000 ft to the tropopause.",
            "1 hPa of pressure change is about 30 ft; 1°C of temperature deviation is about 120 ft.",
            "Conditions are quoted as a deviation — 18°C at sea level is ISA +3.",
          ],
          context:
            "The two conversion figures — 30 ft per hPa and 120 ft per degree — " +
            "are the arithmetic behind almost every altimetry question in this " +
            "subject. Learn them as a pair.",
          takeaway:
            "ISA is not a forecast. It is a ruler, and deviation from it is what " +
            "you actually work with.",
        },
        {
          title: "Pressure Altitude and Density Altitude",
          pages: [4, 7, 8],
          intro:
            "Two derived altitudes that answer different questions. Pressure " +
            "altitude asks where you are in the standard atmosphere; density " +
            "altitude asks how the air will treat your aeroplane.",
          keyPoints: [
            "Pressure altitude comes first — density altitude is a temperature correction applied to it.",
            "Pressure altitude: the difference between 1013 and the prevailing QNH, times 30 ft, applied to the elevation.",
            "Density altitude: correct the pressure altitude by 120 ft for each degree the temperature deviates from ISA.",
            "Warmer than ISA raises density altitude; the aircraft performs as though it were higher.",
          ],
          misconception:
            "Comparing the temperature at your pressure altitude straight to " +
            "15°C. ISA at altitude is not 15°C — work out what ISA would be at " +
            "that level first, then take the deviation from it.",
          context:
            "Density altitude is where altimetry stops being bookkeeping and " +
            "starts being performance. It is the number that tells you whether " +
            "the climb gradient you planned is one the aeroplane can produce.",
        },
        {
          title: "Altimeter Pressure and Temperature Errors",
          pages: [9, 10],
          intro:
            "The altimeter is calibrated for ISA. Every departure from ISA is an " +
            "error, and only one of the two can be corrected in flight.",
          keyPoints: [
            "Pressure error is correctable — update the QNH. Left uncorrected it is about 30 ft per hPa.",
            "Temperature error is not correctable: there is no temperature input to the instrument.",
            "In cold air the aircraft is lower than indicated; in warm air it is higher than indicated.",
            "The memory aid works for both: high to low, look out below.",
          ],
          context:
            "This is the reason a missed approach altitude may need revising " +
            "upward on a cold day. The instrument is not broken and the setting " +
            "is not wrong — the air column itself is shorter than the instrument " +
            "assumes.",
          takeaway:
            "Flying from high to low, of pressure or of temperature, the " +
            "altimeter over-reads and the aircraft is lower than it says.",
        },
        {
          title: "IFR Cruising Levels",
          pages: [11, 12],
          intro:
            "Which levels are available to you is decided by the direction you " +
            "are tracking, and by which FIR you are in.",
          diagramNotes: {
            11: "The New Zealand FIR table of cruising levels, read against magnetic track: the two halves of the compass take odd and even thousands respectively.",
          },
          keyPoints: [
            "Level cruising flight under IFR must be at a level appropriate to the magnetic track.",
            "The New Zealand FIR and the Auckland Oceanic FIR have separate tables.",
            "A level outside the table must be requested prefixed “NON STANDARD”.",
            "ATC may authorise otherwise within, entering or leaving controlled airspace.",
          ],
          context:
            "Planning at a level the table does not offer for your track is one " +
            "of the quiet ways a flight plan goes wrong: every figure computed " +
            "from it — wind, TAS, fuel — is then computed for a level you cannot " +
            "have.",
        },
      ],
    },

    /* ================================================================= 2 == */
    {
      title: "Charts, Publications and Route Information",
      intro:
        "An IFR route is flown off published information. This chapter covers " +
        "where that information lives, how an enroute chart says what it says, " +
        "and the altitudes and limitations printed along a track.",
      topics: [
        {
          title: "The AIP and the Navigation Register",
          pages: [40, 47, 54],
          intro:
            "Before the charts, the documents they come from — and which " +
            "document holds what.",
          keyPoints: [
            "Route and waypoint navigation data sits in the Air Navigation Register, detailed in Part 95 and then in the NZAIP.",
            "Mountainous zones are in the NZANR under Part 71.",
            "AIP Volumes 2 and 3 hold aerodrome charts, SIDs and instrument approach charts.",
            "Enroute charts are issued alongside those volume updates.",
          ],
          takeaway:
            "If you cannot name the document a figure came from, you cannot " +
            "check whether it is current.",
        },
        {
          title: "Enroute and Area Charts",
          pages: [13, 14, 41],
          intro:
            "Three scales of the same country, each drawn for a different part " +
            "of the job.",
          keyPoints: [
            "Published by the Airways Corporation, Lambert Conformal Conic projection.",
            "National enroute charts, 1:1,500,000.",
            "North and South enroute charts, 1:750,000.",
            "Area charts, 1:540,000 — larger scale, more detail.",
          ],
          context:
            "Scale is a working decision, not a preference. Arrival planning " +
            "wants the area chart because the detail you need — DME steps, " +
            "minimum altitudes near the aerodrome — is legible on it.",
        },
        {
          title: "Chart Legends: MEA, MRA, MSA and MFA",
          pages: [15, 16, 17, 18, 42, 43],
          diagramNotes: {
            15:
              "The enroute chart legend itself. Follow the annotated track down " +
              "the right-hand side: the route designator at the top, then the " +
              "non-compulsory reporting point, then MFA 4000 and MSA 3500 " +
              "printed against the same segment, then the magnetic track. That " +
              "vertical strip is the pattern every track on the chart follows.",
            16:
              "The same conventions on a real chart. ELMER is an open triangle " +
              "— a non-compulsory reporting point — and CREEK is filled, so it " +
              "is compulsory. The boxed H191 is the route designator, with the " +
              "minimum altitude above it and the segment distance below. The " +
              "compass rose and the boxed GISBORNE 114.2 identify the VOR/DME " +
              "the radials are drawn from.",
          },
          intro:
            "Four minimum altitudes with similar names and different meanings. " +
            "Two are about receiving a signal, one is about terrain, and the " +
            "fourth is the one you actually fly.",
          keyPoints: [
            "MEA — minimum enroute altitude, published along some NDB tracks: the lowest altitude at which a reliable signal can be expected.",
            "MRA — minimum reception altitude, the same idea along VOR tracks.",
            "MSA — minimum safe altitude, published along all tracks or sectors: adequate vertical separation from terrain.",
            "MFA — minimum flight altitude, the lowest level at or above MSA/MRA/MEA or the upper limit of a hazard, danger or restricted area.",
          ],
          misconception:
            "Treating MEA and MRA as terrain figures. They are reception " +
            "figures — they tell you where the aid works, not where the ground " +
            "is. MSA is the terrain one.",
          context:
            "The notes are blunt about this: you are expected to recall these " +
            "from memory. They recur through flight planning, where picking the " +
            "wrong one puts every later figure out.",
        },
        {
          title: "Route Operating Limitations and Minimum Flight Altitude",
          pages: [19, 21, 22, 23, 44],
          intro:
            "Some tracks carry limitations printed alongside them. The ROL " +
            "block is where the minimum flight altitude for that track appears.",
          keyPoints: [
            "ROLs are published along tracks that have operational limitations.",
            "MFA takes account of magnetic track altitude requirements as well as MSA, MRA and MEA.",
            "MFA is normally identified in the ROL block.",
          ],
        },
        {
          title: "Reporting Points, Distances and DME Steps",
          pages: [20, 24, 25, 45],
          intro:
            "The marks along a track that tell you where you are and what you " +
            "must say.",
          keyPoints: [
            "Compulsory reporting points are filled triangles — black on VOR tracks, burnt sienna on NDB tracks.",
            "You must report crossing them unless otherwise instructed, and they must be on the flight plan.",
            "Distances appear in an oblong box between beacons; with reporting points, each segment is published and the total is their sum.",
            "DME steps are small cross-track lines with the distance from the associated beacon.",
          ],
        },
        {
          title: "Change-Over Points and Track Reciprocals",
          pages: [26, 27, 28, 46],
          intro:
            "Where to swap one VOR for the next, and why the way back is not " +
            "always the reciprocal of the way out.",
          keyPoints: [
            "A VOR change-over point is shown as a small ‘couple’ on the track.",
            "At the COP, change from the VOR behind to the VOR ahead.",
            "Tracks are drawn as straight lines but are affected by earth convergence and local variation.",
            "The reciprocal of a published track is therefore not necessarily exactly 180° from it.",
          ],
          misconception:
            "Assuming the return track is your outbound track minus 180. On a " +
            "conformal conic chart over any distance, it usually is not.",
        },
        {
          title: "Route Designators and Uncharted Routes",
          pages: [29, 30, 49, 50, 51, 52],
          intro:
            "Routes are lettered, and the letter tells you what kind of route it " +
            "is and how it may be used.",
          keyPoints: [
            "Domestic and international routes use different designator sets, and conventional and RNAV routes are lettered differently again.",
            "High level routes are prefixed U.",
            "Uncharted routes are published in the AIP to reduce chart clutter, identified with the designator W plus a magnetic value, DME steps, MSA and distance.",
            "An uncharted route marked with a double asterisk is intended mainly for navaid failure, and needs prior consultation with ATS.",
          ],
        },
        {
          title: "Standard Route Clearances",
          pages: [31, 32],
          intro:
            "Between most controlled aerodromes there is a route ATC would " +
            "rather you flew, and flying it buys you priority.",
          keyPoints: [
            "SRCs are published in AIPNZ Volume 2.",
            "They are the ATS preferred routes between departure and destination.",
            "Priority is given to flights following an SRC.",
          ],
        },
        {
          title: "Airspace and Text Blocks on Enroute Charts",
          pages: [33, 53],
          intro:
            "How an enroute chart tells you which airspace you are about to " +
            "enter, and what its limits are.",
          keyPoints: [
            "Airspace classes and types appear in reverse print near aerodromes with CTRs and CTAs, and in small text blocks for CTA airspace.",
            "Text blocks sit near a CTR or CTA and may be numbered to reference numbered areas.",
            "They normally carry upper and lower limits, with the ATIS frequency at the bottom.",
          ],
        },
        {
          title: "Geodetic Datum: NZGD49 and WGS 84",
          pages: [74],
          intro:
            "Charts and satellites do not necessarily agree about where a point " +
            "on the earth is, because they are drawn against different models of " +
            "the earth.",
          keyPoints: [
            "New Zealand's main geodetic datum has been the New Zealand Geodetic Datum 1949.",
            "GPS uses the World Geodetic System 1984.",
            "The difference can produce small discrepancies between GPS indications and mapped points.",
            "Charts updated to the newer datum say so, bearing “WGS 84 co-ordinates”.",
          ],
          takeaway:
            "A position is only as good as the datum it is quoted against.",
        },
      ],
    },

    /* ================================================================= 3 == */
    {
      title: "Departure, Arrival and Approach Charts",
      intro:
        "The charts that take you from the runway into the enroute structure " +
        "and back down again, and what has to be read off each of them.",
      topics: [
        {
          title: "Standard Instrument Departures",
          pages: [35, 36, 37, 38, 39, 55, 56, 57],
          intro:
            "A SID is a published departure route. Most aerodromes in Volumes 2 " +
            "and 3 have at least one, and which one applies depends on the " +
            "runway and where you are going.",
          keyPoints: [
            "Each SID is specific to a runway vector and to the route to the destination.",
            "An all-directions SID is published at some unattended aerodromes, used only when departing into controlled airspace.",
            "SIDs are published as conventional (VOR) and RNAV versions.",
          ],
          context:
            "In planning, a SID has to be accounted for in the fuel log from " +
            "the runway to where the SID ends — usually a prescribed height " +
            "above sea level.",
        },
        {
          title: "Departure Climb Gradients and Rate of Climb",
          pages: [58, 59],
          intro:
            "A departure procedure specifies a gradient. The aeroplane climbs at " +
            "a rate. Converting between the two is a formula you are expected to " +
            "know without looking it up.",
          keyPoints: [
            "Rate of climb = gradient % × groundspeed × 1.013.",
            "The notes are explicit that this must be committed to memory.",
          ],
          example:
            "A 3.3% gradient at 110 kt groundspeed: 3.3 × 110 × 1.013 = 367.72 " +
            "ft/min. (From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
          misconception:
            "Reading a gradient as a rate. A gradient is a distance " +
            "relationship, so the rate that satisfies it rises with your " +
            "groundspeed — the same procedure demands more feet per minute the " +
            "faster you go.",
        },
        {
          title: "Reading Enroute and Sector Charts",
          pages: [34, 60, 61, 62],
          intro:
            "Worked chart extracts: what the enroute chart and the VOR sector " +
            "chart actually look like when you have to read something off them.",
        },
        {
          title: "Approach Charts: VOR, NDB, DME and ILS",
          pages: [63, 64, 65, 66, 67],
          intro:
            "The conventional approach charts, one aid at a time. The pattern of " +
            "the chart is the same; what changes is the aid providing guidance " +
            "and, with it, the minima.",
        },
        {
          title: "Visual and RNAV Arrivals",
          pages: [68, 69],
          intro:
            "Two ways of joining: an IFR visual arrival, and an RNAV STAR that " +
            "delivers you to the start of an approach.",
        },
        {
          title: "RNAV Approach Charts",
          pages: [70, 71, 72, 73],
          intro:
            "The RNAV family, in increasing capability: lateral guidance only, " +
            "then barometric vertical guidance, then approaches flown to RNP.",
          context:
            "The names on these charts are the ones that decide which minima " +
            "line you may use. They are worth reading against the 2D and 3D " +
            "approach classification later in this subject, which explains what " +
            "the difference actually buys you.",
        },
        {
          title: "Take-off Minima and the Reference Datum",
          pages: [48],
          intro:
            "What has to be visible before you may go, and the point the figure " +
            "is measured from.",
        },
      ],
    },

    /* ================================================================= 4 == */
    {
      title: "Minimum Altitudes, Speeds and Alternates",
      intro:
        "The operating limits that shape an IFR plan: how low you may plan, how " +
        "fast you may hold, and when the flight needs somewhere else to go.",
      topics: [
        {
          title: "Determining the Minimum Flight Altitude",
          pages: [75, 76],
          intro:
            "MFA is not published as a single number you look up. It is the " +
            "highest of several considerations, and then adjusted to a level the " +
            "cruising table allows.",
          keyPoints: [
            "Take the highest of: route MSA, MRA for a VOR sector, MEA for an NDB sector, volcanic hazard zone upper limit, and danger or restricted area upper limit with its buffer.",
            "Then apply the IFR table of cruising levels to that figure.",
            "Where the next sector needs a higher MFA, that sector must not be entered below it unless a crossing altitude is promulgated.",
            "Aircraft with approved enroute area navigation equipment need not comply with MRA and MEA.",
          ],
          context:
            "Many exam questions ask you to plan at MFA. " +
            "Getting it wrong is not a single wrong answer — it feeds the wrong " +
            "level into the whole flight plan form, and every figure after it is " +
            "wrong too.",
          takeaway:
            "MFA is the highest of the applicable minima, rounded to a legal " +
            "cruising level for your track.",
        },
        {
          title: "Holding Speeds",
          pages: [77],
          intro:
            "Published holding speeds, and the circumstances in which a " +
            "different one applies.",
          keyPoints: [
            "Where a holding speed for a particular approach differs from the table, it is annotated on the chart.",
            "Subject to ATC clearance, 280 kt is available for all enroute holding patterns, and for approach holding under radar control.",
            "An aircraft that cannot comply must advise ATC and request an acceptable speed.",
            "Either accommodation may bring a requirement to increase the minimum holding altitude.",
          ],
        },
        {
          title: "Aircraft Categories and Procedure Speeds",
          pages: [78],
          intro:
            "Instrument procedures are designed around an assumed range of " +
            "landing speeds. Your category decides which protected airspace and " +
            "obstacle clearance you are flying inside.",
        },
        {
          title: "When an Alternate Is Required",
          pages: [79],
          intro:
            "The default is that an IFR flight plan lists an alternate. The " +
            "exemption has conditions, and they are about forecasts rather than " +
            "about the weather you can see.",
          keyPoints: [
            "An alternate must be listed unless the destination has a published instrument approach procedure, and",
            "the forecast for at least one hour either side of ETA gives a ceiling at least 1000 ft above the published minimum for the likely procedure, and",
            "visibility at least 5 km, or 2 km more than the published minimum, whichever is greater.",
          ],
          misconception:
            "Reading the two conditions as alternatives. They are cumulative — " +
            "the procedure has to exist and the forecast has to clear both " +
            "margins.",
        },
        {
          title: "Alternate Aerodrome Minima",
          pages: [80, 81, 82, 83, 84],
          intro:
            "An aerodrome only counts as an alternate if the forecast at your " +
            "ETA meets the minima for the kind of approach available there. " +
            "Three cases, plus a fallback.",
          keyPoints: [
            "Where published alternate minima exist for the procedure, those apply.",
            "Precision approach — the ILS and APV case: a ceiling of 600 ft or 200 ft above DA/DH, whichever is higher, and 3000 m or 1000 m more than the prescribed minimum, whichever is greater.",
            "Non-precision approach — the NDB, VOR and RNAV case: a ceiling of 800 ft or 200 ft above MDA/MDH, whichever is higher, and 4000 m or 1500 m more than the prescribed minimum, whichever is greater.",
            "With no published instrument approach at all, the VFR minima of Part 91 Subpart D apply.",
          ],
          context:
            "That last case changes the character of the arrival, not just the " +
            "numbers: the note against it is that the approach becomes a VFR " +
            "one, flown to VFR criteria, minima and visibility.",
        },
        {
          title: "Alternate Aerodrome Equipment",
          pages: [85],
          intro:
            "A weather requirement is not the only requirement. The aerodrome " +
            "has to be able to keep working if its power fails.",
          keyPoints: [
            "A secondary electric power supply is required for the ground-based navigation aids needed for the intended approach,",
            "and for aerodrome lighting where the operation is at night.",
          ],
        },
      ],
    },

    /* ================================================================= 5 == */
    {
      title: "The ADF and the NDB",
      intro:
        "The oldest aid in the syllabus and the one that demands the most from " +
        "the pilot, because the instrument tells you an angle relative to the " +
        "aeroplane and leaves the rest of the arithmetic to you.",
      topics: [
        {
          title: "How the ADF and NDB Work",
          pages: [89, 91],
          intro:
            "A ground station radiating in all directions, and an airborne " +
            "receiver that works out which way the signal is strongest.",
          definition:
            "The ADF determines the bearing to an NDB by combining a directional " +
            "and a non-directional antenna to sense the direction in which the " +
            "combined signal is strongest.",
          term: "Automatic Direction Finder (ADF)",
          keyPoints: [
            "Correctly tuned, the needle points at the selected beacon.",
            "The relative bearing indicator's card is fixed, with 0° on the aircraft centreline.",
            "With no wind, hold the needle on 0° to track to the beacon, or on 180° to track away.",
            "With a crosswind, the needle must be held off 0° or 180° by the drift.",
          ],
        },
        {
          title: "ADF Indicators: Fixed Card, Rotatable Card and RMI",
          pages: [90, 99, 100, 101, 102, 103, 104],
          intro:
            "Three presentations of the same information, differing in how much " +
            "mental arithmetic they leave you to do.",
          keyPoints: [
            "Fixed card — the needle shows relative bearing only; you supply the heading.",
            "Manual rotatable card — align the card with your heading and read the magnetic bearing directly.",
            "RMI — the card is continuously and automatically referenced to magnetic north, so the head shows bearing to and the tail bearing from.",
            "Mode switch: ADF (or COMP) for navigation, ANT for the sense aerial only with no navigation information, TEST to check the needle deflects and returns, BFO for unmodulated carriers.",
          ],
          context:
            "The progression is the point. Each step removes one opportunity to " +
            "make an arithmetic error under load, which is why the RMI is the " +
            "one you want on a bad night.",
        },
        {
          title: "Relative Bearing and Magnetic Bearing",
          pages: [92, 93, 94, 95, 96, 97, 98],
          diagramNotes: {
            93:
              "Relative bearing on the airframe. The aircraft heading is 300°M " +
              "and the ADF needle reads 045°R — the angle is measured clockwise " +
              "from the nose, not from north.",
            95:
              "The same relative bearing in three positions. The needle reads " +
              "the same in each, and the aircraft is somewhere different every " +
              "time. That is what relative bearing alone cannot tell you.",
            96:
              "Why heading is needed. Four aircraft all showing a relative " +
              "bearing to the same NDB, on tracks of 040°M, 170°M and 290°M — " +
              "identical needles, entirely different positions.",
            97:
              "The conversion, worked on the picture: heading 030°M plus a " +
              "relative bearing of 040°R gives 070°M to the beacon, and 250°M " +
              "from it.",
          },
          intro:
            "The conversion that makes a fixed-card ADF usable. Everything else " +
            "in this chapter rests on it.",
          definition:
            "Relative bearing is the angle between the aircraft heading and the " +
            "direction to a point, measured clockwise from the nose.",
          term: "Relative bearing (RB)",
          keyPoints: [
            "Magnetic heading + relative bearing = magnetic bearing to the beacon.",
            "If the total exceeds 360, subtract 360.",
            "Bearing from the beacon is the bearing to it, ±180°.",
            "Relative bearing alone cannot orient you — any number of tracks give the same relative bearing.",
          ],
          example:
            "The DI shows 125°M and the ADF needle shows 105°R. " +
            "125 + 105 = 230°M to the beacon; 230 − 180 = 050°M from it. " +
            "(From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
          misconception:
            "Believing a relative bearing tells you where you are. It tells you " +
            "where the beacon is relative to your nose. Without the heading it " +
            "places you nowhere.",
        },
        {
          title: "Station Passage",
          pages: [105],
          intro:
            "What the needle does as you go overhead, and why the moment is less " +
            "definite than it sounds.",
        },
        {
          title: "Tracking To and From an NDB",
          pages: [116, 117, 118, 119, 120],
          diagramNotes: {
            117:
              "Drifting without correction. The aircraft is being pushed off the " +
              "078 track and the needle moves further off the nose as the error " +
              "grows — the needle movement is the report that it is happening.",
            118:
              "Homing. Turning to put the needle back on 000°R each time the " +
              "wind pushes you off produces the curved track shown, arriving at " +
              "the beacon by a path nobody cleared.",
            119:
              "The arithmetic of a relative bearing that has to wrap. Magnetic " +
              "bearing 078 minus heading 088 cannot be done directly, so 360 is " +
              "added first: 438 − 088 = 350°R.",
            120:
              "Tracking with drift applied. With 10° of left drift corrected, " +
              "the heading is off the track and the needle sits stable 10° off " +
              "the nose — a stable needle off centre is a tracked aeroplane.",
          },
          intro:
            "Holding a track rather than merely pointing at the beacon. In still " +
            "air these are the same thing; in wind they are not.",
          keyPoints: [
            "Nil wind: fly the heading, the needle stays on 000°R.",
            "Drifting off track without correction, the needle moves further off the nose as the error grows.",
            "Chasing the needle back to 000°R only restarts the drift — the aircraft ends up flying a curve to the beacon.",
            "The fix is to apply drift: with correct drift applied, the needle stabilises off the nose by the drift angle.",
            "Magnetic bearing to − magnetic heading = relative bearing.",
          ],
          context:
            "Under IFR you are required to maintain flight plan tracks, which is " +
            "why homing — turning to keep the needle on the nose — is not good " +
            "enough. The aircraft arrives, but not along the track that was " +
            "cleared and terrain-checked.",
          takeaway:
            "A stable needle off the nose is a tracked aircraft. A needle " +
            "pinned to the nose in a crosswind is a drifting one.",
        },
        {
          title: "Drift Changes, Regaining Track and Intercepts",
          pages: [121, 122, 123, 124, 125, 126, 127, 128, 129],
          intro:
            "Reading the needle's movement as a report on the wind, and getting " +
            "back to track when the wind changes.",
          keyPoints: [
            "Needle moving further off the nose: too little drift applied, the aircraft is going downwind of track.",
            "Needle moving toward the nose: too much drift applied, the aircraft is going upwind of track.",
            "To regain track, change heading by twice the change in relative bearing, in the same direction the needle moved.",
            "Once back on track, reduce the correction — or the aircraft flies straight through the track line.",
          ],
          example:
            "The needle decreases 10° anticlockwise, so turn 20° into the " +
            "needle. Regaining a 260°M track on a 30° intercept, the track is " +
            "regained when the needle reads the intercept angle; a heading of " +
            "275° for anticipated drift then holds it, with the needle stable on " +
            "345°R. (From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
          misconception:
            "Treating the doubling rule as the whole answer. It gets you back to " +
            "the track; it is not the heading that keeps you there, and forgetting " +
            "to reduce it is how an intercept turns into a weave.",
        },
        {
          title: "ADF Errors and Limitations",
          pages: [106, 107, 108, 109, 110, 111],
          intro:
            "Five ways the signal can lie to you. For navigation the question is " +
            "narrower than in Navaids: given where you are and what time it is, " +
            "how much is this bearing worth before you plot it?",
          keyPoints: [
            "Night effect — reflected sky waves interfere with surface waves; the usual skip distance is 70–80 miles, and at or beyond that range the NDB is unreliable at night.",
            "Thunderstorm effect — a special kind of precipitation static; storms radiate enough energy to disturb the indication.",
            "Coastal refraction — signals crossing a coast at an oblique angle bend, and the beacon always appears closer to the coastline than it is. Signals crossing at right angles are not bent.",
            "Mountain effect — terrain mixes signals much as night effect does; a higher frequency reduces it, and flying higher helps.",
            "Precipitation static — charged precipitation interferes; a closer or more powerful NDB may help.",
          ],
          context:
            "Every one of these is worse at low level and at long range. That is " +
            "the practical thread through the whole list: an NDB you are close " +
            "to, high up, and crossing the coast squarely, is an NDB you can " +
            "believe.",
        },
      ],
    },

    /* ================================================================= 6 == */
    {
      title: "The VOR",
      intro:
        "The VOR as a navigation tool: what a radial is, how far one reaches, " +
        "and — the part that matters for position fixing — how much error you " +
        "are carrying when you plot one. IFR Navaids covers the same aid as " +
        "equipment, in more depth; here it is the accuracy figure that counts, " +
        "because everything you fix your position with inherits it.",
      topics: [
        {
          title: "How the VOR Works",
          pages: [147],
          intro:
            "Two signals, one fixed and one rotating, and a phase difference " +
            "that encodes direction.",
          definition:
            "A VOR radiates an omnidirectional master signal and a highly " +
            "directional second signal that rotates 30 times a second; the phase " +
            "difference between them equals the angular direction from the " +
            "station, and that line of position is called a radial.",
          term: "VHF Omnidirectional Range (VOR)",
          keyPoints: [
            "The phase difference is the bearing — 90° out of phase means 90° clockwise from north.",
            "A radial is a line of position from the station.",
            "Radials from two VORs intersect to fix the aircraft's position.",
          ],
        },
        {
          title: "VOR Range",
          pages: [148],
          intro:
            "How far a VOR is usable, which in planning is the question of " +
            "whether a radial will be there when you need it. VHF means line of " +
            "sight, and line of sight means range depends on height — yours and " +
            "the station's.",
          keyPoints: [
            "Range ≈ 1.25 × √(transmitter height) + 1.25 × √(receiver height).",
            "Enroute charts publish the MRA for some routes, which is the reception figure in practice.",
          ],
        },
        {
          title: "VOR Errors and Aggregate Accuracy",
          pages: [149, 150, 151, 152, 153, 154, 155],
          intro:
            "Five error sources, each small, and the combined figure you actually " +
            "plot with. This is the number that sets how big a cocked hat you " +
            "should expect from VOR radials, and how far from a station they stop " +
            "being worth taking.",
          keyPoints: [
            "Ground station error — usually less than ±2°.",
            "Site effect — any obstruction, even grass; should be less than ±3°.",
            "Terrain effect — ground reflections; rapid oscillation is scalloping, slow oscillation is radial bending; up to ±2°. Affected stations are noted in Volume 2.",
            "Airborne equipment error — usually less than ±2°.",
            "Vertical polarisation — rare; reflected signals become vertically polarised and are picked up when banked, causing large fluctuations that settle once the wings are level.",
            "Aggregate error rarely exceeds ±5°, which is acceptable for IFR flight and non-precision approaches.",
          ],
          misconception:
            "Reading a fluctuating needle in a turn as a fault. Vertical " +
            "polarisation error appears when the aircraft is banked and " +
            "disappears when it is level — level the wings before you diagnose " +
            "anything.",
          takeaway:
            "The VOR is more accurate than the NDB and still not a precision " +
            "aid: ±5° is the number to carry.",
        },
      ],
    },

    /* ================================================================= 7 == */
    {
      title: "Distance Measuring Equipment",
      intro:
        "The only aid here that answers \u201chow far\u201d rather than \u201cwhich way\u201d, which " +
        "is why a DME distance combined with one bearing is a fix. This chapter " +
        "is what that distance is worth: what it measures, how accurate it is, " +
        "and when it stops answering.",
      topics: [
        {
          title: "How DME Works",
          pages: [156, 157, 158],
          intro:
            "For navigation the important word in the definition is \u201cslant\u201d. A " +
            "DME reading is a distance through the air to the station, not a " +
            "distance across the chart — and it is the chart distance you plot.",
          keyPoints: [
            "It is the aircraft that interrogates the station, which is the reverse of a normal SSR arrangement.",
            "What it measures is slant range — the direct distance to the station, not the distance over the ground.",
            "The two converge as you get further away and diverge as you get closer, which is why a DME arc is flown well out from the aid.",
          ],
          misconception:
            "Reading DME as ground distance. Overhead a station at altitude, " +
            "the DME reads your height, not zero — the error is largest exactly " +
            "where people expect it to be smallest.",
        },
        {
          title: "DME Controls, Ident and Failure Indications",
          pages: [159, 160, 161, 162],
          intro:
            "Confirming you are receiving the station you think you are, and " +
            "recognising when you have lost it.",
          keyPoints: [
            "Tuned via a co-located VOR, you hear two idents with the same code.",
            "The DME identifier is higher pitched and transmits once for every two or three VOR idents.",
            "On losing the transponder signal the equipment unlocks and searches again, showing a readout scrolling between 0 and 200.",
            "An OFF flag appears, or a bar crosses a digital readout.",
          ],
        },
        {
          title: "DME Range, Accuracy and Saturation",
          pages: [163, 164, 165, 166],
          intro:
            "How far it reaches, how much you can trust it, and the one " +
            "circumstance in which it stops answering.",
          keyPoints: [
            "Designed maximum range 200 nm; in practice line-of-sight range, with the usual VHF/UHF factors.",
            "Reduced coverage is noted in Volumes 2 and 3.",
            "Specified accuracy ±0.5 nm or ±3% of the distance; in practice ±0.2 nm or ±0.25%, worst case ±0.5 nm.",
            "A transponder serves a maximum of 100 aircraft; when saturated the furthest aircraft are dropped first. Saturation is unlikely in New Zealand.",
          ],
        },
        {
          title: "VORTAC",
          pages: [167],
          intro:
            "A military aid and a civil one sharing a site, and what a civil " +
            "receiver takes from each.",
          keyPoints: [
            "DME was developed from the military TACAN.",
            "At Whenuapai and Ohakea a VOR is combined with a TACAN, called a VORTAC.",
            "A civil aircraft tuning it receives bearing from the VOR and distance from the TACAN.",
          ],
        },
      ],
    },

    /* ================================================================= 8 == */
    {
      title: "Position Lines and Fixing",
      intro:
        "One bearing puts you on a line. Two or three, taken properly and " +
        "brought to a common time, put you in a small area — and knowing how " +
        "small is as important as knowing where.",
      topics: [
        {
          title: "Position Lines",
          pages: [112, 113, 114, 115],
          intro:
            "What a single bearing actually gives you, and what two of them do.",
          definition:
            "A position line is a known line the aircraft is on at a given time.",
          term: "Position line",
          keyPoints: [
            "Position lines are plotted from the beacon on an enroute chart.",
            "Align the protractor to the published magnetic tracks as a datum.",
            "One line confirms whether you are maintaining track.",
            "Two simultaneous lines crossing near 90° give a fix.",
          ],
        },
        {
          title: "Cuts, Fixes and the Cocked Hat",
          pages: [130, 131, 132, 133, 134, 135],
          intro:
            "The geometry of a good fix: how many lines, at what angles, and " +
            "what the triangle they leave behind is telling you.",
          keyPoints: [
            "Use at least two lines, preferably three.",
            "Two lines should cut as close to 90° as possible; three should cut at 60-60-60 or 120-120-120.",
            "Three lines, or two lines and a DME distance, leave a small triangle — the cocked hat — and the aircraft is taken to be at its centre.",
            "Bearings spread around the aircraft (120-120-120) are inherently more accurate than beacons all to one side (60-60-60).",
            "Radials diverge with distance, so three radials taken far from their stations fix you less precisely.",
          ],
          context:
            "In New Zealand it is usually possible to tune three beacons giving " +
            "cuts near those angles, mixing NDB and VOR — which in practice " +
            "means twin ADF and twin VOR, or an RMI with a separate VOR, ADF or " +
            "DME.",
        },
        {
          title: "Transposing Position Lines to a Common Time",
          pages: [136, 137, 138],
          intro:
            "Bearings taken minutes apart do not describe the same aeroplane. " +
            "Transposition moves the earlier lines forward so that they do.",
          keyPoints: [
            "Find each position line as a magnetic bearing from, and note its time.",
            "Plot all three, then calculate an approximate groundspeed from one of the positions.",
            "Transfer the earlier lines forward to the time of the latest one.",
            "Transfer along the intended track, not along track made good.",
            "Mark a transferred line with a double arrowhead at each end, and always write the Zulu time against it.",
          ],
          misconception:
            "Transferring along the track you flew. The transfer is along the " +
            "intended track — transferring the wrong track, and " +
            "the wrong time, as the two commonest mistakes.",
        },
        {
          title: "Worked Example: A Three-Line Fix",
          pages: [139, 140, 141, 142, 143, 144, 145, 146],
          intro:
            "The whole method on one problem: two NDB bearings and a VOR radial, " +
            "taken over fourteen minutes, resolved to a single fix.",
          context:
            "Work through it with a chart, a square protractor, a ruler and " +
            "dividers rather than reading it. The arithmetic is easy; the " +
            "bookkeeping — which line goes to which time — is what actually goes " +
            "wrong.",
          takeaway:
            "If the cocked hat comes out larger than 10 nm, the answer is not to " +
            "accept it. Discard the least reliable line and fix on two, or " +
            "re-draw a better line.",
        },
      ],
    },

    /* ================================================================= 9 == */
    {
      title: "GNSS and Performance-Based Navigation",
      intro:
        "Satellite navigation, and the framework that decides what you are " +
        "allowed to do with it. PBN is the more important half: it is about " +
        "required performance rather than about equipment.",
      topics: [
        {
          title: "GPS Architecture and Position Fixing",
          pages: [168, 169, 170, 229, 230, 231],
          intro:
            "How a receiver turns signals from space into a position, and why " +
            "the fourth satellite is not for position at all.",
          keyPoints: [
            "Four operational satellites are needed to fix position — three for position, one to synchronise time.",
            "The more satellites in view, the more accurate the navigation.",
            "Synchronisation between receiver clock and satellite clock is essential; the receiver detects and eliminates timing errors.",
            "Before an approach procedure is approved it must meet criteria for accuracy, integrity, continuity and availability.",
          ],
          misconception:
            "Thinking the fourth satellite adds a dimension. It resolves the " +
            "receiver's clock error — a cheap clock in the aeroplane is what " +
            "makes the extra measurement necessary.",
        },
        {
          title: "RAIM, Fault Detection and Fault Exclusion",
          pages: [171, 172, 232],
          intro:
            "Integrity is the receiver's ability to tell you it is wrong. This " +
            "is how it does that, and how many satellites each level of " +
            "assurance costs.",
          definition:
            "RAIM is a receiver function that analyses signal integrity and the " +
            "relative positions of satellites in view, selecting the best four " +
            "or more and discarding anomalous ones.",
          term: "Receiver Autonomous Integrity Monitoring (RAIM)",
          keyPoints: [
            "At least five satellites in view for RAIM to find an anomaly, six to isolate the faulty one.",
            "A receiver must meet TSO 129, 145 or 146a to be used for IFR navigation.",
            "TSO 129 — the commonest and oldest RAIM-capable type in New Zealand — offers Fault Detection only, and needs 5 satellites.",
            "TSO 145 and 146a offer Fault Detection and Exclusion, need a minimum of 6, and are approved for sole means navigation.",
          ],
          context:
            "The distinction is between a receiver that can say “something is " +
            "wrong” and one that can say “that satellite is wrong, and I have " +
            "stopped using it”. Only the second can keep navigating through the " +
            "fault.",
        },
        {
          title: "PDOP and Satellite Geometry",
          pages: [173, 174],
          intro:
            "Accuracy depends on where the satellites are, not only on how many " +
            "there are.",
          diagramNotes: {
            173: "The same number of satellites in two arrangements: bunched together, the position uncertainty is a long thin region; spread apart, it closes into a small one. That is the whole meaning of PDOP.",
          },
          keyPoints: [
            "PDOP — position dilution of precision — depends on the satellites' positions relative to the fix, and its value determines the extent of range and position errors.",
            "RAIM works to keep PDOP minimised for the stage of flight.",
            "The RAIM tolerances required for IFR use: 2 nm enroute, 1 nm terminal, 0.3 nm on approach.",
            "GDOP is PDOP plus clock error.",
          ],
        },
        {
          title: "Barometric Aiding and the Masking Function",
          pages: [175, 176, 177, 233],
          intro:
            "Two ways the receiver makes the best of a poor sky: borrowing an " +
            "altitude, and ignoring the satellites that would do more harm than " +
            "good.",
          keyPoints: [
            "Barometric aiding uses altimeter data as, in effect, the range to a simulated satellite directly overhead.",
            "It is available only when fewer than five satellites are in view and RAIM alone cannot be effective.",
            "The current altimeter setting must be entered for baro-aiding to be available.",
            "Counting satellites: RAIM needs 5, or 4 plus baro-aiding; FDE needs 6, or 5 plus baro-aiding.",
            "The masking function ignores satellites below a fixed angle, whose signals travel further through the ionosphere and troposphere.",
          ],
        },
        {
          title: "What Performance-Based Navigation Is",
          pages: [214, 215, 216, 217, 228],
          intro:
            "PBN is not a piece of equipment. It is a way of specifying what the " +
            "navigation must achieve and leaving open how it is achieved.",
          keyPoints: [
            "PBN has two requirements: the pilot suitably trained and qualified, and the aircraft appropriately equipped.",
            "The difference between RNAV and RNP specifications is on-board performance monitoring and alerting — required for RNP, not for RNAV.",
            "Area navigation determines present position in latitude and longitude, then relates it to the intended flight path.",
            "ICAO's case for it: less congestion, reliable all-weather operations at difficult airports, fuel saved, noise reduced.",
          ],
          context:
            "There is a point here worth keeping: technologies such as ADS-B " +
            "help with enroute position finding but are not a substitute for " +
            "good communication practice. Outside radar or ADS-B coverage, ATC " +
            "separates you using the estimates you give them — so an estimate " +
            "that is not updated is a separation problem, not a paperwork one.",
          exampleTitle: "The vocabulary, once",
          example:
            "PBN brings a set of abbreviations that turn up on charts, in " +
            "approval documents and in the exam, and they are easier met " +
            "together than one at a time.\n" +
            "The specifications: RNAV is area navigation without on-board " +
            "performance monitoring and alerting; RNP is the same with it. " +
            "A-RNP is advanced RNP, and P-RNAV — precision area navigation — " +
            "is the older European terminal specification you will still see " +
            "referred to.\n" +
            "The monitoring: OPMA is on-board performance monitoring and " +
            "alerting, the thing that makes a specification an RNP one. ANP is " +
            "actual navigation performance, what the system is achieving now, " +
            "which is what gets compared against the RNP value.\n" +
            "The roles a navigation source can hold: PMoN is a primary means " +
            "of navigation and AMoN an alternative means of navigation. GBNA " +
            "is a ground-based navigation aid — the VORs, NDBs and DMEs that " +
            "remain the alternative when GNSS is unavailable.\n" +
            "The vertical dimension: LNAV is lateral navigation, VNAV is " +
            "vertical navigation, and baro-VNAV is barometric vertical " +
            "navigation, which builds the vertical path from barometric " +
            "altitude rather than from satellites.\n" +
            "Two more worth recognising: continental (en route) is the term " +
            "that replaced domestic (en route), changed to match ICAO and to " +
            "stop the old name suggesting the approval stopped at a national " +
            "border; and a fixed radius transition (FRT) is the constant-radius " +
            "turn used to join one en-route leg to the next.",
        },
        {
          title: "RNAV, RNP and Total System Error",
          pages: [218, 219],
          intro:
            "Where the error in an area navigation system actually comes from, " +
            "in the lateral dimension and along track.",
          keyPoints: [
            "Total system error combines three lateral errors.",
            "Path definition error — the path in the system does not match the path intended over the ground.",
            "Flight technical error — how well the autopilot follows the defined path, including display error.",
            "Navigation system error — the difference between estimated and actual position.",
            "Along track there is no flight technical error and path definition error is negligible, so along-track accuracy is NSE plus PDE.",
          ],
          context:
            "Along-track accuracy is what makes a position report and a " +
            "step-down altitude meaningful — “10 nm to ABC” is only as good as " +
            "the along-track error behind it.",
          exampleTitle: "What each specification actually permits",
          example:
            "Every navigation specification puts a number on the total system " +
            "error it will tolerate. The figure applies laterally and along " +
            "track, and has to be held for at least 95% of the total flight " +
            "time.\n" +
            "RNAV 2 and RNP 2 allow ±2 NM; RNAV 1 and RNP 1 allow ±1 NM.\n" +
            "RNP APCH is split. Through the initial and intermediate segments " +
            "and the missed approach it is ±1 NM; on the final approach " +
            "segment down to LNAV or LNAV/VNAV minima it tightens to ±0.3 NM.\n" +
            "Flight technical error is the part you fly, and it is limited to " +
            "half the lateral total — so on an RNP APCH the lateral FTE alert " +
            "is 0.5 NM on the initial and intermediate segments and 0.25 NM on " +
            "final. Where a certified barometric VNAV system supports " +
            "LNAV/VNAV, vertical deviation on the final approach segment is " +
            "monitored against ±75 ft.",
          misconception:
            "The RNP number is not a promise that the aeroplane will stay that " +
            "close to centreline, and it is not an allowance to be spent. It " +
            "is the accuracy the whole system must achieve for 95% of the " +
            "flight time, with on-board monitoring to tell you when it can no " +
            "longer be achieved. Drifting out towards the edge of the figure " +
            "because the figure exists is the wrong reading of it.",
        },
        {
          title: "SIDs, STARs and Leg Types under PBN",
          pages: [220, 221],
          intro:
            "How a procedure is described to a navigation system, rather than to " +
            "a pilot.",
          keyPoints: [
            "A SID links an airport or runway to a significant point where the enroute phase begins.",
            "A STAR links a significant point on an air route to where an approach can be commenced; major airports have a family of them.",
            "A leg type is a two-letter code describing the path and its termination point.",
            "Every leg has a terminator and some kind of path into it — leg types live in the navigation database and are not normally charted.",
          ],
          context:
            "Two things in that coding are worth being able to picture. The " +
            "first is how a waypoint is passed. At a fly-by waypoint the " +
            "system anticipates the turn and begins it early, cutting the " +
            "corner so the aeroplane rolls out established on the next leg; at " +
            "a fly-over waypoint the aeroplane must pass over the point before " +
            "the turn starts, which throws the track wide afterwards. Where " +
            "terrain or airspace makes the overshoot unacceptable a procedure " +
            "is designed around fly-by waypoints, so knowing which you are " +
            "approaching tells you what the aeroplane is about to do.\n" +
            "The second is the leg codes themselves. An initial fix (IF) " +
            "simply starts a sequence. A track to fix (TF) is a straight line " +
            "between two named waypoints and is the commonest leg in a PBN " +
            "procedure. A direct to fix (DF) is a path from wherever the " +
            "aeroplane happens to be to a named waypoint, which is why it " +
            "turns up after a manual termination such as a climb to an " +
            "altitude. A radius to fix (RF) is a curved leg of constant " +
            "radius, and a fixed radius transition (FRT) is the same idea used " +
            "to join one en-route leg to the next.",
        },
        {
          title: "2D and 3D Instrument Approaches",
          pages: [222, 223, 224, 225],
          intro:
            "ICAO's classification, and the practical difference: who is " +
            "responsible for the vertical profile.",
          keyPoints: [
            "ICAO classifies approaches as Type A and Type B; they are flown as two-dimensional or three-dimensional.",
            "2D uses lateral guidance only — NDB, VOR, localiser, or GNSS to RNP. The pilot adheres to step-down altitudes and uses an MDA.",
            "3D provides lateral and vertical guidance from the guidance system, and uses a decision altitude.",
            "ILS, MLS and GLS can provide Cat I, II or III minima.",
            "RNAV(GNSS) approaches are now officially RNP APCH, though the older name will persist until charts and databases are updated.",
          ],
          takeaway:
            "The difference between 2D and 3D is not accuracy — it is whether " +
            "the vertical path is flown for you or by you, and that is what MDA " +
            "versus DA reflects.",
        },
        {
          title: "PBN Obligations and Navigation Databases",
          pages: [226, 227],
          intro:
            "What the operator and the pilot must hold before a PBN procedure " +
            "may be flown, and the rules the database itself lives under.",
          keyPoints: [
            "A pilot may use RNAV or RNP only if qualified to do so.",
            "The operator must hold, or be deemed to hold, a navigation authorisation for the relevant specification.",
            "The operator must ensure each crew member meets the requirements and flies according to the authorisation.",
            "The database must be valid for the current AIRAC cycle.",
            "All terminal routes — SIDs, STARs and approaches — must be loaded from the database and may not be modified by the pilot.",
          ],
          misconception:
            "Editing a procedure in the box to match a clearance. Terminal " +
            "routes are loaded from the database and left alone; a modified " +
            "procedure is no longer the procedure that was surveyed.",
        },
      ],
    },

    /* ================================================================ 10 == */
    {
      title: "IFR Flight Planning",
      intro:
        "Everything in this subject converges here. The plan is built in a " +
        "particular order — climb and descent before cruise, because until you " +
        "know how many track miles they consume you do not know how long the " +
        "cruise is.",
      topics: [
        {
          title: "Levels, Charts and Equipment",
          pages: [178, 179, 180],
          intro:
            "What you need in front of you before the first figure goes on the " +
            "form.",
          keyPoints: [
            "Northerly headings take odd thousands of feet or flight levels; southerly headings take even.",
            "IFR charts, navigation computer, protractors and plotters are standard onboard kit, not just planning-room tools.",
            "Most calculations are done before departure, but ATC changes the plan — expect to rework figures in flight.",
          ],
        },
        {
          title: "True Airspeed from CAS and Temperature",
          pages: [86, 87, 88],
          intro:
            "The first conversion in every leg. The exam gives you a CAS and a " +
            "temperature — sometimes as a deviation rather than a number — and " +
            "everything downstream needs TAS.",
          keyPoints: [
            "Treat the given CAS as IAS for this purpose.",
            "ISA at any altitude: 15 − (2 × altitude in thousands).",
            "With mean climb temperature and CAS, the navigation computer gives TAS.",
            "With TAS, the wind and the required track, you can then find heading and groundspeed.",
          ],
          example:
            "At FL190: 15 − 38 = −23°C is the ISA temperature. At FL170 with " +
            "−16°C and CAS 130, the computer gives about 172 kt TAS. (From the " +
            "manual.)",
          exampleTitle: "Worked example, from the course notes",
        },
        {
          title: "Planning the Climb",
          pages: [181, 182, 183, 184, 185, 186, 187, 188, 189, 190],
          intro:
            "The climb passes through many levels, so no single wind or " +
            "temperature describes it. The manual's method is to take one " +
            "representative point and work the whole climb from it.",
          keyPoints: [
            "Use the two-thirds point of the climb for a representative mean wind and TAS.",
            "Departure altitude may be quoted as a height above aerodrome level — add the elevation, then round.",
            "Forecast winds are in degrees true; for domestic planning apply the 20°E variation to get magnetic.",
            "Interpolate the forecast if your mean climb level is not one of the levels listed.",
            "Where a SID applies, account for it in the fuel log from the runway to where the SID ends.",
            "Fill the departure beacon ident in the From column and TOC in the To column.",
          ],
          context:
            "The two-thirds point is a convention, not a physical fact. It " +
            "exists because the aircraft spends more of the climb in the upper " +
            "part of it, so the upper winds deserve more weight than a simple " +
            "mid-point would give them.",
        },
        {
          title: "Planning the Descent",
          pages: [191, 192, 193, 194, 195],
          intro:
            "Worked before the cruise, and with a different representative " +
            "point: a descent is quicker than a climb, so it spends less time in " +
            "the winds.",
          keyPoints: [
            "Take the halfway point of the descent for wind and TAS, not the two-thirds point.",
            "Plan the descent to the applicable minimum for the arrival — the worked example uses the MRA at 20 DME — then round for planning.",
            "Halfway is found by adding cruise altitude to the bottom-of-descent altitude and halving.",
            "Interpolate winds between forecast levels, remembering the direction and speed both change with height.",
          ],
          example:
            "From FL260 down to 4,000 ft: 26,000 + 4,000 = 30,000; halfway is " +
            "15,000 ft, and that is the wind to use. Between FL130 (250/30) and " +
            "FL180 (280/40) the direction changes 30° over 5,000 ft, so 6° per " +
            "1,000 ft. (From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
          misconception:
            "Interpolating in the wrong direction. Coming down from above, the " +
            "correction is applied to the lower level's forecast, not subtracted " +
            "from the upper one.",
        },
        {
          title: "Track Miles and the Cruise",
          pages: [196, 197, 198, 199],
          intro:
            "Climb and descent consume track miles. What is left over is the " +
            "cruise — which is why the cruise is worked last.",
          keyPoints: [
            "Rate of climb and rate of descent come from the operational information.",
            "Time in the climb or descent, at the groundspeed for that phase, gives the track miles.",
            "Subtract those from the leg distances to find what remains for the cruise.",
            "The climb can run past a reporting point, leaving very little cruise on that leg.",
            "Use the bottom line of the plan for the descent, leaving space for cruise legs.",
          ],
          takeaway:
            "This is the reason for the order: work climb and descent first, and " +
            "the cruise is whatever distance is left.",
        },
        {
          title: "A Complete Flight Plan",
          pages: [200, 201, 202, 203, 204],
          intro:
            "The whole method applied to one flight, with a diversion, fuel " +
            "policy and forecast winds — the shape the exam question takes.",
          context:
            "Read the operational information as carefully as the route. The " +
            "fuel rules in this example carry a trap worth flagging: " +
            "contingency fuel applies to the route and the diversion, and not to " +
            "taxi, take-off, approaches, missed approaches or holding.",
        },
        {
          title: "Equal Time Point",
          pages: [205, 206, 207],
          intro:
            "The point at which going on and turning back take the same time. It " +
            "is a wind problem, not a fuel one.",
          definition:
            "The equal time point, also called the critical point, is the point " +
            "in a flight where it would take the same time to continue as to " +
            "track back to the departure aerodrome.",
          term: "Equal Time Point (ETP)",
          keyPoints: [
            "The ETP depends on wind, not on fuel.",
            "In nil wind it lies halfway between the two aerodromes.",
            "In any wind it moves — the note here is that it shifts toward the destination.",
            "It is worked from total distance, groundspeed on and groundspeed home.",
          ],
          misconception:
            "Confusing the ETP with the PNR. They answer different questions " +
            "and depend on different things: the ETP is about time and wind, the " +
            "PNR is about fuel endurance.",
        },
        {
          title: "Point of No Return",
          pages: [208, 209, 210, 211, 212, 213],
          intro:
            "The last point at which you can still get back. Beyond it the " +
            "option is closed, and endurance is what closes it.",
          definition:
            "The point of no return is the point at which an aircraft has just " +
            "enough fuel, plus any mandatory reserve, to return to the aerodrome " +
            "it departed from.",
          term: "Point of No Return (PNR)",
          keyPoints: [
            "Fuel endurance is the main factor, unlike the ETP.",
            "Work with safe endurance: reduce total endurance by the reserves, then by contingency.",
            "The answer comes out as a time — convert it to a distance using the groundspeed out.",
            "A question may ask for the distance from departure or from destination; the arithmetic is yours to finish.",
          ],
          example:
            "Total endurance 225 minutes, less a 45-minute fixed reserve, is " +
            "180; divided by 1.10 to remove 10% contingency gives 164 minutes of " +
            "safe endurance to work with. (From the course notes.)",
          exampleTitle: "Worked example, from the course notes",
        },
        {
          title: "Great Circles and Rhumb Lines",
          pages: [234],
          intro:
            "The two ways of drawing a line between two points on a sphere, and " +
            "why a chart has to choose one. The manual makes the point in a " +
            "single figure.",
          diagramNotes: {
            234:
              "The same two points, A and B, on a globe and on a flat chart. On " +
              "the globe the great circle is the shorter path and crosses each " +
              "meridian at a different angle; the rhumb line holds one constant " +
              "angle and is longer. Flattened onto the chart the rhumb line is " +
              "the straight one — which is why a straight line drawn on a chart " +
              "is not the shortest way there.",
          },
        },
      ],
    },
  ],
};

export default subject;
