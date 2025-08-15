import { TripPlannerState, TripPlannerUpdate } from "../types";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";
import type ComponentMap from "../../../agent-uis/index";
import { z } from "zod";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getAccommodationsListProps } from "../utils/get-accommodations";
import { v4 as uuidv4 } from "uuid";
import { findToolCall } from "../../find-tool-call";

const listAccommodationsSchema = z
  .object({})
  .describe("A tool to list accommodations for the user");
const listRestaurantsSchema = z
  .object({})
  .describe("A tool to list restaurants for the user");

const ACCOMMODATIONS_TOOLS = [
  {
    name: "list-accommodations",
    description: "A tool to list accommodations for the user",
    schema: listAccommodationsSchema,
  },
  {
    name: "list-restaurants",
    description: "A tool to list restaurants for the user",
    schema: listRestaurantsSchema,
  },
];

export async function callTools(
  state: TripPlannerState,
  config: LangGraphRunnableConfig,
): Promise<TripPlannerUpdate> {
  if (!state.tripDetails) {
    throw new Error("No trip details found");
  }

  const ui = typedUi<typeof ComponentMap>(config);

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
  }).bindTools(ACCOMMODATIONS_TOOLS);

  const response = await llm.invoke([
    {
      role: "system",
      content:
        "You are an AI assistant who helps users book trips. Use the user's most recent message(s) to contextually generate a response.",
    },
    ...state.messages,
  ]);

  const listAccommodationsToolCall = response.tool_calls?.find(
    findToolCall("list-accommodations"),
  );

  if (listAccommodationsToolCall) {
    listAccommodationsToolCall.id = `${uuidv4()}`;
  }

  const listRestaurantsToolCall = response.tool_calls?.find(
    findToolCall("list-restaurants"),
  );

  if (listRestaurantsToolCall) {
    listRestaurantsToolCall.id = `${uuidv4()}`;
  }

  if (!listAccommodationsToolCall && !listRestaurantsToolCall) {
    throw new Error("No tool calls found");
  }

  if (listAccommodationsToolCall) {
    ui.push(
      {
        name: "accommodations-list",
        props: {
          toolCallId: listAccommodationsToolCall.id ?? "",
          ...getAccommodationsListProps(state.tripDetails),
        },
      },
      { message: response },
    );
  }

  if (listRestaurantsToolCall) {
    ui.push(
      {
        name: "restaurants-list",
        props: {
          tripDetails: state.tripDetails,
          toolCallId: listRestaurantsToolCall.id ?? "",
        },
      },
      { message: response, merge: true },
    );
  }

  return {
    messages: [response],
    ui: ui.items,
    timestamp: Date.now(),
  };
}
