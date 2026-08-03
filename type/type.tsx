export type ProjectType = {
  id: number,
  projectId: string,
  device: string,
  userInput: string,
  createdOn: string,
  name?: string,
  projectName?: string,
  theme?: string,
}

export type ScreenConfig = {
  id: number,
  screenId: string,
  screenName: string,
  purpose: string,
  screenDescription: string,
  code?: string
}