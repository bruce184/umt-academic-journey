
// Import Apollo Server and standalone server utilities
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';


// Import GraphQL schema and in-memory database
import { typeDefs} from './schema.js';
import { db } from './_db.js';


// Define resolvers: how to fetch or change data for each type
const resolvers = {
    // Query: read data
    Query: {
        games() { return db.games; }, // all games
        reviews() { return db.reviews; }, // all reviews
        authors() { return db.authors; }, // all authors
        review(_, args) { return db.reviews.find(r => r.id === args.id); }, // single review by id
        author(_, args) { return db.authors.find(a => a.id === args.id); }, // single author by id
        game(_, args) { return db.games.find(g => g.id === args.id); } // single game by id
    },
    // Nested resolvers for relationships
    Game: {
        reviews(parent) { return db.reviews.filter(r => r.game_id === parent.id); } // reviews for a game
    },
    Author: {
        reviews(parent) { return db.reviews.filter(r => r.author_id === parent.id); } // reviews by an author
    },
    Review: {
        author(parent) { return db.authors.find(a => a.id === parent.author_id); }, // author of a review
        game(parent) { return db.games.find(g => g.id === parent.game_id); } // game of a review
    },
    // Mutation: change data
    Mutation: {
        deleteGame(_, args) {
            // Return all games except the one with matching id (does not update db.games)
            return db.games.filter(game => game.id !== args.id);
        },
        addGame(_, args) {
            // Add a new game with random id
            let game = { ...args.game, id: Math.floor(Math.random() * 10000).toString() };
            db.games.push(game);
            return game;
        },
        updateGame(_, args) {
            // Update a game by id with new fields
            db.games = db.games.map(game => game.id === args.id ? { ...game, ...args.edits } : game);
            return db.games.find(game => game.id === args.id);
        }
    }
}



// Create and start Apollo Server
const server = new ApolloServer({ 
    typeDefs, // schema
    resolvers, // logic
    csrfPrevention: false // disable CSRF for dev
});

// Start server on port 4000
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`); // Print server URL
