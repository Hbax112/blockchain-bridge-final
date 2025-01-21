const BACKEND_URL = "http://localhost:3001"; // Actualizează URL-ul dacă backend-ul rulează pe alt port

export const burnTokens = async (amount: number) => {
    const response = await fetch(`${BACKEND_URL}/burn`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Failed to burn tokens");
    return await response.json();
};

export const mintTokens = async (user: string, amount: number) => {
    const response = await fetch(`${BACKEND_URL}/mint`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, amount }),
    });
    if (!response.ok) throw new Error("Failed to mint tokens");
    return await response.json();
};
