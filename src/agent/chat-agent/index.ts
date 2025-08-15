import {
  Annotation,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const ChatAgentAnnotation = Annotation.Root({
  messages: MessagesAnnotation.spec["messages"],
});

const graph = new StateGraph(ChatAgentAnnotation)
  .addNode("chat", async (state) => {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
    });

    const response = await model.invoke([
      { role: "system", content: "You are a helpful assistant." },
      ...state.messages,
    ]);

    return {
      messages: response,
    };
  })
  .addEdge(START, "chat");

export const agent = graph.compile();
agent.name = "Chat Agent";
