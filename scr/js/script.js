const btn_add_new_lang = document.getElementById('btn_add_new_lang');
const modal_language_menu = document.getElementById('modal_language_menu');
let cardBackSideIsVisible = false;
let allVocables = [];
let languages = [];
let modal_is_visible = false;


let voc_Saveobject = {
    languagePacks: [],
    showLanguage: ''
}



window.onload = init();

function init() {
    load_Data_from_LocalStorage()
}

// #####################################################################################
// Load Data

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

const save_Data_into_LocalStorage = ()=> {
    localStorage.setItem('vocTrainer_save_Object', JSON.stringify(voc_Saveobject));
}

//Exported Functions
const add_Language_to_SaveObj = (newlanguage)=> {
    voc_Saveobject.languagePacks.push(newlanguage)
    save_Data_into_LocalStorage()
}

const updateSaveObj = (svObj) => {
    console.log('New Saveobj', svObj);
    voc_Saveobject = svObj;
    save_Data_into_LocalStorage();
}



/**
 * #####################################################################################
 * Language Class
 */
class LanguagePack {
    constructor(id, language_Name) {
        this.id = id;
        this.language_Name = language_Name;
        this.level_1_DB = [];
        this.level_2_DB = [];
        this.level_3_DB = [];
        this.level_4_DB = [];
        this.testfail_DB = [];
        this.word_DB = [];
    }
}

class Modal {
    static modal_list = [modal_language_menu];
    static open_modal(modal) {
        this.close_all_modals();
        modal.classList.add('active');
        modal_is_visible = true;
    }

    static close_all_modals() {
        for (let i = 0; i < this.modal_list.length; i++) {
            this.modal_list[i].classList.remove('active');
            modal_is_visible = false;
        }
    }
}


btn_add_new_lang.addEventListener('click', ()=> {
    create_new_languge_pack();
})

//? Generate Language Package
function create_new_languge_pack() {
    const languageName = window.prompt("Welche Sprache möchtest du lernen?")

    if (languageName !== null && languageName.length > 4) {
        const newLang = new LanguagePack(create_Id(), languageName)
        console.log('newLang', newLang);
        add_Language_to_SaveObj(newLang);
        window.location.reload();
    }
}


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
            }, 200);
        };
        langContainer.appendChild(languageButton);
    }
}


const create_Id = ()=> {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '#', 'A', 'B', 'C', 'D', '!', 'E', '$'];
    let id = '';
    for (let i = 1; i <= 15; i++) {
        const randomNumb = parseInt(Math.random() * chars.length)
        id = id + chars[randomNumb]
    }
    return id;
}