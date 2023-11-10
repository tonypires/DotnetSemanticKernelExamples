import { FileObject, get, post } from './common';

async function chatToPdf(
    file: FileObject,
    question: string
): Promise<Response> {
    const url = `${process.env.apiURL}/pdf/chat`;
    return post(url, {
        Index: file.index,
        Filename: file.filename,
        DocumentId: file.id,
        Description: file.description,
        Tags: file.tags,
        Question: question,
    });
}

async function processImport(file: FileObject) {
    const url = `${process.env.apiURL}/pdf/import`;
    return post(url, {
        Index: file.index,
        Filename: file.filename,
        DocumentId: file.id,
        Description: file.description,
        Tags: file.tags,
    });
}

async function checkImported(
    index: string,
    documentId: string
): Promise<Response> {
    const url = `${process.env.apiURL}/pdf/check`;
    const params = new URLSearchParams({
        index,
        documentId,
    });
    return get(url, params);
}

export { chatToPdf, checkImported, processImport };
