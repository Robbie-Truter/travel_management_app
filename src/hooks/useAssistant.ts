import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query"
import { useNotification } from "@/hooks/useNotification";

type AssistantRequest = {
    prompt: string;
    tripIds: number[];
}

type AssistantResponse = {
    response: string;
};

export const useAssistant = () => {
    const { showToast } = useNotification();

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async ({ prompt, tripIds }: AssistantRequest) => {
            const { data, error } = await supabase.functions.invoke<AssistantResponse>("assistant", {
                body: {
                    message: prompt,
                    tripIds: (tripIds?.length === 0 || !tripIds) ? 28 : tripIds
                },
            });

            if (error) throw error;

            return data;
        },
        onError: (error: Error) => {
            showToast(error.message || "Failed to update flight", "error");
        },
    })
    return { isPending, promptAssistant: mutateAsync, }

}