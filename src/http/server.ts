import Fastify from 'fastify'
import { createBook } from './routes/books'

const app = Fastify()

app.register(createBook)

app.listen({ port: 8080 }).then(() => {
    console.log('Server is running!')
})