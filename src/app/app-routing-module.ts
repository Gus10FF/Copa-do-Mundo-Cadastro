import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlocosComponent } from './blocos-component/blocos-component';
import { TimesComponent } from './times-component/times-component';

const routes: Routes = [
  { path: "", component: BlocosComponent },
  { path: "times", component: TimesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
