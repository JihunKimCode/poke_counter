document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokemonInfo = document.getElementById('pokemonInfo');
    const statsHistogram = document.getElementById('statsHistogram');

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
                const name = data.name;
                const id = data.id;
                const image = data.sprites.front_default;
                const types = data.types.map((type) => type.type.name);

                // Get weaknesses and resistances
                const weaknesses = getWeaknesses(types);
                const resistances = getResistances(types);
                const invalid = getInvalid(types);

                // Display the Pokémon's weaknesses and resistances
                const weaknessesHtml = weaknesses.length > 0 ? `<p>[Weaknesses]<br>${weaknesses.join(', ')}</p>` : '';
                const resistancesHtml = resistances.length > 0 ? `<p>[Resistances]<br>${resistances.join(', ')}</p>` : '';
                const invalidHtml = invalid.length > 0 ? `<p>[Invalid]<br>${invalid.join(', ')}</p>` : '';

                // Get stats
                const statsData = data.stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat }));
                
                // Display the Pokémon's stats histogram
                displayStatsHistogram(statsData);

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

                                const html = `
                                    <h2>${name.toUpperCase()}</h2>
                                    <img src="${image}" alt="${name}" width="200">
                                    <p>Pokedex #${id}</p>
                                    <p>Type: ${types.join(', ')}</p>
                                    ${weaknessesHtml}
                                    ${resistancesHtml}
                                    ${invalidHtml}
                                    <p>[Evolution]<br>${evolutionDetails}</p>
                                    <p>Abilities: ${abilities}</p>
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

    // Function to display the Pokémon's stats histogram
    function displayStatsHistogram(statsData) {
        // Define the maximum value for the stats (assuming it's 255)
        const maxValue = 255;

        // Create HTML for the histogram
        const histogramHTML = statsData.map((stat) => {
            const barWidth = (stat.value / maxValue) * 100;
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
        statsHistogram.innerHTML = histogramHTML;
    }

    // Add a click event listener to the search button
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

    function parseEvolutionChain(chain) {
        let evolutionDetails = chain.species.name;
    
        if (chain.evolution_details && chain.evolution_details.length > 0) {
            const evolutionMethod = chain.evolution_details[0].trigger.name;
        
            if (evolutionMethod === 'level-up') {
                const evolveLevel = chain.evolution_details[0].min_level;
                const evolveMove = chain.evolution_details[0].known_move;
                const evolveItem = chain.evolution_details[0].item?.name;
                const evolveHappiness = chain.evolution_details[0].min_happiness;
                const evolveTime = chain.evolution_details[0].time_of_day;
                const evolveGender = chain.evolution_details[0].gender;
                const evolveLocation = chain.evolution_details[0].location;
                const evolveFriendship = chain.evolution_details[0].min_affection;
    
                let evolutionConditions = [];
    
                if (evolveLevel !== null) {
                    evolutionConditions.push(`Level ${evolveLevel}`);
                }
    
                if (evolveMove) {
                    evolutionConditions.push(`Knows ${evolveMove}`);
                }
    
                if (evolveItem) {
                    evolutionConditions.push(`Use ${evolveItem} to evolve`);
                }
    
                if (evolveHappiness !== null) {
                    evolutionConditions.push(`Happiness ${evolveHappiness}`);
                }
    
                if (evolveTime) {
                    evolutionConditions.push(`Time of Day: ${evolveTime}`);
                }
    
                if (evolveGender) {
                    evolutionConditions.push(`Gender: ${evolveGender}`);
                }
    
                if (evolveLocation) {
                    evolutionConditions.push(`Location: ${evolveLocation}`);
                }
    
                if (evolveFriendship !== null) {
                    evolutionConditions.push(`Friendship ${evolveFriendship}`);
                }
    
                evolutionDetails += ` (${evolutionConditions.join(', ')})`;
            } else if (evolutionMethod === 'trade') {
                const evolveItem = chain.evolution_details[0].held_item?.name;
                if (evolveItem) {
                    evolutionDetails += ` (Trade with held item: ${evolveItem})`;
                } else {
                    evolutionDetails += ` (Trade)`;
                }
            } else if (evolutionMethod === 'use-item') {
                    const evolveItem = chain.evolution_details[0].item?.name;
                evolutionDetails += ` (Use ${evolveItem} to evolve)`;
            } else {
                const evolveMove = chain.evolution_details[0].known_move;
                const evolveHappiness = chain.evolution_details[0].min_happiness;
                const evolveTime = chain.evolution_details[0].time_of_day;
                const evolveGender = chain.evolution_details[0].gender;
                const evolveLocation = chain.evolution_details[0].location;
                const evolveFriendship = chain.evolution_details[0].min_affection;

                let evolutionConditions = [];

                if (evolveMove) {
                    evolutionConditions.push(`Knows ${evolveMove}`);
                }

                if (evolveHappiness !== null) {
                    evolutionConditions.push(`Happiness ${evolveHappiness}`);
                }

                if (evolveTime) {
                    evolutionConditions.push(`Time of Day: ${evolveTime}`);
                }

                if (evolveGender) {
                    evolutionConditions.push(`Gender: ${evolveGender}`);
                }

                if (evolveLocation) {
                    evolutionConditions.push(`Location: ${evolveLocation}`);
                }
    
                if (evolveFriendship !== null) {
                    evolutionConditions.push(`Friendship ${evolveFriendship}`);
                }
    
                evolutionDetails += ` (${evolutionConditions.join(', ')})`;
            }
        }
    
        if (chain.evolves_to && chain.evolves_to.length > 0) {
            const evolutionBranches = chain.evolves_to.map((evolve) => parseEvolutionChain(evolve));
            evolutionDetails += ` <br>-> ${evolutionBranches.join(' <br>or ')}`;
        }
    
        return evolutionDetails;
    }
    
                            
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
        
        // Map the sorted weaknesses to the desired format before returning
        const sortedEffectiveWeaknesses = effectiveWeaknesses.map(({ weakness, count }) => `${weakness} x${count === 2 ? 4 : count === 1 ? 2 : 1}`);
        
        return sortedEffectiveWeaknesses;
}
    
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
        
        // Sort the resistances based on the count in ascending order (few to many)
        effectiveResistances.sort((a, b) => a.count - b.count);
        
        // Map the sorted resistances to the desired format before returning
        const sortedEffectiveResistances = effectiveResistances.map(({ resistance, count }) => `${resistance} x${count === 2 ? 1 / 4 : count === 1 ? 1 / 2 : 1}`);
        
        return sortedEffectiveResistances;
}

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
});
