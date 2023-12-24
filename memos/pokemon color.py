import requests

def get_pokemon_color(pokemon_name):
    # Make a request to the PokéAPI
    url = f'https://pokeapi.co/api/v2/pokemon-species/{pokemon_name.lower()}/'
    response = requests.get(url)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Extract the color information
        color = data['color']['name']
        return color
    else:
        # Print an error message if the request fails
        print(f"Error: Unable to retrieve data for {pokemon_name}. Status code: {response.status_code}")
        return None

# Example: Get the color of Pikachu
pokemon_name = 'lapras'
pokemon_color = get_pokemon_color(pokemon_name)

if pokemon_color:
    print(f"The color of {pokemon_name.capitalize()} is {pokemon_color}.")
