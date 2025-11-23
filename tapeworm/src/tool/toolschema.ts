

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
export class ToolBuilder {
    parameters?: Parameter[];
    output!: string;

    addParameter(parameter: Parameter) {
        if (this.parameters == undefined) {
            this.parameters = [];
        }
        this.parameters.push(parameter)
    }

    setOutput(output : string) {
        this.output = output;
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

    constructor(name: string,
        description: string,
        type: string
    ) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.assertValidType()
    }

    assertValidType() {
        
    }

}

export class ParameterBuilder {
    private name! : string;
    private description!: string;
    private type!: string;

    setName(name : string) {
        this.name = name;
    }

    setDescription(description : string) {
        this.description = description;
    }

    setType(type : string) {
        this.type = type;
    }

    build() : Parameter {
        return new Parameter(this.name, this.description, this.type);
    }
}