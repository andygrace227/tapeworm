

/**
 * Represents a single tool invocation returned by a model, including the target
 * tool name, argument map, type (function/spec), and optional sequence number.
 */
export default class ToolCall {
    sequence: number | undefined;
    name: string;
    parameters: any;
    type: string;

    constructor(sequence: number | undefined, name: string, parameters: any, type: string) {
        this.sequence = sequence;
        this.name = name;
        this.parameters = parameters;
        this.type = type;
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

    sequence(sequence: number | undefined) : ToolCallBuilder {
        this._sequence = sequence;
        return this;
    }

    name(name: string) {
        this._name = name;
        return this;
    }

    parameters(parameters: any) : ToolCallBuilder{
        this._parameters = parameters;
        return this;
    }

    type(type: string) : ToolCallBuilder{
        this._type = type;
        return this;
    }

    build() : ToolCall {
        if (this._sequence == undefined) {
            this._sequence = 0;
        }
        return new ToolCall(this._sequence, this._name, this._parameters, this._type);
    }


}
