import { CommonModule } from '@angular/common'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { JwtInterceptor, Ng2UiAuthModule } from 'ng2-ui-auth'

import { environment } from '../../environments/environment'
import { SymmetricCryptoService } from './crypto/symmetric-crypto.service'
import { SettingsService } from './settings/settings.service'
import { BotStorageService } from './storage/bot/bot-storage.service'
import { LocalStorageService } from './storage/local/local-storage.service'
import { UiService } from './ui/ui.service'

@NgModule({
  imports: [CommonModule, HttpClientModule, Ng2UiAuthModule.forRoot(environment.auth)],
  exports: [],
  declarations: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    SettingsService,
    LocalStorageService,
    BotStorageService,
    UiService,
    SymmetricCryptoService,
  ],
})
export class CoreModule {}
