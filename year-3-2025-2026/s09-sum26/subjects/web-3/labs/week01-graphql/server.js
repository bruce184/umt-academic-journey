import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { getStudentFromAuthHeader } from "./auth.js";
import { createLoaders } from "./loaders.js";

import { db } from "./db/db.js";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

const app = express();

async function createContext({ req }){
  const token = req.headers.authorization || null;

  return {
    db, 
    loaders: createLoaders(db),
    token, 
    currentUser: await getStudentFromAuthHeader(token, db),
  };
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(apolloServer, {
    context: createContext,
  }),
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`GraphQL server is running at http://localhost:${PORT}/graphql`);
});
