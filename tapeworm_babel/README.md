![Tapeworm Logo](https://raw.githubusercontent.com/andygrace227/tapeworm/main/tapeworm.svg)

# Tapeworm Babel Plugin
<h3>The official Tapeworm Babel plugin.</h3>

[![npm version](https://img.shields.io/npm/v/@atgs/tapeworm.svg?style=flat-square)](https://www.npmjs.org/package/@atgs/tapeworm.svg)
[![npm downloads](https://img.shields.io/npm/dm/@atgs/tapeworm?style=flat-square)](https://npm-stat.com/charts.html?package=@atgs/tapeworm)
[repo link](https://github.com/andygrace227/tapeworm)


**Tapeworm** provides an easy-to-use agent framework.

**Tapeworm_Babel** (@atgs/babel-plugin-tapeworm-decorator) provides an easy way for you to build your tools with Tapeworm.

## Motivation

Tapeworm relies on Tools to perform your custom business logic. Tools are JS/TS classes that extend Tool and include the following boilerplate methods:
- `getName()`: the name of the tool.
- `getDescription()`: the description.
- `getToolSchema()`: specifies the parameters that your business logic takes and the significance of the output.
- `execute(any)`: your actual business logic.

Because all this boiler plate is required, tools can look a bit messy when you have a lot of parameters:

```js
/**
 * Example: A tool that lets the LLM search through cars at a dealership.
 */
class CarSearchTool extends Tool {

  getName() {
    return "CarSearchTool";
  }

  getDescription() {
    return "Finds cars in inventory at the dealership.";
  }


  getToolSchema() {
    return ToolSchema.builder()
      .addParameter(
        Parameter.builder()
          .name("make")
          .description("The manufacturer of the car.")
          .required(true)
          .type("string")
          .build(),
      )
      .addParameter(
        Parameter.builder()
          .name("model")
          .description("The model of the car")
          .required(true)
          .type("string")
          .build(),
      )
    .addParameter(
        Parameter.builder()
          .name("year-begin")
          .description("The oldest model year of the car")
          .required(true)
          .type("number")
          .build(),
      )
    .addParameter(
        Parameter.builder()
          .name("year-end")
          .description("The newest model year of the car")
          .required(true)
          .type("number")
          .build(),
      )
    .addParameter(
        Parameter.builder()
          .name("color")
          .description("The color of the car")
          .required(true)
          .type("string")
          .build(),
      )
      ...
      .output("A number that is equal to a + b")
      .build();
  }

  
  /**
   * Now on top of all that boilerplate, you have the actual business logic!
   */ 
  execute({make, model, year-begin, year-end, color, ...}) {
    // blah
  }
}

```
This example is kind of egregious, but you get the point. There's a lot of boiler plate, and the focus of a tool shouldn't be boilerplate. It should be your application logic.

When compiling with Babel, we can instead leverage the following annotations: 

- `@Tool` - Annotation for the class. contains `name` and `description` of the tool.
 - If `name` is not specified, and we know the name of the class, then the class name is used as the tool name.
- `@TParam` - Annotation for the execute method. Contains a `name`, `description`, `required`, and `type` field.
- `@TOutput` - a descripton of the output of the function

So, with these features, we can get something closer to this: 

```js
/**
 * Note: getName() is inferred from the name of the class.
 */

@Tool({description: "Finds cars in inventory at the dealership"})
class CarSearchTool extends Tool {

  /**
   * Barely any boilerplate!
   */ 
  @TParam({name: "make", description: "The manufacturer of the car.", required: true, type: "string"})
  @TParam({name: "model", description: "The model of the car.", required: true, type: "string"})
  @TParam({name: "year-begin", description: "The oldest model year of the car.", required: true, type: "number"})
  @TParam({name: "year-end", description: "The newest model year of the car.", required: true, type: "number"})
  @TParam({name: "color", description: "The color of the car.", required: true, type: "string"})
  execute({make, model, year-begin, year-end, color, ...}) {
    // blah
  }
}

```

This is easier to read and a lot more concise. 

To use it, you can follow the configuration in the tapeworm_examples package:

**Step 1**: Use Babel to transpile JavaScript.

**Step 2**: Add this to your Babel config file
```json
 "plugins": [
        "@atgs/babel-plugin-tapeworm-decorator",
        [
            "@babel/plugin-syntax-decorators",
            {
                "decoratorsBeforeExport": true
            }
        ]
    ]
```

**Step 3**: Compile with Babel. I'm using NPM, so I run 
`babel src --out-dir dist --extensions .js`