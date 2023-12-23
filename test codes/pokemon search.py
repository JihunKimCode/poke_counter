import requests

def find_pokemon_by_types_and_stats(type1, type2, base_stat):
    # Define the PokeAPI base URL
    base_url = 'https://pokeapi.co/api/v2/'

    # Get a list of Pokemon of the first type
    type1_url = f'type/{type1.lower()}'
    type1_response = requests.get(f'{base_url}{type1_url}')
    type1_data = type1_response.json()

    # Get a list of Pokemon of the second type
    type2_url = f'type/{type2.lower()}'
    type2_response = requests.get(f'{base_url}{type2_url}')
    type2_data = type2_response.json()

    # Find Pokemon that belong to both types and meet the base_stat criteria
    matching_pokemon = set()
    for entry1 in type1_data['pokemon']:
        for entry2 in type2_data['pokemon']:
            if entry1['pokemon']['name'] == entry2['pokemon']['name']:
                pokemon_name = entry1['pokemon']['name']
                pokemon_url = entry1['pokemon']['url']
                pokemon_data = requests.get(pokemon_url).json()

                # Check the base HP stat
                hp_stat = next(stat['base_stat'] for stat in pokemon_data['stats'] if stat['stat']['name'] == 'hp')

                if hp_stat >= base_stat:
                    matching_pokemon.add(pokemon_name)

    return list(matching_pokemon)

# Example usage: Find Electric/Fire-type Pokemon with a base HP stat greater than or equal to 70
electric_fire_pokemon = find_pokemon_by_types_and_stats('electric', 'fire', 50)
print('Electric/Fire-type Pokemon with base HP stat >= 70:', electric_fire_pokemon)
