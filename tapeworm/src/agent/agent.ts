import Conversation, { ConversationManager } from "../conversation/conversation";
import Message, { MessageComponentType, ToolResult } from "../conversation/message";
import { ModelRequestBuilder, type Model } from "../model/model";
import type Tool from "../tool/tool";
import type ToolCall from "../tool/toolCall";
import { ToolNotFoundError } from "../tool/toolCall";


/**
 * Coordinates a model, its tools, and the running conversation to fulfill user queries.
 */
export default class Agent {
    name! : string;
    system_prompt? : string;
    tools! : Tool[];
    model! : Model;
    conversation! : Conversation;
    conversationManager? : ConversationManager;
    toolNameToIndexMap : any | undefined;

    /**
     * Run the full agent loop for a user query: seed the conversation, invoke the model,
     * and execute any returned tool calls until completion.
     * @param query User-provided input to hand to the agent.
     */
    async invoke(query : string) {
        if (this.conversation == undefined) {
            this.conversation = new Conversation();
            if (this.conversationManager != undefined) {
                this.conversation.manager = this.conversationManager;
            }

            this.conversation.append(
                Message
                    .builder()
                    .role("system")
                    .content(this.system_prompt)
                .build()
            )
        }
        this.conversation.append(
            Message.builder()
                .role("user")
                .content(query)
                .build()
        );

        let doneWithCalls = false;

        while (!doneWithCalls) {

            let response = await this._runQuery();
            this.conversation.append(response);

            doneWithCalls = true;
            const toolCalls = response.filter(MessageComponentType.ToolCall) as ToolCall[];

            if (toolCalls != undefined && toolCalls.length != 0) {
                doneWithCalls = false;
                toolCalls.sort(
                    (a, b) => {
                    return (a.sequence ?? 0) < (b.sequence ?? 0) ? -1 : 1;
                });

                for (let toolCall of toolCalls) {
                    this._runTool(toolCall);
                }
            }
        }
    }

    /**
     * Ask the backing model for the next response given the current conversation state.
     * @returns Parsed model response including content, thinking, and tool calls.
     */
    async _runQuery() : Promise<Message> {

        return await this.model.invoke(
            new ModelRequestBuilder()
                .messages(this.conversation?.messages)
                .tools(this.tools)
                .build()
        );
    }

    /**
     * Execute a single tool call and append the result (or error) back to the conversation.
     * @param toolCall Tool invocation details returned by the model.
     * @returns Tool execution output, if any.
     */
    async _runTool(toolCall : ToolCall) : Promise<any> {
        console.log("Calling tool: " + JSON.stringify(toolCall));

        this.generateToolNameToIndexMap();
        
        if (toolCall.name in this.toolNameToIndexMap == false) {
            // Error - this tool call does not exist in this agent.
            this.conversation.append(
                Message.builder()
                        .role("tool")
                        .toolResult(ToolResult.of(toolCall, new ToolNotFoundError("Agent does not have a tool with this name.")))
                        .build()
            );
            return;
        }

        let tool = this.tools[this.toolNameToIndexMap[toolCall.name]];

        try {
            let result = tool.execute(toolCall.parameters);
            this.conversation.append(
                Message.builder()
                    .role("tool")
                    .toolResult(ToolResult.of(toolCall, result))
                    .build()
            )
            // Result was good. Save it
        } catch (error) {
            // Tool encountered an error.
            this.conversation.append(
                Message.builder()
                    .role("tool")
                    .toolResult(ToolResult.of(toolCall, JSON.stringify(error)))
                    .build()
            )
        }
    }

    /**
     * Build a lookup from tool name to index for efficient resolution of tool calls.
     */
    generateToolNameToIndexMap() {
        if (this.toolNameToIndexMap == undefined) {
            this.toolNameToIndexMap = {};
            for (let i = 0; i < this.tools.length; i++){
                this.toolNameToIndexMap[this.tools[i].getName()] = i;
            }
        }
    }
    
}
