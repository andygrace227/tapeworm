

/**
 * Tool schemas specify the input and output of a tool.
 */
export default class ToolSchema {
    parameters: Parameter[];
    output: string;

    constructor(parameters: Parameter[], output: string) {
        this.parameters = parameters;
        this.output = output;
    }

}

/**
 * A builder for tool schemas
 */
export class ToolSchemaBuilder {
    parameters!: Parameter[];
    output!: string;

    addParameter(parameter: Parameter) : ToolSchemaBuilder {
        if (this.parameters == undefined) {
            this.parameters = [];
        }
        this.parameters.push(parameter);
        return this;
    }

    setOutput(output : string) : ToolSchemaBuilder {
        this.output = output;
        return this;
    }

    build() : ToolSchema {
        return new ToolSchema(this.parameters, this.output);
    }

}
/**
 * A Parameter for a tool.
 * Includes:
 * - The name of the parameter
 * - What the parameter is used for
 * - The type of the parameter
 */
export class Parameter {
    name : string;
    description: string;
    type: string;
    required: boolean;

    constructor(name: string,
        description: string,
        type: string,
        required: boolean
    ) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.required = required;
        this.assertValidType()
    }

    assertValidType() {
        
    }

}

export class ParameterBuilder {
    private name! : string;
    private description!: string;
    private type!: string;
    private required?: boolean;

    setName(name : string) : ParameterBuilder {
        this.name = name;
        return this;
    }

    setDescription(description : string) : ParameterBuilder {
        this.description = description;
        return this;
    }

    setType(type : string) : ParameterBuilder {
        this.type = type;
        return this;
    }
    
    setRequired(required : boolean) : ParameterBuilder {
        this.required = required;
        return this;
    }

    build() : Parameter {
        if (this.required == undefined) {
            this.required = false;
        }
        return new Parameter(this.name, this.description, this.type, this.required);
    }
}