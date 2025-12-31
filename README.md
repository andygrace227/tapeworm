![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm
<h3>In-browser and Node agent framework.</h3>

[![npm version](https://img.shields.io/npm/v/@atgs/tapeworm.svg?style=flat-square)](https://www.npmjs.org/package/@atgs/tapeworm.svg)

[![npm downloads](https://img.shields.io/npm/dm/@atgs/tapeworm?style=flat-square)](https://npm-stat.com/charts.html?package=@atgs/tapeworm)

[repo link](https://github.com/andygrace227/tapeworm)


Tapeworm is an object-oriented TypeScript/JavaScript framework for building and deploying agents.

It seeks to be the most ergonomic framework for agentic AI in the browser and in Node.


**This project is currently in alpha and is under active development.**

## Directory:

- [Tapeworm Core Package](https://github.com/andygrace227/tapeworm/tree/main/tapeworm#readme)
  - [Tapeworm Core Documentation](https://andygrace227.github.io/tapeworm/tapeworm/index.html)
- [Tapeworm Decorators Plugin](https://github.com/andygrace227/tapeworm/tree/main/tapeworm_decorators#readme)
- [Tapeworm Examples](https://github.com/andygrace227/tapeworm/tree/main/tapeworm_examples#readme)



## Current Features

- Base API Defined.
- Supports `function` tools.
- Supports Ollama models.
- Has a Babel plugin to make tool creation really easy.


## Tapeworm's Tenets

#### Overall

- **Be the most ergonomic agentic solution for Node and the browser.** Each commit should make it easier to develop and deploy agentic AI solutions.
- **Be as model-agnostic as possible.** Use your own machine, AWS, Google, a literal potato... we don't care.
- **Keep things light.** We already waste so much water and energy with AI. The overhead from Tapeworm should be kept to a minimum when possible.

#### Code quality
- **Test as many things as possible.** We're not off to a great start on this one. But it's okay.
- **Don't vibe code anything.** It's better to understand why rather than have someone else implement it for you.
- **Tapeworm's code should be pretty.** Minimize bugs and maximize developer efficiency and happiness.



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
