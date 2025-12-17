import { MessageComponent, MessageComponentType } from "../conversation/message";


/**
 * Represents a single tool invocation returned by a model, including the target
 * tool name, argument map, type (function/spec), and optional sequence number.
 * 
 * The ToolCall object is also a MessageComponent and thus is a component of Message.
 */
export default class ToolCall extends MessageComponent {
    sequence: number | undefined;
    name: string;
    parameters: any;
    type: string;
    id: string;

    /**
     * Get the type of this message component, as defined in MessageComponentType.
     * This returns MessageComponentType.ToolCall.
     */
    getMessageComponentType(): MessageComponentType {
        return MessageComponentType.ToolCall;
    }
    
    constructor(sequence: number | undefined, name: string, parameters: any, type: string, id: string) {
        super();
        this.sequence = sequence;
        this.name = name;
        this.parameters = parameters;
        this.type = type;
        this.id = id;
    }

    static builder() : ToolCallBuilder {
        return new ToolCallBuilder();
    }

}

/**
 * Fluent builder for constructing ToolCall instances from model output.
 */
export class ToolCallBuilder {
    private _sequence!: number | undefined;
    private _name!: string;
    private _parameters!: any;
    private _type!: string;
    private _id!: string;

    sequence(sequence: number | undefined) : ToolCallBuilder {
        this._sequence = sequence;
        return this;
    }

    name(name: string) {
        this._name = name;
        return this;
    }

    parameters(parameters: any) : ToolCallBuilder {
        this._parameters = parameters;
        return this;
    }

    type(type: string) : ToolCallBuilder {
        this._type = type;
        return this;
    }

    id(id: string) : ToolCallBuilder {
        this._id = id;
        return this;
    }

    build() : ToolCall {
        if (this._sequence == undefined) {
            this._sequence = 0;
        }
        return new ToolCall(this._sequence, this._name, this._parameters, this._type, this._id);
    }


}

export class ToolNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolNotFoundError';
    }
}