import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatToolbarModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule } from '@angular/material';

const materialComponents = [
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatListModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: materialComponents,
  exports: materialComponents
})
export class MaterialModule { }
