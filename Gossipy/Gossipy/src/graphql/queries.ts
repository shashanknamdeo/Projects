/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const textToSpeech = /* GraphQL */ `query TextToSpeech($input: TextToSpeechInput!) {
  textToSpeech(input: $input)
}
` as GeneratedQuery<
  APITypes.TextToSpeechQueryVariables,
  APITypes.TextToSpeechQuery
>;
