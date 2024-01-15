# [jihunkimcode.github.io/poke_counter/](https://jihunkimcode.github.io/poke_counter/)
The main page of the website. 

This page links to **Source code, Counter Pokémon Searcher, Pokémon Move Searcher, and Pokémon Item Searcher**.

## [Counter Pokémon Searcher](https://jihunkimcode.github.io/poke_counter/info.html)
Explore information on Pokémon and discover effective counters for them.

### Features
- **Search Dropdown**
    - Fetch to csv file of PokeAPI
    - Related Pokemon list on serach bar
    - Levenshtein Distance + Regex
- **Voice Search**
    - Fetch to csv file of PokeAPI
    - Levenshtein Distance
- **Sprite**
    - Shiny/Female Sprite
    - Front/Back Sprite
    - All platforms
- **PokeDex ID**
- **Pokemon Information**
    - Height, weight, gender rate, shape
    - Pokemon cry
    - Types (with logo)
    - Abilities (Normal, Hidden, Taken Away)
    - Stats
    - Wild Pokemon (EVs, held-item)
    - Egg Groups / Trivia
- **Evolutions**
    - Evolution Chains
        - Pokemon with Images
        - More than one (e.g. eevee, beautifly)
        - Evolution Level
        - Evolution Method (Friendship, Item, Moves, Locations, etc.)
- **Counter Type** (defense)
    - Order by Multiple (x4 to x2; x1/2 to x1/4)
- **Counter Pokemon**
    - Exclude BST > 600
    - Exclude mega
    - Exclude illegal pokemon and gmax
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
- [ ] Minor routes 
    - e.g. lycanroc, urshifu, pawmot, maushold, brambleghast, rabsca, palafin, annihilape, kingambit, and gholdengo
- [ ] x1 Types?
- [ ] Better calculation to find counter pokemon

## [Pokémon Move Searcher](https://jihunkimcode.github.io/poke_counter/move.html)
Retrieve information on Pokémon moves.

### Features
- **Search Dropdown**
    - Fetch to csv file of PokeAPI
    - Related move list on serach bar
- **Voice Search**
    - Fetch to csv file of PokeAPI
    - Levenshtein Distance
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
- **Learn By Pokemon**
    - Sprite of the pokemon who learns the move

## [Pokémon Item Searcher](https://jihunkimcode.github.io/poke_counter/item.html)
Retrieve details about various items featured in the Pokémon series.

### Features
- **Search Dropdown**
    - Fetch to csv file of PokeAPI
    - Related item list on serach bar
- **Voice Search**
    - Fetch to csv file of PokeAPI
    - Levenshtein Distance
- **Sprite** 
- **Item Information**
    - Category
    - Attribute
    - Fling
        - Effect
        - Power
- **Description**
    - Short, Long, PokeDex
- **Held By Pokemon**
    - Sprite of the pokemon who holds the item