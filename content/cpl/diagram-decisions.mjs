/**
 * Which CPL source images reach a student, and why the rest do not.
 *
 * A PowerPoint slide is a canvas. When a diagram is built by dropping a photo
 * down and then drawing arrows and labels on top of it, the extractor sees not
 * one picture but six — the photo, and five separate overlay fragments. On the
 * slide those fragments sit over the thing they point at; pulled out on their
 * own they are a red circle, an arrow, and the words "25 Kts" floating in
 * white space.
 *
 * That is the great majority of what is rejected here. It is not a judgement
 * about the diagram: the diagram is kept. It is a judgement about a fragment of
 * the diagram that stopped meaning anything the moment it was separated from
 * it.
 *
 * Every entry was opened and looked at. The reason records what was on the
 * screen, not what the file size suggested — an early pass nearly dropped a
 * 27 kB image on those grounds that turned out to be a legible six-step
 * procedure card for the flight computer.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- third-party academy branding ---------------------------------- */
  "857fd6ad394c010d3ae57123adc737da5dda8691":
    "The New Zealand International Commercial Pilot Academy wordmark and fern, " +
    "561x157, on the wind-calculation slide. Another provider's branding on a " +
    "KiwiPilotPrep page, and not teaching material by any reading.",

  /* ---- overlay fragments: the flight computer wind method (slides 130-132) */
  "476cc9a25182c42b85bce212a17911f119def357":
    "A bare red arrow, 457x176. One of the arrows drawn over the E6-B photograph " +
    "on slide 130; on its own it points at nothing.",
  "0017472deaec1af2cc80aa157e472d6097273766":
    "An empty red circle, 57x54. The ring drawn around the grommet on slide 130.",
  "70ce730ae2180cd899e2d9c323d946e92fa33372":
    "The label “270°” above a red arrow, 128x153. Slide 131's callout for the " +
    "wind direction set under the true index; the value is in the slide text.",
  "6239bce8e48fa7463f91139fbf5055badd7fc61b":
    "The label “25 Kts” on a red arrow, 497x296. Slide 131's callout for the " +
    "wind speed mark; the value is in the slide text.",
  "ef9533d6e3cdda894d2506986b11bde63c1d0f18":
    "An empty red circle, 31x29 — smaller than a line of body text, and blank " +
    "inside. Slide 131.",
  "09cb25bf3cab7492d43733d15bd605f8f87a9bbc":
    "The label “Track 020°” above a red arrow, 296x160. Slide 132's callout for " +
    "the track set under the true index; the value is in the worked example.",
  "3d5c68ab5c31a80147e9b48a02462d06c330ddbe":
    "An empty red circle, 44x40. Slide 132.",

  /* ---- overlay fragments: the 1 in 60 worked example (slide 161) ------- */
  "e4597780371a778a235e618a03937228cde483b2":
    "The label “TE 8°” and an arrow, 136x98. One of seven pieces the drawing on " +
    "slide 161 was built from; the figure they annotate is kept.",
  "ec591204003b922db0aef33de6e9e5d456975411":
    "A track-line segment with no context, 217x88. Slide 161 overlay.",
  "7d8a818f4f32cc8624fc90a285f60051d1eaec60":
    "A track-line segment with no context, 175x89. Slide 161 overlay.",
  "7ef1688c6cc279026cd790cb795ad7f907989640":
    "A track-line segment with no context, 180x88. Slide 161 overlay.",
  "174d82e8d74498068d04156560a53a4f2005bfaf":
    "A line fragment, 403x107. Slide 161 overlay.",
  "3e06bede7a348302236e27556a1486794f495f54":
    "A line fragment, 366x119. Slide 161 overlay.",
  "fcb4faad612c7339efee4e00a0beb1b1a98df264":
    "A single blue line with the words “70 nm” at one end, 749x91. Slide 161's " +
    "distance annotation; the distance is stated in the worked example text.",

  /* ================= CPL Air Law ======================================== */
  "e7cfdd12962c7f89d318e13ffb0709831388239b":
    "The New Zealand International Commercial Pilot Academy wordmark and fern, " +
    "561x157, on four slides. The same file that appears in the Navigation " +
    "deck. Another provider's branding, and not teaching material.",
  "77415df4743414d7631c905c844a8d9a88781661":
    "A plain black arrow, 54x37, on slide 46. A pointer drawn between two boxes " +
    "on the certificate-categories slide; on its own it points at nothing.",
  "44c6f34bb3dc1af82ad5a7e55dee32da9c67b171":
    "An empty red rectangle, 478x29, on slide 42. A highlight box drawn over a " +
    "line of the slide's own text, extracted without the text under it.",
  "bb09a857881de919a687ed1307a70783091e2596":
    "A plain red down-arrow, 45x68, on slide 71. A pointer with nothing at " +
    "either end of it once separated from the slide.",

  /* ================= CPL Meteorology ==================================== */
  // Every one of these is an empty highlight rectangle drawn over a chart to
  // point at a feature. Extracted on its own, each is a coloured outline
  // around nothing.
  "8313d062d58a4b7941e9fd7e5255e671f6b6e199":
    "An empty red rectangle, 86x63, on three of the upper-wind chart slides.",
  "969ce662fdf00862b4a6d46a7ba8a61a76d9ccde":
    "An empty red rectangle, 157x40, on two of the upper-wind chart slides.",
  "5405c7b5e11878fad7a6081858cbe556653677e3":
    "An empty red rectangle, 98x63, on slide 496.",
  "039c855a5f924e74b1ac6996c2547e560cc26d7c":
    "An empty red rectangle, 98x97, on slide 496.",
  "ca0521ff18ced740a2335459699cb4a93cce73fc":
    "An empty red rectangle, 121x122, on slide 497.",
  "dd43ffd265e1b5da0eb2f7ce12493f7eb8728f8d":
    "An empty red rectangle, 86x40, on slide 504.",
  "69fc0e43ace6783add62f8c0db077ef7b6181786":
    "An empty orange rectangle, 144x86, on slide 496.",
  "18ab1aceb21465f0e5dd328e246e8b01baca7992":
    "A red dashed arrow, 345x414, on slide 493. A pointer drawn over a " +
    "significant weather chart; on its own it points at nothing.",

  /* ========== Principles of Flight and Aircraft Performance ============= */
  "94120b2205c83d96f31a333faeab0785b896a7d2":
    "A helicopter silhouette, 472x134, used as decoration on slide 20 of an " +
    "aeroplane subject. The visual counterpart of the CPL(H) footers this deck " +
    "carries: no teaching value, and the wrong aircraft category in front of a " +
    "student sitting the (A) examination.",
  "214aa83deae42ec876204f4193f2e06bc5122869":
    "The word \"Drag\" in white on a black banner, 1350x200 — a section heading " +
    "rendered as an image. Presentation furniture; the chapter it opens is " +
    "named in the curriculum.",
  "926a4fab9e388d56f14615d0835596ee276c852e":
    "A line-drawn cube icon, 200x200, on two slides. Decoration.",
  "5c816e9cc61e180ac3bc7b1fb894a41b5c6f9404":
    "An 81x55 smudge on slide 272 — a fragment cropped so far that nothing in " +
    "it is identifiable.",
  "468ecbad0f6a437057f0e7f6d86c98668c7180b4":
    "A single grey diagonal line, 223x241, with nothing else on it. One stroke " +
    "of a drawing, extracted alone.",
  "7d2dcd966126b2c6b6662d6f491916150c3333ed":
    "A single grey diagonal line, 191x273. As above.",
  "54b9994bc793caf47f2ca43299a2222babf3ae44":
    "A plain grey rule, 113x12, with no ink beyond the line itself.",
  "6a3f3828693886ee9f404b77bb7520da05651b3f":
    "A plain grey rule, 248x12.",
  "4c2c67f60865adb1371a6b5586fc0f7ca1c29940":
    "A plain grey rule, 184x12.",
  "a85d9a485728d854c6c91c239a19da10cf13a252":
    "A blank shape, 92x42, measuring no ink at all.",
  "84d74129ebcd9b1cdef98f85eeec8f184da7ebe0":
    "A blank shape, 102x44, measuring no ink at all.",
  "85952e8311da5d3b6ae4208479e401ecbabcde82":
    "A blank shape, 26x44 — smaller than a line of body text and empty.",
  "c140b7f62c69d794b3e634c08013930ed3345b6a":
    "A blank shape, 40x66, measuring no ink at all.",
  "135bc0b4bcb6c01f72b11c6bbbdf89723ada1b94":
    "A blank shape, 42x30, measuring no ink at all.",

  /* ---- overlay fragments: the equi-time point formula (slide 218) ------ */
  "da69eb45ee014772e9666c68de95a225affa37f8":
    "The words “Distance / On + H” and “ETP nm / H” set at an angle on white, " +
    "891x243. A rotated label from the formula drawing; the formula itself is " +
    "in the slide text directly above it.",
  "862494b65e41b5c9afd9253b6e845ac6c9ea5c14":
    "A single curved line, 888x153, with nothing else on it. The arc the labels " +
    "above were positioned along.",
};

/**
 * Another provider's branding, and third-party watermarks.
 *
 * Found by looking at every one of the 1,137 images the six subjects render,
 * at a size where a corner logo is legible — the earlier passes measured ink
 * and size, and a normal-looking diagram with a wordmark in one corner is
 * exactly the case measurement cannot catch.
 *
 * Three kinds are here. The academy's own mark, on a KiwiPilotPrep page,
 * which is the reason the sweep was run. Other training providers' logos and
 * site watermarks, which are the same problem wearing a different name. And
 * broadcaster and stock-library bugs, which are somebody else's mark on
 * material we are publishing either way.
 *
 * A manufacturer's name on the thing being photographed is not in this list —
 * the Garmin on a GPS unit, the Kidde on a fire extinguisher, the easyJet on
 * an aeroplane. Nor is the Civil Aviation Authority's logo on the CAA's own
 * published safety diagram: that is the regulator attributing its own figure,
 * not a competitor advertising.
 */
export const BRANDED = {
  /* ---- the academy's own mark ---------------------------------------- */
  "dfe52c64aecd0384c42057ca8d98fc74e7c8897d":
    "The New Zealand International Commercial Pilot Academy wordmark and fern " +
    "at 360x101, on Meteorology slide 4. The same mark was already dropped " +
    "from Air Law and Navigation at 561x157; this smaller copy hashes " +
    "differently and survived that pass.",
  "eac0995d63a0a90dee88e7f3ef192ab79210ae15":
    "A screenshot of an academy slide — “Examples for You to do.” — with the " +
    "academy wordmark bottom left and the academy's own slide number, 396, " +
    "bottom right. Meteorology slide 169.",
  "8621a633bafab5bc0ae9767d2ccab6e13327b04d":
    "The academy's “Answers No.1” slide, wordmark and slide number 397 " +
    "included. Meteorology slide 170.",
  "c7987bc16275a02b104439fd836f9fc08fb67d0a":
    "The academy's “Answers No.2” slide, wordmark and slide number 398 " +
    "included. Meteorology slide 171.",
  "ba9b62ae9c48085deb3ec36232a21d9eb15fda77":
    "A photograph of an identifiable student holding a pair of spectacles, " +
    "wearing a jacket embroidered with the academy's fern and wordmark. " +
    "Another provider's branding and a real person's likeness, and it shows " +
    "nothing about corrective lenses. Human Factors slide 68.",
  "c997ef7168abd4f65ecf2bbbd5c7cdc949f86c08":
    "A photograph of the academy's building with its sign filling the frame. " +
    "Human Factors slide 69.",

  /* ---- other training providers -------------------------------------- */
  "93bf4181967017ab14626001ea13826282055539":
    "A pitot-static simulation screenshot watermarked SaferPilotChallenge.com " +
    "across its width. Another flight-training provider. The blockage cases " +
    "are set out in full in the slide text. GATK slide 171.",
  "57b5693b7c596edfae9ee3b49ca7d29aa418f70d":
    "A “PILOT TRAINING SOLUTIONS” brand card — a logo over a decorative gyro " +
    "drawing. The VSI schematic on the same slide is the teaching figure. " +
    "GATK slide 177.",
  "16947179d907b87c59dc26f35dd000404939c9bb":
    "The title card of a “7Active — The Joy Of Happy Learning” video: an " +
    "education provider's logo on a white field, and nothing else at all. " +
    "GATK slide 134.",
  "e45e8d01dcd0dc058918b11cc80ff3a533925cb8":
    "The brand card of the “Geardown flap15 — Configuring Excellence” " +
    "aviation training channel, caught mid-title. Human Factors slide 247.",

  /* ---- site and publication watermarks -------------------------------- */
  "8819342985eac6ffc1ecca4f5043b0c56990eaa3":
    "A first aid kit photographed with a cabincrewsafety.com watermark laid " +
    "across it. Two other photographs of the same required equipment stand " +
    "on the slide. Air Law slide 74.",
  "e84f9e6cc7455889623fff9c5ba55e6416ac5405":
    "A PAPI diagram labelled in French and signed “copyright graouland :))”. " +
    "Air Law slide 358.",
  "051d527645f7534f8e49910be648dc0d36c8fd11":
    "A runway lighting plan carrying the AeroSavvy.com logo. The symbol and " +
    "colour table on the same slide gives the same code unbranded. Air Law " +
    "slide 367.",
  "7bc66a5ea01bab29ba26be178da51eefdcd3688d":
    "A frame from a carburettor animation watermarked ONTHEFLIGHTLINE.COM. " +
    "The labelled float-carburettor cutaway on the same slide is the clearer " +
    "figure and carries no branding. GATK slide 37.",
  "5ec60f6b2173b6bc196c976a54fc7eff07b8b605":
    "A second frame from the same watermarked animation. GATK slide 37.",
  "99b4f193f76ca84343ad66db9bf3fb1c8436faba":
    "The same animation on the idling slide; three unbranded carburettor " +
    "diagrams remain there. GATK slide 40.",
  "b31131583dc35b7427d907024ecc21bf7d6a2ca6":
    "The same animation on the mixture-control slide, which is taught by ten " +
    "unbranded figures over the slides that follow. GATK slide 42.",
  "cc1825a7c41cb682f78152d25cafe73b6b56523d":
    "The same animation on the induction slide; three unbranded figures " +
    "remain. GATK slide 57.",
  "72811f6201e219ff2d114d3681f155c6cea93997":
    "A gear pump diagram under a kanizmalar.com banner. The pump types and " +
    "the pressures each suits are stated in the slide text. GATK slide 257.",
  "d53f9f1f3e6ea17787fca24e3c56bcd60bb6d73d":
    "A hydraulic reservoir cutaway with a site's logo badge in the corner, " +
    "too low-resolution to read even enlarged. GATK slide 257.",
  "dc5d9f3276841d57aeecd95d704a5fd204e0159d":
    "A GPS trilateration diagram watermarked Buzzle.com. The satellite counts " +
    "for a two- and a three-dimensional fix are in the slide text. GATK " +
    "slide 232.",
  "a5bfd9754b23562a62bc1d26de617f54bbe445da":
    "A stock photograph of an empty road carrying a supplier's monogram, " +
    "decorating the brakes slide. GATK slide 269.",
  "8f62daae679095cb094ca60c0aad965093dff8fc":
    "A pie chart of atmospheric composition watermarked OXYGEN TIMES. The " +
    "figures it carried are now in the lesson as text. Human Factors slide 18.",
  "7c2e3da1f08d03d0e4b9e4eea3617160a0ec09f9":
    "A decompression-sickness flow diagram carrying the click2dive logo. The " +
    "mechanism is set out in full in the slide text. Human Factors slide 50.",
  "205732b10f684c1520d6048911d5c702b30e5b0e":
    "A normal-versus-obstructed-breathing illustration branded Profilo " +
    "Surgical. The obstruction is described in the slide text. Human Factors " +
    "slide 217.",
  "05fa6131f144201dd7e8c907c297dcbe7ee093a0":
    "A flight deck photograph watermarked AirlineReporter.com. Four unbranded " +
    "panel photographs remain in the lesson. Human Factors slide 339.",

  /* ---- broadcaster and corporate bugs on video frames ----------------- */
  "9e119d49d6e9dc9ab41c9de6cdc4d365a6e71ba0":
    "A turbocharger render with the BorgWarner logo across the top. Four " +
    "unbranded turbocharger figures stand on the previous slide. GATK " +
    "slide 63.",
  "e7b16dc5c70bb3745501bf3961002b3a8a33120d":
    "A video frame of a scrapyard lifting magnet branded ELECTRO FLUX. The " +
    "electromagnet is explained in the slide text. GATK slide 127.",
  "1444634a0071cac38b3b954f2b9f4c0b6d311637":
    "A second frame from the same ELECTRO FLUX video. GATK slide 127.",
  "c2dd8d4a9762c90c2219cfd122e50dc8fe0fe636":
    "A television frame carrying the Science Channel bug. The bourdon tube " +
    "diagram on the same slide is the teaching figure. GATK slide 156.",
  "647245af79c402b651b620508a45861b07cdca4d":
    "A video frame carrying the Gill Sensors corporate logo. GATK slide 163.",
  "a10d449dac28366575013891db535f765c744e62":
    "A television frame of a caged fight carrying a Discovery Channel “new " +
    "episode” bug, on the slide about gyroscopic rigidity. GATK slide 186.",
  "9afbbf0c6a2ce683a3b21457f8bb3736e5c2ab2d":
    "A “Mighty Cheese” programme title card with a Discovery Channel bug. " +
    "GATK slide 186.",
  "c3df58f7c12c7d6686c0e6eeb2adb1919f2a95b4":
    "A video frame carrying The Kim Komando Show bug. GATK slide 232.",
  "5993eac46250bc03a74405942d3c5645b70a9074":
    "A television frame with channel bugs and a presenter inset. The decibel " +
    "figure it illustrates is in the line of text beside it. Human Factors " +
    "slide 105.",
  "e5f1370437f58cfca23b4804129a05b5d1c81891":
    "A video frame watermarked FULLMAG. Human Factors slide 106.",
  "59b63c1e91ab4b07c2bed2bb935e691dd20a36db":
    "A video frame carrying the MythBusters programme bug. Human Factors " +
    "slide 107.",
  "49d1724b11271ba3f2346ab9e63399b6cbb8f111":
    "A TED-Ed title card: the publisher's logo, and no content beyond the " +
    "video's own title. Human Factors slide 203.",
};

/**
 * Images kept but worth a second look if the subject is revised.
 *
 * Nothing in Navigation qualified. The entry exists so the shape matches IR's
 * and a later subject has somewhere to put a genuine borderline case.
 */
export const FLAGGED = {};

/** True when this image was rejected on review. */
export function isRejectedImage(sha1) {
  if (!sha1) return false;
  if (DROPPED[sha1]) return true;
  if (BRANDED[sha1]) return true;
  if (SECTION_BACKGROUNDS[sha1]) return true;
  if (FLAGGED_ON_REVIEW[sha1]) return true;
  return REFLECTION_SET.has(sha1);
}

/**
 * The General Aircraft Technical Knowledge deck: two classes of rejection,
 * listed by hash rather than described one at a time.
 *
 * This deck reached the project as a PDF and it is the worst affected of the
 * six. 751 distinct images were extracted from 308 slides, and the great
 * majority of them are not pictures of anything.
 */

/**
 * Faded photographs used as the background of a whole section.
 *
 * Each of these sits behind every slide of one topic group — a landing gear
 * bogie behind the 35 slides on hydraulics and undercarriage, a radial engine
 * behind the 23 on piston engines, an instrument panel behind the 22 on flight
 * instruments. On the slide they are washed out almost to white and sit under
 * the text; extracted, each is a large grey photograph that would be printed
 * once per topic beside teaching it does not illustrate.
 *
 * Five of the thirteen were opened and looked at, and every one was a faded
 * background of this kind; the remaining eight share the pattern exactly —
 * one image spanning one contiguous run of slides, repeated on every slide in
 * the run.
 */
export const SECTION_BACKGROUNDS = {
  "7205fba165fbf8c7d5374bf1f53fb96729bf2fad": "1536x1024, on all 35 slides of 253-287",
  "4406fa1dc84d360b902383aa7cdb71330d0c100d": "900x606, on all 23 slides of 2-24",
  "517c0b23c18e1a437f167e86881516439fdda97c": "505x307, on all 22 slides of 182-203",
  "3f033b21071ced95e0de48000e298de77830b92d": "380x270, on all 21 slides of 214-234",
  "6558c976462d6fb33740fdcbdeae5dec640a0b8c": "600x458, on all 18 slides of 65-84",
  "7d74d653af0fa5a918d778d6b35658370a29ccad": "715x394, on all 16 slides of 236-251",
  "f208d58df3ba678e42aa01b15798fc0dae7ad530": "640x420, on all 12 slides of 139-150",
  "baa5b6f9f158241e4272819d4c98421839d5a074": "800x374, on all 12 slides of 152-163",
  "165ceeb307b80103320e2cc2023fd6a5e5de210f": "983x720, on all 10 slides of 25-34",
  "cc80f60f35548cbbc488a01524051cd0bc97582e": "563x466, on all 9 slides of 95-103",
  "9cfa9663c4e16dbae04dea9b9893a527bc7d1b27": "600x750, on all 8 slides of 86-93",
  "0514e16a2bc7139a233a96bb7e05290c869dbadd": "377x380, on all 8 slides of 205-212",
  "978b954ebff1674fdffc5e3c51d0d638034368e2": "590x501, on all 6 slides of 58-63",
};

/**
 * The mirrored reflection of a slide heading, extracted as an image.
 *
 * PowerPoint can draw a fading upside-down copy of a title underneath it. The
 * PDF conversion turned every one of those reflections into a separate picture,
 * and there are 401 of them — one per heading, at whatever width the heading
 * happened to be. Opened, they are exactly what the measurement says: a band
 * 156 to 192 pixels high containing an inverted, almost invisible copy of words
 * that already appear as the slide title.
 *
 * Every one measures zero ink against its own background. They are listed by
 * hash so the decision is auditable per image, but the reason is one reason.
 */
export const HEADING_REFLECTIONS = [
  "c24c1afce23ab838cf12de1f94b92413dda0f2ea", "438dd7eeff143c79c58aa7bc81a44d2ee64cd6f3",
  "913ee630ba369238c317ef3aa356e062233ac089", "a07c9cefe9bd470b377d82d7cbe6c2214312289f",
  "24e15a16c7e14a690663b00ca42dcade93f50690", "59e52ee802ec03e17fe838364092ab02e863b7d1",
  "6f903a215ed51a635dee3de3dca1978e546d08bb", "45d55c9e085dbba5ebc862eb2b176550bddc02be",
  "f57fb237472639e5e024d81a3fec7c1f35633bab", "98d2cf0cf6f0e92fa49dcc5cd3646cdf1556342d",
  "0ab39f8860106d2252a6331e6459bcad03cea734", "ac1581387be20be757463613e5d6089c59f40fb3",
  "b0bbda02b33eee43718ee7113579da0c8a7274b9", "29501de0e2424e5c34ae9cf2c537a0ae11d33888",
  "49f0fb9635f94e4fc44886a486cc79b91651e11a", "c7fc367c79e0045fd0dca3100bd9fcf1ff1d5d3e",
  "afaf83f124544aa501dc0fee422e361719c6c045", "10b707112f8813a211a3e66c2f358f4572d7172f",
  "a9857fbeef56e536413e0baabc21e1c551bdc9f8", "76c44ab6360035127156a0e393631b8db3e250a2",
  "f377b118ddad512161a90ed2ca2578ddd2e689a9", "567243454860a5e0a1f8e23c93f43280eb70b33b",
  "47f265ab4d2d9d4f7b2e525e4d9c63345bcecacb", "e2ae0f7ec4b68dbb85ff10bcc07e9edafc198339",
  "f5a6be96e0416673b3d9f7d8406010e74cf54b58", "ffbe291250bfdad0a43ddbb8645756eab5e69fc5",
  "9695805cb4b34129ea06c986e754f4cfe10bd257", "eaa8e85d65b221798f8ecf0ddc65f34918fb8a4b",
  "c63a61d1daa7be8a3b491042cd2d939a881b5531", "5b9eee2cabb645471c8591c1de1f2f84f01d7f1c",
  "950c7fabc2fd1bfde3dc9ca15d7f9d9e14e562bb", "f4fd1d922acd6c1bfdeecc9f3bc0b8f87dd00473",
  "340db5a355fb137173111a8fb639233720a04c81", "fe1d3abcb0c826ed0fd6fd75025bd90b01ecd4ed",
  "7e083e769e050bb833992c3e3519e1053b821e75", "d1b0be92b3492217c03df7b8fcb12b97934a51a1",
  "a1b3c93d846fe255b6dff9c9b55487212138093b", "e39a41dd26779562a2c5158e4833f6b7d6834cb8",
  "c0841198b8ba8dc5d9721ec720742b5fe5627252", "64119e42765d4fee01195ea7d32b2098fc96958f",
  "57293cd550500f2459ba89abd14a61552265925b", "3c6bcf93b0432ae8983bf4c4ab56d1696ca91ad2",
  "ae1b4a76126ebc72145449957daaaea492b7ffd3", "cdfc89cddb0809e636cdef5fdb53725871b7c29a",
  "bce1fac40caa4deee78f7ec2c16dc6e36b1c0657", "669276269a744f344f732aa82091346029b0e456",
  "8dcc2bf123fbda59f7ea48ddc057ce714de1546d", "62e2edbf2ba64c7bcf24b88b227e1617809e4c21",
  "99dd160607bd279a4c1a40a6280f837bb8710487", "976fd3531125c26567cf7ce25ed50a1e7090e740",
  "008028052de8efb6ce0e2a05c682cbf888602788", "b0f2f849137ffd71dc3d2910b8e257a4e1514867",
  "46457baaf6764fb7619d6462560d947221fad07a", "cd9f21dd79a2033745b373fc583b4e0dc5060ec8",
  "7fb8dbe624a5a4c102d30d27c252b04881c48304", "b56f4461c47c42973f2eca3fa1e3a18dba9dc0c6",
  "384ba84f945dd2c5a22873623b64ae9f263bdd77", "07a747102c97f754737aed980636642dabb0cd9d",
  "cdfe0ed8c1b39d1334b3868eaa6154fa5eb69be7", "013955b84098daa72ad9624b0be74e702ac6a44c",
  "21055df57afe089457e0be8b07f5ed087f521eb8", "1b46f3b1db46f0839091e405340d479be2b5d1d4",
  "1f33926e133b8d1db0a10654a0e031390a294837", "777689fa9057b88e25912a7f235458aff050c74c",
  "35ad2044bc683c33235d4ba4c15d418c53a901d5", "00d221ed83cb3c99a2a58d6263f59525f1630723",
  "0582772422e47bee04c9b13ea27f4c7c2c5b6f84", "dc846097a2c7a61b2681bf9c51bbe612e67b500d",
  "42bab216e1e9c7e4591a449ea1f4a910452124ab", "bee26606032d4d52b3961385797955c3b55564ba",
  "2fbf10b8319558ba6c8e0a2b62628227c2cb9c02", "844bcf9f8b7cc943c29e772469e626aa228d5192",
  "2905155cc52a7d0d05ea9e5d07e79f74761df0f4", "80cffc71ff69fa165b3d153e9aaff9a241b9db4e",
  "7e8d120b8ad61c9e7c67d04082a478e50db19aff", "1d6fe311c7931e35bd50bbfbde698601a735420a",
  "53d40330393a61a38b072bc185f923113bda4a0b", "b27bd20dc8d1774dfeb1f430763793544344e3e0",
  "da2ec45d53727698fbd8f69665e92307fb39981c", "8044c583060005649855570657506b82199b076c",
  "ab8c446b0a1425c2582d446d0d3d4af172f4d5d0", "58749ecb87c9b92eed86d6892d7857c585fbba02",
  "f37e2e3ff19abbf14c595e086c0e37b67ed55fb8", "dd2657fe65ce05f8d0dc59badb95dfbc3b0b2938",
  "14f00b38fe18c69556efcdaacb56fd5177d6eefa", "f8e9db971441f65d19811d605ae390be9f612d73",
  "0fd5748c5211aad1d67db96f2a315a31ef63cca8", "2b2f4bc9df9a24d70c246052e44057952b011769",
  "bc4c7c070aae478445e06b77ad6ce9b597f42193", "75fa630bb876d4c9dd0a4c5de8a233455218b661",
  "5ddd7af5aa8ef7e8fcd0d61c1f32d7443082d05b", "6f88bce969ed8264e5b8cce0524fe0078fda92cc",
  "cb7dfc3ab85c416a058ccc30bf79ccd40d82feb9", "0cb6a7820dc340e4a27dc7434a8e9105e2faf441",
  "073b4d5947dad10973d7d203dd663b3bf8cdf23f", "7d715d811f3d9ca35482ae973d92edf79584f9ea",
  "5fa8ec45b5d9f51d1911c7990144d640a4562826", "7202d406f4263e5e8e94ec60111e32c3cb8d747f",
  "aac3bb91484f31f8f0c2738fdd3ebe1a39debc57", "12fe87442d4c6f73ad46705223d33af61bd52db0",
  "ae455a2924eb1d9555edbe5c6b61884cadf98f97", "17e900881ca78fe92d32a4a725c0782b26e82665",
  "54e7c91be148a3be8a7a421b6b2a40f63e8bb3f8", "103ba553d547641a97e5fc6ac31f8062bd8bb65f",
  "b1a65ecbc65c22ede0fe849a5d588086cf62b855", "9faca36bbb1836a27c47555a733c2033079ea8b3",
  "85235683d0e6683096929818743a3446425fce81", "ed4dbf4f22a34b82aac5a45cc42892c90d2e713a",
  "9e38ce7e73609666ac302eed8ebac6447841c38d", "a9538b621db4cad9e222fbbcb687867af4ce71d8",
  "f620d33e774b8990ccaf62b1ab0f8ad7f074cada", "e16924c699b21cfcf0f9ce83a70bdab28d082cfb",
  "027b7355799fb733c63bf9ea36265830889ecfa7", "2335fd21f29e82153c1926f13e6a9f01801515a0",
  "3c18c5b1a0796fe5420b6e4408736cb5d29cf929", "9c2cb38316ee6f6a8e542c2072a7da2d296830d3",
  "ae16c53ca6bdd3a55be37f658ff3def32509ba35", "363aaa4cbe1bbf4e617bde7f282e3240edb9dcf4",
  "ede1446732530885cd87c9a6aae608d0f2506ce0", "66dc8ebd6c673cd3268694ead1d8bb878486c037",
  "1ee511bcbc15bb8573e3ae4f9cbd84a5ec2433a2", "dc0230a49e5eaff4d62e4c4a3ec5207e5fe73906",
  "d6eef4a231dedab97eb67c56ef30e8d9f510ed99", "649fb880653ad3f2c07cdeeb6803e67a507fca4b",
  "5f955276a15792490e8832577be7ac3376b45062", "e1f19e8c965cf1f129810906781340adadcaf712",
  "c0a65d0b0aac4efeae8f0055a5b9da24942e0f9d", "c3469b6f04c4286d003c30f0e27d6f0a7b534a4d",
  "7586b40a5a6f2808594064e73f9ab3d655eef958", "04e2adeab349c9c9e64cb32a3275b9b10e10efd1",
  "ca81399a7459ca9f14d2923a4a5b34f0522c1c72", "06dadf092c39aadd1a12ef72edb93217427a50c6",
  "44e4fc717052fad8a566802e77b05e252b121999", "55b5df8a42e13ee1390705e8747ce51b25779e79",
  "4208178e80f173653ca4d6f405461d557b445517", "7404119178da50830c4d2311a3c29e55f4b05172",
  "ed8d851364c0c3852a7c2c1422e76e547f4a8003", "026424640cbfc182295e8bade59994d978de35d3",
  "8ff43d94cd876435f64f3e36c1c112744f79f75b", "6a15347a6c65b76e45d22ba307f122c7a7cef465",
  "e92bf8afa73795f89702557b90e693ac9a769476", "597609bcdedbfd67ee85772097956fedfeea018d",
  "63d29093b5694d78a4680f3fe203af077d736856", "b8c2f771f749961697242283ae6b4d3d76d77eb5",
  "ebd8bd567dbef063c1ed86a8db525b16dded779d", "325dd1a648c4bd7d0fc6bae0164d3c9ccb532c0e",
  "228a404f5388ab0838a325c7266f67f4947c7183", "9c03f990cf5ca12b4915dc2557d8832cc8b05d6e",
  "53464c8422d605656b810da0241e97fd6cadb72c", "6d0da0113af31a00d9ca9f108a0a19ed48c1e6cf",
  "a9285fbc2e3d9683a98c446fc90c70e094e56dac", "9b9896cf70f89980de13145604e6d06a6626578e",
  "c5df1627d1b40a2381c9ca1fd549c24cb925d3cb", "f482d9fa2f86f3acd47f32f17b2292d81b74126b",
  "47321ebafb011627138ce646f6a3ff864272d8fb", "347302b19a0fa297f8259f6d915b01f0dac9eee4",
  "44516ba02a8decc7c93f3a0e30c0d308bad0d8b0", "80e8b6a502b31d5c8f39bb6312133690fbed1f8d",
  "94b59a9ded78e7e1a10c1eb6baa73162897b808f", "a822e3da73e6fb4041c4b62f9d7f629bd7fe2dc0",
  "b5a2374198ce3bded6e90c2c19cb9b335b83e205", "78d3c53947814753a5c1490831d792acc7b29135",
  "c33368a2eeda9824ddb529ca27bbeec3689ebc07", "23898216209c8b14b03453297a729810b0085ee5",
  "1e65726779f6405258de4a5031ef13750d291f1a", "01516342a2ffb80cd4d08abbf878d70c1e628f6f",
  "6240ec261ada5ae179f62bde4fbbc41a01d77a8b", "6421be190195a83f41d4d6a7b6ecc1548261e54b",
  "2108245637e2b904ab2b11001ace8aa9e6bade9d", "6b92190c79de42c49a575b30f7ea1daf8be02792",
  "116d8f790fa6209f0766d504b1f624c15823042b", "546171b02e572865b113e163c55a03aadad727e9",
  "5037145af91fd36f9900c75caf008d56f339cd51", "d98aa6c7103f8beb4914105b32f908a8428eff77",
  "aa6228fc42385b3df6d0e0d01c8cccd0aca678cb", "c9760733c8d8eccee37bc94475ea15121c63b837",
  "12e330b449dbec134ac3f007c813618c70923e85", "00c8c3c0dd7ee05297fe1966eb603f7cea744f6d",
  "4d732dc2001ac4348d1508278955df1a047d3e2f", "4e2b6c748b6a442a4923a7ec2bec48677c1c67c2",
  "78e37d00ce8d34e25bed3f30a0db9fbf369f23ba", "76d08494095cf05031b4ce0fe95966ac814979fe",
  "6568629f7283a618082d93584f6b5e0e8ab6db6b", "3d63903220eaef886a6af3a1fd79a42f1482a375",
  "39e50f3beb49f7f22639062426e3d167cf1ac0c0", "f118a516c86f928f75a4924b058e7b14bdd8dafb",
  "c0acac40f67af4d5bb4c21f1c36ce085e274beb6", "c9df4487c55ae7a008733d5efe0914fcfcaafa67",
  "4e525dc9c470d8032fc587bc217a1e4756437aa9", "ba075f37a5dcd346ac137592121f49074ef0e6f9",
  "6d22762447ef0710bd7f402e7353fb65741072c3", "85d9547ed2889c0c976448ea0e048410fefb552c",
  "eb71b3c4dd3d073b23c272f8ac4342c6a8a8ad25", "796301f2509013f9491c441c57d59a75d3875b57",
  "55c43bbcea54f9bd2dfa200d4ae6725297fb4aa6", "1293cf0888661807b3431afbbbf5cb19fc9d1d17",
  "c1a298375c294d1febf921111660684db7b7655e", "f2136a946d03dffd252b5e0f91b87129247fc1dc",
  "f28c86c442c022a26261ea44bdc5405805e9fc15", "12c59a6d9e6684d938cee62301c75dfb63cef99b",
  "d0456d1f324a7b99123dd95b35db97ea162c5882", "db5853ff94b716b2d93dc0bae42e3bf1f7152cbf",
  "315c2a5976091353941201b88cb07c1ae3612c33", "db7d33118307d8da9ef619c1d34b35465b2eebc9",
  "e942ef80a65de99911846a48f7a31d76eaef960a", "303e889c12347f5921dbb358dc4f9ca86341a663",
  "6fb76a9345f359f43c0d4583e23814ead393cd90", "17eda378d9c2f998e84ddbdd892b029eeca4c5a6",
  "4be9d1ea907fd542519ecb23365f52b13a31f0f5", "b86b13d9f00cef38bd3fa53de539669ccd966ee1",
  "6568d97516fd167bdf1061c765dcb72c99d5399c", "9c971c9a2d5e90c5155a333718c0f5c8c9f20f00",
  "3e5c462054686e0455d7e05120bf75e27149266a", "6758413fb31cdeffbd1c4b89aeb1672a3e093222",
  "c4a25cbada129fde14b6569a265beeaba5ceb578", "73d8a10801f776fba39afa5a28e144b39dea003e",
  "7fb3db081934cbdd2ffaec4cbf82d3297224ccc0", "4dacd6fa5fc6c473f0bbf4e38e2f4e25f27f8b07",
  "b3f457d633bffddb6d0d342ae75b54a02cde8a41", "8d79b539825a0fb932f5452b550e9e3307068aa3",
  "cc9cc717dfa65f6bdd70219da75c9867cad138ef", "ea122320709e12d7f7000145891cd2a1a7ec126d",
  "3b7b4aa61b3ded006887d3761b095e0867615fbb", "e48ac5d09721d2281ae6e0a507d1265181e9c1cf",
  "b50e58a1ec739e8ea6478db0ec77bbd99c0bed86", "6a13598021a5a695841b9e34f3c0ca2515bc8f3e",
  "158806d57bebd309b271d482fffeddc481ec696e", "d3bd4d8d59527f060cf929b90515cb9fedf9b1fc",
  "d3c0cdfc82f008bf00b0631e4a4c43cce85a73d0", "4de666852ddcca3f96a9dff2fb409062ecf7c718",
  "64fa7955c0ba04c8fc51141a2090a9d66472be78", "26fd9ffc1c451928e5887ee91575953e3608fdf2",
  "a00682760786a7787401e97a77c53f0a05f5b234", "ca1843d25d3bb98857e422d81a80f0971eae1869",
  "193a1ecf2aa9c78e3c20db1ddcb122a88da50d84", "4f7d10c93460a551d428ef5d415db0574f0eb976",
  "9f74b6c1dd8348f3e95868b19f515f7749bf91d9", "8bf6450dff0dee9005033e6970b8e723f0c0bd94",
  "4bbdf21a33a1fb9efc456b51afa6969f236dbfc3", "458de3972546b929fe046088fdc0497085cc770a",
  "c9c9310b41b356db380481cb7b51728c2cc25a8f", "a0c2f80d0fad6c2c85eb5519b50e4c15d6a31cf6",
  "0a38b7600c3b35de49e724096a2ef89cc4670455", "bf592d8a13b6cdca8f6b4c1efba9773dc3a3c69f",
  "4aa8b921a80246c18a6f46c42b5c76a659de0444", "0514fb78e611658675071e022d5374ffd5331087",
  "33220376eafc7a4ce8967468467b74baf3470d1b", "b69ed9bd02b1a4c6102f32f862236b4944f92d09",
  "5dc22ea57af86ca09f8a64a57d10e63d890b1d9b", "ef6208377822a8c1cecb4b77e05432d7894299cb",
  "84c085d524493cba54c6e8737eb547c26bd84d2e", "3e59c4407a6add54c14f6c3efc8a4c2ba8cf6645",
  "9e198e54d570b8ba4686204dea66042b844e15e5", "a8f2d3274a4a31edeb0fbfe34e5a40a75216945a",
  "d960b4b6f08a4009067648e8e496417a04ac64a7", "29c49194432eaa3ba66d6c94fa3865a26842fbdb",
  "57a1cd9fe95dc2e19c734d9b5ecc5e353c821e4a", "aca8d69a650ac87cc97b5e0931176f6aa98a527b",
  "ce3b580f22e4b2151ffcd095650881a77255f451", "7776b0762fa0e7d70d2dc8403e21ba0f2923e27a",
  "0bddd99a386eb88e3b16d0c5c3b75b8988936f73", "2d88bef66ae18e0fd9853df272446a9e2e4d8afa",
  "1886ab9c8670af1482d3d398c05379a33455e690", "19b286e6eb5a3478a60929a1aa1786859104659e",
  "d128cbdcb82960552592c908964379769c0d96a7", "e6138c609cdedc17216c3ef2dbe48445b394e34e",
  "97c62547cbac1e09e6cfdecf32d207c7fb5143c6", "ae8ec4a77d8ba36600ab0f2648f0b4d76d37e83a",
  "96f3a5304c9a606ccbc4b608fd96b21521118a7f", "3cabef301a9eebffcfd5159f61165256af8296c0",
  "2589cd26a0fba1bab00bca1c0e301b518d70ed5c", "e4aad745259fc63ccce309cbaed67eb25915d422",
  "b9f054592e7a8e806c8a518f09424f367749a228", "14d06b3e73d9c605c9c177ad3f4959cba55ac6c0",
  "6ab91ab0c2c852153412c113c187b797d2dedb4e", "5656375289aae165fdf586de2ad8a2ca22d3f392",
  "5527edadda8c13db3e1f4f9169fb8adc707c10c6", "4370d3ee63d7f9bc306a5b42660bb15b4c8aa108",
  "b0ef675ed279996e3f898f82220cae9d66e73840", "5de63657e1daf2396f3976283beb8ede926faea1",
  "a7053b1ed4e2806586fc95aac0f55627a1ab7fae", "a0835265a7f56d36268d5536878625e9b902fcb7",
  "062adeb0a9bc36a121d64b95b759c70a7a006cce", "c1481d9c4f40074434c79a8510679fbc4df6f4a9",
  "e81f31f258b80fd145d0c59fc18cfd9fe5cd827e", "f4603d7b74b6b12e34d16195938324f5bc0ce3bc",
  "5c1248815ed7589deb497a4b9bdf2df2b215c69b", "658827477c892856544ff4761fcf3bab09cc8efa",
  "cf802f4fdaa996ac7704c6346285fed30f1504f6", "3da19d4f807a5464844a76585164013d3724b96e",
  "8aa4de5b89f234908e8704c1979760e6d416810a", "983dacdf68cc9cd4369036d93c197770dfe324d7",
  "d6e8cbde2a195521da0e6d257c7574802d304c06", "6ce045c0beff1b01124875891c9b16810360dbe7",
  "4c828de1575e68e3b73df6cdff4d8f5f20baf066", "5d408af42077a10362b7d93e51ed087ff90974d9",
  "dec0dc8da666ddcdc2de9b71972eda9c1a7553da", "45fca2c5fc3ac433f368cd519c84c131836a4b98",
  "d667320fb8becf90eb7f180531c2ff9ce2158850", "264a4820f2404af18783d29be8efefca2f134a61",
  "9485f00bbb003d964d0a66145b200a693d37ba50", "002b3bb80a7de969f8009c968e566ac4e83bce72",
  "58721dfe61ce030e4599739c32368a3f0442da18", "ed0257f85f88e3a3a7b97ff10cce9cde4c8914dc",
  "7e4d87fd009ce8f5ff62ee37efdd961161ddba69", "46b3e25bd21cce672479cd70505d805551179534",
  "0bd82dbf3236307e035b4b8b31e65db43eeb3683", "2fe83e1948fe3e744b716661d3804dba6dbf5559",
  "1dcb2b5436773229528c92cfc1672ff57766b602", "05443bb8e1043ccd9b8cf6d0347b15d8d149d22e",
  "6da5e6e586be7c7df1506d72eb248ce1a71dd27c", "bc115bddd693dafbcd4f551b71c8282156d64b2c",
  "271d8ed498eac5e660d3644acb4539d440bb250d", "82d393bcb8c244879f270e65196b6fa7a9f101de",
  "d1745876b88786756f55af1873aeb5b13e7b3162", "2a53c364e8bf1da74bc71009ea0bb48db6c75af8",
  "57e518aedf3f5588747405699782f866da9bfd90", "e82108e20cd9d56eef33d7269553b6ab631f8bb8",
  "566c016855311dda7a8e5237ffc0b35f120d5e26", "fa3f4f3cad2fdc73643f7c24cef750881cb35134",
  "c4b67c0c25f03907d100d9123685eca01cfcd5b6", "4e9d1d08a766454fca4bcfbd32a3234fd2089dde",
  "02dd755e701879b71a71c3d0b0cfe6370e175c30", "95c0c24294f0de5fba1774d78831e73d7f76be4c",
  "df28e8c4c83b74b7390d6d58e61d9100d04617a5", "31a2b369281baf5f4364dcf530f9d3d921a0b96a",
  "6d49a6888945f4fa6aa5d9ac12ae809b765dd53f", "90f39e448d438ea1bd89113cb4db05e2bcaec36f",
  "be3cdff1cf2d3659dc20943546be53b47cc7b372", "968455e07a6d6517bc24ec28f02293f7ddad0ef2",
  "8b55ad00eb323aca970bc1b72a790736e2b71053", "2fa26154eb34732ae0bd41db849161c5099806c5",
  "bdfc2250a0e4d8a88d013ff6d8bc5107a9feaaf0", "02cc8610b1fc89996f2c6b3b42f0df8021069267",
  "0960f2bef69833a488384889ac3ac3e5ed8a3c94", "a5984c6b04bf3229f6b7b020e7a8744aaf477083",
  "d215204fb9314a7dbefdf03245a6c4c060aefb16", "0039f4b7e80452f4c33ab8158b9cf3837b16ba15",
  "5fd32147be1a1653991f8441785a3377f7106fdd", "15f9fe5ab0b4cc1920c29ff4b688bf22a4c2bbdd",
  "062642c6b4fdd8bc91de2dd48f496abca63a95c2", "f433843b9bd3e4444aa3843cbf3c9bb926ad47d2",
  "9116b39969851a8693a204bf8cea5343deadafda", "d30c186105dfd062557783866120ec69699e3e87",
  "eec8eb41d4dad8ae185488733bae3ad64ecb55bd", "384a7b5dab1b7d10c18535d7bb863c3ec2d489c1",
  "b51944a2f0a1ff9ceddc3986334a17b0515e6fc0", "2bba54d0124f0ff340d06203e4546b97f81ea1a9",
  "283f9816f011ee3eb4abb9161bf6fc4a8b9ea2fa", "2d81a4a602127765906919c923dcbff90a42c0df",
  "6fac5a1b9e07fb87cf8bef6026d6c6dab8757a93", "9bec4303c695f46e7a4421eb6404227b60017445",
  "3b9036f652de12e6da1ec9e01096fac12a6ef8fc", "13baf3f16e21d89fb0a5ed7b3c9e5579e96a2971",
  "fbde1aadb86c2d054b5ce62bf0e8840f85b54f1f", "590aad6ba7b6acaeded8831ecd2ff1fa6625d0ab",
  "8e3c3f71de73e3e3da0307ad115d081ff0b25201", "48a478fb3be0db13e347ab996933bd81d389b666",
  "8612f85e0a5ecbc1e426eb27c92ccf637e365e9f", "b7640fa57ed07cb5ec557e723f26a7369e333943",
  "8b3c83dab045b484b1e68c89b53e93f48705ff9d", "284f4679594274c24abe3610327108bf3169f59a",
  "3cc836d8fbe56f9bc528350ecd33d1ce0647ea10", "b6c1fb9fd15e80c5a9b250c0e3a9c46f7d483bb0",
  "9660c9ad68f58727c063e43d3acd744eeb51682e", "4f003e1f5b5074cfdf0f2982578781299ef70383",
  "83d9305775c21e4690e938cf02033670e94e9d35", "823a9a570328d0af7c0d3ac45d1350ba34ce318f",
  "e15b08ffb9af7e78c17593da5c39e7427b412fef", "b783098e696a9ce830d70e9e60d556a8602046ec",
  "cc780a6abdde1715ba4c9cc0b6e05610cb3a0876", "1bea40da29a618c0529ee62da1bf0ee9b0f59dbe",
  "9f0503e60749e74c645f09ccd9a6f7909b874c1b", "938981f873c62081c0f1137578bb1bcf0025319d",
  "a7a7316d79b970c2a19e34907565a9137c2b4b24", "789f87ffab9dbf2cf2185b4657568fe4939a26bd",
  "060f0fa95c978b441ac1c27961d38714e3efd434", "7469fe2083dd0ec495cd2d96eb289446faada615",
  "271c26e0a4b3810464db1e154b123562a45348b8", "ecd37afdf788c9c0af0f534a0198b50b2bb80b41",
  "3552b6d6081d207b42b82a19cd4351a1dc7fd570", "ed3bf5a8ec67035a72dd2e3c8d8bd8ff228563a8",
  "3a5e505de6da0f9669f2c92d4f894465c52584a8", "16b8f38722f16fd3346c65be4afd1d17b57fe416",
  "fd0e185124bae7aadd407d24d5595e138c9091af", "ad2aae9bb2a873e06c846aef6e65f9c79c9c9151",
  "b9e6e5a938120ebe634dd0ff926423214508ba2c", "2e91f43c42f7d3006a393689b0850c749d84d31b",
  "2db887bba9dba8662bdd52c5c8a9bbc29bcc1c67", "208ed5fce0947abc886761b6bb3f2debd63e5e00",
  "279b24ce9a75e9811c04a9e97c96fc6b065834a5", "af6777bbc1ab330de0b954fa14e6f39ab695cdfc",
  "7160432f6e0ca600bc13062842d8cea5fd889aeb", "0d513be0a897ca6ff7db1a37ce9821a95200b18e",
  "03b9f0fdf2fe491bda5c33d94d7eb7b7ad2a00b9", "082c99d0f50a4a7cfe447c607e93ceabfb010d7b",
  "b2a859b2544655563de08321e24998a23a9e8467", "4bd47d02befaa14d90d160912e9e10a357cff322",
  "c05d532384c0b462929e1c67c610b2fc14c6a4a1", "601b194c725ac4b3ad1ec83d2d476227e0e2dcdf",
  "26c2e94585a278f137e683a4bf551282e82cc5b2",
];

/** Membership test for the reflection list, built once. */
const REFLECTION_SET = new Set(HEADING_REFLECTIONS);


/**
 * The last pass: images the figure auditor still flagged after the class
 * rejections above, checked one at a time.
 *
 * The four measured as blank were opened and are described individually. The
 * seventeen measured as tiny are all smaller than a line of body text at the
 * size they would be printed — several are 14 to 26 pixels high — and a
 * technical diagram that small carries no readable label whatever it depicts.
 */
export const FLAGGED_ON_REVIEW = {
  "61ed6649a5d86d39ce334b514d3a408a325ff363":
    "85x24, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "6c5b30855d0dbc29f3631b9444be685f74f6cfd5":
    "200x26, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "4451d81948f2b57e19da728b6798173daa1a1b58":
    "81x61, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "b44f1c75654e2770365ad060bc13ab028adc2294":
    "71x48, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "eb346822863973dca916764cd3fbf61802336324":
    "193x14, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "fbddcea0930844133c6a79f01233a35725fbdcc2":
    "193x14, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "c5e551a2f745f35dcac40b3e8557d9b249729098":
    "66x39, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "dd3b151844001e3211890694f8f655a65df035ec":
    "81x20, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "107d025f0d26d6adf262811f6016804fc267a83e":
    "A 167x143 photograph so dark that the instrument in it cannot be identified.",
  "13f932aa539f37b8fd7f0d1d6893f7fac98dfd94":
    "A near-black rectangle, 259x221 — an underexposed photograph in which nothing is distinguishable.",
  "5cba7cf305273abafb0d9bb4b8c233072eb89d55":
    "A plain grey gradient, 640x360, with nothing drawn on it at all.",
  "06fc1ab3bb73bbc07b9d7e79e465721a1e71ded2":
    "78x72, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "5d5ed7beb20697ab3006b44fbb31fc66de47dbb1":
    "79x71, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "09077299f4f3be4796dc1d6527fb5a47765fd9bc":
    "72x76, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "056c6653b873d6628444cc7d12b3b23abb69d408":
    "175x82, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "c26bf0519b24351f871c29a3b086c390cb9fbf3f":
    "29x28, too small to carry a readable label. Flagged TINY by measurement in aircraft-technical-knowledge.",
  "f4edbc692872b9527f490b9f550dcdac64dd8742":
    "The word \"NZAIP\" as a diagonal document watermark on white, 617x474. A publication watermark, and exactly what a student must not be shown.",
  "ffa8186f27f4c54eb7111ed8f6cb548ee6a88f51":
    "271x44, too small to carry a readable label. Flagged TINY by measurement in meteorology.",
  "18096027dbc90570bd59cb888a53cf547163d58e":
    "135x101, too small to carry a readable label. Flagged TINY by measurement in principles-of-flight.",
  "5b61eb5cad3182319f2b97dc98dd1facbcb0f1b4":
    "205x56, too small to carry a readable label. Flagged TINY by measurement in principles-of-flight.",
  "78e3fce7f5e09262b1f39d9b943cca4232998446":
    "264x18, too small to carry a readable label. Flagged TINY by measurement in principles-of-flight.",
};
