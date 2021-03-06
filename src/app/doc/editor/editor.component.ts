import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { Subscription } from 'rxjs'

import * as CodeMirror from 'codemirror'
import * as Editor from 'tui-editor'
import { Doc } from '../../core/Doc'
import { DocService } from '../doc.service'

@Component({
  selector: 'mute-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    // FIXME: Importing CodeMirror's CSS here doesn't work.
    // Should find a proper way to do it.
    './editor.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable()
export class EditorComponent implements OnDestroy, OnInit {
  @Output() isReady: EventEmitter<void>
  @ViewChild('editorElt') editorElt: ElementRef

  public editor: CodeMirror.Editor

  private subs: Subscription[]
  private doc: Doc

  constructor(docService: DocService, private zone: NgZone) {
    this.isReady = new EventEmitter()
    this.subs = []
    this.doc = docService.doc
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      // Initialize editor
      const tuiEditor = new Editor({
        el: this.editorElt.nativeElement,
        initialEditType: 'markdown',
        previewStyle: 'tab',
        height: '100%',
        usageStatistics: false,
        hideModeSwitch: true,
      })
      this.editor = tuiEditor.getCodeMirror()
      this.setupGlobalForTests()
      const cmDoc = this.editor.getDoc()

      // Emit LOCAL changes
      this.editor.on('change', (instance, { origin, from, to, removed, text }) => {
        if (origin !== 'remote' && origin !== 'setValue') {
          const offset = cmDoc.indexFromPos(from)
          const result = []

          if (removed.length > 1 || removed[0]) {
            const length = removed.length - 1 + removed.reduce((accumulator, line) => accumulator + line.length, 0)
            result[result.length] = { offset, length }
          }

          if (text.length > 1 || text[0]) {
            result[result.length] = { offset, text: text.join('\n') }
          }

          this.doc.localContentChanges.next(result)
        }
      })

      // Subscribe to REMOTE changes
      this.subs[this.subs.length] = this.doc.remoteContentChanges.subscribe((ops) => {
        const apply = () => {
          for (const { offset, text, length } of ops) {
            const from = cmDoc.posFromIndex(offset)
            if (length) {
              const to = cmDoc.posFromIndex(offset + length)
              cmDoc.replaceRange('', from, to, 'remote')
            } else {
              cmDoc.replaceRange(text, from, undefined, 'remote')
            }
          }
        }
        if (ops.length === 0) {
          apply()
        } else {
          this.editor.operation(apply)
        }
      })

      this.isReady.next()
    })
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  private setupGlobalForTests() {
    const cmDoc = this.editor.getDoc() as any
    window.muteTest = {
      insert: (index: number, text: string) => {
        cmDoc.replaceRange(text, cmDoc.posFromIndex(index), null, '+input')
      },
      delete: (index: number, length: number) => {
        cmDoc.replaceRange('', cmDoc.posFromIndex(index), cmDoc.posFromIndex(index + length), '+input')
      },
      getText: (index?: number, length?: number) => {
        if (index) {
          return this.editor.getValue().substr(index, length)
        } else {
          return this.editor.getValue()
        }
      },
    }
  }
}
