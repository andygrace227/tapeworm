import type ToolCall from "../tool/toolCall";


/**
 * Messages are the units of a Conversation
 * They consist of a series of MessageComponents, several of which are already defined by Tapeworm 
 * and can be extended to be used for other use cases.
 */ 
export default class Message {
    role!: string;
    content?: any;
    toolCalls? : ToolCall[];
    toolName? : string;
    thinking? : string;

    constructor(role: string, content: any, toolCalls: any[] | undefined, toolName: string | undefined, thinking: string | undefined) {
        this.role = role;
        this.content = content;
        this.toolCalls = toolCalls;
        this.toolName = toolName;
        this.thinking = thinking;
    }

    static builder() {
        return new MessageBuilder();
    }

}

/**
 * Tapeworm prefers builders rather than constructors.
 * 
 * This builder provides ergonomic methods to construct a message w/ its message components.
 * 
 */
export class MessageBuilder {
    private _role!: string;
    private _content?: any;
    private _toolCalls? : ToolCall[];
    private _toolName? : string;
    private _thinking? : string;

    role(role: string) : MessageBuilder {
        this._role = role;
        return this;
    }

    content(content: any) : MessageBuilder {
        this._content = content;
        return this;
    }

    toolCalls(toolCalls: ToolCall[]) : MessageBuilder {
        this._toolCalls = toolCalls;
        return this;
    }

    toolName(toolName: any) : MessageBuilder {
        this._toolName = toolName;
        return this;
    }

    thinking(thinking: string | undefined) : MessageBuilder {
        this._thinking = thinking;
        return this;
    }

    build() {
        return new Message(this._role, this._content, this._toolCalls, this._toolName, this._thinking);
    }

}

/**
 * These are the official MessageComponent types supported by Tapeworm.
 * 
 * Tapeworm guarantees that these can all be processed by officially supported models.
 */
export const MessageComponentType = {
    Content: 'content',
    Thinking: 'thinking',
    ToolCall: 'toolcall',
    ToolResult: 'toolresult'
};

export type MessageComponentType = typeof MessageComponentType[keyof typeof MessageComponentType];

/**
 * This is the base class of a message component.
 * It must override the getMessageComponentType function.
 */
export class MessageComponent {

    /**
     * Get the type of this message component, as defined in MessageComponentType
     */
    getMessageComponentType() : MessageComponentType {
        throw new Error("Message components that do not have a message component type are not allowed.")
    }

}

/**
 * A Content message block, representing text from the LLM.
 * It contains only content.
 * It must override the getMessageComponentType function.
 */
export class Content extends MessageComponent {
    text!: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.Content.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.Content;
    }

    /**
     * Get the content of this MessageComponent.
     * @returns the string contained in this component.
     */
    get() : string {
        return this.text;
    }

    /**
     * Shorthand for the constructor
     * @param text - the text this content block represents.
     * @returns a new Content messagecomponent with the text.
     */
    static of(text: string) : Content {
        return new this(text);
    }
}

/**
 * A Thinking message block, representing a thought from the LLM.
 * It contains only a single thought, much like my brain as I'm writing this.
 * It must override the getMessageComponentType function.
 */
export class Thinking extends MessageComponent {
    thought!: string;

    constructor(thought: string) {
        super();
        this.thought = thought;
    }

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.Content.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.Thinking;
    }

    /**
     * Get the content of this MessageComponent.
     * @returns the string contained in this component.
     */
    get() : string {
        return this.thought;
    }

    /**
     * Shorthand for the constructor
     * @param thought - the text this content block represents.
     * @returns a new Content messagecomponent with the text.
     */
    static of(thought: string) : Thinking{
        return new this(thought);
    }
}

/**
 * A ToolCall message block (which wraps a tool call), representing an invocation from an LLM
 * It contains and encodes the LLM's intent to call a tool.
 */
export class ToolCallWrapper extends MessageComponent {
    toolCall!: ToolCall;

    constructor(toolCall: ToolCall) {
        super();
        this.toolCall = toolCall;
    }

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.ToolCall.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.ToolCall;
    }

    /**
     * Get the tool call wrapped in this wrapper
     * @returns the tool call contained in this component.
     */
    get() : ToolCall {
        return this.toolCall;
    }

    /**
     * Shorthand for the constructor
     * @param toolCall - the tool call this content block represents.
     * @returns a new ToolCallWrapper with the text.
     */
    static of(toolCall: ToolCall) : ToolCallWrapper{
        return new this(toolCall);
    }
}


//TODO: Finish this.

/**
 * A Thinking message block, representing a thought from the LLM.
 * It contains only a single thought, much like my brain as I'm writing this.
 * It must override the getMessageComponentType function.
 */
export class ToolResultWrapper extends MessageComponent {
    thought!: string;

    constructor(thought: string) {
        super();
        this.thought = thought;
    }

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.ToolResult.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.ToolResult;
    }

    /**
     * Get the content of this MessageComponent.
     * @returns the string contained in this component.
     */
    get() : string {
        return this.thought;
    }

    /**
     * Shorthand for the constructor
     * @param thought - the text this content block represents.
     * @returns a new Content messagecomponent with the text.
     */
    static of(thought: string) : Thinking{
        return new this(thought);
    }
}