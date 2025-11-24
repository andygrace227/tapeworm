import type { Message } from "../conversation/conversation";
import type Tool from "../tool/tool";


export class Model {

    async invoke(request: ModelRequest) : Promise<ModelResponse> {
        throw new ModelNotImplementedError("The invoke function for this model was not correctly implemented.");
    }

}


export class ModelRequest {
    messages!: Message[];
    tools!: Tool[];

    setMessages(messages: Message[]) {
        this.messages = messages;
    }

    setTools(tools: Tool[]) {
        this.tools = tools;
    }

}

export class ModelResponse {
    toolCalls?: any[];
    role?: string;
    content?: string;

    constructor(toolCalls: any[] | undefined, role: string | undefined, content: string | undefined) {
        this.toolCalls = toolCalls;
        this.role = role;
        this.content = content;
    }
}

export class ModelResponseBuilder {
    toolCalls?: any[];
    role?: string;
    content?: string;

    withToolCalls(toolCalls : any) : ModelResponseBuilder {
        this.toolCalls = toolCalls;
        return this;
    }

    withRole(role: string) : ModelResponseBuilder{
        this.role = role;
        return this;
    }

    withContent(content: string) : ModelResponseBuilder {
        this.content = content;
        return this;
    }

    build() : ModelResponse {
        return new ModelResponse(this.toolCalls, this.role, this.content);
    }
}

/**
 * ModelNotImplementedError errors are runtime errors that show up when a user creates a model that doesn't implement the required interfaces.
 */
class ModelNotImplementedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelNotImplementedError';
    }
}