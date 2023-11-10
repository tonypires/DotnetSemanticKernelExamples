import { FileObject, post } from './common';

async function getSummary(
    action: 'SUMMARIZE' | 'KEYPOINTS' | 'ELI5' | 'TOPICS',
    file: FileObject
) {
    const url = `${process.env.apiURL}/summarize`;
    return post(url, {
        Action: action,
        Index: file.index,
        Filename: file.filename,
        DocumentId: file.id,
        Description: file.description,
        Tags: file.tags,
    });
}

export { getSummary };
