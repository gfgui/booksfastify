import { FastifyInstance } from "fastify";
import { z } from "zod"
import { prisma } from "../lib/prisma";

export function createBook(app: FastifyInstance) {
    app.post('/books', async (request, reply) => {

        const createBookBody = z.object({
            title: z.string(),
            author: z.string(),
            description: z.string()
        })

        const { title, author, description } = createBookBody.parse(request.body)

        const book = await prisma.book.create({
            data: {
                title,
                author,
                description
            }
        })

        return reply.status(201).send({ bookID: book.id })
    })

    // GET: Fetch all books
    app.get('/books', async (request, reply) => {
        // Fetch all books from the database
        const books = await prisma.book.findMany();

        // Respond with the list of books
        return reply.send(books);
    });

    // GET: Fetch a single book by ID
    app.get('/books/:id', async (request, reply) => {
        // Validate the book ID parameter
        const params = z.object({
            id: z.string().uuid(), // Validate UUID format
        });

        const { id } = params.parse(request.params);

        // Fetch a single book by its ID
        const book = await prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            return reply.status(404).send({ message: 'Book not found' });
        }

        // Respond with the book data
        return reply.send(book);
    });

    // PUT: Update a book by ID
    app.put('/books/:id', async (request, reply) => {
        // Validate the book ID parameter
        const params = z.object({
            id: z.string().uuid(), // Validate UUID format
        });
        const { id } = params.parse(request.params);

        // Validate the body content for the book update
        const updateBookBody = z.object({
            title: z.string().optional(),
            author: z.string().optional(),
            description: z.string().optional(),
            isFavorite: z.boolean().optional(),
            isReading: z.boolean().optional(),
            isFinished: z.boolean().optional(),
        });

        const { title, author, description, isFavorite, isReading, isFinished } =
            updateBookBody.parse(request.body);

        // Find the book to update
        const existingBook = await prisma.book.findUnique({
            where: { id },
        });

        if (!existingBook) {
            return reply.status(404).send({ message: 'Book not found' });
        }

        // Update the book in the database
        const updatedBook = await prisma.book.update({
            where: { id },
            data: {
                title: title ?? existingBook.title, // If no new title, keep old one
                author: author ?? existingBook.author,
                description: description ?? existingBook.description,
                isFavorite: isFavorite ?? existingBook.isFavorite,
                isReading: isReading ?? existingBook.isReading,
                isFinished: isFinished ?? existingBook.isFinished,
            },
        });

        // Respond with the updated book
        return reply.send(updatedBook);
    });
}