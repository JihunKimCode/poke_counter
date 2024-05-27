# [jihunkimcode.github.io/poke_counter/](https://jihunkimcode.github.io/poke_counter/)
The main page of the website. 

This page links to **Source code, Counter Pokémon Searcher, Pokémon Move Searcher, Pokémon Item Searcher, and Pokémon Color Searcher**.

## [Counter Pokémon Searcher](https://jihunkimcode.github.io/poke_counter/pages/info.html)
Explore information on Pokémon and discover effective counters for them.

### Features
- **Search ID or Name**
    - English, Korean, Japanese, Chinese, French, German, Spanish, Italian, and Czech
- **Search Dropdown**
    - Fetch to CSV file of PokeAPI
    - Related Pokémon list on the search bar
    - Levenshtein Distance + Regex
- **Voice Search**
    - Fetch to CSV file of PokeAPI
    - Levenshtein Distance
- **Search with a query in address**
    - Search with query string and parameters
        - Adding "?s=lapras" after the URL will search for information about Lapras.
    - This allowed the embedding of hyperlinks in each image
- **Sprite**
    - Shiny/Female Sprite
    - Front/Back Sprite
    - All platforms
- **PokeDex ID**
    - National PokeDex ID
    - Regional PokeDex IDs
- **Pokémon Information**
    - Show Foreign Names (Korean, Japanese)
    - Height, weight, gender rate, shape
    - Pokémon cry (Both New and Old)
    - Types (with logo)
    - Abilities (Normal, Hidden, Taken Away)
    - Stats
    - Wild Pokémon (EVs, held-item)
    - Locations where trainers can find the Pokémon
    - Egg Groups / Trivia
- **Evolutions**
    - Evolution Chains
        - Pokémon with Images
        - More than one (e.g. Eevee, Beautifly)
        - Evolution Level
        - Evolution Method (Friendship, Item, Moves, Locations, etc.)
- **Counter Type** (defense)
    - Order by Multiple (x4 to x2; x1/2 to x1/4)
- **Counter Pokémon**
    - Exclude BST > 600
    - Exclude Mega
    - Exclude illegal Pokémon and Gmax
    - Use Calculation using BS, IV, and EV
    - Beautify Display Table
        - color update
        - Hide elements
        - Table length == info length
- **Website Design**
    - Webpage logo
    - Table Colors
    - Easter Eggs!

### Plans
- [ ] Minor evolution routes 
    - e.g. Lycanroc, Urshifu, Pawmot, Maushold, Brambleghast, Rabsca, Palafin, Annihilape, Kingambit, and Gholdengo
- [ ] Better calculation to find counter Pokémon
- [ ] Image Path Check for some sprites

## [Pokémon Move Searcher](https://jihunkimcode.github.io/poke_counter/pages/move.html)
Retrieve information on Pokémon moves.

### Features
- **Search ID or Name**
    - English, Korean, Japanese, Chinese, French, German, Spanish, Italian, and Czech
- **Search Dropdown**
    - Fetch to CSV file of PokeAPI
    - Related move list on the search bar
- **Voice Search**
    - Fetch to CSV file of PokeAPI
    - Levenshtein Distance
- **Search with a query in address**
    - Search with query string and parameters
        - Adding "?s=surf" after the URL will search for information about surf.
    - This allowed the embedding of hyperlinks in each image
- **Move Information**
    - Type with icons
    - Attack Category with icons
    - Power, Accuracy, PP
    - Priority, Generation
    - Additional Effect
        - Freeze, burn, paralysis, poison, etc.
        - percentage
    - Stat Changes
    - Range
- **Description**
    - Short, Long, PokeDex
- **Learn By Pokémon**
    - Sprite of the Pokémon who learns the move

## [Pokémon Item Searcher](https://jihunkimcode.github.io/poke_counter/pages/item.html)
Retrieve details about various items featured in the Pokémon series.

### Features
- **Search ID or Name**
    - English, Korean, Japanese, Chinese, French, German, Spanish, Italian, and Czech
- **Search Dropdown**
    - Fetch to CSV file of PokeAPI
    - Related item list on the search bar
- **Voice Search**
    - Fetch to CSV file of PokeAPI
    - Levenshtein Distance
- **Search with a query in address**
    - Search with query string and parameters
        - Adding "?s=repel" after the URL will search for information about repel.
    - This allowed the embedding of hyperlinks in each image
- **Sprite** 
- **Item Information**
    - Category
    - Attribute
    - Fling
        - Effect
        - Power
- **Description**
    - Short, Long, PokeDex
- **Held By Pokémon**
    - Sprite of the Pokémon who holds the item

## [Pokémon Berry Searcher](https://jihunkimcode.github.io/poke_counter/pages/berry.html)
Search about berries in the Pokémon series, filtering by in-game effects.

### Features
- **Search using Filters**
    - Filter berries based on in-game usage
    - Click an image to see information 
- **Sprite** 
- **Berry Information**
    - Foreign Name
    - Firmness and Size
    - Flavors
    - Natural Gift Type and Power
    - Fling Effect and Power
- **Description**
    - Short, Long, PokeDex

## [Pokémon Color Searcher](https://jihunkimcode.github.io/poke_counter/pages/color.html)
- **Search using Colors**
    - Ten unique colors to search Pokémon
    - Sort by PokéDex Number
- **Sprite**
    - Hyperlink-embedded images
