require('dotenv').config();
const { default: axios } = require('axios');
const express = require('express')
const server = express()
const { OpenAI } = require('openai');
const port = 3000

const openai = new OpenAI();

server.set('view engine', 'ejs');

server.set('views', __dirname + '/frontend');

server.use('/css', express.static(__dirname + '/frontend/css'));




const runPrompt = async(prompt) => {
    
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role: "system", content: "You are a creative writer."},
        {role: "user", content: prompt}],
        temperature: 1,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
      
    console.log(response.choices[0].message.content)
    return response.choices[0].message.content;
};

async function raceFeatures(race, story) {
    const response = await axios.get(`https://www.dnd5eapi.co/api/races/${race.toLowerCase()}`)

    const abilityScores = response.data.ability_bonuses
    const abilities = await getRaceAbilities(abilityScores)
    console.log(abilities)

    const startingProficiencies = response.data.starting_proficiencies
    const raceProficiencies = await getNames(startingProficiencies)
    
    const language = response.data.languages
    const raceLanguages = await getNames(language)
    console.log(raceLanguages)

    const trait = response.data.traits
    const raceTraits = await getNames(trait)
    
    const profChoice = ''
    if(response.hasOwnProperty("starting_proficiency_options")) {
        profChoice = response.data.starting_proficiency_options
        if(profChoice) {
            const profDescription = profChoice[0].desc
            const profPrompt = `Choose based on the character's background (${story}): ${profDescription}. After this, add one tool proficiency. Return only their names, separated by commas.`
            profChoice = await runPrompt(profPrompt)
            raceProficiencies.push(profChoice)
        }
    }
    
    var langChoice = ''
    if(response.data.language_options) {
        langChoice = response.data.language_options
        //console.log(JSON.stringify(langChoice.from.options))
        
        if(langChoice) {
            const langDescription = JSON.stringify(langChoice.from.options)
            const langPrompt = `Choose based on the character's background (${story}) a language from ${langDescription}. After this, add one more language. Return only their names, separated by commas.`
            langChoice = await runPrompt(langPrompt)
            raceLanguages.push(langChoice)
        }
    }

    

    const jsonResponse = { 
        speed: response.data.speed,
        ability_bonuses: abilities,
        size: response.data.size,
        proficiencies: raceProficiencies,
        languages: raceLanguages,
        traits: raceTraits
    }
    r = JSON.stringify(jsonResponse)
    return r
}


async function getRaceAbilities(abilityScores) {
    const resultScores = {}
    if(abilityScores) {
        abilityScores.forEach((ability) => {
        const name = ability.ability_score.name
        const bonus = ability.bonus

        resultScores[name] = bonus
        })
    }
    return resultScores;
}

async function getNames(featureList) {
    return featureList.map((feature) => {
        if(feature.name.includes("Skill: ".length)) {
            return feature.name.substring("Skill: ".length)
        } else {
            return feature.name
        }
    })
} 



async function classFeatures(ch_class, level, con, story, proficiencies) {
    const response = await axios.get(`https://www.dnd5eapi.co/api/classes/${ch_class.toLowerCase()}`)
    
    var allProf = proficiencies

    const skills = response.data.proficiency_choices[0].desc
    const prompt = `Choose based on the character's background (${story}) the skills: ${skills}. Do not repeat skills that appear on ${JSON.stringify(proficiencies)}. After this, add any other two skills related to the background. Return only their names, separated by commas and ignoring "Skill: " in the names.`
    const skill_set = await runPrompt(prompt)
    console.log(skill_set)
    allProf.push(skill_set)
    console.log(allProf)

    if(response.data.proficiency_choices[1])
    {
        const skills2 = response.data.proficiency_choices[1].desc
        const prompt2 = `Choose based on the character's background (${story}) the skills: ${skills2}. Return only their names, separated by commas.`
        const skill_set2 = await runPrompt(prompt2)
        console.log(skill_set2)
        allProf.push(skill_set2)
        console.log(allProf)
    }

    const cProficiencies = response.data.proficiencies
    var classProf = await getNames(cProficiencies)
    allProf = allProf.concat(classProf)
    console.log(allProf)
    
    const equip = response.data.starting_equipment_options
    console.log(equip)
    var options = {}
    
    equip.forEach((equipment) => {
        options = equip.map((equipment) => equipment.desc)
    })
    console.log(options)
    const prompt3 = `Choose based on the character's background (${story}) and ${level} the equipment, always selecting the first option of each choice: ${options}. Create and add magical items according to this formula: number of magic items = round(level/4). Return only the equipments and items names, separated by commas.`
    const classEquipment = await runPrompt(prompt3)

    //HP:
    var hp = 0
    var dice = 0
    dice = response.data.hit_die
    var modifier = 0
    if(con > 11)
    {
        modifier = Math.round((con - 10)/2)
    } else {
        modifier = 0
    }
    if(level > 1) {
        hp = (dice + modifier) + (level-1)*(modifier + 1 + Math.round(dice/2))
    } else {
        hp = (dice + modifier)
    }



    const jsonResponse = {
        Hit_Points: hp,
        All_Proficiencies: allProf,
        Equipments: classEquipment
    }
    r = JSON.stringify(jsonResponse)
    console.log(r)
    return r
}

async function getRaces() {
    const response = await axios.get(`https://www.dnd5eapi.co/api/races`)
    return getNames(response.data.results)
}

server.get('/', async (req, res) => {
    res.render('index')
})

server.get('/:ch_class/:level', async (req, res) => {
    const { ch_class, level} = req.params;
    
    const dndRaces = await getRaces()

    const prompt = `Write a creative background for a DnD 5e ${ch_class} level ${level}. The story must be written in narrative form, with no more than 5 paragraphs. Here are the questions that must be answered in the background:\
    - Where the character was born?\
    - Who were his/her parents?\
    - Why the character left his/her comfort zone?\
    - What are some feats the character accomplished before getting into the actual level?\
    - What does he/she want? What is his/her objective?\
    Feel free to create any unspecified details. The races available are: ${JSON.stringify(dndRaces)}. Return response in the following parsable JSON format. The story must be a single string only with <br> to indicate line breaks:
    {
        "N": "character's name",
        "R": "race",
        "Al": "alignment"
        "B": "story",
    }`;

    const story = await runPrompt(prompt)

    parsedStory = await JSON.parse(story)

    const raceFeats = await raceFeatures(parsedStory.R, parsedStory.B)

    parsedRaceFeats = await JSON.parse(raceFeats)

    const prompt2 = `Now, based on the character's class: ${ch_class}, level: ${level} and background: ${parsedStory.B}, choose the ability scores via standard array (15, 14, 13, 12, 10, 8). After this, add this values: ${JSON.stringify(parsedRaceFeats.ability_bonuses)} and the level additions: Increase one ability score by 2 or Increase two different ability scores by 1
    All classes get Ability Score Improvements at levels 4, 8, 12, 16 and 19.
    Fighters get additional Ability Score Improvements at levels 6 and 14.
    Rogues get one additional Ability Score Improvement at level 10. 
    Remember to add the level improvements before returning the result. Return only the response in the following parsable JSON format:
    {
        "CHA": "value (modifier)",
        "CON": "value (modifier)",
        "DEX": "value (modifier)",
        "INT": "value (modifier)",
        "STR": "value (modifier)",
        "WIS": "value (modifier)",
    }`;

    const atributes = await runPrompt(prompt2)
    const parsedAtributes = await JSON.parse(atributes)

    const classFeats = await classFeatures(ch_class, level, parsedAtributes.CON, parsedStory.B, parsedRaceFeats.proficiencies)
    const parsedClassFeats = await JSON.parse(classFeats)

    const sheet = `Name: ${parsedStory.N}<br>Race: ${parsedStory.R}<br>Class: ${ch_class}<br>Level: ${level}<br>Alignment: ${parsedStory.Al}<br>Ability Scores:<br>
    Charisma: ${parsedAtributes.CHA}<br>Constitution: ${parsedAtributes.CON}<br>Dexterity: ${parsedAtributes.DEX}
    <br>Intelligence: ${parsedAtributes.INT}<br>Strength: ${parsedAtributes.STR}<br>Wisdom: ${parsedAtributes.WIS}
    <br>Speed: ${parsedRaceFeats.speed}<br>Size: ${parsedRaceFeats.size}<br>Languages: ${parsedRaceFeats.languages}<br>Proficiencies: ${parsedClassFeats.All_Proficiencies}
    <br>Hit Points: ${parsedClassFeats.Hit_Points}<br>Equipment:${parsedClassFeats.Equipments}<br><br>Background: ${parsedStory.B}`

    res.send(sheet);

   //get GPT to choose the proficiencies, [v] the ability scores, [v] languages. Always choose (a) for equipment or gpt chooses. chat must also define alginment [v] 
})


server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

