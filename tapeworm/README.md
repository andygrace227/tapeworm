

![Tapeworm Logo](./tapeworm.svg)

# Tapeworm

Tapeworm is an in-browser and node agent framework.

This is the root package for Tapeworm. You can consume other packages like @atgs/tapeworm_bedrock for AWS Bedrock support.

It provides an object-oriented API to create agents that run either on Node or within the browser.

**This project is currently in alpha and is under active development.** 

## Current Features
- Base API Defined
- Supports `function` tools 
- Supports Ollama models


## Example

```
import {Agent, OllamaModel, Parameter, Tool, ToolSchema} from '../../dist/tapeworm.es.js';

class SomeTool extends Tool {

    // Get the name of the function
    getName() {
        return "AdditionTool";
    }

    // Tell models what this function does
    getDescription() {
        return "Adds two numbers together.";
    }

    // Define the tool schema
    getToolSchema() {

    }

    // Actually run the code!
    execute(input) {
        let a = input.a;
        let b = input.b;
        return a + b;
    }

}

const ollama = new Model();

const agent = new Agent();
agent.name = "agent";
agent.tools = [new YourTool(), new YourOtherTool()]
agent.system_prompt = "You are an agent "
agent.model = ollama;

await agent.invoke("What is 9 + 10"); // Most likely doesn't print 21.

```



## Roadmap

Tapeworm seeks to be the most ergonomic agentic solution for Node and the browser. 

It has a long way to go before this project is there, but I believe we're off to a good start.

Here are the main areas that will be addressed:

### Better Agent Definitions

Agents will have a dedicated builder, and I will attempt to make tool definitions a lot easier to write so that the `getName()`, `getDescription()`, and `getToolSchema()` can be generated from your JSDoc or with annotations.

In the meantime, schemas are easy to define with builders. See the example calculator bot for an example.

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