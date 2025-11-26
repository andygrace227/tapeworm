import Conversation, { Message } from "../conversation/conversation";
import { ModelRequestBuilder, ModelResponse, type Model } from "../model/model";
import type Tool from "../tool/tool";


export default class Agent {
    name! : string;
    system_prompt? : string;
    tools! : Tool[];
    model! : Model;
    conversation! : Conversation;


    invoke(query : string) {
        if (this.conversation == undefined) {
            this.conversation = new Conversation();
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
    }

    async _runQuery() : Promise<ModelResponse> {

        return await this.model.invoke(
            new ModelRequestBuilder()
                .setMessages(this.conversation?.messages)
                .setTools(this.tools)
                .build()
        );

    }
    
}