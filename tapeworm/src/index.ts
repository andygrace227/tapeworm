/**
 * The index module gathers the exports from Tapeworm.
 *
 * This file should be modified when new classes are introduced to Tapeworm
 *
 * @module
 */

export { default as Agent } from "./agent/agent";
export {
  default as Conversation,
  ConversationManager,
  DefaultConversationManager,
} from "./conversation/conversation";
export { Model, ModelRequest, ModelRequestBuilder } from "./model/model";
export { default as Tool } from "./tool/tool";
export { default as ToolCall, ToolCallBuilder } from "./tool/toolCall";
export {
  default as ToolSchema,
  ToolSchemaBuilder,
  Parameter,
  ParameterBuilder,
} from "./tool/toolschema";
export { default as OllamaModel } from "./model/OllamaModel";
export {
  default as Message,
  MessageBuilder,
  MessageComponentType,
  MessageComponent,
  Content,
  Thinking,
  ToolResult,
} from "./conversation/message";
export {
  ToolName,
  ToolDescription,
  ToolParameter,
  ToolOutput,
} from "./tool/toolDecorators";
