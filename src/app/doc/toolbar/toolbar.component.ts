import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core'

import { Doc } from '../../core/Doc'
import { BotStorageService } from '../../core/storage/bot/bot-storage.service'
import { DocService } from '../doc.service'
import { NetworkService } from '../network'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() menu: EventEmitter<void>
  @Output() info: EventEmitter<void>
  @ViewChild('input') input: ElementRef

  public botNotAvailable: boolean
  public doc: Doc

  constructor(docService: DocService, private network: NetworkService, private botStorage: BotStorageService) {
    this.menu = new EventEmitter()
    this.info = new EventEmitter()
    this.doc = docService.doc
    this.botNotAvailable = true
    botStorage.onStatus.subscribe((code) => (this.botNotAvailable = code !== BotStorageService.AVAILABLE))
  }

  updateTitle(event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.input.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newTitle = this.input.nativeElement.value
      this.doc.title = newTitle
      if (newTitle !== this.doc.title) {
        this.input.nativeElement.value = this.doc.title
      }
    }
  }

  selectTitle() {
    this.input.nativeElement.select()
  }

  inviteBot() {
    this.network.inviteBot(this.botStorage.wsURL)
  }
}
