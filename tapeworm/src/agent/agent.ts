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
                    .setRole("system")
                    .setContent(this.system_prompt)
                .build()
            )
        }
        this.conversation.append(
            Message.builder()
                .setRole("user")
                .setContent(query)
                .build()
        );

        let doneWithCalls = false;

        while (!doneWithCalls) {

            let response = await this._runQuery();

            this.conversation.append(
                Message.builder()
                    .setRole(response.role ?? 'assistant')
                    .content(response.content ?? '')
                    .build()
            );

            doneWithCalls = true;

            if (response.toolCalls != undefined && response.toolCalls.length != 0) {
                doneWithCalls = false;
                for (let toolCall in response.toolCalls) {
                    this.generateToolNameToIndexMap();

                }
            }


        }

    }

    async _runQuery() : Promise<ModelResponse> {

        return await this.model.invoke(
            new ModelRequestBuilder()
                .setMessages(this.conversation?.messages)
                .setTools(this.tools)
                .build()
        );

    }

    async _runTool(toolCall : ToolCall) : Promise<any> {

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