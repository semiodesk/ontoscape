import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { MaterialModule } from '../material';
import { HomeComponent } from './home.component';

const homeRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: HomeComponent
  }
]);

@NgModule({
  imports: [
    homeRouting,
    SharedModule,
    MaterialModule
  ],
  declarations: [
    HomeComponent
  ],
  providers: []
})
export class HomeModule {}
