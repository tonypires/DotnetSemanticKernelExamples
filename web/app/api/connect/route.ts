export async function GET(request: Request) {
    const res = await fetch('https://data.mongodb-api.com/...', {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();

    return Response.json({ data });
}
