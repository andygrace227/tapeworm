import ToolCall from "../tool/toolCall";
import type { Parameter } from "../tool/toolschema";
import { Model, ModelRequest, ModelResponse, ModelResponseBuilder } from "./model";


export default class OllamaModel extends Model {
    endpoint: string;
    model : string;
    options? : any;

    /**
     * Create a model wrapper for an Ollama chat endpoint.
     * @param endpoint Base URL of the Ollama server (e.g., http://localhost:11434).
     * @param model Model name/tag to use for inference.
     * @param options Additional Ollama options passed through to the API.
     */
    constructor(endpoint: string, model: string, options: any) {
        super();
        this.endpoint = endpoint;
        this.model = model;
        this.options = options;
    }

    /**
     * Call the Ollama chat API with the provided conversation and tools.
     * Formats the request, performs the HTTP POST, and translates the response into a ModelResponse.
     */
    async invoke(request: ModelRequest) : Promise<ModelResponse> {
        let requestObject : any = {
            model: this.model,
            messages: this._formatMessages(request),
            tools: this._formatTools(request),
            ...this.options
        }

        let response = await fetch(
        this.endpoint + "/api/chat",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestObject)
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let message = await response.json();

        let toolCalls : ToolCall[] = [];

        if (message['message']['tool_calls']) {
            for (let toolCallKey in message['message']['tool_calls']){
                const toolCallObject = message['message']['tool_calls'][toolCallKey];

                // TODO: Support more types besides function.
                let type : string = "function";
                let name : string = toolCallObject[type]?.name;
                let sequence : number | undefined = toolCallObject[type]?.index;
                let parameterObject : any = toolCallObject[type]?.arguments;
                toolCalls.push(
                    ToolCall.builder()
                        .setName(name)
                        .setType(type)
                        .setParameters(parameterObject)
                        .setSequence(sequence)
                        .build()
                );
            }
        }

        return new ModelResponseBuilder()
            .withToolCalls(toolCalls)
            .withRole(message['message']['role'])
            .withContent(message['message']['content'])
            .withThinking(message['message']['thinking'])
            .build();
    }

    /**
     * Convert internal tool definitions into the JSON schema format expected by Ollama.
     */
    _formatTools(request: ModelRequest) : any {
        let tools = [];

        let required = [];
        for (let tool of request.tools) {
            let parameterObject : any = {};

            for (let parameter of tool.getToolSchema().parameters ) {
                parameterObject[parameter.name] = {};
                parameterObject[parameter.name]['type'] = parameter.name;
                parameterObject[parameter.name]['description'] = parameter.description;
                if (parameter.required) {
                    required.push(parameter.name);
                }
            }

            let toolObject : any = {
                "type" : "function",
                "function" : {
                    "name" : tool.getName(),
                    "description" : tool.getDescription(),
                    "parameters" : {
                        'type' : 'object',
                        'properties' : parameterObject,
                        'required' : required
                    }
                }
            };

            tools.push(toolObject)

        }
        return tools;
    }

    /**
     * Convert internal message objects into Ollama's chat message shape.
     * Passes through assistant/system/user roles and maps tool role into the expected structure.
     */
    _formatMessages(request: ModelRequest) : any {
        let messageObject = [];

        for (let message of request.messages) {
            if (message.role == "assistant" || message.role == "system" || message.role == "user") {
                messageObject.push(message);
                continue;
            }

            if (message.role == "tool") {
                messageObject.push(
                    {
                        role: "tool",
                        content: message.content,
                        tool_name: message.toolName
                    }
                )
            }
        }
        return messageObject;
    }

}
