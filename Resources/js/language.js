let allLangSwitchButtons = document.querySelectorAll('.js-change-language');
allLangSwitchButtons.forEach(langSwitchButton => {
    let langKey = langSwitchButton.getAttribute('data-langKey');
    langSwitchButton.addEventListener('click', function() {
        changeLanguage(langKey);
    });
});

// function to update the language switch dropdown icon by data-attr
function updateLangSwitchDropdown(lang) {
    let langSwitchDropdown = document.querySelector('.js-language-switch');

    langSwitchDropdown.setAttribute('data-lang', lang);
}

// Function to update content based on selected language
function updateContent(langData, lang) {
    updateLangSwitchDropdown(lang);

    setTimeout(() => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = JSON.parse(JSON.stringify(langData[key]));
        });

        document.querySelectorAll('[data-tooltip-i18n]').forEach(element => {
            const key = element.getAttribute('data-tooltip-i18n');
            element.setAttribute('data-bs-title', JSON.parse(JSON.stringify(langData[key])));
           
        });
    }, 500);

    setTimeout(() => {
        // initialize tooltips again after lang switch
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 700);
}

// Function to set the language preference into localStorage
function setLanguagePreference(lang) {
    localStorage.setItem('language', lang);
}

// Function to fetch language data
async function fetchLanguageData(lang) {
    const response = await fetch(`/Resources/language/${lang}.json`);
    return response.json();
}

// Function to change language
async function changeLanguage(lang) {
    setLanguagePreference(lang);
    
    const langData = await fetchLanguageData(lang);
    
    updateContent(langData, lang);
}

// Call updateContent() on page load
window.addEventListener('DOMContentLoaded', async () => {
    const userPreferredLanguage = localStorage.getItem('language') || 'en';
    const langData = await fetchLanguageData(userPreferredLanguage);

    updateContent(langData, userPreferredLanguage);
});
