import { TripDetails } from "@/agent/trip-planner/types";
import "./index.css";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useStreamContext,
  type UIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { Message } from "@langchain/langgraph-sdk";
import { DO_NOT_RENDER_ID_PREFIX } from "@/constants";
import { getToolResponse } from "../../utils/get-tool-response";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  distance: string;
  image: string;
  openingHours: string;
  popular: boolean;
}

function ReservedRestaurant({
  restaurant,
  tripDetails,
  reservationDetails,
}: {
  restaurant: Restaurant;
  tripDetails: TripDetails;
  reservationDetails: {
    date: string;
    time: string;
    guests: number;
  };
}) {
  return (
    <div
      className="relative w-[300px] h-[400px] rounded-2xl shadow-md overflow-hidden"
      style={{
        backgroundImage: `url(${restaurant.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-6 text-white bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <p className="text-lg font-medium">Table Reserved</p>

        <div className="flex justify-between items-baseline">
          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span>Cuisine:</span>
          </div>
          <div className="flex justify-between">
            <span>{restaurant.cuisine}</span>
          </div>

          <div className="flex justify-between">
            <span>Rating:</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">{restaurant.rating}</span>
          </div>

          <div className="flex justify-between">
            <span>Date:</span>
          </div>
          <div className="flex justify-between">
            <span>{new Date(reservationDetails.date).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Time:</span>
          </div>
          <div className="flex justify-between">
            <span>{reservationDetails.time}</span>
          </div>

          <div className="flex justify-between">
            <span>Guests:</span>
          </div>
          <div className="flex justify-between">
            <span>{reservationDetails.guests}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantsList({
  tripDetails,
  toolCallId,
}: {
  tripDetails: TripDetails;
  toolCallId: string;
}) {
  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();
  // Placeholder data - ideally would come from props
  const [restaurants] = useState<Restaurant[]>([
    {
      id: "1",
      name: "The Local Grill",
      cuisine: "Steakhouse",
      priceRange: "$$",
      rating: 4.7,
      distance: "0.5 miles from center",
      image:
        "https://github.com/gary918/SampleData/blob/master/steakhouse.jpeg?raw=true",
        //"https://a0.muscache.com/im/pictures/miso/Hosting-813727499556203528/original/12c1b750-4bea-40d9-9a10-66804df0530a.jpeg?im_w=720&im_format=avif",
      openingHours: "5:00 PM - 10:00 PM",
      popular: true,
    },
    {
      id: "2",
      name: "Ocean Breeze",
      cuisine: "Seafood",
      priceRange: "$$$",
      rating: 4.9,
      distance: "0.8 miles from center",
      image:
        "https://github.com/gary918/SampleData/blob/master/seafood.jpeg?raw=true",
        //"https://a0.muscache.com/im/pictures/prohost-api/Hosting-52443635/original/05f084c6-60d0-4945-81ff-d23dfb89c3ca.jpeg?im_w=720&im_format=avif",
      openingHours: "12:00 PM - 11:00 PM",
      popular: true,
    },
    {
      id: "3",
      name: "Pasta Paradise",
      cuisine: "Italian",
      priceRange: "$$",
      rating: 4.5,
      distance: "1.2 miles from center",
      image:
        "https://github.com/gary918/SampleData/blob/master/italian.jpeg?raw=true",
        //"https://a0.muscache.com/im/pictures/miso/Hosting-50545526/original/af14ce0b-481e-41be-88d1-b84758f578e5.jpeg?im_w=720&im_format=avif",
      openingHours: "11:30 AM - 9:30 PM",
      popular: false,
    },
    {
      id: "4",
      name: "Spice Garden",
      cuisine: "Indian",
      priceRange: "$$",
      rating: 4.6,
      distance: "0.7 miles from center",
      image:
        "https://github.com/gary918/SampleData/blob/master/indian.jpeg?raw=true",
        //"https://a0.muscache.com/im/pictures/prohost-api/Hosting-46122096/original/1bd27f94-cf00-4864-8ad9-bc1cd6c5e10d.jpeg?im_w=720&im_format=avif",
      openingHours: "12:00 PM - 10:00 PM",
      popular: false,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [reservationMade, setReservationMade] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
    const [reservationDetails, setReservationDetails] = useState({
    date: new Date(tripDetails.startDate).toISOString().split("T")[0],
    time: "12:00",
    guests: tripDetails.numberOfGuests,
  });

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  useEffect(() => {
    if (typeof window === "undefined" || reservationMade) return;
    const toolResponse = getToolResponse(toolCallId, thread);
    if (toolResponse) {
      setReservationMade(true);
      try {
        const parsedContent: {
          restaurant: Restaurant;
          date: string;
          time: string;
          guests: number;
        } = JSON.parse(toolResponse.content as string);
        const restaurant = restaurants.find(
          (r) => r.id === parsedContent.restaurant.id,
        );
        if (restaurant) {
          setSelectedId(restaurant.id);
          setReservationDetails({
            date: parsedContent.date,
            time: parsedContent.time,
            guests: parsedContent.guests,
          });
        }
      } catch {
        console.error("Failed to parse tool response content.");
      }
    }
  }, [thread, toolCallId, reservationMade, restaurants]);

  function handleReserveTable(restaurant: Restaurant) {
    const reservation = {
      ...reservationDetails,
      restaurant,
    };

    thread.submit(
      {},
      {
        command: {
          update: {
            messages: [
              {
                type: "tool",
                tool_call_id: toolCallId,
                id: `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
                name: "reserve-restaurant",
                content: JSON.stringify(reservation),
              },
              {
                type: "human",
                content: `Reserved a table at ${restaurant.name} for ${
                  reservationDetails.guests
                } guests on ${reservationDetails.date} at ${
                  reservationDetails.time
                }.`,
              },
            ],
          },
          goto: "generalInput",
        },
      },
    );

    setReservationMade(true);
  }

  const filteredRestaurants = filter
    ? restaurants.filter((r) => r.cuisine === filter)
    : restaurants;

  const cuisines = Array.from(new Set(restaurants.map((r) => r.cuisine)));

  if (reservationMade && selectedRestaurant) {
    return (
      <ReservedRestaurant
        tripDetails={tripDetails}
        restaurant={selectedRestaurant}
        reservationDetails={reservationDetails}
      />
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-orange-600 px-4 py-3">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">
            Restaurants in {tripDetails.location}
          </h3>
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="text-white text-sm bg-orange-700 hover:bg-orange-800 px-2 py-1 rounded"
            >
              Back to list
            </button>
          )}
        </div>
        <p className="text-orange-100 text-xs">
          {new Date(tripDetails.startDate).toLocaleDateString()}
        </p>
      </div>

      {!selectedId ? (
        <div className="p-4">
          <div className="mb-3">
            <div className="flex flex-wrap gap-1 mb-1">
              <button
                onClick={() => setFilter(null)}
                className={`px-2 py-1 text-xs rounded-full ${
                  filter === null
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setFilter(cuisine)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    filter === cuisine
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Showing {filteredRestaurants.length} restaurants{" "}
              {filter ? `in ${filter}` : ""}
            </p>
          </div>

          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedId(restaurant.id)}
                className="border rounded-lg p-3 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {restaurant.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <span className="text-sm text-gray-700">
                        {restaurant.priceRange}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="text-xs text-gray-500 ml-1">
                        {restaurant.rating}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {restaurant.distance}
                      </span>
                      {restaurant.popular && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-sm">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          {selectedRestaurant && (
            <div className="space-y-4">
              <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">
                      {selectedRestaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedRestaurant.cuisine}
                    </p>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {selectedRestaurant.priceRange}
                  </span>
                </div>

                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 ml-1">
                    {selectedRestaurant.rating} rating
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <span>{selectedRestaurant.distance}</span>
                  <span>•</span>
                  <span>{selectedRestaurant.openingHours}</span>
                </div>

                <p className="text-sm text-gray-600 pt-2 border-t">
                  {selectedRestaurant.name} offers a wonderful dining experience
                  in {tripDetails.location}. Perfect for a group of{" "}
                  {tripDetails.numberOfGuests} guests. Enjoy authentic{" "}
                  {selectedRestaurant.cuisine} cuisine in a relaxed atmosphere.
                </p>

                {viewMenu && (
                <p className="text-sm text-gray-600 pt-2 border-t">
                  Menu
                </p>
                )}

                <div className="pt-3 flex flex-col space-y-2">
                  {isReserving ? (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={reservationDetails.date}
                        onChange={(e) =>
                          setReservationDetails({
                            ...reservationDetails,
                            date: e.target.value,
                          })
                        }
                        className="w-full border rounded-md p-2"
                      />
                      <input
                        type="time"
                        value={reservationDetails.time}
                        min="11:00"
                        max="21:00"
                        onChange={(e) =>
                          setReservationDetails({
                            ...reservationDetails,
                            time: e.target.value,
                          })
                        }
                        className="w-full border rounded-md p-2"
                      />
                      <input
                        type="number"
                        value={reservationDetails.guests}
                        onChange={(e) =>
                          setReservationDetails({
                            ...reservationDetails,
                            guests: parseInt(e.target.value),
                          })
                        }
                        className="w-full border rounded-md p-2"
                      />
                      <button
                        onClick={() => handleReserveTable(selectedRestaurant)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Reserve
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsReserving(true)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Reserve a Table
                    </button>
                  )}
                  <button
                    onClick={() => setViewMenu(true)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}