import type { Parameter } from "../tool/toolschema";
import { Model, ModelRequest, ModelResponse, ModelResponseBuilder } from "./model";



export class OllamaModel extends Model {
    endpoint: string;
    model : string;
    options? : any;

    constructor(endpoint: string, model: string, options: any) {
        super();
        this.endpoint = endpoint;
        this.model = model;
        this.options = options;
    }

    async invoke(request: ModelRequest) : Promise<ModelResponse> {
        let requestObject : any = {
            model: this.model,
            messages: request.messages,
            tools: request.tools,
            options: this.options
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

        return new ModelResponseBuilder()
            .withToolCalls(message['message']['tool_calls'])
            .withRole(message['message']['role'])
            .withContent(message['message']['content'])
            .build();
    }

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

    _formatMessages(request: ModelRequest) : any {
        let messageObject = [];

    }

}