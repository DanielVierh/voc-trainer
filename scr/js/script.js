const btn_add_new_lang = document.getElementById('btn_add_new_lang');
const modal_language_menu = document.getElementById('modal_language_menu');
const addVocable = document.getElementById('addVocable');
const modal_new_words = document.getElementById('modal_new_words');
const modal_words = document.getElementById('modal_words');
const showMyVocables = document.getElementById('showMyVocables');
const btn_settings = document.getElementById('btn_settings');
const label_transl = document.getElementById('label_transl');
const close_until_langs = document.querySelectorAll('.close-Modal');
const wordsWrapper = document.getElementById('wordsWrapper');
const modal_cards_menu = document.getElementById('modal_cards_menu');
const btn_open_cardmenu = document.getElementById('btn_open_cardmenu');
const modal_random_cards = document.getElementById('modal_random_cards');
const btn_start_random_cards = document.getElementById('btn_start_random_cards');
const modal_mini = document.getElementById('modal_mini');
const btn_close_miniModal = document.getElementById('btn_close_miniModal');
const btn_audio_output = document.getElementById('btn_audio_output');
const btn_delete_word = document.getElementById('btn_delete_word');


let cardBackSideIsVisible = false;
let allVocables = [];
let languages = [];
let modal_is_visible = false;
let current_language_code = ''
let current_word = '';
let current_word_id = -1;


let voc_Saveobject = {
    languagePacks: [],
    showLanguage: ''
}

//////////////////////////////
//*ANCHOR - Init
//////////////////////////////

window.onload = init();

function init() {
    load_Data_from_LocalStorage();
    toggle_add_button();
}

//////////////////////////////
//*ANCHOR -  Load Data
//////////////////////////////

function load_Data_from_LocalStorage() {
    if (localStorage.getItem('vocTrainer_save_Object') != null) {
        voc_Saveobject = JSON.parse(localStorage.getItem('vocTrainer_save_Object'));
        try {
            renderLanguages();
        } catch (error) {

        }
    } else {
        // Keine Einträge vorhanden
        console.warn('Keine Daten geladen')
    }
}

//////////////////////////////
//*ANCHOR - Save Into Local Storage
//////////////////////////////
const save_Data_into_LocalStorage = () => {
    localStorage.setItem('vocTrainer_save_Object', JSON.stringify(voc_Saveobject));
}


const add_Language_to_SaveObj = (newlanguage) => {
    voc_Saveobject.languagePacks.push(newlanguage)
    save_Data_into_LocalStorage()
}

const updateSaveObj = (svObj) => {
    console.log('New Saveobj', svObj);
    voc_Saveobject = svObj;
    save_Data_into_LocalStorage();
}



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
    static modal_list = [modal_language_menu, modal_new_words, modal_words, modal_cards_menu, modal_random_cards];
    static open_modal(modal) {
        this.close_all_modals();
        modal.classList.add('active');
        modal_is_visible = true;
        toggle_add_button();
    }

    static close_all_modals() {
        for (let i = 0; i < this.modal_list.length; i++) {
            this.modal_list[i].classList.remove('active');
            modal_is_visible = false;
            toggle_add_button();
        }
    }
}


close_until_langs.forEach((btn) => {
    btn.addEventListener('click', () => {
        Modal.open_modal(modal_language_menu);
    })
})

btn_open_cardmenu.addEventListener('click', ()=> {
    Modal.open_modal(modal_cards_menu);
})
btn_start_random_cards.addEventListener('click', ()=> {
    Modal.open_modal(modal_random_cards);
    get_random_card();
})

//////////////////////////////
//*ANCHOR - Toggle Add Button
//////////////////////////////
function toggle_add_button() {
    if (modal_is_visible === true) {
        setTimeout(() => {
            addVocable.classList.add('active');
        }, 300);
    } else {
        addVocable.classList.remove('active');
    }
}


btn_add_new_lang.addEventListener('click', () => {
    create_new_languge_pack();
})

//////////////////////////////
//*ANCHOR - Generate Language Package
//////////////////////////////
function create_new_languge_pack() {
    const languageName = window.prompt("Welche Sprache möchtest du lernen?");

    if (languageName !== null && languageName.length > 4) {
        const language_code = window.prompt("Gib den Sprachcode ein. Z.B. en für Englisch, es für Spanisch");
        const newLang = new LanguagePack(create_Id(), languageName, language_code);
        console.log('newLang', newLang);
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
        languageButton.classList.add('languageBtn')
        languageButton.id = voc_Saveobject.languagePacks[i].id;

        languageButton.onclick = function () {
            voc_Saveobject.showLanguage = this.innerHTML;
            voc_Saveobject.currentId = this.id;
            save_Data_into_LocalStorage();
            setTimeout(() => {
                Modal.open_modal(modal_language_menu);
                lngLabel.innerHTML = this.innerHTML;
                document.getElementById('card_lang_label').innerHTML = this.innerHTML;
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
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '#', 'A', 'B', 'C', 'D', '!', 'E', '$'];
    let id = '';
    for (let i = 1; i <= 15; i++) {
        const randomNumb = parseInt(Math.random() * chars.length)
        id = id + chars[randomNumb]
    }
    return id;
}


if (addVocable) {
    try {
        addVocable.addEventListener('click', () => {
            Modal.open_modal(modal_new_words);
            inp_lang_short_code.value = current_language_code

        })
    } catch (error) {

    }
}


//////////////////////////////
//* ANCHOR Fetch request to translate text
//////////////////////////////
async function fetchTranslation(sourceLang, targetLang, sourceText) {
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
        sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching translation:', error);
        return null;
    }
}



//////////////////////////////
//* ANCHOR Translate Text 
//////////////////////////////

if (btn_translate) {
    btn_translate.addEventListener('click', () => {
        let sourceLang = "de";
        let targetLang = "en";
        let sourceText = '';

        if (inp_word_own.value !== '') {
            if (inp_lang_short_code.value !== '') {
                targetLang = inp_lang_short_code.value;
            }
            sourceText = inp_word_own.value;

            fetchTranslation(sourceLang, targetLang, sourceText)
                .then(translation => {
                    const translatedText = translation[0][0][0]
                    inp_word_foreign.value = translatedText;
                })
                .catch(error => {
                    console.error("Translation error:", error);
                });
        } else if (inp_word_foreign.value !== '') {
            if (inp_lang_short_code.value !== '') {
                sourceLang = inp_lang_short_code.value;
            }
            sourceText = inp_word_foreign.value;
            targetLang = "de";
            fetchTranslation(sourceLang, targetLang, sourceText)
                .then(translation => {
                    const translatedText = translation[0][0][0]
                    inp_word_own.value = translatedText;
                })
                .catch(error => {
                    console.error("Translation error:", error);
                });
        }
    })
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

        if (word.length !== '' && translation !== '') {
            for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
                if (voc_Saveobject.languagePacks[i].id === langId) {
                    voc_Saveobject.languagePacks[i].word_DB.push(new Vocable(word, translation, create_Id(), 0))
                    updateSaveObj(voc_Saveobject);
                    break;
                }
            }
            inp_word_own.value = '';
            inp_word_foreign.value = '';
        } else {
            alert("Beide Felder müssen ausgefüllt sein")
        }
    })
}

//////////////////////////////
//*ANCHOR -  Show words
//////////////////////////////

showMyVocables.addEventListener('click', () => {
    Modal.open_modal(modal_words);
    showWords();
})

function showWords() {
    const langId = voc_Saveobject.currentId;

    for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
        if (voc_Saveobject.languagePacks[i].id === langId) {
            const wordbook = voc_Saveobject.languagePacks[i].word_DB;
            if (wordbook.length === 0) {
                wordsWrapper.innerHTML = 'Keine Vokabeln vorhanden';
            } else {
                wordsWrapper.innerHTML = '';
            }
            for (let j = 0; j < wordbook.length; j++) {
                let row = document.createElement('div')
                row.classList.add("row")

                let cell = document.createElement('div')
                cell.classList.add("cell")
                cell.innerHTML = wordbook[j].ownLangWord
                cell.id = wordbook[j].wordId

                let cellr = document.createElement('div')
                cellr.classList.add("cell")
                cellr.classList.add("cellr")
                cellr.innerHTML = wordbook[j].foreignLangWord
                cellr.id = wordbook[j].wordId
                cellr.addEventListener('click', () => {
                    current_word = wordbook[j].foreignLangWord;
                    current_word_id = wordbook[j].wordId;
                    modal_mini.classList.add('active');
                    document.getElementById('word_minimodal').innerHTML = current_word;
                })

                row.appendChild(cell)
                row.appendChild(cellr)

                wordsWrapper.appendChild(row)

            }
            break;
        }
    }
}

//* btn to delete word

btn_delete_word.addEventListener('click', ()=> {
    const langId = voc_Saveobject.currentId;
    for (let i = 0; i < voc_Saveobject.languagePacks.length; i++) {
        if (voc_Saveobject.languagePacks[i].id === langId) {
            for (let j = 0; j < voc_Saveobject.languagePacks[i].word_DB.length; j++) {
                if(current_word_id === voc_Saveobject.languagePacks[i].word_DB[j].wordId) {
                    voc_Saveobject.languagePacks[i].word_DB.splice(j, 1);
                    save_Data_into_LocalStorage();
                    Modal.close_all_modals();
                    Modal.open_modal(modal_words);
                    showWords();
                    modal_mini.classList.remove('active');
                    break;
                }
            }
        }
    }
})

//* Btn to trigger text to speech
btn_audio_output.addEventListener('click', ()=> {
    text_to_speech(current_language_code, current_word);
})

//* Close mini Modal
btn_close_miniModal.addEventListener('click', ()=> {
    modal_mini.classList.remove('active');
})


//////////////////////////////
//*ANCHOR - Text to Speech
//////////////////////////////
function text_to_speech(lang_code, text) {
    var msg = new SpeechSynthesisUtterance();
    const pitch_numb = getRandomInt(3);

    msg.text = text;
    msg.lang = lang_code;
    msg.volume = 1; // 0 to 1
    msg.rate = .9; // 0.1 to 10
    msg.pitch = pitch_numb; //0 to 2

    speechSynthesis.speak(msg);
}


btn_settings.addEventListener('click', () => {
    const confirm = window.confirm('Sollen alle Daten gelöscht werden?')
    if (confirm) {
        delete_local_storage()
    }
})

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

const card = document.querySelector('.card');
if (card) {
    card.addEventListener('click', () => {
        flipCard()
    });
}

function flipCard() {
    card.classList.toggle('is-flipped');
    if(cardBackSideIsVisible === false) {
        cardBackSideIsVisible = true;
    }else {
        cardBackSideIsVisible = false;
    }
}

function  get_random_card() {
    const rnd_card_numb = getRandomInt(allVocables.length);
    document.getElementById('crdFront').innerHTML = allVocables[rnd_card_numb].ownLangWord;
    document.getElementById('crdBack').innerHTML = allVocables[rnd_card_numb].foreignLangWord;
}

document.getElementById('btn_next_card').addEventListener('click', ()=> {
    card.classList.remove('is-flipped');
    card.classList.remove('fly-in');
    setTimeout(() => {
        card.classList.add('fly-in');
        get_random_card();
    }, 200);
})