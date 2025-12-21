![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm
<h3>The official Tapeworm babel plugin.</h3>

[![npm version](https://img.shields.io/npm/v/@atgs/tapeworm.svg?style=flat-square)](https://www.npmjs.org/package/@atgs/tapeworm.svg)

[![npm downloads](https://img.shields.io/npm/dm/@atgs/tapeworm?style=flat-square)](https://npm-stat.com/charts.html?package=@atgs/tapeworm)

[repo link](https://github.com/andygrace227/tapeworm)


It provides an object-oriented API to create agents that run either on Node or within the browser.

**This project is currently in alpha and is under active development.**

## ToolSchemas take up a lot of space. Decorators to the rescue!

This is a simple Babel plugin that supports the following annotations:

- `@Tool` - Annotation for the class. contains `name` and `description` of the tool.
 - If `name` is not specified, and we know the name of the class, then the class name is used as the tool name.
- `@TParam` - Annotation for the execute method. Contains a `name`, `description`, `required`, and `type` field.
- `@TOutput` - a descripton of the output of the function