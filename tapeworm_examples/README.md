![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm
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



