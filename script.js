document.addEventListener('DOMContentLoaded', () => {
    const randomItem = document.getElementById('randomItem');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokeHead = document.getElementById('pokemonHead');
    const chooseSprite = document.getElementById('chooseSprite');
    const pokemonInfo = document.getElementById('pokemonInfo');
    const evolution = document.getElementById('evolution');
    const statsHistogram = document.getElementById('statsHistogram');
    const progressContainer = document.getElementById('progress-bar');
    const dfHead = document.getElementById('dfHead');
    const forms = document.getElementById('forms');
    const heldItems = document.getElementById('heldItems');
    const others = document.getElementById('others');
    const cpHead = document.getElementById('cpHead');
    const counterPokemon = document.getElementById('counterPokemon');
    
    // Filter variables to adjust counter pokemon table
    const spriteButton = document.getElementById('spriteButton');
    const settingButton = document.getElementById('settingButton');
    const updateButton = document.getElementById('updateButton');
    const scrollUpButton = document.getElementById('scrollUpButton');
    const scrollDownButton = document.getElementById('scrollDownButton');
    
    const filter_bst600 = document.getElementById('filter_bst600');
    const filter_mega = document.getElementById('filter_mega');
    const filter_type = document.getElementById('filter_type');
    const filter_abilities = document.getElementById('filter_abilities');
    const filter_baseStat = document.getElementById('filter_baseStat');
    const filter_shiny = document.getElementById('filter_shiny');
    const filter_female = document.getElementById('filter_female');
    const filter_shinyform = document.getElementById('filter_shinyform');
    const filter_back = document.getElementById('filter_back');
    
    const filterCheckbox_bst600 = document.getElementById('filterCheckbox_bst600');
    const filterCheckbox_mega = document.getElementById('filterCheckbox_mega');
    const filterCheckbox_type = document.getElementById('filterCheckbox_type');
    const filterCheckbox_abilities = document.getElementById('filterCheckbox_abilities');
    const filterCheckbox_baseStat = document.getElementById('filterCheckbox_baseStat');
    const filterCheckbox_shiny = document.getElementById('filterCheckbox_shiny');
    const filterCheckbox_female = document.getElementById('filterCheckbox_female');
    const filterCheckbox_shinyform = document.getElementById('filterCheckbox_shinyform');
    const filterCheckbox_back = document.getElementById('filterCheckbox_back');

    const scrollTopButton = document.getElementById("scrollTop");

    // Global variables for updating table
    let global_types, global_statsData, global_sprites, global_speciesUrl;

    // Search button click event
    searchButton.addEventListener('click', () => {
        newItem();
        performSearch();
    });

    // Add a keydown event listener to the input field
    searchInput.addEventListener('keydown', (event) => {
        // Check if the key pressed is the Enter key (key code 13)
        if (event.keyCode === 13) {
            newItem();
            performSearch();
        }
    });

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

    // Function to perform the search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            alert('Please enter a Pokémon name or ID.');
            return;
        }

        fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
            .then((response) => response.json())
            .then(async (data) => {
                const sprites = data.sprites;
                const types = data.types.map((type) => type.type.name);
                const statsData = data.stats.map((stat) => ({ 
                    name: stat.stat.name, 
                    value: stat.base_stat,
                    effort: stat.effort
                }));
                
                // Check ability, write '(hidden)' if the ability is hidden
                let abilities = data.abilities.map((ability) => {
                    const abilityName = ability.ability.name;
                  
                    return ability.is_hidden ? `<br>${abilityName} (hidden)` : abilityName;
                  }).join(', ');                  
                  
                if(data.past_abilities.length>0){
                    abilities += `
                        , <br>
                        <s>${data.past_abilities[0].abilities[0].ability.name}</s>
                        (by ${data.past_abilities[0].generation.name})`
                }
                    
                const speciesUrl = data.species.url;
                const response = await fetch(speciesUrl);
                const speciesData = await response.json();

                // Global variables for click events
                global_sprites = sprites;
                global_types = types;
                global_statsData = statsData;
                global_speciesUrl = speciesUrl;
                
                // Update theme colors
                findColors(data.name, data.id);

                // Main Body
                getPokemonInfo(data.name, data.id, sprites, types, abilities, data.height, data.weight, speciesData.gender_rate);
                getEvolution(speciesData.evolution_chain.url);
                displayStatsHistogram(statsData);
                showForms(speciesUrl);
                showHeldItems(data.held_items);
                trivia(speciesData);
                findCounterPokemon(types, statsData);
            })
            .catch((error) => {
                alert('Pokémon not found. Please try another name or ID.');
                console.error(error);
            });
    }

    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
      
    // Join elements with comma and add <br> after every three elements
    function joinWithLineBreak(elements) {
        const result = [];

        for (let i = 0; i < elements.length; i += 3) {
            result.push(elements.slice(i, i + 3).join('&nbsp&nbsp'));
        }
        return result.join('<br>');
    }
      
    // Get the information of the pokemon
    function getPokemonInfo(name, id, sprites, types, abilities, height, weight, gender_rate){
        // Trace Pokemon's information
        const image = getSprite(sprites);
        const bioInfo = getBioInfo(height, weight, gender_rate);

        // Get weaknesses, resistances, and invalid
        const weaknesses = getWeaknesses(types);
        const resistances = getResistances(types);
        const invalid = getInvalid(types);
        
        // Display the weaknesses, resistances, and invalid
        const weaknessesHtml = weaknesses.length > 0 ? `<h3>Weaknesses</h3><p>${joinWithLineBreak(weaknesses)}</p>` : '';
        const resistancesHtml = resistances.length > 0 ? `<h3>Resistances</h3><p>${joinWithLineBreak(resistances)}</p>` : '';
        const invalidHtml = invalid.length > 0 ? `<h3>Invalids</h3><p>${joinWithLineBreak(invalid)}</p>` : '';

        const typeImages = types.map(type => 
        `<div class="tooltip-types">
            <img src="https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalizeFirstLetter(type)}.png" 
                 alt="${type}" 
                 class="type-image" 
                 width="40px">
            <span class="tooltiptext">${type}</span>
        </div>`
        );
    
        pokeHead.innerHTML = `${name.toUpperCase()}`;
        const html = `
            <div>
                <img src="${image[0]}" alt="${name}" width="130" class="pokemon-image">
                <img src="${image[1]}" alt="${name}" width="130" class="pokemon-image2">
            </div>
            <p>Pokédex #${id}</p>
            <p>${bioInfo}</p>
            <h3>Types</h3>
            ${typeImages.join('&nbsp&nbsp')}
            ${weaknessesHtml}
            ${resistancesHtml}
            ${invalidHtml}
            <h3>Abilities</h3>
            <p>${abilities}</p>
        `;
        pokemonInfo.innerHTML = html;
    }

    // Take weight, height, and gender rate of the pokemon
    function getBioInfo(height, weight, gender_rate){
        let bioInfo = `<div style="display: inline-block; margin-right: 10px;">
                            <i class="fa-solid fa-ruler-vertical"></i> 
                            ${(height/10).toFixed(1)}m
                        </div>`;
        
        if(weight<1500){
            // Weight Scale
            bioInfo += `<div style="display: inline-block; margin-right: 10px;">
                            <i class="fa-solid fa-weight-scale"></i>
                            ${(weight/10).toFixed(1)}kg
                        </div>`;
        } else {
            // Weight Hanging
            bioInfo += `<div style="display: inline-block; margin-right: 10px;">
                            <i class="fa-solid fa-weight-hanging"></i> 
                            ${(weight/10).toFixed(1)}kg
                        </div>`;
        }

        if (gender_rate === -1) {
            bioInfo += `<div style="display: inline-block;">
                            <i class="fa-solid fa-genderless"></i> 
                            genderless
                        </div>`;
        } else {
            bioInfo += `
                <div style="display: inline-block; margin-right: 10px;">
                    <i class="fa-solid fa-mars"></i> 
                    ${(8 - gender_rate) / 8 * 100}%
                </div>
                <div style="display: inline-block;">
                    <i class="fa-solid fa-venus"></i> 
                    ${gender_rate / 8 * 100}%
                </div>
            `;
        }
        return bioInfo;
    }

    // Show and hide sprite settings
    spriteButton.addEventListener('click', ()=>{
        let currentDisplay = window.getComputedStyle(chooseSprite).getPropertyValue('display');
        chooseSprite.style.display = (currentDisplay === 'none') ? 'block' : 'none';

        currentDisplay = window.getComputedStyle(filter_shiny).getPropertyValue('display');
        filter_shiny.style.display = (currentDisplay === 'none') ? 'inline-block' : 'none';

        currentDisplay = window.getComputedStyle(filter_female).getPropertyValue('display');
        filter_female.style.display = (currentDisplay === 'none') ? 'inline-block' : 'none';
    });

    var radioButtons = document.querySelectorAll('#chooseSprite input[type="radio"]');

    // Add event listener to each radio button
    radioButtons.forEach(function(radioButton) {
        radioButton.addEventListener('change', () => {
            // get updated Sprite
            const updatedImage = getSprite(global_sprites);
            
            // Update the sprite in the HTML
            const sprite_front = document.querySelector('.pokemon-image');
            const sprite_back = document.querySelector('.pokemon-image2');
            if (sprite_front) sprite_front.src = updatedImage[0];
            if (sprite_back) sprite_back.src = updatedImage[1];
        })
    });
  
    // Function to handle the click event on the filter buttons
    function handleGetSprite(filterCheckbox) {
        filterCheckbox.addEventListener('click', () => {
            // get updated Sprite
            const updatedImage = getSprite(global_sprites);
            
            // Update the sprite in the HTML
            const sprite_front = document.querySelector('.pokemon-image');
            const sprite_back = document.querySelector('.pokemon-image2');
            if (sprite_front) sprite_front.src = updatedImage[0];
            if (sprite_back) sprite_back.src = updatedImage[1];
        });
    }

    handleGetSprite(filterCheckbox_shiny);
    handleGetSprite(filterCheckbox_female);

    // Get Sprites of the Pokemon (front, back, default, shiny, female)
    function getSprite(sprites){
        spriteButton.style.display = 'inline-block';

        // Check what sprite needs to be shown
        var selectedRadioButton = null;

        // Loop through each radio button to find the selected one
        radioButtons.forEach(function(radioButton) {
            if (radioButton.checked) {
                selectedRadioButton = radioButton;
            }
        });

        // Check if any radio button is selected
        if (selectedRadioButton) var labelText = selectedRadioButton.parentElement.textContent.trim();

        const filterSpe_shiny = filterCheckbox_shiny.checked;       // Shiny sprite
        const filterSpe_female = filterCheckbox_female.checked;     // Female sprite

        let image = [];
        const pokeball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        const masterball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
        const pokeball3D = 'https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/PokeBalls/PokeBall.png'
        const masterball3D = 'https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/PokeBalls/MasterBall.png'

        let category, defaultBall, shinyBall;
        const categoryMappings = {
            "Home": { category: sprites.other.home, defaultBall: pokeball3D, shinyBall: masterball3D },
            "Artwork": { category: sprites.other["official-artwork"], defaultBall: pokeball3D, shinyBall: masterball3D },
            "3D GIF": { category: sprites.other.showdown, defaultBall: pokeball, shinyBall: masterball },
            "Dot GIF": { category: sprites.versions["generation-v"]["black-white"].animated, defaultBall: pokeball, shinyBall: masterball },
        };

        // Choose Category to take image
        if (labelText in categoryMappings) {
            ({ category, defaultBall, shinyBall } = categoryMappings[labelText]);
        } else {
            // Default Images
            category = sprites;
            defaultBall = pokeball;
            shinyBall = masterball;
        }

        //Take image from category; PokeBall if failed 
        if (filterSpe_shiny) {
            if(filterSpe_female&&sprites.front_shiny_female){
                image.push(category.front_shiny_female || shinyBall);
                image.push(category.back_shiny_female || shinyBall);
            } else {
                image.push(category.front_shiny || shinyBall);
                image.push(category.back_shiny || shinyBall);
            }
        } else {
            if(filterSpe_female&&sprites.front_female){
                image.push(category.front_female || defaultBall);
                image.push(category.back_female || defaultBall);
            } else {                    
                image.push(category.front_default || defaultBall);
                image.push(category.back_default || defaultBall);
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
    
    // Set Scroll up Button
    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });  

    // Function to display the Pokemon's stats histogram
    function displayStatsHistogram(statsData) {
        // Max value for Each Stats
        const maxValue = 255;
        let stats = 0;

        statsHistogram.innerHTML = `<h3>Pokémon Stats</h3>`
        // Create HTML for the histogram
        const histogramHTML = statsData.map((stat) => {
            const barWidth = (stat.value / maxValue) * 100;
            stats += stat.value;
            return `
                <div class="stat-bar">
                    <div class="bar-label">
                        <span class="left-part">${capitalizeFirstLetter(stat.name)}: ${stat.value}</span>
                        <span class="right-part">${stat.effort} EV</span>
                    </div>            
                    <div class="bar-container">
                        <div class="bar" style="width: ${barWidth}%;"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Set the HTML content of the histogram container
        statsHistogram.innerHTML += histogramHTML;
        statsHistogram.innerHTML += `<p>Total Base Stats: ${stats}</p>`;
    }
    
    // Show different style of forms
    function handleShowForm(filterCheckbox) {
        filterCheckbox.addEventListener('click', () => {
            showForms(global_speciesUrl);
        });
    }

    handleShowForm(filterCheckbox_shinyform);
    handleShowForm(filterCheckbox_back);

    // Take all forms of the Pokemon
    async function showForms(species){
        const speciesresponse = await fetch(species);
        const speciesData = await speciesresponse.json();
        dfHead.style.display = 'block';
        
        filter_shinyform.style.display = 'inline-block';
        filter_back.style.display = 'inline-block';
        const filterSpe_shinyform = filterCheckbox_shinyform.checked;       // Shiny sprite
        const filterSpe_back = filterCheckbox_back.checked;                 // Back sprite
        forms.innerHTML = '';
        
        for(var i = 0; i<speciesData.varieties.length; i++){
            const url = speciesData.varieties[i].pokemon.url;
            const response = await fetch(url);
            const data = await response.json();

            for(var j  = 0; j<data.forms.length; j++){
                const pokemonName = data.forms[j].name;
                
                const formUrl = data.forms[j].url;
                const formResponse = await fetch(formUrl);
                const formData = await formResponse.json();
                
                // Find the sprite based on checkboxes
                let sprite;
                const pokeball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                const masterball = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
                
                if(filterSpe_shinyform){
                    if(filterSpe_back) sprite = formData.sprites.back_shiny||masterball;
                    else sprite = formData.sprites.front_shiny||masterball;
                } else{
                    if(filterSpe_back) sprite = formData.sprites.back_default||pokeball;
                    else sprite = formData.sprites.front_default||pokeball;
                }
                
                forms.innerHTML += `
                    <div class="tooltip-items">
                        <img src="${sprite}" 
                             alt = "${pokemonName}"
                             width = "60px">
                        <span class="tooltiptext">${pokemonName}</span>
                    </div>`;
            }
        }
    } 

    // Show held item when the Pokemon is in the wild
    function showHeldItems(items){
        heldItems.innerHTML=`<h3>Wild Held Items</h3>`;
        for (var i = 0; i < items.length; i++) {
            const itemName = items[i].item.name;
            const itemImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
    
            heldItems.innerHTML+=`
                <div class="tooltip-items">
                    <img src="${itemImage}" 
                         alt = "held-item"
                         width = "50px">
                    <span class="tooltiptext">${itemName}</span>
                </div>
            `;
        }
        if(items.length===0){
            heldItems.innerHTML+=`<p>none</p>`;
        }
    }
    
    // Write Trivia of the Pokemon
    function trivia(speciesData){
        let genera, eggGroup = [], flavorTexts = [];

        // Take All Egg Groups
        for(var i = 0; i<speciesData.egg_groups.length; i++){
            eggGroup.push(speciesData.egg_groups[i].name);
        }
        if(speciesData.egg_groups.length===0) eggGroup.push("undefined");
        
        // Take English Genera
        for(var i = 0; i<speciesData.genera.length; i++){
            if(speciesData.genera[i].language.name==="en"){
                genera = speciesData.genera[i].genus;
                break;
            }
        }
        if(speciesData.genera.length===0) genera = "undefined";

        // Take All English Flavor Texts
        for(var i = 0; i<speciesData.flavor_text_entries.length; i++){
            if(speciesData.flavor_text_entries[i].language.name==="en"){
                flavorTexts.push(speciesData.flavor_text_entries[i].flavor_text);
            }
        }
        if(speciesData.flavor_text_entries.length===0) flavorTexts.push("undefined");
        
        others.innerHTML = `
            <h3>Egg Groups</h3>
            <p>${eggGroup.join(', ')}</p>
            <h3>Trivia</h3>
            <p>${genera}</p>
            <p>${flavorTexts[Math.floor(Math.random()*flavorTexts.length)]}</p>
        `;
    }
    
    // Change Pokemon name in evolution chain into an image
    function evolutionWithImages(evolutionDetails) {
        const matches = evolutionDetails.match(/(?:<br>-> |<br>or |^)([a-zA-Z-]+)/g);
      
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

                const imgTooltip = `
                <div class="tooltip-pokemon">
                    <img src="${img}" 
                         alt="${pokemonName}" 
                         width="60px"/>
                    <span class="tooltiptext">${pokemonName}</span>
                </div>`
        
                evolutionDetails = evolutionDetails.replace(pokemonName, imgTooltip);
            } catch (error) {
                console.error(`Error fetching data for ${pokemonName}:`, error);
            }
        });
      
        return Promise.all(fetchPromises).then(() => evolutionDetails);
    }

    function getEvolution(evolutionChainUrl){
        // Get evolution chain details
        fetch(evolutionChainUrl)
            .then((response) => response.json())
            .then((evolutionData) => {
                const evolutionDetails = parseEvolutionChain(evolutionData.chain);
                evolutionWithImages(evolutionDetails)
                .then((evolutionImages) => {
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
            const capitalizedWeakness = capitalizeFirstLetter(weakness);
            const weaknessImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalizedWeakness}.png`;
            return `
            <div class="tooltip-types">
                <img src="${weaknessImageUrl}" 
                     alt="${weakness}"
                     class="type-image" 
                     width="40px" > 
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
            const capitalizedResistance = capitalizeFirstLetter(resistance);
            const resistanceImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalizedResistance}.png`;
            return `
            <div class="tooltip-types">
                <img src="${resistanceImageUrl}" 
                     alt="${resistance}"
                     class="type-image" 
                     width="40px"> 
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
            const capitalizedInval = capitalizeFirstLetter(inval);
            const invalImageUrl = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${capitalizedInval}.png`;
            return `
            <div class="tooltip-types">
                <img src="${invalImageUrl}" 
                    alt="${inval}"
                    class="type-image" 
                    width="40px">
                <span class="tooltiptext">${inval}</span>
            </div>`;
        });

        return invalidWithTypeImages;
    }

    // Update Counter Pokemon Table
    updateButton.addEventListener('click', () => {
        findCounterPokemon(global_types, global_statsData);
    });    

    // Show and hide table settings
    settingButton.addEventListener('click', toggleSettingDisplay);     
    
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
        
        // HP = baseStat+IV/2+EV/8+10+50
        // others = (baseStat+IV/2+EV/8+5)*Nature
        // Assume every stats are in best condition
        const SP_real_hp = SP_stats[0].value+31/2+252/8+10+50;
        const SP_real_atk = (SP_stats[1].value+31/2+252/8+5)*1.1;
        const SP_real_def = (SP_stats[2].value+31/2+252/8+5)*1.1;
        const SP_real_spa = (SP_stats[3].value+31/2+252/8+5)*1.1;
        const SP_real_spd = (SP_stats[4].value+31/2+252/8+5)*1.1;
        const SP_real_spe = (SP_stats[5].value+31/2+252/8+5)*1.1;

        const CP_real_hp = CP_data.stats.hp+31/2+252/8+10+50;
        const CP_real_atk = (CP_data.stats.atk+31/2+252/8+5)*1.1;
        const CP_real_def = (CP_data.stats.def+31/2+252/8+5)*1.1;
        const CP_real_spa = (CP_data.stats.spa+31/2+252/8+5)*1.1;
        const CP_real_spd = (CP_data.stats.spd+31/2+252/8+5)*1.1;
        const CP_real_spe = (CP_data.stats.spe+31/2+252/8+5)*1.1;

        // real_damage = (real_atk or real_spa) * ability * power * STAB * rank
        // real_defense = real_hp * (real_def or real_spd) / (0.44 or 0.411 or 0.374 (correction))
        var SP_real_damage = 0, SP_real_defense = 0, CP_real_damage = 0, CP_real_defense = 0;

        // Assume power = 80; No ability; STAB(x1.5); No rank-up;
        // Check if the pokeomon's defense or special-defense is lower
        if (SP_real_def < SP_real_spd) {
            // Attack with attack
            CP_real_damage = Math.floor(CP_real_atk * 1 * 80 * 1.5 * 1);
            SP_real_defense = Math.floor(SP_real_hp * SP_real_def);
        } else if (SP_real_def > SP_real_spd) {
            CP_real_damage = Math.floor(CP_real_spa * 1 * 80 * 1.5 * 1);
            SP_real_defense = Math.floor(SP_real_hp * SP_real_spd);
        } else if (CP_real_atk > CP_real_spa){
            CP_real_damage = Math.floor(CP_real_atk * 1 * 80 * 1.5 * 1);
            SP_real_defense = Math.floor(SP_real_hp * SP_real_def);
        } else{
            CP_real_damage = Math.floor(CP_real_spa * 1 * 80 * 1.5 * 1);
            SP_real_defense = Math.floor(SP_real_hp * SP_real_spd);
        }

        CP_data.score += Math.floor((CP_real_damage)*0.005);
        
        // 100% two-hit or more
        if(CP_real_damage < Math.floor(SP_real_defense/0.44)) {
            CP_data.score -= 10;
        }
        // Random one-hit
        if(CP_real_damage > Math.floor(SP_real_defense/0.44) 
           && CP_real_damage < Math.floor(SP_real_defense/0.374)) {
            CP_data.score += 15;
        }
        // 100% one-hit
        if(CP_real_damage > Math.floor(SP_real_defense/0.374)){
            CP_data.score += 30;
        }
        
        // Def vs SpD based on Atk vs SpA
        if (SP_real_atk > SP_real_spa) {
            SP_real_damage = Math.floor(SP_real_atk * 1 * 80 * 1.5 * 1);
            CP_real_defense = Math.floor(CP_real_hp * CP_real_def);
        } else if (SP_real_atk < SP_real_spa) {
            SP_real_damage = Math.floor(SP_real_spa * 1 * 80 * 1.5 * 1);
            CP_real_defense = Math.floor(CP_real_hp * CP_real_spd);
        } else if (CP_real_def > CP_real_spd){
            SP_real_damage = Math.floor(SP_real_spa * 1 * 80 * 1.5 * 1);
            CP_real_defense = Math.floor(CP_real_hp * CP_real_spd);
        } else {
            SP_real_damage = Math.floor(SP_real_atk * 1 * 80 * 1.5 * 1);
            CP_real_defense = Math.floor(CP_real_hp * CP_real_def);
        }

        CP_data.score += Math.floor((CP_real_defense)*0.001);

        // 100% two-hit or more
        if(SP_real_damage < Math.floor(CP_real_defense/0.44)) {
            CP_data.score += 20;
        }
        // Random one-hit
        if(SP_real_damage > Math.floor(CP_real_defense/0.44) 
           && SP_real_damage < Math.floor(CP_real_defense/0.374)) {
            CP_data.score += 10;
        }
        // 100% one-hit
        if(SP_real_damage > Math.floor(CP_real_defense/0.374)){
            CP_data.score -= 10;
        }

        // Give more score to the counter Pokemon whose speed is faster
        if (CP_real_spe > SP_real_spe) CP_data.score += Math.min(Math.floor(CP_real_spe - SP_real_spe), 15);
        if (CP_real_spe < SP_real_spe) CP_data.score -= Math.min(Math.floor(SP_real_spe - CP_real_spe), 15);

        return CP_data;
    }

    // Find counter pokemon of the pokemon
    async function findCounterPokemon(types, SP_stats) {
        // Check that the checkbox is checked
        const filterSpe_bst600 = filterCheckbox_bst600.checked;      
        const filterSpe_mega = filterCheckbox_mega.checked;          
        const filterSpe_type = filterCheckbox_type.checked;          
        const filterSpe_abilities = filterCheckbox_abilities.checked;
        const filterSpe_baseStat = filterCheckbox_baseStat.checked;  

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
        
        //Find Weaknesses of the pokemon
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
        
        const base_url = 'https://pokeapi.co/api/v2/';
    
        // Create an object to store pokemon scores
        const pokemonScores = {};
        var progress = 0, totalPokemon = 0;
        
        // Get total number of pokemon for loading bar
        for (const type of weaknesses) {
            const typeUrl = `${base_url}type/${type.toLowerCase()}`;
            const typeResponse = await fetch(typeUrl);
            const typeData = await typeResponse.json();            
            totalPokemon+=typeData.pokemon.length;
        }
    
        // Iterate through each type in the weaknesses list
        for (const type of weaknesses) {
            // Get a list of pokemon for the current weakness type
            const typeUrl = `${base_url}type/${type.toLowerCase()}`;
            const typeResponse = await fetch(typeUrl);
            const typeData = await typeResponse.json();
    
            // Iterate through each pokemon for the current weakness type
            for (const entry of typeData.pokemon) {
                // Update Loading Bar
                progressContainer.innerHTML = '';
                progress += 1;
                var percentage = Math.floor((progress / totalPokemon) * 100);
                progressContainer.style.width = `${percentage}%`;
                progressContainer.innerHTML = `Loading...${percentage}%`;

                // Pokemon Name Check
                const pokemonName = entry.pokemon.name;
                if(!pokemonName 
                    || pokemonName.includes("-totem")       //7th gen totem pokemons
                    || pokemonName.includes("pikachu-")     //pikachu forms
                    || pokemonName.includes("-dada")        //zarude-dada 
                    || pokemonName.includes("-hangry")      //morpeko 
                    || pokemonName.includes("-gmax")        //8th gen Gmax
                    || pokemonName.includes("-build")       //koraidon
                    || pokemonName.includes("-mode")        //miraidon
                    ) { 
                        continue;
                    }

                if (filterSpe_mega && (pokemonName.includes("-mega"))) {
                    continue;
                }
    
                // Fetch the stats of the Counter Pokemon(CP) from the PokeAPI
                const CP_url = `${base_url}pokemon/${pokemonName}`;
                const CP_response = await fetch(CP_url);
                const CP_data = await CP_response.json();
                
                // counter pokemon stats in variables
                const hp = CP_data.stats.find((stat) => stat.stat.name === 'hp').base_stat
                const atk = CP_data.stats.find((stat) => stat.stat.name === 'attack').base_stat
                const def = CP_data.stats.find((stat) => stat.stat.name === 'defense').base_stat
                const spa = CP_data.stats.find((stat) => stat.stat.name === 'special-attack').base_stat
                const spd = CP_data.stats.find((stat) => stat.stat.name === 'special-defense').base_stat
                const spe = CP_data.stats.find((stat) => stat.stat.name === 'speed').base_stat
                const total = hp+atk+def+spa+spd+spe;
                
                // Skip Pokemon with BST > 600
                if (filterSpe_bst600 && total > 600) continue;

                // Initialize the score and information of the pokemon if not present
                if (!pokemonScores[pokemonName]) {
                    pokemonScores[pokemonName] = {
                        sprite: CP_data.sprites.front_default||'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', 
                        name: CP_data.name,
                        types: CP_data.types.map((type) => type.type.name).join(', '),
                        abilities: CP_data.abilities.map((ability) => ability.ability.name).join(', '),
                        score: 0,
                        stats:{
                            hp: hp,
                            atk: atk,
                            def: def,
                            spa: spa,
                            spd: spd,
                            spe: spe,
                            total: total
                        }
                    };
                }
                
                if(pokemonScores[pokemonName].score === 0) {
                    // Score for the pokemon based on matched types
                    pokemonScores[pokemonName].score+=15;
                    // Scoring based on pokemon's stats
                    pokemonScores[pokemonName] = calculate(pokemonScores[pokemonName], SP_stats);
                }
            }
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
        pokemonArray.sort((a, b) => { return b.score - a.score; });

        // Clear contents to prevent Race Condition
        progressContainer.style.width = `0%`;
        progressContainer.innerHTML = '';
        counterPokemon.innerHTML = '';

        // Create a container for the scrollable table
        const tableContainer = document.createElement('div');
        tableContainer.style.overflow = 'scroll';
        var container1 = chooseSprite.clientHeight + pokemonInfo.clientHeight + evolution.clientHeight;
        var container2 = statsHistogram.clientHeight + dfHead.clientHeight + forms.clientHeight + heldItems.clientHeight + others.clientHeight;
        var clientHeight = container1 > container2 ? container1 : container2;
        var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if(screenWidth>1024) {
            tableContainer.style.height = clientHeight+'px';
        } else {
            tableContainer.style.height = '600px';
        }
        
        // Create the table element
        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = '';

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
            <td><img src="${pokemon.sprite}" alt="${pokemon.name}" width="50"></td>
            <td>${pokemon.name}</td>
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
});
