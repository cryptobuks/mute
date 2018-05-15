import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { LogsStrategy } from './LogsStrategy'
import { RabbitMq } from './RabbitMq'
import { SendAllLogsStrategy } from './SendAllLogsStrategy'
import { SendIfActivateLogsStrategy } from './SendIfActivateLogsStrategy'

@Injectable()
export class LogsService {
  private dbLocal: Database
  private dbDistante: RabbitMq

  private docKey: string
  private displayLogs: boolean
  private strategy: LogsStrategy
  private shareLogs: boolean

  constructor(docKey: string, shareLogs: boolean = false, logsStrategy: string = '') {
    this.docKey = docKey
    this.shareLogs = shareLogs
    this.setLogsStrategy(logsStrategy)
  }

  log(obj: object) {
    if (this.displayLogs) {
      console.log('[LOGS]', obj)
    }
    this.strategy.sendLogs(obj, this.shareLogs)
  }

  getLogs(): Promise<object[]> {
    return this.strategy.getLocalLogs()
  }

  public setDisplayLogs(display: boolean) {
    this.displayLogs = display
  }

  setShareLogs(share: boolean, state: Map<number, number>): void {
    if (this.shareLogs !== share) {
      this.shareLogs = share
      this.strategy.setShareLogs(share, state)
    }
  }

  get isSharingLogs(): boolean {
    return this.shareLogs
  }

  setLogsStrategy(logsStrategy: string): void {
    switch (logsStrategy) {
      case 'sendall':
        if (!(this.strategy instanceof SendAllLogsStrategy)) {
          this.strategy = new SendAllLogsStrategy(this.docKey)
        }
        break
      case 'sendifactivate':
        if (!(this.strategy instanceof SendIfActivateLogsStrategy)) {
          this.strategy = new SendIfActivateLogsStrategy(this.docKey)
        }
        break
      default:
        console.error('No Strategy Found !!')
        break
    }
  }
}
