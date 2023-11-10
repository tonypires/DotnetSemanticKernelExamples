import { post } from './common';

async function getSentiment(input: string): Promise<Response> {
    const url = `${process.env.apiURL}/sentiment`;
    return post(url, input);
}

export { getSentiment };
