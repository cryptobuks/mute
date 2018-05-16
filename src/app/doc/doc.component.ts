import { Component, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { ActivatedRoute } from '@angular/router'
import { MuteCore, State } from 'mute-core'
import { filter, map } from 'rxjs/operators'
import { Subscription } from 'rxjs/Subscription'

import { ICollaborator } from 'mute-core/dist/types/collaborators/ICollaborator'
import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [RichCollaboratorsService, SyncStorageService],
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {
  @ViewChild('infoSidenav') infoSidenav

  private subs: Subscription[]
  private inited = false

  public doc: Doc
  public isMobile: boolean
  public muteCore: MuteCore

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private richCollaboratorsService: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    private botStorage: BotStorageService,
    private media: ObservableMedia,
    public ui: UiService
  ) {
    this.subs = []
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.media.asObservable().subscribe((change: MediaChange) => {
      this.isMobile = change.mqAlias === 'xs' || change.mqAlias === 'sm'
    })

    this.subs[this.subs.length] = this.richCollaboratorsService.onUpdate.subscribe((collab: ICollaborator) => {
      if (collab.login === this.botStorage.login) {
        if (this.doc.remotes.length === 0) {
          this.doc.addRemote(this.botStorage.id)
        }
        this.doc.remotes[0].synchronized = new Date()
      }
    })
    if (this.inited) {
      this.network.clean()
      this.muteCore.dispose()
    }
    this.network.init()

    this.subs[this.subs.length] = this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      this.doc = doc
      this.subs[this.subs.length] = this.network.onJoin.subscribe(() => {
        if (this.doc.remotes.length !== 0) {
          this.network.inviteBot(this.botStorage.wsURL)
        }
      })

      this.zone.runOutsideAngular(() => {
        this.muteCore = new MuteCore({
          displayName: this.settings.profile.displayName,
          login: this.settings.profile.login,
          email: this.settings.profile.email,
          avatar: this.settings.profile.avatar,
        })
        this.muteCore.messageSource = this.network.onMessage
        this.network.initSource = this.muteCore.onInit
        this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast
        this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly
        this.network.messageToSendToSource = this.muteCore.onMsgToSendTo

        this.richCollaboratorsService.updateSource = this.muteCore.collaboratorsService.onUpdate
        this.richCollaboratorsService.joinSource = this.muteCore.collaboratorsService.onJoin
        this.richCollaboratorsService.leaveSource = this.muteCore.collaboratorsService.onLeave
        this.muteCore.collaboratorsService.joinSource = this.network.onPeerJoin
        this.muteCore.collaboratorsService.leaveSource = this.network.onPeerLeave
        this.muteCore.collaboratorsService.updateSource = this.settings.onChange.pipe(
          filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)),
          map((props) => {
            if (props[EProperties.profile]) {
              return {
                id: this.network.myId,
                displayName: this.settings.profile.displayName,
                login: this.settings.profile.login,
                email: this.settings.profile.email,
                avatar: this.settings.profile.avatar,
              }
            } else {
              return { id: this.network.myId, displayName: this.settings.profile.displayName }
            }
          })
        )

        this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.syncStorage.onStoredState)
        this.syncStorage.initSource = this.muteCore.onInit.pipe(map(() => this.doc))
        this.syncStorage.stateSource = this.muteCore.syncService.onState

        this.muteCore.docService.onDocDigest.subscribe((digest: number) => {
          this.ui.digest = digest
        })

        this.muteCore.docService.onDocTree.subscribe((tree: string) => {
          this.ui.tree = tree
        })
      })
    })
  }

  ngOnDestroy() {
    this.network.clean()
    this.muteCore.dispose()
    this.subs.forEach((s) => s.unsubscribe())
  }

  editorReady(): void {
    this.muteCore.init(this.doc.key)
    this.inited = true
  }

  getDocState(): State {
    return this.muteCore.syncService.state
  }
}
