import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import type { Destination } from "@/db/types";

export function useDestinations(tripId: number) {
  const destinations = useLiveQuery(
    () => db.destinations.where("tripId").equals(tripId).toArray(),
    [tripId],
  );

  const loading = destinations === undefined;

  const addDestination = async (destination: Omit<Destination, "id" | "createdAt">) => {
    return db.destinations.add({
      ...destination,
      createdAt: new Date().toISOString(),
    });
  };

  const updateDestination = async (id: number, changes: Partial<Destination>) => {
    return db.destinations.update(id, changes);
  };

  const deleteDestination = async (id: number) => {
    return db.destinations.delete(id);
  };

  return {
    destinations: destinations ?? [],
    loading,
    addDestination,
    updateDestination,
    deleteDestination,
  };
}
