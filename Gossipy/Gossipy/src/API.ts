/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TextToSpeechInput = {
  convertTextToSpeech: TextToSpeechConvertTextToSpeechInput,
};

export type TextToSpeechConvertTextToSpeechInput = {
  voiceID: string,
  text: string,
};

export type TextToSpeechQueryVariables = {
  input: TextToSpeechInput,
};

export type TextToSpeechQuery = {
  textToSpeech?: string | null,
};
