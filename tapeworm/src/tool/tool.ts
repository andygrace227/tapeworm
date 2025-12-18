import type ToolSchema from "./toolschema";

/**
 * ToolNotDefined errors are runtime errors that show up when a user creates a tool that doesn't have a well defined schema.
 */
class ToolNotDefinedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolNotDefinedError';
    }
}

/**
 * The Tool class represents a tool that a Tapeworm agent can use.
 * 
 */
export default class Tool {
    private name: string;
    private description: string;
    private tool_schema: ToolSchema;

    /**
     * Initialize tool metadata from subclass implementations.
     */
    constructor() {
        this.name = this.getName();
        this.description = this.getDescription();
        this.tool_schema = this.getToolSchema();
    }

    /**
     * Name that uniquely identifies this tool.
     * @returns A short, stable identifier string.
     */
    getName(): string {
        throw new ToolNotDefinedError("Tool name not defined.");
    }

    /**
     * Human-readable description of what the tool does.
     * @returns Description string shown to the model.
     */
    getDescription(): string {
        throw new ToolNotDefinedError("Tool description not defined.");
    }
    
    /**
     * Structured schema describing tool parameters and output.
     * @returns ToolSchema instance.
     */
    getToolSchema(): ToolSchema {
        throw new ToolNotDefinedError("Tool parameter schema not defined.");
    }

    // @ts-ignore
    /**
     * Execute the tool against provided input parameters.
     * @param input Parsed arguments from the model.
     * @returns Tool-specific output.
     */
    execute(input: any): any {
        return null;
    }

}
