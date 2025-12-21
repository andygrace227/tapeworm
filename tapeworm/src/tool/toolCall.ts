import {
  MessageComponent,
  MessageComponentType,
} from "../conversation/message";

/**
 * Represents a single tool invocation returned by a model, including the target
 * tool name, argument map, type (function/spec), and optional sequence number.
 *
 * The ToolCall object is also a MessageComponent and thus is a component of Message.
 */
export default class ToolCall extends MessageComponent {
  sequence: number | undefined;
  name: string;
  parameters: any;
  type: string;
  id: string;

  /**
   * Get the type of this message component, as defined in MessageComponentType.
   * This returns MessageComponentType.ToolCall.
   */
  getMessageComponentType(): MessageComponentType {
    return MessageComponentType.ToolCall;
  }

  /**
   * Create a ToolCall component to represent a model-requested tool invocation.
   * @param sequence Optional ordering from the model for batched tool calls.
   * @param name Name of the tool to invoke.
   * @param parameters Arguments provided by the model.
   * @param type Type of tool call (e.g., function).
   * @param id Provider-generated identifier for correlating results.
   */
  constructor(
    sequence: number | undefined,
    name: string,
    parameters: any,
    type: string,
    id: string,
  ) {
    super();
    this.sequence = sequence;
    this.name = name;
    this.parameters = parameters;
    this.type = type;
    this.id = id;
  }

  /**
   * Convenience factory for a ToolCallBuilder.
   * @returns A new ToolCallBuilder instance.
   */
  static builder(): ToolCallBuilder {
    return new ToolCallBuilder();
  }
}

/**
 * Fluent builder for constructing ToolCall instances from model output.
 */
export class ToolCallBuilder {
  private _sequence!: number | undefined;
  private _name!: string;
  private _parameters!: any;
  private _type!: string;
  private _id!: string;

  /**
   * Set the sequence number for the tool call.
   * @param sequence Optional position of the tool call in a batch.
   * @returns This builder for chaining.
   */
  sequence(sequence: number | undefined): ToolCallBuilder {
    this._sequence = sequence;
    return this;
  }

  /**
   * Set the name of the tool to invoke.
   * @param name Tool identifier.
   * @returns This builder for chaining.
   */
  name(name: string) {
    this._name = name;
    return this;
  }

  /**
   * Provide the argument payload for the tool call.
   * @param parameters JSON-serializable arguments to pass to the tool.
   * @returns This builder for chaining.
   */
  parameters(parameters: any): ToolCallBuilder {
    this._parameters = parameters;
    return this;
  }

  /**
   * Set the type of tool call (e.g., function).
   * @param type Provider-specific tool call type.
   * @returns This builder for chaining.
   */
  type(type: string): ToolCallBuilder {
    this._type = type;
    return this;
  }

  /**
   * Assign the provider tool call identifier for correlation.
   * @param id Unique identifier returned by the model.
   * @returns This builder for chaining.
   */
  id(id: string | undefined): ToolCallBuilder {
    if (id != undefined) {
      this._id = id;
    }
    return this;
  }

  /**
   * Build the ToolCall with collected data, defaulting sequence to 0.
   * @returns ToolCall instance ready to attach to a message.
   */
  build(): ToolCall {
    if (this._sequence == undefined) {
      this._sequence = 0;
    }
    if (this._id == undefined) {
      // Generate a random ID. Does not need to be cryptographically secure nor very long.
      this._id = (Math.random() + 1).toString(36).slice(2, 7);
    }

    return new ToolCall(
      this._sequence,
      this._name,
      this._parameters,
      this._type,
      this._id,
    );
  }
}

/**
 * Error thrown when a requested tool cannot be found on the agent.
 */
export class ToolNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolNotFoundError";
  }
}
