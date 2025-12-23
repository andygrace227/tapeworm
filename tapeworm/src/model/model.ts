/**
 * The Model module lays out the interface for a Tapeworm model.
 *
 * It contains the base Model class, which doesn't do anything other than throw errors and specify an interface,
 * and also the ModelRequest and ModelRequestBuilder classes, which show what kind of shape a model expects to
 * recieve upon invocation.
 *
 *
 * @module
 */

import type Message from "../conversation/message";
import type Tool from "../tool/tool";

/**
 * A Model represents the LLM backend for the agent.
 */
export class Model {
  /**
   * Execute the model against the provided request.
   * @param request Aggregated messages and tools to send to the model.
   */
  async invoke(_request: ModelRequest): Promise<Message> {
    throw new ModelNotImplementedError(
      "The invoke function for this model was not correctly implemented.",
    );
  }

  /**
   * Return the maximum token budget supported by this model.
   */
  tokenLimit() {
    throw new ModelNotImplementedError(
      "The tokenLimit function for this model was not correctly implemented.",
    );
  }
}

/**
 * Container for the messages and tools required to invoke a model.
 */
export class ModelRequest {
  messages: Message[];
  tools: Tool[];

  /**
   * Create a new model request envelope.
   * @param messages Conversation history to send to the model.
   * @param tools Tool definitions available for function calling.
   */
  constructor(messages: Message[], tools: Tool[]) {
    this.messages = messages;
    this.tools = tools;
  }

  /**
   * Create a builder for composing a model request.
   * @returns A ModelRequestBuilder instance.
   */
  static builder(): ModelRequestBuilder {
    return new ModelRequestBuilder();
  }
}

/**
 * Fluent builder for constructing ModelRequest instances.
 */
export class ModelRequestBuilder {
  private _messages!: Message[];
  private _tools!: Tool[];

  /**
   * Supply the conversation messages to include.
   * @returns This builder for chaining.
   */
  messages(messages: Message[]): ModelRequestBuilder {
    this._messages = messages;
    return this;
  }

  /**
   * Supply the tool list for this request.
   * @returns This builder for chaining.
   */
  tools(tools: Tool[]): ModelRequestBuilder {
    this._tools = tools;
    return this;
  }

  /**
   * Build the ModelRequest, defaulting tools to an empty array.
   * @returns Constructed ModelRequest.
   */
  build(): ModelRequest {
    if (this._tools == undefined) {
      this._tools = [];
    }
    if (this._messages == undefined) {
      throw new MessagesNotDefinedError(
        "Requests to the model should include content.",
      );
    }
    return new ModelRequest(this._messages, this._tools);
  }
}

/**
 * ModelNotImplementedError errors are runtime errors that show up when a user creates a model that doesn't implement the required interfaces.
 */
class ModelNotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelNotImplementedError";
  }
}

/**
 * MessagesNotDefinedError errors are runtime errors that show up when a user passes no messages to the Model.
 * This will result in undefined behavior.
 */
class MessagesNotDefinedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessagesNotDefinedError";
  }
}
