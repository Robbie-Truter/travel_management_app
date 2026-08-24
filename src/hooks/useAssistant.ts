import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query"

type AssistantRequest = {
    prompt: string;
    tripIds: number[];
}

type AssistantResponse = {
    response: string;
};

export const useAssistant = () => {
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
    })
    return { isPending, promptAssistant: mutateAsync, }

}