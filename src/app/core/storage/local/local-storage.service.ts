import { Injectable } from '@angular/core'
import { State } from 'mute-core'
import { MetaDataService } from 'mute-core'
import { filter } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

import { SymmetricCryptoService } from '../../crypto/symmetric-crypto.service'
import { Doc } from '../../Doc'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { BotStorageService, IMetadata } from '../bot/bot-storage.service'
import { IStorage } from '../IStorage'
import { Storage } from '../Storage'
import { EIndexedDBState, getIndexedDBState } from './indexedDBCheck'

const selectListForDoc = [
  'type',
  'key',
  'signalingKey',
  'cryptoKey',
  'title',
  'titleModified',
  'remotes',
  'parentFolderId',
  'previousParentFolderId',
  'created',
  'opened',
  'modified',
  'modifiedByOthers',
  'description',
]

const DB_NAME_PREFIX = 'docs-'

@Injectable()
export class LocalStorageService extends Storage implements IStorage {
  public static NO_ACCESS = 1
  public static NOT_SUPPORTED = 2

  public local: Folder
  public trash: Folder
  public remote: Folder

  private db: any
  private dbLogin: string

  constructor(private botStorage: BotStorageService, private symCrypto: SymmetricCryptoService) {
    super()
    this.local = Folder.create(this, 'Local storage', 'devices', false)
    this.local.id = 'local'
    this.trash = Folder.create(this, 'Trash', 'delete', false)
    this.trash.id = 'trash'

    if (botStorage.status !== BotStorageService.UNAVAILABLE) {
      this.remote = Folder.create(this, 'Remote storage', 'cloud', true)
      this.remote.id = botStorage.id
    }
  }

  async init(settings: SettingsService): Promise<void> {
    // Check if available
    const indexedDBState = await getIndexedDBState()
    if (indexedDBState === EIndexedDBState.OK) {
      super.setStatus(LocalStorageService.AVAILABLE)
    } else {
      super.setStatus(indexedDBState)
    }
    this.dbLogin = settings.profile.login
    this.openDB(this.dbLogin)
    settings.onChange.pipe(filter((properties) => properties.includes(EProperties.profile))).subscribe(() => {
      const login = settings.profile.login
      if (login && this.dbLogin !== login) {
        this.dbLogin = login
        this.openDB(login)
      }
    })
  }

  async save(file: File): Promise<void> {
    this.check()
    await new Promise((resolve, reject) => {
      if (file.id) {
        this.db.put(file.id, file.serialize()).then(() => resolve(), (err) => reject(err))
      } else {
        this.db.post(file.serialize()).then(
          (id: string) => {
            file.id = id
            resolve()
          },
          (err) => reject(err)
        )
      }
    })
  }

  async move(file: File, folder: Folder): Promise<void> {
    if (file.parentFolderId !== folder.id) {
      file.parentFolderId = folder.id
      return this.save(file)
    }
    return Promise.resolve()
  }

  async delete(file: File): Promise<void> {
    this.check()
    await new Promise((resolve, reject) => {
      this.db.remove(file.id).then(() => resolve(), (err: Error) => reject(err))
    })
  }

  async fetchDocs(folder: Folder): Promise<Doc[]> {
    switch (folder.id) {
      case this.local.id: {
        const [localDocs, botDocs] = [await this.fetchDocsFromFolders([this.local]), await this.botStorage.fetchDocs()]
        for (const bd of botDocs) {
          let ld = localDocs.find((d) => d.signalingKey === bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
          } else if (!(await this.isInTrash(bd.signalingKey))) {
            ld = await this.createDoc(bd.signalingKey)
            ld.title = bd.title
            ld.titleModified = new Date(bd.titleModified)
            ld.created = new Date(bd.created)
            ld.cryptoKey = bd.cryptoKey
            localDocs.push(ld)
          }
          ld.addRemote(this.remote.id)
        }
        return localDocs
      }
      case this.trash.id: {
        const [trashDocs, botDocs] = [await this.fetchDocsFromFolders([this.trash]), await this.botStorage.fetchDocs()]
        for (const bd of botDocs) {
          const ld = trashDocs.find((d) => d.signalingKey === bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
            ld.addRemote(this.remote.id)
          }
        }
        return trashDocs
      }
      case this.remote.id: {
        const botDocs = await this.botStorage.fetchDocs()

        const resultDocs: Doc[] = []
        for (const bd of botDocs) {
          let ld = await this.fetchDoc(bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
          } else {
            ld = await this.createDoc(bd.signalingKey)
            ld.title = bd.title
            ld.titleModified = new Date(bd.titleModified)
            ld.created = new Date(bd.created)
            ld.cryptoKey = bd.cryptoKey
          }
          ld.addRemote(this.remote.id)
          resultDocs.push(ld)
        }
        return resultDocs
      }
    }
  }

  async fetchDoc(key: string): Promise<Doc | undefined> {
    this.check()
    const doc = await new Promise<Doc>((resolve, reject) => {
      this.db
        .allDocs({
          query: `(type:"doc") AND (signalingKey:"${key}" OR key:"${key}")`,
          select_list: selectListForDoc,
        })
        .then(
          ({ data }) => {
            if (data) {
              if (data.rows.length === 0) {
                resolve()
              } else if (data.rows.length === 1) {
                resolve(Doc.deserialize(this, data.rows[0].id, data.rows[0].value))
              } else {
                reject(new Error(`Error fetching doc: more than 1 document exists with the following key: ${key}`))
              }
            }
            resolve()
          },
          (err) => reject(err)
        )
    })

    // FIXME: remove this code when all clients have updated to the new version
    if (doc) {
      if (doc.signalingKey === doc.cryptoKey) {
        doc.cryptoKey = await this.symCrypto.generateKey()
      }
    }
    return doc
  }

  async fetchDocContent(doc: Doc): Promise<State | undefined>

  async fetchDocContent(doc: Doc, blob = false): Promise<State | Blob | undefined> {
    this.check()
    return await new Promise<State | Blob | undefined>((resolve, reject) => {
      this.db.getAttachment(doc.id, 'body').then(
        (body) => {
          if (body) {
            if (!blob) {
              const reader = new FileReader()
              reader.onload = () => resolve(JSON.parse(reader.result) as State)
              reader.readAsText(body)
            } else {
              resolve(body)
            }
          } else {
            resolve()
          }
        },
        (err) => reject(err)
      )
    })
  }

  async saveDocContent(doc: Doc, body: State): Promise<any> {
    doc.modified = new Date()
    await this.save(doc)
    return await new Promise((resolve, reject) => {
      this.db.putAttachment(doc.id, 'body', JSON.stringify(body)).then(() => resolve(), (err) => reject(err))
    })
  }

  async createDoc(key = this.generateSignalingKey()): Promise<Doc> {
    const doc = Doc.create(this, key, await this.symCrypto.generateKey(), '', this.local.id)
    await this.save(doc)
    return doc
  }

  getFolder(id: string): Folder | undefined {
    switch (id) {
      case this.local.id:
        return this.local
      case this.trash.id:
        return this.trash
      case this.remote.id:
        return this.remote
      default:
        return undefined
    }
  }

  generateSignalingKey(): string {
    return uuidv4()
  }

  private async isInTrash(key: string): Promise<boolean> {
    return (await new Promise((resolve, reject) => {
      this.db
        .allDocs({
          query: `(signalingKey:"${key}") AND (parentFolderId:"${this.trash.id}") AND (type:"doc")`,
        })
        .then(
          ({ data }: any) => {
            if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
              resolve(true)
            } else {
              resolve(false)
            }
          },
          (err) => reject(err)
        )
    })) as boolean
  }

  private async fetchDocsFromFolders(folders: Folder[]): Promise<Doc[]> {
    this.check()
    let query
    if (folders.length === 1) {
      query = `(parentFolderId:"${folders[0].id}")`
    } else {
      query = `(parentFolderId:"${folders[0].id}") OR (parentFolderId:"${folders[1].id}")`
    }
    const docs = (await new Promise((resolve, reject) => {
      this.db.allDocs({ query: `${query} AND (type:"doc")`, select_list: selectListForDoc }).then(
        ({ data }: any) => {
          if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
            resolve(data.rows.map((row: any) => Doc.deserialize(this, row.id, row.value)))
          } else {
            resolve([])
          }
        },
        (err) => reject(err)
      )
    })) as Doc[]

    // FIXME: remove this code when all clients have updated to the new version
    for (const doc of docs) {
      if (doc.signalingKey === doc.cryptoKey) {
        doc.cryptoKey = await this.symCrypto.generateKey()
      }
    }

    return docs
  }

  private openDB(login) {
    if (this.isAvailable) {
      try {
        this.db = jIO.createJIO({
          type: 'query',
          sub_storage: {
            type: 'uuid',
            sub_storage: {
              type: 'indexeddb',
              database: `${DB_NAME_PREFIX}${login}`,
            },
          },
        })
      } catch (err) {
        log.error('Indexed DB error: ', err)
      }
    }
  }

  private check() {
    if (!this.isAvailable) {
      throw new Error('Local storage is unavailable')
    }
  }

  private async mergeDocs(doc: Doc, metadata: IMetadata) {
    const { title, titleModified } = MetaDataService.mergeTitle(
      { titleModified: doc.titleModified.getTime(), title: doc.title },
      { titleModified: metadata.titleModified, title: metadata.title }
    )
    doc.title = title
    doc.titleModified = new Date(titleModified)

    const { docCreated, cryptoKey } = MetaDataService.mergeFixData(
      { docCreated: doc.created.getTime(), cryptoKey: doc.cryptoKey },
      { docCreated: metadata.created, cryptoKey: metadata.cryptoKey }
    )
    doc.created = new Date(docCreated)
    doc.cryptoKey = cryptoKey
  }
}
