import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./src/schema.graphql",
  generates: {
    "./src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-document-nodes",
      ],
      config: {
        useIndexSignature: true,
        contextType: "../context#Context",
        mappers: {
          User: "./models#UserModel",
        },
        // Add scalar types for custom scalars
        scalars: {
          DateTime: "Date",
          JSON: "{ [key: string]: any }",
        },
      },
    },
  },
};

export default config;
