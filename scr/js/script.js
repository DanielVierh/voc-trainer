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
const btn_open_dnd_test = document.getElementById("btn_open_dnd_test");
const modal_dnd_test = document.getElementById("modal_dnd_test");
const modal_dnd_result = document.getElementById("modal_dnd_result");
const dnd_score = document.getElementById("dnd_score");
const dnd_slots = document.getElementById("dnd_slots");
const dnd_pool = document.getElementById("dnd_pool");
const btn_dnd_new_round = document.getElementById("btn_dnd_new_round");
const dnd_last_result = document.getElementById("dnd_last_result");
const close_until_langs = document.querySelectorAll(".close-Modal");
const wordsWrapper = document.getElementById("wordsWrapper");
const modal_cards_menu = document.getElementById("modal_cards_menu");
const btn_open_cardmenu = document.getElementById("btn_open_cardmenu");
const modal_random_cards = document.getElementById("modal_random_cards");
const btn_open_learning_modes = document.getElementById(
  "btn_open_learning_modes",
);
const modal_learning_modes = document.getElementById("modal_learning_modes");
const learning_mode_lang_label = document.getElementById(
  "learning_mode_lang_label",
);
const btn_mode_buttons = document.getElementById("btn_mode_buttons");
const btn_mode_type = document.getElementById("btn_mode_type");
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
const type_answer_area = document.getElementById("type_answer_area");
const inp_card_answer = document.getElementById("inp_card_answer");
const btn_check_answer = document.getElementById("btn_check_answer");
const modal_mini = document.getElementById("modal_mini");
const btn_close_miniModal = document.getElementById("btn_close_miniModal");
const btn_audio_output = document.getElementById("btn_audio_output");
const btn_delete_word = document.getElementById("btn_delete_word");
const modal_settings_menu = document.getElementById("modal_settings_menu");
const btn_delete_language = document.getElementById("btn_delete_language");
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

let typedAnswerCheckedThisCard = false;

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

function set_card_answer_buttons_visible(visible) {
  const show = Boolean(visible);
  const buttons = [btn_card_known, btn_card_unknown].filter(Boolean);
  for (const b of buttons) {
    b.classList.toggle("is-visible", show);
    b.setAttribute("aria-hidden", show ? "false" : "true");
  }
}

function reset_card_reveal_state() {
  cardBackSideIsVisible = false;
  set_card_answer_buttons_visible(false);
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
  render_dnd_last_result();
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

  const voices = ttsVoices.length
    ? ttsVoices
    : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const preferLocal = (list) => {
    const local = list.filter((v) => v.localService);
    return local.length ? local : list;
  };

  const exact = preferLocal(voices.filter((v) => v.lang === normalized));
  if (exact.length) return exact.find((v) => v.default) || exact[0];

  const byPrimary = preferLocal(
    voices.filter(
      (v) => typeof v.lang === "string" && v.lang.startsWith(primary + "-"),
    ),
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
    if (!pack.learningMode) pack.learningMode = "buttons";
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

function get_current_learning_mode() {
  const pack = get_current_pack();
  return pack?.learningMode === "type" ? "type" : "buttons";
}

function update_card_learning_mode_ui() {
  const typeMode = get_current_learning_mode() === "type";
  if (type_answer_area) type_answer_area.hidden = !typeMode;
  if (inp_card_answer) {
    inp_card_answer.value = "";
    inp_card_answer.disabled = false;
    inp_card_answer.setAttribute("aria-hidden", typeMode ? "false" : "true");
  }
  if (btn_check_answer) {
    btn_check_answer.disabled = false;
    btn_check_answer.setAttribute("aria-hidden", typeMode ? "false" : "true");
  }

  if (typeMode) {
    set_card_answer_buttons_visible(false);
  }

  typedAnswerCheckedThisCard = false;
  if (typeMode) {
    // Fokus erst nach DOM-Update/Modal-Animation
    setTimeout(() => {
      try {
        inp_card_answer?.focus();
      } catch (e) {
        // ignore
      }
    }, 150);
  }
}

function update_card_menu_counts() {
  // Counts im Karteikarten-Menü aktualisieren (Fächer + Gesamt)
  try {
    migrate_and_sync_leitner_data();
  } catch (e) {
    // ignore
  }

  const pack = get_current_pack();
  const count_unique = (arr) => {
    if (!Array.isArray(arr)) return 0;
    const ids = new Set();
    for (const w of arr) {
      const id = w?.wordId;
      if (id) ids.add(id);
    }
    return ids.size;
  };

  const c1 = pack ? count_unique(pack.level_1_DB) : 0;
  const c2 = pack ? count_unique(pack.level_2_DB) : 0;
  const c3 = pack ? count_unique(pack.level_3_DB) : 0;
  const c4 = pack ? count_unique(pack.level_4_DB) : 0;
  const total = c1 + c2 + c3 + c4;

  if (btn_start_random_cards)
    btn_start_random_cards.textContent = `Zufallskarten (${total})`;
  if (btn_box_1) btn_box_1.textContent = `Karteikarten Fach 1 (${c1})`;
  if (btn_box_2) btn_box_2.textContent = `Karteikarten Fach 2 (${c2})`;
  if (btn_box_3) btn_box_3.textContent = `Karteikarten Fach 3 (${c3})`;
  if (btn_box_4) btn_box_4.textContent = `Karteikarten Fach 4 (${c4})`;
}

function start_cards_for_box(box) {
  const pack = get_current_pack();
  if (!pack) return;

  migrate_and_sync_leitner_data();

  selected_card_box = box;
  current_card_box = box;
  Modal.open_modal(modal_random_cards);
  reset_card_reveal_state();
  update_card_learning_mode_ui();

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
  reset_card_reveal_state();
  update_card_learning_mode_ui();
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

  reset_card_reveal_state();
  update_card_learning_mode_ui();

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

function get_current_card_word(pack) {
  if (!pack || !current_card_word_id) return null;
  return (
    (pack.word_DB || []).find((w) => w?.wordId === current_card_word_id) || null
  );
}

function normalize_answer_text(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function strip_diacritics(text) {
  try {
    return String(text || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  } catch (e) {
    return String(text || "");
  }
}

function edit_distance(a, b) {
  const s = String(a);
  const t = String(b);
  const n = s.length;
  const m = t.length;
  if (n === 0) return m;
  if (m === 0) return n;

  const dp = new Array(m + 1);
  for (let j = 0; j <= m; j++) dp[j] = j;

  for (let i = 1; i <= n; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= m; j++) {
      const tmp = dp[j];
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[m];
}

function get_possible_answers(correct) {
  const raw = String(correct || "");
  return raw
    .split(/\s*(?:\/|;|\||,)\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function is_answer_correct(userInput, correctText) {
  const user = normalize_answer_text(userInput);
  if (!user) return false;

  const candidates = get_possible_answers(correctText);
  if (candidates.length === 0) return false;

  const userPlain = normalize_answer_text(strip_diacritics(user));

  for (const c of candidates) {
    const correct = normalize_answer_text(c);
    if (!correct) continue;

    if (user === correct) return true;

    const correctPlain = normalize_answer_text(strip_diacritics(correct));
    if (userPlain && correctPlain && userPlain === correctPlain) return true;

    // toleranter Tippfehler-Check
    const maxLen = Math.max(userPlain.length, correctPlain.length);
    const threshold = maxLen <= 5 ? 1 : maxLen <= 10 ? 2 : 3;
    if (edit_distance(userPlain, correctPlain) <= threshold) return true;
  }
  return false;
}

function reveal_card_back() {
  if (!card) return;
  card.classList.add("is-flipped");
  cardBackSideIsVisible = true;
  set_card_answer_buttons_visible(false);
}

function handle_typed_answer_submit() {
  if (get_current_learning_mode() !== "type") return;
  const pack = get_current_pack();
  if (!pack) return;

  const wordObj = get_current_card_word(pack);
  if (!wordObj) return;

  const userValue = inp_card_answer?.value || "";
  if (!normalize_answer_text(userValue)) {
    showToast("Bitte eine Antwort eingeben.");
    return;
  }

  const correct = wordObj.foreignLangWord;
  const ok = is_answer_correct(userValue, correct);
  typedAnswerCheckedThisCard = true;

  if (inp_card_answer) inp_card_answer.disabled = true;
  if (btn_check_answer) btn_check_answer.disabled = true;

  reveal_card_back();
  showToast(ok ? "Richtig!" : `Falsch. Richtig: ${correct}`);

  setTimeout(() => {
    answer_current_card(ok);
  }, 900);
}

if (btn_check_answer) {
  btn_check_answer.addEventListener("click", () => {
    handle_typed_answer_submit();
  });
}

if (inp_card_answer) {
  inp_card_answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handle_typed_answer_submit();
    }
  });
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
  update_card_menu_counts();

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
    modal_dnd_test,
    modal_dnd_result,
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
  update_card_menu_counts();
  Modal.open_modal(modal_cards_menu);
});

function update_learning_modes_modal_ui() {
  const pack = get_current_pack();
  if (!learning_mode_lang_label) return;
  learning_mode_lang_label.textContent = pack
    ? `Aktives Sprachmodul: ${pack.language_Name}`
    : "Bitte erst ein Sprachmodul auswählen.";
}

if (btn_open_learning_modes)
  btn_open_learning_modes.addEventListener("click", () => {
    update_learning_modes_modal_ui();
    Modal.open_modal(modal_learning_modes);
  });

function set_learning_mode_for_current_pack(mode) {
  const pack = get_current_pack();
  if (!pack) {
    showToast("Bitte erst ein Sprachmodul auswählen.");
    return;
  }
  pack.learningMode = mode === "type" ? "type" : "buttons";
  updateSaveObj(voc_Saveobject);
  showToast(
    pack.learningMode === "type" ? "Lernmodus: Tippen" : "Lernmodus: Buttons",
  );
  update_learning_modes_modal_ui();
}

if (btn_mode_buttons)
  btn_mode_buttons.addEventListener("click", () => {
    set_learning_mode_for_current_pack("buttons");
  });

if (btn_mode_type)
  btn_mode_type.addEventListener("click", () => {
    set_learning_mode_for_current_pack("type");
  });

if (btn_open_dnd_test) {
  btn_open_dnd_test.addEventListener("click", () => {
    Modal.open_modal(modal_dnd_test);
    start_dnd_session();
  });
}

if (btn_dnd_new_round) {
  btn_dnd_new_round.addEventListener("click", () => {
    if (btn_dnd_new_round.classList.contains("inactive")) return;
    if (!dndSessionActive) return;
    const nextIndex = get_next_nonempty_dnd_round_index(dndRoundIndex);
    if (nextIndex === -1) {
      open_dnd_result_modal();
      return;
    }
    dndRoundIndex = nextIndex;
    start_dnd_round();
  });
}
btn_start_random_cards.addEventListener("click", () => {
  start_cards_random();
});

let dndPoints = 0;
let dndRoundVocables = [];
let dndSessionActive = false;
let dndRoundsTotal = 0;
let dndRoundIndex = 0;
let dndRoundBatches = [];
let dndCorrectPairs = 0;
let dndWrongAttempts = 0;
let dndTotalPairs = 0;
let dndMaxScore = 0;
let dndSolvedPairsThisRound = 0;
let dndRoundPairCount = 0;

function is_valid_dnd_vocable(v) {
  if (!v || !v.wordId) return false;
  const own = typeof v.ownLangWord === "string" ? v.ownLangWord.trim() : "";
  const foreign =
    typeof v.foreignLangWord === "string" ? v.foreignLangWord.trim() : "";
  return Boolean(own && foreign);
}

function get_dnd_last_result() {
  return voc_Saveobject?.dndLastResult || null;
}

function set_dnd_last_result(result) {
  voc_Saveobject.dndLastResult = result;
  save_Data_into_LocalStorage();
}

function render_dnd_last_result() {
  if (!dnd_last_result) return;
  const last = get_dnd_last_result();
  if (!last) {
    dnd_last_result.textContent = "Noch kein Ergebnis";
    return;
  }

  const dateText = last.finishedAt
    ? new Date(last.finishedAt).toLocaleString()
    : "";
  const outcomeText = last.outcome === "win" ? "Gewonnen" : "Verloren";
  const maxText = typeof last.maxScore === "number" ? `/${last.maxScore}` : "";
  dnd_last_result.textContent = `${outcomeText} — Punkte: ${last.score}${maxText} — Richtig: ${last.correctPairs} — Daneben: ${last.wrongAttempts}${dateText ? " — " + dateText : ""}`;
}

function update_dnd_score() {
  if (!dnd_score) return;
  const roundText = dndSessionActive
    ? ` (Runde ${Math.min(dndRoundIndex + 1, dndRoundsTotal)}/${dndRoundsTotal})`
    : "";
  dnd_score.textContent = `Punkte: ${dndPoints}${roundText}`;
}

function shuffle_in_place(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function get_random_unique(arr, count) {
  const copy = arr.slice();
  shuffle_in_place(copy);
  return copy.slice(0, Math.max(0, Math.min(count, copy.length)));
}

function chunk_array(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function clear_dnd_board() {
  if (dnd_pool) dnd_pool.innerHTML = "";
  if (dnd_slots) {
    const slotEls = dnd_slots.querySelectorAll(".dnd-slot");
    slotEls.forEach((slot) => {
      slot.classList.remove("correct");
      // Slot-Label behalten (Paar X) aber Inhalte entfernen
      const label = slot.getAttribute("data-slot")
        ? `Paar ${slot.getAttribute("data-slot")}`
        : "Paar";
      slot.innerHTML = label;
    });
  }
}

function make_dnd_card({ id, text, pairId }) {
  const el = document.createElement("div");
  el.classList.add("dnd-card");
  el.id = id;
  el.textContent = text;
  el.draggable = true;
  el.dataset.pairId = pairId;

  const handle_drop_target = (targetEl) => {
    if (!targetEl || el.classList.contains("solved")) return;

    const pool = dnd_pool;
    const slot = targetEl.closest ? targetEl.closest(".dnd-slot") : null;

    if (slot) {
      const cardsInSlot = slot.querySelectorAll(".dnd-card");
      if (cardsInSlot.length >= 2) {
        if (pool) pool.appendChild(el);
        return;
      }

      if (!slot.querySelector(".dnd-card")) {
        const slotNum = slot.getAttribute("data-slot") || "";
        slot.innerHTML = slotNum ? `Paar ${slotNum}` : "Paar";
      }

      slot.appendChild(el);
      evaluate_dnd_slot(slot);
      return;
    }

    if (
      pool &&
      (targetEl === pool || (targetEl.closest && targetEl.closest("#dnd_pool")))
    ) {
      pool.appendChild(el);
    }
  };

  el.addEventListener("dragstart", (e) => {
    if (el.classList.contains("solved")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", el.id);
  });

  // Mobile: Pointer Events Drag&Drop (HTML5 DnD ist auf Touch oft nicht verfügbar)
  let isPointerDragging = false;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;
  let originalParent = null;
  let originalNextSibling = null;
  let originalStyle = "";

  const isTouchLike = (e) => {
    if (!e) return false;
    if (e.pointerType)
      return e.pointerType === "touch" || e.pointerType === "pen";
    return (
      (navigator && navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      false
    );
  };

  const onPointerMove = (e) => {
    if (!isPointerDragging) return;
    if (isTouchLike(e)) e.preventDefault();

    const x = e.clientX - pointerOffsetX;
    const y = e.clientY - pointerOffsetY;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };

  const onPointerUp = (e) => {
    if (!isPointerDragging) return;
    if (isTouchLike(e)) e.preventDefault();
    isPointerDragging = false;

    try {
      el.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    el.classList.remove("dragging");
    el.style.cssText = originalStyle;

    // Drop-Target finden
    const under = document.elementFromPoint(e.clientX, e.clientY);
    handle_drop_target(under);

    // Falls Karte nirgends hingehört: zurück zum Pool oder ursprünglicher Position
    if (el.parentElement === document.body) {
      if (dnd_pool) dnd_pool.appendChild(el);
      else if (originalParent) {
        if (
          originalNextSibling &&
          originalNextSibling.parentElement === originalParent
        ) {
          originalParent.insertBefore(el, originalNextSibling);
        } else {
          originalParent.appendChild(el);
        }
      }
    }

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };

  el.addEventListener("pointerdown", (e) => {
    if (!isTouchLike(e)) return; // Desktop bleibt bei HTML5 DnD
    if (el.classList.contains("solved")) return;

    e.preventDefault();
    isPointerDragging = true;

    originalParent = el.parentElement;
    originalNextSibling = el.nextElementSibling;
    originalStyle = el.getAttribute("style") || "";

    const rect = el.getBoundingClientRect();
    pointerOffsetX = e.clientX - rect.left;
    pointerOffsetY = e.clientY - rect.top;

    el.classList.add("dragging");
    el.style.position = "fixed";
    el.style.zIndex = "9999";
    el.style.width = `${rect.width}px`;
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;

    document.body.appendChild(el);

    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: false });
    window.addEventListener("pointercancel", onPointerUp, { passive: false });
  });

  return el;
}

function enable_dnd_drop_targets() {
  if (dnd_pool) {
    dnd_pool.addEventListener("dragover", (e) => e.preventDefault());
    dnd_pool.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const card = document.getElementById(id);
      if (!card || card.classList.contains("solved")) return;
      dnd_pool.appendChild(card);
    });
  }

  if (!dnd_slots) return;
  const slotEls = dnd_slots.querySelectorAll(".dnd-slot");
  slotEls.forEach((slot) => {
    slot.addEventListener("dragover", (e) => e.preventDefault());
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const card = document.getElementById(id);
      if (!card || card.classList.contains("solved")) return;

      const cardsInSlot = slot.querySelectorAll(".dnd-card");
      if (cardsInSlot.length >= 2) return;

      // Entferne Slot-Label-Text beim ersten Drop
      if (!slot.querySelector(".dnd-card")) {
        const slotNum = slot.getAttribute("data-slot") || "";
        slot.innerHTML = slotNum ? `Paar ${slotNum}` : "Paar";
      }

      slot.appendChild(card);
      evaluate_dnd_slot(slot);
    });
  });
}

function set_dnd_new_button_enabled(enabled) {
  if (!btn_dnd_new_round) return;
  btn_dnd_new_round.classList.toggle("inactive", !enabled);
}

function build_dnd_batches_from_pack(pack) {
  if (!pack || !Array.isArray(pack.word_DB)) return [];
  const words = pack.word_DB.filter(is_valid_dnd_vocable);
  shuffle_in_place(words);
  return chunk_array(words, 4)
    .filter((b) => b.length > 0)
    .slice(0, 5);
}

function get_next_nonempty_dnd_round_index(fromIndex) {
  for (let i = fromIndex + 1; i < dndRoundBatches.length; i++) {
    const batch = Array.isArray(dndRoundBatches[i])
      ? dndRoundBatches[i].filter(is_valid_dnd_vocable)
      : [];
    if (batch.length > 0) return i;
  }
  return -1;
}

function open_dnd_result_modal() {
  const titleEl = document.getElementById("dnd_result_title");
  const scoreEl = document.getElementById("dnd_result_score");
  const correctEl = document.getElementById("dnd_result_correct");
  const wrongEl = document.getElementById("dnd_result_wrong");
  const roundsEl = document.getElementById("dnd_result_rounds");

  const hasWords = dndTotalPairs > 0;
  const win = hasWords ? dndPoints >= Math.ceil(dndMaxScore * 0.6) : false;

  if (modal_dnd_result) {
    modal_dnd_result.classList.toggle("win", win);
    modal_dnd_result.classList.toggle("lose", !win);
  }

  if (titleEl) titleEl.textContent = win ? "Gewonnen" : "Verloren";
  if (scoreEl) scoreEl.textContent = String(dndPoints);
  if (correctEl) correctEl.textContent = `Richtig: ${dndCorrectPairs}`;
  if (wrongEl) wrongEl.textContent = `Daneben: ${dndWrongAttempts}`;
  if (roundsEl) roundsEl.textContent = `Runden: ${dndRoundsTotal}`;

  set_dnd_last_result({
    finishedAt: new Date().toISOString(),
    score: dndPoints,
    maxScore: dndMaxScore,
    correctPairs: dndCorrectPairs,
    wrongAttempts: dndWrongAttempts,
    rounds: dndRoundsTotal,
    outcome: win ? "win" : "lose",
  });
  render_dnd_last_result();

  dndSessionActive = false;
  Modal.open_modal(modal_dnd_result);
}

function check_dnd_round_complete() {
  const scope = modal_dnd_test || document;
  const allCards = scope.querySelectorAll(".dnd-card");
  const totalCards = allCards.length;
  const unsolvedCards = Array.from(allCards).filter(
    (c) => !c.classList.contains("solved"),
  ).length;

  const doneByCounter =
    dndRoundPairCount > 0 && dndSolvedPairsThisRound >= dndRoundPairCount;
  const doneByDom = totalCards > 0 && unsolvedCards === 0;

  if (doneByCounter || doneByDom) {
    const nextIndex = get_next_nonempty_dnd_round_index(dndRoundIndex);
    if (nextIndex === -1) {
      open_dnd_result_modal();
    } else {
      set_dnd_new_button_enabled(true);
    }
  }
}

function evaluate_dnd_slot(slot) {
  const cards = slot.querySelectorAll(".dnd-card");
  if (cards.length !== 2) return;

  const [a, b] = cards;
  const same = a.dataset.pairId && a.dataset.pairId === b.dataset.pairId;

  if (same) {
    dndPoints += 2;
    dndCorrectPairs += 1;
    dndSolvedPairsThisRound += 1;
    slot.classList.add("correct");
    a.classList.add("solved");
    b.classList.add("solved");
    a.draggable = false;
    b.draggable = false;
    update_dnd_score();
    check_dnd_round_complete();
    return;
  }

  dndPoints -= 1;
  dndWrongAttempts += 1;
  update_dnd_score();

  // Bei falschem Paar: beide Karten zurück in den Pool
  if (dnd_pool) {
    dnd_pool.appendChild(a);
    dnd_pool.appendChild(b);
  }
}

function start_dnd_round() {
  if (!dnd_pool || !dnd_slots) return;

  dndSolvedPairsThisRound = 0;
  dndRoundPairCount = 0;

  dndRoundVocables = (dndRoundBatches[dndRoundIndex] || []).filter(
    is_valid_dnd_vocable,
  );

  // Falls durch Datenbereinigung/Änderungen eine Runde leer ist: überspringen oder Spiel beenden
  if (dndRoundVocables.length < 1) {
    if (dndRoundIndex + 1 >= dndRoundsTotal) {
      open_dnd_result_modal();
      return;
    }
    dndRoundIndex += 1;
    start_dnd_round();
    return;
  }

  clear_dnd_board();
  enable_dnd_drop_targets();
  set_dnd_new_button_enabled(false);

  const cards = [];
  for (const voc of dndRoundVocables) {
    if (!is_valid_dnd_vocable(voc)) continue;
    cards.push({
      id: `dnd_${voc.wordId}_own`,
      text: voc.ownLangWord,
      pairId: voc.wordId,
    });
    cards.push({
      id: `dnd_${voc.wordId}_for`,
      text: voc.foreignLangWord,
      pairId: voc.wordId,
    });
  }

  dndRoundPairCount = Math.floor(cards.length / 2);
  if (dndRoundPairCount < 1) {
    if (dndRoundIndex + 1 >= dndRoundsTotal) {
      open_dnd_result_modal();
      return;
    }
    dndRoundIndex += 1;
    start_dnd_round();
    return;
  }

  shuffle_in_place(cards);
  for (const c of cards) dnd_pool.appendChild(make_dnd_card(c));
  update_dnd_score();
}

function start_dnd_session() {
  const pack = get_current_pack();
  if (!pack || !dnd_pool || !dnd_slots) return;

  migrate_and_sync_leitner_data();

  const words = Array.isArray(pack.word_DB) ? pack.word_DB : [];
  const validWords = words.filter(is_valid_dnd_vocable);
  if (validWords.length < 1) {
    showToast("Bitte erst Wörter anlegen.");
    return;
  }

  dndSessionActive = true;
  dndPoints = 0;
  dndCorrectPairs = 0;
  dndWrongAttempts = 0;
  dndRoundIndex = 0;
  dndRoundBatches = build_dnd_batches_from_pack(pack);
  dndRoundsTotal = dndRoundBatches.length;
  dndTotalPairs = dndRoundBatches.reduce((sum, b) => sum + b.length, 0);
  dndMaxScore = dndTotalPairs * 2;

  if (dndRoundsTotal < 1) {
    showToast("Bitte erst Wörter anlegen.");
    return;
  }

  start_dnd_round();
}

if (btn_box_1)
  btn_box_1.addEventListener("click", () => start_cards_for_box(1));
if (btn_box_2)
  btn_box_2.addEventListener("click", () => start_cards_for_box(2));
if (btn_box_3)
  btn_box_3.addEventListener("click", () => start_cards_for_box(3));
if (btn_box_4)
  btn_box_4.addEventListener("click", () => start_cards_for_box(4));

if (btn_card_known)
  btn_card_known.addEventListener("click", () => {
    if (get_current_learning_mode() === "type") return;
    if (!cardBackSideIsVisible) return;
    answer_current_card(true);
  });
if (btn_card_unknown)
  btn_card_unknown.addEventListener("click", () => {
    if (get_current_learning_mode() === "type") return;
    if (!cardBackSideIsVisible) return;
    answer_current_card(false);
  });

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

    const normalizedCode = String(selectedCode).trim().toLowerCase();
    const normalizedName = String(selectedName).trim().toLowerCase();
    const alreadyExists = (voc_Saveobject?.languagePacks || []).some((p) => {
      const code = String(p?.language_code || "")
        .trim()
        .toLowerCase();
      const name = String(p?.language_Name || "")
        .trim()
        .toLowerCase();
      return (
        (normalizedCode && code === normalizedCode) ||
        (normalizedName && name === normalizedName)
      );
    });

    if (alreadyExists) {
      showToast("Diese Sprache existiert bereits.");
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

    const normalizedCode = String(language_code || "")
      .trim()
      .toLowerCase();
    const normalizedName = String(languageName || "")
      .trim()
      .toLowerCase();
    const alreadyExists = (voc_Saveobject?.languagePacks || []).some((p) => {
      const code = String(p?.language_code || "")
        .trim()
        .toLowerCase();
      const name = String(p?.language_Name || "")
        .trim()
        .toLowerCase();
      return (
        (normalizedCode && code === normalizedCode) ||
        (normalizedName && name === normalizedName)
      );
    });

    if (alreadyExists) {
      showToast("Diese Sprache existiert bereits.");
      return;
    }

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
        update_card_menu_counts();
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

    const normalize_word = (s) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    if (normalize_word(word) !== "" && normalize_word(translation) !== "") {
      for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
        if (voc_Saveobject.languagePacks[i].id === langId) {
          const pack = voc_Saveobject.languagePacks[i];
          const nOwn = normalize_word(word);
          const nFor = normalize_word(translation);
          const alreadyExists = (pack.word_DB || []).some((w) => {
            const eOwn = normalize_word(w?.ownLangWord);
            const eFor = normalize_word(w?.foreignLangWord);
            // Mindestens das eigene Wort doppelt verhindern; exaktes Paar ebenfalls.
            return (
              (nOwn && eOwn === nOwn) ||
              (nOwn && nFor && eOwn === nOwn && eFor === nFor)
            );
          });

          if (alreadyExists) {
            showToast("Diese Vokabel existiert bereits.");
            return;
          }

          const newVoc = new Vocable(word, translation, create_Id(), 0);
          pack.word_DB.push(newVoc);
          // Jedes neue Wort startet in Fach 1
          if (!Array.isArray(pack.level_1_DB)) {
            pack.level_1_DB = [];
          }
          pack.level_1_DB.push(newVoc);
          dedupe_word_across_boxes(pack);
          updateSaveObj(voc_Saveobject);
          update_card_menu_counts();
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
          update_card_menu_counts();
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
  update_settings_language_delete_ui();
  Modal.open_modal(modal_settings_menu);
});

function update_settings_language_delete_ui() {
  if (!btn_delete_language) return;
  const pack = get_current_pack();
  const canDelete = Boolean(pack && voc_Saveobject?.currentId);
  btn_delete_language.hidden = !canDelete;
  if (canDelete) {
    btn_delete_language.textContent = `Sprachmodul löschen (${pack.language_Name})`;
  } else {
    btn_delete_language.textContent = "Sprachmodul löschen";
  }
}

if (btn_delete_language) {
  btn_delete_language.addEventListener("click", () => {
    const pack = get_current_pack();
    if (!pack) {
      showToast("Kein aktives Sprachmodul ausgewählt.");
      update_settings_language_delete_ui();
      return;
    }

    const confirmDelete = window.confirm(
      `Soll das Sprachmodul "${pack.language_Name}" wirklich gelöscht werden?\n\nAlle zugehörigen Vokabeln und Karteikartenstände werden entfernt.`,
    );
    if (!confirmDelete) return;

    const langId = pack.id;
    voc_Saveobject.languagePacks = (voc_Saveobject.languagePacks || []).filter(
      (p) => p?.id !== langId,
    );
    if (voc_Saveobject.currentId === langId) {
      voc_Saveobject.currentId = "";
      voc_Saveobject.showLanguage = "";
    }

    updateSaveObj(voc_Saveobject);
    location.reload();
  });
}

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
  if (get_current_learning_mode() === "type" && !typedAnswerCheckedThisCard) {
    showToast("Bitte erst die Antwort tippen.");
    return;
  }
  card.classList.toggle("is-flipped");
  if (cardBackSideIsVisible === false) {
    cardBackSideIsVisible = true;
    set_card_answer_buttons_visible(true);
  } else {
    cardBackSideIsVisible = false;
    set_card_answer_buttons_visible(false);
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
