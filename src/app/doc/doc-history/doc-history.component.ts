import {
  Component,
  OnInit,
  Injectable,
  Input,
  ViewChild,
  ElementRef,
  NgZone } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { DocService } from 'mute-core/lib'
import { TextDelete, TextInsert }  from 'mute-structs'
import * as CodeMirror from 'codemirror'
import { Observable } from 'rxjs'

import { TimelineComponent }  from './timeline/timeline.component'
import { HistoryControlsComponent } from './history-controls/history-controls.component'
import { Doc } from '../../core/Doc'
import { Author } from '../../core/Author'
import { DocHistoryService, Delete, Insert } from './doc-history.service'
import { CONTROLS } from './history-controls/controls'
import { UiService } from '../../core/ui/ui.service'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'

import { OPERATIONS } from './mock-operations'

require('codemirror/mode/gfm/gfm')
require('codemirror/mode/javascript/javascript')

@Component({
  selector: 'mute-doc-history',
  templateUrl: './doc-history.component.html',
  styleUrls: ['./doc-history.component.scss'],
  providers: [DocHistoryService]
})

@Injectable()
export class DocHistoryComponent implements OnInit {

  private isInited = false
  private operations: (Delete | Insert)[]
  public docAuthors: Author[]

  @Input() docService: DocService
  @ViewChild('editorElt') editorElt: ElementRef
  @ViewChild(TimelineComponent) timelineComponent: TimelineComponent
  @ViewChild(HistoryControlsComponent) historyControlsComponent: HistoryControlsComponent
  @ViewChild('sidenavElm') sidenavElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  @ViewChild('rightSidenavElm') rightSidenavElm
  public editor: CodeMirror.Editor
  public currentOp: number
  private doc: Doc

  public rightSideNavMode = 'side'

  constructor (
    private zone: NgZone,
    private route: ActivatedRoute,
    private docHistory: DocHistoryService,
    public ui: UiService,
    public media: ObservableMedia,
    private router: Router
  ) { }

  ngOnInit () {
    // TODO replace by the specified service which maybe exist
    this.route.data.subscribe((data: {doc: Doc}) => {
      this.doc = data.doc
      this.docHistory.getAuthors(data.doc)
        .then((docAuths: Author[]) => {
          this.docAuthors = docAuths
        })

      this.docHistory.getOperations(data.doc)
        .then((ops: (Delete | Insert)[]) => {
          this.operations = ops
          this.showVersion(this.operations.length)

        })

      this.ui.onNavToggle.subscribe(() => {
        this.leftSidenavElm.opened = !this.leftSidenavElm.opened
      })

      this.ui.onDocNavToggle.subscribe(() => {
        this.rightSidenavElm.opened = !this.rightSidenavElm.opened
      })

      this.currentOp = 0
    })


    // this.operations = OPERATIONS
    // this.currentOp = this.operations.length
    const elm1 = document.getElementById('textArea')
    const elm2 = this.editorElt.nativeElement
    /*
    * Here you have elm1 === elm2.
    * The first is a native browser approach.
    * The second is an Angular approach.
    * But the result is the same.
    */

    /*
    * We have NgZone imported in this module and injected its instance
    * by Angular (see constructor property).
    * We run the following code what we call outside of Angular zone,
    * because we do not want Angular detect any modification done inside
    * CodeMirror and manage it ourselves.
    * Q. Why this?
    * A. To understand well a more detailed comprehension of Angular
    * detect changes mechanism is mandatory, but in two words
    * if we do not do it, we will have a performance issue,
    * as Angular would run detectChanges mechanism infinitely.
    */
    this.zone.runOutsideAngular(() => {
      this.editor = CodeMirror(elm1, {
        value: '',
        mode: 'gfm',
        readOnly: 'true',
        lineWrapping: true,
      })
    })
  }

  /**
   * numOperations corresponds to a numero between
   * 1 and countOperation().
   */
  showVersion (numOperation: number) {
    let begin = 0
    let end = 0
    // TODO Refactoring to avoid those tests
    if (this.currentOp === this.countOperations()) {
      begin = this.operations[this.currentOp - 1].offset
    } else {
      begin = this.operations[this.currentOp].offset
    }

    if (numOperation === this.countOperations()) {
      end = this.operations[numOperation - 1].offset
    } else {
      end = this.operations[numOperation].offset
    }

    if (this.currentOp !== numOperation) {
      const doc = this.editor.getDoc() as any
      // Generate string content depending on operations
      const generatedText = this.generateText(0, numOperation - 1)
      // just replace the content of editor the generated text.
      doc.setValue(generatedText)
      this.currentOp = numOperation
    }

    // this.mockTextColors()
    this.animateText(begin, end)
    this.colorizeDifferences(begin, end)
  }

  generateText (beginOp: number, endOp: number): String {
    let textContent = ''
    for (let i = beginOp; i <= endOp; i++) {
      const currentOp = this.operations[i]
      if (currentOp instanceof TextInsert) {
        textContent = textContent.slice(0, currentOp.offset) +
        currentOp.content + textContent.slice(currentOp.offset)
      } else if (currentOp instanceof TextDelete) {
        textContent = textContent.slice(0, currentOp.offset) +
        textContent.slice(currentOp.offset + currentOp.length, textContent.length)
      }
    }
    return textContent
  }

  destroyText (begin, end) {
    const doc = this.editor.getDoc()
    let pos1 = doc.posFromIndex(begin)
    let pos2 = doc.posFromIndex(end + 1)
    doc.markText({line: pos1.line, ch: pos1.ch},
       {line: pos2.line, ch: pos2.ch}, {css: 'background-color: red' })
    doc.markText({line: pos1.line, ch: pos1.ch},
       {line: pos2.line, ch: pos2.ch}, {css: 'animation-name: slideout;'
       + 'animation-duration: 0.5s;' })
  }

  countOperations (): number {
    return this.operations ? this.operations.length : 0
  }

  countMax (): number {
    if (this.countOperations() === 0) {
      return 0
    }
    return Math.floor(this.countOperations() / 2)
  }

  onInputChange (event: any) {
    let indexOp = event.target.value
    indexOp = indexOp >= this.countOperations() ? this.countOperations() : indexOp
    indexOp = indexOp <= 0 ? 1 : indexOp
    this.showVersion(indexOp)
  }

  mockTextColors () {
    const doc = this.editor.getDoc()
    let cpt = 0
    let length = 0
    doc.eachLine((l) => {
      if (this.docAuthors) {
        length = this.docAuthors.length
      }
      let color = this.docAuthors[(Math.floor(Math.random() * 10)) % length].getColor()
      doc.markText({line: cpt, ch: (Math.floor(Math.random() * 10))},
       {line: cpt, ch: (Math.floor(Math.random() * 200))}, {css: 'background-color: ' + color})
      cpt += (Math.floor(Math.random() * 10))
    })
  }

  colorizeDifferences (begin: number, end: number) {
    const doc = this.editor.getDoc()
    let pos1 = doc.posFromIndex(begin)
    let pos2 = doc.posFromIndex(end + 1)
    doc.markText({line: pos1.line, ch: pos1.ch},
       {line: pos2.line, ch: pos2.ch}, {css: 'background-color: #4CAF50' })
  }

  animateText (begin: number, end: number) {
    const doc = this.editor.getDoc()
    let pos1 = doc.posFromIndex(begin)
    let pos2 = doc.posFromIndex(end)
    doc.markText({line: pos1.line, ch: pos1.ch},
       {line: pos2.line, ch: pos2.ch}, {css: 'animation-name: slidein;'
       + 'animation-duration: 0.300s;' })
  }

  onControlsChange (controlType: number) {
    // log.angular('controls', controlType)
    switch (controlType) {
    case CONTROLS.PLAY:
      this.timelineComponent.play()
      break
    case CONTROLS.PAUSE:
      this.timelineComponent.pause()
      break
    case CONTROLS.FAST_FORWARD:
      this.timelineComponent.goToEnd()
      break
    case CONTROLS.FAST_REWIND:
      this.timelineComponent.goToBegin()
      break
    }
  }

  showEditor () {
    this.ui.setActiveFile(this.doc)
    this.router.navigate(['/doc/' + this.doc.id])
  }

}
