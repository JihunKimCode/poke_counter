document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokemonInfo = document.getElementById('pokemonInfo');
    const statsHistogram = document.getElementById('statsHistogram');
    const counterPokemon = document.getElementById('counterPokemon');
    
    // Filter variables to adjust counter pokemon table
    const filter = document.getElementById('filter');
    const filter2 = document.getElementById('filter2');
    const filter3 = document.getElementById('filter3');
    const filter4 = document.getElementById('filter4');
    const filterCheckbox = document.getElementById('filterCheckbox');
    const filterCheckbox2 = document.getElementById('filterCheckbox2');
    const filterCheckbox3 = document.getElementById('filterCheckbox3');
    const filterCheckbox4 = document.getElementById('filterCheckbox4');
    const updateButton = document.getElementById('updateButton');

    //global variables for updating table
    let global_types, global_statsData

    // Function to perform the search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            alert('Please enter a Pokémon name or ID.');
            return;
        }

        fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
            .then((response) => response.json())
            .then((data) => {
                // Trace Pokemon's information
                const name = data.name;
                const id = data.id;
                const image = data.sprites.front_default;
                const types = data.types.map((type) => type.type.name);
                global_types = types;

                // Get weaknesses, resistances, and invalid
                const weaknesses = getWeaknesses(types);
                const resistances = getResistances(types);
                const invalid = getInvalid(types);
                
                // Display the weaknesses, resistances, and invalid
                const weaknessesHtml = weaknesses.length > 0 ? `<p>[Weaknesses]<br>${weaknesses.join(', ')}</p>` : '';
                const resistancesHtml = resistances.length > 0 ? `<p>[Resistances]<br>${resistances.join(', ')}</p>` : '';
                const invalidHtml = invalid.length > 0 ? `<p>[Invalid]<br>${invalid.join(', ')}</p>` : '';
                
                // Get stats
                const statsData = data.stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat }));
                global_statsData = statsData;
                
                // Display the pokemon's stats histogram and counter pokemon
                displayStatsHistogram(statsData);
                findCounterPokemon(types, statsData);
                // Update theme colors
                updateColors(name);
                
                // Get evolution chain details
                fetch(data.species.url)
                    .then((response) => response.json())
                    .then((speciesData) => {
                        const evolutionChainUrl = speciesData.evolution_chain.url;
                        fetch(evolutionChainUrl)
                            .then((response) => response.json())
                            .then((evolutionData) => {
                                const evolutionDetails = parseEvolutionChain(evolutionData.chain);

                                // Get moves and abilities
                                const abilities = data.abilities.map((ability) => ability.ability.name).join(', ');

                                // Display as text
                                const html = `
                                    <h2>${name.toUpperCase()}</h2>
                                    <img src="${image}" alt="${name}" width="100">
                                    <p>Pokedex #${id}</p>
                                    <p>[Type] <br> ${types.join(', ')}</p>
                                    ${weaknessesHtml}
                                    ${resistancesHtml}
                                    ${invalidHtml}
                                    <p>[Evolution] <br> ${evolutionDetails}</p>
                                    <p>[Abilities] <br> ${abilities}</p>
                                `;

                                pokemonInfo.innerHTML = html;
                                
                            })
                            .catch((error) => console.error(error));
                    })
                    .catch((error) => console.error(error));
            })
            .catch((error) => {
                alert('Pokémon not found. Please try another name or ID.');
                console.error(error);
            });
    }

    // Match color theme to the pokemon color
    async function updateColors(name) {
        const url = `https://pokeapi.co/api/v2/pokemon-species/${name}`;
        const response = await fetch(url);
        const data = await response.json();
        let pokeColor = data.color.name.toLowerCase();
        let lightpokeColor;

        // Set color matched to pokemon color
        if (pokeColor === "black") {
            pokeColor = "black";
            lightpokeColor = "gray";
        } else if (pokeColor === "blue") { 
            pokeColor = "#1288f8";
            lightpokeColor = "#00d6fa";
        } else if (pokeColor === "brown") {
            pokeColor = "#a66a2e";
            lightpokeColor = "#622a0f";
        } else if (pokeColor === "gray") {
            pokeColor = "gray";
            lightpokeColor = "#48494b";
        } else if (pokeColor === "green") {
            pokeColor = "#4cbb17";
            lightpokeColor = "#0b6623";
        } else if (pokeColor === "pink") {
            pokeColor = "#fe5bac";
            lightpokeColor = "pink";
        } else if (pokeColor === "purple") {
            pokeColor = "purple";
            lightpokeColor = "#b5338a";
        } else if (pokeColor === "red") {
            pokeColor = "#ff0800";
            lightpokeColor = "#c21807";
        } else if (pokeColor === "white") {
            pokeColor = "#b8b8b8";
            lightpokeColor = "#d9dddc";
        } else if (pokeColor === "yellow") {
            pokeColor = "#ffd300";
            lightpokeColor = "#ffbf00";
        }
        
        // Update background color
        document.documentElement.style.setProperty('--pokemoncolor', pokeColor);
        document.documentElement.style.setProperty('--lightpokemoncolor', lightpokeColor);
    }

    // Function to display the pokemon's stats histogram
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
                    <div class="bar-label">${stat.name}: ${stat.value}</div>
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

    // Search button click event
    searchButton.addEventListener('click', () => {
        performSearch();
    });

    // Add a keydown event listener to the input field
    searchInput.addEventListener('keydown', (event) => {
        // Check if the key pressed is the Enter key (key code 13)
        if (event.keyCode === 13) {
            performSearch();
        }
    });

    // Get Evolution Chain
    function parseEvolutionChain(chain) {
        let evolutionDetails = chain.species.name;
    
        if (chain.evolution_details && chain.evolution_details.length > 0) {
            const evolutionMethod = chain.evolution_details[0].trigger?.name;
        
            // Evolution Methods
            const evolveGender = chain.evolution_details[0].gender;
            const tradeItem = chain.evolution_details[0].held_item?.name;
            const evolveItem = chain.evolution_details[0].item?.name;
            const evolveMove = chain.evolution_details[0].known_move?.name;
            const evolveLocation = chain.evolution_details[0].location?.name;
            const evolveAffection = chain.evolution_details[0].min_affection;
            const evolveBeauty = chain.evolution_details[0].min_beauty;
            const evolveHappiness = chain.evolution_details[0].min_happiness;
            const evolveLevel = chain.evolution_details[0].min_level;
            const evolveRain = chain.evolution_details[0].needs_overworld_rain;
            const evolveParty = chain.evolution_details[0].party_species?.name;
            const evolvePartyType = chain.evolution_details[0].party_type?.name;
            const evolveStats = chain.evolution_details[0].relative_physical_stats;
            const evolveTime = chain.evolution_details[0].time_of_day;
            
            let evolutionConditions = [];
            
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
            
            if (evolveItem) {
                evolutionConditions.push(`Use ${evolveItem}`);
            }

            if (evolveMove) {
                evolutionConditions.push(`Learn ${evolveMove}`);
            }
            
            if (evolveLocation) {
                evolutionConditions.push(`At ${evolveLocation} and more`);
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
            
            if(evolveStats != null){
                if(evolveStats === 1){
                    evolutionConditions.push(`ATK > DEF`);
                } else if(evolveStats === 0){
                    evolutionConditions.push(`ATK = DEF`);
                } else if(evolveStats === -1){
                    evolutionConditions.push(`ATK < DEF`);
                }
            }
            
            if (evolveTime) {
                evolutionConditions.push(`${evolveTime}`);
            }

            // EvolutionTriggers
            if (evolutionMethod === 'trade') 
            {
                if (tradeItem) {
                    evolutionConditions.push(`Trade holding ${tradeItem}`);
                } else {
                    evolutionConditions.push(`Trade`);
                }
            } else if(evolutionMethod != null 
                && evolutionMethod != `level-up`
                && evolutionMethod != `use-item`) 
            {
                evolutionConditions.push(`${evolutionMethod}`);
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
        dark: ['pyschic'],
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
        
        // Map the sorted weaknesses (x4 and then x2)
        const sortedEffectiveWeaknesses = effectiveWeaknesses.map(({ weakness, count }) => `${weakness} x${count === 2 ? 4 : count === 1 ? 2 : 1}`);
        
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
        
        // Map the sorted resistances (x1/2 and then x1/4)
        const sortedEffectiveResistances = effectiveResistances.map(({ resistance, count }) => `${resistance} x${count === 2 ? 1 / 4 : count === 1 ? 1 / 2 : 1}`);
        
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
        return Array.from(invalid);
    }

    // Function to handle the click event on the filter buttons
    updateButton.addEventListener('click', () => {
        findCounterPokemon(global_types, global_statsData);
    });    

    // Find counter pokemon of the pokemon
    async function findCounterPokemon(types, SP_stats) {
        // Clear Content to update
        counterPokemon.innerHTML = '';

        // Create a container for the loading message
        const Loading = document.createElement('div');
        Loading.style.marginTop = '10px';
        Loading.innerHTML = `Loading...`;
        counterPokemon.appendChild(Loading);

        // Show filters
        filter.style.display = 'inline-block';
        filter2.style.display = 'inline-block';
        filter3.style.display = 'inline-block';
        filter4.style.display = 'inline-block';
        updateButton.style.display = 'inline-block';
        
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
    
        // Iterate through each type in the weaknesses list
        for (const type of weaknesses) {
            // Get a list of pokemon for the current weakness type
            const typeUrl = `${base_url}type/${type.toLowerCase()}`;
            const typeResponse = await fetch(typeUrl);
            const typeData = await typeResponse.json();
    
            // Iterate through each pokemon for the current weakness type
            for (const entry of typeData.pokemon) {
                const pokemonName = entry.pokemon.name;
    
                // Fetch the stats of the Counter Pokemon(CP) from the PokeAPI
                const CP_url = `${base_url}pokemon/${pokemonName}`;
                const CP_response = await fetch(CP_url);
                const CP_data = await CP_response.json();
                
                // counter pokemon stats in variables
                hp = CP_data.stats.find((stat) => stat.stat.name === 'hp').base_stat
                atk = CP_data.stats.find((stat) => stat.stat.name === 'attack').base_stat
                def = CP_data.stats.find((stat) => stat.stat.name === 'defense').base_stat
                spa = CP_data.stats.find((stat) => stat.stat.name === 'special-attack').base_stat
                spd = CP_data.stats.find((stat) => stat.stat.name === 'special-defense').base_stat
                spe = CP_data.stats.find((stat) => stat.stat.name === 'speed').base_stat
    
                // Initialize the score and information of the pokemon if not present
                if (!pokemonScores[pokemonName]) {
                    pokemonScores[pokemonName] = {
                        sprite: CP_data.sprites.front_default, 
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
                            total: hp+atk+def+spa+spd+spe
                        }
                    };
                }
    
                // Increment the score for the pokemon based on matched types
                pokemonScores[pokemonName].score+=30;
    
                // Additional scoring based on pokemons' stats
                if (pokemonScores[pokemonName].score<=30) {
                    /* SP_stats[n].value means the search pokemon(SP)'s stats value
                     * 0: hp
                     * 1: attack
                     * 2: defense
                     * 3: special-attack
                     * 4: special-defense
                     * 5: speed */

                    // Check if the pokeomon's defense or special-defense is lower
                    if (SP_stats[2].value < SP_stats[4].value) {
                        pokemonScores[pokemonName].score += Math.floor(atk * 0.5);
                    } else if (SP_stats[2].value > SP_stats[4].value) {
                        pokemonScores[pokemonName].score += Math.floor(spa * 0.5);
                    } else if (atk > spa){
                        pokemonScores[pokemonName].score += Math.floor(atk * 0.5);
                    } else{
                        pokemonScores[pokemonName].score += Math.floor(spa * 0.5);
                    }
                    
                    // Def vs SpD based on Atk vs SpA
                    if (SP_stats[1].value > SP_stats[3].value) {
                        pokemonScores[pokemonName].score += Math.floor((hp+def)*0.2);
                    } else if (SP_stats[1].value < SP_stats[3].value) {
                        pokemonScores[pokemonName].score += Math.floor((hp+spd)*0.2);
                    } else {
                        pokemonScores[pokemonName].score += Math.floor((hp+def+spd)*0.1);
                    }

                    // Give more score to the counter Pokemon whose speed is faster
                    if (spe > SP_stats[5].value) pokemonScores[pokemonName].score += 10;
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
        
        // Check that the checkbox is checked
        const filterSpe = filterCheckbox.checked;       // BST > 600
        const filterSpe2 = filterCheckbox2.checked;     // Types
        const filterSpe3 = filterCheckbox3.checked;     // Abilities
        const filterSpe4 = filterCheckbox4.checked;     // Base Stats

        // Clear contents to prevent Race Condition
        counterPokemon.innerHTML = '';

        // Create a container for the scrollable table
        const tableContainer = document.createElement('div');
        tableContainer.style.overflow = 'scroll';
        tableContainer.style.marginTop = '10px';
        tableContainer.style.maxHeight = '650px';
        
        // Create the table element
        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = '';

        // Create the table header
        const headerRow = table.createTHead().insertRow();
        headerRow.innerHTML = '<th>Sprite</th><th>Name</th>'
        if(!filterSpe2) headerRow.innerHTML += '<th>Types</th>';
        if(!filterSpe3) headerRow.innerHTML += '<th>Abilities</th>';
        headerRow.innerHTML += '<th>Score</th>'
        if(!filterSpe4) headerRow.innerHTML += '<th>HP</th><th>Atk</th><th>Def</th><th>SpA</th><th>SpD</th><th>Spe</th><th>BST</th>';

        // Iterate through the sorted array and add rows to the table
        for (const pokemon of pokemonArray) {

            // Skip Pokemon with BST > 600 if the checkbox is checked
            if (filterSpe && pokemon.stats.total > 600) continue;
    
            // Add row to the table
            const row = table.insertRow();
            row.innerHTML = `
            <td><img src="${pokemon.sprite}" alt="${pokemon.name}" width="50"></td>
            <td>${pokemon.name}</td>
            `;
            if(!filterSpe2){
                row.innerHTML += `<td>${pokemon.types}</td>`;
            }

            if(!filterSpe3){
                row.innerHTML += `<td>${pokemon.abilities}</td>`;
            } 

            row.innerHTML += `<td>${pokemon.score}</td>`;
            
            if(!filterSpe4) {
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
