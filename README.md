 # Summary
 * [About the project](#about-the-project)
 * [How to run](#how-to-run)
 * [Input and Ouput](#input-and-output)
 * [Notes](#notes)

## About the project

Final project of the discipline Laboratory of Distributed Systems at UNIFEI (Federal University of Itajubá). The goal is to practice concepts from programming (JavaScript) 
and distributed systems (in this case, the tool Node.JS and its framework Express and the ChatGPT API alongside with D&D 5e API) in a web application. The idea of this application
is a character generator for the 5th edition of Dungeons and Dragons with its stats and a backstory. 

## How to run
To run the program, after clonning, you will need an API key to use ChatGPT (https://platform.openai.com/docs/overview). After this, create a .env archive and insert the key. Then,
run the following command at the terminal in the right directory: 
```
node server.js
```
With the server listening, open the browser and type: localhost:3000/(insert the character's class here)/(insert the character's level here).

## Input and Output
The classes and levels available can be seen at https://5e-bits.github.io/docs/api.

After some seconds, the result will be displayed as these examples shows:
![Captura de tela 2023-12-13 011214](https://github.com/MateusAMSouza/dnd-character-generator/assets/95110193/05a9ec94-3200-41ba-a47b-c1ff5202c012)
![image](https://github.com/MateusAMSouza/dnd-character-generator/assets/95110193/f6137666-aadb-4505-9784-0d2327547c02)

## Notes
If you access localhost:3000 or look for the frontend folder, you will see incomplete functionalities, such as the idea of inserting the character's class and level in a initial page,
instead of inserting them at the URL. Until this version of the code, this funcionality is not working.
The screenshots of the output show different formatting text in Ability Scores (displaying the bonuses after the value) and in the Equipment section (numbering the items or not). This may occur because of the different responses of ChatGPT API, despite the prompt descriptions given.
