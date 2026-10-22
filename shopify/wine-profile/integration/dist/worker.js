// shopify/wine-profile/integration/worker.mjs
import { DurableObject } from "cloudflare:workers";

// shopify/wine-profile/messaging/content-registry.json
var content_registry_default = {
  f22cab08e708b6ac: "Bold, Savoury & Adventurous",
  "67c730a03ad19d57": "Your answers point towards red wine, with an interest in ",
  e34031cf49bb6752: "richness and savoury flavours. ",
  e262b362cd77bd5d: "Your choices around a fuller body and ",
  a932c3e22ab2811f: "a dry finish help shape the suggestions below, rather than fixing you into a single wine personality. ",
  "3b704238000d5310": "Your curiosity about unfamiliar styles leaves space to explore different grapes and ways of making wine. ",
  d89f9eb89526d5be: "At the table, familiar foods can give you a simple way to notice texture and freshness. ",
  c4b3d67dc52aad11: "This is a starting point based on what you shared, not a measurement of tasting ability. ",
  d36ab4f13e848cda: "Your preferences can change as you learn. ",
  fa95335efc80e62a: "Red wine",
  d0b7555dd627161b: "Rich and full-bodied, Dry and savoury",
  "8dfd24fad957ec70": "Full-bodied",
  "702ec3f256e47f56": "Dry",
  "1016effe4d5b6e9d": "I enjoy discovering new varieties and styles",
  "31eb0799f8ad2d4a": "Notice the weight of a wine",
  fc5bd583dc4d2f17: "If you choose to taste, compare small samples of a lighter and fuller-bodied wine. ",
  afe1c07cbf4c72b3: "Notice how each feels in your mouth, rather than how strong its aroma seems. ",
  "13ba26f65eb2e798": "Write one texture word for each; neither needs to be better. ",
  f0c2f0a78778290d: "Try a bite of your meal and notice whether the impression changes. ",
  "2dd1c290b34af4d0": "Tasting is optional; you can smell, read or spit instead. ",
  "1c4a705d9cab4bde": "The first vintage, and the lessons that followed",
  "34b82c23948b5eb9": "A suggested journal topic: the small experiments that shape a growing winery, beginning with the 2024 vintage.",
  a99df1108afdb97b: "Styles worth exploring",
  "61d95c56b452d8a1": "Full-bodied Shiraz",
  cffbde2784a06b13: "Dark plum fruit with a hint of black pepper.",
  "184a7d53faa15b34": "You included red wine; this is one expression to learn about. ",
  ada6047ef221722a: "It offers a starting point for your interest in richness. ",
  "43f2b670b75f9d22": "Look for a dry example to match your sweetness preference. ",
  ed39d1d766701672: "Cabernet Sauvignon",
  "30729dde109174c4": "Blackcurrant aromas and a firm, drying texture.",
  e72d46689029adcf: "Full-bodied Malbec",
  "59c02e2d7da9a5f8": "Dark-berry aromas with a generous, rounded texture.",
  "3ac03fbec1eb225e": "Your answers point towards the possibility of finding new favourites, with an interest in ",
  "38c4fbc760ab75d8": "I'm still exploring",
  "271a474aba98b008": "An introductory style to help you compare and discover what interests you. ",
  "7a74863662abec31": "Full-bodied, oak-influenced Chardonnay",
  afab79a31cac5a9d: "A rounded texture with a suggestion of toast.",
  "58ec2986eddeffb0": "Your answers point towards white wine, with an interest in ",
  "0e17925cc06efcc2": "White wine",
  df44a243091ef573: "You included white wine; this is one expression to learn about. ",
  "59b16015715b891a": "Dry, skin-contact white wine",
  "7b6ca9dfc57cfdfc": "Tea-like grip from time spent on grape skins.",
  "38c846ead3aef7a1": "It offers a starting point for your interest in savoury flavours. ",
  cf924f7a830d5a0d: "This medium-bodied expression also offers a contrast to your full-bodied preference. ",
  "020620a3d69adec8": "Vermentino",
  f4ab63e2e6e1d198: "Citrus peel and a lightly savoury finish.",
  d216670caefc9771: "This light-bodied expression also offers a contrast to your full-bodied preference. ",
  "4d66781d49669677": "Your answers point towards red wine and white wine, with an interest in ",
  "945e2bd1bf4fb08d": "Red wine, White wine",
  "36f59e8037998f1c": "Your answers point towards ros\xE9, with an interest in ",
  "532381b220813d55": "Ros\xE9",
  e796dbdc5caaf83c: "Textured, dry Sangiovese ros\xE9",
  "3b009b5425b01272": "Cherry-like fruit and a little grip on the finish.",
  "0acd39f155c47f7b": "You included ros\xE9; this is one expression to learn about. ",
  "6f7a278e8afa63b8": "Dry, pale ros\xE9",
  "27d88631ed96382f": "Delicate red-berry aromas with a fresh finish.",
  b4284dcd9ef8e2be: "Off-dry ros\xE9",
  "2e10c892bcdcf0ec": "Strawberry-like fruit with a small cushion of sweetness.",
  "2f37913daf3141ee": "Its off-dry finish offers a contrast to the sweetness you selected. ",
  "6f35cd3c79350cb6": "Your answers point towards red wine and ros\xE9, with an interest in ",
  b46657d9933cf976: "Red wine, Ros\xE9",
  "9727a08f0e279f8f": "Your answers point towards white wine and ros\xE9, with an interest in ",
  "4a22b8fee57cc9c0": "White wine, Ros\xE9",
  e6db5abd7112c77b: "Your answers point towards a broad range of wine styles, with an interest in ",
  "5b63c8d9b45bd4cc": "Red wine, White wine, Ros\xE9",
  e14433dc21e9be8f: "Your answers point towards sparkling wine, with an interest in ",
  fe4f312ea05c9093: "Sparkling wine",
  "9eaa1b08a915d156": "Traditional-method sparkling wine",
  "411d0a97d2874fa5": "Bready aromas alongside the texture of bubbles.",
  aea1ad5e29f98214: "You included sparkling wine; this is one expression to learn about. ",
  "6441faf37fef5e0c": "Dry p\xE9tillant naturel",
  "1449d8d9ff94bcc5": "Lively bubbles; texture varies with the producer.",
  aacc00012aa7e628: "Brut sparkling Chardonnay",
  "8535b2439ed063e4": "Fine bubbles and green-apple freshness.",
  "78cbad5d2b4fae7c": "Your answers point towards red wine and sparkling wine, with an interest in ",
  "7fa7aeff4e714dcf": "Red wine, Sparkling wine",
  af7c46ae1f6d6788: "Your answers point towards white wine and sparkling wine, with an interest in ",
  "2da2e3a3286a74fd": "White wine, Sparkling wine",
  "4f9b73d9914fdffe": "Red wine, White wine, Sparkling wine",
  f572d4283738d8cd: "Your answers point towards ros\xE9 and sparkling wine, with an interest in ",
  "0c7ffa8dfa2c4ece": "Ros\xE9, Sparkling wine",
  fbfcef4f67668411: "Red wine, Ros\xE9, Sparkling wine",
  "9a03a3f7460818af": "White wine, Ros\xE9, Sparkling wine",
  "71e3437b0cd1a4e3": "Red wine, White wine, Ros\xE9, Sparkling wine",
  "4a76baa31c447a7c": "Your answers point towards mead, with an interest in ",
  "1a689c2950588fa4": "Mead or honey-based wine",
  "4056d480e0274fe8": "Dry traditional mead",
  dd7223b2504e7ced: "A floral honey aroma without assuming a sweet finish.",
  "8715c27ca70c9197": "You included mead; this is one expression to learn about. ",
  "4d071a05ae9201dd": "Sweet traditional mead",
  "82c84b69534ec85f": "Honeyed aromas with a fuller, sweet texture.",
  c73626cf2435208a: "Its sweet finish offers a contrast to the sweetness you selected. ",
  "71f30f4da7a3c7f9": "Off-dry traditional mead",
  a1931f42677df325: "Floral aromas and a gentle amount of residual sweetness.",
  "02fdd8ee32e6579d": "Your answers point towards red wine and mead, with an interest in ",
  "144cdf8acf682c4e": "Red wine, Mead or honey-based wine",
  "48729620cb2bc42f": "Your answers point towards white wine and mead, with an interest in ",
  f518ae2a160b8ace: "White wine, Mead or honey-based wine",
  f3cc461626801745: "Red wine, White wine, Mead or honey-based wine",
  "9d8ae66935743cb3": "Your answers point towards ros\xE9 and mead, with an interest in ",
  "3d416e07a761f54c": "Ros\xE9, Mead or honey-based wine",
  "8b5187886b240ab1": "Red wine, Ros\xE9, Mead or honey-based wine",
  "2548e6621c283184": "White wine, Ros\xE9, Mead or honey-based wine",
  c8508ac736364946: "Red wine, White wine, Ros\xE9, Mead or honey-based wine",
  "54a695dc0b93cd1a": "Your answers point towards sparkling wine and mead, with an interest in ",
  "05986a08c16928d5": "Sparkling wine, Mead or honey-based wine",
  "3d182e587a3a39fa": "Red wine, Sparkling wine, Mead or honey-based wine",
  "93da546ed9b770a6": "White wine, Sparkling wine, Mead or honey-based wine",
  "24d6550e5a91ba15": "Red wine, White wine, Sparkling wine, Mead or honey-based wine",
  "290d7a9121ce69b5": "Ros\xE9, Sparkling wine, Mead or honey-based wine",
  ee4160d5280bea87: "Red wine, Ros\xE9, Sparkling wine, Mead or honey-based wine",
  "38a00aa0aa32ba33": "White wine, Ros\xE9, Sparkling wine, Mead or honey-based wine",
  "3075b01e1a1a93c8": "Red wine, White wine, Ros\xE9, Sparkling wine, Mead or honey-based wine",
  ac1f4b9ab361e3b6: "Your answers point towards small-batch experiments, with an interest in ",
  ca89e2a86747ff0d: "Experimental or small-batch wines",
  acb3c575455ea9cb: "You included small-batch experiments; this is one expression to learn about. ",
  "2f9babfdc52e7f0b": "Your answers point towards red wine and small-batch experiments, with an interest in ",
  "20d1bf7aaff84d0b": "Red wine, Experimental or small-batch wines",
  db5c0e6e080ec826: "Your answers point towards white wine and small-batch experiments, with an interest in ",
  a02840d23026d27b: "White wine, Experimental or small-batch wines",
  def4fa4878b5486a: "Red wine, White wine, Experimental or small-batch wines",
  bcb7aac22ab3ef9b: "Your answers point towards ros\xE9 and small-batch experiments, with an interest in ",
  "444219039062bf2e": "Ros\xE9, Experimental or small-batch wines",
  "837ac448255e98d8": "Red wine, Ros\xE9, Experimental or small-batch wines",
  "5daac80074048f6c": "White wine, Ros\xE9, Experimental or small-batch wines",
  "73b6d8a4b9f30312": "Red wine, White wine, Ros\xE9, Experimental or small-batch wines",
  "1624fc735daf6740": "Your answers point towards sparkling wine and small-batch experiments, with an interest in ",
  b86163219925e345: "Sparkling wine, Experimental or small-batch wines",
  fe62a7c79fa0f192: "Red wine, Sparkling wine, Experimental or small-batch wines",
  "7d1c54d3aa70ced9": "White wine, Sparkling wine, Experimental or small-batch wines",
  "460dadb79ef533d2": "Red wine, White wine, Sparkling wine, Experimental or small-batch wines",
  "3fff63a7ea71af3d": "Ros\xE9, Sparkling wine, Experimental or small-batch wines",
  "0dc8cf3466bf9e2b": "Red wine, Ros\xE9, Sparkling wine, Experimental or small-batch wines",
  "14ee539a79f56a79": "White wine, Ros\xE9, Sparkling wine, Experimental or small-batch wines",
  b18d717e8db9fd4e: "Red wine, White wine, Ros\xE9, Sparkling wine, Experimental or small-batch wines",
  "0d474668bdd3f098": "Your answers point towards mead and small-batch experiments, with an interest in ",
  "50977b63d885f29e": "Mead or honey-based wine, Experimental or small-batch wines",
  e29f9632f97f6525: "Red wine, Mead or honey-based wine, Experimental or small-batch wines",
  bc046f63c61a79be: "White wine, Mead or honey-based wine, Experimental or small-batch wines",
  "0a042530befa6e61": "Red wine, White wine, Mead or honey-based wine, Experimental or small-batch wines",
  "66e5ae7a43786d79": "Ros\xE9, Mead or honey-based wine, Experimental or small-batch wines",
  df5ce9b84a7e2f7d: "Red wine, Ros\xE9, Mead or honey-based wine, Experimental or small-batch wines",
  "82dac55d24774f1a": "White wine, Ros\xE9, Mead or honey-based wine, Experimental or small-batch wines",
  "2e2a2f949f88bc8f": "Red wine, White wine, Ros\xE9, Mead or honey-based wine, Experimental or small-batch wines",
  b3fd3b95e744fcd7: "Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "08c3a8fcf8cc0f30": "Red wine, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "1353e617c3feda84": "White wine, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "4a3760605e871eac": "Red wine, White wine, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "8c2603fd12235a04": "Ros\xE9, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  cabf2da0207fe22a: "Red wine, Ros\xE9, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  a7b345756f063909: "White wine, Ros\xE9, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "337a55bed0121ca2": "Red wine, White wine, Ros\xE9, Sparkling wine, Mead or honey-based wine, Experimental or small-batch wines",
  "86a555b5b86adbb4": "Bold & Adventurous",
  "9c007456d84824a8": "room to discover the flavours you enjoy. ",
  "8a0d84ab393b4c9c": "I'm not sure yet",
  f31eb9d83239865e: "Bold, Fresh & Adventurous",
  "6fdef2e9d1784bb5": "freshness. ",
  fa3b1dcec32d2db0: "Fresh and crisp",
  f51c400babaa0640: "delicate flavours. ",
  "69badc31e2afd317": "Light and delicate",
  "05c9e96226da1d17": "Light-bodied Pinot Noir",
  b235320ba5daddda: "A red-cherry aroma and a gentle, drying finish.",
  "51ac7ab29ff8f675": "It offers a starting point for your interest in delicate flavours. ",
  "54f773cf5bf97f7d": "Medium-bodied Grenache",
  "0cfbf80f3c98ba5a": "Red-berry aromas with a rounded texture.",
  e7e13b353a4e3162: "freshness and delicate flavours. ",
  "78729324d2fb8a6f": "Fresh and crisp, Light and delicate",
  cb4294c1d1847818: "Bold, Aromatic & Adventurous",
  "94274c523949e4c2": "expressive aromas. ",
  ce32b13bcffa3e11: "Fruity and aromatic",
  "1ec59c99befb155b": "It offers a starting point for your interest in expressive aromas. ",
  "395241b531bcafd3": "freshness and expressive aromas. ",
  c82d209ed855755b: "Fresh and crisp, Fruity and aromatic",
  "9ce931ad45144869": "delicate flavours and expressive aromas. ",
  fc388e1fb5ee7c2e: "Light and delicate, Fruity and aromatic",
  ff89710cf5ec05a8: "freshness, delicate flavours and expressive aromas. ",
  "2ab766ad33ce6640": "Fresh and crisp, Light and delicate, Fruity and aromatic",
  d4672891db85f2c0: "richness. ",
  "37202af5d51afda2": "Rich and full-bodied",
  f5097f575f6891ec: "freshness and richness. ",
  "6d494c3563d78103": "Fresh and crisp, Rich and full-bodied",
  "3e0d790e271bbe44": "delicate flavours and richness. ",
  e27296d6b2f3b299: "Light and delicate, Rich and full-bodied",
  "060dd1463d46755e": "freshness, delicate flavours and richness. ",
  "9d80cf7a9d99b414": "Fresh and crisp, Light and delicate, Rich and full-bodied",
  "6f3e57ce309b64c0": "expressive aromas and richness. ",
  b16c89bb8c25c32c: "Fruity and aromatic, Rich and full-bodied",
  "20b25d05dffe0459": "freshness, expressive aromas and richness. ",
  "6d51814532dd8c07": "Fresh and crisp, Fruity and aromatic, Rich and full-bodied",
  "2121e6520830b1f3": "delicate flavours, expressive aromas and richness. ",
  "56ab0015e0a44ca0": "Light and delicate, Fruity and aromatic, Rich and full-bodied",
  "70cf652864b4bc90": "savoury flavours. ",
  de7b62c04ee7bf8b: "Dry and savoury",
  "11c14b18d93030e5": "freshness and savoury flavours. ",
  c493ce70ea82fe03: "Fresh and crisp, Dry and savoury",
  b13cb6a81df04da0: "delicate flavours and savoury flavours. ",
  e6a82246790d9500: "Light and delicate, Dry and savoury",
  "9b06d42232d37588": "freshness, delicate flavours and savoury flavours. ",
  e5fa57611640ac98: "Fresh and crisp, Light and delicate, Dry and savoury",
  a2b1e5a9f8cd7355: "expressive aromas and savoury flavours. ",
  c424f3c82992fa92: "Fruity and aromatic, Dry and savoury",
  b0c994126dfad9b0: "freshness, expressive aromas and savoury flavours. ",
  "406ce1cf74c497b0": "Fresh and crisp, Fruity and aromatic, Dry and savoury",
  "2895db042b6901b1": "delicate flavours, expressive aromas and savoury flavours. ",
  "66b03973bbee09ce": "Light and delicate, Fruity and aromatic, Dry and savoury",
  "203ef36800acee08": "freshness, richness and savoury flavours. ",
  a26978375b2f4d74: "Fresh and crisp, Rich and full-bodied, Dry and savoury",
  "1b8287731e5064b9": "delicate flavours, richness and savoury flavours. ",
  "24402816b4f77e13": "Light and delicate, Rich and full-bodied, Dry and savoury",
  aa52b9ec40ff47d2: "expressive aromas, richness and savoury flavours. ",
  c91feab9fb74a13a: "Fruity and aromatic, Rich and full-bodied, Dry and savoury",
  "4d1d4352bfe7b478": "sweet, smooth flavours. ",
  "2391a9ca1e8c43ac": "Sweet and smooth",
  "2f58acc995676bd6": "Separate fruitiness from sweetness",
  "9ba59b53fbc3e0c1": "If you choose to taste, compare small samples of a clearly labelled dry and off-dry wine from the same grape. ",
  "3f24ee3ddaa1d7cf": "Smell first, then notice sweetness on the palate and mouth-watering acidity. ",
  "07987380e0b092ff": "A fruity aroma does not necessarily mean a wine is sweet. ",
  ef1196ed59cad211: "freshness and sweet, smooth flavours. ",
  "355eeee29f590fd1": "Fresh and crisp, Sweet and smooth",
  e17834cc60898ab8: "delicate flavours and sweet, smooth flavours. ",
  "0a062a1f67ec2ab2": "Light and delicate, Sweet and smooth",
  ddfcf32d12bbc9d4: "freshness, delicate flavours and sweet, smooth flavours. ",
  b9b6bcbd00c1176d: "Fresh and crisp, Light and delicate, Sweet and smooth",
  "9ab4897491065c71": "expressive aromas and sweet, smooth flavours. ",
  "6b93f4d8c5631a29": "Fruity and aromatic, Sweet and smooth",
  "1349fa3a1a1d0273": "freshness, expressive aromas and sweet, smooth flavours. ",
  "09778cc1a3d7b0cc": "Fresh and crisp, Fruity and aromatic, Sweet and smooth",
  "2582c460d3c7b55a": "delicate flavours, expressive aromas and sweet, smooth flavours. ",
  a3bc3d3a13066ba5: "Light and delicate, Fruity and aromatic, Sweet and smooth",
  a810705651818f45: "richness and sweet, smooth flavours. ",
  "1c972af19168c6f4": "Rich and full-bodied, Sweet and smooth",
  "48305cec8034a058": "freshness, richness and sweet, smooth flavours. ",
  "96c0ec345abdda32": "Fresh and crisp, Rich and full-bodied, Sweet and smooth",
  a0d445ee8388bb09: "delicate flavours, richness and sweet, smooth flavours. ",
  d94adfd9edc0dfdb: "Light and delicate, Rich and full-bodied, Sweet and smooth",
  e299dadbd118e5f3: "expressive aromas, richness and sweet, smooth flavours. ",
  d9f15f814ec17b2b: "Fruity and aromatic, Rich and full-bodied, Sweet and smooth",
  f9c5aa28a88cf72e: "savoury flavours and sweet, smooth flavours. ",
  "4112785a0ba0b86a": "Dry and savoury, Sweet and smooth",
  a36276cc9ae0eb34: "freshness, savoury flavours and sweet, smooth flavours. ",
  "3bfc187de79729e4": "Fresh and crisp, Dry and savoury, Sweet and smooth",
  "7952d4b238685537": "delicate flavours, savoury flavours and sweet, smooth flavours. ",
  e8ec08cab1845514: "Light and delicate, Dry and savoury, Sweet and smooth",
  c82db8de0d424921: "expressive aromas, savoury flavours and sweet, smooth flavours. ",
  "2e4d321ea7c13a45": "Fruity and aromatic, Dry and savoury, Sweet and smooth",
  "3f4907582555362c": "richness, savoury flavours and sweet, smooth flavours. ",
  b34b9958f9d76fcf: "Rich and full-bodied, Dry and savoury, Sweet and smooth",
  b8cc8232055812c5: "Your choices around a lighter body and ",
  "23836e6df4c06af7": "Light-bodied",
  "80082c8c69491cc1": "This full-bodied expression also offers a contrast to your light-bodied preference. ",
  "57ad67c465bd1e78": "Your choices around a medium body and ",
  "6ac4a5201a596eec": "Medium-bodied",
  "3365003ba0666d00": "Find three words of your own",
  "1e7f649b58de51d3": "If you choose to taste, focus on one small sample. ",
  "2eb41dcb038fa0f6": "Smell it before tasting, then note one aroma, one texture and one impression of freshness. ",
  "3f0b2ebda1d495a8": "Everyday words are enough. ",
  "8c42e3eb1bb6280b": "Compare your notes with the label afterwards, rather than searching for a correct answer. ",
  "9419fa63e83fd0da": "This full-bodied expression also offers a contrast to your medium-bodied preference. ",
  a1336a650bff1acc: "This light-bodied expression also offers a contrast to your medium-bodied preference. ",
  "49a321c62bafc44b": "Your choices around different body styles and ",
  f0e3de9ace9763cf: "I enjoy different styles",
  "9dce61286eb10473": "Your choices around exploring wine body and ",
  "9fdc1d357f42b25e": "I'm not sure",
  "4711dc901ae5b0d3": "a little sweetness help shape the suggestions below, rather than fixing you into a single wine personality. ",
  "8f90d0264a285cd2": "Slightly sweet / off-dry",
  e24bd7f3d2cb2d12: "Its dry finish offers a contrast to the sweetness you selected. ",
  fa1c3a3571a72423: "a sweet finish help shape the suggestions below, rather than fixing you into a single wine personality. ",
  "01e7c30f7fec479d": "Sweet",
  "6dedbf6d86a36e71": "A labelled sweet red blend",
  c74c7a8775e15d78: "Ripe berry flavours alongside actual residual sweetness.",
  ac71d2c890a49b41: "Look for a sweet example to match your sweetness preference. ",
  "33bc20d66d2770a8": "varying sweetness help shape the suggestions below, rather than fixing you into a single wine personality. ",
  a492244b25114f10: "It depends on the wine",
  f4fdbd0fe8a50cb6: "exploring sweetness help shape the suggestions below, rather than fixing you into a single wine personality. ",
  "06eb27e0029a9198": "You can explore these ideas through aromas, food and reading, without drinking or purchasing wine. ",
  c93d17f11f1c2774: "Build an aroma vocabulary, without a glass",
  "3a6c3029fdc88468": "Place a piece of citrus peel, a few berries and a small cup of black tea on the table. ",
  "46f4b1546772c9f0": "Smell each separately and write down one word for each aroma. ",
  "5b9543d2d0cea2cd": "Compare your words with the suggested styles. ",
  "46dfa727ab776916": "No alcohol or wine purchase is needed. ",
  bcec8cbadb6cd424: "Wine styles to learn about",
  "69a1c22014669fc8": "Your preferred occasions can guide which styles feel useful to explore at your own pace. ",
  b864d45753cbed3b: "Compare notes with a friend; different impressions are welcome. ",
  "5406b3937c590927": "Save the comparison for a celebration you already have planned. ",
  "0d7f0adbc5f7040f": "Use your notes to explain a style when choosing a gift. ",
  "1fdb067b6c1a0f1a": "For your interest in cellaring, remember that ageing potential depends on the individual bottle and storage. ",
  "2356c969c5296155": "Date your notes so you can compare them with a future tasting. ",
  c0fdef90b31b5db1: "Keep a short note for your next discovery. ",
  "9cd595279295f648": "Bold, Savoury & Familiar",
  "993692707e748590": "Familiar styles can be a comfortable starting point, with small comparisons helping you notice differences. ",
  "069c8410a899eada": "I usually stick with familiar favourites",
  "5d8d49febfe240a1": "Bold, Savoury & Curious",
  "6d2a3fad66fef96e": "An occasional change of style can offer a gentle way to broaden your own reference points. ",
  f339abf04f59a449: "I occasionally try something different",
  f18d1514d66ffbda: "Bold, Savoury & Explorative",
  "669078348e49e5f5": "There is no need to have settled preferences; noticing what interests you is a useful beginning. ",
  "4aeb22b5f66e32cb": "I'm still learning what I enjoy",
  "8ac54133952ad97d": "One grape, more than one expression",
  eb393ce1393cf293: "A suggested journal topic: how Chardonnay became both still and sparkling wine in one vintage.",
  "12fe45deb0ab04c8": "From grape to glass, one small batch at a time",
  "31e2ccbde2cfdf25": "A suggested journal topic: fermentation choices and the lessons of the 2025 sparkling Chardonnay.",
  d5403d028efc16a8: "Why texture matters at the table",
  "42c59f3b1b0825e0": "A suggested journal topic: using the dry 2025 ros\xE9 as a starting point for thinking about food and texture.",
  "55c15b1af1ee8e39": "Finding words for what you notice",
  "9c6d380d0fca52a6": "A suggested journal topic: comparing the described textures of the 2025 ros\xE9 and Chardonnay.",
  "360bafe75d04be6b": "A vintage begins with a place",
  "021b57a45875c7fa": "A suggested journal topic: following the Mudgee and Riverland fruit recorded in the vintage archive.",
  e103fbf3ff33d5e1: "It offers a starting point for your interest in freshness. ",
  "387d382466dcfccf": "Dry Riesling",
  "63592c68c0cf3483": "Lime-like freshness and a mouth-watering finish.",
  bbf9ec682ef35d91: "Light, dry Pinot Grigio",
  "052017b3393f93ea": "Pear-like aromas in a light, fresh frame.",
  "14f4c9725c60f002": "Dry Sauvignon Blanc",
  "936f09c76d9c5e25": "Citrus-like acidity and herbaceous aromas.",
  "1c181d02fb8c05f9": "Sweet pink Moscato",
  "652ff493e93e518e": "Rose-petal aromas and sweet red-fruit flavours.",
  "7f59056a741e1834": "It offers a starting point for your interest in sweet, smooth flavours. ",
  "4a406fcaa692918f": "Elegant & Familiar",
  "321de29e08a2a69e": "Elegant & Curious",
  d415ec4c5087db87: "Elegant & Adventurous",
  c07dea482b53b176: "Elegant & Explorative",
  dfb907abb28908d5: "Exploring & Familiar",
  d5fa1039cb907985: "Exploring & Curious",
  "9386e28751dfab3d": "Exploring & Adventurous",
  beddbb3c488fed1f: "Exploring & Explorative",
  "2dc3ffbd5cd226c2": "Bold & Familiar",
  "46d7c286be8d5798": "Bold & Curious",
  "3d0ff8e55878236e": "Bold & Explorative",
  "4c0b8a34ee183802": "Discovering Your Wine Preferences",
  be1705d5abef0fad: "Fresh & Familiar",
  "3ec03cde0a22893b": "Fresh & Curious",
  "4a75d9eab0c7dc9f": "Fresh & Adventurous",
  "43aa8c273586b4e8": "Fresh & Explorative",
  "1de7b83b95bc5e8c": "Bold, Fresh & Familiar",
  "1a4c9a7c33cab72a": "Bold, Fresh & Curious",
  "75812ed2593f74ad": "Bold, Fresh & Explorative",
  "9ff3e1465e920e6b": "This medium-bodied expression also offers a contrast to your light-bodied preference. ",
  "4bbb1f2974619d03": "Elegant, Aromatic & Familiar",
  "5543e7b18d87f097": "Elegant, Aromatic & Curious",
  "3984005904363b44": "Elegant, Aromatic & Adventurous",
  a25eabd0cbbb47f8: "Elegant, Aromatic & Explorative",
  "26fc1fdf05211266": "Aromatic & Familiar",
  c53aa009ed0efa75: "Aromatic & Curious",
  "73e03675860ed373": "Aromatic & Adventurous",
  a1eff99a002a5d7e: "Aromatic & Explorative",
  "2c6ae6d186688215": "Bold, Aromatic & Familiar",
  "5cd7cf1ddc0218ce": "Bold, Aromatic & Curious",
  "4d64ea432dadfb1c": "Bold, Aromatic & Explorative",
  "02533681500e73e1": "Fresh, Aromatic & Familiar",
  fe1742582513c167: "Fresh, Aromatic & Curious",
  "65465c0abd30454e": "Fresh, Aromatic & Adventurous",
  c2e73521bd70fc59: "Fresh, Aromatic & Explorative",
  a67d7b90d4a8de55: "Elegant, Savoury & Familiar",
  "9fcc812e4783cab0": "Elegant, Savoury & Curious",
  d892a4a5d42a741d: "Elegant, Savoury & Adventurous",
  "8dd5a52f14d48f7d": "Elegant, Savoury & Explorative",
  "62bf62a90f90b999": "Exploring, Savoury & Familiar",
  "8a2516fc6c92cbd6": "Exploring, Savoury & Curious",
  e6be3a6785b976bc: "Exploring, Savoury & Adventurous",
  "7e5382f85eb76fc1": "Exploring, Savoury & Explorative",
  d0da9d4f2372adda: "Fresh, Savoury & Familiar",
  "5c9d60a8184af19b": "Fresh, Savoury & Curious",
  "7664f4e684ccaf34": "Fresh, Savoury & Adventurous",
  "14cf9059181e207d": "Fresh, Savoury & Explorative",
  cc76c46d601aee95: "Aromatic, Savoury & Familiar",
  "7f4f8e158ef0e56f": "Aromatic, Savoury & Curious",
  "20d7a9240e858b5b": "Aromatic, Savoury & Adventurous",
  befa39479811b9f4: "Aromatic, Savoury & Explorative",
  "3d0d6b738f59e97c": "Soft & Familiar",
  "302c5c471d654fac": "Soft & Curious",
  f624d2f819582351: "Soft & Adventurous",
  "5eb71ddba4ac2d2d": "Soft & Explorative",
  "068993c96249abd4": "Soft, Savoury & Familiar",
  "059146ea816fb1bf": "Soft, Savoury & Curious",
  c8b8249d3b58cfe1: "Soft, Savoury & Adventurous",
  "7ae024c244e90d56": "Soft, Savoury & Explorative",
  "000f956ddcb77e3d": "Off-dry Riesling",
  d5193c8b7b6fac88: "A little sweetness balanced by citrus-like acidity.",
  aadd4cf84686bea4: "Look for a off-dry example to match your sweetness preference. ",
  b726c5420412fa26: "Sweet Moscato",
  a9623c4fa2f12882: "Floral and grape-like aromas with a sweet finish.",
  "3a7c94a006a92534": "Demi-sec sparkling wine",
  c7bc141539c933fb: "Noticeable sweetness lifted by bubbles and acidity."
};

// shopify/wine-profile/integration/security.mjs
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
var RequestError = class extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
};
var hmac = (text, secret) => createHmac("sha256", secret).update(text).digest("hex");
var equalHex = (left, right) => /^[a-f0-9]{64}$/.test(left ?? "") && timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
function proxyMessage(params) {
  const keys = [...new Set(params.keys())].filter((key) => key !== "signature");
  return keys.map((key) => `${key}=${params.getAll(key).join(",")}`).sort().join("");
}
function authenticateProxy(url, { secret, shop, now = Date.now(), maxAgeSeconds = 300 }) {
  if (!secret || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? "")) throw new RequestError("configuration_missing", 503);
  const params = new URL(url).searchParams;
  for (const key of ["signature", "shop", "timestamp", "logged_in_customer_id"]) {
    if (params.getAll(key).length !== 1) throw new RequestError("invalid_proxy", 401);
  }
  if (!equalHex(params.get("signature"), hmac(proxyMessage(params), secret))) throw new RequestError("invalid_proxy", 401);
  if (params.get("shop") !== shop) throw new RequestError("wrong_shop", 403);
  const timestamp = params.get("timestamp");
  if (!/^\d{10}$/.test(timestamp) || Math.abs(Math.floor(now / 1e3) - Number(timestamp)) > maxAgeSeconds) throw new RequestError("expired_proxy", 401);
  const customerId = params.get("logged_in_customer_id");
  if (customerId && !/^[1-9]\d{0,19}$/.test(customerId)) throw new RequestError("invalid_customer", 401);
  return { shop, customerId: customerId || null };
}
function issueCsrf(identity, secret, now = Date.now()) {
  if (!identity.customerId) throw new RequestError("sign_in_required", 401);
  const nonce = `${Math.floor(now / 1e3)}.${randomBytes(16).toString("hex")}`;
  return `${nonce}.${hmac(`wine-profile-csrf:${identity.shop}:${identity.customerId}:${nonce}`, secret)}`;
}
function verifyCsrf(token, identity, secret, now = Date.now()) {
  if (typeof token !== "string" || !/^\d{10}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) throw new RequestError("invalid_csrf", 403);
  if (!identity.customerId || !secret) throw new RequestError("invalid_csrf", 403);
  const [timestamp, random, signature] = token.split(".");
  if (Number(timestamp) > Math.floor(now / 1e3) + 30 || now / 1e3 - Number(timestamp) > 600 || !equalHex(signature, hmac(`wine-profile-csrf:${identity.shop}:${identity.customerId}:${timestamp}.${random}`, secret))) throw new RequestError("invalid_csrf", 403);
}
async function readJson(request, maxBytes = 8192) {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) throw new RequestError("json_required", 415);
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RequestError("request_too_large", 413);
  if (!request.body) throw new RequestError("invalid_json");
  const reader = request.body.getReader();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RequestError("request_too_large", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new RequestError("invalid_json");
  }
}

// shopify/wine-profile/integration/operator-auth.mjs
import { createHmac as createHmac2, timingSafeEqual as timingSafeEqual2 } from "node:crypto";
var shopPattern = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
var userPattern = /^[1-9]\d{0,19}$/;
var decode = (segment) => {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error("Invalid encoding");
  const bytes = Buffer.from(segment, "base64url");
  if (bytes.toString("base64url") !== segment) throw new Error("Invalid encoding");
  return bytes;
};
function authenticateAdminIdentity(authorization, { shop, clientId, secret, now = Date.now() }) {
  if (!shopPattern.test(shop ?? "") || typeof clientId !== "string" || !clientId || typeof secret !== "string" || !secret) throw new RequestError("review_not_configured", 503);
  try {
    if (typeof authorization !== "string" || authorization.length > 4096 || !/^Bearer [A-Za-z0-9_.-]+$/i.test(authorization)) throw new Error("Missing token");
    const parts = authorization.slice(7).split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const header = JSON.parse(decode(parts[0]).toString("utf8"));
    if (header.alg !== "HS256" || header.typ !== void 0 && header.typ !== "JWT" || header.crit !== void 0 || header.b64 !== void 0) throw new Error("Unsupported token");
    const signature = decode(parts[2]);
    const expected = createHmac2("sha256", secret).update(parts[0] + "." + parts[1]).digest();
    if (signature.byteLength !== expected.byteLength || !timingSafeEqual2(signature, expected)) throw new Error("Invalid signature");
    const claims = JSON.parse(decode(parts[1]).toString("utf8"));
    const seconds = Math.floor(now / 1e3);
    if (claims.aud !== clientId || claims.dest !== `https://${shop}` || claims.iss !== `https://${shop}/admin` || !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.nbf) || claims.exp <= seconds || claims.nbf > seconds || claims.exp <= claims.nbf || claims.exp - claims.nbf > 90 || !userPattern.test(claims.sub ?? "")) throw new Error("Invalid claims");
    return { shop, userId: claims.sub };
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("invalid_admin_token", 401);
  }
}
function authenticateOperator(authorization, policy) {
  const reviewers = typeof policy.reviewerIds === "string" && policy.reviewerIds.length <= 512 ? policy.reviewerIds.split(",").map((id) => id.trim()) : [];
  if (!reviewers.length || reviewers.length > 20 || !reviewers.every((id) => userPattern.test(id))) throw new RequestError("review_not_configured", 503);
  const identity = authenticateAdminIdentity(authorization, policy);
  if (!reviewers.includes(identity.userId)) throw new RequestError("review_access_denied", 403);
  return identity;
}

// shopify/wine-profile/integration/request-review.mjs
var submissionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
var statuses = /* @__PURE__ */ new Set(["needs_subscription", "preparing", "dispatching", "accepted", "processed", "skipped", "failed", "review"]);
var codes = /* @__PURE__ */ new Set([
  "configuration_missing",
  "customer_not_found",
  "customer_tag_capacity",
  "invalid_tags",
  "invalid_customer",
  "shopify_rate_limited",
  "shopify_unavailable",
  "shopify_authorization_failed",
  "invalid_shopify_token_response",
  "shopify_api_error",
  "customer_tags_failed",
  "profile_update_conflict",
  "profile_verification_failed",
  "profile_preparation_failed",
  "dispatch_outcome_unknown",
  "interrupted_request"
]);
function validateReviewInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 1 || typeof input.customerId !== "string" || !/^[1-9]\d{0,19}$/.test(input.customerId)) throw new RequestError("invalid_customer");
  return input.customerId;
}
function reviewRequestState(state) {
  const records = (Array.isArray(state?.records) ? state.records : []).slice(0, 50).map((record) => ({
    submissionId: submissionPattern.test(record?.submissionId ?? "") ? record.submissionId : null,
    status: statuses.has(record?.status) ? record.status : "unknown",
    code: record?.code ? codes.has(record.code) ? record.code : "unrecognised_error" : null,
    updatedAt: typeof record?.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.updatedAt) && Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : null
  }));
  const activeSubmissionId = records.some((record) => record.submissionId && record.submissionId === state?.active) ? state.active : null;
  return { activeSubmissionId, records };
}

// shopify/wine-profile/integration/profile-input.mjs
import { createHash as createHash2 } from "node:crypto";

// assets/wine-profile/data.mjs
var QUIZ_VERSION = "1.0.0";
var options = (items) => items.map(([id, label]) => ({ id, label }));
var QUESTIONS = [
  { id: "wine_interests", title: "Which types of wine do you enjoy or want to explore?", kind: "multi", exclusive: "exploring", options: options([
    ["red", "Red wine"],
    ["white", "White wine"],
    ["rose", "Ros\xE9"],
    ["sparkling", "Sparkling wine"],
    ["mead", "Mead or honey-based wine"],
    ["experimental", "Experimental or small-batch wines"],
    ["exploring", "I'm still exploring"]
  ]) },
  { id: "flavour_preferences", title: "Which flavour descriptions appeal to you?", kind: "multi", max: 3, exclusive: "unsure", options: options([
    ["crisp", "Fresh and crisp"],
    ["delicate", "Light and delicate"],
    ["aromatic", "Fruity and aromatic"],
    ["rich", "Rich and full-bodied"],
    ["savoury", "Dry and savoury"],
    ["smooth", "Sweet and smooth"],
    ["unsure", "I'm not sure yet"]
  ]) },
  { id: "body_preference", title: "What style of wine do you generally prefer?", kind: "single", options: options([
    ["light", "Light-bodied"],
    ["medium", "Medium-bodied"],
    ["full", "Full-bodied"],
    ["varied", "I enjoy different styles"],
    ["unsure", "I'm not sure"]
  ]) },
  { id: "sweetness_preference", title: "How sweet do you usually prefer your wine?", kind: "single", options: options([
    ["dry", "Dry"],
    ["off_dry", "Slightly sweet / off-dry"],
    ["sweet", "Sweet"],
    ["varied", "It depends on the wine"],
    ["unsure", "I'm not sure"]
  ]) },
  { id: "wine_occasions", title: "When do you typically enjoy or purchase wine?", kind: "multi", exclusive: "non_drinker", options: options([
    ["meals", "With meals"],
    ["sharing", "Sharing with friends or family"],
    ["celebrations", "Special celebrations"],
    ["gifts", "Giving as gifts"],
    ["cellaring", "Collecting or cellaring"],
    ["tasting", "Wine tasting and discovery"],
    ["non_drinker", "I don't currently drink or purchase wine"]
  ]) },
  { id: "discovery_interest", title: "How interested are you in exploring unfamiliar wines?", kind: "single", options: options([
    ["familiar", "I usually stick with familiar favourites"],
    ["occasional", "I occasionally try something different"],
    ["adventurous", "I enjoy discovering new varieties and styles"],
    ["learning", "I'm still learning what I enjoy"]
  ]) },
  { id: "education_interest", title: "What would you most like to learn about wine?", kind: "single", options: options([
    ["grapes", "Understanding grape varieties"],
    ["winemaking", "How wine is made"],
    ["pairing", "Food and wine pairing"],
    ["tasting", "How to taste and describe wine"],
    ["regions", "Wine regions and growing conditions"],
    ["journey", "Following the journey of a small winery"]
  ]) }
];
var DISCOVERY_SOURCES = options([
  ["instagram_james", "Instagram \u2014 James Follent"],
  ["instagram_chateau", "Instagram \u2014 Chateau Follent"],
  ["youtube", "YouTube"],
  ["facebook", "Facebook"],
  ["search", "Google or another search engine"],
  ["friends_family", "Friends or family"],
  ["wine_event", "Wine club or wine event"],
  ["website", "Another website"],
  ["other", "Other"],
  ["unknown", "I can't remember"]
]);
var style = (id, name, categories, flavours, body, sweetness, sensory, unfamiliar = false) => ({ id, name, categories, flavours, body, sweetness, sensory, unfamiliar });
var STYLES = [
  style("pinot_noir", "Light-bodied Pinot Noir", ["red"], ["delicate", "aromatic", "savoury"], "light", "dry", "A red-cherry aroma and a gentle, drying finish."),
  style("shiraz", "Full-bodied Shiraz", ["red"], ["rich", "savoury", "aromatic"], "full", "dry", "Dark plum fruit with a hint of black pepper."),
  style("cabernet", "Cabernet Sauvignon", ["red"], ["rich", "savoury"], "full", "dry", "Blackcurrant aromas and a firm, drying texture."),
  style("malbec", "Full-bodied Malbec", ["red"], ["rich", "aromatic"], "full", "dry", "Dark-berry aromas with a generous, rounded texture."),
  style("grenache", "Medium-bodied Grenache", ["red"], ["aromatic", "delicate"], "medium", "dry", "Red-berry aromas with a rounded texture."),
  style("sweet_red", "A labelled sweet red blend", ["red"], ["smooth", "aromatic"], "medium", "sweet", "Ripe berry flavours alongside actual residual sweetness."),
  style("riesling", "Dry Riesling", ["white"], ["crisp", "delicate", "aromatic"], "light", "dry", "Lime-like freshness and a mouth-watering finish."),
  style("sauvignon_blanc", "Dry Sauvignon Blanc", ["white"], ["crisp", "aromatic"], "light", "dry", "Citrus-like acidity and herbaceous aromas."),
  style("pinot_grigio", "Light, dry Pinot Grigio", ["white"], ["crisp", "delicate"], "light", "dry", "Pear-like aromas in a light, fresh frame."),
  style("vermentino", "Vermentino", ["white", "experimental"], ["crisp", "savoury"], "light", "dry", "Citrus peel and a lightly savoury finish.", true),
  style("chardonnay", "Full-bodied, oak-influenced Chardonnay", ["white"], ["rich", "savoury"], "full", "dry", "A rounded texture with a suggestion of toast."),
  style("off_dry_riesling", "Off-dry Riesling", ["white"], ["crisp", "aromatic", "smooth"], "light", "off_dry", "A little sweetness balanced by citrus-like acidity."),
  style("moscato", "Sweet Moscato", ["white"], ["aromatic", "delicate", "smooth"], "light", "sweet", "Floral and grape-like aromas with a sweet finish."),
  style("dry_rose", "Dry, pale ros\xE9", ["rose"], ["crisp", "delicate"], "light", "dry", "Delicate red-berry aromas with a fresh finish."),
  style("textured_rose", "Textured, dry Sangiovese ros\xE9", ["rose", "experimental"], ["savoury", "rich"], "medium", "dry", "Cherry-like fruit and a little grip on the finish.", true),
  style("off_dry_rose", "Off-dry ros\xE9", ["rose"], ["aromatic", "smooth"], "light", "off_dry", "Strawberry-like fruit with a small cushion of sweetness."),
  style("sweet_rose", "Sweet pink Moscato", ["rose"], ["aromatic", "smooth", "delicate"], "light", "sweet", "Rose-petal aromas and sweet red-fruit flavours."),
  style("brut", "Brut sparkling Chardonnay", ["sparkling"], ["crisp", "delicate"], "light", "dry", "Fine bubbles and green-apple freshness."),
  style("traditional_sparkling", "Traditional-method sparkling wine", ["sparkling"], ["rich", "savoury"], "medium", "dry", "Bready aromas alongside the texture of bubbles."),
  style("demi_sec", "Demi-sec sparkling wine", ["sparkling"], ["aromatic", "smooth"], "medium", "sweet", "Noticeable sweetness lifted by bubbles and acidity."),
  style("dry_mead", "Dry traditional mead", ["mead"], ["delicate", "savoury"], "light", "dry", "A floral honey aroma without assuming a sweet finish.", true),
  style("off_dry_mead", "Off-dry traditional mead", ["mead"], ["aromatic", "smooth"], "medium", "off_dry", "Floral aromas and a gentle amount of residual sweetness.", true),
  style("sweet_mead", "Sweet traditional mead", ["mead"], ["smooth", "rich"], "full", "sweet", "Honeyed aromas with a fuller, sweet texture.", true),
  style("skin_contact", "Dry, skin-contact white wine", ["white", "experimental"], ["savoury", "rich"], "medium", "dry", "Tea-like grip from time spent on grape skins.", true),
  style("pet_nat", "Dry p\xE9tillant naturel", ["sparkling", "experimental"], ["crisp", "aromatic"], "light", "dry", "Lively bubbles; texture varies with the producer.", true)
];
var JOURNAL_TOPICS = {
  grapes: { title: "One grape, more than one expression", detail: "A suggested journal topic: how Chardonnay became both still and sparkling wine in one vintage.", href: "vintages.html#vintage-2025-heading" },
  winemaking: { title: "From grape to glass, one small batch at a time", detail: "A suggested journal topic: fermentation choices and the lessons of the 2025 sparkling Chardonnay.", href: "vintages.html#vintage-2025-heading" },
  pairing: { title: "Why texture matters at the table", detail: "A suggested journal topic: using the dry 2025 ros\xE9 as a starting point for thinking about food and texture.", href: "vintages.html#vintage-2025-heading" },
  tasting: { title: "Finding words for what you notice", detail: "A suggested journal topic: comparing the described textures of the 2025 ros\xE9 and Chardonnay.", href: "vintages.html#vintage-2025-heading" },
  regions: { title: "A vintage begins with a place", detail: "A suggested journal topic: following the Mudgee and Riverland fruit recorded in the vintage archive.", href: "vintages.html#vintage-2025-heading" },
  journey: { title: "The first vintage, and the lessons that followed", detail: "A suggested journal topic: the small experiments that shape a growing winery, beginning with the 2024 vintage.", href: "vintages.html" }
};

// assets/wine-profile/messaging-tags.mjs
import { createHash } from "node:crypto";

// assets/wine-profile/core.mjs
function labelFor(questionId, value) {
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.id === value)?.label ?? "";
}
function validateAnswer(question, value) {
  if (question.kind === "single") return question.options.some((o) => o.id === value) ? "" : "Choose an answer to continue.";
  if (!Array.isArray(value) || !value.length) return "Choose at least one answer to continue.";
  if (new Set(value).size !== value.length || value.some((v) => !question.options.some((o) => o.id === v))) return "Choose from the available answers.";
  if (question.max && value.length > question.max) return `Choose up to ${question.max} descriptions.`;
  if (value.includes(question.exclusive) && value.length !== 1) return "Choose this answer on its own.";
  return "";
}
function validateAnswers(answers) {
  for (const question of QUESTIONS) {
    const error = validateAnswer(question, answers[question.id]);
    if (error) throw new Error(`${question.id}: ${error}`);
  }
}
var flavourWords = { crisp: "freshness", delicate: "delicate flavours", aromatic: "expressive aromas", rich: "richness", savoury: "savoury flavours", smooth: "sweet, smooth flavours" };
var join = (items) => items.length < 2 ? items[0] : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
var categoryWords = { red: "red wine", white: "white wine", rose: "ros\xE9", sparkling: "sparkling wine", mead: "mead", experimental: "small-batch experiments" };
function recommend(answers) {
  const categories = answers.wine_interests.filter((v) => v !== "exploring");
  const flavours = answers.flavour_preferences.filter((v) => v !== "unsure");
  const introductory = !categories.length && !flavours.length && ["unsure", "varied"].includes(answers.body_preference) && ["unsure", "varied"].includes(answers.sweetness_preference);
  const candidates = STYLES.filter((s) => !categories.length || s.categories.some((c) => categories.includes(c)));
  const ranked = candidates.map((s, index) => ({
    style: s,
    index,
    score: (s.categories.some((c) => categories.includes(c)) ? 6 : 0) + s.flavours.filter((f) => flavours.includes(f)).length * 3 + (s.body === answers.body_preference ? 2 : 0) + (s.sweetness === answers.sweetness_preference ? 3 : ["dry", "off_dry", "sweet"].includes(answers.sweetness_preference) ? -3 : 0) + (introductory && ["pinot_noir", "riesling", "brut"].includes(s.id) ? 2 : 0) + (s.unfamiliar ? answers.discovery_interest === "adventurous" ? 1 : answers.discovery_interest === "familiar" ? -2 : 0 : 0)
  }));
  const chosen = [];
  const covered = /* @__PURE__ */ new Set();
  while (chosen.length < 3) {
    const score = (candidate) => candidate.score + (candidate.style.categories.some((c) => categories.includes(c) && !covered.has(c)) ? 4 : 0);
    ranked.sort((a, b) => score(b) - score(a) || a.index - b.index);
    const next = ranked.shift();
    if (!next) throw new Error("The style catalogue needs at least three matching styles.");
    next.style.categories.forEach((c) => covered.add(c));
    chosen.push(next.style);
  }
  return chosen.map((s) => describeStyle(s, answers));
}
function describeStyle(s, answers) {
  const categories = answers.wine_interests.filter((v) => v !== "exploring");
  const flavours = answers.flavour_preferences.filter((v) => v !== "unsure");
  const category = s.categories.find((c) => categories.includes(c));
  const matches = s.flavours.filter((f) => flavours.includes(f));
  let reason = category ? `You included ${categoryWords[category]}; this is one expression to learn about.` : "An introductory style to help you compare and discover what interests you.";
  if (matches.length) reason += ` It offers a starting point for your interest in ${flavourWords[matches[0]]}.`;
  if (s.sweetness === answers.sweetness_preference) reason += ` Look for a ${s.sweetness.replace("_", "-")} example to match your sweetness preference.`;
  else if (["dry", "off_dry", "sweet"].includes(answers.sweetness_preference)) reason += ` Its ${s.sweetness.replace("_", "-")} finish offers a contrast to the sweetness you selected.`;
  if (["light", "medium", "full"].includes(answers.body_preference) && s.body !== answers.body_preference) reason += ` This ${s.body}-bodied expression also offers a contrast to your ${answers.body_preference}-bodied preference.`;
  return { id: s.id, name: s.name, reason, sensory: s.sensory };
}
function titleFor(answers) {
  const flavours = answers.flavour_preferences;
  if (flavours.includes("unsure") && ["unsure", "varied"].includes(answers.body_preference)) return "Discovering Your Wine Preferences";
  const first = flavours.includes("rich") || answers.body_preference === "full" ? "Bold" : flavours.includes("crisp") ? "Fresh" : flavours.includes("delicate") || answers.body_preference === "light" ? "Elegant" : flavours.includes("aromatic") ? "Aromatic" : flavours.includes("smooth") ? "Soft" : "Exploring";
  const second = flavours.includes("savoury") ? "Savoury" : flavours.includes("aromatic") && first !== "Aromatic" ? "Aromatic" : flavours.includes("crisp") && first !== "Fresh" ? "Fresh" : null;
  const curiosity = { familiar: "Familiar", occasional: "Curious", adventurous: "Adventurous", learning: "Explorative" }[answers.discovery_interest];
  return `${first}${second ? `, ${second}` : ""} & ${curiosity}`;
}
function summaryFor(answers) {
  const categories = answers.wine_interests.filter((v) => v !== "exploring");
  const category = categories.length > 2 ? "a broad range of wine styles" : categories.length ? join(categories.map((c) => categoryWords[c])) : "the possibility of finding new favourites";
  const flavours = answers.flavour_preferences.filter((v) => v !== "unsure");
  const flavour = flavours.length ? join(flavours.map((f) => flavourWords[f])) : "room to discover the flavours you enjoy";
  const body = { light: "a lighter body", medium: "a medium body", full: "a fuller body", varied: "different body styles", unsure: "exploring wine body" }[answers.body_preference];
  const sweetness = { dry: "a dry finish", off_dry: "a little sweetness", sweet: "a sweet finish", varied: "varying sweetness", unsure: "exploring sweetness" }[answers.sweetness_preference];
  const curiosity = {
    familiar: "Familiar styles can be a comfortable starting point, with small comparisons helping you notice differences.",
    occasional: "An occasional change of style can offer a gentle way to broaden your own reference points.",
    adventurous: "Your curiosity about unfamiliar styles leaves space to explore different grapes and ways of making wine.",
    learning: "There is no need to have settled preferences; noticing what interests you is a useful beginning."
  }[answers.discovery_interest];
  const occasion = answers.wine_occasions.includes("non_drinker") ? "You can explore these ideas through aromas, food and reading, without drinking or purchasing wine." : answers.wine_occasions.includes("meals") ? "At the table, familiar foods can give you a simple way to notice texture and freshness." : answers.wine_occasions.includes("cellaring") ? "For your interest in cellaring, remember that ageing potential depends on the individual bottle and storage." : "Your preferred occasions can guide which styles feel useful to explore at your own pace.";
  return `Your answers point towards ${category}, with an interest in ${flavour}. Your choices around ${body} and ${sweetness} help shape the suggestions below, rather than fixing you into a single wine personality. ${curiosity} ${occasion} This is a starting point based on what you shared, not a measurement of tasting ability. Your preferences can change as you learn.`;
}
function exerciseFor(answers) {
  if (answers.wine_occasions.includes("non_drinker")) return { title: "Build an aroma vocabulary, without a glass", text: "Place a piece of citrus peel, a few berries and a small cup of black tea on the table. Smell each separately and write down one word for each aroma. Compare your words with the suggested styles. No alcohol or wine purchase is needed." };
  let text;
  let title;
  if (["sweet", "off_dry"].includes(answers.sweetness_preference) || answers.flavour_preferences.includes("smooth")) {
    title = "Separate fruitiness from sweetness";
    text = "If you choose to taste, compare small samples of a clearly labelled dry and off-dry wine from the same grape. Smell first, then notice sweetness on the palate and mouth-watering acidity. A fruity aroma does not necessarily mean a wine is sweet.";
  } else if (["light", "full"].includes(answers.body_preference)) {
    title = "Notice the weight of a wine";
    text = "If you choose to taste, compare small samples of a lighter and fuller-bodied wine. Notice how each feels in your mouth, rather than how strong its aroma seems. Write one texture word for each; neither needs to be better.";
  } else {
    title = "Find three words of your own";
    text = "If you choose to taste, focus on one small sample. Smell it before tasting, then note one aroma, one texture and one impression of freshness. Everyday words are enough. Compare your notes with the label afterwards, rather than searching for a correct answer.";
  }
  const occasions = answers.wine_occasions;
  text += occasions.includes("meals") ? " Try a bite of your meal and notice whether the impression changes." : occasions.includes("sharing") ? " Compare notes with a friend; different impressions are welcome." : occasions.includes("celebrations") ? " Save the comparison for a celebration you already have planned." : occasions.includes("gifts") ? " Use your notes to explain a style when choosing a gift." : occasions.includes("cellaring") ? " Date your notes so you can compare them with a future tasting." : " Keep a short note for your next discovery.";
  return { title, text: `${text} Tasting is optional; you can smell, read or spit instead.` };
}
function generateProfile(answers) {
  validateAnswers(answers);
  return {
    title: titleFor(answers),
    summary: summaryFor(answers),
    preferences: ["wine_interests", "flavour_preferences", "body_preference", "sweetness_preference", "discovery_interest"].map((id) => ({
      label: { wine_interests: "Wine categories", flavour_preferences: "Flavour characteristics", body_preference: "Wine body", sweetness_preference: "Sweetness", discovery_interest: "New styles" }[id],
      value: Array.isArray(answers[id]) ? answers[id].map((v) => labelFor(id, v)).join(", ") : labelFor(id, answers[id])
    })),
    recommendations: recommend(answers),
    exercise: exerciseFor(answers),
    journal: { ...JOURNAL_TOPICS[answers.education_interest] },
    learningOnly: answers.wine_occasions.includes("non_drinker")
  };
}

// assets/wine-profile/messaging-tags.mjs
var TAG_PREFIX = "cfwp" + QUIZ_VERSION.replaceAll(".", "_");
var fragmentId = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
var sentences = (text) => text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((value) => value.trim() + " ") ?? [];
var numbered = (prefix, values, count) => Object.fromEntries(Array.from({ length: count }, (_, i) => [prefix + i, values[i] ?? ""]));
function canonicalAnswers(answers) {
  validateAnswers(answers);
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, q.kind === "multi" ? q.options.filter((option) => answers[q.id].includes(option.id)).map((option) => option.id) : answers[q.id]]));
}
function messagingParts(profile) {
  const summary = sentences(profile.summary);
  const first = summary[0].split(", with an interest in ");
  const second = summary[1].split(" and ");
  if (first.length !== 2 || second.length !== 2 || summary.length !== 6) throw new Error("The summary format changed; update the Messaging compiler.");
  const parts = {
    title: profile.title,
    ...numbered("summary", [first[0] + ", with an interest in ", first[1], second[0] + " and ", second[1], ...summary.slice(2)], 8),
    ...numbered("preference", profile.preferences.map((pref) => pref.value), 5),
    exerciseTitle: profile.exercise.title,
    ...numbered("exercise", sentences(profile.exercise.text), 8),
    journalTitle: profile.journal.title,
    journalDetail: profile.journal.detail,
    styleHeading: profile.learningOnly ? "Wine styles to learn about" : "Styles worth exploring"
  };
  profile.recommendations.forEach((style2, i) => Object.assign(parts, {
    ["style" + i]: style2.name,
    ["sensory" + i]: style2.sensory,
    ...numbered("reason" + i + "_", sentences(style2.reason), 5)
  }));
  return parts;
}
function buildMessagingTags(rawAnswers, registry) {
  const answers = canonicalAnswers(rawAnswers);
  const profile = generateProfile(answers);
  const parts = messagingParts(profile);
  const tags = Object.entries(parts).filter(([, text]) => text).map(([slot, text]) => {
    const id = fragmentId(text);
    if (registry && registry[id] !== text) throw new Error("Messaging content is not compiled for this result.");
    return `${TAG_PREFIX}:${slot}:${id}`;
  });
  for (const q of QUESTIONS) for (const value of Array.isArray(answers[q.id]) ? answers[q.id] : [answers[q.id]]) tags.push(`${TAG_PREFIX}:answer:${q.id}=${value}`);
  profile.recommendations.forEach((style2, i) => tags.push(`${TAG_PREFIX}:recommendation:${i + 1}=${style2.id}`));
  tags.push(`${TAG_PREFIX}:count:${Object.values(parts).filter(Boolean).length}`);
  tags.push(`${TAG_PREFIX}:version:${QUIZ_VERSION}`);
  return { profile, parts, tags };
}

// shopify/wine-profile/integration/profile-input.mjs
function validateProfileRequest(input, registry) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new RequestError("invalid_request");
  const fields = ["quizVersion", "submissionId", "answers", "adultConfirmed", "csrfToken"];
  if (Object.keys(input).some((key) => !fields.includes(key))) throw new RequestError("unexpected_field");
  if (input.quizVersion !== QUIZ_VERSION) throw new RequestError("quiz_version_changed", 409);
  if (input.adultConfirmed !== true) throw new RequestError("adult_screen_required", 403);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input.submissionId ?? "")) throw new RequestError("invalid_submission_id");
  if (!input.answers || typeof input.answers !== "object" || Array.isArray(input.answers) || Object.keys(input.answers).length !== QUESTIONS.length || Object.keys(input.answers).some((key) => !QUESTIONS.some((question) => question.id === key))) throw new RequestError("invalid_answers");
  let answers, result;
  try {
    answers = canonicalAnswers(input.answers);
    result = buildMessagingTags(answers, registry);
  } catch {
    throw new RequestError("invalid_answers");
  }
  const fingerprint = createHash2("sha256").update(JSON.stringify({ quizVersion: QUIZ_VERSION, answers })).digest("hex");
  return { quizVersion: QUIZ_VERSION, submissionId: input.submissionId, answers, fingerprint, profile: result.profile, tags: result.tags };
}
function planProfileTags(existingTags, nextTags, reservedSlots = 1) {
  if (!Array.isArray(existingTags) || !Array.isArray(nextTags)) throw new RequestError("invalid_tags");
  const isProfileTag = (tag) => /^cfwp\d+_\d+_\d+:/.test(tag);
  if (nextTags.some((tag) => typeof tag !== "string" || !isProfileTag(tag))) throw new RequestError("invalid_tags");
  const remove = existingTags.filter(isProfileTag);
  const unrelated = existingTags.filter((tag) => !isProfileTag(tag));
  if (unrelated.length + new Set(nextTags).size + reservedSlots > 250) throw new RequestError("customer_tag_capacity", 409);
  return { remove, add: [...new Set(nextTags)], unrelated };
}

// shopify/wine-profile/integration/http-handler.mjs
var json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" }
});
function createHandler({ shop, secret, registry, admin, coordinatorFor, enabled = false, clock = () => /* @__PURE__ */ new Date() }) {
  return async (request) => {
    try {
      const url = new URL(request.url);
      if (!["/proxy/context", "/proxy/request", "/proxy/status"].includes(url.pathname)) return json({ error: "not_found" }, 404);
      const now = clock().getTime();
      const identity = authenticateProxy(url, { secret, shop, now });
      if (url.pathname === "/proxy/context" && request.method === "GET") {
        if (!identity.customerId || !enabled) return json({ signedIn: Boolean(identity.customerId), emailRequestsAvailable: enabled });
        const customer = await admin.customer(identity.customerId);
        return json({ signedIn: true, emailRequestsAvailable: true, subscriptionState: customer.defaultEmailAddress?.marketingState ?? "NOT_SUBSCRIBED", csrfToken: issueCsrf(identity, secret, now) });
      }
      if (!identity.customerId) throw new RequestError("sign_in_required", 401);
      if (url.pathname === "/proxy/request" && request.method === "POST") {
        if (!enabled) throw new RequestError("email_requests_disabled", 503);
        const input = await readJson(request);
        verifyCsrf(input?.csrfToken, identity, secret, now);
        const validated = validateProfileRequest(input, registry);
        const coordinator = await coordinatorFor(identity);
        const result = await coordinator.request(validated);
        const status = { email_requested: 202, review: 409, failed: 502 }[result.status] ?? 200;
        return json(result, status);
      }
      if (url.pathname === "/proxy/status" && request.method === "GET") {
        const submissionId = url.searchParams.get("submission_id");
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(submissionId ?? "")) throw new RequestError("invalid_submission_id");
        const coordinator = await coordinatorFor(identity);
        return json(await coordinator.status(submissionId));
      }
      return json({ error: "method_not_allowed" }, 405);
    } catch (error) {
      return error instanceof RequestError ? json({ error: error.code }, error.status) : json({ error: "request_unavailable" }, 503);
    }
  };
}

// shopify/wine-profile/integration/request-coordinator.mjs
var busy = /* @__PURE__ */ new Set(["preparing", "dispatching", "accepted", "review"]);
var publicStatus = (record) => ({
  submissionId: record.submissionId,
  status: record.status === "accepted" || record.status === "processed" ? "email_requested" : record.status,
  ...record.code ? { code: record.code } : {}
});
var ProfileRequestCoordinator = class {
  constructor({ storage, admin, customerId, dispatch, enabled = false, clock = () => /* @__PURE__ */ new Date() }) {
    Object.assign(this, { storage, admin, customerId, dispatch, enabled, clock });
    this.queue = Promise.resolve();
  }
  serial(operation) {
    const next = this.queue.then(operation);
    this.queue = next.catch(() => {
    });
    return next;
  }
  async state() {
    return await this.storage.get("requests") ?? { active: null, records: [] };
  }
  async save(state, record) {
    state.records = [record, ...state.records.filter((item) => item.submissionId !== record.submissionId)].slice(0, 50);
    await this.storage.put("requests", state);
  }
  async recover(state) {
    const active = state.records.find((record) => record.submissionId === state.active);
    if (active && ["preparing", "dispatching"].includes(active.status)) {
      active.status = "review";
      active.code = "interrupted_request";
      active.updatedAt = this.clock().toISOString();
      await this.save(state, active);
    }
  }
  async reconcile(state, customer) {
    if (!state.active) return;
    let outcome;
    try {
      outcome = JSON.parse(customer.request?.value);
    } catch {
      return;
    }
    const active = state.records.find((record) => record.submissionId === state.active);
    if (active && outcome.submission_id === active.submissionId && ["processed", "skipped"].includes(outcome.status)) {
      active.status = outcome.status;
      active.updatedAt = this.clock().toISOString();
      state.active = null;
      await this.save(state, active);
    }
  }
  request(validated) {
    return this.serial(async () => {
      if (!this.enabled) throw new RequestError("email_requests_disabled", 503);
      const state = await this.state();
      await this.recover(state);
      const previous = state.records.find((record2) => record2.submissionId === validated.submissionId);
      if (previous && previous.fingerprint !== validated.fingerprint) throw new RequestError("submission_id_reused", 409);
      if (previous && ["accepted", "processed", "review", "skipped"].includes(previous.status)) return publicStatus(previous);
      if (previous && ["preparing", "dispatching"].includes(previous.status)) {
        previous.status = "review";
        previous.code = "interrupted_request";
        await this.save(state, previous);
        return publicStatus(previous);
      }
      let current = await this.admin.customer(this.customerId);
      await this.reconcile(state, current);
      const active = state.records.find((record2) => record2.submissionId === state.active);
      if (active && busy.has(active.status)) throw new RequestError("profile_request_processing", 409);
      const record = { submissionId: validated.submissionId, fingerprint: validated.fingerprint, status: "needs_subscription", updatedAt: this.clock().toISOString() };
      if (current.defaultEmailAddress?.marketingState !== "SUBSCRIBED") {
        await this.save(state, record);
        return publicStatus(record);
      }
      state.active = record.submissionId;
      record.status = "preparing";
      await this.save(state, record);
      try {
        current = await this.admin.persistProfile(this.customerId, validated, current, this.clock());
      } catch (error) {
        record.status = "failed";
        record.code = error instanceof RequestError ? error.code : "profile_preparation_failed";
        state.active = null;
        await this.save(state, record);
        return publicStatus(record);
      }
      if (current.defaultEmailAddress?.marketingState !== "SUBSCRIBED") {
        record.status = "needs_subscription";
        state.active = null;
        await this.save(state, record);
        return publicStatus(record);
      }
      record.status = "dispatching";
      await this.save(state, record);
      try {
        const result = await this.dispatch({ customerId: this.customerId, submissionId: record.submissionId, customer: current });
        if (result?.accepted !== true) throw new Error("No acceptance returned");
        record.status = "accepted";
      } catch {
        record.status = "review";
        record.code = "dispatch_outcome_unknown";
      }
      record.updatedAt = this.clock().toISOString();
      await this.save(state, record);
      return publicStatus(record);
    });
  }
  status(submissionId) {
    return this.serial(async () => {
      const state = await this.state();
      await this.recover(state);
      if (state.active) await this.reconcile(state, await this.admin.customer(this.customerId));
      const record = state.records.find((item) => item.submissionId === submissionId);
      if (!record) throw new RequestError("submission_not_found", 404);
      return publicStatus(record);
    });
  }
};

// shopify/wine-profile/integration/worker-runtime.mjs
var paths = /* @__PURE__ */ new Set(["/proxy/context", "/proxy/request", "/proxy/status"]);
var respond = (error, status) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store, private" } });
var actorName = ({ shop, customerId }) => `${shop}:${customerId}`;
function createWorkerRuntime({ DurableObject: DurableObject2, registry, createAdmin: createAdmin2, createDispatch, clock = () => /* @__PURE__ */ new Date() }) {
  if (typeof DurableObject2 !== "function" || typeof createAdmin2 !== "function" || !registry) throw new Error("Runtime dependencies are required.");
  const enabled = (env) => env.EMAIL_REQUESTS_ENABLED === "true" && typeof createDispatch === "function";
  const operatorIdentity = (authorization, env) => authenticateOperator(authorization, {
    shop: env.SHOPIFY_SHOP,
    clientId: env.SHOPIFY_CLIENT_ID,
    secret: env.SHOPIFY_CLIENT_SECRET,
    reviewerIds: env.WINE_PROFILE_REVIEWER_IDS,
    now: clock().getTime()
  });
  class WineProfileRequests2 extends DurableObject2 {
    constructor(ctx, env) {
      super(ctx, env);
      this.coordinator = null;
    }
    async review({ authorization, customerId }) {
      const identity = operatorIdentity(authorization, this.env);
      validateReviewInput({ customerId });
      if (this.ctx.id.name !== actorName({ shop: identity.shop, customerId })) throw new RequestError("customer_scope_mismatch", 403);
      return reviewRequestState(await this.ctx.storage.get("requests"));
    }
    async fetch(request) {
      try {
        const env = this.env;
        const identity = authenticateProxy(request.url, { secret: env.SHOPIFY_CLIENT_SECRET, shop: env.SHOPIFY_SHOP, now: clock().getTime() });
        if (!identity.customerId || this.ctx.id.name !== actorName(identity)) throw new RequestError("customer_scope_mismatch", 403);
        this.admin ??= createAdmin2(env);
        this.coordinator ??= new ProfileRequestCoordinator({
          storage: this.ctx.storage,
          admin: this.admin,
          customerId: identity.customerId,
          clock,
          dispatch: createDispatch ? createDispatch(env, this.admin) : void 0
        });
        this.coordinator.enabled = enabled(env);
        return createHandler({
          shop: env.SHOPIFY_SHOP,
          secret: env.SHOPIFY_CLIENT_SECRET,
          registry,
          admin: this.admin,
          coordinatorFor: () => this.coordinator,
          enabled: enabled(env),
          clock
        })(request);
      } catch (error) {
        return error instanceof RequestError ? respond(error.code, error.status) : respond("request_unavailable", 503);
      }
    }
  }
  const worker = {
    async fetch(request, env) {
      try {
        const path = new URL(request.url).pathname;
        if (path === "/operations/identity") {
          const identity2 = authenticateAdminIdentity(request.headers.get("authorization"), {
            shop: env.SHOPIFY_SHOP,
            clientId: env.SHOPIFY_CLIENT_ID,
            secret: env.SHOPIFY_CLIENT_SECRET,
            now: clock().getTime()
          });
          if (request.method !== "POST") return respond("method_not_allowed", 405);
          return Response.json({ userId: identity2.userId }, { headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } });
        }
        if (path === "/operations/requests") {
          const authorization = request.headers.get("authorization");
          const identity2 = operatorIdentity(authorization, env);
          if (request.method !== "POST") return respond("method_not_allowed", 405);
          const customerId = validateReviewInput(await readJson(request, 256));
          if (!env.PROFILE_REQUESTS) throw new RequestError("configuration_missing", 503);
          const result = await env.PROFILE_REQUESTS.getByName(actorName({ shop: identity2.shop, customerId })).review({ authorization, customerId });
          return Response.json({ customerId, ...result }, { headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } });
        }
        if (!paths.has(path)) return respond("not_found", 404);
        const identity = authenticateProxy(request.url, { secret: env.SHOPIFY_CLIENT_SECRET, shop: env.SHOPIFY_SHOP, now: clock().getTime() });
        if (!identity.customerId || !enabled(env) && path !== "/proxy/status") {
          return createHandler({ shop: env.SHOPIFY_SHOP, secret: env.SHOPIFY_CLIENT_SECRET, registry, enabled: enabled(env), clock })(request);
        }
        if (!env.PROFILE_REQUESTS) throw new RequestError("configuration_missing", 503);
        return await env.PROFILE_REQUESTS.getByName(actorName(identity)).fetch(request);
      } catch (error) {
        return error instanceof RequestError ? respond(error.code, error.status) : respond("request_unavailable", 503);
      }
    }
  };
  return { worker, WineProfileRequests: WineProfileRequests2 };
}

// shopify/wine-profile/integration/shopify-admin.mjs
import { isDeepStrictEqual } from "node:util";
var PROFILE_NAMESPACE = "chateau_wine_profile";
var customerGid = (id) => {
  if (!/^[1-9]\d{0,19}$/.test(id ?? "")) throw new RequestError("invalid_customer", 401);
  return `gid://shopify/Customer/${id}`;
};
var CUSTOMER = `query WineProfileCustomer($id: ID!) {
  customer(id: $id) {
    id tags defaultEmailAddress { marketingState }
    profile: metafield(namespace: "${PROFILE_NAMESPACE}", key: "snapshot") { value compareDigest }
    request: metafield(namespace: "${PROFILE_NAMESPACE}", key: "request") { value compareDigest }
  }
}`;
var ShopifyAdmin = class {
  constructor({ shop, accessToken, fetcher = fetch, apiVersion = "2026-10" }) {
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? "") || !/^\d{4}-(01|04|07|10)$/.test(apiVersion)) throw new RequestError("configuration_missing", 503);
    this.endpoint = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
    this.accessToken = accessToken;
    this.fetcher = fetcher;
  }
  async query(query, variables) {
    const token = typeof this.accessToken === "function" ? await this.accessToken() : this.accessToken;
    if (!token) throw new RequestError("configuration_missing", 503);
    let response, result;
    try {
      response = await this.fetcher(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(1e4),
        redirect: "error"
      });
      if (!response.ok) throw new RequestError(response.status === 429 ? "shopify_rate_limited" : "shopify_unavailable", 503);
      result = await response.json();
    } catch (error) {
      if (error instanceof RequestError) throw error;
      throw new RequestError("shopify_unavailable", 503);
    }
    if (result.errors?.length || !result.data) throw new RequestError("shopify_api_error", 502);
    return result.data;
  }
  async customer(customerId) {
    const { customer } = await this.query(CUSTOMER, { id: customerGid(customerId) });
    if (!customer || customer.id !== customerGid(customerId)) throw new RequestError("customer_not_found", 404);
    return customer;
  }
  async tags(customerId, operation, tags) {
    if (!tags.length) return;
    if (!["tagsAdd", "tagsRemove"].includes(operation)) throw new RequestError("invalid_operation");
    const data = await this.query(`mutation WineProfileTags($id: ID!, $tags: [String!]!) { ${operation}(id: $id, tags: $tags) { userErrors { field message } } }`, { id: customerGid(customerId), tags });
    if (!data[operation] || data[operation].userErrors?.length) throw new RequestError("customer_tags_failed", 502);
  }
  async metafields(customerId, values, previous = {}) {
    const metafields = Object.entries(values).map(([key, value]) => {
      if (!["snapshot", "request"].includes(key)) throw new RequestError("invalid_metafield");
      return { ownerId: customerGid(customerId), namespace: PROFILE_NAMESPACE, key, type: "json", value: JSON.stringify(value), compareDigest: previous[key]?.compareDigest ?? null };
    });
    const { metafieldsSet } = await this.query(`mutation WineProfileData($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { key compareDigest } userErrors { field message code } } }`, { metafields });
    if (!metafieldsSet || metafieldsSet.userErrors?.length) throw new RequestError("profile_update_conflict", 409);
    return metafieldsSet.metafields;
  }
  async persistProfile(customerId, validated, current, now = /* @__PURE__ */ new Date()) {
    const operations = planProfileTags(current.tags, validated.tags);
    const snapshot = {
      quiz_version: validated.quizVersion,
      submission_id: validated.submissionId,
      answers: validated.answers,
      profile: validated.profile,
      created_at: now.toISOString()
    };
    const request = { submission_id: validated.submissionId, status: "preparing", updated_at: now.toISOString() };
    await this.metafields(customerId, { snapshot, request }, { snapshot: current.profile, request: current.request });
    await this.tags(customerId, "tagsRemove", operations.remove);
    await this.tags(customerId, "tagsAdd", operations.add);
    const saved = await this.customer(customerId);
    let savedSnapshot, savedRequest;
    try {
      savedSnapshot = JSON.parse(saved.profile?.value);
      savedRequest = JSON.parse(saved.request?.value);
    } catch {
      throw new RequestError("profile_verification_failed", 502);
    }
    const savedTags = saved.tags?.filter((tag) => /^cfwp\d+_\d+_\d+:/.test(tag)).sort();
    if (!isDeepStrictEqual(savedSnapshot, snapshot) || !isDeepStrictEqual(savedRequest, request) || !isDeepStrictEqual(savedTags, [...validated.tags].sort())) throw new RequestError("profile_verification_failed", 502);
    return saved;
  }
};

// shopify/wine-profile/integration/access-token.mjs
function createClientCredentialsTokenProvider({ shop, clientId, clientSecret, fetcher = fetch, clock = Date.now }) {
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? "") || !clientId || !clientSecret) throw new RequestError("configuration_missing", 503);
  let cached, pending;
  return async function accessToken() {
    if (cached && clock() < cached.expiresAt - 6e4) return cached.token;
    if (pending) return pending;
    pending = (async () => {
      let response, data;
      try {
        response = await fetcher(`https://${shop}/admin/oauth/access_token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
          redirect: "error",
          signal: AbortSignal.timeout(1e4)
        });
        if (!response.ok) throw new RequestError("shopify_authorization_failed", 503);
        data = await response.json();
      } catch (error) {
        if (error instanceof RequestError) throw error;
        throw new RequestError("shopify_authorization_unavailable", 503);
      }
      if (typeof data.access_token !== "string" || data.access_token.length < 16 || data.access_token.length > 4096 || !Number.isInteger(data.expires_in) || data.expires_in <= 60 || data.expires_in > 86400) throw new RequestError("invalid_shopify_token_response", 503);
      cached = { token: data.access_token, expiresAt: clock() + data.expires_in * 1e3 };
      return cached.token;
    })().finally(() => {
      pending = null;
    });
    return pending;
  };
}

// shopify/wine-profile/integration/operations-page.mjs
import { randomBytes as randomBytes2 } from "node:crypto";

// shopify/wine-profile/integration/operations-client.mjs
function mountRequestReview({ document, getToken, fetcher = fetch }) {
  const form = document.querySelector("[data-review-form]");
  const status = document.querySelector("[data-review-status]");
  const result = document.querySelector("[data-review-result]");
  const labels = {
    needs_subscription: "Waiting for subscription",
    preparing: "Preparing",
    dispatching: "Dispatching",
    accepted: "Email requested",
    processed: "Automation processed; delivery unconfirmed",
    skipped: "Skipped",
    failed: "Preparation failed",
    review: "Review required",
    unknown: "Unknown"
  };
  const errors = {
    review_not_configured: "Review access has not been configured.",
    invalid_admin_token: "Open this app in Shopify admin and try again.",
    review_access_denied: "Your Shopify user is not on the request-review allowlist.",
    invalid_customer: "Enter a numeric Shopify customer ID."
  };
  async function call(path, body) {
    let tokenTimeout;
    try {
      const token = await Promise.race([getToken(), new Promise((resolve, reject) => {
        tokenTimeout = setTimeout(() => reject(new Error("invalid_admin_token")), 1e4);
      })]);
      clearTimeout(tokenTimeout);
      if (typeof token !== "string" || !token) throw new Error("invalid_admin_token");
      const response = await fetcher(path, {
        method: "POST",
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        ...body === void 0 ? {} : { body: JSON.stringify(body) },
        signal: AbortSignal.timeout(2e4)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      return data;
    } finally {
      clearTimeout(tokenTimeout);
    }
  }
  const identityButton = document.querySelector("[data-review-identity]");
  const identityStatus = document.querySelector("[data-review-identity-status]");
  identityButton?.addEventListener("click", async () => {
    if (identityButton.disabled) return;
    identityButton.disabled = true;
    identityStatus.textContent = "Verifying your Shopify identity\u2026";
    try {
      const data = await call("/operations/identity");
      if (typeof data.userId !== "string" || !/^[1-9]\d{0,19}$/.test(data.userId)) throw new Error("invalid_response");
      identityStatus.textContent = "Your verified Shopify user ID is " + data.userId + ". The owner can use this ID when configuring reviewer access.";
    } catch (error) {
      identityStatus.textContent = errors[error.message] ?? "Your Shopify identity is unavailable. Open this app in Shopify admin and try again.";
    } finally {
      identityButton.disabled = false;
      identityStatus.focus({ preventScroll: true });
    }
  });
  if (!form || !status || !result) return;
  let pending = false;
  form.elements.customer_id.addEventListener("input", () => {
    result.replaceChildren();
    status.textContent = "Look up the entered customer ID to load request history.";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    const customerId = form.elements.customer_id.value.trim();
    result.replaceChildren();
    if (!/^[1-9]\d{0,19}$/.test(customerId)) {
      status.textContent = errors.invalid_customer;
      return;
    }
    pending = true;
    form.querySelector("button").disabled = true;
    form.elements.customer_id.disabled = true;
    status.textContent = "Loading stored request status\u2026";
    try {
      const data = await call("/operations/requests", { customerId });
      if (data.customerId !== customerId || !Array.isArray(data.records)) throw new Error("invalid_response");
      status.textContent = data.records.length ? "Stored request history loaded. No delivery confirmation is implied." : "No stored requests for this customer.";
      const caption = document.createElement("p");
      caption.textContent = "Customer ID: " + customerId;
      result.append(caption);
      if (data.records.length) {
        const table = document.createElement("table");
        const head = document.createElement("thead");
        const header = document.createElement("tr");
        for (const title of ["Request reference", "Stored status", "Error code", "Updated (UTC)", "Profile lock"]) {
          const cell = document.createElement("th");
          cell.scope = "col";
          cell.textContent = title;
          header.append(cell);
        }
        head.append(header);
        table.append(head);
        const body = document.createElement("tbody");
        for (const record of data.records.slice(0, 50)) {
          const row = document.createElement("tr");
          for (const value of [
            record.submissionId ?? "Unavailable",
            labels[record.status] ?? labels.unknown,
            record.code ?? "\u2014",
            record.updatedAt ?? "Unavailable",
            record.submissionId && record.submissionId === data.activeSubmissionId ? "Locked" : "\u2014"
          ]) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
          }
          body.append(row);
        }
        table.append(body);
        result.append(table);
      }
    } catch (error) {
      status.textContent = errors[error.message] ?? "Request status is unavailable. Try the lookup again; no email was resent.";
    } finally {
      pending = false;
      form.querySelector("button").disabled = false;
      form.elements.customer_id.disabled = false;
      status.focus({ preventScroll: true });
    }
  });
}

// shopify/wine-profile/integration/operations-page.mjs
var escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
function operationsPage({ shop, clientId, reviewConfigured = false }) {
  const embedded = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? "") && typeof clientId === "string" && clientId.length > 0;
  const configured = embedded && reviewConfigured;
  const nonce = randomBytes2(18).toString("base64");
  const identityControls = embedded ? '<section><h2>Reviewer setup</h2><p>Use your verified Shopify user ID when asking the owner to configure review access. Showing your ID does not grant access to customer request history.</p><button type="button" data-review-identity>Show my Shopify user ID</button><p role="status" tabindex="-1" data-review-identity-status></p></section>' : "";
  const content = configured ? `<h1>Wine Profile requests</h1><p>Look up stored request outcomes for a customer. Email requests are disabled while setup and verification are completed.</p><form method="post" action="/operations/requests" data-review-form><label for="customer-id">Shopify customer ID</label><input id="customer-id" name="customer_id" type="text" inputmode="numeric" pattern="[1-9][0-9]{0,19}" maxlength="20" required autocomplete="off"><button type="submit">Look up requests</button></form><p role="status" tabindex="-1" data-review-status>Open this app in Shopify admin with an authorised reviewer account.</p><div class="history" role="region" aria-label="Stored request history" tabindex="0" data-review-result></div><h2>When a request needs review</h2><p>Match the request reference to its Flow run before taking action. Preparing or dispatching may indicate an in-flight or interrupted request. An uncertain outcome stays locked to avoid duplicate emails.</p><p>This screen reads stored status only. It does not resend emails, change consent or unlock profiles.</p>` : "<h1>Wine Profile integration</h1><p>Email requests are disabled while setup and verification are completed.</p><p>Request review is not configured yet.</p>";
  return new Response(`<!doctype html><html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Wine Profile request review</title>
${embedded ? `<meta name="shopify-api-key" content="${escape(clientId)}"><meta name="shopify-disabled-features" content="fetch"><script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>` : ""}
<style nonce="${nonce}">body{margin:0;padding:2rem;background:#f7f7f5;color:#21211f;font:16px/1.5 Arial,sans-serif}main{max-width:75rem;margin:auto}form{display:flex;flex-wrap:wrap;gap:.7rem;align-items:center;margin-block:2rem}input,button{font:inherit;padding:.6rem}button{background:#4a002e;color:white;border:0;border-radius:.25rem}button:disabled{opacity:.6}th,td{text-align:left;padding:.7rem;border-bottom:1px solid #ccc;vertical-align:top;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;min-width:40rem}.history{overflow:auto}h1{font-size:1.8rem}h2{font-size:1.2rem;margin-top:2rem}[role=status]:focus{outline:2px solid #4a002e;outline-offset:.3rem}</style>
</head><body><main>${content}${identityControls}</main>
${embedded ? `<script nonce="${nonce}">(${mountRequestReview.toString()})({document,getToken:()=>shopify.idToken()});</script>` : ""}
</body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}' https://cdn.shopify.com; style-src 'nonce-${nonce}'; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors ${embedded ? `https://${shop} https://admin.shopify.com` : "'none'"}`
    }
  });
}

// shopify/wine-profile/integration/worker.mjs
var providers = /* @__PURE__ */ new WeakMap();
function createAdmin(env) {
  if (!providers.has(env)) providers.set(env, createClientCredentialsTokenProvider({
    shop: env.SHOPIFY_SHOP,
    clientId: env.SHOPIFY_CLIENT_ID,
    clientSecret: env.SHOPIFY_CLIENT_SECRET
  }));
  return new ShopifyAdmin({ shop: env.SHOPIFY_SHOP, accessToken: providers.get(env) });
}
var runtime = createWorkerRuntime({ DurableObject, registry: content_registry_default, createAdmin });
var WineProfileRequests = runtime.WineProfileRequests;
var worker_default = {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/") return operationsPage({
      shop: env.SHOPIFY_SHOP,
      clientId: env.SHOPIFY_CLIENT_ID,
      reviewConfigured: typeof env.WINE_PROFILE_REVIEWER_IDS === "string" && Boolean(env.WINE_PROFILE_REVIEWER_IDS.trim())
    });
    if (request.method === "GET" && path === "/health") return Response.json({ service: "wine-profile", email_requests_enabled: false }, { headers: { "Cache-Control": "no-store" } });
    return runtime.worker.fetch(request, env);
  }
};
export {
  WineProfileRequests,
  worker_default as default
};
