

/**
 * Tool schemas specify the input and output of a tool.
 */
export default class ToolSchema {
    parameters: Parameter[];
    output: string;

    /**
     * Create a new tool schema.
     * @param parameters Ordered list of input parameters the tool accepts.
     * @param output Human-readable description of the tool output.
     */
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

    /**
     * Add a parameter definition to the schema.
     * @param parameter Fully constructed parameter to append.
     */
    addParameter(parameter: Parameter) : ToolSchemaBuilder {
        if (this.parameters == undefined) {
            this.parameters = [];
        }
        this.parameters.push(parameter);
        return this;
    }

    /**
     * Describe the output of the tool.
     * @param output Text description of what the tool returns.
     */
    setOutput(output : string) : ToolSchemaBuilder {
        this.output = output;
        return this;
    }

    /**
     * Build the ToolSchema instance from the collected fields.
     */
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

    /**
     * Create a new parameter definition.
     * @param name Identifier for the parameter.
     * @param description Explanation of how the parameter is used.
     * @param type JSON-serializable type name (e.g., string, number).
     * @param required Whether the parameter must be provided.
     */
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

    /**
     * Placeholder for validating supported parameter types.
     */
    assertValidType() {
        
    }

}

export class ParameterBuilder {
    private name! : string;
    private description!: string;
    private type!: string;
    private required?: boolean;

    /**
     * Set the parameter name.
     */
    setName(name : string) : ParameterBuilder {
        this.name = name;
        return this;
    }

    /**
     * Set the parameter description.
     */
    setDescription(description : string) : ParameterBuilder {
        this.description = description;
        return this;
    }

    /**
     * Set the parameter type.
     */
    setType(type : string) : ParameterBuilder {
        this.type = type;
        return this;
    }
    
    /**
     * Mark the parameter as required or optional.
     */
    setRequired(required : boolean) : ParameterBuilder {
        this.required = required;
        return this;
    }

    /**
     * Build a Parameter instance using the accumulated fields.
     */
    build() : Parameter {
        if (this.required == undefined) {
            this.required = false;
        }
        return new Parameter(this.name, this.description, this.type, this.required);
    }
}
