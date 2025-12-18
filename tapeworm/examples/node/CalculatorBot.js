/**
 * Example of an agent that can do simple calculations for you.
 */

import {Agent, OllamaModel, Parameter, Tool, ToolSchema} from '../../dist/tapeworm.es.js';


/**
 * Tool that uses finite difference methods to evaluate the rate of change of a function.
 * 
 * Nah, just kidding. It adds two numbers!
 */
class AdditionTool extends Tool {

    /**
     * Unique name used to reference this tool.
     * @returns Tool identifier string.
     */
    getName() {
        return "AdditionTool";
    }

    /**
     * Short description provided to the model.
     * @returns Human-readable explanation of the tool.
     */
    getDescription() {
        return "Adds two numbers together.";
    }

    /**
     * Define required parameters and return shape for the tool.
     * @returns ToolSchema describing input and output expectations.
     */
    getToolSchema() {
        return ToolSchema.builder()
            .addParameter(
                Parameter.builder()
                .name("a")
                .description("The first number to add.")
                .required(true)
                .type("number")
                .build()
            )
            .addParameter(
                Parameter.builder()
                .name("b")
                .description("The second number to add.")
                .required(true)
                .type("number")
                .build()
            )
            .output(
                "A number that is equal to a + b"
            )
            .build();
    }

    /**
     * Perform the addition using the provided arguments.
     * @param input Object containing numeric values for a and b.
     * @returns Sum of a and b.
     */
    execute(input) {
        let a = +input.a;
        let b = +input.b;
        console.log("Adding " + a + " and " + b + ": " + (a+b));
        return a + b;
    }

}


// Because this is a test file, we are going to run this locally using Ollama

const ollama = new OllamaModel(
    "http://localhost:11434",
    "gpt-oss:20b",
    {"stream": false}
);


const agent = new Agent();
agent.name = "calculatorAgent";
agent.tools = [new AdditionTool()]
agent.system_prompt = "You are an agent that runs math operations."
agent.model = ollama;

await agent.invoke("What is 9 + 10");
