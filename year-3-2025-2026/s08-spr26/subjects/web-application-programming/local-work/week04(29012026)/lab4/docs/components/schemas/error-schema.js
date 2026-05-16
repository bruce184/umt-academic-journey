export const ErrorSchema = {
    ErrorResponse: {
        type: 'object',
        properties: {
            data: { 
                type: 'object', 
                nullable: true,
                example: null
            },
            meta: {
                type: 'object',
                properties: {
                    timestamp: { type: 'string', format: 'date-time' }
                }
            },
            error: {
                type: 'object',
                properties: {
                    code: { type: 'integer' },
                    message: { type: 'string' },
                    details: { 
                        type: 'object', 
                        nullable: true 
                    }
                }
            }
        },
        example: {
            data: null,
            meta: {
                timestamp: '2024-01-29T12:00:00.000Z'
            },
            error: {
                code: 404,
                message: 'Not Found',
                details: null
            }
        }
    }
}