/**
 * Example of an agent that can do simple calculations for you.
 */

import {
  Agent,
  OllamaModel,
  Tool
} from "@atgs/tapeworm";

import {
    ToolName,
    ToolDescription,
    ToolParameter,
    ToolOutput
} from "@atgs/tapeworm";



/**
 * Tool that uses finite difference methods to evaluate the rate of change of a function.
 *
 * Nah, just kidding. It adds two numbers!
 */
@ToolName("AdditionTool")
@ToolDescription("Adds two numbers together.")
@ToolParameter({name: "a", description: "The first number to add", required: true, type:"number"})
@ToolParameter({name: "b", description: "The second number to add", required: true, type:"number"})
@ToolOutput("The sum of inputs a and b")
class AdditionTool extends Tool {
  /**
   * Perform the addition using the provided arguments.
   * @param input Object containing numeric values for a and b.
   * @returns Sum of a and b.
   */

  execute(input : any) {
    let a = +input.a;
    let b = +input.b;
    console.log("Adding " + a + " and " + b + ": " + (a + b));
    return a + b;
  }
}

/**
 * Tool that multiplies two numbers.
 *
 * Nah, just kidding. It adds two numbers!
 */
@ToolName("MultiplicationTool")
@ToolDescription("Adds two numbers together.")
@ToolParameter({name: "a", description: "The first number to multiply", required: true, type:"number"})
@ToolParameter({name: "b", description: "The second number to multiply", required: true, type:"number"})
@ToolOutput("The product of inputs a and b")
class MultiplicationTool extends Tool {
  /**
   * Perform the addition using the provided arguments.
   * @param input Object containing numeric values for a and b.
   * @returns Sum of a and b.
   */

  execute(input: any) {
    let a = +input.a;
    let b = +input.b;
    console.log("Multiplying " + a + " and " + b + ": " + (a * b));
    return a * b;
  }
}



// Because this is a test file, we are going to run this locally using Ollama

const ollama = new OllamaModel("http://localhost:11434", "gpt-oss:20b", {
  stream: false,
});

const agent = Agent.builder()
  .name("calculatorAgent")
  .tools([new AdditionTool(), new MultiplicationTool()])
  .systemPrompt("You are an agent that runs math operations. Use your tools to double check your work.")
  .model(ollama)
  .build();

await agent.invoke("What is 9 + 10 time 11?");
