
export default class Conversation {
    messages : Message[];
    manager? : ConversationManager;

    constructor() {
        this.messages = [];
    }

    append(message : Message) {
        this.messages.push(message);
    }
}


export class Message {
    role!: string;
    content?: any;
    toolCalls? : any[];

    constructor(role: string, content: any, toolCalls: any[] | undefined) {
        this.role = role;
        this.content = content;
        this.toolCalls = toolCalls;
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
    toolCalls? : any[];

    setRole(role: string) : MessageBuilder {
        this.role = role;
        return this;
    }

    setContent(content: any) : MessageBuilder {
        this.content = content;
        return this;
    }

    setToolCalls(toolCalls: any) : MessageBuilder {
        this.toolCalls = toolCalls;
        return this;
    }

    build() {
        return new Message(this.role, this.content, this.toolCalls);
    }

}

export class ConversationManager {

    compact(conversation: Conversation) : Conversation {
        throw new ConversationManagerNotImplementedError("No implementation for conversation manager!");
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