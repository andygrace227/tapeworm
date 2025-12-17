import type ToolCall from "../tool/toolCall";


/**
 * Messages are the units of a Conversation
 * They consist of a series of MessageComponents, several of which are already defined by Tapeworm 
 * and can be extended to be used for other use cases.
 */ 
export default class Message {
    role!: string;
    content!: MessageComponent[];

    constructor(role: string, content: MessageComponent[]) {
        this.role = role;
        this.content = content;
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
    private _content!: MessageComponent[];

    role(role: string) : MessageBuilder {
        this._role = role;
        return this;
    }

    init() : void {
        if (this._content == undefined) {
            this._content = [];
        }
    }

    toolCall(toolCall: ToolCall | undefined) : MessageBuilder {
        if (toolCall == undefined) {
            return this;
        }
        this.init();
        this._content.push(toolCall);
        return this;
    }

    toolResult(toolResult: ToolResult | undefined) : MessageBuilder {
        if (toolResult == undefined) {
            return this;
        }
        this.init();
        this._content.push(toolResult);
        return this;
    }

    thinking(thinking: string | undefined) : MessageBuilder {
        if (thinking == undefined) {
            return this;
        }
        this.init();
        this._content.push(Thinking.of(thinking));
        return this;
    }

    content(content: string | undefined) : MessageBuilder {
        if (content == undefined) {
            return this;
        }
        this.init();
        this._content.push(Content.of(content));
        return this;
    }

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
 * A Thinking message block, representing a thought from the LLM.
 * It contains only a single thought, much like my brain as I'm writing this.
 * It must override the getMessageComponentType function.
 */
export class ToolResult extends MessageComponent {
    id: string;
    toolName: string;
    toolResult!: any;

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
     * @param thought - the text this content block represents.
     * @returns a new Content messagecomponent with the text.
     */
    static of(toolCall: ToolCall, toolResult: any) : ToolResult {
        return new this(toolCall.id, toolCall.name, toolResult);
    }
}