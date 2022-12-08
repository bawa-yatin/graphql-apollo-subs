const express = require("express");
const { createServer } = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers.js");

const MONGODB =
  "mongodb+srv://bawa_yatin:Maverick9670@subscriptionserver.gvlyiyk.mongodb.net/?retryWrites=true&w=majority";

(async function () {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  mongoose.connect(MONGODB, { useNewUrlParser: true });
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log("Server running on " + PORT);
  });
})();
