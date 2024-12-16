/**********************
 *  Global Functions  *
 **********************/
// Copyright year setting
var currentYear = new Date().getFullYear();
document.getElementById("year").innerHTML = currentYear;
document.getElementById("year2").innerHTML = currentYear;

// Capitalize letters
function capitalization(string) {
    // Split the string at double hyphens first to preserve them
    let doubleHyphenParts = string.split('--');
    
    // Process each part separately
    for (let i = 0; i < doubleHyphenParts.length; i++) {
        let part = doubleHyphenParts[i];
        
        // Split the part at single hyphens
        let parts = part.split('-');
        
        // Capitalize the first letter of each part except the first one
        for (let j = 1; j < parts.length; j++) {
            parts[j] = parts[j].charAt(0).toUpperCase() + parts[j].slice(1);
        }
        
        // Join the parts with a space
        doubleHyphenParts[i] = parts.join(' ');
        
        // Capitalize the first letter of the resulting string
        doubleHyphenParts[i] = doubleHyphenParts[i].charAt(0).toUpperCase() + doubleHyphenParts[i].slice(1);
    }
    
    // Join the double hyphen parts with the double hyphen
    let transformedWord = doubleHyphenParts.join('--');
    
    return transformedWord;
}

// Footer
const scrollTopButton = document.getElementById("scrollTop");

// Set Scroll up Button
scrollTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});  

// Choose element
const pokemon = document.getElementById('searchInput');
const moveName = document.getElementById('moveName');
const itemName = document.getElementById('itemName');
const clearButton = document.getElementById('clearButton');
const element = pokemon || moveName || itemName;

// Move to search bar when input "/"
document.addEventListener('keydown', function (event) {
    if (event.key === '/') {
      event.preventDefault();
      element.focus();
    }
});

let url;
if (element === pokemon) url = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon.csv';
else if(element === moveName) url = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/moves.csv';
else if(element === itemName) url = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/items.csv';
else url = '';

// Fetch Pokémon data from the CSV file
let pokemonNames = [];

fetch(url)
.then(response => response.text())
.then(data => {
    const pokemonData = data.split('\n').slice(1); // Exclude header row
    pokemonNames = pokemonData.map(row => {
        const columns = row.split(',');
        // Extract and trim the second column (identifier) as a string, handle undefined
        const name = columns[1] ? columns[1].toString().trim() : '';
        return name !== '' ? name : null; // Exclude empty names
    }).filter(name => name !== null); // Remove null values
})
.catch(error => console.error('Error fetching Pokémon data:', error));

// Function to handle voice recognition using microphone
function voiceRecognition() {
    const microphone = document.getElementById("microphone");

    // Check if the browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();

        // Set properties for the recognition
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        // Start recognition
        recognition.start();
        microphone.style.background = 'var(--lightpokemoncolor, #00d6fa)';

        // Voice recognition is successful
        recognition.onresult = function(event) {
            const result = event.results[0][0].transcript.toLowerCase().replace(/\s+/g, '-');
            const mostRelatedWord = findMostRelatedWord(result, pokemonNames);
            microphone.style.background = 'var(--pokemoncolor, #1288f8)';

            element.value = mostRelatedWord;
            if(element===pokemon) performSearch();
            else if(element===moveName) searchMove();
            else searchItem();

            clearButton.style.display = 'block';
        };

        // Voice recognition is ended
        recognition.onend = function() {
            microphone.style.background = 'var(--pokemoncolor, #1288f8)';
        };

        // Voice recognition errors
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            microphone.style.background = 'var(--pokemoncolor, #1288f8)';

            alert('Speech recognition failed. Please try again.');
        };
    } else {
        alert('Web Speech API is not supported in this browser. Please use a different browser.');
        microphone.style.background = 'var(--pokemoncolor, #1288f8)';
    }
}

// Find the most related word from the voice recognition using LevenshteinDistance
function findMostRelatedWord(voiceInput, pokemonNames) {
    // Filter Pokémon names based on the user's input and flexible matching
    const suggestions = pokemonNames.filter(name =>
        name.toLowerCase()
    );
        
    // Sort suggestions by Levenshtein distance and then alphabetically
    const sortedSuggestions = suggestions.sort((a, b) => {
        const distanceA = levenshteinDistance(a, voiceInput);
        const distanceB = levenshteinDistance(b, voiceInput);
        
        if (distanceA !== distanceB) {
            return distanceA - distanceB;
        } else {
            return a.localeCompare(b);
        }
    });
        
    return sortedSuggestions[0];
}

// Trace whether TTS is on or off
let currentUtterance = null;
window.addEventListener('beforeunload', function () {
    if (currentUtterance) {
        // If ongoing speech, stop it before leaving the page
        window.speechSynthesis.cancel();
        currentUtterance = null;
    }
});

// TTS Trivia
function speakText(textToSpeak) {
    // Check if there is an ongoing speech
    if (currentUtterance) {
        // Stop the current speech
        window.speechSynthesis.cancel();
        currentUtterance = null;
        return;
    }

    // Wrap the voice loading in a promise
    function loadVoices() {
        return new Promise(function (resolve) {
            if (speechSynthesis.getVoices().length > 0) {
                resolve();
            } else {
                window.speechSynthesis.onvoiceschanged = function () {
                    resolve();
                };
            }
        });
    }

    // Use the promise to ensure voices are loaded before proceeding
    loadVoices().then(function () {
        var utterance = new SpeechSynthesisUtterance(textToSpeak);

        var selectedVoice = speechSynthesis.getVoices().find(function (voice) {
            return voice.name === 'Microsoft Mark - English (United States)';
        });

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.error('Voice not found.');
            return;
        }

        // Set the speed
        utterance.rate = 1.0;

        // Speak the text
        window.speechSynthesis.speak(utterance);

        // Update the currentUtterance variable
        currentUtterance = utterance;

        // Listen for the end of speech
        utterance.onend = function () {
            // Reset the currentUtterance variable when speech ends
            currentUtterance = null;
        };
    });
}

// Random Item next to the title
async function newItem(){
    try{
        const url = `https://pokeapi.co/api/v2/item/`;
        const response = await fetch(url);
        const data = await response.json();
        const id = Math.floor(Math.random()*data.count);
        
        const itemUrl = `${url}${id}/`;

        const itemResponse = await fetch(itemUrl);
        if(!itemResponse.ok) throw new Error('Fail to Fetch');
        
        const item = await itemResponse.json();
        if(item.sprites.default){
            randomItem.src = item.sprites.default;
            randomItem.title = item.name
        }else{
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png';
            randomItem.title = "lucky-egg";
        }
    } catch(error){
        randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png';
        randomItem.title = "lucky-egg";
    }
}

function performRandomSearch() {
    var randomNumber = Math.floor(Math.random() * pokemonNames.length) + 1;
    element.value = pokemonNames[randomNumber];
    if(element === pokemon) performSearch();
    else if(element === moveName) searchMove();
    else searchItem();
    clearButton.style.display = 'block';
}

document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === '`') {
        event.preventDefault();
        performRandomSearch();
    }
});

const shuffle = document.getElementById('shuffle');
if(shuffle){
    shuffle.addEventListener('click', () => {
        performRandomSearch();
    });
}

// Search Dropdown Highlight
let currentFocus = -1;

// Pokemon Dropdown Suggestion
const pokemonDropdown = document.getElementById('pokemonDropdown');
if(element){
    element.addEventListener('input', () => {
        if (element.value.length >= 1) {
            suggestPokemon(pokemonNames);
            clearButton.style.display = 'block';
        } else {
            // Hide dropdown if input is empty
            pokemonDropdown.style.display = 'none';
            clearButton.style.display = 'none';
        }
    });

    element.addEventListener('keydown', handleKeydown);
    element.addEventListener('click', () => {
        if (element.value.length >= 1) {
            suggestPokemon(pokemonNames);
            clearButton.style.display = 'block';
        } else {
            // Hide dropdown if input is empty
            pokemonDropdown.style.display = 'none';
            clearButton.style.display = 'none';
        }
        scrollIntoView();
    });
}

if(pokemonDropdown){
    // Hide the dropdown when clicking outside of it
    window.addEventListener('click', (event) => {
        if (!event.target.matches(`#${element.id}`)) {
            pokemonDropdown.style.display = 'none';
        }
    });
}

// Clear context in search input
function clearInput() {
    element.value = '';
    pokemonDropdown.style.display = 'none';
    clearButton.style.display = 'none';
}

// Function to calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const lenStr1 = str1.length + 1;
    const lenStr2 = str2.length + 1;

    // Create a matrix to store the distances
    const matrix = new Array(lenStr1);
    for (let i = 0; i < lenStr1; i++) {
        matrix[i] = new Array(lenStr2);
        matrix[i][0] = i;
    }

    for (let j = 0; j < lenStr2; j++) {
        matrix[0][j] = j;
    }

    // Fill in the matrix with the minimum distances
    for (let i = 1; i < lenStr1; i++) {
        for (let j = 1; j < lenStr2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       // deletion
                matrix[i][j - 1] + 1,       // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    // The bottom-right cell of the matrix contains the Levenshtein distance
    return matrix[lenStr1 - 1][lenStr2 - 1];
}

// Function to suggest Pokémon with flexible matching and sort by relevance
function suggestPokemon(pokemonNames) {
    const searchTerm = element.value.toLowerCase().trim();

    // Escape special characters in the search term
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a regular expression for flexible matching
    const regex = new RegExp(escapedSearchTerm.split('').join('.*'));

    // Filter Pokémon names based on the user's input and flexible matching
    const suggestions = pokemonNames.filter(name =>
        name.toLowerCase().match(regex)
    );

    // Sort suggestions by Levenshtein distance and then alphabetically
    const sortedSuggestions = suggestions.sort((a, b) => {
        const distanceA = levenshteinDistance(a, searchTerm);
        const distanceB = levenshteinDistance(b, searchTerm);

        if (distanceA !== distanceB) {
            return distanceA - distanceB;
        } else {
            return a.localeCompare(b);
        }
    });
    
    updateDropdown(sortedSuggestions);
}

// Update the dropdown with suggestions
function updateDropdown(suggestions) {
    pokemonDropdown.innerHTML = '';

    // Populate the dropdown with new suggestions
    suggestions.forEach((name, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = name;
        suggestionItem.addEventListener('click', () => {
            // Set the selected suggestion in the search input and perform search
            element.value = name;
            pokemonDropdown.style.display = 'none';
            if(element===pokemon) performSearch();
            else if(element===moveName) searchMove();
            else searchItem();
        });

        // Highlight the suggestion on hover
        suggestionItem.addEventListener('mouseover', () => {
            currentFocus = index;
            addActive();
        });

        // Remove highlight when mouse moves away
        suggestionItem.addEventListener('mouseout', () => {
            currentFocus = -1;
            addActive();
        });

        pokemonDropdown.appendChild(suggestionItem);
    });

    // Display the dropdown if there are suggestions, otherwise hide it
    pokemonDropdown.style.display = suggestions.length > 0 ? 'block' : 'none';
    currentFocus = -1; // Reset the focus when updating the suggestions

    scrollIntoView();
}

// Manage Key Input (Down, Up, Enter)
function handleKeydown(event) {
    const suggestions = document.querySelectorAll('#pokemonDropdown div');

    if (event.key === 'ArrowDown' && suggestions.length > 0 && element.value.length >= 1) {
        currentFocus = (currentFocus + 1) % suggestions.length;
        element.value = suggestions[currentFocus].textContent;
        addActive();
    } else if (event.key === 'ArrowUp' && suggestions.length > 0 && element.value.length >= 1) {
        if (currentFocus === -1) {
            currentFocus = suggestions.length - 1;
        } else {
            currentFocus = (currentFocus - 1 + suggestions.length) % suggestions.length;
        }
        element.value = suggestions[currentFocus].textContent;
        addActive();
    } else if (event.key === 'Enter') {
        if (currentFocus > -1) {
            pokemonDropdown.innerHTML = '';
            pokemonDropdown.style.display = 'none';
        }
    }
    scrollIntoView();
}

// Change menu color when highlighted
function addActive() {
    const suggestions = document.querySelectorAll('#pokemonDropdown div');
    
    suggestions.forEach((item, index) => {
        if (index === currentFocus) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    scrollIntoView();
}

// Adjust the scroll position to make the focused suggestion visible
function scrollIntoView() {
    const activeItem = document.querySelector('.active');
    if (activeItem) {
        activeItem.scrollIntoView({
            block: 'nearest',
        });
    }
}

// Perform Search from Address
document.addEventListener("DOMContentLoaded", function(event) {
    // Get the search term from the URL
    var urlParams = new URLSearchParams(window.location.search);
    var searchTerm = urlParams.get('s');
    
    // Set the search input value if a search term exists
    if (searchTerm) {
        // Check the URL to determine which function to call
        var pathname = window.location.pathname;
        element.value = searchTerm;
        if (pathname.includes("info.html")) {
            performSearch();
        } else if (pathname.includes("move.html")) {
            searchMove();
        } else if (pathname.includes("item.html")) {
            searchItem();
        }
        clearButton.style.display = 'block';
    }
});

/***************
 *  info.html  *
 ***************/

// Search Bar
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Contaianer 1
const pokeHead = document.getElementById('pokemonHead');
const chooseSprite = document.getElementById('chooseSprite');
const selectSprite = document.getElementById('spriteType');
const pokemonInfo = document.getElementById('pokemonInfo');
const generations = document.getElementById('generations');
const typeAbility = document.getElementById('typeAbility');
const evolution = document.getElementById('evolution');

const filter_shiny = document.getElementById('filter_shiny');
const filter_female = document.getElementById('filter_female');
const filterCheckbox_shiny = document.getElementById('filterCheckbox_shiny');
const filterCheckbox_female = document.getElementById('filterCheckbox_female');

// Container 2
const psHead = document.getElementById('psHead');
const levelContainer = document.getElementById('levelContainer');
const numberContainer = document.getElementById('numberContainer');
const numberSlider = document.getElementById('numberSlider');
const statsHistogram = document.getElementById('statsHistogram');
const progressContainer = document.getElementById('progress-bar');
const dfHead = document.getElementById('dfHead');
const forms = document.getElementById('forms');
const heldItems = document.getElementById('heldItems');
const locations = document.getElementById('locations');
const others = document.getElementById('others');

const cbx_form = document.getElementById('cbx_form');
const filter_shinyform = document.getElementById('filter_shinyform');
const filter_back = document.getElementById('filter_back');
const filterCheckbox_shinyform = document.getElementById('filterCheckbox_shinyform');
const filterCheckbox_back = document.getElementById('filterCheckbox_back');

// Container 3
const cpHead = document.getElementById('cpHead');
const counterPokemon = document.getElementById('counterPokemon');

// Filter variables to adjust counter pokemon table
const settingButton = document.getElementById('settingButton');
const updateButton = document.getElementById('updateButton');
const scrollUpButton = document.getElementById('scrollUpButton');
const scrollDownButton = document.getElementById('scrollDownButton');

const filter_bst600 = document.getElementById('filter_bst600');
const filter_mega = document.getElementById('filter_mega');
const filter_type = document.getElementById('filter_type');
const filter_abilities = document.getElementById('filter_abilities');
const filter_baseStat = document.getElementById('filter_baseStat');

const filterCheckbox_bst600 = document.getElementById('filterCheckbox_bst600');
const filterCheckbox_mega = document.getElementById('filterCheckbox_mega');
const filterCheckbox_type = document.getElementById('filterCheckbox_type');
const filterCheckbox_abilities = document.getElementById('filterCheckbox_abilities');
const filterCheckbox_baseStat = document.getElementById('filterCheckbox_baseStat');

// Global variables for updating table
let global_types, global_statsData, global_name, global_sprites, global_speciesUrl;

// Search button click event
if(searchButton){
    searchButton.addEventListener('click', () => {
        performSearch();
    });
}

if(searchInput){
    // Add a keydown event listener to the input field
    searchInput.addEventListener('keydown', (event) => {
        // Check if the key pressed is the Enter key (key code 13)
        if (event.keyCode === 13) {
            performSearch();
            if(pokemonDropdown){
                pokemonDropdown.innerHTML = '';
                pokemonDropdown.style.display = 'none';
            }        
        }
    });
}

// translate search term
function translate(csv, searchTerm) {
    const isAlphanumeric = /^[a-zA-Z0-9]+$/u.test(searchTerm.replace(/[\W_]/g, ''));
    if (!isAlphanumeric || searchTerm === "폴리곤2" || searchTerm === "폴리곤z") {
        if(searchTerm === "폴리곤z") searchTerm = "폴리곤Z";
        return fetch(csv)
            .then((response) => response.text())
            .then((csvData) => {
                const lines = csvData.split('\n').slice(1);
                for (let i = 1; i < lines.length; i++) {
                    const currentLine = lines[i].split(',');
                    if (searchTerm === currentLine[2]) {
                        return currentLine[0];
                    }
                }
            });
    } else {
        // If it's in English, return the original searchTerm
        return Promise.resolve(searchTerm);
    }
}

// Search Pokemon Information
function performSearch() {
    let searchTerm = searchInput.value.toLowerCase().replace(/\s+/g, '-');
    if (searchTerm === '') {
        alert('Please enter a Pokémon name or ID.');
        return;
    }

    const csv = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv';
    translate(csv, searchTerm)
        .then((translatedTerm) => {
            searchTerm = translatedTerm;

            fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
                .then((response) => response.json())
                .then(async (data) => {
                    newItem();

                    // If ongoing speech, stop it when the search box is activated
                    if (currentUtterance) {
                        window.speechSynthesis.cancel();
                        currentUtterance = null;
                    }    
                    
                    const sprites = data.sprites;
                    const types = data.types.map((type) => type.type.name);
                    const statsData = data.stats.map((stat) => ({ 
                        name: stat.stat.name, 
                        value: stat.base_stat,
                        effort: stat.effort
                    }));
                    const speciesUrl = data.species.url;
                    const response = await fetch(speciesUrl);
                    const speciesData = await response.json();

                    const locUrl = data.location_area_encounters;
                    const locResponse = await fetch(locUrl);
                    const locData = await locResponse.json();
        
                    // Global variables for click events
                    global_name = data.name;
                    global_sprites = sprites;
                    global_types = types;
                    global_statsData = statsData;
                    global_speciesUrl = speciesUrl;
                    
                    const shape = speciesData.shape != null ? speciesData.shape.name : "null";
        
                    // Update theme colors
                    findColors(data.name, data.id);
                    // Main Body
                    getPokemonInfo(types, data.name, data.id, sprites, data.height, data.weight, speciesData.gender_rate, shape, speciesData.names, data.cries);
                    getGen(data.name, speciesData.id);
                    getTypeAbility(types, data.abilities, data.past_abilities);
                    getEvolution(speciesData.evolution_chain.url);
                    displayStatsHistogram(statsData);
                    showForms(speciesUrl);
                    showHeldItems(data.held_items);
                    getLoc(locData);
                    trivia(speciesData);
                    findCounterPokemon(types, statsData);
                })
                .catch((error) => {
                    alert('Pokémon not found. Please try another name or ID.');
                    console.error(error);
                });
        });
}

// Get the bioInfo of the pokemon
function getPokemonInfo(types, name, id, sprites, height, weight, gender_rate, shape, foreignNames, cries){
    // Trace Pokemon's information
    const image = getSprite(name, sprites);
    const foreignName = getForeignName(foreignNames);
    const bioInfo = getBioInfo(height, weight, gender_rate, shape);        
    // const audio = getAudio(name);

    const typeImages = types.map(type =>
        `<div class="tooltip-types-origin">
            <img src="https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(type)}.png" 
                alt="${type}" 
                class="type-image" 
                width="30px">
            <span class="tooltiptext">${type}</span>
        </div>`
    );
    
    pokeHead.innerHTML = `${typeImages.join('')}<span class="pokemon-name">${capitalization(name)}</span>`;
    pokemonInfo.innerHTML = `
        <div>
            <img src="${image[0]}" alt="${name}" width="130" class="pokemon-image">
            <img src="${image[1]}" alt="${name}" width="130" class="pokemon-image2">
        </div>
        <p>Pokédex #${id} | ${foreignName}</p>
        <div class="bioInfo">${bioInfo}</div>
        <p class="audioName"><i class="fa-solid fa-volume-high"></i> New Voice</p>
        <audio controls>
            <source src="${cries.latest}" type="audio/ogg">
            Your browser does not support the audio element.
        </audio>
        <p class="audioName"><i class="fa-solid fa-volume-high"></i> Old Voice</p>
        <audio controls>
            <source src="${cries.legacy}" type="audio/ogg">
            Your browser does not support the audio element.
        </audio>

    `;
}

// Get specific foreign name
function getForeignName(foreignNames){
    let result = ['NULL','NULL'];

    for (let i = 0; i < foreignNames.length; i++) {
        if (foreignNames[i].language.name === "ko") result[0] = foreignNames[i].name;
        else if (foreignNames[i].language.name === "ja") result[1] = foreignNames[i].name;
    }
    return result.join(", ");
}

// Take weight, height, and gender rate of the pokemon
function getBioInfo(height, weight, gender_rate, shape){
    let bioInfo = `<div class="bioInfoBlock">
                        <i class="fa-solid fa-ruler-vertical"></i> 
                        ${(height/10).toFixed(1)}m
                    </div>`;
    
    if(weight<1500){
        // Weight Scale
        bioInfo += `<div class="bioInfoBlock">
                        <i class="fa-solid fa-weight-scale"></i>
                        ${(weight/10).toFixed(1)}kg
                    </div>`;
    } else {
        // Weight Hanging
        bioInfo += `<div class="bioInfoBlock">
                        <i class="fa-solid fa-weight-hanging"></i> 
                        ${(weight/10).toFixed(1)}kg
                    </div>`;
    }

    if (gender_rate === -1) {
        bioInfo += `<div class="bioInfoBlock">
                        <i class="fa-solid fa-genderless"></i> 
                        genderless
                    </div>`;
    } else {
        bioInfo += `
            <div class="bioInfoBlock">
                <i class="fa-solid fa-mars"></i> 
                ${(8 - gender_rate) / 8 * 100}%
            </div>
            <div class="bioInfoBlock">
                <i class="fa-solid fa-venus"></i> 
                ${gender_rate / 8 * 100}%
            </div>
        `;
    }

    // Take image matched to the shape name
    const shapeMapping = {
        "ball": {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/head-gen8.png"},
        "squiggle" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/serpentine-gen8.png"},
        "fish" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/fins-gen8.png"},
        "arms" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/head-arms-gen8.png"},
        "blob" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/head-base-gen8.png"},
        "upright" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/bipedal-tailed-gen8.png"},
        "legs" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/head-legs-gen8.png"},
        "quadruped" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/quadruped-gen8.png"},
        "wings" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/wings-single-gen8.png"},
        "tentacles" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/tentacles-gen8.png"},
        "heads" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/multiple-gen8.png"},
        "humanoid" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/bipedal-tailless-gen8.png"},
        "bug-wings" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/wings-multiple-gen8.png"},
        "armor" : {image: "https://raw.githubusercontent.com/msikma/pokesprite/master/misc/body-style/insectoid-gen8.png"}
    }

    let image;
    if (shape in shapeMapping) {
        ({ image } = shapeMapping[shape]);
    } else {
        image = "";
    }

    if(shape!="null"){
        bioInfo += `<div>
                        <img src="${image}" alt="${shape}" width="25" class="shape">
                    </div>`;
    }

    return bioInfo;
}  

// Change pokemonName to get correct audio file
/***** This code is no longer used. Save for information purpose *****/
function getAudio(name){
    let orig_name;

    // Names for Substitute
    const specialMapping = {
        "dudunsparce-three-segment": { orig_name: "dudunsparce" },
        "eiscue-ice": { orig_name: "eiscue" },
        "enamorus-incarnate": { orig_name: "enamorus" },
        "giratina-altered": { orig_name: "giratina" },
        "indeedee-female": { orig_name: "indeedee-f" },
        "indeedee-male": { orig_name: "indeedee" },
        "landorus-incarnate": { orig_name: "landorus" },
        "lycanroc-midday": { orig_name: "lycanroc" },
        "maushold": { orig_name: "maushold-four" },
        "maushold-family-of-three": { orig_name: "maushold" },
        "morpeko-full-belly": { orig_name: "morpeko" },
        "necrozma-dusk": { orig_name: "necrozma-duskmane" },
        "necrozma-dawnwings": { orig_name: "necrozma-dawnwings" },
        "oinkologne-female": { orig_name: "oinkologne-f" },
        "oricorio-baile": { orig_name: "oricorio" },
        "oricorio-pom-pom": { orig_name: "oricorio-pompom" },
        "rockruff-own-tempo": { orig_name: "rockruff" },
        "shaymin-land": { orig_name: "shaymin" },
        "thundurus-incarnate": { orig_name: "thundurus" },
        "tornadus-incarnate": { orig_name: "tornadus" },
        "toxtricity-amped": { orig_name: "toxtricity" },
        "toxtricity-low-key": { orig_name: "toxtricity-lowkey" },
        "ursaluna-bloodmoon": { orig_name: "ursaluna" },
        "urshifu-rapid-strike": { orig_name: "urshifu-rapidstrike" },
        "urshifu-single-strike": { orig_name: "urshifu" },
        "wishiwashi-solo": { orig_name: "wishiwashi" },
        "zarude-dada": { orig_name: "zarude" }
    };
    
    let modifiedName = name;
    // Name that needs to remove description using regex
    modifiedName = modifiedName.replace(/aegislash-.*/i, "aegislash");
    modifiedName = modifiedName.replace(/basculin-.*/i, "basculin");
    modifiedName = modifiedName.replace(/basculegion-.*/i, "basculegion");
    modifiedName = modifiedName.replace(/castform-.*/i, "castform");
    modifiedName = modifiedName.replace(/deoxys-.*/i, "deoxys");
    modifiedName = modifiedName.replace(/darmanitan-.*/i, "darmanitan");
    if(modifiedName!="pikachu-starter") modifiedName = modifiedName.replace(/pikachu-.*/i, "pikachu");
    modifiedName = modifiedName.replace(/rotom-.*/i, "rotom");
    if(modifiedName!="gourgeist-super") modifiedName = modifiedName.replace(/gourgeist-.*/i, "gourgeist");
    if(modifiedName!="pumpkaboo-super") modifiedName = modifiedName.replace(/pumpkaboo-.*/i, "pumpkaboo");
    modifiedName = modifiedName.replace(/greninja-.*/i, "greninja");
    modifiedName = modifiedName.replace(/keldeo-.*/i, "keldeo");
    modifiedName = modifiedName.replace(/koraidon-.*/i, "koraidon");
    modifiedName = modifiedName.replace(/meloetta-.*/i, "meloetta");
    modifiedName = modifiedName.replace(/meowstic-.*/i, "meowstic");
    modifiedName = modifiedName.replace(/mimikyu-.*/i, "mimikyu");
    modifiedName = modifiedName.replace(/minior-.*/i, "minior");
    modifiedName = modifiedName.replace(/miraidon-.*/i, "miraidon");
    modifiedName = modifiedName.replace(/ogerpon-.*/i, "ogerpon");
    modifiedName = modifiedName.replace(/squawkabilly-.*/i, "squawkabilly");
    modifiedName = modifiedName.replace(/tauros-.*/i, "tauros");
    modifiedName = modifiedName.replace(/terapagos-.*/i, "terapagos");
    modifiedName = modifiedName.replace(/wormadam-.*/i, "wormadam");

    // Names to remove gimmick using simple replace
    modifiedName = modifiedName.replace("-gmax", "");
    modifiedName = modifiedName.replace("-alola", "");
    modifiedName = modifiedName.replace("-totem", "");
    modifiedName = modifiedName.replace("-paldea", "");
    modifiedName = modifiedName.replace("-galar", "");
    modifiedName = modifiedName.replace("-hisui", "");
    modifiedName = modifiedName.replace("-original", "");
    modifiedName = modifiedName.replace("-origin", "");
    modifiedName = modifiedName.replace("-power-construct", "");
    modifiedName = modifiedName.replace("-mega-x", "-megax");
    modifiedName = modifiedName.replace("-mega-y", "-megay");
    modifiedName = modifiedName.replace("iron-", "iron");
    
    // Names to remove hyphen
    let nohyphen = 
    ["brute-bonnet", "chi-yu","chien-pao","flutter-mane", "gouging-fire", "great-tusk", "hakamo-o", "ho-oh", "jangmo-o", "kommo-o",
        "mime-jr", "mr-mime", "mr-rime", "nidoran-f","nidoran-m", "porygon-z", "raging-bolt", "roaring-moon", "sandy-shocks", 
        "scream-tail", "tapu-bulu","tapu-fini","tapu-koko","tapu-lele", "ting-lu", "type-null", "walking-wake", "wo-chien"]

    if(nohyphen.includes(modifiedName)) modifiedName = modifiedName.replace("-","");


    if (modifiedName in specialMapping) {
        ({ orig_name } = specialMapping[modifiedName]);
    } else {
        orig_name = modifiedName;
    }
    
    let audio = `https://play.pokemonshowdown.com/audio/cries/${orig_name}.mp3`;
    return audio;
}

// Get generation of local pokedex info
async function getGen(speciesName, speciesId) {
    generations.style.display = 'block';

    const fetchCSV = async (url) => {
        const response = await fetch(url);
        const csvData = await response.text();
        return csvData.split('\n').map(row => row.split(','));
    };

    try {
        const csvData = await fetchCSV('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_dex_numbers.csv');
        const rows = csvData.map(row => row.map(entry => parseInt(entry)));
        const filteredRows = rows.filter(row => row[0] === speciesId);
        const pokedexInfo = filteredRows.map(row => ({ id: row[1], number: row[2] }));

        const pokedexMapping = {};
        const pokedexCsvData = await fetchCSV('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokedexes.csv');
        const pokedexRows = pokedexCsvData.map(row => row.map(entry => entry));

        pokedexRows.forEach(row => {
            const [id, regionId, identifier] = row;
            pokedexMapping[id] = { regionId, identifier };
        });
        
        // Mapping pokedexId into regionID
        const mapping = {
            2: 1, 26: 1,
            3: 2, 7: 2, 15: 3,
            4: 3,
            5: 4, 6: 4,
            8: 5, 9: 5,
            12: 6, 13: 6, 14: 6,
            16: 7, 17: 7, 18: 7, 19: 7, 20: 7, 21: 7, 22: 7, 23: 7, 24: 7, 25: 7,
            27: 8, 28: 8, 29: 8, 30: 8,
            31: 9, 32: 9, 33: 9
        };

        // Update regionId based on the mapping
        for (const id in mapping) {
            if (pokedexMapping[id]) {
                pokedexMapping[id].regionId = mapping[id];
            }
        }  

        // Change identifier name
        const identifierMapping = {
            "kanto": "kanto (rgby)",
            "original-johto": "johto (gsc)",
            "hoenn": "hoenn (rse)",
            "original-sinnoh": "sinnoh (dp)",
            "extended-sinnoh": "sinnot (pt)",
            "updated-johto": "johto (hgss)",
            "original-unova": "unova (bw)",
            "updated-unova": "unova (bw2)",
            "kalos-central": "kalos-central (xy)",
            "kalos-coastal": "kalos-coastal (xy)",
            "kalos-mountain": "kalos-mountain (xy)",
            "updated-hoenn": "hoenn (oras)",
            "original-alola": "alola (sm)",
            "original-melemele": "melemele (sm)",
            "original-akala": "akala (sm)",
            "original-ulaula": "ulaula (sm)",
            "original-poni": "poni (sm)",
            "updated-alola": "alola (usum)",
            "updated-melemele": "melemele (usum)",
            "updated-akala": "akala (usum)",
            "updated-ulaula": "ulaula (usum)",
            "updated-poni": "poni (usum)",
            "letsgo-kanto": "kanto (lgpe)",
            "galar": "galar (swsh)",
            "isle-of-armor": "isle-of-armor (swsh)",
            "crown-tundra": "crown-tundra (swsh)",
            "hisui": "hisui (pla)",
            "paldea": "paldea (sv)",
            "kitakami": "kitakami (sv)",
            "blueberry": "blueberry (sv)"
        };
        // Update identifiers based on mapping
        for (const id in pokedexMapping) {
            const oldIdentifier = pokedexMapping[id].identifier;
            if (identifierMapping[oldIdentifier]) {
                pokedexMapping[id].identifier = identifierMapping[oldIdentifier];
            }
        }

        const generationsDiv = document.getElementById('generations');
        const circles = generationsDiv.getElementsByClassName('circle');

        let generationId = pokedexInfo.map(entry => mapping[entry.id]);

        // Some Exceptions
        if (speciesName.includes("-alola")) generationId = [7];
        
        if (speciesName.includes("-galar") || 
            speciesName.includes("-hisui") || 
            speciesName.includes("dialga-origin") || 
            speciesName.includes("palkia-origin")) {
            generationId = [8];
        }
        
        if (speciesName.includes("-paldea")) generationId = [9];

        if (speciesName.includes("-mega") || 
            speciesName.includes("-gmax") || 
            speciesName.includes("-totem")) {
            generationId = [];
        }

        // Apply to generation circles
        for (let i = 0; i < circles.length; i++) {
            circles[i].classList.remove('color-class-appear');
            // Check generation is included
            if (generationId.includes(parseInt(circles[i].id))) {
                circles[i].classList.remove('color-class-appear', 'color-class-none');
                circles[i].classList.add('color-class-appear');
                
                const pokedex = pokedexInfo
                    .filter(entry => entry.id !== 1)
                    .filter(entry => pokedexMapping[entry.id].regionId === parseInt(circles[i].id))
                    .map((entry, filteredIndex) => {
                        const identifier = pokedexMapping[entry.id].identifier;
                        const pokedexNumber = entry.number;
                        return `${identifier} : ${pokedexNumber}`;
                    }).join('\n');
    
                circles[i].getElementsByClassName('tooltiptext')[0].textContent = pokedex;
            } else {
                circles[i].getElementsByClassName('tooltiptext')[0].textContent = "Not Appear";
            }
        }
    } catch (error) {
        console.error('Error fetching CSV:', error);
    }
}
  
// Get type and ability info of the pokemon
async function getTypeAbility(types, abilities, pastAbility) {
    // Get weaknesses, resistances, and invalid
    const weaknesses = getWeaknesses(types);
    const resistances = getResistances(types);
    const invalid = getInvalid(types);

    // Display the weaknesses, resistances, and invalid
    const weaknessesHtml = weaknesses.length > 0 ? `<h3>Weaknesses</h3><p>${weaknesses.join('')}</p>` : '';
    const resistancesHtml = resistances.length > 0 ? `<h3>Resistances</h3><p>${resistances.join('')}</p>` : '';
    const invalidHtml = invalid.length > 0 ? `<h3>Invalids</h3><p>${invalid.join('')}</p>` : '';

    let abilitiesHtml = '';

    // Function to handle fetch and return JSON or null on failure
    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}: ${error.message}`);
            return null;
        }
    };
    
    // Check abilities
    for (const ability of abilities) {
        const url = `https://pokeapi.co/api/v2/ability/${ability.ability.name}`;
        const data = await fetchData(url);
    
        const effectEntry = data ? data.effect_entries.find(entry => entry.language.name === "en") : null;
        const tooltipText = effectEntry ? effectEntry.short_effect : '';
    
        abilitiesHtml += `
            <div class="tooltip-ability">
                ${ability.ability.name} ${ability.is_hidden ? '(hidden)' : ''}
                <span class="tooltiptext">${tooltipText}</span>
            </div><br>`;
    }
    
    // Check past ability
    if (pastAbility.length > 0) {
        for (const ability of pastAbility) {
            const url = `https://pokeapi.co/api/v2/ability/${ability.abilities[0].ability.name}`;
            const data = await fetchData(url);
    
            const effectEntry = data ? data.effect_entries.find(entry => entry.language.name === "en") : null;
            const tooltipText = effectEntry ? effectEntry.short_effect : '';
    
            abilitiesHtml += `
                <div class="tooltip-ability">
                    <s>${ability.abilities[0].ability.name}</s>
                    (by ${pastAbility[0].generation.name})
                    <span class="tooltiptext" style="width: 255px;">${tooltipText}</span>
                </div>`;
        }
    }
    
    typeAbility.innerHTML = `
            ${weaknessesHtml}
            ${resistancesHtml}
            ${invalidHtml}
        <h3>Abilities</h3>
            <p>${abilitiesHtml}</p>
        `;
}

// Add event listener to the dropdown menu
if(selectSprite){
    selectSprite.addEventListener('change', () => {
        // get updated Sprite
        const updatedImage = getSprite(global_name, global_sprites);
        
        // Update the sprite in the HTML
        const sprite_front = document.querySelector('.pokemon-image');
        const sprite_back = document.querySelector('.pokemon-image2');
        if (sprite_front) sprite_front.src = updatedImage[0];
        if (sprite_back) sprite_back.src = updatedImage[1];
    });
}

if(filterCheckbox_shiny||filterCheckbox_shiny){
    // Function to handle the click event on the filter buttons
    function handleGetSprite(filterCheckbox) {
        filterCheckbox.addEventListener('click', () => {
            // get updated Sprite
            const updatedImage = getSprite(global_name, global_sprites);
            
            // Update the sprite in the HTML
            const sprite_front = document.querySelector('.pokemon-image');
            const sprite_back = document.querySelector('.pokemon-image2');
            if (sprite_front) sprite_front.src = updatedImage[0];
            if (sprite_back) sprite_back.src = updatedImage[1];
        });
    }

    handleGetSprite(filterCheckbox_shiny);
    handleGetSprite(filterCheckbox_female);
}

// Get Sprites of the Pokemon (front, back, default, shiny, female)
function getSprite(name, sprites){
    chooseSprite.style.display = 'inline-block';
    filter_shiny.style.display = 'inline-block';
    filter_female.style.display = 'inline-block';

    // Check the initially selected option
    var labelText = selectSprite.options[selectSprite.selectedIndex].text;

    const filterSpe_shiny = filterCheckbox_shiny.checked;       // Shiny sprite
    const filterSpe_female = filterCheckbox_female.checked;     // Female sprite

    let image = [];
    const pokeball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    const masterball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
    const pokeball3D = 'https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/PokeBalls/PokeBall.png'
    const masterball3D = 'https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/PokeBalls/MasterBall.png'

    let category, defaultBall, shinyBall;
    if (name.includes("galar")) {
        name = name.replace("galar", "galarian");
    } else if (name.includes("alola")) {
        name = name.replace("alola", "alolan");
    }

    const baseUrl = `https://img.pokemondb.net/`;
    const DBCategoryMappingsA = {
        // Contain Gender and Shiny
        "Pokémon Bank": { category: baseUrl+'sprites/bank/', defaultBall: pokeball3D, shinyBall: masterball3D },
        "Pokémon GO": { category: baseUrl+'sprites/go/', defaultBall: pokeball3D, shinyBall: masterball3D },
        "Gen VIII - PLA":{ category: baseUrl+'sprites/legends-arceus/', defaultBall: pokeball3D, shinyBall: masterball3D },
    };

    const DBCategoryMappingsB = {
        // Normal Only
        "Early Artwork - JP":{ category: baseUrl+`artwork/original/${name}-gen1-jp.jpg`, defaultBall: pokeball, shinyBall: masterball },
        "Early Artwork - US":{ category: baseUrl+`artwork/original/${name}-gen1.jpg`, defaultBall: pokeball, shinyBall: masterball },
        "Pokémon Global Link":{ category: baseUrl+`artwork/vector/${name}.png`, defaultBall: pokeball3D, shinyBall: masterball3D },
        "Icon - LGPE":{ category: baseUrl+`sprites/lets-go-pikachu-eevee/normal/${name}.png`, defaultBall: pokeball, shinyBall: masterball },
        "Icon - BDSP":{ category: baseUrl+`sprites/brilliant-diamond-shining-pearl/normal/${name}.png`, defaultBall: pokeball3D, shinyBall: masterball3D },
        "Icon - Gen IX":{ category: baseUrl+`sprites/scarlet-violet/normal/${name}.png`, defaultBall: pokeball3D, shinyBall: masterball3D },
    };

    // Choose Category to take image
    if (labelText in DBCategoryMappingsA) {
        ({ category, defaultBall, shinyBall } = DBCategoryMappingsA[labelText]);

        if (filterSpe_shiny) {
            if(filterSpe_female){
                image.push(category+`shiny/${name}-f.png` || shinyBall);
                image.push(shinyBall);
            } else {
                image.push(category+`shiny/${name}.png` || shinyBall);
                image.push(shinyBall);
            }
        } else {
            if(filterSpe_female){
                image.push(category+`normal/${name}-f.png` || defaultBall);
                image.push(defaultBall);
            } else {
                image.push(category+`normal/${name}.png` || defaultBall);
                image.push(defaultBall);
            }
        }
    } else if(labelText in DBCategoryMappingsB){
        ({ category, defaultBall, shinyBall } = DBCategoryMappingsB[labelText]);

        if (filterSpe_shiny) {
            if(filterSpe_female){
                image.push(shinyBall);
                image.push(shinyBall);
            } else {
                image.push(shinyBall);
                image.push(shinyBall);
            }
        } else {
            if(filterSpe_female){
                image.push(defaultBall);
                image.push(defaultBall);
            } else {
                image.push(category || defaultBall);
                image.push(defaultBall);
            }
        }
    }

    const categoryMappings = {
        "Official Artwork": { category: sprites.other["official-artwork"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Pokémon Home": { category: sprites.other["home"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Pokémon Dream World": { category: sprites.other["dream_world"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Pixel Animation": { category: sprites.versions["generation-v"]["black-white"].animated, defaultBall: pokeball, shinyBall: masterball },
        "3D Animation": { category: sprites.other["showdown"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Gen I - RB":{ category: sprites.versions["generation-i"]["red-blue"], defaultBall: pokeball, shinyBall: masterball },
        "Gen I - Yellow":{ category: sprites.versions["generation-i"]["yellow"], defaultBall: pokeball, shinyBall: masterball },
        "Gen II - Gold":{ category: sprites.versions["generation-ii"]["gold"], defaultBall: pokeball, shinyBall: masterball },
        "Gen II - Silver":{ category: sprites.versions["generation-ii"]["silver"], defaultBall: pokeball, shinyBall: masterball },
        "Gen II - Crystal":{ category: sprites.versions["generation-ii"]["crystal"], defaultBall: pokeball, shinyBall: masterball },
        "Gen III - RS":{ category: sprites.versions["generation-iii"]["ruby-sapphire"], defaultBall: pokeball, shinyBall: masterball },
        "Gen III - Emerald":{ category: sprites.versions["generation-iii"]["emerald"], defaultBall: pokeball, shinyBall: masterball },
        "Gen III - FRLG":{ category: sprites.versions["generation-iii"]["firered-leafgreen"], defaultBall: pokeball, shinyBall: masterball },
        "Gen IV - DP":{ category: sprites.versions["generation-iv"]["diamond-pearl"], defaultBall: pokeball, shinyBall: masterball },
        "Gen IV - Platinum":{ category: sprites.versions["generation-iv"]["platinum"], defaultBall: pokeball, shinyBall: masterball },
        "Gen IV - HGSS":{ category: sprites.versions["generation-iv"]["heartgold-soulsilver"], defaultBall: pokeball, shinyBall: masterball },
        "Gen V - BW":{ category: sprites.versions["generation-v"]["black-white"], defaultBall: pokeball, shinyBall: masterball },
        "Gen VI - XY":{ category: sprites.versions["generation-vi"]["x-y"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Gen VI - ORAS":{ category: sprites.versions["generation-vi"]["omegaruby-alphasapphire"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Gen VII - USUM":{ category: sprites.versions["generation-vii"]["ultra-sun-ultra-moon"], defaultBall: pokeball3D, shinyBall: masterball3D },
        "Icon - Gen VII":{ category: sprites.versions["generation-vii"]["icons"], defaultBall: pokeball, shinyBall: masterball },
        "Icon - Gen VIII":{ category: sprites.versions["generation-viii"]["icons"], defaultBall: pokeball, shinyBall: masterball },
    };
    // Choose Category to take image
    if (labelText in categoryMappings) {
        ({ category, defaultBall, shinyBall } = categoryMappings[labelText]);
    } else {
        // Default Images (2D Image)
        category = sprites;
        defaultBall = pokeball;
        shinyBall = masterball;
    }

    //Take image from category; PokeBall if failed 
    if (filterSpe_shiny) {
        if(filterSpe_female && sprites.front_shiny_female){
            image.push(category.front_shiny_female || shinyBall);
            image.push(category.back_shiny_female || shinyBall);
        } else {
            if(category.front_shiny_transparent && category.back_shiny_transparent) {
                image.push(category.front_shiny_transparent || shinyBall);
                image.push(category.back_shiny_transparent || shinyBall);
            } else {
                image.push(category.front_shiny || shinyBall);
                image.push(category.back_shiny || shinyBall);
            }
        }
    } else {
        if(filterSpe_female && sprites.front_female){
            image.push(category.front_female || defaultBall);
            image.push(category.back_female || defaultBall);
        } else {
            if(category.front_transparent && category.back_transparent){
                image.push(category.front_transparent || defaultBall);
                image.push(category.back_transparent || defaultBall);
            } else {
                image.push(category.front_default || defaultBall);
                image.push(category.back_default || defaultBall);
            }
        }
    }
    return image;
}

// Find color in the correct address
async function findColors(name, id){
    try {
        if(id>10000) {
            var parts = name.split('-');
            var orig_name = parts[0];
            name = orig_name;
        } 
        let url = `https://pokeapi.co/api/v2/pokemon-species/${name}`;
        let response = await fetch(url);
        if(!response.ok) throw new Error('Fail to Fetch');

        const data = await response.json();
        const color = data.color.name.toLowerCase();
        updateColors(color);
    } catch (error) {
        var parts = name.split('-');
        var orig_name = parts[0];
        name = orig_name;

        url = `https://pokeapi.co/api/v2/pokemon-species/${name}`;
        response = await fetch(url);

        const data = await response.json();
        const color = data.color.name.toLowerCase();
        updateColors(color);
    }
}

// Update theme color matched to the Pokemon color
async function updateColors(color) {
    const colorMappings = {
        "black": { pokeColor: "black", lightpokeColor: "gray", item: 'luxury-ball' },
        "blue": { pokeColor: "#1288f8", lightpokeColor: "#00d6fa", item: 'dive-ball' },
        "brown": { pokeColor: "#a66a2e", lightpokeColor: "#622a0f", item: 'fast-ball' },
        "gray": { pokeColor: "gray", lightpokeColor: "#48494b", item: 'heavy-ball' },
        "green": { pokeColor: "#4cbb17", lightpokeColor: "#0b6623", item: 'friend-ball' },
        "pink": { pokeColor: "#fe5bac", lightpokeColor: "pink", item: 'dream-ball' },
        "purple": { pokeColor: "purple", lightpokeColor: "#b5338a", item: 'master-ball' },
        "red": { pokeColor: "#ff0800", lightpokeColor: "#c21807", item: 'poke-ball' },
        "white": { pokeColor: "#b8b8b8", lightpokeColor: "#d9dddc", item: 'premier-ball' },
        "yellow": { pokeColor: "#ffd300", lightpokeColor: "#ffbf00", item: 'quick-ball' }
    };

    const { pokeColor, lightpokeColor, item } = colorMappings[color] || { pokeColor: color, lightpokeColor: color, item: 'lucky-egg' };

    // Update background color
    document.documentElement.style.setProperty('--pokemoncolor', pokeColor);
    document.documentElement.style.setProperty('--lightpokemoncolor', lightpokeColor);

    // Set the image of the button
    scrollTopButton.style.display = 'inline-block';
    scrollTopButton.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item}.png" 
        alt="scrollTop" 
        width="50px">
    `;
}

if(numberContainer){
    numberContainer.addEventListener('click', function () {
        var newNumber = prompt('Enter a number between 1 and 100:', '50');

        // Validate the input
        if (newNumber !== null && !isNaN(newNumber) && newNumber >= 1 && newNumber <= 100) {
            // Update the numberContainer
            numberContainer.textContent = `LV ${newNumber}`;
            numberSlider.value = newNumber;
            displayStatsHistogram(global_statsData);
        } else {
            alert('Please enter a valid number between 1 and 100.');
        }
    });
}

if(numberSlider){
    numberSlider.addEventListener('input', () => {
        let newValue = numberSlider.value;
        numberContainer.innerText = `LV ${newValue}`;
        displayStatsHistogram(global_statsData);
    });  
}

// Function to display the Pokemon's stats histogram
function displayStatsHistogram(statsData) {
    // Max value for Each Stats
    const maxValue = 255;
    let stats = 0;
    let name, minRealStat = 0, maxRealStat = 0;

    // Show Header
    psHead.style.display = 'block';
    levelContainer.style.display = 'flex';
    const LV = parseInt((numberContainer.innerText).match(/\d+/), 10);

    // Create HTML for the histogram
    const histogramHTML = statsData.map((stat) => {
        const barWidth = (stat.value / maxValue) * 100;
        stats += stat.value;

        // Calculate Real Stat at LV.50
        if(stat.name === "hp") {
            name = "HP";
            if(stat.value == 1){
                // Shedinja
                minRealStat = 1;
                maxRealStat = 1;    
            } else {
                minRealStat = Math.floor((2*stat.value+0+0/4)*LV/100)+LV+10;
                maxRealStat = Math.floor((2*stat.value+31+252/4)*LV/100)+LV+10;
            }
        } else if (stat.name === "attack"){
            name = "ATK";
            minRealStat = Math.floor((Math.floor((2*stat.value+0+0/4)*LV/100)+5)*0.9);
            maxRealStat = Math.floor((Math.floor((2*stat.value+31+252/4)*LV/100)+5)*1.1);
        } else if (stat.name === "defense"){
            name = "DEF";
            minRealStat = Math.floor((Math.floor((2*stat.value+0+0/4)*LV/100)+5)*0.9);
            maxRealStat = Math.floor((Math.floor((2*stat.value+31+252/4)*LV/100)+5)*1.1);
        } else if (stat.name === "special-attack"){
            name = "SPA";
            minRealStat = Math.floor((Math.floor((2*stat.value+0+0/4)*LV/100)+5)*0.9);
            maxRealStat = Math.floor((Math.floor((2*stat.value+31+252/4)*LV/100)+5)*1.1);
        } else if (stat.name === "special-defense"){
            name = "SPD";
            minRealStat = Math.floor((Math.floor((2*stat.value+0+0/4)*LV/100)+5)*0.9);
            maxRealStat = Math.floor((Math.floor((2*stat.value+31+252/4)*LV/100)+5)*1.1);
        } else if (stat.name === "speed"){
            name = "SPE";
            minRealStat = Math.floor((Math.floor((2*stat.value+0+0/4)*LV/100)+5)*0.9);
            maxRealStat = Math.floor((Math.floor((2*stat.value+31+252/4)*LV/100)+5)*1.1);
        }

        return `
            <div class="stat-bar">
                <div class="bar-label">
                    <span class="left-part">
                        ${name}: ${stat.value} (${minRealStat} - ${maxRealStat})
                    </span>
                    <span class="right-part">${stat.effort} EV</span>
                </div>            
                <div class="bar-container">
                    <div class="bar" style="width: ${barWidth}%;"></div>
                </div>
            </div>
        `;
    }).join('');

    // Set the HTML content of the histogram container
    statsHistogram.innerHTML = histogramHTML;
    statsHistogram.innerHTML += `<p>Total Base Stats: ${stats}</p>`;
}

if(filterCheckbox_shinyform || filterCheckbox_back){
    // Show different style of forms
    function handleShowForm(filterCheckbox) {
        filterCheckbox.addEventListener('click', () => {
            showForms(global_speciesUrl);
        });
    }

    handleShowForm(filterCheckbox_shinyform);
    handleShowForm(filterCheckbox_back);
}

// Store the latest call's timestamp
let latestFormCall = 0;

// Take all forms of the Pokemon
async function showForms(species) {
    const currentFormCall = Date.now();
    latestFormCall = currentFormCall;

    try {
        const speciesResponse = await fetch(species);
        const speciesData = await speciesResponse.json();
        dfHead.style.display = 'block';
        filter_shinyform.style.display = 'inline-block';
        filter_back.style.display = 'inline-block';

        const filterSpe_shinyform = filterCheckbox_shinyform.checked; // Shiny sprite
        const filterSpe_back = filterCheckbox_back.checked;           // Back sprite
        let formsHtml = '';

        const varietyUrls = speciesData.varieties.map(variety => variety.pokemon.url);
        const varietyResponses = await Promise.all(varietyUrls.map(url => fetch(url)));
        const varietyData = await Promise.all(varietyResponses.map(response => response.json()));

        for (const data of varietyData) {
            if (currentFormCall !== latestFormCall) return;

            const formUrls = data.forms.map(form => form.url);
            const formResponses = await Promise.all(formUrls.map(url => fetch(url)));
            const formDataList = await Promise.all(formResponses.map(response => response.json()));

            for (const formData of formDataList) {
                if (currentFormCall !== latestFormCall) return;

                const pokemonName = formData.name;
                const sprite = await showSprite(formData, filterSpe_shinyform, filterSpe_back);

                formsHtml += `
                <div class="tooltip-items">
                    <a href="./info.html?s=${pokemonName}" target="_blank">
                        <img src="${sprite}" alt="${pokemonName}" width="60px">
                    </a>
                    <span class="tooltiptext">${pokemonName}</span>
                </div>`;
            }
        }

        forms.innerHTML = formsHtml;

    } catch (error) {
        console.error('Error fetching forms:', error);
    }
}

async function showSprite(formData, shiny, back) {
    const pokeball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    const masterball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';

    let sprite;
    if (shiny) {
        sprite = back ? formData.sprites.back_shiny : formData.sprites.front_shiny;
    } else {
        sprite = back ? formData.sprites.back_default : formData.sprites.front_default;
    }

    if (!sprite) {
        const url = formData.pokemon.url;
        const data = await fetch(url).then(response => response.json());

        if (shiny) {
            return back ? data.sprites.back_shiny || masterball : data.sprites.front_shiny || masterball;
        } else {
            return back ? data.sprites.back_default || pokeball : data.sprites.front_default || pokeball;
        }
    }

    return sprite;
}

// Show held item when the Pokemon is in the wild
function showHeldItems(items){
    heldItems.innerHTML=`<h3>Wild Held Items</h3>`;
    for (var i = 0; i < items.length; i++) {
        const itemName = items[i].item.name;
        const itemImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;

        heldItems.innerHTML += `
            <div class="tooltip-items">
                <a href="./item.html?s=${itemName}" target="_blank">
                    <img src="${itemImage}" alt="held-item" width="50px">
                </a>
                <span class="tooltiptext">${itemName}</span>
            </div>
        `;
    }
    if(items.length===0){
        heldItems.innerHTML+=`<p>none</p>`;
    }
}

// Change Version Name into Region ID
const versionToRegionId = {
    'red': 1, 'green': 1, 'blue': 1, 'yellow': 1, 'firered': 1, 'leafgreen': 1, 
    'lets-go-pikachu': 1, 'lets-go-eevee': 1,
    'gold': 2, 'silver': 2, 'crystal': 2, 'heartgold': 2, 'soulsilver': 2,
    'ruby': 3, 'sapphire': 3, 'emerald': 3, 'omega-ruby': 3, 'alpha-sapphire': 3,
    'diamond': 4, 'pearl': 4, 'platinum': 4, 'brilliant-diamond': 4, 'shining-pearl': 4,
    'black': 5, 'white': 5, 'black-2': 5, 'white-2': 5,
    'x': 6, 'y': 6,
    'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7,
    'sword': 8, 'shield': 8, 'the-isle-of-armor': 8, 'the-crown-tundra': 8, 'legends-arceus': 8,
    'scarlet': 9, 'violet': 9, 'the-teal-mask': 9, 'the-indigo-disk': 9
};

// Show where the Pokemon can be found
async function getLoc(loc) {
    locations.style.display = 'block';

    try {
        const regions = {};

        // Iterate over each location to find a match and store region and location details
        for (let i = 0; i < loc.length; i++) {
            const locationName = loc[i].location_area.name;

            for (let j = 0; j < loc[i].version_details.length; j++) {
                const versionName = loc[i].version_details[j].version.name;
                if (versionToRegionId.hasOwnProperty(versionName)) {
                    let regionId = versionToRegionId[versionName];

                    if (!regions[regionId]) regions[regionId] = {};
                    if (!regions[regionId][versionName]) regions[regionId][versionName] = [];
                    regions[regionId][versionName].push(locationName);
                }
            }
        }

        // Update location circles based on the regions data
        const locationsDiv = document.getElementById('locations');
        const circles = locationsDiv.getElementsByClassName('circle');

        for (let i = 0; i < circles.length; i++) {
            circles[i].classList.remove('color-class-appear');
            const circleId = parseInt(circles[i].id);

            if (regions[circleId]) {
                circles[i].classList.add('color-class-appear');
                let tooltipContent = '';
                // Prepend version name
                for (const versionName in regions[circleId]) {
                    tooltipContent += `[${versionName}]\n`;
                    tooltipContent += regions[circleId][versionName].join('\n');
                    tooltipContent += '\n\n';
                }
                circles[i].getElementsByClassName('tooltiptext')[0].textContent = tooltipContent.trim();
            } else {
                circles[i].getElementsByClassName('tooltiptext')[0].textContent = "Not Appear";
            }
        }
    } catch (error) {
        console.error('Error processing location data:', error);
    }
}

// Write Trivia of the Pokemon
function trivia(speciesData){
    let genera = "undefined";
    let eggGroup = ["undefined"];
    let flavorTexts = ["undefined"];
    
    // Take English Genera
    for (let i = 0; i < speciesData.genera.length; i++) {
        if (speciesData.genera[i].language.name === "en") {
            genera = speciesData.genera[i].genus;
            break;
        }
    }
    
    // Take All Egg Groups
    eggGroup = speciesData.egg_groups.map(group => group.name);
    if (eggGroup.length === 0) eggGroup = ["undefined"];
    
    // Take All English Flavor Texts
    flavorTexts = speciesData.flavor_text_entries
        .filter(entry => entry.language.name === "en")
        .map(entry => entry.flavor_text);
    if (flavorTexts.length === 0) flavorTexts = ["undefined"];
    
    const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];
    
    others.innerHTML = `
        <h3>Egg Groups</h3>
        <p>${eggGroup.join(', ')}</p>
        <h3 id="pokedex">
            Trivia
            <img id="speakButton" 
                    onclick="speakText('${speciesData.name}, ${genera}, ${flavorText.replace(/\n/g, '').replace(/'/g, '’')}')"
                    src = 'https://www.tv-tokyo.co.jp/anime/pokemon_sunmoon/images/chara/chara02.png'
                    alt = ""
                    onerror="this.style.display='none';">
        </h3>
        <p>${genera}</p>
        <p>${flavorText}</p>
    `;
}

// Change Pokemon name in evolution chain into an image
function evolutionWithImages(evolutionDetails) {
    const matches = evolutionDetails.match(/(?:<br>-> |<br>or |^)([a-zA-Z0-9-]+)/g);
    
    if (!matches) {
        // No matches found, return the original string
        return Promise.resolve(evolutionDetails);
    }
    
    const fetchPromises = matches.map(async (match) => {
        const pokemonName = match.replace(/<br>-> |<br>or /, '');
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    
        try {
            const response = await fetch(url);
            if(!response.ok) throw new Error('Fail to Fetch');
            
            const data = await response.json();
            const img = data.sprites.front_default||'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            
            let imgTooltip = ``;
            if(match.includes("<br>-> ")) imgTooltip +="<br>-> "
            else if(match.includes("<br>or ")) imgTooltip +="<br>or "
            imgTooltip += `
            <div class="tooltip-pokemon">
                <a href="./info.html?s=${pokemonName}" target="_blank">
                    <img src="${img}" alt="${pokemonName}" width="60px"/>
                </a>
                <span class="tooltiptext">${pokemonName}</span>
            </div>`;        
                
            evolutionDetails = evolutionDetails.replace(match, imgTooltip);
        } catch (error) {
            console.error(`Error fetching data for ${pokemonName}:`, error);
        }
    });
    
    return Promise.all(fetchPromises).then(() => evolutionDetails);
}

// Store the latest call's timestamp
let latestEvChainCall = 0;

function getEvolution(evolutionChainUrl){
    // Check if a newer call has been made, and cancel if true
    const currentEvChainCall = Date.now();
    latestEvChainCall = currentEvChainCall;
    // Get evolution chain details
    fetch(evolutionChainUrl)
        .then((response) => response.json())
        .then((evolutionData) => {
            // Check if a newer call has been made, and cancel if true
            if(currentEvChainCall !== latestEvChainCall) return;
            const evolutionDetails = parseEvolutionChain(evolutionData.chain);
            evolutionWithImages(evolutionDetails)
            .then((evolutionImages) => {
                // Check if a newer call has been made, and cancel if true
                if(currentEvChainCall !== latestEvChainCall) return;
                evolution.innerHTML = `
                    <h3>Evolution Chain</h3>
                    ${evolutionImages}
                `
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        })
        .catch((error) => console.error(error));
}

// Get Evolution Chain
function parseEvolutionChain(chain) {
    let evolutionDetails = chain.species.name;
    let evolutionConditions = [];

    if (chain.evolution_details && chain.evolution_details.length > 0) {
        for(let i = 0; i<chain.evolution_details.length; i++){
            const evolutionMethod = chain.evolution_details[i].trigger?.name;
        
            // Evolution Methods
            const evolveGender = chain.evolution_details[i].gender;
            const tradeItem = chain.evolution_details[i].held_item?.name;
            const evolveItem = chain.evolution_details[i].item?.name;
            const evolveMove = chain.evolution_details[i].known_move?.name;
            const evolveLocation = chain.evolution_details[i].location?.name;
            const evolveAffection = chain.evolution_details[i].min_affection;
            const evolveBeauty = chain.evolution_details[i].min_beauty;
            const evolveHappiness = chain.evolution_details[i].min_happiness;
            const evolveLevel = chain.evolution_details[i].min_level;
            const evolveRain = chain.evolution_details[i].needs_overworld_rain;
            const evolveParty = chain.evolution_details[i].party_species?.name;
            const evolvePartyType = chain.evolution_details[i].party_type?.name;
            const evolveStats = chain.evolution_details[i].relative_physical_stats;
            const evolveTime = chain.evolution_details[i].time_of_day;
            const evolveTrade = chain.evolution_details[i].trade_species?.name;
            const evolveUpsideDown = chain.evolution_details[i].turn_upside_down;
            
            if (evolveLevel !== null) {
                evolutionConditions.push(`Level ${evolveLevel}`);
            }

            if (evolveGender) {
                if(evolveGender===1){
                    evolutionConditions.push(`Female`);
                } else {
                    evolutionConditions.push(`Male`);
                }
            }

            if (evolutionMethod != 'trade' && tradeItem) {
                evolutionConditions.push(`Holding ${tradeItem}`);
            }

            if (evolveItem) {
                evolutionConditions.push(`Use ${evolveItem}`);
            }

            if (evolveMove) {
                evolutionConditions.push(`Learn ${evolveMove}`);
            }
            
            if (evolveLocation) {
                evolutionConditions.push(`At ${evolveLocation}`);
            }

            if (evolveHappiness !== null) {
                evolutionConditions.push(`Happiness ${evolveHappiness}`);
            }

            if (evolveBeauty !== null) {
                evolutionConditions.push(`Beauty ${evolveBeauty}`);
            }

            if (evolveAffection !== null) {
                evolutionConditions.push(`Friendship ${evolveAffection}`);
            }

            if(evolveRain) {
                evolutionConditions.push(`Rain Field`);
            }
            
            if(evolveParty){
                evolutionConditions.push(`"${evolveParty}" in party`);
            }

            if(evolvePartyType){
                evolutionConditions.push(`${evolvePartyType} type in party`);
            }
            
            if (evolveStats != null) {
                switch (evolveStats) {
                    case 1:
                        evolutionConditions.push(`ATK > DEF`);
                        break;
                    case 0:
                        evolutionConditions.push(`ATK = DEF`);
                        break;
                    case -1:
                        evolutionConditions.push(`ATK < DEF`);
                        break;
                }
            }
                            
            if(evolveTime) {
                evolutionConditions.push(`${evolveTime}`);
            }

            if(evolveUpsideDown){
                evolutionConditions.push(`Turn Upside Down`);
            }

            // EvolutionTriggers
            if (evolutionMethod === 'trade') 
            {
                if (tradeItem) {
                    evolutionConditions.push(`Trade holding ${tradeItem}`);
                }
                else if(evolveTrade){
                    evolutionConditions.push(`Trade with ${evolveTrade}`);
                }
                else {
                    evolutionConditions.push(`Trade`);
                }
            } else if(evolutionMethod != null 
                && evolutionMethod != `level-up`
                && evolutionMethod != `use-item`) 
            {
                evolutionConditions.push(`${evolutionMethod}`);
            }
        }
        evolutionDetails += ` (${evolutionConditions.join(', ')})`;
    }

    // Check all evolutions (e.g. eevee)
    if (chain.evolves_to && chain.evolves_to.length > 0) {
        const evolutionBranches = chain.evolves_to.map((evolve) => parseEvolutionChain(evolve));
        evolutionDetails += ` <br>-> ${evolutionBranches.join(' <br>or ')}`;
    }
    return evolutionDetails;
}

// x2 damages when defend
const WeakChart = {
    normal: ['fighting'],
    fighting: ['flying', 'psychic', 'fairy'],
    flying: ['electric', 'ice', 'rock'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'ice', 'grass'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    bug: ['flying', 'rock', 'fire'],
    ghost: ['ghost', 'dark'],
    steel: ['fighting', 'ground', 'fire'],
    fire: ['water', 'rock', 'ground'],
    water: ['electric', 'grass'],
    grass: ['flying', 'poison', 'bug', 'fire', 'ice'],
    electric: ['ground'],
    psychic: ['bug', 'ghost', 'dark'],
    ice: ['fighting', 'rock', 'steel', 'fire'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    fairy: ['poison', 'steel'],
};

// x1/2 damages when defend
const ResisChart = {
    normal: [],
    fighting: ['rock', 'bug', 'dark'],
    flying: ['fighting', 'bug', 'grass'],
    poison: ['fighting', 'poison', 'bug', 'grass', 'fairy'],
    ground: ['poison', 'rock'],
    rock: ['normal', 'flying', 'poison', 'fire'],
    bug: ['fighting', 'ground', 'grass'],
    ghost: ['poison', 'bug'],
    steel: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
    fire: ['bug', 'steel', 'fire', 'grass', 'ice','fairy'],
    water: ['steel', 'fire', 'water', 'ice'],
    grass: ['ground', 'water', 'grass', 'electric'],
    electric: ['flying', 'steel', 'electric'],
    psychic: ['fighting', 'psychic'],
    ice: ['ice'],
    dragon: ['fire','water','grass','electric'],
    dark: ['ghost', 'dark'],
    fairy: ['fighting', 'bug', 'dark'],
};

// x0 damages when defend
const ResisInvalChart = {
    normal: ['ghost'],
    fighting: [],
    flying: ['ground'],
    poison: [],
    ground: ['electric'],
    rock: [],
    bug: [],
    ghost: ['normal','fighting'],
    steel: ['poison'],
    fire: [],
    water: [],
    grass: [],
    electric: [],
    psychic: [],
    ice: [],
    dragon: [],
    dark: ['psychic'],
    fairy: ['dragon'],
};

// Find the weakness information
function getWeaknesses(types) {
    const weaknesses = new Set();
    types.forEach((type) => {
        const typeWeaknesses = WeakChart[type];
        if (typeWeaknesses) {
            typeWeaknesses.forEach((weakness) => weaknesses.add(weakness));
        }
    });
    types.forEach((type) => {
        const typeResistances = ResisChart[type];
        if (typeResistances) {
            typeResistances.forEach((resistance) => weaknesses.delete(resistance));
        }
    });
    for (rep = 0; rep<2; rep++){
        types.forEach((type) => {
            const typeInval = ResisInvalChart[type];
            if (typeInval) {
                typeInval.forEach((inval) => weaknesses.delete(inval));
            }
        });
    }

    const effectiveWeaknesses = Array.from(weaknesses).map((weakness) => {
        const count = types.reduce((acc, type) => (WeakChart[type]?.includes(weakness) ? acc + 1 : acc), 0);
        return { weakness, count };
    });
    
    // Sort the weaknesses based on the count in descending order
    effectiveWeaknesses.sort((a, b) => b.count - a.count);
    
    // Map the sorted weaknesses (x4 and then x2) with type images
    const sortedEffectiveWeaknesses = effectiveWeaknesses.map(({ weakness, count }) => {
        const weaknessImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(weakness)}.png`;
        return `
        <div class="tooltip-types">
            <img src="${weaknessImageUrl}" alt="${weakness}" class="type-image" width="40px" > 
            x${count === 2 ? 4 : count === 1 ? 2 : 1}
            <span class="tooltiptext">${weakness}</span>
        </div>`;
    });
    return sortedEffectiveWeaknesses;
}

// Check the resistances information
function getResistances(types) {
    const resistances = new Set();
    types.forEach((type) => {
        const typeResistances = ResisChart[type];
        if (typeResistances) {
            typeResistances.forEach((resistance) => resistances.add(resistance));
        }
    });
    types.forEach((type) => {
        const typeWeaknesses = WeakChart[type];
        if (typeWeaknesses) {
            typeWeaknesses.forEach((weakness) => resistances.delete(weakness));
        }
    });
    for (rep = 0; rep<2; rep++){
        types.forEach((type) => {
            const typeInval = ResisInvalChart[type];
            if (typeInval) {
                typeInval.forEach((inval) => resistances.delete(inval));
            }
        });
    }

    const effectiveResistances = Array.from(resistances).map((resistance) => {
        const count = types.reduce((acc, type) => (ResisChart[type]?.includes(resistance) ? acc + 1 : acc), 0);
        return { resistance, count };
    });
    
    // Sort the resistances based on the count in ascending order
    effectiveResistances.sort((a, b) => a.count - b.count);
    
    // Map the sorted resistances (x1/2 and then x1/4) with type images
    const sortedEffectiveResistances = effectiveResistances.map(({ resistance, count }) => {
        const resistanceImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(resistance)}.png`;
        return `
        <div class="tooltip-types">
            <img src="${resistanceImageUrl}" alt="${resistance}" class="type-image"  width="40px"> 
            x${count === 2 ? 1 / 4 : count === 1 ? 1 / 2 : 1}
            <span class="tooltiptext">${resistance}</span>
        </div>`;
    });
    
    return sortedEffectiveResistances;
}

// Check invalid information
function getInvalid(types) {
    const invalid = new Set();
    types.forEach((type) => {
        const typeInval = ResisInvalChart[type];
        if (typeInval) {
            typeInval.forEach((inval) => invalid.add(inval));
        }
    });
    // Map the invalid types with type images
    const invalidWithTypeImages = Array.from(invalid).map((inval) => {
        const invalImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(inval)}.png`;
        return `
        <div class="tooltip-types">
            <img src="${invalImageUrl}" alt="${inval}" class="type-image"  width="40px">
            <span class="tooltiptext">${inval}</span>
        </div>`;
    });

    return invalidWithTypeImages;
}

if(updateButton){
    // Update Counter Pokemon Table
    updateButton.addEventListener('click', () => {
        findCounterPokemon(global_types, global_statsData);
    });    
}

// Show and hide table settings
if(settingButton) {
    settingButton.addEventListener('click', toggleSettingDisplay);     
}

function toggleSettingDisplay() {
    const filters = [filter_bst600, filter_mega, filter_type, filter_abilities, filter_baseStat];

    filters.forEach(filter => {
        const currentDisplay = window.getComputedStyle(filter).getPropertyValue('display');
        filter.style.display = (currentDisplay === 'none') ? 'inline-block' : 'none';
    });
}

function calculate(CP_data, SP_stats){
    /*  
    * SP_stats[n].value means the search pokemon(SP)'s stats value
    * 0: hp; 1: attack; 2: defense; 3: special-attack; 4: special-defense; 5: speed 
    */
    
   // Assume every stats are in best condition
   const IV = 31;
   const EV = 252;
   const NATURE = 1.1;
   
   // HP = baseStat + IV/2 + EV/8 + 50 + 10
   // others = (baseStat + IV/2 + EV/8 + 5) * Nature
    const SP_real_hp = SP_stats[0].value + IV/2 + EV/8 + 50 + 10;
    const SP_real_atk = (SP_stats[1].value + IV/2 + EV/8 + 5) * NATURE;
    const SP_real_def = (SP_stats[2].value + IV/2 + EV/8 + 5) * NATURE;
    const SP_real_spa = (SP_stats[3].value + IV/2 + EV/8 + 5) * NATURE;
    const SP_real_spd = (SP_stats[4].value + IV/2 + EV/8 + 5) * NATURE;
    const SP_real_spe = (SP_stats[5].value + IV/2 + EV/8 + 5) * NATURE;

    const CP_real_hp = CP_data.stats.hp + IV/2 + EV/8 + 50 + 10;
    const CP_real_atk = (CP_data.stats.atk + IV/2 + EV/8 + 5) * NATURE;
    const CP_real_def = (CP_data.stats.def + IV/2 + EV/8 + 5) * NATURE;
    const CP_real_spa = (CP_data.stats.spa + IV/2 + EV/8 + 5) * NATURE;
    const CP_real_spd = (CP_data.stats.spd + IV/2 + EV/8 + 5) * NATURE;
    const CP_real_spe = (CP_data.stats.spe + IV/2 + EV/8 + 5) * NATURE;

    // real_damage = (real_atk or real_spa) * ability * power * STAB * rank
    // real_defense = real_hp * (real_def or real_spd) / (0.44 or 0.411 or 0.374 (correction))
    var SP_real_damage = 0, SP_real_defense = 0, CP_real_damage = 0, CP_real_defense = 0;

    // Assume No ability; power = 80; STAB(x1.5); No rank-up;
    const ABILITY = 1;
    const POWER = 80;
    const STAB = 1.5;
    const RANK = 1;
    const DEFENSE_CHECK = { twoHit: 0.44, randomOneHit: 0.411, oneHit: 0.374 };
    const MULTIPLIER = 1 * ABILITY * POWER * STAB * RANK;

    // Check whether search pokeomon's defense or special-defense is lower
    if (SP_real_def < SP_real_spd) {
        CP_real_damage = Math.floor(CP_real_atk * MULTIPLIER);
        SP_real_defense = Math.floor(SP_real_hp * SP_real_def);
    } else if (SP_real_def > SP_real_spd) {
        CP_real_damage = Math.floor(CP_real_spa * MULTIPLIER);
        SP_real_defense = Math.floor(SP_real_hp * SP_real_spd);
    } else if (CP_real_atk > CP_real_spa){
        CP_real_damage = Math.floor(CP_real_atk * MULTIPLIER);
        SP_real_defense = Math.floor(SP_real_hp * SP_real_def);
    } else{
        CP_real_damage = Math.floor(CP_real_spa * MULTIPLIER);
        SP_real_defense = Math.floor(SP_real_hp * SP_real_spd);
    }

    CP_data.score += Math.floor((CP_real_damage)*0.005);
    
    // Score adjustments based on hit types
    let twoHitThreshold = Math.floor(SP_real_defense/DEFENSE_CHECK.twoHit);
    let oneHitThreshold = Math.floor(SP_real_defense/DEFENSE_CHECK.oneHit);

    // 100% two-hit or more
    if (CP_real_damage < twoHitThreshold) CP_data.score -= 10;
    // Random one-hit
    else if (CP_real_damage < oneHitThreshold) CP_data.score += 15;
    // 100% one-hit
    else if(CP_real_damage > oneHitThreshold) CP_data.score += 30;
    
    // Check whether search pokeomon's attack or special-attack is greater
    if (SP_real_atk > SP_real_spa) {
        SP_real_damage = Math.floor(SP_real_atk * MULTIPLIER);
        CP_real_defense = Math.floor(CP_real_hp * CP_real_def);
    } else if (SP_real_atk < SP_real_spa) {
        SP_real_damage = Math.floor(SP_real_spa * MULTIPLIER);
        CP_real_defense = Math.floor(CP_real_hp * CP_real_spd);
    } else if (CP_real_def > CP_real_spd){
        SP_real_damage = Math.floor(SP_real_spa * MULTIPLIER);
        CP_real_defense = Math.floor(CP_real_hp * CP_real_spd);
    } else {
        SP_real_damage = Math.floor(SP_real_atk * MULTIPLIER);
        CP_real_defense = Math.floor(CP_real_hp * CP_real_def);
    }

    CP_data.score += Math.floor((CP_real_defense)*0.001);

    twoHitThreshold = Math.floor(CP_real_defense/DEFENSE_CHECK.twoHit);
    oneHitThreshold = Math.floor(CP_real_defense/DEFENSE_CHECK.oneHit);

    // 100% two-hit or more
    if(SP_real_damage < twoHitThreshold) CP_data.score += 20;
    // Random one-hit
    else if(SP_real_damage < oneHitThreshold) CP_data.score += 10;
    // 100% one-hit
    else if(SP_real_damage > oneHitThreshold) CP_data.score -= 10;

    // Give more score to the counter Pokemon whose speed is faster
    if (CP_real_spe > SP_real_spe) CP_data.score += Math.min(Math.floor(CP_real_spe - SP_real_spe), 15);
    if (CP_real_spe < SP_real_spe) CP_data.score -= Math.min(Math.floor(SP_real_spe - CP_real_spe), 15);

    return CP_data;
}

// Resize Counter Pokemon Table when the screen is resized
window.addEventListener('resize', function() {
    updateTableSize();
});

// Update table width and height when user resize the screen
function updateTableSize(){
    const tableContainer = document.querySelector('.tableContainer');
    const table = document.querySelector('.table');
    if (tableContainer) {
        const container1 = chooseSprite.clientHeight + pokemonInfo.clientHeight + generations.clientHeight + typeAbility.clientHeight + evolution.clientHeight;
        const container2 = psHead.clientHeight + levelContainer.clientHeight + statsHistogram.clientHeight + dfHead.clientHeight + cbx_form.clientHeight + forms.clientHeight + heldItems.clientHeight + locations.clientHeight + others.clientHeight;
        const clientHeight = container1 > container2 ? container1 : container2;
        const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        const screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

    // Set width and height of the screen
    if (screenWidth > 1024) {
        tableContainer.style.width = Math.floor(screenWidth / 2) + 'px';
    } else if(screenWidth > 767 && screenWidth <= 1024){
        tableContainer.style.width = (screenWidth - 30) + 'px';
    } else {
        tableContainer.style.width = (screenWidth - 20) + 'px';
    }
    tableContainer.style.height = (screenWidth > 1024) ? clientHeight + 'px' : Math.floor(screenHeight*0.7) + 'px';
    }

    if(table){
        // Guarantee space for scroll bar
        table.style.width = parseFloat(tableContainer.style.width)-8 + 'px';
    }
}

// Make Counter Pokemon Table
function makeTable(pokemonArray){
    if(!pokemonArray) return;
    
    const filterSpe_type = filterCheckbox_type.checked;          
    const filterSpe_abilities = filterCheckbox_abilities.checked;
    const filterSpe_baseStat = filterCheckbox_baseStat.checked;  
    
    counterPokemon.innerHTML = '';

    // Create a container for the scrollable table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'tableContainer';
    const container1 = chooseSprite.clientHeight + pokemonInfo.clientHeight + generations.clientHeight + typeAbility.clientHeight + evolution.clientHeight;
    const container2 = psHead.clientHeight + levelContainer.clientHeight + statsHistogram.clientHeight + dfHead.clientHeight + cbx_form.clientHeight + forms.clientHeight + heldItems.clientHeight + locations.clientHeight + others.clientHeight;
    const clientHeight = container1 > container2 ? container1 : container2;
    const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    const screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

    // Set width and height of the screen
    if (screenWidth > 1024) {
        tableContainer.style.width = Math.floor(screenWidth / 2) + 'px';
    } else if(screenWidth > 767 && screenWidth <= 1024){
        tableContainer.style.width = (screenWidth - 30) + 'px';
    } else {
        tableContainer.style.width = (screenWidth - 20) + 'px';
    }
    tableContainer.style.height = (screenWidth > 1024) ? clientHeight + 'px' : Math.floor(screenHeight*0.7) + 'px';

    // Create the table element
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = '';
    
    // Guarantee space for scroll bar
    table.style.width = parseFloat(tableContainer.style.width)-8 + 'px';

    // Scroll to the top
    scrollUpButton.addEventListener('click', () => {
        tableContainer.scroll({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Scroll to the bottom
    scrollDownButton.addEventListener('click', () => {
        tableContainer.scroll({
            top: tableContainer.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Create the table header
    const headerRow = table.createTHead().insertRow();
    headerRow.className = 'thead'
    headerRow.innerHTML = '<th>Sprite</th><th>Name</th>'
    if(!filterSpe_type) headerRow.innerHTML += '<th>Types</th>';
    if(!filterSpe_abilities) headerRow.innerHTML += '<th>Abilities</th>';
    headerRow.innerHTML += '<th>Score</th>'
    if(!filterSpe_baseStat) headerRow.innerHTML += '<th>HP</th><th>Atk</th><th>Def</th><th>SpA</th><th>SpD</th><th>Spe</th><th>BST</th>';

    // Iterate through the sorted array and add rows to the table
    for (const pokemon of pokemonArray) {    
        // Add row to the table
        const row = table.insertRow();
        row.innerHTML = `
        <td>
            <a href="./info.html?s=${pokemon.name}" target="_blank">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" width="50">
            </a>
        </td>
        <td>${capitalization(pokemon.name)}</td>
        `;
        if(!filterSpe_type){
            row.innerHTML += `<td>${pokemon.types}</td>`;
        }

        if(!filterSpe_abilities){
            row.innerHTML += `<td>${pokemon.abilities}</td>`;
        } 

        row.innerHTML += `<td>${pokemon.score}</td>`;
        
        if(!filterSpe_baseStat) {
            row.innerHTML += `
                <td>${pokemon.stats.hp}</td>
                <td>${pokemon.stats.atk}</td>
                <td>${pokemon.stats.def}</td>
                <td>${pokemon.stats.spa}</td>
                <td>${pokemon.stats.spd}</td>
                <td>${pokemon.stats.spe}</td>
                <td>${pokemon.stats.total}</td>
            `;
        }
    }
    // Append the table to the container
    tableContainer.appendChild(table);
    
    // Append the container to the counterPokemon element
    counterPokemon.appendChild(tableContainer);
}

// Store the latest call's timestamp
let latestCallTimestamp = 0; 

// Find counter pokemon of the pokemon
async function findCounterPokemon(types, SP_stats) {
    const currentCallTimestamp = Date.now();
    latestCallTimestamp = currentCallTimestamp;

    // Check that the checkbox is checked
    const filterSpe_bst600 = filterCheckbox_bst600.checked;      
    const filterSpe_mega = filterCheckbox_mega.checked;          

    // Clear Content to update
    counterPokemon.innerHTML = '';
    progressContainer.innerHTML = '';

    // Show Header
    cpHead.style.display = 'block';
    // Show Buttons
    settingButton.style.display = 'inline-block';
    updateButton.style.display = 'inline-block';
    scrollUpButton.style.display = 'inline-block';
    scrollDownButton.style.display = 'inline-block';
    
    // Find Weaknesses of the pokemon
    const weaknesses = new Set();
    types.forEach(type => {
        const typeWeaknesses = WeakChart[type];
        if (typeWeaknesses) {
            typeWeaknesses.forEach(weakness => weaknesses.add(weakness));
        }
    });
    types.forEach(type => {
        const typeResistances = ResisChart[type];
        if (typeResistances) {
            typeResistances.forEach(resistance => weaknesses.delete(resistance));
        }
    });
    for (let rep = 0; rep < 2; rep++) {
        types.forEach(type => {
            const typeInval = ResisInvalChart[type];
            if (typeInval) {
                typeInval.forEach(inval => weaknesses.delete(inval));
            }
        });
    }

    const base_url = 'https://pokeapi.co/api/v2/';
    // Create an object to store pokemon scores
    const pokemonScores = {};
    const typeUrls = Array.from(weaknesses).map(type => `${base_url}type/${type.toLowerCase()}`);
    let progress = 0;

    try {
        const typeResponses = await Promise.all(typeUrls.map(url => fetch(url).then(response => response.json())));
        const totalPokemon = typeResponses.reduce((total, typeData) => total + typeData.pokemon.length, 0);

        const pokemonUrls = typeResponses.flatMap(typeData => typeData.pokemon.map(entry => `${base_url}pokemon/${entry.pokemon.name}`));
        const pokemonResponses = await Promise.all(pokemonUrls.map(url => fetch(url).then(response => response.text())));
        
        pokemonResponses.forEach(async (pokemonText, index) => {
            if (currentCallTimestamp !== latestCallTimestamp) return;
            
            const pokemonName = pokemonUrls[index].split('/').pop();
            if(!pokemonName 
                || pokemonName.includes("-totem")       //7th gen totem pokemons
                || pokemonName.includes("pikachu-")     //pikachu forms
                || pokemonName.includes("-dada")        //zarude-dada 
                || pokemonName.includes("-hangry")      //morpeko 
                || pokemonName.includes("-gmax")        //8th gen Gmax
                || pokemonName.includes("-build")       //koraidon
                || pokemonName.includes("-mode")        //miraidon
                ) { 
                    return;
                }
            if (!pokemonName || pokemonName.includes("-mega") && filterSpe_mega) return;

            let pokemonData;
            try {
                pokemonData = JSON.parse(pokemonText);
            } catch (jsonError) {
                console.error('Error parsing JSON for', pokemonName, jsonError);
                return;
            }

            const hp = pokemonData.stats.find(stat => stat.stat.name === 'hp').base_stat;
            const atk = pokemonData.stats.find(stat => stat.stat.name === 'attack').base_stat;
            const def = pokemonData.stats.find(stat => stat.stat.name === 'defense').base_stat;
            const spa = pokemonData.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
            const spd = pokemonData.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
            const spe = pokemonData.stats.find(stat => stat.stat.name === 'speed').base_stat;
            const total = hp + atk + def + spa + spd + spe;

            if (filterSpe_bst600 && total > 600) return;

            if (!pokemonScores[pokemonName]) {
                pokemonScores[pokemonName] = {
                    sprite: pokemonData.sprites.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', 
                    name: pokemonData.name,
                    types: pokemonData.types.map(type => type.type.name).join(', '),
                    abilities: pokemonData.abilities.map(ability => ability.ability.name).join(', '),
                    score: 0,
                    stats: { hp, atk, def, spa, spd, spe, total }
                };
            }

            if (pokemonScores[pokemonName].score === 0) {
                // Score for the pokemon based on matched types
                pokemonScores[pokemonName].score += 15;
                // Scoring based on pokemon's stats
                pokemonScores[pokemonName] = calculate(pokemonScores[pokemonName], SP_stats);
            }

            progress += 1;
            const percentage = Math.floor((progress / totalPokemon) * 100);
            progressContainer.style.width = `${percentage}%`;
            progressContainer.innerHTML = `Loading...${percentage}%`;
        });

    } catch (error) {
        console.error('Error fetching type or pokemon data:', error);
    }

    // Convert the scores object into an array of objects
    const pokemonArray = Object.entries(pokemonScores).map(([name, { score, sprite, types, abilities, stats }]) => ({
        name,
        score,
        sprite,
        types,
        abilities,
        stats
    }));

    // Sort the array by score in descending order
    pokemonArray.sort((a, b) => b.score - a.score);

    // Clear Loading
    progressContainer.style.width = `0%`;
    progressContainer.innerHTML = '';

    makeTable(pokemonArray);
}


/***************
 *  move.html  *
 ***************/
const randomItem = document.getElementById('randomItem');

const moveDetailsDiv = document.getElementById("moveDetails");
const learnGroupDiv = document.getElementById("learnGroup");

const moveNameDisplay = document.getElementById("moveNameDisplay");
const foreignMoveName = document.getElementById("foreignMoveName");
const moveType = document.getElementById("moveType");
const moveDamageClass = document.getElementById("moveDamageClass");

const moveInfo = document.getElementById("moveInfo");
const movePower = document.getElementById("movePower");
const moveAccuracy = document.getElementById("moveAccuracy");
const movePP = document.getElementById("movePP");

const moveInfo2 = document.getElementById("moveInfo2");
const effect = document.getElementById("effect");
const ailment = document.getElementById("ailment");
const moveMoreInfo = document.getElementById("moveMoreInfo");
const movePriority = document.getElementById("movePriority");
const ailmentEffect = document.getElementById("left-half-effect");
const moveAilmentChance = document.getElementById("moveAilmentChance");
const moveGeneration = document.getElementById("moveGeneration");

const moveTarget = document.getElementById("moveTarget");
const moveTargetInfo = document.getElementById("moveTargetInfo");
const moveStatChanges = document.getElementById("moveStatChanges");
const learnedByPokemon = document.getElementById("learnedByPokemon");  

if(moveName){
    // Add a keydown event listener to the input field
    moveName.addEventListener('keydown', (event) => {
        // Check if the key pressed is the Enter key (key code 13)
        if (event.keyCode === 13) {
            searchMove();
            if(pokemonDropdown){
                pokemonDropdown.innerHTML = '';
                pokemonDropdown.style.display = 'none';
            }        
        }
    });
}

// Search Move Information
async function searchMove() {
    const moveNameInput = document.getElementById("moveName").value.toLowerCase().replace(/\s+/g, '-');
    const translatedterm = await translate('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/move_names.csv', moveNameInput);
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${translatedterm || moveNameInput}/`);
        const moveData = await response.json();

        scrollTopButton.style.display = 'inline-block';
        moveInfo.style.display = "inline-flex";
        moveInfo2.style.display = "flex";
        moveMoreInfo.style.display = "inline-flex";
        moveTarget.style.display = "grid";
        effect.style.display = "table-cell";

        // Damage Class
        if(moveData.damage_class.name==="physical"){
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png';
            randomItem.title = 'choice-band';
        } else if(moveData.damage_class.name==="special"){
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png';
            randomItem.title = 'choice-specs';
        } else {
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png';
            randomItem.title = 'focus-sash';
        }

        // Move Name, Type, and Damage Class
        moveNameDisplay.textContent = capitalization(moveData.name);
        foreignMoveName.textContent = getForeignName(moveData.names);
        moveType.innerHTML =  `
            <div class="tooltip-moves">
                <img src="https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(moveData.type.name)}.png" 
                    alt="${moveData.type.name}" 
                    class="type-image" 
                    width="60px">
                <span class="tooltiptext">${moveData.type.name}</span>
            </div>
            <div class="tooltip-moves">
                <img src="https://raw.githubusercontent.com/msikma/pokesprite/master/misc/seals/home/move-${moveData.damage_class.name}.png" 
                    alt="${moveData.damage_class.name}" 
                    class="type-image" 
                    width="60px">
                <span class="tooltiptext">${moveData.damage_class.name}</span>
            </div>`;

        //Power, Accuracy, and PP
        movePower.textContent = moveData.power || "-";
        moveAccuracy.textContent = `${(moveData.accuracy === null || moveData.accuracy === 0) ? "-" : moveData.accuracy}` || "-";
        movePP.textContent = moveData.pp || "-";
        
        // Move Effect
        if(moveData.effect_entries.length>0){
            effect.innerHTML = `
                <h3>Short Description</h3>
                <p>${moveData.effect_entries[0].short_effect || ""}</p>
                <h3>Long Description</h3>
                <p>${moveData.effect_entries[0].effect || ""}</p>
            `;
        } else {
            effect.innerHTML = ``;
        }
        
        // Move Target
        const target = moveData.target.name;
        moveTargetInfo.textContent = capitalization(target.replace(" me first", "")) || "N/A";
        
        const targetMappings = {
            "specific-move": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#ff0800", box5: "#00d6fa", box6: "#00d6fa"},
            "selected-pokemon-me-first": { box1: "#ff0800", box2: "#ff0800", box3: "#00d6fa", box4: "#00d6fa", box5: "#00d6fa", box6: "#00d6fa"},
            "ally": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#00d6fa", box5: "#ff0800", box6: "#00d6fa"},
            "users-field": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#ff0800", box5: "#ff0800", box6: "#ff0800"},
            "user-or-ally": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#b5338a", box5: "#b5338a", box6: "#00d6fa"},
            "opponents-field": { box1: "#ff0800", box2: "#ff0800", box3: "#ff0800", box4: "#00d6fa", box5: "#00d6fa", box6: "#00d6fa"},
            "user": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#ff0800", box5: "#00d6fa", box6: "#00d6fa"},
            "random-opponent": { box1: "#b5338a", box2: "#b5338a", box3: "#00d6fa", box4: "#ff0800", box5: "#00d6fa", box6: "#00d6fa"},
            "all-other-pokemon": { box1: "#ff0800", box2: "#ff0800", box3: "#00d6fa", box4: "#00d6fa", box5: "#ff0800", box6: "#00d6fa"},
            "selected-pokemon": { box1: "#b5338a", box2: "#b5338a", box3: "#00d6fa", box4: "#00d6fa", box5: "#b5338a", box6: "#00d6fa"},
            "all-opponents": { box1: "#ff0800", box2: "#ff0800", box3: "#00d6fa", box4: "#00d6fa", box5: "#00d6fa", box6: "#00d6fa"},
            "entire-field": { box1: "#ff0800", box2: "#ff0800", box3: "#ff0800", box4: "#ff0800", box5: "#ff0800", box6: "#ff0800"},
            "user-and-allies": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#ff0800", box5: "#ff0800", box6: "#ff0800"},
            "all-pokemon": { box1: "#ff0800", box2: "#ff0800", box3: "#ff0800", box4: "#ff0800", box5: "#ff0800", box6: "#ff0800"},
            "all-allies": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#ff0800", box5: "#ff0800", box6: "#ff0800"},
            "fainting-pokemon": { box1: "#00d6fa", box2: "#00d6fa", box3: "#00d6fa", box4: "#00d6fa", box5: "#00d6fa", box6: "#00d6fa"}
        };
    
        for (const boxId in targetMappings[target]) {
            // Get the corresponding color from the targetMappings
            const color = targetMappings[target][boxId];
            
            // Update the box color
            document.getElementById(boxId).style.backgroundColor = color;
        }    

        // Define an object to map stat names to corresponding elements
        const statElements = {
            "hp": document.getElementById("hp"),
            "attack": document.getElementById("atk"),
            "defense": document.getElementById("def"),
            "special-attack": document.getElementById("spa"),
            "special-defense": document.getElementById("spd"),
            "speed": document.getElementById("spe"),
            "accuracy": document.getElementById("acc"),
            "evasion": document.getElementById("eva"),
        };

        // Initialize all stat elements to 0
        Object.values(statElements).forEach(element => {
            element.textContent = 0;
            element.style.color = "black";
        });

        // Loop through stat_changes and update corresponding elements
        for (const statChange of moveData.stat_changes) {
            const statName = statChange.stat.name;
            const statElement = statElements[statName];

            if (statElement) {
                statElement.textContent = statChange.change;
                if(statChange.change<0) statElement.style.color = "#00d6fa";
                else if(statChange.change>0) statElement.style.color = "#ff0800";
                else statElement.style.color = "black";
            }
        }
        
        // Define color map for ailments
        const ailmentColors = {
            Freeze: "#00d6fa",
            Burn: "#ff0800",
            Paralysis: "#ffd300",
            Poison: "purple",
            Effect: "black",
        };

        if (moveData.meta) {
            if(moveData.meta.ailment.name === "none"){
                if(moveData.meta.flinch_chance > 0) ailment.textContent = "Flinch"
                else ailment.textContent = "Effect"
            } else {
                ailment.textContent = capitalization(moveData.meta.ailment.name);
            }
            moveAilmentChance.textContent = moveData.meta.ailment_chance === 0 ? moveData.effect_chance || "-" : moveData.meta.ailment_chance || "-";
            ailmentEffect.style.backgroundColor = ailmentColors[ailment.textContent] || "gray";
        } else {
            // Set default values when moveData.meta is not available
            ailment.textContent = "Effect";
            moveAilmentChance.textContent = "-";
            ailmentEffect.style.backgroundColor = "black";
        }
        movePriority.textContent = (moveData.priority !== undefined && moveData.priority !== null) ? moveData.priority : "-";
        moveGeneration.textContent = (moveData.generation.name).split('-')[1].toUpperCase() || "-";
        
        // Flavor Text from In-Game
        const flavorTextEntries = moveData.flavor_text_entries.filter(entry => entry.language.name === "en");

        if (flavorTextEntries.length > 0) {
            const randomIndex = Math.floor(Math.random() * flavorTextEntries.length);
            const randomFlavorTextEntry = flavorTextEntries[randomIndex];
            effect.innerHTML += `<h3>In-Game Description</h3>`;
            effect.innerHTML += `<p>${randomFlavorTextEntry.flavor_text}</p>`;
        } else {
            effect.textContent = "N/A";
        }

        // All pokemon sprites who learn the move
        if (moveData.learned_by_pokemon) {
            const pokemonList = moveData.learned_by_pokemon;
            const sprites = await Promise.all(pokemonList.map(async pokemon => {
                const pokemonData = await fetch(pokemon.url);
                const pokemonDetails = await pokemonData.json();
                return pokemonDetails.sprites.front_default;
            }));

            if(pokemonList.length > 0) learnedByPokemon.style.display = "block";
            else learnedByPokemon.style.display = "none";

            learnedByPokemon.innerHTML = '<h3> Learn By Pokémon</h3>';
            for (let i = 0; i < pokemonList.length; i++) {
                const sprite = sprites[i];
                const pokemonName = pokemonList[i].name;
            
                const a = document.createElement('a');
                a.href = `./info.html?s=${pokemonName}`;
                a.target = '_blank'; // Opens the link in a new tab
            
                const img = document.createElement('img');
                img.src = sprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                img.alt = pokemonName;
                img.title = pokemonName;
                img.style.width = "60px";
            
                a.appendChild(img);
                learnedByPokemon.appendChild(a);
            }
        } else {
            learnedByPokemon.textContent = "N/A";
        }
    } catch (error) {
        console.error(error);
        alert("Move not found. Please try again.");
    }
}

/***************
 *  item.html  *
***************/
const itemSprite = document.getElementById('itemSprite');
const item = document.getElementById('item');
const chooseItemSprite = document.getElementById('chooseItemSprite');
const selectItemSprite = document.getElementById('itemSpriteType');
const itemEffect = document.getElementById('itemEffect');
const itemPokemon = document.getElementById('itemPokemon');
let global_itemName, global_itemImage;

if(itemName){
    // Add a keydown event listener to the input field
    itemName.addEventListener('keydown', (event) => {
        // Check if the key pressed is the Enter key (key code 13)
        if (event.keyCode === 13) {
            searchItem();
            if(pokemonDropdown){
                pokemonDropdown.innerHTML = '';
                pokemonDropdown.style.display = 'none';
            }        
        }
    });
}

// Add event listener to the dropdown menu
if(selectItemSprite){
    selectItemSprite.addEventListener('change', () => {
        
        // Update the sprite in the HTML
        const itemSprite = document.querySelector('.pokemon-image');
        if (itemSprite) itemSprite.src = getItemSprite(global_itemName, global_itemImage);
    });
}

// Get Sprites of the item
function getItemSprite(itemName, itemImage){
    chooseItemSprite.style.display = 'inline-block';

    var labelText = selectItemSprite.options[selectItemSprite.selectedIndex].text;

    const defaultImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mega-glove.png';

    let sprite;
    const imageMappings = {
        "Pixel Art": { sprite: itemImage },
        "Pokémon Dream World": { sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dream-world/${itemName}.png` },
        "Underground": { sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/underground/${itemName}.png` },
    };
    // Choose Category to take image
    if (labelText in imageMappings) {
        ({ sprite } = imageMappings[labelText]);
    } else {
        // Default Image
        sprite = defaultImage;
    }

    return sprite||defaultImage;
}

// Search Item Information
async function searchItem() {
    const itemNameInput = document.getElementById("itemName").value.toLowerCase().replace(/\s+/g, '-');
    const translatedterm = await translate('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/item_names.csv', itemNameInput);
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/item/${translatedterm || itemNameInput}/`);
        const itemData = await response.json();
        scrollTopButton.style.display = 'inline-block';
        newItem();
        // Item Name and Sprite
        itemSprite.innerHTML = 
            `
                <h2>${capitalization(itemData.name)}</h2>
                <p>${getForeignName(itemData.names)}</p>
                <img src="${getItemSprite(itemData.name, itemData.sprites.default)}" 
                alt="${itemNameInput}" width="130" class="pokemon-image">
            `;
        global_itemName = itemData.name;
        global_itemImage = itemData.sprites.default;
        
        // Category, Attribute, Fling (effect and power)
        const attributes = itemData.attributes.map(attribute => capitalization(attribute.name));
        if(attributes.length === 0) attributes.push("N/A");
        const flingEffectName = (itemData.fling_effect) != null ? itemData.fling_effect.name : "Effect";
        var flingEffect = "N/A", flingPower = itemData.fling_power||"N/A";
        if(flingEffectName != "Effect"){
            const response = await fetch(itemData.fling_effect.url);
            const flingEffectData = await response.json(); 
            flingEffect = flingEffectData.effect_entries[0].effect||"N/A";
        }
        item.innerHTML = `
            <h3>Category</h3>
            <p>${capitalization(itemData.category.name)}</p>
            <h3>Attribute</h3>
            <p>${attributes.join(", ")}</p>
            <h3>Fling</h3>
            <p>${capitalization(flingEffectName)}: ${flingEffect}</p>
            <p>Power: ${flingPower}</p>
        `

        // Item Description
        if(itemData.effect_entries.length>0){
            itemEffect.innerHTML = `
                <h3>Short Description</h3>
                <p>${itemData.effect_entries[0].short_effect || ""}</p>
                <h3>Long Description</h3>
                <p>${itemData.effect_entries[0].effect || ""}</p>
            `;
        } else {
            itemEffect.innerHTML = `
            <h3>Short Description</h3>
            <p>none</p>
            <h3>Long Description</h3>
            <p>none</p>
        `;
        }

        // Item In-Game Description
        const flavorTextEntries = itemData.flavor_text_entries.filter(entry => entry.language.name === "en");
        if (flavorTextEntries.length > 0) {
            const randomIndex = Math.floor(Math.random() * flavorTextEntries.length);
            const randomFlavorTextEntry = flavorTextEntries[randomIndex];
            itemEffect.innerHTML += `<h3>In-Game Description</h3>`;
            itemEffect.innerHTML += randomFlavorTextEntry.text;
        } else {
            itemEffect.innerHTML += `<h3>In-Game Description</h3>`;
            itemEffect.innerHTML += `N/A`;
        }

        // All pokemon sprites who held the item
        if (itemData.held_by_pokemon) {
            const pokemonList = itemData.held_by_pokemon;
            const sprites = await Promise.all(pokemonList.map(async pokemon => {
                const pokemonData = await fetch(pokemon.pokemon.url);
                const pokemonDetails = await pokemonData.json();
                return pokemonDetails.sprites.front_default;
            }));

            itemPokemon.innerHTML = '<h3> Held By Pokémon</h3>';
            if(pokemonList.length <= 0) itemPokemon.innerHTML += '<p>none</p>';

            for (let i = 0; i < pokemonList.length; i++) {
                const sprite = sprites[i];
                const pokemonName = pokemonList[i].pokemon.name;
            
                const a = document.createElement('a');
                a.href = `./info.html?s=${pokemonName}`;
                a.target = '_blank'; // Opens the link in a new tab
            
                const img = document.createElement('img');
                img.src = sprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                img.alt = pokemonName;
                img.title = pokemonName;
                img.style.width = "80px";
            
                a.appendChild(img);
                itemPokemon.appendChild(a);
            }
        } else {
            itemPokemon.textContent = "N/A";
        }
    } catch (error) {
        console.error(error);
        alert("Item not found. Please try again.");
    }
}

/***************
 *  Berry.html  *
 ***************/

// Sample berry data
const berries = [
    { number: '126', name: '', sprite: '', type: 'Status Recover', detail: 'Cure paralysis'},
    { number: '127', name: '', sprite: '', type: 'Status Recover', detail: 'Cure sleep'},
    { number: '128', name: '', sprite: '', type: 'Status Recover', detail: 'Cure poison'},
    { number: '129', name: '', sprite: '', type: 'Status Recover', detail: 'Cure burn'},
    { number: '130', name: '', sprite: '', type: 'Status Recover', detail: 'Cure freeze'},
    { number: '131', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 10 PP'},
    { number: '132', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 10 HP when at 1/2 max HP or less'},
    { number: '133', name: '', sprite: '', type: 'Status Recover', detail: 'Cure confusion'},
    { number: '134', name: '', sprite: '', type: 'Status Recover', detail: 'Cure non-volatile status + confusion'},
    { number: '135', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore HP 1/4 max HP when at 1/2 max HP or less'},
    { number: '136', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 1/3 max HP at 1/4 max HP or less; confuses if -Atk Nature'},
    { number: '137', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 1/3 max HP at 1/4 max HP or less; confuses if -SpA Nature'},
    { number: '138', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 1/3 max HP at 1/4 max HP or less; confuses if -Spe Nature'},
    { number: '139', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 1/3 max HP at 1/4 max HP or less; confuses if -SpD Nature'},
    { number: '140', name: '', sprite: '', type: 'HP/PP Recover', detail: 'Restore 1/3 max HP at 1/4 max HP or less; confuses if -Def Nature'},
    { number: '141', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Dry★, Spicy★'},
    { number: '142', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sweet★, Dry★'},
    { number: '143', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Bitter★, Sweet★'},
    { number: '144', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sour★, Bitter★'},
    { number: '145', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Spicy★, Sour★'},
    { number: '146', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers HP EV by 10'},
    { number: '147', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers Atk EV by 10'},
    { number: '148', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers Def EV by 10'},
    { number: '149', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers SpA EV by 10'},
    { number: '150', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers SpD EV by 10'},
    { number: '151', name: '', sprite: '', type: 'Friendship and EV', detail: 'Increases happiness by 10/5/2; Lowers Spe EV by 10'},
    { number: '152', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Dry★★, Sweet★'},
    { number: '153', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sweet★★, Bitter★'},
    { number: '154', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Bitter★★, Sour★'},
    { number: '155', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sour★★, Spicy★'},
    { number: '156', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Spicy★★★, Dry★'},
    { number: '157', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Dry★★★, Sweet★'},
    { number: '158', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sweet★★★, Bitter★'},
    { number: '159', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Bitter★★★, Sour★'},
    { number: '160', name: '', sprite: '', type: 'Pokéblock/Poffin', detail: 'Sour★★★, Spicy★'},
    { number: '161', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Fire-type Attack'},
    { number: '162', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Water-type Attack'},
    { number: '163', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Electric-type Attack'},
    { number: '164', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Grass-type Attack'},
    { number: '165', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Ice-type Attack'},
    { number: '166', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Fighting-type Attack'},
    { number: '167', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Poison-type Attack'},
    { number: '168', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Ground-type Attack'},
    { number: '169', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Flying-type Attack'},
    { number: '170', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Psychic-type Attack'},
    { number: '171', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Bug-type Attack'},
    { number: '172', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Rock-type Attack'},
    { number: '173', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Ghost-type Attack'},
    { number: '174', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Dragon-type Attack'},
    { number: '175', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Dark-type Attack'},
    { number: '176', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Steel-type Attack'},
    { number: '177', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves Normal-type Attack'},
    { number: '178', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises Atk by 1 stage when at 1/4 max HP or less'},
    { number: '179', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises Def by 1 stage when at 1/4 max HP or less'},
    { number: '180', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises Spe by 1 stage when at 1/4 max HP or less'},
    { number: '181', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises SpA by 1 stage when at 1/4 max HP or less'},
    { number: '182', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises SpD by 1 stage when at 1/4 max HP or less'},
    { number: '183', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises Acc by 2 stages when at 1/4 max HP or less'},
    { number: '184', name: '', sprite: '', type: 'Low HP Effect', detail: 'Raises Random Stat(not acc/eva) by 2 stages when at 1/4 max HP or less'},
    { number: '185', name: '', sprite: '', type: 'Hit by Skills', detail: 'Restores 1/4 max HP after hit by supereffective move'},
    { number: '186', name: '', sprite: '', type: 'Low HP Effect', detail: 'Next move has 1.2x acc when at 1/4 max HP or less'},
    { number: '187', name: '', sprite: '', type: 'Low HP Effect', detail: 'Moves first when at 1/4 max HP or less'},
    { number: '188', name: '', sprite: '', type: 'Hit by Skills', detail: 'Attacker loses 1/8 of its max HP with physical move'},
    { number: '189', name: '', sprite: '', type: 'Hit by Skills', detail: 'Attacker loses 1/8 of its max HP with special move'},
    { number: '723', name: '', sprite: '', type: 'Halve Type damage', detail: 'Halves supereffective Fairy-type Attack'},
    { number: '724', name: '', sprite: '', type: 'Hit by Skills', detail: 'Raises Def by 1 stage after hit by physical attack'},
    { number: '725', name: '', sprite: '', type: 'Hit by Skills', detail: 'Raises SpD by 1 stage after hit by special attack'},
];

// Get reference to the filter dropdowns
const typeFilter = document.getElementById("typeFilter");
const detailFilter = document.getElementById("detailFilter");

// Function to populate the filter dropdowns
function populateFilters() {
    // Array to store unique types and details
    let uniqueTypes = ["all"]; // Include "All Types" option
    let uniqueDetails = [{ value: "all", type: "all", text: "-----" }]; // Include "Details" option

    // Iterate over berries array
    berries.forEach(berry => {
        // Add type to uniqueTypes if not already present
        if (!uniqueTypes.includes(berry.type.toLowerCase())) {
            uniqueTypes.push(berry.type.toLowerCase());
        }

        // Add detail to uniqueDetails if not already present
        if (!uniqueDetails.find(item => item.value === berry.detail.toLowerCase())) {
            uniqueDetails.push({
                value: berry.detail.toLowerCase(),
                type: berry.type.toLowerCase(),
                text: berry.detail
            });
        }
    });

    // Populate typeFilter dropdown
    if(typeFilter) typeFilter.innerHTML = "";
    uniqueTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type === "all" ? type : type.toLowerCase();
        option.textContent = type === "all" ? "All Types" : capitalization(type);
        if(typeFilter) typeFilter.appendChild(option);
    });

    // Populate detailFilter dropdown
    if(detailFilter) detailFilter.innerHTML = "";
    uniqueDetails.forEach(detail => {
        const option = document.createElement("option");
        option.value = detail.value;
        option.dataset.type = detail.type === "all" ? "all" : detail.type.toLowerCase();
        option.textContent = detail.text;
        if(detailFilter) detailFilter.appendChild(option);
    });
}

// Call the function to populate filters
populateFilters();

// Function to fetch data from PokeAPI
async function fetchBerryData() {
    // Create an array of promises for fetching berry data
    const fetchPromises = berries.map(async (berry) => {
        const response = await fetch(`https://pokeapi.co/api/v2/item/${berry.number}`);
        const data = await response.json();
        
        // Update name and sprite fields
        return { ...berry, name: data.name, sprite: data.sprites.default };
    });

    // Wait for all promises to resolve
    const updatedBerries = await Promise.all(fetchPromises);

    // Update the berries array with the new data
    updatedBerries.forEach((updatedBerry, index) => {
        berries[index] = updatedBerry;
    });
}

// Function to filter berries based on type and size
function filterBerries() {
    const typeFilterValue = typeFilter.value;
    const detailFilterValue = detailFilter.value;

    const filteredBerries = berries.filter(berry => {
        return (typeFilterValue === 'all' || berry.type.toLowerCase() === typeFilterValue.toLowerCase()) &&
               (detailFilterValue === 'all' || berry.detail.toLowerCase() === detailFilterValue.toLowerCase());
    });

    displayBerries(filteredBerries);
}

// Function to update size options based on the selected type
function updateSizeOptions() {
    if(detailFilter){
        // Hide all size options
        for (let i = 0; i < detailFilter.options.length; i++) {
            detailFilter.options[i].style.display = 'none';
        }

        // Show size options corresponding to the selected type
        for (let i = 0; i < detailFilter.options.length; i++) {
            const option = detailFilter.options[i];
            const optionType = option.getAttribute('data-type');

            if (typeFilter && (typeFilter.value === 'all' || typeFilter.value === optionType)) {
                option.style.display = '';
            }
        }
    }
}
  
// Function to display berries in the container
function displayBerries(berries) {
    const berryContainer = document.getElementById('berryContainer');
    if(berryContainer) berryContainer.innerHTML = '';

    fetchBerryData().then(() => {
        berries.forEach(berry => {
            const berryElement = document.createElement('div');
            berryElement.classList.add('berry');

            // Create an image element for the sprite
            const spriteElement = document.createElement('img');
            spriteElement.src = berry.sprite;
            spriteElement.alt = berry.name;
            spriteElement.style.width = '100%';

            // Add click event listener to store the name of the clicked berry
            spriteElement.addEventListener('click', function () {
                // Store the name of the clicked berry into a variable
                const clickedBerryName = berry.name;
                getBerryData(berries, clickedBerryName); // Pass the berries array
            });

            // Append both elements to the berry container
            berryElement.appendChild(spriteElement);

            if(berryContainer) berryContainer.appendChild(berryElement);
        });
    })
}

async function getBerryData(berries, clickedBerryName){
    const berryInfo = document.getElementById('berryInfo');

    const response = await fetch(`https://pokeapi.co/api/v2/item/${clickedBerryName}`);
    const data = await response.json();

    if(clickedBerryName !== "roseli-berry" && clickedBerryName !== "kee-berry" && clickedBerryName !== "maranga-berry") {
        var berryResponse = await fetch(`https://pokeapi.co/api/v2/berry/${clickedBerryName.split('-')[0]}`);
        var berryData = await berryResponse.json();
    } else if (clickedBerryName == "roseli-berry"){
        var berryData = {
              "firmness": {"name": "Hard"}, "size": 35,
              "flavors": [
                {"flavor": {"name": "Spicy"},"potency": 0},
                {"flavor": {"name": "Dry"},"potency": 0},  
                {"flavor": {"name": "Sweet"},"potency": 25},
                {"flavor": {"name": "Bitter"},"potency": 10},
                {"flavor": {"name": "Sour"},"potency": 0}  
              ],
              "smoothness": 35,
              "natural_gift_type": {"name": "Fairy"},
              "natural_gift_power": 60
        }          
    } else if (clickedBerryName == "kee-berry"){
        var berryData = {
            "firmness": {"name": "Unknown"}, "size": "???",
            "flavors": [
              {"flavor": {"name": "Spicy"},"potency": 30},
              {"flavor": {"name": "Dry"},"potency": 30},  
              {"flavor": {"name": "Sweet"},"potency": 10},
              {"flavor": {"name": "Bitter"},"potency": 10},
              {"flavor": {"name": "Sour"},"potency": 10}  
            ],
            "smoothness": "???",
            "natural_gift_type": {"name": "Fairy"},
            "natural_gift_power": 80
      }          
    } else if (clickedBerryName == "maranga-berry"){
        var berryData = {
            "firmness": {"name": "Unknown"}, "size": "???",
            "flavors": [
              {"flavor": {"name": "Spicy"},"potency": 10},
              {"flavor": {"name": "Dry"},"potency": 10},  
              {"flavor": {"name": "Sweet"},"potency": 30},
              {"flavor": {"name": "Bitter"},"potency": 30},
              {"flavor": {"name": "Sour"},"potency": 10}  
            ],
            "smoothness": "???",
            "natural_gift_type": {"name": "Dark"},
            "natural_gift_power": 80
      }
    }

    berryInfo.innerHTML = `
        <h2>${capitalization(data.name)}</h2>
        <p>${getForeignName(data.names)}</p>
        <img src="${data.sprites.default}" 
        alt="${data.name}" width="100" class="pokemon-image">
    `;
    // Item Description
    if(data.effect_entries.length>0){
        berryInfo.innerHTML += `
            <h3>Short Description</h3>
            <p>${data.effect_entries[0].short_effect || ""}</p>
            <h3>Long Description</h3>
            <p>${data.effect_entries[0].effect || ""}</p>
        `;
    } else {
        berryInfo.innerHTML += `
        <h3>Short Description</h3>
        <p>none</p>
        <h3>Long Description</h3>
        <p>none</p>
    `;
    }

    // Item In-Game Description
    const flavorTextEntries = data.flavor_text_entries.filter(entry => entry.language.name === "en");
    if (flavorTextEntries.length > 0) {
        const randomIndex = Math.floor(Math.random() * flavorTextEntries.length);
        const randomFlavorTextEntry = flavorTextEntries[randomIndex];
        berryInfo.innerHTML += `<h3>In-Game Description</h3>`;
        berryInfo.innerHTML += `<p>${randomFlavorTextEntry.text}</p>`;
    } else {
        berryInfo.innerHTML += `<h3>In-Game Description</h3>`;
        berryInfo.innerHTML += `N/A`;
    }    

    // Fling Effect and Power
    const flingEffectName = (data.fling_effect) != null ? data.fling_effect.name : "Effect";
    var flingEffect = "N/A", flingPower = data.fling_power||"N/A";
    if(flingEffectName != "Effect"){
        const response = await fetch(data.fling_effect.url);
        const flingEffectData = await response.json(); 
        flingEffect = flingEffectData.effect_entries[0].effect||"N/A";
    }
    berryInfo.innerHTML += `
        <h3>Fling</h3>
        <p>${flingEffect}</p>
        <p>Power: ${flingPower}</p>
    `;    

    if(berryData){
        // Natural Gift Type & Power
        const type = berryData.natural_gift_type.name;
        const typeImage = 
            `<div class="tooltip-types-origin">
                <img src="https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalization(type)}.png" 
                    alt="${type}" 
                    class="type-image" 
                    width="30px">
                <span class="tooltiptext">${type}</span>
            </div>`;

        berryInfo.innerHTML += 
        `
            <h3>Natural Gift</h3>
            <p>${typeImage} Power: ${berryData.natural_gift_power+20}</p>
        `;
        
        // Info
        berryInfo.innerHTML += 
        `
            <h3>Berry Info</h3>
            <p>${berryData.firmness.name}, ${berryData.size}mm</p>
        `;

        // Flavors
        berryInfo.innerHTML += `<h3>Flavors</h3>`;
        const maxPotency = 50;
        const barWidth = 150; // Adjust this value as needed
        berryData.flavors.forEach(flavor => {
            const barLength = (flavor.potency / maxPotency) * barWidth;
            berryInfo.innerHTML += `
                <div style="display: flex; align-items: flex-start;">
                    <p style="margin-right: 10px; width: 100px;">${flavor.flavor.name}</p>
                    <div style="width: ${barWidth}px; background-color: lightgray; height: 20px; position: relative;">
                        <div style="position: absolute; width: ${barLength}px; background-color: blue; height: 20px;"></div>
                    </div>
                    <p style="margin-left: 10px;">${flavor.potency}</p>
                </div>
            `;
        });
        berryInfo.innerHTML += `<p>Smoothness: ${berryData.smoothness}</p>`
    }
}
  
  // Event listener for type filter changes
  if(typeFilter){
    typeFilter.addEventListener('change', function () {
        filterBerries();
        updateSizeOptions();
    });
  }
  
  // Event listener for size filter changes
  if(detailFilter) detailFilter.addEventListener('change', filterBerries);
  
  if (window.location.pathname.includes('berry.html')){
    // Initial update of size options
    updateSizeOptions();
    // Initial display of all berries
    displayBerries(berries);
  }
  
/***************
 *  color.html  *
 ***************/
const colorPokemon = document.getElementById("colorPokemon");

async function activateButton(button, value) {
    // Damage Class
    switch(value) {
        case 1:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dark-gem.png';
            randomItem.title = 'dark-gem';
            updateColors("black");
            break;
        case 2:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-gem.png';
            randomItem.title = 'water-gem';
            updateColors("blue");
            break;
        case 3:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ground-gem.png';
            randomItem.title = 'ground-gem';
            updateColors("brown");
            break;
        case 4:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/steel-gem.png';
            randomItem.title = 'steel-gem';
            updateColors("gray");
            break;
        case 5:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grass-gem.png';
            randomItem.title = 'grass-gem';
            updateColors("green");
            break;
        case 6:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fairy-gem.png';
            randomItem.title = 'fairy-gem';
            updateColors("pink");
            break;
        case 7:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poison-gem.png';
            randomItem.title = 'poison-gem';
            updateColors("purple");
            break;
        case 8:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-gem.png';
            randomItem.title = 'fire-gem';
            updateColors("red");
            break;
        case 9:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/normal-gem.png';
            randomItem.title = 'normal-gem';
            updateColors("white");
            break;
        case 10:
            randomItem.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electric-gem.png';
            randomItem.title = 'electric-gem';
            updateColors("yellow");
            break;
        default:
            randomItem.src = '';
            randomItem.title = 'unknown';
            break;
    }

    try {
        // Display a loading message
        colorPokemon.innerHTML = '<p>Loading...</p>';
        
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.circle-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        button.classList.add('active');

        // Fetch Pokemon color data
        const url = `https://pokeapi.co/api/v2/pokemon-color/${value}/`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Extract digit and attach it to the pokemon data
        const pokemonList = data.pokemon_species.map(pokemon => {
            const parts = pokemon.url.split('/').filter(part => part !== '');
            const digit = parseInt(parts[parts.length - 1]);
            return { ...pokemon, digit };
        });

        // Sort the pokemonList by digit
        pokemonList.sort((a, b) => a.digit - b.digit);

        // Fetch Pokemon sprites
        const sprites = await Promise.all(pokemonList.map(async pokemon => {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.digit}.png`;
        }));

        // Clear the loading message and prepare for new content
        colorPokemon.innerHTML = '';

        // Display Pokemon sprites and names
        pokemonList.forEach((pokemon, index) => {
            const a = document.createElement('a');
            a.href = `./info.html?s=${pokemon.name}`;
            a.target = '_blank'; // Opens the link in a new tab
        
            const img = document.createElement('img');
            img.src = sprites[index] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            img.alt = pokemon.name;
            img.title = pokemon.name;
            img.style.width = "80px";
        
            a.appendChild(img);
            colorPokemon.appendChild(a);
        });
    } catch (error) {
        colorPokemon.innerHTML = `<p>Error loading data: ${error.message}</p>`;
        console.error('Error:', error);
    }
}