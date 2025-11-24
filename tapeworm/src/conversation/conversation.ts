

export class Message {
    role!: string;
    content?: any;
    toolCalls? : any[];

    setRole(role: string) {
        this.role = role;
    }

    setContent(content: any) {
        this.content = content;
    }

    setToolCalls(toolCalls: any) {
        this.toolCalls = toolCalls;
    }

}