import type { Message } from "../conversation/conversation";
import type Tool from "../tool/tool";
import type ToolCall from "../tool/toolCall";


/**
 * A Model represents the LLM backend for the agent.
 */
export class Model {
    /**
     * Execute the model against the provided request.
     * @param request Aggregated messages and tools to send to the model.
     */
    async invoke(request: ModelRequest) : Promise<ModelResponse> {
        throw new ModelNotImplementedError("The invoke function for this model was not correctly implemented.");
    }

    /**
     * Return the maximum token budget supported by this model.
     */
    tokenLimit() {
        throw new ModelNotImplementedError("The tokenLimit function for this model was not correctly implemented.");
    }
}

export class ModelRequest {
    messages : Message[];
    tools: Tool[];

    /**
     * Create a new model request envelope.
     * @param messages Conversation history to send to the model.
     * @param tools Tool definitions available for function calling.
     */
    constructor(messages: Message[], tools : Tool[]) {
        this.messages = messages;
        this.tools = tools;
    }

    static builder() : ModelRequestBuilder {
        return new ModelRequestBuilder();
    }
}

export class ModelRequestBuilder {
    messages!: Message[];
    tools!: Tool[];

    /**
     * Supply the conversation messages to include.
     */
    setMessages(messages: Message[]) : ModelRequestBuilder {
        this.messages = messages;
        return this;
    }

    /**
     * Supply the tool list for this request.
     */
    setTools(tools: Tool[]) : ModelRequestBuilder {
        this.tools = tools;
        return this;
    }

    /**
     * Build the ModelRequest, defaulting tools to an empty array.
     */
    build() : ModelRequest {
        if (this.tools == undefined) {
            this.tools = [];
        }
        return new ModelRequest(this.messages, this.tools);
    }

}

export class ModelResponse {
    toolCalls?: ToolCall[];
    role?: string;
    content?: string;
    thinking? : string;

    /**
     * Wrap a model response.
     * @param toolCalls Optional tool calls returned by the model.
     * @param role Role of the message (e.g., assistant, tool).
     * @param content Text content returned by the model.
     */
    constructor(toolCalls: ToolCall[], role: string | undefined, content: string | undefined, thinking: string | undefined) {
        this.toolCalls = toolCalls;
        this.role = role;
        this.content = content;
        this.thinking = thinking;
    }

    static builder() : ModelResponseBuilder {
        return new ModelResponseBuilder();
    }
}

export class ModelResponseBuilder {
    toolCalls!: ToolCall[];
    role?: string;
    content?: string;
    thinking? : string;

    /**
     * Attach tool calls to the response.
     */
    withToolCalls(toolCalls : ToolCall[]) : ModelResponseBuilder {
        this.toolCalls = toolCalls;
        return this;
    }

    /**
     * Set the role for the response message.
     */
    withRole(role: string) : ModelResponseBuilder{
        this.role = role;
        return this;
    }

    /**
     * Set the textual content for the response message.
     */
    withContent(content: string) : ModelResponseBuilder {
        this.content = content;
        return this;
    }

    
    /**
     * Set the thinking content for the response message.
     */
    withThinking(thinking: string) : ModelResponseBuilder {
        this.thinking = thinking;
        return this;
    }

    /**
     * Build the ModelResponse from the collected fields.
     */
    build() : ModelResponse {
        return new ModelResponse(this.toolCalls, this.role, this.content, this.thinking);
    }
}

/**
 * ModelNotImplementedError errors are runtime errors that show up when a user creates a model that doesn't implement the required interfaces.
 */
class ModelNotImplementedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelNotImplementedError';
    }
}
