import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { filter } from 'rxjs/operators'

import { environment } from '../../../../environments/environment'
import { Doc } from '../../Doc'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { Storage } from '../Storage'

@Injectable()
export class BotStorageService extends Storage {
  public static NOT_AUTHORIZED = 1
  public static NOT_RESPONDING = 2

  public name: string
  public remote: Folder

  private url: string
  private webSocketPath: string
  private secure: boolean

  constructor(private http: HttpClient, private settings: SettingsService) {
    super()
    const botStorage = environment.botStorage || undefined

    if (botStorage && 'url' in botStorage && 'secure' in botStorage && 'webSocketPath' in botStorage) {
      const bs = botStorage as any
      this.secure = bs.secure
      this.url = bs.url
      this.webSocketPath = bs.webSocketPath
      this.remote = Folder.create('Remote storage', 'cloud', true)
      this.remote.id = this.id
    } else {
      this.name = ''
      this.url = ''
    }

    settings.onChange.pipe(filter((properties) => properties.includes(EProperties.profile))).subscribe(() => this.updateStatus())
  }

  async fetchDocs(): Promise<string[]> {
    if (this.url && this.status !== BotStorageService.NOT_AUTHORIZED) {
      return (await new Promise((resolve) => {
        this.http.get(`${this.httpURL}/docs/${this.settings.profile.login}`).subscribe(
          (keys) => resolve(keys),
          (err) => {
            log.warn('Could not retreive documents keys from the bot storage')
            super.setStatus(BotStorageService.NOT_RESPONDING)
            resolve([])
          }
        )
      })) as string[]
    }
    return []
  }

  async remove(doc: Doc): Promise<void> {
    return (await new Promise((resolve) => {
      this.http
        .post<{ key: string; login: string }>(`${this.httpURL}/remove`, {
          key: doc.key,
          login: this.settings.profile.login,
        })
        .subscribe(() => resolve())
    })) as Promise<void>
  }

  get login() {
    return this.extractHostname(this.url)
  }

  get httpURL() {
    const scheme = this.secure ? 'https' : 'http'
    return `${scheme}://${this.url}`
  }

  get wsURL() {
    const scheme = this.secure ? 'wss' : 'ws'
    if (this.webSocketPath && this.webSocketPath !== '') {
      return `${scheme}://${this.url}/${this.webSocketPath}`
    } else {
      return `${scheme}://${this.url}`
    }
  }

  get id() {
    return `${this.url}`
  }

  private updateStatus(): Promise<void> {
    if (this.url) {
      if (!this.settings.isAuthenticated() && !(environment.botStorage as any).isAnonymousAllowed) {
        super.setStatus(BotStorageService.NOT_AUTHORIZED)
      } else {
        return new Promise((resolve) => {
          this.http.get(`${this.httpURL}/name`, { responseType: 'text' }).subscribe(
            (name: string) => {
              this.name = name
              super.setStatus(BotStorageService.AVAILABLE)
              resolve()
            },
            (err) => {
              super.setStatus(BotStorageService.NOT_RESPONDING)
              resolve()
            }
          )
        })
      }
    }
    return Promise.resolve()
  }

  private extractHostname(url: string) {
    let hostname

    // find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf('://') > -1) {
      hostname = url.split('/')[2]
    } else {
      hostname = url.split('/')[0]
    }

    // find & remove port number
    hostname = hostname.split(':')[0]
    // find & remove "?"
    hostname = hostname.split('?')[0]

    return hostname
  }
}
