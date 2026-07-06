export const GET_PRODUCTO = `
  query GetProducto($slug: ID!, $channel: String!) {
    product(id: $slug, channel: $channel) {
      id
      name
      slug
      description
      thumbnail {
        url
      }
      images {
        url
      }
      category {
        name
        slug
        parent {
          name
          slug
        }
      }
      attributes {
        attribute {
          name
          slug
        }
        values {
          name
        }
      }
      variants {
        id
        sku
        attributes {
          attribute {
            name
            slug
          }
          values {
            name
          }
        }
      }
    }
  }
`
export const GET_PRODUCTOS_RELACIONADOS = `
  query GetProductosRelacionados($categoryId: ID!, $channel: String!) {
    products(
      first: 4
      channel: $channel
      filter: { categories: [$categoryId] }
    ) {
      edges {
        node {
          id
          name
          slug
          thumbnail {
            url
          }
          category {
            slug
            parent {
              slug
            }
          }
        }
      }
    }
  }
`