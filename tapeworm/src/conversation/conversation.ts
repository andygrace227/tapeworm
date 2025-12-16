import type { Message } from "..";
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
