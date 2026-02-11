import { backup } from "./backup.js";

const btn_add_new_lang = document.getElementById("btn_add_new_lang");
const modal_language_menu = document.getElementById("modal_language_menu");
const modal_add_language = document.getElementById("modal_add_language");
const sel_new_language = document.getElementById("sel_new_language");
const btn_create_language = document.getElementById("btn_create_language");
const addVocable = document.getElementById("addVocable");
const modal_new_words = document.getElementById("modal_new_words");
const modal_words = document.getElementById("modal_words");
const showMyVocables = document.getElementById("showMyVocables");
const btn_settings = document.getElementById("btn_settings");
const label_transl = document.getElementById("label_transl");
const lngLabel = document.getElementById("lngLabel");
const langContainer = document.getElementById("langContainer");
const close_until_langs = document.querySelectorAll(".close-Modal");
const wordsWrapper = document.getElementById("wordsWrapper");
const modal_cards_menu = document.getElementById("modal_cards_menu");
const btn_open_cardmenu = document.getElementById("btn_open_cardmenu");
const modal_random_cards = document.getElementById("modal_random_cards");
const btn_start_random_cards = document.getElementById(
  "btn_start_random_cards",
);
const btn_box_1 = document.getElementById("btn_box_1");
const btn_box_2 = document.getElementById("btn_box_2");
const btn_box_3 = document.getElementById("btn_box_3");
const btn_box_4 = document.getElementById("btn_box_4");
const btn_card_known = document.getElementById("btn_card_known");
const btn_card_unknown = document.getElementById("btn_card_unknown");
const btn_next_card = document.getElementById("btn_next_card");
const modal_mini = document.getElementById("modal_mini");
const btn_close_miniModal = document.getElementById("btn_close_miniModal");
const btn_audio_output = document.getElementById("btn_audio_output");
const btn_delete_word = document.getElementById("btn_delete_word");
const modal_settings_menu = document.getElementById("modal_settings_menu");
const btn_delete_everything = document.getElementById("btn_delete_everything");

const btn_translate = document.getElementById("btn_translate");
const inp_lang_short_code = document.getElementById("inp_lang_short_code");
const inp_word_own = document.getElementById("inp_word_own");
const inp_word_foreign = document.getElementById("inp_word_foreign");
const btn_Save_new_Vocable = document.getElementById("btn_Save_new_Vocable");
const toast = document.getElementById("toast");

let cardBackSideIsVisible = false;
let allVocables = [];
let languages = [];
let modal_is_visible = false;
let current_language_code = "";
let current_word = "";
let current_word_id = -1;

let current_card_word_id = null;
let selected_card_box = null; // 1-4, null = Random über alle Fächer
let current_card_box = null; // 1-4 (Fach der aktuell gezogenen Karte)

let voc_Saveobject = {
  languagePacks: [],
  showLanguage: "",
};

let toastTimeoutId = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("active");

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("active");
    toastTimeoutId = null;
  }, 1600);
}

//////////////////////////////
//*ANCHOR - Init
//////////////////////////////

window.addEventListener("load", init);

function init() {
  load_Data_from_LocalStorage();
  populate_new_language_select();
  init_tts();
  toggle_add_button();
}

let ttsVoices = [];

function init_tts() {
  if (!window.speechSynthesis || !window.speechSynthesis.getVoices) return;
  const loadVoices = () => {
    ttsVoices = window.speechSynthesis.getVoices() || [];
  };

  loadVoices();
  // In manchen Browsern (u.a. Safari) kommen Voices async rein
  try {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } catch (e) {
    // ignore
  }
}

function normalize_tts_lang(code) {
  if (!code) return "";
  if (code.includes("-")) return code;
  const map = {
    de: "de-DE",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    pl: "pl-PL",
    tr: "tr-TR",
    ru: "ru-RU",
    uk: "uk-UA",
    ro: "ro-RO",
    bg: "bg-BG",
    hr: "hr-HR",
    sr: "sr-RS",
    sk: "sk-SK",
    sl: "sl-SI",
    cs: "cs-CZ",
    hu: "hu-HU",
    sv: "sv-SE",
    no: "nb-NO",
    da: "da-DK",
    fi: "fi-FI",
    el: "el-GR",
    ar: "ar-SA",
    he: "he-IL",
    hi: "hi-IN",
    id: "id-ID",
    vi: "vi-VN",
    th: "th-TH",
    ja: "ja-JP",
    ko: "ko-KR",
  };
  return map[code] || code;
}

function select_tts_voice(langCode) {
  if (!window.speechSynthesis || !window.speechSynthesis.getVoices) return null;
  const normalized = normalize_tts_lang(langCode);
  const primary = (normalized || langCode).split("-")[0];

  const voices = ttsVoices.length ? ttsVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferLocal = (list) => {
    const local = list.filter((v) => v.localService);
    return local.length ? local : list;
  };

  const exact = preferLocal(voices.filter((v) => v.lang === normalized));
  if (exact.length) return exact.find((v) => v.default) || exact[0];

  const byPrimary = preferLocal(
    voices.filter((v) => typeof v.lang === "string" && v.lang.startsWith(primary + "-")),
  );
  if (byPrimary.length) return byPrimary.find((v) => v.default) || byPrimary[0];

  return null;
}

function get_common_languages() {
  return [
    { name: "Englisch", code: "en" },
    { name: "Spanisch", code: "es" },
    { name: "Französisch", code: "fr" },
    { name: "Italienisch", code: "it" },
    { name: "Portugiesisch", code: "pt" },
    { name: "Niederländisch", code: "nl" },
    { name: "Polnisch", code: "pl" },
    { name: "Türkisch", code: "tr" },
    { name: "Russisch", code: "ru" },
    { name: "Ukrainisch", code: "uk" },
    { name: "Rumänisch", code: "ro" },
    { name: "Bulgarisch", code: "bg" },
    { name: "Kroatisch", code: "hr" },
    { name: "Serbisch", code: "sr" },
    { name: "Slowakisch", code: "sk" },
    { name: "Slowenisch", code: "sl" },
    { name: "Tschechisch", code: "cs" },
    { name: "Ungarisch", code: "hu" },
    { name: "Schwedisch", code: "sv" },
    { name: "Norwegisch", code: "no" },
    { name: "Dänisch", code: "da" },
    { name: "Finnisch", code: "fi" },
    { name: "Griechisch", code: "el" },
    { name: "Arabisch", code: "ar" },
    { name: "Hebräisch", code: "he" },
    { name: "Hindi", code: "hi" },
    { name: "Indonesisch", code: "id" },
    { name: "Vietnamesisch", code: "vi" },
    { name: "Thailändisch", code: "th" },
    { name: "Chinesisch (Vereinfacht)", code: "zh-CN" },
    { name: "Japanisch", code: "ja" },
    { name: "Koreanisch", code: "ko" },
  ];
}

function populate_new_language_select() {
  if (!sel_new_language) return;

  sel_new_language.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Bitte auswählen…";
  placeholder.disabled = true;
  placeholder.selected = true;
  sel_new_language.appendChild(placeholder);

  const langs = get_common_languages()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  for (const lang of langs) {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = lang.name;
    sel_new_language.appendChild(opt);
  }
}

//////////////////////////////
//*ANCHOR -  Load Data
//////////////////////////////

function load_Data_from_LocalStorage() {
  if (localStorage.getItem("vocTrainer_save_Object") != null) {
    voc_Saveobject = JSON.parse(localStorage.getItem("vocTrainer_save_Object"));
    try {
      migrate_and_sync_leitner_data();
      renderLanguages();
      backup(voc_Saveobject);
    } catch (error) {}
  } else {
    // Keine Einträge vorhanden
    console.warn("Keine Daten geladen");
    voc_Saveobject = {
      languagePacks: [],
      showLanguage: "",
    };
    backup(voc_Saveobject);
  }
}

function migrate_and_sync_leitner_data() {
  if (!voc_Saveobject || !Array.isArray(voc_Saveobject.languagePacks)) return;

  for (const pack of voc_Saveobject.languagePacks) {
    if (!pack) continue;
    if (!Array.isArray(pack.word_DB)) pack.word_DB = [];
    if (!Array.isArray(pack.level_1_DB)) pack.level_1_DB = [];
    if (!Array.isArray(pack.level_2_DB)) pack.level_2_DB = [];
    if (!Array.isArray(pack.level_3_DB)) pack.level_3_DB = [];
    if (!Array.isArray(pack.level_4_DB)) pack.level_4_DB = [];
    if (!Array.isArray(pack.testfail_DB)) pack.testfail_DB = [];

    // Entferne verwaiste Einträge (Wörter, die nicht mehr in word_DB existieren)
    const existingIds = new Set(
      pack.word_DB.map((w) => w?.wordId).filter(Boolean),
    );
    const filterToExisting = (arr) =>
      arr.filter((w) => w && existingIds.has(w.wordId));
    pack.level_1_DB = filterToExisting(pack.level_1_DB);
    pack.level_2_DB = filterToExisting(pack.level_2_DB);
    pack.level_3_DB = filterToExisting(pack.level_3_DB);
    pack.level_4_DB = filterToExisting(pack.level_4_DB);
    pack.testfail_DB = filterToExisting(pack.testfail_DB);

    // Wenn ein Wort in keinem Fach liegt, landet es in Fach 1
    for (const word of pack.word_DB) {
      if (!word || !word.wordId) continue;
      if (find_box_for_word(pack, word.wordId) == null) {
        pack.level_1_DB.push(word);
      }
    }

    // Safety: Wort darf nur in einem Fach liegen
    dedupe_word_across_boxes(pack);
  }

  save_Data_into_LocalStorage();
}

function find_box_for_word(pack, wordId) {
  if (!pack || !wordId) return null;
  const inArr = (arr) =>
    Array.isArray(arr) && arr.some((w) => w?.wordId === wordId);
  if (inArr(pack.level_1_DB)) return 1;
  if (inArr(pack.level_2_DB)) return 2;
  if (inArr(pack.level_3_DB)) return 3;
  if (inArr(pack.level_4_DB)) return 4;
  return null;
}

function get_box_array(pack, box) {
  if (!pack) return null;
  if (box === 1) return pack.level_1_DB;
  if (box === 2) return pack.level_2_DB;
  if (box === 3) return pack.level_3_DB;
  if (box === 4) return pack.level_4_DB;
  return null;
}

function remove_word_from_all_boxes(pack, wordId) {
  const removeFrom = (arr) => {
    if (!Array.isArray(arr)) return;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]?.wordId === wordId) arr.splice(i, 1);
    }
  };
  removeFrom(pack.level_1_DB);
  removeFrom(pack.level_2_DB);
  removeFrom(pack.level_3_DB);
  removeFrom(pack.level_4_DB);
  removeFrom(pack.testfail_DB);
}

function dedupe_word_across_boxes(pack) {
  const seen = new Set();
  const boxes = [
    pack.level_1_DB,
    pack.level_2_DB,
    pack.level_3_DB,
    pack.level_4_DB,
  ];
  for (const arr of boxes) {
    if (!Array.isArray(arr)) continue;
    for (let i = arr.length - 1; i >= 0; i--) {
      const id = arr[i]?.wordId;
      if (!id) {
        arr.splice(i, 1);
        continue;
      }
      if (seen.has(id)) arr.splice(i, 1);
      else seen.add(id);
    }
  }
}

function get_current_pack() {
  const langId = voc_Saveobject?.currentId;
  if (!langId) return null;
  for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
    if (voc_Saveobject.languagePacks[i].id === langId)
      return voc_Saveobject.languagePacks[i];
  }
  return null;
}

function start_cards_for_box(box) {
  const pack = get_current_pack();
  if (!pack) return;

  migrate_and_sync_leitner_data();

  selected_card_box = box;
  current_card_box = box;
  Modal.open_modal(modal_random_cards);

  const labelBase =
    voc_Saveobject?.showLanguage ||
    document.getElementById("lngLabel")?.innerHTML ||
    "";
  document.getElementById("card_lang_label").innerHTML = labelBase
    ? `${labelBase} – Fach ${box}`
    : `Fach ${box}`;

  draw_next_card();
}

function start_cards_random() {
  const pack = get_current_pack();
  if (!pack) return;

  migrate_and_sync_leitner_data();

  selected_card_box = null;
  current_card_box = null;
  Modal.open_modal(modal_random_cards);
  document.getElementById("card_lang_label").innerHTML =
    voc_Saveobject?.showLanguage || "";

  draw_next_card();
}

function get_all_box_cards(pack) {
  const all = [];
  const pushAll = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const w of arr) if (w && w.wordId) all.push(w);
  };
  pushAll(pack.level_1_DB);
  pushAll(pack.level_2_DB);
  pushAll(pack.level_3_DB);
  pushAll(pack.level_4_DB);
  return all;
}

function draw_next_card() {
  const pack = get_current_pack();
  if (!pack) return;

  let source = null;
  if (selected_card_box) {
    source = get_box_array(pack, selected_card_box);
  } else {
    source = get_all_box_cards(pack);
  }

  if (!source || source.length === 0) {
    current_card_word_id = null;
    document.getElementById("crdFront").innerHTML = "Keine Karten vorhanden";
    document.getElementById("crdBack").innerHTML = "";
    return;
  }

  const rnd = getRandomInt(source.length);
  const word = source[rnd];
  current_card_word_id = word.wordId;

  // Fach der gezogenen Karte merken (für die Verschiebe-Logik)
  current_card_box = find_box_for_word(pack, current_card_word_id);

  // Reset Flip + Animation
  card?.classList.remove("is-flipped");
  card?.classList.remove("fly-in");
  setTimeout(() => {
    card?.classList.add("fly-in");
  }, 50);

  document.getElementById("crdFront").innerHTML = word.ownLangWord;
  document.getElementById("crdBack").innerHTML = word.foreignLangWord;
}

function answer_current_card(known) {
  const pack = get_current_pack();
  if (!pack || !current_card_word_id) return;

  const fromBox =
    current_card_box || find_box_for_word(pack, current_card_word_id) || 1;

  let targetBox = fromBox;
  if (known) targetBox = Math.min(fromBox + 1, 4);
  else targetBox = Math.max(fromBox - 1, 1);

  remove_word_from_all_boxes(pack, current_card_word_id);
  const wordObj = pack.word_DB.find((w) => w?.wordId === current_card_word_id);
  if (wordObj) {
    const targetArr = get_box_array(pack, targetBox);
    if (targetArr) targetArr.push(wordObj);
  }

  dedupe_word_across_boxes(pack);
  updateSaveObj(voc_Saveobject);

  // Im Random-Modus wird current_card_box beim nächsten Draw neu gesetzt
  if (!selected_card_box) current_card_box = null;

  draw_next_card();
}

//////////////////////////////
//*ANCHOR - Save Into Local Storage
//////////////////////////////
const save_Data_into_LocalStorage = () => {
  localStorage.setItem(
    "vocTrainer_save_Object",
    JSON.stringify(voc_Saveobject),
  );
};

const add_Language_to_SaveObj = (newlanguage) => {
  voc_Saveobject.languagePacks.push(newlanguage);
  save_Data_into_LocalStorage();
};

const updateSaveObj = (svObj) => {
  console.log("New Saveobj", svObj);
  voc_Saveobject = svObj;
  save_Data_into_LocalStorage();
};

//////////////////////////////
//*ANCHOR -  Language Class
//////////////////////////////
class LanguagePack {
  constructor(id, language_Name, language_code) {
    this.id = id;
    this.language_Name = language_Name;
    this.level_1_DB = [];
    this.level_2_DB = [];
    this.level_3_DB = [];
    this.level_4_DB = [];
    this.testfail_DB = [];
    this.word_DB = [];
    this.language_code = language_code;
  }
}

////////////////////////////////
//*ANCHOR -  Modal
////////////////////////////////
class Modal {
  static modal_list = [
    modal_language_menu,
    modal_add_language,
    modal_new_words,
    modal_words,
    modal_cards_menu,
    modal_random_cards,
    modal_settings_menu,
  ];
  static open_modal(modal) {
    this.close_all_modals();
    modal.classList.add("active");
    modal_is_visible = true;
    toggle_add_button();
  }

  static close_all_modals() {
    for (let i = 0; i < this.modal_list.length; i++) {
      this.modal_list[i].classList.remove("active");
      modal_is_visible = false;
      toggle_add_button();
    }
  }
}

close_until_langs.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.closest("#modal_add_language")) {
      Modal.close_all_modals();
      return;
    }
    Modal.open_modal(modal_language_menu);
  });
});

btn_open_cardmenu.addEventListener("click", () => {
  Modal.open_modal(modal_cards_menu);
});
btn_start_random_cards.addEventListener("click", () => {
  start_cards_random();
});

if (btn_box_1)
  btn_box_1.addEventListener("click", () => start_cards_for_box(1));
if (btn_box_2)
  btn_box_2.addEventListener("click", () => start_cards_for_box(2));
if (btn_box_3)
  btn_box_3.addEventListener("click", () => start_cards_for_box(3));
if (btn_box_4)
  btn_box_4.addEventListener("click", () => start_cards_for_box(4));

if (btn_card_known)
  btn_card_known.addEventListener("click", () => answer_current_card(true));
if (btn_card_unknown)
  btn_card_unknown.addEventListener("click", () => answer_current_card(false));

//////////////////////////////
//*ANCHOR - Toggle Add Button
//////////////////////////////
function toggle_add_button() {
  if (modal_is_visible === true) {
    setTimeout(() => {
      addVocable.classList.add("active");
    }, 300);
  } else {
    addVocable.classList.remove("active");
  }
}

btn_add_new_lang.addEventListener("click", () => {
  if (modal_add_language) {
    Modal.open_modal(modal_add_language);
  } else {
    create_new_languge_pack();
  }
});

if (btn_create_language) {
  btn_create_language.addEventListener("click", () => {
    create_new_languge_pack();
  });
}

//////////////////////////////
//*ANCHOR - Generate Language Package
//////////////////////////////
function create_new_languge_pack() {
  if (sel_new_language) {
    const selectedCode = sel_new_language.value;
    const selectedName =
      sel_new_language.options[sel_new_language.selectedIndex]?.textContent ||
      "";

    if (!selectedCode) {
      alert("Bitte wähle eine Sprache aus.");
      return;
    }

    const newLang = new LanguagePack(create_Id(), selectedName, selectedCode);
    add_Language_to_SaveObj(newLang);
    window.location.reload();
    return;
  }

  // Fallback (falls das Select/Modal nicht vorhanden ist)
  const languageName = window.prompt("Welche Sprache möchtest du lernen?");
  if (languageName !== null && languageName.length > 1) {
    const language_code = window.prompt(
      "Gib den Sprachcode ein. Z.B. en für Englisch, es für Spanisch",
    );
    const newLang = new LanguagePack(create_Id(), languageName, language_code);
    add_Language_to_SaveObj(newLang);
    window.location.reload();
  }
}

//////////////////////////////
//*ANCHOR - Render Language
//////////////////////////////
function renderLanguages() {
  for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
    let languageButton = document.createElement("div");
    languageButton.innerHTML = voc_Saveobject.languagePacks[i].language_Name;
    languageButton.classList.add("languageBtn");
    languageButton.id = voc_Saveobject.languagePacks[i].id;

    languageButton.onclick = function () {
      voc_Saveobject.showLanguage = this.innerHTML;
      voc_Saveobject.currentId = this.id;
      save_Data_into_LocalStorage();
      setTimeout(() => {
        Modal.open_modal(modal_language_menu);
        lngLabel.innerHTML = this.innerHTML;
        document.getElementById("card_lang_label").innerHTML = this.innerHTML;
        label_transl.innerHTML = this.innerHTML;
        current_language_code = voc_Saveobject.languagePacks[i].language_code;
        allVocables = voc_Saveobject.languagePacks[i].word_DB;
      }, 200);
    };
    langContainer.appendChild(languageButton);
  }
}

//////////////////////////////
//*ANCHOR - Random numb
//////////////////////////////
const create_Id = () => {
  const chars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "#",
    "A",
    "B",
    "C",
    "D",
    "!",
    "E",
    "$",
  ];
  let id = "";
  for (let i = 1; i <= 15; i++) {
    const randomNumb = parseInt(Math.random() * chars.length);
    id = id + chars[randomNumb];
  }
  return id;
};

if (addVocable) {
  try {
    addVocable.addEventListener("click", () => {
      Modal.open_modal(modal_new_words);
      inp_lang_short_code.value = current_language_code;
    });
  } catch (error) {}
}

//////////////////////////////
//* ANCHOR Fetch request to translate text
//////////////////////////////
async function fetchTranslation(sourceLang, targetLang, sourceText) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    encodeURI(sourceText);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching translation:", error);
    return null;
  }
}

//////////////////////////////
//* ANCHOR Translate Text
//////////////////////////////

if (btn_translate) {
  btn_translate.addEventListener("click", () => {
    let sourceLang = "de";
    let targetLang = "en";
    let sourceText = "";

    if (inp_word_own.value !== "") {
      if (inp_lang_short_code.value !== "") {
        targetLang = inp_lang_short_code.value;
      }
      sourceText = inp_word_own.value;

      fetchTranslation(sourceLang, targetLang, sourceText)
        .then((translation) => {
          const translatedText = translation[0][0][0];
          inp_word_foreign.value = translatedText;
        })
        .catch((error) => {
          console.error("Translation error:", error);
        });
    } else if (inp_word_foreign.value !== "") {
      if (inp_lang_short_code.value !== "") {
        sourceLang = inp_lang_short_code.value;
      }
      sourceText = inp_word_foreign.value;
      targetLang = "de";
      fetchTranslation(sourceLang, targetLang, sourceText)
        .then((translation) => {
          const translatedText = translation[0][0][0];
          inp_word_own.value = translatedText;
        })
        .catch((error) => {
          console.error("Translation error:", error);
        });
    }
  });
}

//////////////////////////////
//*ANCHOR - Class for Vocable
//////////////////////////////
class Vocable {
  constructor(ownLangWord, foreignLangWord, wordId, voableStatus) {
    this.ownLangWord = ownLangWord;
    this.foreignLangWord = foreignLangWord;
    this.wordId = wordId;
    this.voableStatus = voableStatus;
  }
}

//////////////////////////////
//*ANCHOR - Eingegebenes Wort hinzufügen
//////////////////////////////

if (btn_Save_new_Vocable) {
  btn_Save_new_Vocable.addEventListener("click", () => {
    // Reset Textfields
    const word = inp_word_own.value;
    const translation = inp_word_foreign.value;
    const langId = voc_Saveobject.currentId;

    if (word.length !== "" && translation !== "") {
      for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
        if (voc_Saveobject.languagePacks[i].id === langId) {
          const newVoc = new Vocable(word, translation, create_Id(), 0);
          voc_Saveobject.languagePacks[i].word_DB.push(newVoc);
          // Jedes neue Wort startet in Fach 1
          if (!Array.isArray(voc_Saveobject.languagePacks[i].level_1_DB)) {
            voc_Saveobject.languagePacks[i].level_1_DB = [];
          }
          voc_Saveobject.languagePacks[i].level_1_DB.push(newVoc);
          dedupe_word_across_boxes(voc_Saveobject.languagePacks[i]);
          updateSaveObj(voc_Saveobject);
          showToast("Vokabel hinzugefügt (Fach 1)");
          break;
        }
      }
      inp_word_own.value = "";
      inp_word_foreign.value = "";
    } else {
      alert("Beide Felder müssen ausgefüllt sein");
    }
  });
}

//////////////////////////////
//*ANCHOR -  Show words
//////////////////////////////

showMyVocables.addEventListener("click", () => {
  Modal.open_modal(modal_words);
  showWords();
});

function showWords() {
  const langId = voc_Saveobject.currentId;

  for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
    if (voc_Saveobject.languagePacks[i].id === langId) {
      const wordbook = voc_Saveobject.languagePacks[i].word_DB;
      if (wordbook.length === 0) {
        wordsWrapper.innerHTML = "Keine Vokabeln vorhanden";
      } else {
        wordsWrapper.innerHTML = "";
      }
      for (let j = 0; j < wordbook.length; j++) {
        let row = document.createElement("div");
        row.classList.add("row");

        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.innerHTML = wordbook[j].ownLangWord;
        cell.id = wordbook[j].wordId;

        let cellr = document.createElement("div");
        cellr.classList.add("cell");
        cellr.classList.add("cellr");
        cellr.innerHTML = wordbook[j].foreignLangWord;
        cellr.id = wordbook[j].wordId;
        cellr.addEventListener("click", () => {
          current_word = wordbook[j].foreignLangWord;
          current_word_id = wordbook[j].wordId;
          modal_mini.classList.add("active");
          document.getElementById("word_minimodal").innerHTML = current_word;
        });

        row.appendChild(cell);
        row.appendChild(cellr);

        wordsWrapper.appendChild(row);
      }
      break;
    }
  }
}

//* btn to delete word

btn_delete_word.addEventListener("click", () => {
  const langId = voc_Saveobject.currentId;
  for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
    if (voc_Saveobject.languagePacks[i].id === langId) {
      for (let j = 0; j < voc_Saveobject.languagePacks[i].word_DB.length; j++) {
        if (
          current_word_id === voc_Saveobject.languagePacks[i].word_DB[j].wordId
        ) {
          // Aus allen Fächern entfernen
          remove_word_from_all_boxes(
            voc_Saveobject.languagePacks[i],
            current_word_id,
          );
          voc_Saveobject.languagePacks[i].word_DB.splice(j, 1);
          save_Data_into_LocalStorage();
          Modal.close_all_modals();
          Modal.open_modal(modal_words);
          showWords();
          modal_mini.classList.remove("active");
          break;
        }
      }
    }
  }
});

//* Btn to trigger text to speech
btn_audio_output.addEventListener("click", () => {
  text_to_speech(current_language_code, current_word);
});

//* Close mini Modal
btn_close_miniModal.addEventListener("click", () => {
  modal_mini.classList.remove("active");
});

//////////////////////////////
//*ANCHOR - Text to Speech
//////////////////////////////
function text_to_speech(lang_code, text) {
  if (!window.speechSynthesis) return;

  // laufende Ausgabe stoppen, sonst "stapelt" sich Audio
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }

  const msg = new SpeechSynthesisUtterance();
  const normalizedLang = normalize_tts_lang(lang_code);
  const voice = select_tts_voice(lang_code);

  msg.text = text;
  msg.lang = voice?.lang || normalizedLang || lang_code;
  if (voice) msg.voice = voice;
  msg.volume = 1; // 0 to 1
  msg.rate = 0.9; // 0.1 to 10
  msg.pitch = 1; // neutral, klingt natürlicher

  window.speechSynthesis.speak(msg);
}

btn_settings.addEventListener("click", () => {
  Modal.open_modal(modal_settings_menu);
});

btn_delete_everything.addEventListener("click", () => {
  const confirm = window.confirm("Sollen alle Daten gelöscht werden?");
  if (confirm) {
    delete_local_storage();
  }
});

function delete_local_storage() {
  localStorage.removeItem("vocTrainer_save_Object");
  location.reload();
}

//////////////////////////////
//*ANCHOR - Random int
//////////////////////////////

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//////////////////////////////
//*ANCHOR - Karte drehen
//////////////////////////////

const card = document.querySelector(".card");
if (card) {
  card.addEventListener("click", () => {
    flipCard();
  });
}

function flipCard() {
  card.classList.toggle("is-flipped");
  if (cardBackSideIsVisible === false) {
    cardBackSideIsVisible = true;
  } else {
    cardBackSideIsVisible = false;
  }
}

function get_random_card() {
  // Legacy-Funktion (z.B. falls irgendwo noch genutzt)
  draw_next_card();
}

if (btn_next_card) {
  btn_next_card.addEventListener("click", () => {
    // Falls der Button wieder eingefügt wird, nutze ihn als "nächste Karte" ohne Bewertung.
    card?.classList.remove("is-flipped");
    draw_next_card();
  });
}
