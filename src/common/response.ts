export interface ResponseGeneric<T> {
    data: T;
    isSucces: boolean;
    message: string;
}
