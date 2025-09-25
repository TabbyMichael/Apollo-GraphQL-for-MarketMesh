import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      'http://localhost:4000/graphql': {
        headers: {
          // Add any required headers for authentication
        },
      },
    },
  ],
  documents: ['src/**/*.graphql', 'src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        withRefetchFn: true,
        skipTypename: false,
        preResolveTypes: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          JSON: '{ [key: string]: any }',
        },
        namingConvention: {
          typeNames: 'pascal-case#pascalCase',
          enumValues: 'upper-case#upperCase',
        },
      },
    },
  },
};

export default config;
