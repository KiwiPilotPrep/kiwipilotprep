/**
 * Which PPL Aircraft Technical Knowledge source images reach a student, and
 * why the rest do not.
 *
 * The extraction pass measured the deck's 579 distinct figures and wrote what
 * each one looked like — deliberately as a measurement, never as a verdict.
 * This file is the verdicts. Every figure was put on a contact sheet and
 * looked at before it appears here, and that mattered: the measurement flagged
 * 205 images as mirrored heading reflections and thirteen of them turned out
 * to be real diagrams, including the angle of attack sequence on page 34, the
 * flaps-up-flaps-down camber comparison on page 43 and the control column
 * drawing on page 308. Those thirteen are kept.
 *
 * What is rejected here is overwhelmingly one artefact. The book's chapter
 * headings are set in WordArt with a mirrored reflection under them, and the
 * reflection is a separate image on the page — a pale, upside-down copy of the
 * heading, several times wider than it is tall. There are 186 of them and they
 * carry nothing at all.
 *
 * Keyed by SHA-1, which is stable across re-extraction, so a decision made
 * once stays made.
 */

/** Images that must not be shown to a student, with the reason each was rejected. */
export const DROPPED = {
  /* ---- mirrored WordArt heading reflections ---------------------------
   * 186 of them, one under most chapter and section headings in the book.
   * Each was viewed on the contact sheets under .cache/tmp/atk-look before
   * being listed; the thirteen that proved to be diagrams are not here.
   */
  "a28cbafeb824738a3393ca95e9998d0adefd447b":
    "A mirrored reflection of the heading of page 66, 793x168 — pale, upside down, and carrying no diagram.",
  "c805d29013a408b557ed1738caa8b1c9b2c4a394":
    "A mirrored reflection of the heading of page 67, 910x157 — pale, upside down, and carrying no diagram.",
  "144d7a163205ee856b76ac940f3352b9b100af53":
    "A mirrored reflection of the heading of page 68, 1893x157 — pale, upside down, and carrying no diagram.",
  "153594323ede7e1e1f0fba03cd304eae7d6a94b2":
    "A mirrored reflection of the heading of page 70, 1893x157 — pale, upside down, and carrying no diagram.",
  "73263e338246783d47a38fb3a716ea755f0c382a":
    "A mirrored reflection of the heading of page 71, 1304x156 — pale, upside down, and carrying no diagram.",
  "0e386ecd5b63528e4b6305262ccc3dd110408b0a":
    "A mirrored reflection of the heading of page 72, 2003x156 — pale, upside down, and carrying no diagram.",
  "979169cb3b0b6e5170ba4d3faa5f7c32e14c2efc":
    "A mirrored reflection of the heading of page 73, 1591x156 — pale, upside down, and carrying no diagram.",
  "e773ba3ea5a4e5f3a9350837ab32413d45183f59":
    "A mirrored reflection of the heading of page 73, 672x156 — pale, upside down, and carrying no diagram.",
  "360de150cac33c461f1d3fe39c4c6740cf4eaa89":
    "A mirrored reflection of the heading of page 74, 2000x157 — pale, upside down, and carrying no diagram.",
  "9893acdbf5676ea76e8eadd30810588cb233c732":
    "A mirrored reflection of the heading of page 75, 2000x156 — pale, upside down, and carrying no diagram.",
  "99bc9b66bf2c7a1738a986ef05be9a818cbdca7d":
    "A mirrored reflection of the heading of page 76, 1033x156 — pale, upside down, and carrying no diagram.",
  "71d2354d0f4fe286cdb73d1cb3149e66e1b98050":
    "A mirrored reflection of the heading of page 76, 964x156 — pale, upside down, and carrying no diagram.",
  "d958e070afe836c06a7fb26ed4754a4d8cb90f4b":
    "A mirrored reflection of the heading of page 77, 684x157 — pale, upside down, and carrying no diagram.",
  "697a8a3cc6d2394e1ee360439bb1ebcaf9cf326a":
    "A mirrored reflection of the heading of page 77, 927x157 — pale, upside down, and carrying no diagram.",
  "b2c8dc8a42cac0925a30729178418a1b9b38bca8":
    "A mirrored reflection of the heading of page 78, 1411x157 — pale, upside down, and carrying no diagram.",
  "fd0e59574026da3fba82f83fb3773f402e6f985a":
    "A mirrored reflection of the heading of page 80, 746x157 — pale, upside down, and carrying no diagram.",
  "c6bdfb33ab50685f7ad2fe80a9fecd30f8cd0c9e":
    "A mirrored reflection of the heading of page 81, 884x157 — pale, upside down, and carrying no diagram.",
  "7dc8004e789b18748a45c8b5191490204b75fd2e":
    "A mirrored reflection of the heading of page 87, 995x157 — pale, upside down, and carrying no diagram.",
  "c772f9e9e884c1e0101949a61391b61b1c8aa30e":
    "A mirrored reflection of the heading of page 88, 1497x157 — pale, upside down, and carrying no diagram.",
  "56b0de3f863fe66f6f9eae04bec49ccb8968bf24":
    "A mirrored reflection of the heading of page 89, 1714x157 — pale, upside down, and carrying no diagram.",
  "c7ce5eddd614d326b1e8d9c30d19ac9ea6f7e125":
    "A mirrored reflection of the heading of page 90, 1562x157 — pale, upside down, and carrying no diagram.",
  "72cac25e56714a76c3b2484a5f87e53e2a351fe4":
    "A mirrored reflection of the heading of page 91, 932x157 — pale, upside down, and carrying no diagram.",
  "548260a078bb7a14420e877495747d2b6e634f91":
    "A mirrored reflection of the heading of page 92, 1684x157 — pale, upside down, and carrying no diagram.",
  "ad2cd04c48f08f98691ade38ae705ebd29a4bd6b":
    "A mirrored reflection of the heading of page 93, 1369x157 — pale, upside down, and carrying no diagram.",
  "99f3043f6cd8b772b82f7ce57445d99a79e7828d":
    "A mirrored reflection of the heading of page 94, 1514x157 — pale, upside down, and carrying no diagram.",
  "39df7174b5cb8a167852b2e03171541bb8178f6c":
    "A mirrored reflection of the heading of page 95, 1781x157 — pale, upside down, and carrying no diagram.",
  "62153ac38500dceedd2e0cf765efd8938a1a8f6d":
    "A mirrored reflection of the heading of page 95, 627x157 — pale, upside down, and carrying no diagram.",
  "5dc7d220bfb1ba02eb44a91774247c12a3acdeb1":
    "A mirrored reflection of the heading of page 96, 605x157 — pale, upside down, and carrying no diagram.",
  "ddc2db0b44f85e3c06ca81a068dd8fde18f0c7ee":
    "A mirrored reflection of the heading of page 97, 1500x156 — pale, upside down, and carrying no diagram.",
  "caeca3e4e0c1e1aa9607b32bbce57723e43433e4":
    "A mirrored reflection of the heading of page 98, 829x156 — pale, upside down, and carrying no diagram.",
  "c92ae282b04122dd6773180aa10bc530d082e7d9":
    "A mirrored reflection of the heading of page 99, 1919x157 — pale, upside down, and carrying no diagram.",
  "60344415eec94bfbaaf02e29f088dc1181d5308d":
    "A mirrored reflection of the heading of page 101, 631x157 — pale, upside down, and carrying no diagram.",
  "66e501d7b671c6861b790c4b3e87c553ccacdb9c":
    "A mirrored reflection of the heading of page 103, 1091x157 — pale, upside down, and carrying no diagram.",
  "6b29ff932b686473c4b5543aab4cbddab294a2f2":
    "A mirrored reflection of the heading of page 104, 1148x155 — pale, upside down, and carrying no diagram.",
  "46c5028f6b58f1a0d68163d618cb78e13c702623":
    "A mirrored reflection of the heading of page 105, 854x156 — pale, upside down, and carrying no diagram.",
  "929e5953d434deeb5419b223ab2887e6260661b1":
    "A mirrored reflection of the heading of page 106, 730x157 — pale, upside down, and carrying no diagram.",
  "f0833eb1843fe96936f908e17e65becfb760c133":
    "A mirrored reflection of the heading of page 108, 1339x157 — pale, upside down, and carrying no diagram.",
  "9d3a9109b5c187c4f1f33deae161854dea0a0d9f":
    "A mirrored reflection of the heading of page 109, 1339x156 — pale, upside down, and carrying no diagram.",
  "91be9c0e68e2a35590b6c61fd2c2114be463dd19":
    "A mirrored reflection of the heading of page 110, 1339x157 — pale, upside down, and carrying no diagram.",
  "5442d70d8228d76827a8db3736a2f57fa531b9e4":
    "A mirrored reflection of the heading of page 111, 2003x156 — pale, upside down, and carrying no diagram.",
  "2689dfa2e428b206e61f51bfe6e8a8c9fd6dba8d":
    "A mirrored reflection of the heading of page 114, 1982x156 — pale, upside down, and carrying no diagram.",
  "71a417903cfd0da5e8f548242a3ab2b5bc294666":
    "A mirrored reflection of the heading of page 114, 1127x156 — pale, upside down, and carrying no diagram.",
  "f66ffe7dfb5ee03b7a8d4370973581bad1e63fdd":
    "A mirrored reflection of the heading of page 124, 631x157 — pale, upside down, and carrying no diagram.",
  "bce0382b947c1fdb8bed84be3f23c6697c85448a":
    "A mirrored reflection of the heading of page 125, 1284x157 — pale, upside down, and carrying no diagram.",
  "b374e689e164e16ae05a1373ddbcfd8b3d9ed5dc":
    "A mirrored reflection of the heading of page 126, 1284x157 — pale, upside down, and carrying no diagram.",
  "eb7ec8863e9c943cddb9ef4dc3209a527a401bd8":
    "A mirrored reflection of the heading of page 129, 814x157 — pale, upside down, and carrying no diagram.",
  "74f6de95d2be17bf7a3778cc8daaba1c6160dbb2":
    "A mirrored reflection of the heading of page 130, 1104x157 — pale, upside down, and carrying no diagram.",
  "a050a84f95d53a07fa36888759ea61f70fa37988":
    "A mirrored reflection of the heading of page 132, 1930x157 — pale, upside down, and carrying no diagram.",
  "ff96d938806d4c546e024e433b17387f1d7769ac":
    "A mirrored reflection of the heading of page 134, 1295x156 — pale, upside down, and carrying no diagram.",
  "abdf82fb6546a42c1c8d3441b50f0457dfd371ce":
    "A mirrored reflection of the heading of page 135, 1475x157 — pale, upside down, and carrying no diagram.",
  "7c71b106983ec4851cdcf91790fca6923bad2ab2":
    "A mirrored reflection of the heading of page 136, 1684x157 — pale, upside down, and carrying no diagram.",
  "59032203870c5f3ac42e6aaa50732d17038ef04f":
    "A mirrored reflection of the heading of page 137, 1417x157 — pale, upside down, and carrying no diagram.",
  "427e0868c1f64617fa1892c0cbeeae504730c50d":
    "A mirrored reflection of the heading of page 138, 1312x156 — pale, upside down, and carrying no diagram.",
  "f73e00daea627ec6f92282d779f97ed600ebe9ac":
    "A mirrored reflection of the heading of page 139, 1027x157 — pale, upside down, and carrying no diagram.",
  "9c1e7860931c6fd948769a82d1e1ea44ba10d40b":
    "A mirrored reflection of the heading of page 140, 1445x157 — pale, upside down, and carrying no diagram.",
  "67583c84b0ce25b4c5146625656cfcde895233a2":
    "A mirrored reflection of the heading of page 141, 1287x157 — pale, upside down, and carrying no diagram.",
  "738690f72a3668d87ceb483a12f03d2f47b3dd21":
    "A mirrored reflection of the heading of page 142, 1065x157 — pale, upside down, and carrying no diagram.",
  "f962fb0c640ba59936f69e071cec653b31b07544":
    "A mirrored reflection of the heading of page 143, 1487x157 — pale, upside down, and carrying no diagram.",
  "5bc70ca8a4a73fc039a7b4e22871535b2dd92da6":
    "A mirrored reflection of the heading of page 144, 1508x157 — pale, upside down, and carrying no diagram.",
  "16196a88f3a9d11b5205501d7385a5e4adb79634":
    "A mirrored reflection of the heading of page 145, 1519x157 — pale, upside down, and carrying no diagram.",
  "ec93cf08a8816cc41c72984cb664e1dd13e1093e":
    "A mirrored reflection of the heading of page 146, 1312x157 — pale, upside down, and carrying no diagram.",
  "4dcfcb9e4f7ed0cef4379bf70b1d236518de798b":
    "A mirrored reflection of the heading of page 149, 954x157 — pale, upside down, and carrying no diagram.",
  "852f77c57fa488ec3de2a9c6f27ab9598a1d6379":
    "A mirrored reflection of the heading of page 150, 820x157 — pale, upside down, and carrying no diagram.",
  "3b54bfcac44ef15b2873c59a4fed4dc118973838":
    "A mirrored reflection of the heading of page 151, 820x157 — pale, upside down, and carrying no diagram.",
  "4930c86361d85410746bc2f3905f1609faedd14a":
    "A mirrored reflection of the heading of page 152, 1311x157 — pale, upside down, and carrying no diagram.",
  "e9f06e8312da5c9eb114bafc40cce59deac069e8":
    "A mirrored reflection of the heading of page 153, 1036x156 — pale, upside down, and carrying no diagram.",
  "62e6233fb24e733d26b59127695c9e61fd33c1b5":
    "A mirrored reflection of the heading of page 154, 996x157 — pale, upside down, and carrying no diagram.",
  "348660c5d043ee40ff3de26029f3b00ace3daa81":
    "A mirrored reflection of the heading of page 155, 595x157 — pale, upside down, and carrying no diagram.",
  "04745546f69b29f25fe29b343f6ec14f9aad8a2e":
    "A mirrored reflection of the heading of page 155, 914x157 — pale, upside down, and carrying no diagram.",
  "e47b13ad7e8c2990a5ac730b8ea5a1f983cea86c":
    "A mirrored reflection of the heading of page 155, 804x157 — pale, upside down, and carrying no diagram.",
  "aa23325daacaee3d994e43b58b1aed2306b16086":
    "A mirrored reflection of the heading of page 156, 688x157 — pale, upside down, and carrying no diagram.",
  "8a62e7ce2f5e0307a0cf92c502344140c5f32e75":
    "A mirrored reflection of the heading of page 157, 1465x157 — pale, upside down, and carrying no diagram.",
  "5467b0001b0138a5899a24b68be3d4aaab7ce40b":
    "A mirrored reflection of the heading of page 158, 1630x156 — pale, upside down, and carrying no diagram.",
  "9401293fa30d66861ef660e11bc086dc7858e031":
    "A mirrored reflection of the heading of page 159, 1005x156 — pale, upside down, and carrying no diagram.",
  "ffbdda407de90c6168cebba5b9c62af2082d1b93":
    "A mirrored reflection of the heading of page 160, 1876x163 — pale, upside down, and carrying no diagram.",
  "3ed57bff68c592a8a225e14e3c372185ab31d69b":
    "A mirrored reflection of the heading of page 161, 1606x156 — pale, upside down, and carrying no diagram.",
  "f42570abe3ab5333c530d35e2a1d5ca8dcd30ec1":
    "A mirrored reflection of the heading of page 163, 1339x157 — pale, upside down, and carrying no diagram.",
  "e5aa1789c88c4d4818fa84138f71340e837b8568":
    "A mirrored reflection of the heading of page 164, 1594x156 — pale, upside down, and carrying no diagram.",
  "f88067f51e75083cdd0e194f2a2185a2496869ea":
    "A mirrored reflection of the heading of page 165, 1594x156 — pale, upside down, and carrying no diagram.",
  "c807d5ddc001ced7a3d8950d142628805dd34df3":
    "A mirrored reflection of the heading of page 167, 872x171 — pale, upside down, and carrying no diagram.",
  "4261f0edde43fb037b52b880bd00524133d9a1df":
    "A mirrored reflection of the heading of page 167, 1769x171 — pale, upside down, and carrying no diagram.",
  "8ae113b8b4e86f21c7ac5faecc7d7415aa007e0d":
    "A mirrored reflection of the heading of page 168, 885x157 — pale, upside down, and carrying no diagram.",
  "2d60d1da9068ec0ccf3a42313fe29564b3e3eeea":
    "A mirrored reflection of the heading of page 168, 1271x157 — pale, upside down, and carrying no diagram.",
  "a4dadb08fba8ad178d84f0f97f59f48cebf4dc8f":
    "A mirrored reflection of the heading of page 169, 1234x157 — pale, upside down, and carrying no diagram.",
  "127d9135e02fa5e36641a37bb3dfbba3d51228c4":
    "A mirrored reflection of the heading of page 170, 726x157 — pale, upside down, and carrying no diagram.",
  "d6db86c4c09b4cc37d1d57e9abdbf8fb5f84f3a3":
    "A mirrored reflection of the heading of page 170, 890x157 — pale, upside down, and carrying no diagram.",
  "e576f4f47b350a771569cdfe76fc3bf1984dc0e0":
    "A mirrored reflection of the heading of page 172, 1466x157 — pale, upside down, and carrying no diagram.",
  "0f7c4d80ec8a8575a5001d345a0473ee5f05efdc":
    "A mirrored reflection of the heading of page 173, 1446x157 — pale, upside down, and carrying no diagram.",
  "81cd79f8db91f6acbc23f40357a2824423df52b0":
    "A mirrored reflection of the heading of page 174, 975x156 — pale, upside down, and carrying no diagram.",
  "7422bc82b8de52dedfb773e210b478466ff7fec5":
    "A mirrored reflection of the heading of page 176, 1847x157 — pale, upside down, and carrying no diagram.",
  "de04d5ce99080f27d34b3a94e6baaffc7648f3c5":
    "A mirrored reflection of the heading of page 177, 1466x157 — pale, upside down, and carrying no diagram.",
  "17465d30c87927eef81377ac7b612c88bd9d6147":
    "A mirrored reflection of the heading of page 180, 850x157 — pale, upside down, and carrying no diagram.",
  "6a5a82ea1b4f19e6bc281dee08cba930522756e9":
    "A mirrored reflection of the heading of page 183, 817x157 — pale, upside down, and carrying no diagram.",
  "79a2670403d6c5f6a90a4d7f644a718d8b57e0b5":
    "A mirrored reflection of the heading of page 184, 814x157 — pale, upside down, and carrying no diagram.",
  "399b4ea08f296dff391df79f8da6674ddc4fa7ab":
    "A mirrored reflection of the heading of page 185, 770x157 — pale, upside down, and carrying no diagram.",
  "d31d6fc52aac47b4d5f27c1779b0e55732a0ce60":
    "A mirrored reflection of the heading of page 186, 938x156 — pale, upside down, and carrying no diagram.",
  "9145dc7cf6ac83959e19cae70f2aa166b5263bd1":
    "A mirrored reflection of the heading of page 187, 1206x157 — pale, upside down, and carrying no diagram.",
  "f07114a4956d11cead62ad93fcfd565bcbc21ac5":
    "A mirrored reflection of the heading of page 189, 842x171 — pale, upside down, and carrying no diagram.",
  "8dea6a9aa45db1d8b64913717a3ea99da4db9287":
    "A mirrored reflection of the heading of page 189, 1441x171 — pale, upside down, and carrying no diagram.",
  "ab517eb8b29ba7a231b60afbc80db3bfbdb0d778":
    "A mirrored reflection of the heading of page 190, 971x156 — pale, upside down, and carrying no diagram.",
  "a168b331edc67bc7ce70f5f9230b40810ab917c0":
    "A mirrored reflection of the heading of page 192, 1319x156 — pale, upside down, and carrying no diagram.",
  "8494a4157412cbb05465f1eca4bd9d5b7e8ba39d":
    "A mirrored reflection of the heading of page 193, 962x157 — pale, upside down, and carrying no diagram.",
  "4893f13f692c86fde3d62c9148a18c24f5a14e87":
    "A mirrored reflection of the heading of page 194, 1129x156 — pale, upside down, and carrying no diagram.",
  "b1aa732103f6f035690230913f7a716de4cb0fa2":
    "A mirrored reflection of the heading of page 195, 1325x157 — pale, upside down, and carrying no diagram.",
  "7867e9838f061ee7f44da647d38286b5a213d542":
    "A mirrored reflection of the heading of page 197, 1186x157 — pale, upside down, and carrying no diagram.",
  "e545a590e1a5048ad225d14f3a8a3c35b950b1e6":
    "A mirrored reflection of the heading of page 198, 1186x157 — pale, upside down, and carrying no diagram.",
  "404eb966cad7de615514fbe0b1350aa054018da2":
    "A mirrored reflection of the heading of page 199, 1186x157 — pale, upside down, and carrying no diagram.",
  "9062d916e9a1dc9f997a6471f14d8f416a6c0ac6":
    "A mirrored reflection of the heading of page 200, 1603x157 — pale, upside down, and carrying no diagram.",
  "f9d5d717b078a4dbdb5ec8952d3d1a73a7acb806":
    "A mirrored reflection of the heading of page 201, 1603x157 — pale, upside down, and carrying no diagram.",
  "f4735c6e1454f692bd663e85a91222f8350c7e34":
    "A mirrored reflection of the heading of page 202, 1739x156 — pale, upside down, and carrying no diagram.",
  "9988d1551d53e5d1b604c51f99dfe4907ccc6ddb":
    "A mirrored reflection of the heading of page 203, 1347x156 — pale, upside down, and carrying no diagram.",
  "86c70b1e20adf347e56b711495e74ecd0003b28c":
    "A mirrored reflection of the heading of page 204, 1339x157 — pale, upside down, and carrying no diagram.",
  "e6ede633717ce49abdff5aea60f4d1b0d237a339":
    "A mirrored reflection of the heading of page 207, 911x157 — pale, upside down, and carrying no diagram.",
  "bcf0edfbee85a57e9610b1d2104da1eb975bf906":
    "A mirrored reflection of the heading of page 207, 1623x157 — pale, upside down, and carrying no diagram.",
  "969df325dbbabad50deb71ac480db254588389ed":
    "A mirrored reflection of the heading of page 208, 1857x157 — pale, upside down, and carrying no diagram.",
  "148401e03588745205921000d70d90294669dcaa":
    "A mirrored reflection of the heading of page 209, 1313x157 — pale, upside down, and carrying no diagram.",
  "c74416bc861a2fe6257c286f89ea6a3ebc8f6bd4":
    "A mirrored reflection of the heading of page 210, 1494x157 — pale, upside down, and carrying no diagram.",
  "9888731afbcb66838ba490f73e8486e10cc5c74e":
    "A mirrored reflection of the heading of page 211, 1337x157 — pale, upside down, and carrying no diagram.",
  "1a925d2e5fa95c5a6e3921001d5a7f4d7997cd61":
    "A mirrored reflection of the heading of page 211, 1072x157 — pale, upside down, and carrying no diagram.",
  "3dc1373ae73e5bb99a511bd06aa2a71ea95b5094":
    "A mirrored reflection of the heading of page 212, 1586x157 — pale, upside down, and carrying no diagram.",
  "a4705cfedec19d73de83af161c2d8316a7d0fcde":
    "A mirrored reflection of the heading of page 212, 1362x157 — pale, upside down, and carrying no diagram.",
  "c876e60f6d90a5a92f1d57a17c8a5842ff519fda":
    "A mirrored reflection of the heading of page 212, 905x157 — pale, upside down, and carrying no diagram.",
  "1cc68d22720083e8f7146702684bfa21fe4159b5":
    "A mirrored reflection of the heading of page 213, 959x156 — pale, upside down, and carrying no diagram.",
  "5e7102ae7ec5f811b98f3c6595222875eff267ce":
    "A mirrored reflection of the heading of page 213, 724x156 — pale, upside down, and carrying no diagram.",
  "1c742fc369a177ea0b87cd749bafdda55f799e14":
    "A mirrored reflection of the heading of page 215, 954x157 — pale, upside down, and carrying no diagram.",
  "5d172b709cee79c3e2104e76013806b0aacdf776":
    "A mirrored reflection of the heading of page 216, 870x157 — pale, upside down, and carrying no diagram.",
  "fb27f3fafaf07b02a4f0a9eb229d5cfc9dce9c3f":
    "A mirrored reflection of the heading of page 217, 1024x157 — pale, upside down, and carrying no diagram.",
  "2c2786dee506adede0c1b9f1d0673a86cd45d112":
    "A mirrored reflection of the heading of page 218, 1191x157 — pale, upside down, and carrying no diagram.",
  "a153a8c8273c4ee7c122b936a70dd9f52c726aab":
    "A mirrored reflection of the heading of page 220, 583x157 — pale, upside down, and carrying no diagram.",
  "9eb133134af545fba490e3662ccbdd5b50e48ddb":
    "A mirrored reflection of the heading of page 221, 1008x157 — pale, upside down, and carrying no diagram.",
  "c891398dde3230374e03d5f0d2059c1e1372ecf1":
    "A mirrored reflection of the heading of page 223, 1232x157 — pale, upside down, and carrying no diagram.",
  "689961b482d1cad96b033501da896ca3a8dda3a7":
    "A mirrored reflection of the heading of page 224, 1458x157 — pale, upside down, and carrying no diagram.",
  "498c3ac80c19e4cfcb661e84141cd435d550befc":
    "A mirrored reflection of the heading of page 225, 1020x157 — pale, upside down, and carrying no diagram.",
  "21f437a160dc5d59bfdbc69a3bcf51f81bc9f096":
    "A mirrored reflection of the heading of page 226, 1312x157 — pale, upside down, and carrying no diagram.",
  "222ca8375f86a3587c031008ea5485ace0913361":
    "A mirrored reflection of the heading of page 226, 500x128 — pale, upside down, and carrying no diagram.",
  "a7d6bcf8a330c1c80a0c6050477042ca738c3927":
    "A mirrored reflection of the heading of page 227, 936x157 — pale, upside down, and carrying no diagram.",
  "75071aa1243fefad8a85247b710869beeacc2c1b":
    "A mirrored reflection of the heading of page 228, 1321x157 — pale, upside down, and carrying no diagram.",
  "0462f5323db584d2990bf5e0ccc6f6afb9641086":
    "A mirrored reflection of the heading of page 229, 857x157 — pale, upside down, and carrying no diagram.",
  "26aff3c6e49f00352dd2f84433997c7c13f1e3f7":
    "A mirrored reflection of the heading of page 230, 942x157 — pale, upside down, and carrying no diagram.",
  "8cf3616c02481432727ee2733642b4bd0cabd005":
    "A mirrored reflection of the heading of page 233, 1735x156 — pale, upside down, and carrying no diagram.",
  "acf06318177f7203009af553e4db150ab98e9c85":
    "A mirrored reflection of the heading of page 233, 555x156 — pale, upside down, and carrying no diagram.",
  "7a7d29746ff263a5a4df46e95085698518bd4dc4":
    "A mirrored reflection of the heading of page 234, 1148x157 — pale, upside down, and carrying no diagram.",
  "d7b01048e7021f9e5f362bf9f7cc1a179037fb6e":
    "A mirrored reflection of the heading of page 236, 555x157 — pale, upside down, and carrying no diagram.",
  "990ffed82be893e2ca183a8cdaceabe77d966ca1":
    "A mirrored reflection of the heading of page 237, 535x163 — pale, upside down, and carrying no diagram.",
  "057a27cc09f4a0b984e56b4d41bc119bb7334e41":
    "A mirrored reflection of the heading of page 238, 951x156 — pale, upside down, and carrying no diagram.",
  "2367e1d9e962239667533472d369f4d2a67bef3c":
    "A mirrored reflection of the heading of page 241, 872x172 — pale, upside down, and carrying no diagram.",
  "cbd2384f67e02850b798adab555cc10a93ef6fa3":
    "A mirrored reflection of the heading of page 241, 1611x172 — pale, upside down, and carrying no diagram.",
  "9b0cf0b62c6c4471fbff882ac1026385dc624774":
    "A mirrored reflection of the heading of page 242, 1334x157 — pale, upside down, and carrying no diagram.",
  "a540811484496e3ea0ba8e3cbdbca47fab1e1d95":
    "A mirrored reflection of the heading of page 243, 1465x156 — pale, upside down, and carrying no diagram.",
  "e7149ed63883725f7acaba981446d6fbc161bb84":
    "A mirrored reflection of the heading of page 244, 864x157 — pale, upside down, and carrying no diagram.",
  "43ba0b35c520c72816886bf1bba9faef276cd169":
    "A mirrored reflection of the heading of page 245, 1883x157 — pale, upside down, and carrying no diagram.",
  "90f5b3d8727ae6c4ac3ebfee794b9d7ff8127665":
    "A mirrored reflection of the heading of page 246, 1082x156 — pale, upside down, and carrying no diagram.",
  "5e0390351c705c79ab5bd6d935e5991f948b98a1":
    "A mirrored reflection of the heading of page 247, 1007x157 — pale, upside down, and carrying no diagram.",
  "ac74d95cca4b9e771994175be5eb67dd521c4f4c":
    "A mirrored reflection of the heading of page 248, 1045x157 — pale, upside down, and carrying no diagram.",
  "17ead2c8757bec245b8303db397f313823c2add3":
    "A mirrored reflection of the heading of page 248, 713x157 — pale, upside down, and carrying no diagram.",
  "8f7e7ec88c387aaa6a77c2c0d8e477bf8a78f734":
    "A mirrored reflection of the heading of page 250, 713x157 — pale, upside down, and carrying no diagram.",
  "141609e2a7c370e2839acdbd08878c397b1e6b71":
    "A mirrored reflection of the heading of page 255, 872x171 — pale, upside down, and carrying no diagram.",
  "95a774ec47ba193467de2bbd3e1cd156bd154c2f":
    "A mirrored reflection of the heading of page 255, 1722x171 — pale, upside down, and carrying no diagram.",
  "45fc3ed0a74c2a4b6694df13c2eef1e220e4c837":
    "A mirrored reflection of the heading of page 256, 1049x157 — pale, upside down, and carrying no diagram.",
  "b8ec468137e861ee8cbee3b8902cc2ef82615a25":
    "A mirrored reflection of the heading of page 257, 606x157 — pale, upside down, and carrying no diagram.",
  "690bcf401b798ac54fd88cbb3e86f0ff4f999c5c":
    "A mirrored reflection of the heading of page 258, 807x156 — pale, upside down, and carrying no diagram.",
  "ed68adc4ce9921b8444f3e567bdeff98f7e676ae":
    "A mirrored reflection of the heading of page 258, 768x156 — pale, upside down, and carrying no diagram.",
  "86d156efcbd20e7d95432ae0566eb264cd942794":
    "A mirrored reflection of the heading of page 259, 597x157 — pale, upside down, and carrying no diagram.",
  "0f424ab0cb3df0042d82813e871c9bca018217e6":
    "A mirrored reflection of the heading of page 260, 777x157 — pale, upside down, and carrying no diagram.",
  "2c695e6f2100394751700af4f998b0a41604039e":
    "A mirrored reflection of the heading of page 261, 907x157 — pale, upside down, and carrying no diagram.",
  "8040e7e94c7d00d61cab3310dc23ba3c2726602e":
    "A mirrored reflection of the heading of page 263, 1254x157 — pale, upside down, and carrying no diagram.",
  "21101447e21f651efc2dbe44b5bc3d9978b7bc2a":
    "A mirrored reflection of the heading of page 264, 555x157 — pale, upside down, and carrying no diagram.",
  "1920ce72d2504587ad5794cd996b68db9b2c5945":
    "A mirrored reflection of the heading of page 265, 839x157 — pale, upside down, and carrying no diagram.",
  "3264f0279cafed2b595a900c6a0d083181271627":
    "A mirrored reflection of the heading of page 265, 766x157 — pale, upside down, and carrying no diagram.",
  "1800cc8db0ffc6e516ba9a19f0fb6b1d5505253e":
    "A mirrored reflection of the heading of page 266, 522x156 — pale, upside down, and carrying no diagram.",
  "bafb2e80d90e2af2c0412a861265ed000deef1d2":
    "A mirrored reflection of the heading of page 266, 1086x156 — pale, upside down, and carrying no diagram.",
  "97d26f99351581dc48507d382b537000db6ad3a9":
    "A mirrored reflection of the heading of page 267, 1297x157 — pale, upside down, and carrying no diagram.",
  "e3220e0bb0137462f5524f670a4b07600a04a10d":
    "A mirrored reflection of the heading of page 268, 1219x157 — pale, upside down, and carrying no diagram.",
  "ff784ad95adfdd713cec86471e5867c52dd76e19":
    "A mirrored reflection of the heading of page 268, 804x157 — pale, upside down, and carrying no diagram.",
  "12eed541bdfd4fb38a8a73f0b0ec981f2d67733a":
    "A mirrored reflection of the heading of page 269, 947x157 — pale, upside down, and carrying no diagram.",
  "a7da2599a7d98947170117d004a6878fe6910aad":
    "A mirrored reflection of the heading of page 269, 1398x157 — pale, upside down, and carrying no diagram.",
  "72fedc212849d1a184fa5265a9eb21ffb3e43c2e":
    "A mirrored reflection of the heading of page 270, 1148x157 — pale, upside down, and carrying no diagram.",
  "712372b786a4d2d73ffb2bfc3d8a7bd7b1d8d325":
    "A mirrored reflection of the heading of page 271, 1431x157 — pale, upside down, and carrying no diagram.",
  "7f42e906fc51c566c541770e923b81fd28e73c87":
    "A mirrored reflection of the heading of page 273, 610x157 — pale, upside down, and carrying no diagram.",
  "8eeb95145570750bc76b24a3bb8b0a29f2b127f3":
    "A mirrored reflection of the heading of page 273, 804x157 — pale, upside down, and carrying no diagram.",
  "37f9a8206e50f64c10b501a721bf09f7f8d610ce":
    "A mirrored reflection of the heading of page 273, 707x157 — pale, upside down, and carrying no diagram.",
  "6b497e89c4ffa726f496c3d0f5a3745d74bcf527":
    "A mirrored reflection of the heading of page 295, 1465x171 — pale, upside down, and carrying no diagram.",
  "3c545d4bf377e88ff92cc071a35280e4c64e4601":
    "A mirrored reflection of the heading of page 295, 1530x171 — pale, upside down, and carrying no diagram.",
  "8982464c84966025ee902c1bf15b8c140a235ad7":
    "A mirrored reflection of the heading of page 295, 2004x171 — pale, upside down, and carrying no diagram.",
  "465c270ac592ca560edb5d5127943b6a5691cf87":
    "A mirrored reflection of the heading of page 296, 1392x171 — pale, upside down, and carrying no diagram.",
  "d0692f64a207fe0897e57cbfe8b606bc47b6e6a2":
    "A mirrored reflection of the heading of page 298, 1339x157 — pale, upside down, and carrying no diagram.",

  /* ---- everything else, one verdict at a time ------------------------- */
  "bd845e1742f1b18f9e39f0f9adc124fdfa91d208":
    "Page 1. The New Zealand International Commercial Pilot Academy wordmark and fern, on the deck cover. Another provider's branding, and not teaching material by any reading.",
  "0cef500a0a1a47f6e13a216784527424d7bdd336":
    "Page 42. A screenshot carrying the watermark \"fly8MA.com — Jon Kotwicki\" across it. A third party's branded still; the lift curve it sits beside is taught in the page text and in the figures either side.",
  "cc8d135d3665f7c36bc6788139c49daaf7ae803f":
    "Page 57. An aerial photograph of a braided river and farmland, on the interference drag page. Whatever it illustrated in the lecture, nothing on it relates to interference drag.",
  "a417438412c83637e89e64ee5cabc7b366f5b82f":
    "Page 69. A 1920x1080 photograph of a presenter facing the camera — a still lifted from a video, on the radial engine page. It shows no engine.",
  "307dd45fbbd77aed67c8233de73f622289bd8899":
    "Page 84. A 502x360 image so pale and out of focus that nothing in it can be identified.",
  "22922663d3dc22c9da69fdef8e8de10b815cafb4":
    "Page 91. Three rows of short red dashes, no other content. An overlay fragment lifted off the idling-system drawing on page 91.",
  "99b4f193f76ca84343ad66db9bf3fb1c8436faba":
    "Page 91. A low-resolution animation frame watermarked \"ONTHEFLIGHTLINE.COM\". A third party's branding, and at 320x240 the mechanism it shows cannot be read.",
  "b72f740a595f95ce1531b47515c5c1983c9cb52d":
    "Page 96. The word \"OFF\" as a pale mirrored reflection — the tail of the idle cut-off heading, not a diagram.",
  "1bdc6f7752d8feef89598b5d2121c342c4434cd3":
    "Page 101. The letters \"PRE\" as a pale mirrored reflection — the tail of the pre-ignition heading. Measured as a diagram because of its proportions; it is the same page furniture as the rest of the reflections.",
  "63b463d3d29c5812950bc05124376f923a5c3f00":
    "Page 107. A 1280x720 photograph of runway threshold chevrons, on the carburettor icing page. Unrelated to the page and to the chapter.",
  "666b2f1a4205e8084289bde143cb21604c2a2b36":
    "Page 178. A bare red arrow on white. It pointed at something on page 178; separated from it, it points at nothing.",
  "e6be9bd0ee2577d03d19e2ae4ff176e71d439eb2":
    "Page 185. A large red cross, 157x151, with nothing else on it. A do-not marker drawn beside one of the refuelling photographs on page 185; alone it marks nothing.",
  "e4679a4467d39c4b0771fcf03578934c304219bc":
    "Page 185. A large green tick, 167x151 — the matching marker from page 185.",
  "632b00ebae28089cce6ea60971e03ac02751d058":
    "Page 219. The word \"SPEED\" as a pale mirrored reflection of the page heading.",
  "1512835aba4c86a888cfc7afe3346f784e683ee9":
    "Page 229. A single letter \"C\" on white. One of the four letters of the ASI-error mnemonic on page 229, each of which reached the extractor as its own picture. The mnemonic itself is in the page text.",
  "2d525f67c2828bc195fbd9408350fbce550466e7":
    "Page 229. A single letter \"E\" on white — the same mnemonic on page 229, one letter per picture.",
  "2788c00f81df2e0ae939f0a5e050848682a140c7":
    "Page 229. A single letter \"C\" on white — the same mnemonic on page 229, one letter per picture.",
  "5d3f93d5c7cbe27796c87315de832b67817b3af1":
    "Page 229. A single letter \"D\" on white — the same mnemonic on page 229, one letter per picture.",
  "4b801db918ede933f61d1202f4ddf8ea942e2cd6":
    "Page 235. The letters \"VSI\" as a pale mirrored reflection of the page heading.",
  "4123adcae978a445034d19b1c95e6578f1b1580a":
    "Page 236. The word \"descent\" beside an arrow, 81x61. One of five fragments the VSI drawing on page 236 arrived in; the drawing itself is kept.",
  "46ec8939936b135e705a19393c95daef374b3dc3":
    "Page 236. The word \"climb\" beside an arrow, 71x48 — the matching fragment from page 236.",
  "c900a4e683fb359a76e0090ca70e69162ffbdc0d":
    "Page 236. A dashed line 193x14, with nothing else on it. Page 236 overlay fragment.",
  "77f49c519b0e4924728a0faeab8ec6edf1258718":
    "Page 236. A second dashed line 193x14 from the same drawing on page 236.",
  "cedb043ef28beb895f3fd71273e9f0c3701d4c43":
    "Page 236. A 66x39 corner of the instrument face on page 236, too small to identify on its own.",
  "690b073ad5c0d05ba263aca9c8ba5aafd58f691e":
    "Page 237. The letters \"PRE\" as a pale mirrored reflection of the page heading.",
  "ffa3884e9aff69414be688c91ba67ebf655971bf":
    "Page 276. A 380x270 cockpit screenshot washed out almost to white. The displays in it cannot be read at all.",
  "b79be6e1d5d35a4cc52b2b7d5a506db5748b3ce6":
    "Page 309. A 480x270 video still of two fighter aircraft in formation, on the flight controls page. Decorative in the lecture and unreadable as a diagram.",
  "f673fbb11c8e36b1465f7c0c13fb45649d0a44f1":
    "Page 310. A 480x270 video still of a pilot in a military cockpit. Nothing on it teaches the control it sits beside.",
  "10d44aa543bb1b189447a46750e6726627c817a6":
    "Page 313. A 480x360 video still of a propeller, blurred and washed out; the slipstream it was meant to show is not visible in it.",
  "f89b2843609c9840d7407f88b7abb14986fcc9b6":
    "Page 319. A 200x113 flight simulator screenshot, dark and too small to make out the tail surfaces it sits beside on page 319.",
  "8a83343bcd6256b2b6789d1b371c27c16638d6db":
    "Page 401. A photograph carrying an \"alamy stock photo\" watermark. A stock library's watermark is exactly what a student must not be shown.",
  "177d60443a4a57b8aacb09cc900f8ada2f20ed45":
    "Page 420. A 116x115 grey play-button triangle — the video player's own control, captured as part of the page.",
  "08fccad0bdd75e65a87bed99bf533a0dc7d014e3":
    "Page 420. A single line of the body text of page 420 set as a picture, 1929x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
  "2157682d65d68c5878233eea31f6ce7a05257e3a":
    "Page 420. A single line of the body text of page 420 set as a picture, 1857x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
  "a4d8e7ecbabb829913fec073368728030abe6c50":
    "Page 420. A single line of the body text of page 420 set as a picture, 608x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
  "88fa320fb282bcc936eaeac67529ae9762b39fb8":
    "Page 420. A single line of the body text of page 420 set as a picture, 1830x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
  "3c7016bbe22746ccae72712aecb2146b4a737c72":
    "Page 420. A single line of the body text of page 420 set as a picture, 1899x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
  "027563906172d77c7d7422da2f262b4a0cea84b9":
    "Page 420. A single line of the body text of page 420 set as a picture, 973x149. The same words are in the page's own text and are printed there; as an image the line cannot be selected, searched or read at any other size.",
};

/**
 * Figures the PDF stores rotated, which the extractor pulled out unrotated.
 *
 * A PDF can embed an image any way round and place it with a transform, and
 * pypdf hands back the stored bytes. Twelve of the scanned textbook figures in
 * this deck are stored upside down, so they read perfectly in the book and
 * arrive here inverted — a bourdon tube with "pointer shaft" written upside
 * down under it. They are real teaching diagrams, so they are turned the right
 * way up on the way into storage rather than dropped.
 */
export const UPSIDE_DOWN = {
  "295a72694c0f1e3a4de71987be75af0948ff98bb":
    "Page 158. The centre-zero ammeter schematic, Fig. 10-2. Stored upside down; rotated 180°.",
  "e4607b860a55a8ec0626c7022e858aeac1d7318a":
    "Page 197. The dry sump oil system, with the tank, scavenge pump and relief valve labelled. Stored upside down; rotated 180°.",
  "bd52cf81375a4ccb85d0f4957965f62be4a957e8":
    "Page 207. The mechanical tachometer: flyweights, spring and flexible drive. Stored upside down; rotated 180°.",
  "776a1c461552acb2c019508afe8480c74f5a0ca2":
    "Page 209. The bourdon tube of the oil pressure gauge, with pointer shaft and spring labelled. Stored upside down; rotated 180°.",
  "506b070336253fda3acce349e3d5c2f9f4ec7183":
    "Page 210. The remote indicating oil pressure system, sensor beside instrument. Stored upside down; rotated 180°.",
  "2256cf8d50ac0b2bd17a5068bd39ac39c1e75726":
    "Page 212. The bi-metallic strip and the direct reading outside air temperature gauge, Fig. 11-10. Stored upside down; rotated 180°.",
  "77ac5d7a7e2f9e5f163e7a577dbfac970b7a3c47":
    "Page 245. The construction of a card-type direct-reading compass, Fig. 14-6. Stored upside down; rotated 180°.",
  "eb58a8dad45587b9a9f0428f0e7a46a3f101d786":
    "Page 247. The compass card showing how far to go beyond and to stop short of a heading. Stored upside down; rotated 180°.",
  "736292c20ecbee108bd2ca0bafae833e10a0df8e":
    "Page 248. Variation east and variation west, Fig. 14-4. Stored upside down; rotated 180°.",
  "cc39245a8ed45d1a3b0ad65408fa80d70876a080":
    "Page 260. Precession: the force applied at A precessed through 90°, Fig. 13-3. Stored upside down; rotated 180°.",
  "e7157831b17927c70425c4a306ec35ffc1c086d5":
    "Page 263. The turn indicator's gimbal, spindle and crank arm. Stored upside down; rotated 180°.",
  "d03689273d8cfc8df98a8319aec9c3e0341dd384":
    "Page 267. The air jet keeping the gyro spinning vertically, Fig. 13-12. Stored upside down; rotated 180°.",
};

/** True if this image must not reach a student. */
export function isRejectedImage(sha1) {
  return Object.hasOwn(DROPPED, sha1);
}

/** True if this image has to be turned 180° before it is stored. */
export function isUpsideDown(sha1) {
  return Object.hasOwn(UPSIDE_DOWN, sha1);
}
