import { UserSchema } from "./schemas/user-schema.js";
import { TodoSchemas } from "./schemas/todo-schema.js";
import { ErrorSchema } from "./schemas/error-schema.js";

export const components = {
    schemas: {
        ...UserSchema,
        ...TodoSchemas,
        ...ErrorSchema
    }
};