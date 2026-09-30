/**
 * Which extracted images are not diagrams.
 *
 * The measurable rules in the extractor catch what is invisible — a backdrop
 * at 5% opacity, a page-furniture logo repeated forty times. They cannot catch
 * a perfectly sharp, perfectly visible photograph of a road at sunset, or an
 * advertisement for obstruction lights, or a video thumbnail of a presenter
 * pointing at the camera. Those need a person to look, so a person looked at
 * all 541 and this is the result.
 *
 * Keyed on the SHA-1 of the original image bytes, which is how the pipeline
 * identifies an image, so these decisions survive a re-extract and a re-import
 * rather than having to be made again.
 *
 * DROPPED never reaches the course. FLAGGED is still shown — it is a record of
 * the calls that were close, so someone who knows the syllabus can overturn
 * them without having to find them first.
 */

export const DROPPED = {
  // ifr-navigation · Calculating Pressure and Density Altitude · Instrument Rating
  "930d1b5192135e4678402c9cd147204ea7fb476c": "stock cockpit photograph carrying a picture library's watermark",
  // ifr-navigation · Maps and Charts · Charts and Chart Features 1 . chart legends
  "06fa5f53365909d7525738be5ede3f52801bb477": "academy logo — New Zealand International Commercial Pilot Academy",
  // ifr-navigation · Maps and Charts · Charts and Chart Features 1 . chart legends
  "8abae917e6535d9cb600dbef9bfe2ef99ceb24ca": "academy logo — New Zealand International Commercial Pilot Academy",
  // ifr-navigation · Point of No Return (PNR) · The flight plan
  "64eb73c98e91c6461abd35910aba06995d6e46f7": "stock photograph — wooden puzzle pieces",
  // ifr-navigation · Point of No Return (PNR) · CTP/ETP
  "3e448c729b6c9a5152f243a6af51df32f8093ff2": "stock photograph — clock face, decorative",
  // ifr-navigation · Point of No Return (PNR) · Point of No Return (PNR)
  "3f615ee93557ad32cada66db4b8f7509076da354": "stock photograph — pen on paper, decorative",
  // ifr-navigation · ADF Accuracy and Limitations · ADF
  "8229c035799657b50898bc13684d905e4def6439": "clip-art lighthouse, decorative",
  // ifr-navigation · ADF Accuracy and Limitations · ADF
  "4f68f6538ac8795d96ff5effda92819b9279010c": "extraction artefact — blank grey strip",
  // ifr-navigation · Point of No Return (PNR) · PNR NOTES #
  "326ac28239cb7ed7c91bb8ae931039b91de7ee35": "stock photograph — road into mountains, decorative",
  // ifr-navigation · Point of No Return (PNR) · Performance Based Nav (PBN)
  "122662e9a07786e5fd3d6c86437c2029abf61a1a": "stock photograph — airliner nose, decorative",
  // ifr-navigation · ADF Accuracy and Limitations · Transposition of position lines - notes
  "6d626cab02e90b1ecdf76952cfda306213609016": "academy logo — New Zealand International Commercial Pilot Academy",
  // ifr-navaids · Airborne Weather Radar · Concept of AWR
  "b6dd611ab2db9805f1bc31d7e8125abb66a6eac4": "stock photograph — cumulonimbus, decorative",
  // ifr-navaids · An Example of a VOR Instrument Approach · The Instrument Approach
  "eb92e00bed686dba7163055bee1ea686e9f2297b": "video thumbnail — presenter piece to camera, not a diagram",
  // ifr-navaids · An Example of a VOR Instrument Approach · The Instrument Approach
  "c51bdc345337b88b1bfc94bf5f43f987a22d2f54": "video thumbnail — presenter piece to camera, not a diagram",
  // ifr-navaids · NDB and ADF · The Non - Directional Beacon
  "9b79946c610e59fcff7c00ca90240368c66f54c6": "stock photograph — mast in a field, decorative",
  // ifr-navaids · Threshold Elevation · An Example ILS Approach
  "96ccbcc5b3d21f1ec1318e4164a010f1abc708cf": "video thumbnail — presenter piece to camera, not a diagram",
  // ifr-navaids · Threshold Elevation · An Example ILS Approach
  "ace78a97965354a079232b113b7931a61f44f0e7": "video thumbnail — presenter piece to camera, not a diagram",
  // ifr-navaids · Airborne Weather Radar · Principle of Operation
  "7ccacbd60ca2b6fb4df2f29d8619501bb7df26aa": "screenshot of another provider's training video, with its branding",
  // ifr-navaids · Introduction · Dynamic Pressure
  "64000d01a57cf0e380acc71f0e2d806499faa6e3": "stock photograph — hand in grass, decorative",
  // ifr-navaids · Direct Reading Gauges · Deviation Compensation
  "c522eae5a91b5f3b628f25575b08a9445e806a9f": "extraction artefact — dark frame with nothing legible",
  // ifr-navaids · The Glideslope · The threshold crossing height (TCH), together
  "da6e00cbd443cce64cd9dba032cf719a4e61e494": "stock photograph — airliner over approach lights, decorative",
  // ifr-navaids · Using the RMI · Thunderstorm Effect
  "f326aa17831de863dcbc7d58b59f71e46a45ff93": "screenshot of another deck's slide, not a diagram",
  // ifr-navaids · Orientation Using a Single VOR · IDENTification
  "3845054d5dc9b504f2fc1403cd057ec8b67e557b": "photograph of a pilot from behind, decorative",
  // ifr-navaids · The Glideslope · Cockpit indications of passage overhead the OM are:
  "d8ab6fb1e588b14ffc826c99789680bd460cafa1": "low-resolution simulator screenshot, illegible",
  // ifr-navaids · Radio Principles · Radio Equipment
  "6e33c95b267b2ebcd0aa69c61569af734c688b80": "photograph of an avionics box beside a tape measure, teaches nothing",
  // ifr-navaids · Radar · Emergency Codes
  "2f0e855c416a723cf122b89ebc0e723e1ff8c4c7": "extraction artefact — blank grey smear",
  // ifr-navaids · Visual Landing Aids · Obstruction Lighting
  "71d5bd46f273b971d16029fa06dcdfd8c2232eee": "advertisement — LED obstruction lights, made in California",
  // ir-air-law · Advisory Circulars (ACs) · Advisory Circulars (ACs)
  "e291214c578903801d0b3768460030c2b14c35b7": "stock photograph — sky, decorative",
  // ir-air-law · Inadvertent activation of ELT · Emergencies; Incidents;
  "d1a7c8124541afbfaefa3adcdff8181107742af4": "stock photograph — wing over cloud, decorative",
  // ir-air-law · Aerodrome Chart Symbols · Runway Designation
  "dec1aa294723844d807a188938a638113a967a15": "stock photograph — runway at sunset, decorative",
  // ir-air-law · Aerodrome traffic circuit · Duties of Pilot in Command
  "4237f7d99a2389c62bc3ef745d0a18a4e0d7f677": "brush-stroke circle from a title slide, decorative",
  // ir-air-law · Standard Instrument Departure (SID) (I) · Instrument Departures and Approaches
  "8b9f9b8af5caf20ebacdca7a14bb75cf237a1846": "stock photograph — flight deck at sunset, decorative",
  // ir-air-law · Approach Light Systems (ALS) · LIL ALS/2 bar
  "c96dadc6ae80f65ced72f60beea50fc9b6c0926f": "stock photograph — coastline at night, decorative",
  // ir-air-law · Radar Services Available to IFR Flights · Global Navigation
  "95627cda264997dfd7604a060a818c3c30529cf3": "stock render — satellite in orbit, decorative",
  // ir-air-law · Approach Light Systems (ALS) · LIL ALS/1 bar
  "52739616098f7be40042adbcf202bdc92949c996": "under-exposed runway photograph, nothing legible",
  // ir-air-law · Publications for operational route and aerodrome operation · RNAV (RNP)
  "96c2b814112386f3bd144babc2c82cbaf596afae": "stock photograph — wing over mountains, decorative",
  // ir-air-law · Controlled airspace · Time of day
  "3cec270d614e334796c30207fb8327ae40fc22e7": "extraction artefact — washed-out world map with nothing legible",
  // ir-air-law · Pilot Requirements · Airworthiness of Aircraft and Aircraft
  "b563a21c26883161bbde8c3c9396aea9f6659168": "stock photograph — aircraft in fog, decorative",
  // ir-air-law · Reference Datum: IFR Takeoff Meteorological Minima · Air Traffic Services
  "db6d3e8fa272a840d7a017b613853ee7cd40dbbc": "stock render — connected globe, decorative",
  // ifr-navaids · The Instrument Landing System · The Glideslope
  "b5ef4586b2652a44cdfc3f6f5e4b0603639c41aa": "stock photograph of a glideslope mast carrying a picture library's watermark",
};

export const FLAGGED = {
  // ifr-navaids · Visual Landing Aids · Introduction
  "33b0c26340e48522d9d8546ce69bfdb2ddc6b67b": "third-party branded runway-lighting infographic — teaches well, carries another provider's mark",
  // ifr-navaids · The Glideslope · Glideslope Ground Equipment
  "93c3435593682477f588c83c3265f21e7bb23c24": "photograph of a radio mast — illustrates an NDB site, or decoration",
  // ifr-navaids · The Glideslope · Glideslope Ground Equipment
  "b5ef4586b2652a44cdfc3f6f5e4b0603639c41aa": "photograph of a marked mast at an aerodrome — same question",
  // ifr-navaids · The DME Arc Approach · DME Ident
  "06de399c6bac8cf7d538a8a325a1582dc278e4b5": "photograph of a flight-deck display, low resolution",
  // ifr-navaids · Visual Landing Aids · Runway Lighting
  "2ee02082ea859ce6c9e670b678e648d71501dd6d": "third-party branded runway-lights graphic — same question",
  // ifr-navaids · Visual Landing Aids · Runway End Indicator Lighting (REIL)
  "b6bca30e5ec8cb8a8209f0c01c42195f4f43ed6b": "third-party branded taxiway-lights graphic — same question",
  // ifr-navaids · Visual Landing Aids · Taxiway Lighting
  "80ed81da1f3b1ce0b87e89eb200f6770270e2c9b": "third-party branded taxi-lights graphic — same question",
  // ir-air-law · Instrument Rating Air · Instrument Rating Air
  "5231fc2cd5caf8f1d4e6ad55bee57385cb0825e1": "flight-deck photograph — atmospheric rather than instructional",
  // ir-air-law · Radar and Radio Failure Procedures (I) · Communications and Navigation Aid Failures
  "65cb8d70a9fb7b10bda5c4715a01ea168ce1b8fd": "flight-deck panel photograph — borderline",
  // ir-air-law · Aerodrome traffic circuit · NZ Aeronautical Information Publication (NZAIP)
  "54cbdda961294169de23e429ef6a29182d7409c1": "photograph of the AIP binder — illustrates the document under discussion",
  // ir-air-law · Magnetic · Airspace
  "82cbeebfdd069b5adf9e202a0ebabe300f13f5f3": "airspace diagram washed out almost to nothing",
};

/** True for an image the review found is not teaching material. */
export function isRejectedImage(sha1) {
  return Object.prototype.hasOwnProperty.call(DROPPED, sha1);
}
