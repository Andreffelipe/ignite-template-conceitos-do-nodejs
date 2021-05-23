const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount (request, response, next) {
  const { username } = request.query
  const existe = users.find(user => {
    return user.username === username
  })
  if (!existe) {
    return response.status(404).json()
  }
  next()
}

function checksExistsUser (request, response, next) {
  const { username } = request.body
  const existe = users.find(user => {
    return user.username === username
  })
  if (existe) {
    return response.status(400).json({ error: "user already existes" })
  }
  next()
}

app.post('/users', checksExistsUser, (request, response) => {
  const { name, username } = request.body
  const newUser = {
    id: uuidv4(), name, username, todos: []
  }
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.query
  const user = users.find(user => user.username == username)
  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.query
  const newTodo = {
    ID: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  for (i = 0; i < users.length; i++) {
    if (username === users[i].username) {
      users[i].todos.push(newTodo)
      break
    }
  }
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.query
  const { id } = request.params
  const { title, deadline } = request.body

  const user = users.find(user => user.username == username)
  if (user) {
    let todo = user.todos.find(todo => todo.ID === id)
    if (todo) {
      todo.title = title
      todo.deadline = new Date(deadline)
      return response.status(200).json({
        title: todo.title,
        deadline: todo.deadline,
        done: todo.done
      })
    }
    return response.status(404).json("todo not found")
  }
  return response.status(404).json("user not found")
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.query
  const { id } = request.params

  const user = users.find(user => user.username == username)

  let todo = user.todos.find(todo => todo.ID === id)
  todo.done = true
  return response.status(200).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.query
  const { id } = request.params
  console.log(username)
  const user = users.find(user => user.username == username)

  console.log(user.todos.length != 0)
  if (user.todos.length != 0) {

    let todo = user.todos.find(todo => todo.ID === id)
    user.todos.splice(user.todos.indexOf(todo), 1)
    return response.status(204).send()
  }

  return response.status(404).json({ error: "todos is empty" })
});

module.exports = app;