import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query"
import { useNotification } from "@/hooks/useNotification";

type AssistantRequest = {
    prompt: string;
    tripIds: number[];
}

export const useAssistant = () => {
    const { showToast } = useNotification();

    const { data, error, isPending, mutateAsync } = useMutation({
        mutationFn: async ({prompt, tripIds}: AssistantRequest) => {
            const { data, error } = await supabase.functions.invoke("assistant", {
                body: {
                    message: prompt,
                    tripIds: tripIds ?? 28 //28 for testing,
                },
            });

            if (error) throw error;

            return data;
        },
        onError: (error: Error) => {
            showToast(error.message || "Failed to update flight", "error");
        },
    })
    return { data, error, isPending, promptAssistant: mutateAsync, }

}