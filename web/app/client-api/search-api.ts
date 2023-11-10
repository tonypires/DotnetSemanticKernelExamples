import { FileObject, post } from './common';

async function performSearch(searchQuery: string, file: FileObject) {
    const url = `${process.env.apiURL}/search`;
    return post(url, {
        Index: file.index,
        Filename: file.filename,
        DocumentId: file.id,
        Description: file.description,
        Tags: file.tags,
        SearchQuery: searchQuery,
    });
}

export { performSearch };
