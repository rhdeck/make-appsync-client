import React, { FC } from "react";
import { createAuthLink, AUTH_TYPE, AuthOptions } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloProvider } from "@apollo/react-common";
import { ApolloLink } from "apollo-link";
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
  IntrospectionResultData,
} from "apollo-cache-inmemory";
import Auth from "@aws-amplify/auth";

const makeClient = ({
  fragmentTypes: introspectionQueryResultData,
  graphqlEndpoint,
  region,
}: {
  fragmentTypes: IntrospectionResultData;
  graphqlEndpoint: string;
  region: string;
}) => {
  const auth: AuthOptions = {
    type: "AMAZON_COGNITO_USER_POOLS",
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  };
  const config = {
    url: graphqlEndpoint,
    region,
    auth,
  };
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData,
  });
  const httpLink = createHttpLink({ uri: graphqlEndpoint });
  const client = new ApolloClient({
    link: ApolloLink.from([
      createAuthLink(config),
      httpLink,
      // createSubscriptionHandshakeLink(config, httpLink),
      // ,
    ]),
    cache: new InMemoryCache({ fragmentMatcher }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
  const Provider: FC = ({ children }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return { Provider, client };
};
export default makeClient;
