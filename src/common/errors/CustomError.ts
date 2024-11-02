export class CustomError extends Error {
    public status: number;

    private constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }

    static NotFound(message: string) {
        return new CustomError(message, 404);
    }

    static BadRequest(message: string) {
        return new CustomError(message, 400);
    }

    static InternalServerError(message: string) {
        return new CustomError(message, 500);
    }

}
