import Agent from './agent';
import { Model } from '../model/model';
import Message, { MessageBuilder } from '../conversation/message';
import Tool from '../tool/tool';
import ToolCall, { ToolCallBuilder } from '../tool/toolCall';
import ToolSchema from '../tool/toolschema';
import { ToolResult } from '../conversation/message';

class FakeModel extends Model {
    requests: any[] = [];
    private responses: any[];

    constructor(responses: any[]) {
        super();
        this.responses = [...responses];
    }

    async invoke(request: any) {
        this.requests.push(request);
        return this.responses.shift() as any;
    }
}

class EchoTool extends Tool {
    executions: any[] = [];

    constructor() {
        super();
    }

    getName() {
        return 'echo';
    }

    getDescription() {
        return 'echoes input';
    }

    getToolSchema() {
        return new ToolSchema([], 'returns the provided value');
    }

    execute(input: any) {
        this.executions.push(input);
        const value = input instanceof Map ? input.get('value') : input?.value;
        return { received: value };
    }
}

const buildAgent = (responses: any[], tools: Tool[] = []) => {
    const agent = new Agent();
    agent.name = 'testAgent';
    agent.system_prompt = 'testSystemPrompt';
    agent.tools = tools;
    agent.model = new FakeModel(responses);
    return agent;
};

describe('Agent.invoke', () => {
    it('initializes the conversation and forwards messages to the model', async () => {
        const modelResponses : Message[] = [
            Message.builder()
                .role("assistant")
                .content("hi there")
                .build()
        ];
        const agent = buildAgent(modelResponses);

        await agent.invoke('hello');

        expect(agent.conversation.messages.map((m: any) => m.role)).toEqual([
            'system',
            'user',
            'assistant',
        ]);
        const lastRequest = (agent.model as FakeModel).requests[0];

        expect(lastRequest.messages[0].content[0].text).toBe('testSystemPrompt');
        expect(lastRequest.messages[1].content[0].text).toBe('hello');
        expect(lastRequest.tools).toEqual([]);
    });

    it('runs returned tool calls and appends the tool output to the conversation', async () => {
        const toolCall = new ToolCallBuilder()
            .sequence(0)
            .name('echo')
            .parameters(new Map([['value', 'ping']]))
            .type('function')
            .build();

        const responses = [
            Message.builder()
                .role('assistant')
                .content('calling tool')
                .toolCalls([toolCall])
                .build()
            ,
            Message.builder()
                .role('assistant')
                .content('done')
                .build()
        ];

        const tool = new EchoTool();
        const agent = buildAgent(responses, [tool]);

        await agent.invoke('run tool');

        console.log(agent.conversation.messages)

        const toolMessage = agent.conversation.messages.find((m: any) => m.role === 'tool');
        expect((toolMessage?.content[0] as ToolResult).toolName).toBe('echo');
        expect((toolMessage?.content[0] as ToolResult).toolResult).toEqual({ received: 'ping' });
        expect(tool.executions[0]).toBeInstanceOf(Map);
        expect(agent.conversation.messages.map((m: any) => m.role)).toEqual([
            'system',
            'user',
            'assistant',
            'tool',
            'assistant',
        ]);
    });
});
