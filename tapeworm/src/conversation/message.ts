import type ToolCall from "../tool/toolCall";


/**
 * Messages are the units of a Conversation
 * They consist of a series of MessageComponents, several of which are already defined by Tapeworm 
 * and can be extended to be used for other use cases.
 */ 
export default class Message {
    role!: string;
    content!: MessageComponent[];

    /**
     * Wrap a set of message components with an associated sender role.
     * @param role Source of the message (e.g., user, assistant, tool).
     * @param content Ordered list of message components that make up the message body.
     */
    constructor(role: string, content: MessageComponent[]) {
        this.role = role;
        this.content = content;
    }

    /**
     * Create a new message builder for ergonomic construction.
     * @returns A MessageBuilder instance.
     */
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
    private _content!: MessageComponent[];

    /**
     * Set the role associated with the message being built.
     * @param role Source of the message (e.g., user, assistant, tool).
     * @returns This builder for chaining.
     */
    role(role: string) : MessageBuilder {
        this._role = role;
        return this;
    }

    /**
     * Ensure the content array is initialized before appending components.
     */
    init() : void {
        if (this._content == undefined) {
            this._content = [];
        }
    }

    /**
     * Attach a tool call component if provided.
     * @param toolCall Tool call to append to the message.
     * @returns This builder for chaining.
     */
    toolCall(toolCall: ToolCall | undefined) : MessageBuilder {
        if (toolCall == undefined) {
            return this;
        }
        this.init();
        this._content.push(toolCall);
        return this;
    }

    /**
     * Attach a tool result component if provided.
     * @param toolResult Result of a previously executed tool call.
     * @returns This builder for chaining.
     */
    toolResult(toolResult: ToolResult | undefined) : MessageBuilder {
        if (toolResult == undefined) {
            return this;
        }
        this.init();
        this._content.push(toolResult);
        return this;
    }

    /**
     * Attach a thinking component if provided.
     * @param thinking Reflection or chain-of-thought text.
     * @returns This builder for chaining.
     */
    thinking(thinking: string | undefined) : MessageBuilder {
        if (thinking == undefined) {
            return this;
        }
        this.init();
        this._content.push(Thinking.of(thinking));
        return this;
    }

    /**
     * Attach content to the message if provided.
     * @param content Assistant or user text content.
     * @returns This builder for chaining.
     */
    content(content: string | undefined) : MessageBuilder {
        if (content == undefined) {
            return this;
        }
        this.init();
        this._content.push(Content.of(content));
        return this;
    }

    /**
     * Construct the Message with the accumulated values.
     * @returns Finalized Message instance.
     */
    build() {
        return new Message(this._role, this._content);
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

    /**
     * Create a content component with the provided text.
     * @param text Body of the content block.
     */
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

    /**
     * Create a thinking component with the provided thought text.
     * @param thought Chain-of-thought or reasoning string.
     */
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
     * @returns a new Thinking message component with the text.
     */
    static of(thought: string) : Thinking{
        return new this(thought);
    }
}

/**
 * A Thinking message block, representing a thought from the LLM.
 * It contains only a single thought, much like my brain as I'm writing this.
 * It must override the getMessageComponentType function.
 */
export class ToolResult extends MessageComponent {
    id: string;
    toolName: string;
    toolResult!: any;

    /**
     * Create a tool result component for a completed tool call.
     * @param id Identifier of the originating tool call.
     * @param toolName Name of the tool that produced the result.
     * @param toolResult Output returned by the tool.
     */
    constructor(id: string, toolName: string, toolResult: any) {
        super();
        this.id = id;
        this.toolName = toolName;
        this.toolResult = toolResult;
    }

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.ToolResult.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.ToolResult;
    }

    /**
     * Shorthand for the constructor
     * @param toolCall Original tool call that produced this result.
     * @param toolResult Output to attach to the tool result component.
     * @returns a new ToolResult component mirroring the provided tool call.
     */
    static of(toolCall: ToolCall, toolResult: any) : ToolResult {
        return new this(toolCall.id, toolCall.name, toolResult);
    }
}
