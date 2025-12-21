import { Message } from "..";
import {
  Content,
  MessageComponentType,
  Thinking,
  ToolResult,
} from "../conversation/message";
import ToolCall from "../tool/toolCall";
import { Model, ModelRequest } from "./model";

/**
 * Model adapter that translates between Tapeworm message/tool shapes and the Ollama chat API.
 */
export default class OllamaModel extends Model {
  endpoint: string;
  model: string;
  options?: any;

  /**
   * Create a model wrapper for an Ollama chat endpoint.
   * @param endpoint Base URL of the Ollama server (e.g., http://localhost:11434).
   * @param model Model name/tag to use for inference.
   * @param options Additional Ollama options passed through to the API.
   */
  constructor(endpoint: string, model: string, options: any) {
    super();
    this.endpoint = endpoint;
    this.model = model;
    this.options = options;
  }

  /**
   * Call the Ollama chat API with the provided conversation and tools.
   * Formats the request, performs the HTTP POST, and translates the response into a ModelResponse.
   */
  async invoke(request: ModelRequest): Promise<Message> {
    let requestObject: any = {
      model: this.model,
      messages: this._formatMessages(request),
      tools: this._formatTools(request),
      ...this.options,
    };

    let response = await fetch(this.endpoint + "/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestObject),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let message = await response.json();

    let toolCalls: ToolCall[] = [];

    if (message["message"]["tool_calls"]) {
      for (let toolCallKey in message["message"]["tool_calls"]) {
        const toolCallObject = message["message"]["tool_calls"][toolCallKey];

        // TODO: Support more types besides function.
        let type: string = "function";
        let name: string = toolCallObject[type]?.name;
        let sequence: number | undefined = toolCallObject[type]?.index;
        let parameterObject: any = toolCallObject[type]?.arguments;
        toolCalls.push(
          ToolCall.builder()
            .name(name)
            .type(type)
            .parameters(parameterObject)
            .sequence(sequence)
            .build(),
        );
      }
    }

    return Message.builder()
      .toolCalls(toolCalls)
      .role(message["message"]["role"])
      .content(message["message"]["content"])
      .thinking(message["message"]["thinking"])
      .build();
  }

  /**
   * Convert internal tool definitions into the JSON schema format expected by Ollama.
   * @param request Model request containing declared tools.
   * @returns Array of tool schema objects formatted for the Ollama API.
   */
  _formatTools(request: ModelRequest): any {
    let tools = [];

    for (let tool of request.tools) {
      let parameterObject: any = {};
      let required = [];

      for (let parameter of tool.getToolSchema().parameters) {
        parameterObject[parameter.name] = {};
        parameterObject[parameter.name]["type"] = parameter.type;
        parameterObject[parameter.name]["description"] = parameter.description;
        if (parameter.required) {
          required.push(parameter.name);
        }
      }

      let toolObject: any = {
        type: "function",
        function: {
          name: tool.getName(),
          description: tool.getDescription(),
          parameters: {
            type: "object",
            properties: parameterObject,
            required: required,
          },
        },
      };

      tools.push(toolObject);
    }
    return tools;
  }

  /**
   * Convert internal message objects into Ollama's chat message shape.
   * Passes through assistant/system/user roles and maps tool role into the expected structure.
   * @param request Model request containing the message history.
   * @returns Array of serialized messages ready for Ollama.
   */
  _formatMessages(request: ModelRequest): any {
    let messageObject = [];

    for (let message of request.messages) {
      if (
        message.role == "assistant" ||
        message.role == "system" ||
        message.role == "user"
      ) {
        messageObject.push(this._formatSingleMessage(message));
        continue;
      }

      if (message.role == "tool") {
        for (const component of message.content) {
          if (
            component.getMessageComponentType() ==
            MessageComponentType.ToolResult
          ) {
            const toolResultComponent: ToolResult = component as ToolResult;
            messageObject.push({
              role: message.role,
              name: toolResultComponent.toolName,
              content: JSON.stringify(toolResultComponent.toolResult),
            });
          }
        }
      }
    }
    return messageObject;
  }

  /**
   * Format everything sent by a user or LLM (no tools)
   * @param message Message to serialize for Ollama.
   * @returns Serialized message payload.
   */
  _formatSingleMessage(message: Message): any {
    let messageObject: any = {
      role: message.role,
    };

    let content = undefined;
    let toolCalls = undefined;
    let thinking = undefined;

    for (const component of message.content) {
      if (component.getMessageComponentType() == MessageComponentType.Content) {
        const contentComponent = component as Content;
        if (content == undefined) {
          content = "";
        }
        content += contentComponent.get();
      }

      if (
        component.getMessageComponentType() == MessageComponentType.Thinking
      ) {
        const thinkingComponent = component as Thinking;
        if (thinking == undefined) {
          thinking = "";
        }
        thinking += thinkingComponent.get();
      }

      if (
        component.getMessageComponentType() == MessageComponentType.ToolCall
      ) {
        const toolCallComponent = component as ToolCall;
        if (toolCalls == undefined) {
          toolCalls = [];
        }
        toolCalls.push(this._formatToolCall(toolCallComponent));
      }
    }

    if (content != undefined) {
      messageObject["content"] = content;
    }

    if (toolCalls != undefined) {
      messageObject["tool_calls"] = toolCalls;
    }
    if (thinking != undefined) {
      messageObject["thinking"] = thinking;
    }

    return messageObject;
  }

  /**
   * Convert a ToolCall into the structure Ollama expects.
   * @param toolCall ToolCall to serialize.
   * @returns Minimal representation containing function name and arguments.
   */
  _formatToolCall(toolCall: ToolCall): any {
    return {
      function: {
        name: toolCall.name,
        arguments: toolCall.parameters,
      },
    };
  }
}
