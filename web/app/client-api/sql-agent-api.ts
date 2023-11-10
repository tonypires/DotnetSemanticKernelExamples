import { get, post } from './common';

async function connect(connection: string): Promise<Response> {
    const url = `${process.env.apiURL}/connect`;
    return post(url, connection);
}

async function getSchema(
    connection: string,
    databaseName: string
): Promise<Response> {
    const url = `${process.env.apiURL}/getSchema`;
    const params = new URLSearchParams({
        serverName: connection,
        databaseName: databaseName,
    });

    return get(url, params);
}

async function generateSchema(
    connection: string,
    databaseName: string,
    prompt: string
): Promise<Response> {
    const url = `${process.env.apiURL}/generateSQL`;
    return post(url, {
        ServerName: connection,
        DatabaseName: databaseName,
        Prompt: prompt,
    });
}

async function learnSchema(
    connection: string,
    databaseName: string
): Promise<Response> {
    const url = `${process.env.apiURL}/learn`;
    return post(url, {
        ServerName: connection,
        DatabaseName: databaseName,
    });
}

export { connect, getSchema, generateSchema, learnSchema };
