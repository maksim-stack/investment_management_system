export function getUserIdFromToken(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub;
    } catch {
        return null;
    }
}