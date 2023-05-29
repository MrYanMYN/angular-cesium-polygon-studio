import { Component, Input } from '@angular/core';
import { ViewerConfiguration } from 'angular-cesium';

@Component({
  selector: 'map',
  template: `
  <div style="height: 100vh">
    <ac-map>
      <polygons-editor-example></polygons-editor-example>
    </ac-map>
  </div>`,
   providers: [ViewerConfiguration],
},
)
export class MapComponent  {
   constructor(private viewerConf: ViewerConfiguration) {
    viewerConf.viewerOptions = {
      selectionIndicator: false,
      timeline: false,
      infoBox: false,
      fullscreenButton: false,
      baseLayerPicker: false,
      animation: false,
      homeButton: false,
      geocoder: true,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      mapMode2D: Cesium.MapMode2D.ROTATE,
    };
  }

}
