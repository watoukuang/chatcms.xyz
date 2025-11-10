export interface R<T> {
    success: boolean;
    data?: T | null;
    message?: string | null;
    code?: number | null;
}
