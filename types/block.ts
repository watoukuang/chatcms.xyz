export type Tx = {
  fm: string
  to: string
  amt: string
}

export type MiniBlock = {
  height: number
  nonce: number
  data: string
  previous: string
  timestamp: number
  hash: string
  award?: string
  miner?: string
  txs?: Tx[]
}

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

export type Step = {
  title: string
  status: StepStatus
}

export type ComputerBoard = {
  title: string
  steps: Step[]
}
