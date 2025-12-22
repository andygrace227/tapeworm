![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm Examples
<h3>Examples for Tapeworm.</h3>

[![npm version](https://img.shields.io/npm/v/@atgs/tapeworm.svg?style=flat-square)](https://www.npmjs.org/package/@atgs/tapeworm.svg)

[![npm downloads](https://img.shields.io/npm/dm/@atgs/tapeworm?style=flat-square)](https://npm-stat.com/charts.html?package=@atgs/tapeworm)

[repo link](https://github.com/andygrace227/tapeworm)


It provides an object-oriented API to create agents that run either on Node or within the browser.

**This project is currently in alpha and is under active development.**

## So how do I Tapeworm?

Welcome to the official guide for building agents with Tapeworm.

This guide is not finished, but it can give you a basic idea of how to write your code.

Tapeworm's core provides the following building blocks to let you build agents easily:

- **Agent** - this the the code that actually runs tools and the model
- **Model** - an abstraction of an LLM. Handles networking/IO with the inference provider.
- **Tool** - your custom business logic.

Weaving all of these together allows you to build a resilient and smart AI system.

## Defining a Tool

Tools are JS or TS classes, and they have methods that allow the Agent to run them in a deterministic way.

For our example, let's say you made an AI bartender, and we need a way for it to pour us a nice cold one.

- **getName()**: the name of the tool. Should be unique, per agent.
  - For our bartender, let's call it PourBeer
- **getDescription()**: How to use the tool.
  - For our bartender, something like: "Pour a beer for a customer."
- **getToolSchema()**: The parameters that the tool takes in to perform its job.
  - For our bartender, we have a few things that we need to know.
    - How big of a glass?
    - What specific beer?
    - Should we add a lime?
  - We also need an output. For our bartender, something like "delivers a beer to the person in the physical world."
- **execute(params)**: The actual code for the tool
  - In the bartender example, maybe it's the business logic for controlling a robot hand to go get the beer.

These core methods are enough to tell LLMs how to use and call your tools, and how to have Tapeworm execute them.

In practice, it may not be the most ergonomic to define all of these methods by hand. To reduce the boilerplate, you have these options:

- Use the TypeScript decorators if you're working in TypeScript.
- Compile your code with Babel and use the Tapeworm Babel Plugin's decorators.

See the differences in CalculatorBot and CalculatorBotNoDecorations to see how much code these decorators can save you.

## Building Your Agent

Agents are very easy to build in Tapeworm.

```js
// Instantiate your model:
const ollama = new OllamaModel("http://localhost:11434", "gpt-oss:20b", {
  stream: false,
});

// Then build the agent!
const agent = Agent.builder()
  .name("BartenderBot")
  .tools([new PourBeerTool(), new PourWhiskeyTool(), new SatisfyWinosTool()])
  .systemPrompt("You are an agent that serves customers alcoholic drinks in a bar. ")
  .model(ollama)
  .build();
```

That's it. That's all it takes.


## Invoking an Agent

Agents are invoked with `agent.invoke()`

```js
await agent.invoke("Can I get a corona with a lime?");
```

However, you'll note that this doesn't actually return any output. Instead, we use callback functions. 

The default callback function in Tapeworm simply dumps the thinking, content, and tool calls to the console.

However, you can define your own callback handler, or you can use invoke with a custom one.

**This callback is invoked every time that the model produces new output.** Not just the final one.

Here's an example of a function that calls an agent and just returns the last `content` block from the agent:

```js

function callAgent(q : string) {
  const lastMessage = "";

  const myCallback = (m : Message) => {
    let messageContentBlocks = m.filter(MessageComponentType.Content);
    lastMessage = messageContentBlocks.length == 0 ? lastMessage : messageContentBlocks[0]
  }

  await agent.invoke("Can I get a corona with lime?")
  return lastMessage; 

}
```
