![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm Core

<h3>In-browser and Node Agent Framework.</h3>

[![npm version](https://img.shields.io/npm/v/@atgs/tapeworm.svg?style=flat-square)](https://www.npmjs.org/package/@atgs/tapeworm.svg)
[![npm downloads](https://img.shields.io/npm/dm/@atgs/tapeworm?style=flat-square)](https://npm-stat.com/charts.html?package=@atgs/tapeworm)
[repo link](https://github.com/andygrace227/tapeworm)

This is the root package for Tapeworm. You can consume other packages like @atgs/tapeworm_bedrock for AWS Bedrock support.
x
**This project is currently in alpha and is under active development.**

## Current Features

- Supports `function` tools.
- Supports Ollama models.
- Has a Babel plugin to make tool creation easy.
- Has TS decorators to make tool creation really easy, too!
- Supports browser and Node.

## Tapeworm's Tenets

- **Be the most ergonomic agentic solution for Node and the browser.** Each commit should make it easier to develop and deploy agentic AI solutions.
- **Be as model-agnostic as possible.** Use your own machine, AWS, Google, a literal potato... we don't care.
- **Keep things light.** We already waste so much water and energy with AI. The overhead from Tapeworm should be kept to a minimum when possible.

## Examples

### How do I define a tool?

#### With the babel plugin (@atgs/@atgs/babel-plugin-tapeworm-decorator) (recommended, super concise)

```js
@Tool({ description: "Adds 2 numbers together" })
class AdditionTool extends Tool {
  @TParam({
    name: "a",
    description: "The first number to add",
    required: true,
    type: "number",
  })
  @TParam({
    name: "b",
    description: "The second number to add",
    required: true,
    type: "number",
  })
  @TOutput("The sum of inputs a and b")
  execute(input) {
    let a = +input.a;
    let b = +input.b;
    console.log("Adding " + a + " and " + b + ": " + (a + b));
    return a + b;
  }
}
```

#### With Typescript Decorators

```ts
@ToolName("AdditionTool")
@ToolDescription("Adds two numbers together.")
@ToolParameter({
  name: "a",
  description: "The first number to add",
  required: true,
  type: "number",
})
@ToolParameter({
  name: "b",
  description: "The second number to add",
  required: true,
  type: "number",
})
@ToolOutput("The sum of inputs a and b")
class AdditionTool extends Tool {
  execute(input: any) {
    let a = +input.a;
    let b = +input.b;
    console.log("Adding " + a + " and " + b + ": " + (a + b));
    return a + b;
  }
}
```

#### Without the plugin (still pretty readable)

```js
import {
  Agent,
  OllamaModel,
  Parameter,
  Tool,
  ToolSchema,
} from "../../dist/tapeworm.es.js";

class AdditionTool extends Tool {
  getName() {
    return "AdditionTool";
  }

  getDescription() {
    return "Adds two numbers together.";
  }

  getToolSchema() {
    return (
      ToolSchema.builder()
        .addParameter(
          Parameter.builder()
            .name("a")
            .description("The first number to add.")
            .required(true)
            .type("number")
            .build(),
        )
        //... more parameter additions.
        .output("A number that is equal to a + b")
        .build()
    );
  }

  execute(input) {
    let a = +input.a;
    let b = +input.b;
    console.log("Adding " + a + " and " + b + ": " + (a + b));
    return a + b;
  }
}
```

#### Then calling the agent:

```js
const ollama = new OllamaModel("http://localhost:11434", "gpt-oss:20b", {
  stream: false,
});

const agent = Agent.builder()
  .name("calculatorAgent")
  .tools([new AdditionTool()])
  .systemPrompt("You are an agent that runs math operations.")
  .model(ollama)
  .build();

await agent.invoke("What is 9 + 10?");
```

## Roadmap

Tapeworm seeks to be the most ergonomic agentic solution for Node and the browser.

It has a long way to go before this project is there, but I believe we're off to a good start.

Here are the main areas that will be addressed:

### More documentation and examples

We will build JS Docs and expose them, and more examples.

### Plug 'n Play Proxy Servers

AI Proxy servers are lightweight wrappers around your inference provider. If you're writing a Node app, you'll likely not need one, but if you're writing a browser application and want tools executing in the browser, they're likely necessary for security unless you're writing a prototype, because AI proxy servers allow you to keep your API keys private and meter consumption.

A production-ready proxy server targeting Node will be available from this repository. It will offer these features:

- Very simple configuration
- Portability/modularity in your existing node applications
- Ability to integrate into Redis or other databases for per-IP/per-customer metering

### Providers

Tapeworm has only a built-in implementation for Ollama models at the moment.

Soon, this will change. I will be targeting newer providers in this order:

- Your own proxy server
- AWS Bedrock
- Vertex AI
- OpenAI API
- HuggingFace API

### Streaming support with obfuscation

Tapeworm is synchronous at the moment. The Agent and Model interfaces will be expanded to support streaming. Further, they will be implemented in such a way to prevent side channel attacks.

### Conversation Managers

Summarizing and RAG-based conversation managers will be implemented to prevent token overflow errors.

### Orchestration

Swarms, teams, and graphs will become first-class features of Tapeworm, along with the tools they require to run efficiently.

### Built-in tools

More built-in tools will be added. Would love to get a code interpreter for JS working.

## Any suggestions?

Feel free to leave an issue.
