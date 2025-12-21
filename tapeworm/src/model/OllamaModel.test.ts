import OllamaModel from "./OllamaModel";
import Message, {
  Content,
  MessageBuilder,
  MessageComponentType,
  Thinking,
  ToolResult,
} from "../conversation/message";
import Tool from "../tool/tool";
import ToolCall from "../tool/toolCall";
import ToolSchema, { Parameter } from "../tool/toolschema";
import { ModelRequest } from "./model";

const buildTool = (
  name: string,
  description: string,
  parameters: Parameter[],
) => {
  const schema = new ToolSchema(parameters, "output");
  return {
    getName: () => name,
    getDescription: () => description,
    getToolSchema: () => schema,
  } as unknown as Tool;
};

describe("OllamaModel", () => {
  const endpoint = "http://localhost:11434";
  const modelName = "llama3";

  describe("_formatToolCall", () => {
    it("returns the minimal function payload for a tool call", () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const toolCall = new ToolCall(
        1,
        "lookup",
        { query: "test" },
        "function",
        "abc",
      );

      expect((model as any)._formatToolCall(toolCall)).toEqual({
        function: { name: "lookup", arguments: { query: "test" } },
      });
    });
  });

  describe("_formatSingleMessage", () => {
    it("merges content, tool calls, and thinking components", () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const firstCall = new ToolCall(0, "first", { a: 1 }, "function", "1");
      const secondCall = new ToolCall(1, "second", { b: 2 }, "function", "2");

      const message = new MessageBuilder()
        .role("assistant")
        .content("Hello ")
        .content("World")
        .toolCalls([firstCall, secondCall])
        .thinking("ponder")
        .thinking(" more")
        .build();

      expect((model as any)._formatSingleMessage(message)).toEqual({
        role: "assistant",
        content: "Hello World",
        tool_calls: [
          { function: { name: "first", arguments: { a: 1 } } },
          { function: { name: "second", arguments: { b: 2 } } },
        ],
        thinking: "ponder more",
      });
    });

    it("omits optional fields when no matching components are present", () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const message = new Message("user", []);

      expect((model as any)._formatSingleMessage(message)).toEqual({
        role: "user",
      });
    });
  });

  describe("_formatMessages", () => {
    it("serializes user/assistant messages and maps tool results", () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const toolCall = new ToolCall(0, "math", { x: 1 }, "function", "t1");
      const toolResult = ToolResult.of(toolCall, { value: 42 });

      const userMessage = new MessageBuilder()
        .role("user")
        .content("Hi")
        .thinking("hmm")
        .build();
      const toolMessage = new MessageBuilder()
        .role("tool")
        .toolResult(toolResult)
        .content("ignored")
        .build();
      const assistantMessage = new MessageBuilder()
        .role("assistant")
        .content("Done")
        .build();

      const request = new ModelRequest(
        [userMessage, toolMessage, assistantMessage],
        [],
      );

      expect((model as any)._formatMessages(request)).toEqual([
        { role: "user", content: "Hi", thinking: "hmm" },
        { role: "tool", name: "math", content: JSON.stringify({ value: 42 }) },
        { role: "assistant", content: "Done" },
      ]);
    });
  });

  describe("_formatTools", () => {
    it("converts tool schemas into Ollama JSON schema objects", () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const toolOne = buildTool("one", "first tool", [
        new Parameter("first", "first param", "string", true),
        new Parameter("second", "second param", "number", false),
      ]);
      const toolTwo = buildTool("two", "second tool", [
        new Parameter("third", "third param", "string", true),
      ]);

      const tools = (model as any)._formatTools(
        new ModelRequest([], [toolOne, toolTwo]),
      );

      expect(tools).toEqual([
        {
          type: "function",
          function: {
            name: "one",
            description: "first tool",
            parameters: {
              type: "object",
              properties: {
                first: { type: "first", description: "first param" },
                second: { type: "second", description: "second param" },
              },
              required: ["first"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "two",
            description: "second tool",
            parameters: {
              type: "object",
              properties: {
                third: { type: "third", description: "third param" },
              },
              required: ["third"],
            },
          },
        },
      ]);
    });
  });

  describe("invoke", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      jest.restoreAllMocks();
      global.fetch = originalFetch as any;
    });

    it("posts formatted request to Ollama and maps the response into a Message", async () => {
      const options = { temperature: 0.4 };
      const model = new OllamaModel(endpoint, modelName, options);
      const tool = buildTool("search", "searches", [
        new Parameter("query", "text to search", "string", true),
      ]);
      const request = new ModelRequest(
        [new MessageBuilder().role("user").content("Hello").build()],
        [tool],
      );

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            role: "assistant",
            content: "hi back",
            thinking: "hmm",
            tool_calls: [
              { function: { name: "search", arguments: { query: "Hello" } } },
            ],
          },
        }),
      });
      global.fetch = fetchMock as any;

      const response = await model.invoke(request);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, fetchOptions] = fetchMock.mock.calls[0];
      expect(fetchMock.mock.calls[0][0]).toBe(`${endpoint}/api/chat`);
      expect(fetchOptions?.method).toBe("POST");

      const parsedBody = JSON.parse(fetchOptions?.body as string);
      expect(parsedBody.model).toBe(modelName);
      expect(parsedBody.tools).toEqual((model as any)._formatTools(request));
      expect(parsedBody.messages).toEqual(
        (model as any)._formatMessages(request),
      );
      expect(parsedBody.temperature).toBe(0.4);

      expect(response.role).toBe("assistant");
      const contentBlocks = response.filter(
        MessageComponentType.Content,
      ) as Content[];
      const thinkingBlocks = response.filter(
        MessageComponentType.Thinking,
      ) as Thinking[];
      const toolCalls = response.filter(
        MessageComponentType.ToolCall,
      ) as ToolCall[];

      expect(contentBlocks[0].get()).toBe("hi back");
      expect(thinkingBlocks[0].get()).toBe("hmm");
      expect(toolCalls[0].name).toBe("search");
      expect(toolCalls[0].parameters).toEqual({ query: "Hello" });
    });

    it("throws an error when the Ollama API returns a non-OK status", async () => {
      const model = new OllamaModel(endpoint, modelName, {});
      const request = new ModelRequest([], []);
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as any;

      await expect(model.invoke(request)).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });
  });
});
