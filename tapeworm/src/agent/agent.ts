import type { Model } from "../model/model";
import type Tool from "../tool/tool";


export default class Agent {
    name! : string;
    system_prompt? : string;
    tools? : Tool[];
    model! : Model;


    invoke(query : string) {
        
    }






}