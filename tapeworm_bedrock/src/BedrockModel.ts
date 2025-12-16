import { Message, Model, ModelRequest, ModelResponse, ModelResponseBuilder } from '@atgs/tapeworm';
import { BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand } from '@aws-sdk/client-bedrock-runtime';


/**
 * This is the Amazon Bedrock version of a Tapeworm Model.
 * It is a wrapper around AWS's BedrockRuntime Client and as such is subject to the limitations of the 
 * AWS BedrockRuntimeClient class.
 * 
 * It cannot likely be run in browsers (it needs AWS Credentials loaded in your environment)
 * 
 * 
 */
export default class BedrockModel extends Model {
    bedrockClient! : BedrockRuntimeClient;
    modelId? : string;
    inferenceConfig: any;


    /** 
     * Calls the AWS Bedrock Converse API (with tools), translating from Tapeworm APIs to Bedrock APIs
     */
    async invoke(request: ModelRequest) : Promise<ModelResponse> {

        let requestObject = new ConverseCommand({
            modelId: this.modelId,
            messages: this._formatMessages(request),
            system: this._findSystemPrompt(request),
            toolConfig: this._formatTools(request),
            inferenceConfig: this.inferenceConfig,
        })

        try {
            const response = await this.bedrockClient.send(new ConverseCommand(requestObject));
                return new ModelResponseBuilder()
                .toolCalls(toolCalls)
                .role(message['message']['role'])
                .content(message['message']['content'])
                .thinking(message['message']['thinking'])
                .build();

        } catch (error) {
            console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error.message}`);
            throw error;
        }




      

    }

    _formatMessages(request: ModelRequest) : any {
        let messagesArr = [];
        
        for (let message of request.messages) {
             if (message.role == "assistant" || message.role == "system" || message.role == "user") {
                let messageObject : any = {
                    role: message.role,
                    content: []
                };

                if (message.content != undefined) {
                    messageObject.content.push( {text: message.content});
                }

                if (message.toolCalls != undefined) {
                    messageObject.content.push(this._handleToolCalls(message));
                }


                messagesArr.push(
                    {
                        role: message.role,
                        content: [
                            {text: message.content} 
                        ]
                    }
                );
            

                continue;
            }

            





        }

    }

    _findSystemPrompt(request: ModelRequest) : any {


    }

    _handleToolCalls(message: Message) : any {
        let toolCallBlocks = []

        for (let toolCall of message.toolCalls ?? []) {
            toolCallBlocks.push(
                {
                    name: message.toolCalls,
                    input: input
                }
            )

        }




        return {
            name: message.toolCalls,
            input: 
        }
        
    }

    //https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_bedrock-runtime_code_examples.html
    _formatTools(request: ModelRequest) : any {









    }


    

}