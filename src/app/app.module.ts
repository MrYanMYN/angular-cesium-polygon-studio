import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MapComponent } from './map.component';
import { AngularCesiumModule, AngularCesiumWidgetsModule } from 'angular-cesium';
import { PolygonsEditorExampleComponent } from './polygon-editor-example/polygon-eidtor-example.component'

@NgModule({
  imports:      [ BrowserModule, FormsModule,
  AngularCesiumModule.forRoot({fixEntitiesShadows: false, customPipes: []}),
  AngularCesiumWidgetsModule,
  ],
  declarations: [ AppComponent, MapComponent, PolygonsEditorExampleComponent],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
