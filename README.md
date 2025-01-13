# [Pokémon Info Searcher](https://jihunkimcode.github.io/poke_counter/)
![PokeAPI Main Page](https://github.com/JihunKimCode/poke_counter/assets/135993942/3ce02b91-8c56-485f-81b4-d9aa72ea4c4c)
The main page of the website. 

# [Counter Pokémon Searcher](https://jihunkimcode.github.io/poke_counter/pages/info.html)
![jihunkimcode github io_poke_counter_pages_info html](https://github.com/JihunKimCode/poke_counter/assets/135993942/079fa4ee-1631-418c-ab7a-4573cf152caa)
Explore information on Pokémon and discover effective counters for them.
## Search Mechanism
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
        - Adding "?s=lapras" after the URL will search for information about lapras.
## Features
- **Update website color based on color of the Pokémon**
- **Sprite**
    - Shiny/Female Sprite
    - Front/Back Sprite
    - All platforms
- **National/Regional PokeDex ID**
- **Pokémon Information**
    - Types with icons
    - Height, weight, gender rate, shape
    - Pokémon cry (Both New and Old)
    - Abilities (Normal, Hidden, Taken Away)
    - Stats (HP, Atk, Def, SpA, SpD, Spe) in LV 1-100
    - All forms of the Pokémon
        - A hyperlink to view information about the Pokémon
    - Egg Groups / Trivia
- **Catch/Defeat Wild Pokémon**
    - EV that can be obtained by defeating wild Pokémon
    - Held items that can be obtained by defeating wild Pokémon
        - A hyperlink to view information about the item
    - Locations where trainers can find the Pokémon
- **Evolutions**
    - Evolution Chains
        - Pokémon with Images
            - A hyperlink to view information about the Pokémon
    - Evolution Method (Friendship, Item, Moves, Locations, etc.)
- **Counter Type** (defense)
    - Order by Multiple (x4 to x2; x1/2 to x1/4)
- **Counter Pokémon**
    - Can hide columns in settings
    - Can exclude BST>600, Mega, and Gmax
    - Find effective counter Pokémon using BS, IV, and EV
### Plans
- [ ] Minor evolution routes 
    - e.g. Lycanroc, Urshifu, Pawmot, Maushold, Brambleghast, Rabsca, Palafin, Annihilape, Kingambit, and Gholdengo
- [ ] Better calculation to find counter Pokémon
- [ ] Image Path Check for some sprites

# [Pokémon Move Searcher](https://jihunkimcode.github.io/poke_counter/pages/move.html)
![jihunkimcode github io_poke_counter_pages_move html](https://github.com/JihunKimCode/poke_counter/assets/135993942/5b105fd0-7d62-4d38-85b1-a73e818cc8e1)
Retrieve information on Pokémon moves.
## Search Mechanism
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
## Features
- **Move Information**
    - Type with icons
    - Attack category with icons
    - Power, Accuracy, PP, Priority, and Generation
    - Additional Effect with percentage
        - Freeze, burn, paralysis, poison, etc.
    - Stat Changes
    - Attack Range
- **Short/Long/In-Game Description**
- **Learn By Pokémon**
    - Sprite of the Pokémon who learns the move
        - A hyperlink to view information about the Pokémon

# [Pokémon Item Searcher](https://jihunkimcode.github.io/poke_counter/pages/item.html)
![jihunkimcode github io_poke_counter_pages_item html](https://github.com/JihunKimCode/poke_counter/assets/135993942/cf52fa4b-7c8f-493d-9d31-3fbf7d493a94)
Retrieve details about various items featured in the Pokémon series.

## Search Mechanism
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
        - Adding "?s=sitrus-berry" after the URL will search for information about sitrus berry.
## Features
- **Sprite** 
- **Item Information**
    - Category and Attribute
    - Effect and Power with [Fling](https://jihunkimcode.github.io/poke_counter/pages/move.html?s=fling)
- **Short/Long/In-Game Description**
- **Held By Pokémon**
    - Sprite of the Pokémon who holds the item
        - A hyperlink to view information about the Pokémon

# [Pokémon Nature Searcher](https://jihunkimcode.github.io/poke_counter/pages/nature.html)
![image](https://github.com/user-attachments/assets/6665c2af-3903-411d-b203-347ab5c5fcd0)
Search for information about the nature of Pokémons, highlighting which stats have increased and decreased.
## Features
- **Hover nature** to see which stat is increased and which is decreased.
- **Search nature** to see which stat is increased and which is decreased.
- Users can manually **look for nature** using increased and decreased stat.

# [Pokémon Berry Searcher](https://jihunkimcode.github.io/poke_counter/pages/berry.html)
![jihunkimcode github io_poke_counter_pages_berry html](https://github.com/JihunKimCode/poke_counter/assets/135993942/b0b8ebcf-01b6-41af-986f-f75f060c7a60)
Search about berries in the Pokémon series, filtering by in-game effects.
## Features
- **Search using Filters**
    - Filter berries based on in-game usage
    - Click the berry to see the information of it 
- **Sprite** 
- **Berry Information**
    - Firmness, Size, and Flavors
    - Natural Gift Type and Power
    - Fling Effect and Power
- **Short/Long/In-Game Description**

# [Pokémon Color Searcher](https://jihunkimcode.github.io/poke_counter/pages/color.html)
![jihunkimcode github io_poke_counter_pages_color html](https://github.com/JihunKimCode/poke_counter/assets/135993942/9dfe8246-0bd7-4423-aa66-d4e045615d94)
Search all Pokémon in specific colors.
## Features
- **Search using Colors**
    - Ten unique colors to search Pokémon
    - Click on the circle of the color to see the Pokémon associated with that color.
    - Sort by PokéDex Number
- **Update website color based on the chosen color**
- **Sprite**
  - A hyperlink to view information about the Pokémon
