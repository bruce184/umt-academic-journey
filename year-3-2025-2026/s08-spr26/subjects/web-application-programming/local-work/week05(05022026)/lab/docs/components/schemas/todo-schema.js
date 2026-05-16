export const TodoSchemas = {
    Todo: {
        type: 'object',
        required: ['id', 'user_id', 'title', 'status', 'created_at', 'updated_at'],
        properties: {
            id: { type: 'integer', format: 'int64' },
            user_id: { type: 'integer', format: 'int32' },
            title: { type: 'string', minLength: 1},
            description: { type: 'string', nullable: true},
            status: { type: 'string', enum: ['PENDING', 'DONE']},
            due_date: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time'},
            updated_at: { type: 'string', format: 'date-time'},
        },

        example: {
            id: 1,
            user_id: 1,
            title: 'Buy milk',
            description: 'Buy milk from the store',
            status: 'PENDING',
            due_date: '2022-12-31T23:59:59.000Z',
            created_at: '2022-12-31T23:59:59.000Z',
            updated_at: '2022-12-31T23:59:59.000Z',
        },
    },
}