import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatToolbarModule, MatSidenavModule, MatListModule } from '@angular/material';

const materialComponents = [
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
];

@NgModule({
  imports: materialComponents,
  exports: materialComponents
})
export class MaterialModule { }
