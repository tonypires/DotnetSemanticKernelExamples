export type FileObject = {
    description: string;
    filename: string;
    id: string;
    index: string;
    tags: { [key: string]: string[] };
};

const FILES = [
    {
        index: 'bsg',
        id: 'doc001',
        description: 'TheLastHope.pdf (small)',
        filename: 'TheLastHope.pdf',
        tags: {
            source: ['web'],
            type: ['entertainment'],
            collection: ['bsg', 'battlestar galactica'],
        },
    } as FileObject,
    {
        index: 'finance',
        id: 'doc002',
        description: 'Apple 10-K 2021 (large)',
        filename: 'Apple-2021-10K.pdf',
        tags: {
            source: ['web'],
            type: ['finance'],
            collection: ['apple', '10k'],
        },
    } as FileObject,
] as FileObject[];

async function post(url: string, params?: any) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    return response;
}

async function get(url: string, params: URLSearchParams) {
    const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response;
}

export { post, get, FILES };
