import Agent from "../agent/agent";
import type Conversation from "../conversation/conversation";
import Tool from "../tool/tool";
import ToolSchema, { Parameter } from "../tool/toolschema";


export default class Swarm extends Agent {
    agents!: Map<String, Agent>;
    keyValueStore!: Map<String, String>;
    sharedConversation!: Conversation;


    /** 
     * Construct a tool for an agent in the swarm that allows handing off, when invoked.
     */
    constructHandoffTool(agentName: String) {
        let agentDescriptions = "";
        let validAgentKeys = []
        for (let agent of this.agents ) {
            if (agent[0] == agentName) {
                continue;
            }
            validAgentKeys.push(agent[0])
            agentDescriptions += this.agents.get(agent[0])?.name + ": " + this.agents.get(agent[0])?.description + "\n";
        }


        return new class extends Tool {

            getName() : string{
                return "HandoffTool";
            }

            getDescription() : string {
                let description =  "Hands off your work to a different agent in the swarm. Your fellow agents are:";
                description += agentDescriptions;
                return description;
            }

            getIsTerminalTool(): boolean {
                return true;
            }

            getToolSchema(): ToolSchema {
                return ToolSchema.builder()
                    .addParameter(
                        Parameter.builder()
                        .name("agentName")
                        .description("The name of the agent to hand off to. ")
                        .type("string")
                        .required(true)
                        .build()
                    )
                    .build();
            }

            execute(input: any) : any {
                if (input.agentName != undefined && input.agentName in validAgentKeys) {
                    return input.agentName;
                }
                throw new Error("invalid agent name specified.");
            }
        }
    }

}