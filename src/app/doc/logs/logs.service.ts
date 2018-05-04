import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { RabbitMq } from './RabbitMq'

@Injectable()
export class LogsService {
  private dbLocal: Database
  private dbDistante: RabbitMq

  private docKey: string
  private displayLogs: boolean
  private shareLogs: boolean

  constructor(docKey: string, shareLogs: boolean = false) {
    this.docKey = docKey
    this.shareLogs = shareLogs

    // Initialize the local DB
    this.dbLocal = new IndexdbDatabase()
    this.dbLocal.init('muteLogs-' + this.docKey)

    // Initialize the distant DB
    if (this.shareLogs) {
      this.dbDistante = new RabbitMq(this.docKey)
    }
  }

  log(obj: object) {
    if (this.displayLogs) {
      console.log('[LOGS]', obj)
    }

    this.dbLocal.store(obj)

    if (this.shareLogs) {
      this.dbDistante.send(obj)
    }
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

  toogleLogs(): void {
    this.shareLogs = !this.shareLogs
    if (this.shareLogs && this.dbDistante === null) {
      this.dbDistante = new RabbitMq(this.docKey)
    }
  }

  get isSharingLogs(): boolean {
    return this.shareLogs
  }
}
