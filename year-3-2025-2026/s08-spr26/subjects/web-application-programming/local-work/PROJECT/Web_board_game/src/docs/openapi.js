const getBackendPublicUrl = () =>
    (process.env.BACKEND_PUBLIC_URL || 'http://localhost:3000').replace(/\/+$/, '');

const buildOpenApiDocument = () => ({
    openapi: '3.0.3',
    info: {
        title: 'Web Board Game API',
        version: '1.0.0',
        description: 'Protected admin documentation for the course delivery build.',
    },
    servers: [
        {
            url: getBackendPublicUrl(),
            description: 'Configured backend public origin',
        },
    ],
    security: [
        { bearerAuth: [] },
        { apiKeyAuth: [] },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            apiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key',
            },
        },
    },
    paths: {
        '/api/admin/dashboard': {
            get: {
                summary: 'Read dashboard summary cards',
                tags: ['Admin'],
            },
        },
        '/api/admin/users': {
            get: {
                summary: 'List users with pagination and filters',
                tags: ['Admin'],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'role', in: 'query', schema: { type: 'string' } },
                    { name: 'active', in: 'query', schema: { type: 'boolean' } },
                ],
            },
        },
        '/api/admin/users/{id}': {
            patch: {
                summary: 'Promote or enable/disable a user',
                tags: ['Admin'],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            },
        },
        '/api/admin/games': {
            get: {
                summary: 'List game configuration and performance',
                tags: ['Admin'],
            },
        },
        '/api/admin/games/{id}': {
            patch: {
                summary: 'Update game availability or default settings',
                tags: ['Admin'],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            },
        },
        '/api/admin/stats': {
            get: {
                summary: 'Read aggregate statistics for admin charts',
                tags: ['Admin'],
            },
        },
        '/api/games': {
            get: {
                summary: 'List available games',
                tags: ['Games'],
            },
        },
        '/api/games/{id}/save': {
            get: {
                summary: 'Load saved progress for the active user',
                tags: ['Games'],
            },
            post: {
                summary: 'Save game progress for the active user',
                tags: ['Games'],
            },
            delete: {
                summary: 'Delete saved game progress for the active user',
                tags: ['Games'],
            },
        },
        '/api/games/{id}/session': {
            post: {
                summary: 'Submit a finished game session',
                tags: ['Games'],
            },
        },
        '/api/rankings': {
            get: {
                summary: 'Read rankings by game and scope',
                tags: ['Rankings'],
            },
        },
    },
});

const renderApiDocsHtml = () => {
    const spec = buildOpenApiDocument();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Web Board Game API Docs</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; }
    header { padding: 24px; background: #111827; border-bottom: 1px solid #334155; }
    main { padding: 24px; display: grid; gap: 20px; }
    section { background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 20px; }
    h1, h2, h3 { margin: 0 0 12px; }
    code { background: #1e293b; padding: 2px 6px; border-radius: 6px; }
    pre { white-space: pre-wrap; word-break: break-word; background: #020617; padding: 16px; border-radius: 12px; overflow: auto; }
    .path-grid { display: grid; gap: 12px; }
    .path-card { border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; }
    .tag { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #1d4ed8; font-size: 12px; margin-right: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>${spec.info.title}</h1>
    <p>${spec.info.description}</p>
  </header>
  <main>
    <section>
      <h2>Security</h2>
      <p>All admin docs require a valid <code>Authorization: Bearer &lt;jwt&gt;</code> header and a matching <code>x-api-key</code>.</p>
    </section>
    <section>
      <h2>Endpoints</h2>
      <div class="path-grid">
        ${Object.entries(spec.paths)
            .map(([path, methods]) => `
              <div class="path-card">
                <h3>${path}</h3>
                ${Object.entries(methods)
                    .map(
                        ([method, details]) =>
                            `<p><span class="tag">${method.toUpperCase()}</span>${details.summary}</p>`
                    )
                    .join('')}
              </div>
            `)
            .join('')}
      </div>
    </section>
    <section>
      <h2>OpenAPI JSON</h2>
      <pre>${JSON.stringify(spec, null, 2)}</pre>
    </section>
  </main>
</body>
</html>`;
};

module.exports = {
    buildOpenApiDocument,
    renderApiDocsHtml,
};
