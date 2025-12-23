/**
 * This module contains everything related to tool schemas.
 *
 * Enclosed are the ToolSchema (and builder) and Parameter (and builder) classes.
 *
 * @module
 */

/**
 * ToolSchemas define the input and output of a tool.
 *
 * They consist of a list of parameters and a description of the output of the tool.
 *
 * You can build these using ToolSchemaBuilder, but it can be more pragmatic to use
 * the Typescript or Babel decorators instead, as they will automatically generate a ToolSchema for you.
 */
export default class ToolSchema {
  parameters: Parameter[];
  output: string;

  /**
   * Create a new tool schema.
   * @param parameters Ordered list of input parameters the tool accepts.
   * @param output Human-readable description of the tool output.
   */
  constructor(parameters: Parameter[], output: string) {
    this.parameters = parameters;
    this.output = output;
  }

  /**
   * Return a tool schema builder, so you can properly construct tools instead of dealing with the constructor
   * @returns a tool schema builder.
   */
  static builder() {
    return new ToolSchemaBuilder();
  }
}

/**
 * A builder for tool schemas
 */
export class ToolSchemaBuilder {
  private _parameters!: Parameter[];
  private _output!: string;

  /**
   * Add a parameter definition to the schema.
   * @param parameter Fully constructed parameter to append.
   * @returns This builder for chaining.
   */
  addParameter(parameter: Parameter): ToolSchemaBuilder {
    if (this._parameters == undefined) {
      this._parameters = [];
    }
    this._parameters.push(parameter);
    return this;
  }

  /**
   * Describe the output of the tool.
   * @param output Text description of what the tool returns.
   * @returns This builder for chaining.
   */
  output(output: string): ToolSchemaBuilder {
    this._output = output;
    return this;
  }

  /**
   * Build the ToolSchema instance from the collected fields.
   * @returns Constructed ToolSchema describing parameters and output.
   */
  build(): ToolSchema {
    if (this._parameters == undefined) {
      this._parameters = [];
    }
    return new ToolSchema(this._parameters, this._output);
  }
}
/**
 * A Parameter for a tool.
 * Includes:
 * - The name of the parameter
 * - What the parameter is used for
 * - The type of the parameter
 */
export class Parameter {
  name: string;
  description: string;
  type: string;
  required: boolean;

  /**
   * Create a new parameter definition.
   * @param name Identifier for the parameter.
   * @param description Explanation of how the parameter is used.
   * @param type JSON-serializable type name (e.g., string, number).
   * @param required Whether the parameter must be provided.
   */
  constructor(
    name: string,
    description: string,
    type: string,
    required: boolean,
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.required = required;
    this.assertValidType();
  }

  /**
   * Placeholder for validating supported parameter types.
   */
  assertValidType() {}

  /**
   * Create a builder for constructing a Parameter.
   * @returns A ParameterBuilder instance.
   */
  static builder() {
    return new ParameterBuilder();
  }
}

/**
 * Builder for defining tool parameters step by step.
 */
export class ParameterBuilder {
  private _name!: string;
  private _description!: string;
  private _type!: string;
  private _required?: boolean;

  /**
   * Set the parameter name.
   * @returns This builder for chaining.
   */
  name(name: string): ParameterBuilder {
    this._name = name;
    return this;
  }

  /**
   * Set the parameter description.
   * @returns This builder for chaining.
   */
  description(description: string): ParameterBuilder {
    this._description = description;
    return this;
  }

  /**
   * Set the parameter type.
   * @returns This builder for chaining.
   */
  type(type: string): ParameterBuilder {
    this._type = type;
    return this;
  }

  /**
   * Mark the parameter as required or optional.
   * @returns This builder for chaining.
   */
  required(required: boolean): ParameterBuilder {
    this._required = required;
    return this;
  }

  /**
   * Build a Parameter instance using the accumulated fields.
   * @returns Constructed Parameter definition.
   */
  build(): Parameter {
    if (this._required == undefined) {
      this._required = false;
    }
    return new Parameter(
      this._name,
      this._description,
      this._type,
      this._required,
    );
  }
}
