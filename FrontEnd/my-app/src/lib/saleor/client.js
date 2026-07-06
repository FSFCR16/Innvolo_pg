const URL = "http://localhost:8000/graphql/"

export async function saleorFetch(query, variables = {}){

    const response = await fetch(URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    })
    const data = await response.json()
    return data
}