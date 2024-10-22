export const schema = `#graphql

type User{
    name: String !,
    email: String!,
    todo:[Todo]
}

type loginResponse{
    token: String
}
type Todo {
    title: String!
    status: String!
    user: User
}

type Mutation{

    register(user: newUser):User
    login(user:login):String
    deleteUser(id:ID):String
    updateUser(id: ID!, user: updateUserInput): User
    createTodo(todo: TodoInput!): Todo!
    updateTodo(id: ID!, todo: UpdateTodoInput!): Todo!
    deleteTodo(id: ID!): String!
}

type Query{
    users:[User]
    getUserById(id: ID!): User
    userTodos: [Todo!]!
    getTodoById(id: ID!): Todo
}

input login{
    email: String!,
    password: String!

}

input newUser{
    name: String!,
    email: String!,
    password: String!,
    role: String
}

input updateUserInput {
    name: String,
    password: String,
    
}
input TodoInput {
    title: String!
    status: String!
}
input UpdateTodoInput {
    title: String
    status: String
}


`;
