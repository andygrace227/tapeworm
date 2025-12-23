/**
 * The Conversation module contains the Conversation class and the ConversationManager prototypes.
 *
 * The Conversation is a wrapper around both a manager and an array of messages.
 *
 * The Conversation Manager is an object that can perform operations on only the conversation.
 *
 * While no Conversation Managers have been implemented yet, they will allow resilience to overflowing context windows.
 *
 * @module
 */

import type { Message } from "..";
import type { Model } from "../model/model";

/**
 * A Conversation holds an array of messages and its associated manager.
 *
 * Conversations are (mostly) immutable, until the manager steps in and compacts the conversation.
 */
export default class Conversation {
  messages: Message[];
  manager: ConversationManager;

  /**
   * Initialize an empty conversation using the default manager.
   */
  constructor() {
    this.messages = [];
    this.manager = new DefaultConversationManager();
  }

  /**
   * Append a message to the history and apply compaction rules.
   * @param message Message to store.
   */
  append(message: Message) {
    this.messages.push(message);
    this.messages = this.manager.compact(this.messages);
  }
}

/**
 * Interface for compacting a Conversation. Future implementations can summarize or do RAG-based compaction
 */
export class ConversationManager {
  /**
   * Compact or adjust a conversation according to a strategy.
   * @param conversation Full list of messages so far.
   * @returns Adjusted message list to keep.
   */
  compact(_conversation: Message[]): Message[] {
    throw new ConversationManagerNotImplementedError(
      "No implementation for conversation manager!",
    );
  }

  /**
   * Allow the manager to consider model-specific constraints (e.g., token limits).
   * @param model Model being used for this conversation.
   */
  configure(_model: Model) {
    throw new ConversationManagerNotImplementedError(
      "No implementation for conversation manager!",
    );
  }
}

/**
 * Default conversation manager that leaves all messages intact.
 */
export class DefaultConversationManager extends ConversationManager {
  /**
   * Default strategy simply returns the conversation untouched.
   */
  compact(conversation: Message[]): Message[] {
    return conversation;
  }

  /**
   * Default manager ignores model configuration because it does no compaction.
   */
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
    this.name = "ConversationManagerNotImplemented";
  }
}
