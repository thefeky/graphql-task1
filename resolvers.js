import { Query } from "mongoose";
import { userModel } from "./models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { todoModel } from "./models/todo.js";

export const resolvers = {
  Query: {
    async users() {
      const users = await userModel.find({});
      return users;
    },
    async getUserById(_, { id }) {
      try {
        const user = await userModel.findById(id);
        if (!user) {
          return null;
        }
        return user;
      } catch (error) {
        console.error("Error finding user:", error);
        return null;
      }
    },
    async userTodos(_, __, context) {
      if (!context.user) {
        throw new Error("You must login to view your todos!");
      }

      if (context.user.role === "admin") {
        return await todoModel.find({});
      } else {
        const todos = await todoModel.find({ userId: context.user.id });
        return todos;
      }
    },
    async getTodoById(_, { id }) {
      const todo = await todoModel.findById(id);
      if (!todo) {
        throw new Error("Todo not found!");
      }
      return todo;
    },
  },
  Mutation: {
    async register(_, args) {
      const user = await userModel.create(args.user);
      return user;
    },
    async login(_, { user }) {
      if (!user.email || !user.password) {
        return "You must provide email and password!";
      }
      const findUser = await userModel.findOne({ email: user.email });
      if (!findUser) {
        return "Invalid email or password!";
      }

      const isValid = await bcrypt.compare(user.password, findUser.password);
      if (!isValid) {
        console.log(user.password, findUser.password);
        return "Invalid email or password!";
      }
      const token = jwt.sign(
        { id: findUser._id, role: findUser.role },
        process.env.SECRET,
        { expiresIn: "1d" }
      );
      return token;
    },
    async deleteUser(_, { id }, context) {
      if (context.user && context.user.role == "admin") {
        await userModel.findByIdAndDelete(id);
        return "User deleted successfully!";
      } else {
        console.log(context.user, "delete");
        return "You are not authorized to delete this user!";
      }
    },

    async updateUser(_, { id, user }, context) {
      if (!context.user) {
        return null;
      }

      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return null;
      }

      if (context.user.role !== "admin" && context.user.id !== id) {
        return null;
      }

      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      const updatedUser = await userModel.findByIdAndUpdate(id, user, {
        new: true,
      });

      return updatedUser;
    },

    async createTodo(_, { todo }, context) {
      if (!context.user) {
        throw new Error("You must login to create a todo!");
      }

      const newTodo = new todoModel({
        ...todo,
        userId: context.user.id,
      });

      await newTodo.save();
      return newTodo;
    },
    async updateTodo(_, { id, todo }, context) {
      if (!context.user) {
        throw new Error("You must login to update a todo!");
      }

      const existingTodo = await todoModel.findById(id);
      if (!existingTodo) {
        throw new Error("Todo not found!");
      }
      if (existingTodo.userId.toString() !== context.user.id) {
        throw new Error("You are not authorized to update this todo!");
      }
      const updatedTodo = await todoModel.findByIdAndUpdate(
        id,
        { ...todo },
        { new: true }
      );

      return updatedTodo;
    },
    async deleteTodo(_, { id }, context) {
      if (!context.user) {
        throw new Error("You must login to delete a todo!");
      }
      const existingTodo = await todoModel.findById(id);
      if (!existingTodo) {
        throw new Error("Todo not found!");
      }

      if (existingTodo.userId.toString() !== context.user.id) {
        throw new Error("You are not authorized to delete this todo!");
      }

      await todoModel.findByIdAndDelete(id);

      return "Todo deleted successfully!";
    },
  },
  Todo: {
    user: async (parent, args, context) => {
      const user = await userModel.findById(parent.userId);
      return user;
    },
  },
  User: {
    todo: async (parent, args, context) => {
      const todos = await todoModel.find({ userId: parent.id });
      return todos;
    },
  },
};
