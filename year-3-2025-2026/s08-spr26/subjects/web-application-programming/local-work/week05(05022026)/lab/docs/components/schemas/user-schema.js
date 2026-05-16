export const UserSchema = {
    User: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' }
        },
        example: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            created_at: '2024-01-29T12:00:00.000Z'
        }
    }
}