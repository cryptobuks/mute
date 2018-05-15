import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { ILogsStrategy } from './LogsStrategy'
import { RabbitMq } from './RabbitMq'
import { SendAllLogsStrategy } from './SendAllLogsStrategy'
import { SendIfActivateLogsStrategy } from './SendIfActivateLogsStrategy'

@Injectable()
export class LogsService {
  private dbLocal: Database
  private dbDistante: RabbitMq

  private docKey: string
  private displayLogs: boolean
  private shareLogs: boolean
  private strategy: ILogsStrategy

  constructor(docKey: string, shareLogs: boolean = false, logsStrategy: string = '') {
    this.docKey = docKey
    this.shareLogs = shareLogs

    // Initialize the local DB
    this.dbLocal = new IndexdbDatabase()
    this.dbLocal.init('muteLogs-' + this.docKey)

    // Initialize the distant DB
    this.dbDistante = new RabbitMq(this.docKey)

    this.setLogsStrategy(logsStrategy)
  }

  log(obj: object) {
    if (this.displayLogs) {
      console.log('[LOGS]', obj)
    }

    this.dbLocal.store(obj)

    this.strategy.sendLogs(obj, this.shareLogs)
    /*if (this.shareLogs) {
      this.dbDistante.send(obj)
    }*/
  }

  getLogs(): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.dbLocal
        .get()
        .then((obj: object) => {
          resolve(obj as object[])
        })
        .catch((err) => reject(err))
    })
  }

  public setDisplayLogs(display: boolean) {
    this.displayLogs = display
  }

  setShareLogs(share: boolean): void {
    this.shareLogs = share
    if (this.shareLogs && this.dbDistante === null) {
      this.dbDistante = new RabbitMq(this.docKey)
    }
  }

  get isSharingLogs(): boolean {
    return this.shareLogs
  }

  setLogsStrategy(logsStrategy: string): void {
    switch (logsStrategy) {
      case 'sendall':
        if (!(this.strategy instanceof SendAllLogsStrategy)) {
          this.strategy = new SendAllLogsStrategy(this.dbDistante)
        }
        break
      case 'sendifactivate':
        if (!(this.strategy instanceof SendIfActivateLogsStrategy)) {
          this.strategy = new SendIfActivateLogsStrategy(this.dbDistante)
        }
        break
      default:
        console.error('No Strategy Found !!')
        break
    }
  }
}
