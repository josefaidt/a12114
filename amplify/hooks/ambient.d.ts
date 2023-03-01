type HookData = {
  amplify: {
    environment: {
      envName: string
      projectPath: string
      defaultEditor: string
    }
    command: string
    subCommand: string
    argv: string[]
  }
}

type HookError = {
  message: string
  stack: string
}

type HookEvent = {
  data: HookData
  error: HookError
}

type HookStage = 'pre' | 'post'
