/**
 * This file contains TypeScript decorator functions for Tapeworm.
 *
 * They are different from the Babel decorators in @atgs/babel-plugin-tapeworm-decorator, but they achieve the same functionality.
 *
 *
 */

import ToolSchema, { Parameter } from "./toolschema";

export function ToolName(name: String) {
  return (toolClass: Function) => {
    toolClass.prototype.getName = () => {
      return name;
    };
  };
}

export function ToolDescription(description: String) {
  return (toolClass: Function) => {
    Object.defineProperty(toolClass.prototype, "getDescription", {
      value: function () {
        return description;
      },
      enumerable: true,
      configurable: true,
      writable: true,
    });
  };
}

interface ShortHandParameter {
  name: string;
  description: string;
  required: boolean;
  type: string;
}

export function ToolParameter(parameter: ShortHandParameter) {
  return (toolClass: Function) => {
    if (toolClass.prototype.tapewormParams == undefined) {
      toolClass.prototype.tapewormParams = [];
    }

    if (toolClass.prototype.tapewormParamsOutput == undefined) {
      toolClass.prototype.tapewormParamsOutput = "";
    }

    toolClass.prototype.tapewormParams.push(
      Parameter.builder()
        .name(parameter.name)
        .description(parameter.description)
        .required(parameter.required)
        .type(parameter.type)
        .build(),
    );

    toolClass.prototype.getToolSchema = () => {
      return new ToolSchema(
        toolClass.prototype.tapewormParams,
        toolClass.prototype.tapewormParamsOutput,
      );
    };
  };
}

export function ToolOutput(output: string) {
  return (toolClass: Function) => {
    if (toolClass.prototype.tapewormParams == undefined) {
      toolClass.prototype.tapewormParams = [];
    }

    if (toolClass.prototype.tapewormParamsOutput == undefined) {
      toolClass.prototype.tapewormParamsOutput = "";
    }

    toolClass.prototype.tapewormParamsOutput = output;

    toolClass.prototype.getToolSchema = () => {
      return new ToolSchema(
        toolClass.prototype.tapewormParams,
        toolClass.prototype.tapewormParamsOutput,
      );
    };
  };
}
