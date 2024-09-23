export type Transcript = {
  name: string,
  id: number,
  index: number,
  timestamp: string,
  final: boolean,
  text: string,
  translation: string,
  sentenceSentimentScore: number,
  wordCount: number,
  analysis: Analysis
}

export type KeyWord = {
  keyword: string;
  text: string;
}

export type Analysis = {
  sentimentScore: number,
  sadnessScore: number,
  joyScore: number,
  fearScore: number,
  disgustScore: number,
  angerScore: number
}