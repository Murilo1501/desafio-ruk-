// lib/graphql-client.ts
const GRAPHQL_ENDPOINT = 'https://limitless-journey-63719-354a6b958afb.herokuapp.com/graphql';

export async function graphqlFetch<T = any>(
  query: string,
  variables?: Record<string, any>,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL Error');
  }

  return json.data;
}
