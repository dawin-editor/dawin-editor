/**
 * Shares the provided content to Supabase database.
 * @param content The object content to share (e.g., Tiptap JSON).
 * @returns A promise that resolves to the app sharing URL.
 */

const projectUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const shareContent = async (content: any): Promise<string> => {
    try {
        const response = await fetch(`${projectUrl}/rest/v1/shares`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${anonKey}`,
                "apikey": anonKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            body: JSON.stringify({ content: JSON.stringify(content) }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to share: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        const sharedId = data[0].id;

        // Generate the internal app URL
        return `${window.location.origin}/s/${sharedId}`;
    } catch (error) {
        console.error("Error sharing:", error);
        throw error;
    }
};

/**
 * Fetches shared content from Supabase by ID.
 */
export const getSharedContent = async (id: string): Promise<any> => {
    const response = await fetch(`${projectUrl}/rest/v1/shares?id=eq.${id}&select=content`, {
        headers: {
            "Authorization": `Bearer ${anonKey}`,
            "apikey": anonKey,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shared content");
    }

    const data = await response.json();
    if (data.length === 0) {
        throw new Error("Shared content not found");
    }

    try {
        return JSON.parse(data[0].content);
    } catch (e) {
        // Fallback for old markdown content if any
        return data[0].content;
    }
};
