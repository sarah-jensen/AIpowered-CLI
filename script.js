// Dependencies
require('dotenv').config();
const { OpenAI } = require('langchain/llms/openai');
const inquirer = require('inquirer');
const { PromptTemplate } = require('langchain/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');

// Creates and stores wrapper for OpenAI package and basic configuration
const model = new OpenAI ({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    model: 'gpt-3.5-turbo'
});

console.log({model});

// Defines schema for the output
const parser = StructuredOutputParser.fromNamesAndDescriptions({
    weather: "weather forecast for the location entered by the user",
    clothing: "detailed description of clothing appropriate for the weather provided"
});

const formatInstructions = parser.getFormatInstructions();

// Use OpenAI wrapper and model; make a call base on input from inquirer
const promptFunc = async (input) => {
    try {
        // Create new object called "prompt" using "PromptTemplate" class
        const prompt = new PromptTemplate({
            template: "You are a weather expert and will provide the weather forecast for the city and state entered by the user.\n{format_instructions}\n{location}",
            inputVariables: ["location"],
            partialVariables: { format_instructions: formatInstructions }
        });

        const promptInput = await prompt.format({
            location: input,
        });

        const res = await model.call(promptInput);
        console.log(await parser.parse(res));
    } catch (err) {
        console.error(err);
    }
};

// Initialization function - uses inquirer ot prompt the user and returns a response. It passes user input through the call method
const init = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'location',
            message: 'Enter the city and state (USA) for your weather forecast:'
        }
    ]).then((inquirerResponse) => {
        promptFunc(inquirerResponse.location)
    });
};

// Call the initialization function to start the script
init();