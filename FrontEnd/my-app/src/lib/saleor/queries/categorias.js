export const GET_CATEGORIAS = `
  query GetCategorias {
    categories(first: 20, level: 0) {
      edges {
        node {
          id
          name
          slug
          backgroundImage {
            url
          }
          children(first: 20) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`

export const GET_CATEGORIA = `
  query GetCategoria($slug: String!) {
    category(slug: $slug) {
      id
      name
      slug
      backgroundImage {
        url
      }
      children(first: 20) {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
      products(first: 50, channel: "default-channel") {
        edges {
          node {
            id
            name
            slug
            description
            category {
              name
              slug
            }
            thumbnail {
              url
            }
          }
        }
      }
    }
  }
`