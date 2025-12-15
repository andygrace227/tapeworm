import type { Model } from "../model/model";
import type ToolCall from "../tool/toolCall";

export default class Conversation {
    messages : Message[];
    manager : ConversationManager;

    constructor() {
        this.messages = [];
        this.manager = new DefaultConversationManager();
    }

    append(message : Message) {
        this.messages.push(message);
        this.messages = this.manager.compact(this.messages);
    }
}


export class Message {
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

    setRole(role: string) {
        this.role = role;
    }

    setContent(content: any) {
        this.content = content;
    }

    setToolCalls(toolCalls: any) {
        this.toolCalls = toolCalls;
    }

    static builder() {
        return new MessageBuilder();
    }

}

export class MessageBuilder {
    role!: string;
    content?: any;
    toolCalls? : ToolCall[];
    toolName? : string;
    thinking? : string;

    setRole(role: string) : MessageBuilder {
        this.role = role;
        return this;
    }

    setContent(content: any) : MessageBuilder {
        this.content = content;
        return this;
    }

    setToolCalls(toolCalls: ToolCall[]) : MessageBuilder {
        this.toolCalls = toolCalls;
        return this;
    }

    setToolName(toolName: any) : MessageBuilder {
        this.toolName = toolName;
        return this;
    }

    setThinking(thinking: string | undefined) : MessageBuilder {
        this.thinking = thinking;
        return this;
    }


    build() {
        return new Message(this.role, this.content, this.toolCalls, this.toolName, this.thinking);
    }

}

export class ConversationManager {

    compact(conversation: Message[]) : Message[] {
        throw new ConversationManagerNotImplementedError("No implementation for conversation manager!");
    }

    configure(model: Model) {
        throw new ConversationManagerNotImplementedError("No implementation for conversation manager!");
    }

}

export class DefaultConversationManager extends ConversationManager {

    compact(conversation: Message[]) : Message[] {
        return conversation;
    }

    configure(_model: Model) {
        //Do nothing. This conversation manager can't do any compaction.
    }
}

/**
 * ConversationManagerNotImplemented errors are runtime errors that show up when a user creates a conversation manager that doesn't implement the required interfaces.
 */
class ConversationManagerNotImplementedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConversationManagerNotImplemented';
    }
}