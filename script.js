document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const pokemonInfo = document.getElementById('pokemonInfo');

    searchButton.addEventListener('click', () => {
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

                // Display the Pokémon's weaknesses and resistances
                const weaknessesHtml = weaknesses.length > 0 ? `<p>Weaknesses: ${weaknesses.join(', ')}</p>` : '';
                const resistancesHtml = resistances.length > 0 ? `<p>Resistances: ${resistances.join(', ')}</p>` : '';

                // Get stats
                const stats = data.stats.map((stat) => `${stat.stat.name}: ${stat.base_stat}`).join(', ');

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
                                    <p>ID: ${id}</p>
                                    <p>Type: ${types.join(', ')}</p>
                                    ${weaknessesHtml}
                                    ${resistancesHtml}
                                    <p>Stats: ${stats}</p>
                                    <p>Evolution: ${evolutionDetails}</p>
                                    <p>Abilities: ${abilities}</p>
                                    <img src="${image}" alt="${name}" width="200">
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
    });

    function parseEvolutionChain(chain) {
        let evolutionDetails = chain.species.name;

        if (chain.evolution_details && chain.evolution_details.length > 0) {
            const evolveLevel = chain.evolution_details[0].min_level;
            const evolveMethod = chain.evolution_details[0].trigger.name;

            if (evolveLevel === null) {
                evolutionDetails += ` (${evolveMethod})`;
            } else {
                evolutionDetails += ` (Level ${evolveLevel})`;
            }
        }

        if (chain.evolves_to && chain.evolves_to.length > 0) {
            evolutionDetails += ` -> ${parseEvolutionChain(chain.evolves_to[0])}`;
        }

        return evolutionDetails;
    }

    function getWeaknesses(types) {
        // Define type weaknesses and strengths based on the Pokémon type chart
        const typeChart = {
            normal: ['fighting'],
            fighting: ['flying', 'psychic', 'fairy'],
            flying: ['electric', 'ice', 'rock'],
            poison: ['ground', 'psychic'],
            ground: ['water', 'ice', 'grass'],
            rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
            bug: ['flying', 'rock', 'fire'],
            ghost: ['ghost', 'dark'],
            steel: ['fighting', 'ground', 'fire'],
            fire: ['water', 'rock', 'fire'],
            water: ['electric', 'grass'],
            grass: ['flying', 'poison', 'bug', 'fire', 'ice'],
            electric: ['ground'],
            psychic: ['bug', 'ghost', 'dark'],
            ice: ['fighting', 'rock', 'steel', 'fire'],
            dragon: ['ice', 'dragon', 'fairy'],
            dark: ['fighting', 'bug', 'fairy'],
            fairy: ['poison', 'steel', 'fire'],
        };

        // Calculate weaknesses based on the Pokémon's types
        const weaknesses = new Set();
        for (const type of types) {
            const typeWeaknesses = typeChart[type];
            if (typeWeaknesses) {
                typeWeaknesses.forEach((weakness) => weaknesses.add(weakness));
            }
        }

        return Array.from(weaknesses);
    }

    function getResistances(types) {
        // Define type resistances based on the Pokémon type chart
        const typeChart = {
            normal: [],
            fighting: ['rock', 'bug', 'dark'],
            flying: ['fighting', 'bug', 'grass'],
            poison: ['fighting', 'poison', 'bug', 'grass', 'fairy'],
            ground: ['poison', 'rock'],
            rock: ['normal', 'flying', 'poison', 'fire'],
            bug: ['fighting', 'ground', 'grass'],
            ghost: ['poison', 'bug'],
            steel: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
            fire: ['bug', 'steel', 'fire', 'grass', 'ice'],
            water: ['steel', 'fire', 'water', 'ice'],
            grass: ['ground', 'water', 'grass', 'electric'],
            electric: ['flying', 'steel', 'electric'],
            psychic: ['fighting', 'psychic'],
            ice: ['ice'],
            dragon: ['steel'],
            dark: ['ghost', 'dark'],
            fairy: ['fighting', 'bug', 'dark'],
        };

        // Calculate resistances based on the Pokémon's types
        const resistances = new Set();
        for (const type of types) {
            const typeResistances = typeChart[type];
            if (typeResistances) {
                typeResistances.forEach((resistance) => resistances.add(resistance));
            }
        }

        return Array.from(resistances);
    }
});
