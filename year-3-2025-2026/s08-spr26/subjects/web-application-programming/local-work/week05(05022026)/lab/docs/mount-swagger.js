import swaggerUI from "swagger-ui-express";
import {buildOpenApiSpec} from "./swagger.js";

export function mountSwagger(app){
    // OpenAPI JSON 
    app.get("/openapi.json", (req, res) => {
        res.json(buildOpenApiSpec());
    });

    //SwaggerUI 
    app.use("/docs", 
        swaggerUI.serve, 
        swaggerUI.setup(buildOpenApiSpec(), {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true,
            }
        })
    );
}