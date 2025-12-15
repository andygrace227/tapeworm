import Conversation, { ConversationManager, Message } from "../conversation/conversation";
import { ModelRequestBuilder, ModelResponse, type Model } from "../model/model";
import type Tool from "../tool/tool";
import type ToolCall from "../tool/toolCall";


export default class Agent {
    name! : string;
    system_prompt? : string;
    tools! : Tool[];
    model! : Model;
    conversation! : Conversation;
    conversationManager? : ConversationManager;
    toolNameToIndexMap : any | undefined;

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

            this.conversation.append(
                Message.builder()
                    .role(response.role ?? 'assistant')
                    .content(response.content ?? '')
                    .thinking(response.thinking ?? '')
                    .build()
            );

            console.log("Assistant thinking: " + response.thinking);
            console.log("Assistant reply: " + response.content);

            doneWithCalls = true;

            if (response.toolCalls != undefined && response.toolCalls.length != 0) {
                doneWithCalls = false;
                response.toolCalls.sort(
                    (a, b) => {
                    return (a.sequence ?? 0) < (b.sequence ?? 0) ? -1 : 1;
                });

                for (let toolCall in response.toolCalls) {
                    this._runTool(response.toolCalls[toolCall]);
                }
            }
        }
    }

    async _runQuery() : Promise<ModelResponse> {

        return await this.model.invoke(
            new ModelRequestBuilder()
                .messages(this.conversation?.messages)
                .tools(this.tools)
                .build()
        );
    }

    async _runTool(toolCall : ToolCall) : Promise<any> {
        console.log("Calling tool: " + JSON.stringify(toolCall));

        this.generateToolNameToIndexMap();
        
        if (toolCall.name in this.toolNameToIndexMap == false) {
            // Error - this tool call does not exist in this agent.
            this.conversation.append(
                Message.builder()
                        .role("tool")
                        .toolName(toolCall.name)
                        .content(JSON.stringify({"error": "tool does not exist"}))
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
                    .toolName(toolCall.name)
                    .content(JSON.stringify(result))
                    .build()
            )
            // Result was good. Save it
        } catch (error) {
            // Tool encountered an error.
            this.conversation.append(
                Message.builder()
                    .role("tool")
                    .toolName(toolCall.name)
                    .content(JSON.stringify(error))
                    .build()
            )
        }
    }

    generateToolNameToIndexMap() {
        if (this.toolNameToIndexMap == undefined) {
            this.toolNameToIndexMap = {};
            for (let i = 0; i < this.tools.length; i++){
                this.toolNameToIndexMap[this.tools[i].getName()] = i;
            }
        }
    }
    
}
