/**
 * PPL Flight Radiotelephony — the curriculum.
 *
 * The deck is a 157-slide lecture set and it arrived in better order than any
 * of the other four: it carries six section dividers of its own, its slides
 * have real titles, and its material is already sequenced roughly the way an
 * instructor would teach it. What it does not have is a course. The importer
 * turned it into 85 lessons named after whichever slide fell first in each
 * run, with no chapter summaries, no lead-ins and nothing to tell a student
 * why a topic is where it is.
 *
 * So the deck's own six sections are kept as the spine and opened out into
 * fourteen chapters, because a section called "Radio Procedures" covering
 * fifty-nine slides is not a chapter — it is most of the subject. The order
 * within them is the deck's, which is sound: how radio works, the radio in
 * this aeroplane, then the words, then who you are talking to, then what you
 * say to them, and only then the cases where it goes wrong.
 *
 * One decision worth stating. The last nineteen slides quote Civil Aviation
 * Rules — 91.217, 91.243, 91.245, 91.247, 91.249, 91.513, 91.515, 91.529 — as
 * blocks of rule text. They are kept, verbatim and attributed to the rule they
 * came from, because the rule wording is the examinable thing and paraphrasing
 * a rule is how a course starts teaching something the regulator did not say.
 * They are gathered into one closing chapter rather than scattered, so a
 * student meets them as a set once the operational material makes sense.
 */

import { repairSlide } from "./deck-repairs.mjs";
import { isRejectedImage, isUpsideDown } from "./flight-radiotelephony-diagrams.mjs";

/**
 * Repairs this deck needs that no other deck needs. Empty: the only slide-level
 * fault found in it — a third-party simulator URL — belongs to Navigation, and
 * everything else this deck needed is in the shared repair set.
 */
const TABLES = {
  callouts: {
    // Slide 84 is the light signal table, and it cannot be rebuilt from what
    // the extractor produced: the colour of each signal was the fill colour of
    // the cell, not text in it, so the rows arrive as "SOLID Cleared to land
    // Cleared to takeoff" with the word GREEN nowhere on the slide. Rebuilding
    // it would mean supplying the colours from knowledge and presenting them as
    // the deck's own. The cells are dropped instead and the table is taught in
    // an authored block, which says so.
    84: [
      "Colour and type Flight procedure Ground procedure",
      "SOLID Cleared to land Cleared to takeoff",
      "SOLID Give way and continue circling",
      "Stop",
      "FLASHING Return for landing Cleared to taxi",
      "FLASHING Aerodrome unsafe – do not land",
      "Taxi clear of landing area in use",
      "WHITE FLASHES Land and proceed to apron Return to starting point on aerodrome",
      "ALTERNATING",
      "RED/GREEN FLASHES",
      "Danger – be on alert Danger – be on alert",
      "Light Signals",
    ],
  },
  substitutions: {
    // A pointer to the next slide of a deck a student is not looking at.
    114: [["May be augmented with an AWIB [see next slide]", "May be augmented with an AWIB"]],
  },
  titles: {
    // The layout put a table cell where the title belongs: "RED PYROTECHNIC Do
    // not land for time being". It is a row of the light signal table, not a
    // heading, and the table it belongs to is taught in the authored block.
    84: null,
    // Both ATIS slides put the first bullet of the list where the title should
    // be. The real title is the service the two slides are about.
    104: "Automatic Terminal Information Service (ATIS)",
    105: "Automatic Terminal Information Service (ATIS)",
  },
};

export const subject = {
  slug: "flight-radiotelephony",
  title: "Flight Radiotelephony",
  deck: "flight-radio",
  repairSlide: (blocks, context) => repairSlide(blocks, { ...context, tables: TABLES }),
  isRejectedImage,
  isUpsideDown,

  // The per-slide repair tables, exposed so the conservation test can tell a
  // hand-checked correction from a rewrite: a block whose words differ from
  // the slide's is a failure unless a substitution written down here is why.
  repairs: TABLES,

  skip: {
    1: "The deck cover: the subject name over a title slide, with no teaching on it.",
    2: "The exam format — “40 minutes, 25 multi-choice questions”. True, and stated on the course page already; it teaches nothing.",
    3: "Section divider announcing “Radio Principles”. The name is kept as course structure; the slide carries nothing else.",
    42: "The words “Radio Wave Propagation” alone on a slide — a heading whose body is on the slides that follow it.",
    48: "Section divider announcing “Words and Phrases”.",
    56: "Section divider announcing “Radio Procedures”.",
    91: "Section divider announcing “Position Reporting”.",
    100: "The words “Radio Procedures – Aerodromes” alone on a slide: a heading for the run that follows.",
    117: "The words “Radio Procedures – Controlled Airspace” alone on a slide: a heading for the run that follows.",
    123: "The words “Emergency Radio Procedures” alone on a slide: a heading for the run that follows.",
    138: "Section divider announcing “Pilot Responsibilities”.",
    142: "Section divider announcing “Civil Aviation Rules”.",
  },

  chapters: [
    {
      title: "How Radio Works",
      syllabus: ["2.2"],
      intro:
        "Radio is the only thing in the aeroplane a pilot uses constantly and " +
        "cannot see working. This chapter is the physics behind it — what a wave " +
        "is, what frequency and wavelength mean, and why aviation settled on VHF " +
        "— because the limitations that follow from it decide who you can talk to " +
        "and from where.",
      topics: [
        {
          title: "Sound Waves and Frequency",
          pages: [4, 5, 6],
          intro:
            "Where the signal starts: a pressure wave in air, and the two " +
            "measurements used to describe any wave at all.",
          keyPoints: [
            "Sound needs a medium — air, water — and travels faster in a denser one.",
            "Frequency is cycles per second: 1 cycle per second is 1 hertz, and 1,000,000 Hz is 1 megahertz.",
            "Human hearing runs from roughly 20 Hz to 20,000 Hz, which is why a radio has to carry the voice on something else entirely.",
          ],
        },
        {
          title: "Wave Characteristics",
          pages: [7],
          intro:
            "The parts of a wave named on one diagram: crest, trough, amplitude, " +
            "wavelength.",
          diagramNotes: {
            7: "A transverse wave and a longitudinal wave: the first oscillates across the direction of travel, the second compresses and expands along it.",
          },
          keyPoints: [
            "Crest and trough: the highest and lowest points of the wave.",
            "Amplitude: the height of the crest above the resting line. It is the strength of the signal, and it is what falls away with distance.",
            "Wavelength: the distance from one crest to the next. It is what the frequency band names refer to, and it decides how the wave behaves around obstacles.",
            "Frequency: how many complete waves pass a point each second, measured in hertz. Wavelength and frequency are two ways of saying the same thing - as one goes up the other comes down.",
          ],
        },
        {
          title: "Radio Waves",
          pages: [8, 9],
          intro:
            "What makes a radio wave different from a sound wave, and what that " +
            "difference buys.",
          takeaway:
            "A radio wave is electromagnetic and needs no medium at all, which is " +
            "why it works where sound cannot and travels at the speed of light " +
            "rather than the speed of sound. The microphone's job is to turn one " +
            "into the other.",
        },
        {
          title: "Wavelength, Frequency and Amplitude",
          pages: [10, 11, 12, 13],
          intro:
            "The three terms an exam question will use, and the relationship " +
            "between the first two.",
          keyPoints: [
            "Wavelength is the length of one complete wave.",
            "Frequency is the number of cycles passing a point in one second.",
            "As frequency increases, wavelength decreases — they are inversely related, and the aviation bands are named after the frequency.",
            "Amplitude is the height of the wave from the mean line, and it is what carries the strength of the signal.",
          ],
        },
        {
          title: "Frequency Bands, and Why Aviation Uses VHF",
          pages: [14, 15],
          intro:
            "The two bands a light aircraft pilot meets, and the reasons the " +
            "everyday one is VHF.",
        },
        {
          title: "VHF Range and Line of Sight",
          pages: [16, 17],
          intro:
            "The single limitation that governs every VHF call you will ever make.",
          context:
            "VHF is line of sight, so the range is a geometry problem rather than a " +
            "power problem. Climb and the horizon moves away from you, and the " +
            "range goes with it — which is why a station you cannot raise on the " +
            "ground often answers a few thousand feet higher, and why relay " +
            "equipment is put on high ground rather than beside the aerodrome.",
        },
      ],
    },

    {
      title: "The Radio in the Aircraft",
      syllabus: ["2.4", "2.6"],
      intro:
        "The equipment itself: what is in the stack, how it is switched on and " +
        "tuned, how the microphone is used, and what to check when nothing " +
        "happens. Most radio failures a student meets are not failures at all.",
      topics: [
        {
          title: "Aircraft Radios and Associated Equipment",
          pages: [18, 19],
          intro:
            "The radio, and everything around it that has to be working for it to " +
            "be any use.",
          takeaway:
            "The radio is one item in a chain and every link in it can break the " +
            "transmission on its own: the master and avionics switches that power " +
            "it, the audio selector panel that decides which radio you are " +
            "listening to and talking on, the headset and its plugs, and the " +
            "microphone itself. A radio that appears dead is usually one of those " +
            "rather than the radio, which is why the check runs along the chain " +
            "rather than starting with the set.",
        },
        {
          title: "Microphones",
          pages: [20, 21, 22],
          intro:
            "Boom and hand-held microphones, how they are spoken into, and the one " +
            "consequence of the transmit button nobody mentions until it matters.",
          misconception:
            "Assuming you would hear someone else if they were talking. You would " +
            "not: transmitting blocks receiving on that frequency, and two aircraft " +
            "transmitting together block each other and everybody else. That is why " +
            "the drill is to listen first, think, then press — and why an " +
            "unnoticed stuck transmit button silences a whole frequency.",
        },
        {
          title: "Tuning the Radio",
          pages: [23],
          intro:
            "The order to do it in, from avionics master to audio panel.",
        },
        {
          title: "Squelch",
          pages: [24],
          intro:
            "The control that removes the hiss, and the reason to open it up when " +
            "you are a long way from the station.",
        },
        {
          title: "Transmitting",
          pages: [25],
          intro:
            "What to do before pressing the button, and when not to press it at all.",
        },
        {
          title: "When the Radio Will Not Work",
          pages: [26],
          intro:
            "The check list to run before concluding the radio has failed.",
          takeaway:
            "Masters, audio panel, circuit breakers, plugs, frequency, volume, " +
            "squelch. Almost every “dead radio” in training is one of those seven, " +
            "and running them in order takes about fifteen seconds.",
        },
        {
          title: "Other Radio Equipment on Board",
          pages: [27],
          intro:
            "The two other transmitters in the aeroplane, both of which have their " +
            "own chapters later.",
          takeaway:
            "Both transmit without you speaking into anything. The transponder " +
            "answers radar automatically whenever it is interrogated, and the ELT " +
            "transmits on impact whether or not anyone is conscious to switch it " +
            "on. Knowing that is what makes the chapters on each of them make " +
            "sense: neither is a radio you talk on, and both can be transmitting " +
            "when you have not noticed.",
        },
      ],
    },

    {
      title: "Transponders",
      syllabus: ["2.4", "2.6"],
      intro:
        "The transponder answers radar on your behalf, and in some airspace you " +
        "may not enter without one. This chapter covers what it sends, the modes " +
        "it sends it in, the codes worth knowing by heart, and how to find out " +
        "where it is required.",
      topics: [
        {
          title: "What a Transponder Does",
          pages: [28],
          intro:
            "Interrogation and reply, and who is listening to the answer.",
          context:
            "A transponder is not a transmitter you talk on and not a receiver " +
            "you listen to. It sits silent until a radar interrogates it, and " +
            "then replies with a coded pulse that tells the radar which aircraft " +
            "this is - and, with Mode C, what level it is at. The radar measures " +
            "how long the reply took to come back and turns that into a distance, " +
            "and how far round the aerial was pointing and turns that into a " +
            "bearing. That is why a transponder gives a controller a labelled " +
            "target instead of an anonymous blip, and why it does nothing at all " +
            "when it is switched to standby.",
        },
        {
          title: "Transponder Mandatory Airspace",
          pages: [29, 30, 31, 32],
          intro:
            "Where a transponder is required, and the two documents that tell you.",
          diagramNotes: {
            30: "The AIP New Zealand: the publication the airspace requirements are drawn from.",
            32: "A visual navigation chart: TM marks transponder mandatory airspace, C is the airspace class, 1500/SFC the vertical limits, and 120.6 the tower frequency.",
          },
          takeaway:
            "Both documents say the same thing and they are read at different " +
            "times. The visual navigation chart shows it in place, in the " +
            "annotation beside the boundary - the class, the vertical limits, the " +
            "frequency and the TM that makes it transponder mandatory - which is " +
            "what you use in flight. The AIP carries the full description, which " +
            "is what you plan from. What a chart annotation never shows is the " +
            "reason: TM airspace exists because the controller's picture of it is " +
            "built from transponder replies.",
        },
        {
          title: "Transponder Modes",
          pages: [33],
          intro:
            "Mode A, Mode C and Mode S, and what each adds to the reply.",
          keyPoints: [
            "Mode A: the four-digit code alone.",
            "Mode C: the code plus pressure altitude.",
            "Mode S: the code, pressure altitude and the aircraft's identity.",
          ],
        },
        {
          title: "Operating the Transponder",
          pages: [34],
          intro:
            "The switch positions, and what each one is actually doing.",
        },
        {
          title: "The Codes to Know",
          pages: [35],
          intro:
            "Five codes a PPL is expected to know without looking them up.",
          keyPoints: [
            "1200 — VFR.",
            "2200 — VFR in the circuit at a controlled aerodrome.",
            "7500 — unlawful interference.",
            "7600 — communications failure.",
            "7700 — emergency.",
          ],
          context:
            "The three emergency codes are worth a mnemonic because they are needed " +
            "at the worst possible moment: 7500 taken (hijack), 7600 spoken (radio " +
            "failure), 7700 broken (emergency). Selecting one is also the fastest " +
            "way to tell a controller something when the radio is the thing that " +
            "has failed.",
        },
        {
          title: "Flying Without a Transponder",
          pages: [36],
          intro:
            "What is possible when the transponder is unserviceable, and the two " +
            "words you must add to your call.",
          takeaway:
            "Two words, and they change what the controller can do for you. " +
            "Adding \u201cnegative transponder\u201d to the call tells them that " +
            "they will see you on primary radar at best and possibly not at all, " +
            "that they have no automatic readout of your level, and that " +
            "separation from you has to be built by hand from what you tell them. " +
            "Entry may still be approved - but only because you said it, and only " +
            "on their terms.",
        },
      ],
    },

    {
      title: "HF and Radio Propagation",
      syllabus: ["2.2"],
      intro:
        "Why a signal that should stop at the horizon sometimes reaches a " +
        "thousand miles, and why one that reaches a thousand miles can be " +
        "unusable at two hundred. HF is not the everyday band, but the " +
        "propagation behind it is examinable and explains VHF's limits too.",
      topics: [
        {
          title: "Long Range HF",
          pages: [37, 38, 39, 40],
          intro:
            "Where HF is used, how it gets its range, and what it costs in signal " +
            "quality.",
          diagramNotes: {
            39: "The ionosphere reflecting the sky wave back to earth, with the ground wave beneath it and the skip zone between the two.",
          },
          context:
            "The advantages and the disadvantages on this slide are the same " +
            "property seen twice. HF gets its range because the ionosphere " +
            "reflects the signal back down, so it can reach beyond the horizon " +
            "and around terrain in a way VHF never can - and because the signal " +
            "has bounced, it arrives having travelled several paths of different " +
            "lengths and having picked up whatever the atmosphere added on the " +
            "way. That is why HF sounds the way it does, and why it is used where " +
            "nothing else reaches rather than where something else does.",
        },
        {
          title: "Aircraft Antennas",
          pages: [41],
          intro:
            "Which aerial on the airframe belongs to which system.",
          diagramNotes: {
            41: "HF as a cable along the fuselage, the VHF blades, the GPS patch, the ELT aerial and the VOR aerials on the fin.",
          },
          takeaway:
            "Knowing which aerial belongs to which system is worth a minute on " +
            "the walk-around. A VHF blade snapped off, an HF cable hanging loose " +
            "or a bent ELT aerial are all things you can see from the ground and " +
            "none of them announce themselves in the cockpit until you need the " +
            "system. It also explains why radio range changes with attitude: an " +
            "aerial mounted under the fuselage is shielded by the aeroplane when " +
            "you are turning away from the station.",
        },
        {
          title: "How Radio Waves Propagate",
          pages: [43],
          intro:
            "Surface waves, sky waves and direct waves, set against the bands that " +
            "use them.",
        },
        {
          title: "The Disadvantages of HF",
          pages: [44],
          intro:
            "Bending, reflection, interference and static — everything that makes " +
            "HF harder to listen to than VHF.",
          context:
            "The slide lists five susceptibilities, and each one is the same trade " +
            "seen from a different side. Bending and reflection are what give HF " +
            "its range, and they are also why the signal arrives having travelled " +
            "several different paths of different lengths, which smears it. " +
            "Atmospheric interference is the ionosphere itself — the layer doing " +
            "the reflecting changes with the time of day and with solar activity, " +
            "so a frequency that worked this morning may not work tonight. " +
            "Artificial interference is everything electrical between you and the " +
            "station. And the static is constant rather than occasional, which is " +
            "why HF is tiring to listen to and why VHF is used for everything " +
            "within line of sight.",
        },
        {
          title: "Sky Waves, Skip Distance and Dead Space",
          pages: [45, 46],
          intro:
            "The gap in coverage that reflection creates, and the two terms for " +
            "describing it.",
          keyPoints: [
            "The surface wave dies out at some distance from the transmitter; the sky wave returns to earth further out.",
            "Between the two there is dead space, where neither reaches — a station can be unreadable at 100 nm and perfectly readable at 400 nm.",
            "Skip distance is the distance from the transmitter to where the sky wave first returns.",
          ],
        },
        {
          title: "VHF and UHF Range",
          pages: [47],
          intro:
            "The line-of-sight calculation, and the ten per cent the atmosphere " +
            "gives you for free.",
        },
      ],
    },

    {
      title: "Words, Numbers and Time",
      syllabus: ["2.12"],
      intro:
        "Radiotelephony is a restricted language on purpose: the alphabet, the " +
        "numbers and the standard words exist so that a message survives a bad " +
        "signal and an unfamiliar accent. This is the part of the subject that " +
        "has to be learnt by heart, and the exam tests it directly.",
      topics: [
        {
          title: "The Phonetic Alphabet",
          pages: [49, 50],
          intro:
            "All twenty-six code words, with the pronunciation the ICAO alphabet " +
            "specifies rather than the one that seems obvious.",
          context:
            "The pronunciations are part of the standard, not a suggestion: it is " +
            "AL-fah, not al-FAH, and no VEM-ber rather than no-VEM-ber. They were " +
            "chosen to survive distortion and to sound unlike one another, which " +
            "only works if everyone says them the same way.",
        },
        {
          title: "Pronouncing Numbers",
          pages: [51, 52],
          intro:
            "The nine digits, zero, decimal and hundred — and why three, four, five " +
            "and nine are said differently.",
          keyPoints: [
            "TREE, FOW-er, FIFE and NIN-er exist because three/four/five/nine are the digits most often confused over a poor signal.",
            "Decimal is DAY-SEE-MAL and hundred is HUN-dred.",
            "Numbers are spoken digit by digit except where the standard groups them — a level, a heading and a frequency are each read their own way.",
          ],
        },
        {
          title: "Time in Aviation",
          pages: [53, 54],
          intro:
            "The 24-hour clock, UTC, and converting to and from New Zealand time.",
          misconception:
            "Filing or reporting a time in local time. Aviation runs on UTC because " +
            "an aeroplane can cross time zones inside one flight and a flight plan " +
            "may be read anywhere. Work in UTC and convert only when you are talking " +
            "to someone about their local day.",
        },
        {
          title: "Standard Words and Phrases",
          pages: [55],
          intro:
            "The words that mean one specific thing on the radio, whatever they " +
            "mean in English.",
          context:
            "These are not synonyms for ordinary English and they are not " +
            "intensifiers. Each has one meaning on the radio and is used only " +
            "when that meaning is intended, which is why \u201cimmediate\u201d is " +
            "reserved for when immediate action is genuinely required for safety " +
            "and \u201cexpedite\u201d asks you to be quick without being unsafe. " +
            "Using them loosely devalues them for everybody on the frequency, and " +
            "hearing them and not reacting is worse.",
        },
      ],
    },

    {
      title: "Callsigns",
      syllabus: ["2.10"],
      intro:
        "Every transmission names who is being called and who is calling. This " +
        "chapter covers the three forms an aircraft callsign takes, how it is " +
        "abbreviated once contact is established, and the callsign of every kind " +
        "of ground station you will hear.",
      topics: [
        {
          title: "Aircraft Callsigns",
          pages: [57, 58, 59, 60],
          intro:
            "The three types, what to include in the first call, and what may be " +
            "dropped afterwards.",
          keyPoints: [
            "Registration letters: ZK-NFO spoken as “November Foxtrot Oscar”. The ZK is not transmitted.",
            "Telephony designator plus registration: “KAT-AIR Charlie Delta Echo”.",
            "Telephony designator plus flight identification, which requires an air operator certificate: “RUSHAIR WUN FIFE”.",
            "The aircraft type goes in the initial call — “Cessna 152, November Foxtrot Oscar” — so the station knows what it is dealing with.",
          ],
        },
        {
          title: "Ground Station Callsigns",
          pages: [61, 62],
          intro:
            "Control, Approach, Tower, Ground, Radar, Flight Service, Information — " +
            "and what each one is responsible for.",
          takeaway:
            "The suffix tells you what the station can do for you. Tower controls " +
            "the aerodrome and its immediate airspace; Approach and Control handle " +
            "the airspace beyond it; Flight Service and Information give " +
            "information and cannot issue a clearance. Calling the wrong one wastes " +
            "the time of both.",
        },
      ],
    },

    {
      title: "Finding the Frequency",
      syllabus: ["2.10"],
      intro:
        "Before any of the phraseology matters, you have to know who to call and " +
        "on what. Every frequency you will ever need is published, and this " +
        "chapter is about finding it in the documents rather than remembering it.",
      topics: [
        {
          title: "Where Frequencies Are Published",
          pages: [63, 64],
          intro:
            "The four places to look, and which one to reach for first.",
          takeaway:
            "Three places, and they answer different questions. The visual " +
            "navigation chart gives you the frequency for the area or the " +
            "aerodrome you are looking at, which is what you want in flight. The " +
            "AIP aerodrome entry gives you the full list for one aerodrome, " +
            "including the ones the chart has no room for. And the AIP " +
            "communication listings give you everything for the whole country, " +
            "which is what you plan a long cross-country from.",
        },
        {
          title: "Aerodrome Charts",
          pages: [65, 66],
          intro:
            "Reading the frequencies off an AIP aerodrome chart.",
          diagramNotes: {
            65: "An AIP aerodrome chart: the frequencies are in the header block above the plan.",
            66: "A second aerodrome chart, laid out the same way — the format does not change between aerodromes.",
          },
          takeaway:
            "The value of the AIP aerodrome chart to a radio operator is that the " +
            "layout never changes. The frequency block is always in the same " +
            "place in the header, so you can find the tower, ground, ATIS or AWIB " +
            "frequency for an aerodrome you have never been to in a couple of " +
            "seconds. Learning where to look once is worth more than memorising " +
            "any individual frequency.",
        },
        {
          title: "Communication Listings",
          pages: [67],
          intro:
            "The listing that gives services, frequencies and hours of watch in one " +
            "table.",
          diagramNotes: {
            67: [
              "The communication listing: location down the left, the service beside it, then the frequency and the hours that service is on watch.",
              "Hours are the thing pilots miss. A frequency listed against a service that is closed is a frequency nobody is listening on.",
            ],
          },
        },
        {
          title: "Chart Symbols",
          pages: [68, 69, 70, 71],
          intro:
            "The symbols used on aerodrome and navigation charts, which are worth " +
            "recognising before you need one in flight.",
          context:
            "The legend is the part of a chart most pilots never sit down with, " +
            "and the half hour spent on it is repaid on every flight afterwards. " +
            "What matters for the radio is the frequency information: each " +
            "aerodrome carries the services available and the frequencies for " +
            "them, each control zone and broadcast area carries its own, and the " +
            "symbology distinguishes a tower from a flight service station from a " +
            "common frequency zone. Knowing which one you are looking at tells " +
            "you what to expect when you call.",
        },
      ],
    },

    {
      title: "Making a Radio Call",
      syllabus: ["2.12"],
      intro:
        "The shape of a transmission, what has to be read back and what does " +
        "not, how to check the radio is working, and the listening obligations " +
        "that apply even when you have nothing to say.",
      topics: [
        {
          title: "The Structure of a Call",
          pages: [72],
          intro:
            "Initial call, reply, subsequent calls, acknowledgement, correction — " +
            "the five parts of any exchange.",
          context:
            "Every radio exchange has this shape, and knowing the shape is what " +
            "lets you follow a conversation you are not part of. The initial call " +
            "says who you are calling and who you are; the reply establishes that " +
            "they heard you; the subsequent call carries the message; the " +
            "acknowledgement confirms it arrived; and the correction exists " +
            "because it will sometimes not have. Plan the whole exchange before " +
            "you press the button - who, who, where, what - and the call comes " +
            "out in one piece.",
        },
        {
          title: "Read-Back",
          pages: [73, 74, 75],
          intro:
            "Why read-back exists, and the specific items that must be read back " +
            "rather than acknowledged.",
          keyPoints: [
            "ATC departure and route clearances.",
            "Controlled VFR instructions, level instructions, SSR codes and QNH.",
            "Runway operations — anything about entering, crossing, lining up on or leaving a runway.",
            "Conditional clearances, and frequency changes.",
          ],
          context:
            "Read-back is a defence against the thing that goes wrong most often on " +
            "a radio: both people believing the message got through. Reading it " +
            "back gives the controller a chance to hear their own instruction come " +
            "out wrong. If you are not certain what was said, the correct action is " +
            "to say so — “say again” costs five seconds and nothing else.",
        },
        {
          title: "Radio Test Procedures and the Readability Scale",
          pages: [85, 86],
          intro:
            "How to ask for a radio check, and the five-point scale the answer " +
            "comes back on.",
          keyPoints: [
            "1 — unreadable. 2 — readable now and then. 3 — readable but with difficulty. 4 — readable. 5 — perfectly readable.",
            "Check the radio before start where you can: listening to the ATIS proves reception, and a signal check proves transmission.",
          ],
        },
        {
          title: "Listening Watch",
          pages: [87],
          intro:
            "What a listening watch is, and the airspace where keeping one is a " +
            "requirement rather than good manners.",
        },
        {
          title: "Traffic Information Broadcasts by Aircraft",
          pages: [88, 89, 90],
          intro:
            "What TIBA is for, when it is introduced, and the times at which you " +
            "broadcast.",
          context:
            "TIBA is what happens when the air traffic service itself stops — a fire " +
            "or an earthquake takes a tower out — and aircraft have to separate " +
            "themselves by telling each other where they are. It is rare, it is " +
            "examinable, and the procedures live in the pink pages of the AIP.",
        },
      ],
    },

    {
      title: "When Communication Fails",
      syllabus: ["2.14", "2.16", "2.18"],
      intro:
        "A radio failure is not an emergency, but it becomes one if it is " +
        "handled badly. The order matters: fly the aeroplane, work the problem, " +
        "and know how to be told what to do without a radio at all.",
      topics: [
        {
          title: "Loss of Radio Communication",
          pages: [76, 77, 78],
          intro:
            "The first actions, the trouble checks, and what to try when those do " +
            "not fix it.",
          takeaway:
            "Fly the aeroplane first. A radio failure changes nothing about lookout, " +
            "terrain or the aircraft's fuel state, and every accident report that " +
            "starts with a minor technical problem contains somebody who stopped " +
            "flying to fix it.",
        },
        {
          title: "Repeaters and Terrain",
          pages: [79],
          intro:
            "Why coverage in mountainous country is not the same as coverage on the " +
            "map, and the height below which a repeater cannot generally be relied " +
            "upon.",
          context:
            "A repeater is a receiver and transmitter on high ground that hears you " +
            "and passes the call on, and it is how a service covers country a " +
            "single station could never see into. It is still line of sight: down " +
            "a valley, with a ridge between you and the hilltop, the repeater " +
            "cannot hear you any more than the station could. That is what the " +
            "4,000 ft figure is about — below it, in this terrain, coverage becomes " +
            "a matter of where you happen to be rather than something to plan on. " +
            "Plan the call for where you will be high enough to make it, and do " +
            "not leave a position report until you are in the valley.",
        },
        {
          title: "Flight Information Service Communications",
          pages: [80, 81],
          intro:
            "The FISCOM frequencies, and where to find the one covering where you " +
            "are.",
          diagramNotes: {
            80: "The FISCOM chart: the country divided into areas, each with the frequency to call the flight information service on.",
            81: "The same information in tabular form, which is the quicker way to find a frequency once you know which area you are in.",
          },
        },
        {
          title: "The Speechless Technique",
          pages: [82],
          intro:
            "Answering with the transmit button when the microphone will not carry " +
            "your voice.",
          // The slide numbers the four answers 1 to 4 and prints nothing after
          // the colons: the click counts were the numbering itself, which is not
          // obvious on the page. Spelled out here rather than left ambiguous.
          keyPoints: [
            "The number in front of each answer is the number of times you press the transmit button — the clicks are the message.",
            "One click: yes, or roger.",
            "Two clicks: no.",
            "Three clicks: say again.",
            "Four clicks: I am at the position you nominated.",
          ],
          context:
            "This is for the case where your receiver works and your transmitter " +
            "will not carry speech — a failed microphone, a failed headset lead. " +
            "The station can hear the carrier every time you key the button even " +
            "though it hears no words, so it asks questions you can answer yes or " +
            "no, and counts. It only works if the controller knows that is what " +
            "you are doing, so the pattern is worth knowing before you need it.",
        },
        {
          title: "Light Signals",
          pages: [83, 84],
          intro:
            "The signals a tower can give an aircraft with no radio at all, in the " +
            "air and on the ground.",
          keyPoints: [
            "Steady green: cleared to land in the air, cleared for take-off on the ground.",
            "Steady red: give way to other aircraft and continue circling; on the ground, stop.",
            "Green flashes: return for landing in the air; cleared to taxi on the ground.",
            "Red flashes: aerodrome unsafe, do not land; on the ground, taxi clear of the landing area.",
            "White flashes: land at this aerodrome and proceed to the apron; on the ground, return to the starting point.",
            "Red and green alternating: danger, be on the alert.",
            "A red pyrotechnic: do not land for the time being — the one signal that is fired rather than shone.",
          ],
          context:
            "These have to be memorised rather than looked up, because the situation " +
            "in which they are used is the one where you cannot ask. The pattern " +
            "that helps: green permits, red forbids, flashing modifies, and " +
            "alternating red and green is a warning rather than an instruction.",
        },
      ],
    },

    {
      title: "Position Reporting",
      syllabus: ["2.12"],
      intro:
        "Telling other people where you are, when you are required to and what " +
        "the report must contain. In uncontrolled airspace this is the whole of " +
        "the separation system, and it only works if the reports are complete.",
      topics: [
        {
          title: "When You Must Broadcast",
          pages: [92],
          intro:
            "The occasions where a broadcast or a report is required rather than " +
            "optional.",
        },
        {
          title: "The Contents of a Position Report",
          pages: [93],
          intro:
            "The seven items, in the order they are said.",
          keyPoints: [
            "Identification · position · time at that position · altitude or level · intended route · next position and ETA · request for clearance where one is needed.",
            "The order is fixed so the person writing it down knows what is coming next.",
          ],
        },
        {
          title: "Reporting Enroute VFR",
          pages: [94],
          intro:
            "The three kinds of aerodrome you will be reporting to, and how they " +
            "differ.",
          keyPoints: [
            "Unattended: nobody is listening on your behalf, so you broadcast to other traffic and build your own picture from what they broadcast back.",
            "Flight service: somebody is listening and will give you information, but cannot clear you to do anything.",
            "Controlled: somebody is listening, is separating traffic, and issues clearances you must read back and comply with.",
            "The difference is not how busy the aerodrome is — it is who, if anyone, is responsible for keeping you apart from other aircraft.",
          ],
        },
        {
          title: "Flight Information Service",
          pages: [95, 96],
          intro:
            "What a flight information service will tell you, and what it will not.",
          context:
            "A flight information service gives you information and advice, and " +
            "the responsibility for what you do with it stays with you. That " +
            "distinction is the whole of it. Weather, traffic, aerodrome " +
            "conditions and serviceability all come from a flight information " +
            "service; clearances and separation do not, and a pilot who treats an " +
            "information service as though it were a control service has quietly " +
            "transferred a responsibility that nobody accepted.",
        },
        {
          title: "Reading the Visual Navigation Chart",
          pages: [97, 98],
          intro:
            "Finding the frequency, the airspace and the reporting points on the " +
            "chart you already have on your knee.",
          takeaway:
            "Read the chart for the radio the same way you read it for " +
            "navigation: along the track, in order, before you take off. Every " +
            "boundary you will cross has a frequency attached to it, and the " +
            "point of finding them on the ground is that the call then happens at " +
            "the right time rather than after the boundary has gone past.",
        },
        {
          title: "Transponder Operations in Flight",
          pages: [99],
          intro:
            "What the transponder should be set to at each stage, and when the code " +
            "changes.",
        },
      ],
    },

    {
      title: "Radio at Aerodromes",
      syllabus: ["2.12"],
      intro:
        "Four kinds of aerodrome, four different sets of expectations. The " +
        "difference between a clearance and information matters here more than " +
        "anywhere else in the subject: at one of these aerodromes somebody is " +
        "responsible for separating you, and at the others nobody is.",
      topics: [
        {
          title: "Controlled Aerodromes",
          pages: [101, 102, 103],
          intro:
            "How to tell one from the chart, which tower frequency is the primary " +
            "one, and where the hours of watch are published.",
        },
        {
          title: "The Automatic Terminal Information Service",
          pages: [104, 105],
          intro:
            "What an ATIS contains, and what you do with the code letter.",
          takeaway:
            "Listen to the ATIS before you call, and tell the controller which " +
            "issue you have — “with information Delta”. It saves the controller " +
            "reading you the whole thing, and it proves your radio receives.",
        },
        {
          title: "Calls at a Controlled Aerodrome",
          pages: [106, 107, 108],
          intro:
            "The initial call, the order of a read-back, and what to do when the " +
            "instruction was not clear.",
          keyPoints: [
            "Station addressed · station calling · position · level · intentions.",
            "In a read-back the instruction comes first and your callsign last: “Runway 25 cleared for take-off, Foxtrot Tango Mike”.",
            "Listen → understand → read back → execute. Asking for clarification is never the wrong call.",
          ],
        },
        {
          title: "Flight Information Service Aerodromes",
          pages: [109, 110],
          intro:
            "What an AFIS is, what it will give you, and the fact that the " +
            "aerodrome is still uncontrolled.",
          misconception:
            "Hearing an AFIS as a tower. It is not: an aerodrome flight information " +
            "service issues no clearances, and separating yourself from other " +
            "traffic remains entirely your job. What it gives you is information, " +
            "and it is worth telling it your intentions so the information it gives " +
            "everyone else includes you.",
        },
        {
          title: "Unattended Aerodromes",
          pages: [111, 112],
          intro:
            "How to recognise one, and the broadcast pattern to use when there is " +
            "nobody to talk to.",
          keyPoints: [
            "The AIP chart says UNATTENDED at the top.",
            "Broadcast Position, Altitude, Intentions — PAI — so anyone listening can build a picture without asking.",
          ],
        },
        {
          title: "Mandatory Broadcast Zones",
          pages: [113],
          intro:
            "Where broadcasting is a requirement even though the aerodrome is " +
            "uncontrolled.",
          context:
            "An MBZ is uncontrolled airspace with a communication requirement " +
            "rather than a clearance requirement. Nobody will approve your entry " +
            "and nobody will separate you - what is mandatory is that you " +
            "broadcast your position and intentions on the published frequency so " +
            "that everybody else in the zone can build a picture of where you " +
            "are. That makes the quality of your broadcast the entire safety " +
            "mechanism, which is why the format and the interval are published " +
            "rather than left to preference.",
        },
        {
          title: "UNICOM and AWIB",
          pages: [114, 115],
          intro:
            "A staffed base radio that is not air traffic services, and the " +
            "automatic weather broadcast that often goes with it.",
        },
        {
          title: "Common Frequency Zones",
          pages: [116],
          intro:
            "An area frequency that is not a requirement, and why using it anyway " +
            "is the point.",
          takeaway:
            "A common frequency zone does the same job as a mandatory broadcast " +
            "zone with the compulsion removed: a single published frequency for " +
            "an area so that aircraft operating there are at least listening to " +
            "each other. Broadcasting in one is advisory, and it is worth doing " +
            "anyway - the value of a common frequency depends entirely on how " +
            "many people are actually using it.",
        },
      ],
    },

    {
      title: "Controlled Airspace",
      syllabus: ["2.12"],
      intro:
        "Entering controlled airspace means asking, being told, and reading back " +
        "— in that order and every time. This chapter is the request, the " +
        "phraseology of the answer, and the airspace where there is no radar " +
        "watching you at all.",
      topics: [
        {
          title: "Classes of Controlled Airspace",
          pages: [118],
          intro:
            "The two classes in the New Zealand FIR, and the rule about airspace " +
            "that touches the ground.",
        },
        {
          title: "Requesting a Clearance",
          pages: [119],
          intro:
            "The items a clearance request must contain, in order.",
          keyPoints: [
            "Callsign, with the discrete SSR code if one has been assigned.",
            "Position · level · intentions.",
            "Ask early enough that a refusal still leaves you outside the airspace.",
          ],
        },
        {
          title: "Procedural Airspace",
          pages: [120],
          intro:
            "Airspace where the controller has no radar, and what that means for " +
            "your reporting.",
          context:
            "In procedural airspace the controller's picture of where you are is " +
            "made entirely of what you have told them. Separation is built from " +
            "reported positions and estimates, so a missed or late report is not a " +
            "formality — it is a hole in the only picture anyone has.",
        },
        {
          title: "ATC Phraseology",
          pages: [121],
          intro:
            "The standard instructions you will be given, and what each one " +
            "actually requires of you.",
          takeaway:
            "These instructions differ in what they leave to you, and that is the " +
            "thing to read them for. \u201cCleared at\u201d fixes a level, " +
            "\u201ccleared at or below\u201d gives you a ceiling and lets you " +
            "choose beneath it, \u201cwhen ready\u201d hands you the timing, " +
            "\u201cfly heading\u201d takes the navigation away from you and " +
            "\u201cresume own navigation\u201d gives it back. Reading back the " +
            "words without noticing which of those you have just accepted is how " +
            "pilots end up somewhere they were never cleared to.",
        },
        {
          title: "Transponder Phraseology",
          pages: [122],
          intro:
            "Squawk, reset, confirm, ident — the instructions that concern the " +
            "transponder rather than the aeroplane.",
          context:
            "Almost every instruction on this list is about what the transponder " +
            "is doing rather than what the aeroplane is doing, and two are worth " +
            "separating. \u201cSquawk ident\u201d asks you to press the ident " +
            "button, which makes your return flash on the controller's screen so " +
            "they can pick you out - it is not a code to set. \u201cStop squawk " +
            "Charlie\u201d turns off the level readout while leaving the code on, " +
            "and it is what a controller says when your reported level and your " +
            "Mode C readout disagree.",
        },
      ],
    },

    {
      title: "Emergency Radio Procedures",
      syllabus: ["2.14", "2.16", "2.18"],
      intro:
        "The two emergency calls, what belongs in each, what everyone else on " +
        "the frequency must do about them, and the beacon that transmits when " +
        "nobody is able to. This chapter is short and it is the one worth " +
        "knowing cold.",
      topics: [
        {
          title: "Responsibility and Declaring an Emergency",
          pages: [124, 125],
          intro:
            "Who decides, and the three things that go out when they do.",
          takeaway:
            "The pilot in command is responsible for the safety of the aircraft, " +
            "and that includes deciding that this is now an emergency. Declaring " +
            "one early costs nothing and buys help; declaring one late has been the " +
            "final link in a great many accident chains.",
        },
        {
          title: "The MAYDAY Call",
          pages: [126, 127, 128],
          intro:
            "When it is used, on what frequency, and the order of what you say.",
          keyPoints: [
            "MAYDAY MAYDAY MAYDAY · station addressed · your callsign · the nature of the trouble · your intentions · position, altitude and heading.",
            "Grave and imminent danger requiring immediate assistance — that is the test.",
            "Transmit on the frequency in use; changing frequency to declare an emergency wastes the one thing you are short of.",
          ],
        },
        {
          title: "Radio Silence",
          pages: [129],
          intro:
            "What to do when somebody else makes the call.",
        },
        {
          title: "The PAN-PAN Call",
          pages: [130, 131, 132],
          intro:
            "The urgency call: the same structure, a lower threshold, and a " +
            "different obligation on everyone listening.",
          misconception:
            "Treating PAN-PAN as the call for people who do not want to make a " +
            "fuss. It is a different message: a condition that concerns the safety " +
            "of the aircraft or somebody on board, where immediate assistance is " +
            "not required. If immediate assistance is required, the call is MAYDAY " +
            "and hesitating over which word to use is itself the mistake.",
        },
        {
          title: "Emergency Locator Transmitters",
          pages: [133, 134],
          intro:
            "What an ELT is, how it is armed, and what activates it.",
        },
        {
          title: "Inadvertent Activation and the Self-Test",
          pages: [135, 136, 137],
          intro:
            "How to tell whether yours is transmitting when it should not be, and " +
            "the only five minutes of the hour in which you may test it.",
          keyPoints: [
            "Check the status light, and listen on 121.5 MHz.",
            "A self-test is restricted to the first five minutes of the hour, with the switch left at ARM afterwards.",
            "If a reset is needed, ON for no longer than five seconds.",
          ],
        },
      ],
    },

    {
      title: "Pilot Responsibilities and the Rules",
      syllabus: ["2.10"],
      intro:
        "The obligations that sit on the pilot in command, and then the Civil " +
        "Aviation Rules themselves. The rule text is quoted rather than " +
        "paraphrased: the wording is what is examinable, and a course that " +
        "rewrites a rule starts teaching something the regulator did not say.",
      topics: [
        {
          title: "Who May Operate the Radio",
          pages: [139],
          intro:
            "The qualification required, and the exception for training.",
        },
        {
          title: "Responsibility for Communications",
          pages: [140],
          intro:
            "What the pilot in command is answerable for, and the transmissions " +
            "that are prohibited outright.",
          takeaway:
            "The list of prohibited transmissions has a single principle behind " +
            "it: the frequency belongs to the operation, not to the people on it. " +
            "Everything forbidden here either misleads somebody (false " +
            "transmissions, another station's callsign) or takes up time somebody " +
            "else needs (personal or non-operational chatter). And the " +
            "responsibility for all of it is the pilot in command's, including " +
            "for a passenger who has been handed the microphone.",
        },
        {
          title: "Secrecy of Communications",
          pages: [141],
          intro:
            "What you may do with something you overheard.",
        },
        {
          title: "Pre-Flight Action and Light Signals",
          pages: [143, 144],
          intro:
            "Rule 91.217 on what a pilot must find out before flying, and 91.243 " +
            "on complying with light signals.",
        },
        {
          title: "Operating in Controlled Airspace",
          pages: [145, 146],
          intro:
            "Rule 91.245: the clearance requirement, and the airspace in which " +
            "two-way communication must be maintained.",
          context:
            "This is a long topic because it puts together everything the chapter " +
            "has taught: the clearance you need before entry, the read-back that " +
            "confirms it, the position reports that keep the controller's picture " +
            "current, and the phraseology all of it is carried in. The sequence " +
            "is always the same - request, clearance, read-back, comply, report - " +
            "and the value of knowing it as a sequence is that you can hear where " +
            "in the exchange you are when the frequency is busy.",
        },
        {
          title: "Transponder Requirements",
          pages: [147, 148, 149],
          intro:
            "Rule 91.247: when the transponder must be operated, the code to set, " +
            "and what changes in an emergency.",
          takeaway:
            "The requirement comes from three directions at once, and any one of " +
            "them can bite: the airspace you are in, the level you are at, and " +
            "the equipment carried in the aircraft. Work it out for the route " +
            "before you take off - a transponder mandatory boundary crossed " +
            "without one is a breach whether or not anybody was watching the " +
            "screen.",
        },
        {
          title: "Aircraft Callsigns in the Rules",
          pages: [150, 151],
          intro:
            "Rule 91.249: the callsign forms, and the abbreviation permitted once " +
            "two-way communication is established.",
          context:
            "The point of a callsign is that it is unambiguous the first time, " +
            "and the rules exist because ambiguity on a radio is expensive. Full " +
            "callsign on the initial call, and the abbreviation only after the " +
            "ground station has used it - because it is the station, not the " +
            "pilot, that decides when shortening is safe. Two aircraft with " +
            "similar callsigns on one frequency is the situation every rule in " +
            "this topic is written for.",
        },
        {
          title: "Radio Equipment Required for VFR",
          pages: [152, 153],
          intro:
            "Rules 91.513 and 91.515: the communication equipment a VFR flight must " +
            "carry, and the additional requirement over water.",
        },
        {
          title: "Emergency Locator Transmitter Requirements",
          pages: [154, 155, 156, 157],
          intro:
            "Rule 91.529: when an ELT must be installed, the seven-day exception, " +
            "and the registration obligation on 406 MHz beacons.",
          context:
            "This is the rule behind the equipment chapter earlier: the ELT is not " +
            "optional kit, its battery and inspection are maintenance items with " +
            "dates on them, and a 406 MHz beacon that is not registered tells the " +
            "search organisation nothing about whose aeroplane it is or who to ring.",
        },
      ],
    },
  ],
};
