import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema.js";
import { resolvers } from "./resolvers.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import util from "util";
dotenv.config();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: (err) => {
    return { message: err.message };
  },
});

mongoose
  .connect("mongodb://localhost:27017/graphql-course")
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.log("db connection error: " + err);
  });

startStandaloneServer(server, {
  listen: { port: 3000 },
  context: async ({ req }) => {
    const { authorization } = req.headers;
    if (!authorization) return { user: "un" };
    try {
      const decoded = await util.promisify(jwt.verify)(
        authorization,
        process.env.SECRET
      );
      return { user: decoded };
    } catch (err) {
      return { user: null };
    }
  },
})
  .then(() => {
    console.log("server started");
  })
  .catch((err) => {
    console.log("server error: " + err);
  });
