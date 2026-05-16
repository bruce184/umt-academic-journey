import swaggerJsdoc from "swagger-jsdoc";
import {components} from "./components/index.js";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "Todo API Documentation"
        },
        servers: [{url: process.env.BASE_URL}],
        tags: [
            {name: "Auth", description: "Authentication endpoints"},
            {name: "Todos", description: "Todo endpoints"}
        ], 
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            ...components
        }
    },

    apis: [
        "./routers/user-r.js",
        "./routers/todo-r.js"
    ],
};

export function buildOpenApiSpec(){
    return swaggerJsdoc(options);
}