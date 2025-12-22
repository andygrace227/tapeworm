import Conversation, {
  ConversationManager,
  DefaultConversationManager,
} from "../conversation/conversation";
import Message, {
  Content,
  MessageComponentType,
  Thinking,
  ToolResult,
} from "../conversation/message";
import { ModelRequestBuilder, type Model } from "../model/model";
import type Tool from "../tool/tool";
import type ToolCall from "../tool/toolCall";
import { ToolNotFoundError } from "../tool/toolCall";

/**
 * Coordinates a model, its tools, and the running conversation to fulfill user queries.
 */
export default class Agent {
  name!: string;
  systemPrompt?: string;
  tools!: Tool[];
  model!: Model;
  conversation!: Conversation;
  conversationManager?: ConversationManager;
  toolNameToIndexMap: any | undefined;
  callback!: (m: Message) => void;

  constructor(
    name: string,
    tools: Tool[],
    model: Model,
    conversationManager: ConversationManager,
    callback: (m: Message) => void,
  ) {
    this.name = name;
    this.model = model;
    this.conversationManager = conversationManager;
    this.tools = tools;
    this.callback = callback;
    this.conversationManager.configure(model);
  }

  /**
   * Run the full agent loop for a user query: seed the conversation, invoke the model,
   * and execute any returned tool calls until completion.
   *   *
   * @param query User-provided input to hand to the agent.
   * @param callback A function that handles the messages coming from the agent.
   */
  async invoke(query: string, callback: (m: Message) => void = this.callback) {
    if (this.conversation == undefined) {
      this.conversation = new Conversation();
      if (this.conversationManager != undefined) {
        this.conversation.manager = this.conversationManager;
      }
      if (this.systemPrompt != undefined) {
        this.conversation.append(
          Message.builder().role("system").content(this.systemPrompt).build(),
        );
      }
    }
    this.conversation.append(
      Message.builder().role("user").content(query).build(),
    );

    let doneWithCalls = false;

    while (!doneWithCalls) {
      let response = await this._runQuery();
      callback(response);
      this.conversation.append(response);

      doneWithCalls = true;
      const toolCalls = response.filter(
        MessageComponentType.ToolCall,
      ) as ToolCall[];

      if (toolCalls != undefined && toolCalls.length != 0) {
        doneWithCalls = false;
        toolCalls.sort((a, b) => {
          return (a.sequence ?? 0) < (b.sequence ?? 0) ? -1 : 1;
        });

        for (let toolCall of toolCalls) {
          await this._runTool(toolCall);
        }
      }
    }
  }

  /**
   * Ask the backing model for the next response given the current conversation state.
   * @returns Parsed model response including content, thinking, and tool calls.
   */
  async _runQuery(): Promise<Message> {
    return await this.model.invoke(
      new ModelRequestBuilder()
        .messages(this.conversation?.messages)
        .tools(this.tools)
        .build(),
    );
  }

  /**
   * Execute a single tool call and append the result (or error) back to the conversation.
   * @param toolCall Tool invocation details returned by the model.
   * @returns Tool execution output, if any.
   */
  async _runTool(toolCall: ToolCall): Promise<any> {
    this.generateToolNameToIndexMap();

    if (toolCall.name in this.toolNameToIndexMap == false) {
      // Error - this tool call does not exist in this agent.
      this.conversation.append(
        Message.builder()
          .role("tool")
          .toolResult(
            ToolResult.of(
              toolCall,
              new ToolNotFoundError(
                "Agent does not have a tool with this name.",
              ),
            ),
          )
          .build(),
      );
      return;
    }

    let tool = this.tools[this.toolNameToIndexMap[toolCall.name]];

    try {
      let result = await tool.execute(toolCall.parameters);
      this.conversation.append(
        Message.builder()
          .role("tool")
          .toolResult(ToolResult.of(toolCall, result))
          .build(),
      );
      // Result was good. Save it
    } catch (error) {
      // Tool encountered an error.
      this.conversation.append(
        Message.builder()
          .role("tool")
          .toolResult(ToolResult.of(toolCall, JSON.stringify(error)))
          .build(),
      );
    }
  }

  /**
   * Build a lookup from tool name to index for efficient resolution of tool calls.
   */
  generateToolNameToIndexMap() {
    if (this.toolNameToIndexMap == undefined) {
      this.toolNameToIndexMap = {};
      for (let i = 0; i < this.tools.length; i++) {
        this.toolNameToIndexMap[this.tools[i].getName()] = i;
      }
    }
  }

  static builder(): AgentBuilder {
    return new AgentBuilder();
  }
}

class AgentBuilder {
  _name!: string;
  _systemPrompt?: string;
  _tools!: Tool[];
  _model!: Model;
  _conversation!: Conversation | undefined;
  _conversationManager: ConversationManager = new DefaultConversationManager();
  _toolNameToIndexMap: any | undefined;
  _callback: (m: Message) => void = (m: Message) => defaultCallback(m);

  name(name: string): AgentBuilder {
    this._name = name;
    return this;
  }

  systemPrompt(systemPrompt: string | undefined): AgentBuilder {
    this._systemPrompt = systemPrompt;
    return this;
  }

  tools(tools: Tool[]): AgentBuilder {
    this._tools = tools;
    return this;
  }

  addTool(tool: Tool): AgentBuilder {
    if (this._tools == undefined) {
      this._tools = [];
    }
    this._tools.push(tool);
    return this;
  }

  model(model: Model): AgentBuilder {
    this._model = model;
    return this;
  }

  conversationManager(mgr: ConversationManager): AgentBuilder {
    this._conversationManager = mgr;
    return this;
  }

  callback(callback: (m: Message) => void): AgentBuilder {
    this._callback = callback;
    return this;
  }

  build(): Agent {
    let agent = new Agent(
      this._name,
      this._tools,
      this._model,
      this._conversationManager,
      this._callback,
    );

    if (this._conversation != undefined) {
      agent.conversation = this._conversation;
    }

    if (this._systemPrompt != undefined) {
      agent.systemPrompt = this._systemPrompt;
    }

    return agent;
  }
}

export function defaultCallback(m: Message) {
  for (const thinking of m.filter(MessageComponentType.Thinking)) {
    console.log("\x1b[90m" + (thinking as Thinking).get() + "\x1b[0m");
  }
  for (const content of m.filter(MessageComponentType.Content)) {
    console.log((content as Content).get());
  }
  for (const tool of m.filter(MessageComponentType.ToolCall)) {
    console.log("\x1b[32mCalling Tool: " + (tool as ToolCall).name + "\x1b[0m");
  }
}
