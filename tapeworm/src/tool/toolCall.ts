

export default class ToolCall {
    sequence: number | undefined;
    name: string;
    parameters: Map<string, any>;
    type: string;

    constructor(sequence: number | undefined, name: string, parameters: Map<string,any>, type: string) {
        this.sequence = sequence;
        this.name = name;
        this.parameters = parameters;
        this.type = type;
    }

    static builder() : ToolCallBuilder {
        return new ToolCallBuilder();
    }

}

export class ToolCallBuilder {
    sequence!: number | undefined;
    name!: string;
    parameters!: Map<string, any>;
    type!: string;

    setSequence(sequence: number | undefined) : ToolCallBuilder {
        this.sequence = sequence;
        return this;
    }

    setName(name: string) {
        this.name = name;
        return this;

    }

    setParameters(parameters: Map<string, any>) : ToolCallBuilder{
        this.parameters = parameters;
        return this;
    }

    setType(type: string) : ToolCallBuilder{
        this.type = type;
        return this;
    }

    build() : ToolCall {
        if (this.sequence == undefined) {
            this.sequence = 0;
        }
        return new ToolCall(this.sequence, this.name, this.parameters, this.type);
    }


}