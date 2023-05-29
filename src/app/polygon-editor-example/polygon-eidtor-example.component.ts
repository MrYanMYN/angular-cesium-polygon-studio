import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  CameraService,
  CesiumService,
  EditActions,
  LabelProps,
  PolygonEditorObservable,
  PolygonEditUpdate,
  PolygonsEditorService,
  ViewerConfiguration,
} from 'angular-cesium';

export class NamedPolygonEditor {
  isEditingName = false;

  constructor(
    public editor: PolygonEditorObservable,
    public name: string,
    public color: string
  ) {}
}

@Component({
  selector: 'polygons-editor-example',
  template: `
  <polygons-editor></polygons-editor>
  <div class="edit-buttons">
    <div class="button-container">
      <button mat-raised-button (click)="startEdit()">Create Polygon</button>
      <button mat-raised-button (click)="stopEdit()">Stop Edit Polygon</button>
      <button mat-raised-button (click)="savePolygons()">Save Polygons</button>

    </div>
</div>

  <div class="polygons-menu">
  <div>Edit mode: {{ isEditMode }} </div>
  <input type="file" #fileInput style="display: none" (change)="loadPolygons($event)"/>
  <button (click)="fileInput.click()">Load File</button>
    <ul>
      <li *ngFor="let namedPolygon of polygons">
      <div class="color-circle" [style.backgroundColor]="namedPolygon.color" (click)="zoomToPolygon(namedPolygon)"></div>
        {{ namedPolygon.name }}
        <input *ngIf="namedPolygon.isEditingName" [(ngModel)]="namedPolygon.name" placeholder="Enter new name">
        <button (click)="toggleNameEditing(namedPolygon)">
          {{ namedPolygon.isEditingName ? 'Save' : 'Change Name' }}
        </button>
        <button (click)="deletePolygon(namedPolygon)">Delete</button>
      </li>
    </ul>
  </div>
`,
  styles: [
    `
    .edit-buttons {
      display: flex;
      justify-content: center;
      position: fixed;
      bottom: 50px;
      left: 0;
      right: 0;
      z-index: 100;
    }
    .button-container {
      display: flex;
      justify-content: space-between;
      width: 200px;
    }
    .polygons-menu {
      display: flex;
      flex-direction: column;
      position: fixed;
      z-index: 100;
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      width: 200px;
    }
    .polygons-menu ul {
      list-style-type: none;
      padding: 0;
    }
    .polygons-menu li {
      margin-bottom: 10px;
    }
    .polygons-menu input {
      margin-left: 10px;
      width: 60px;
    }
    .color-circle {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
    }
  `,
  ],
  providers: [PolygonsEditorService],
})
export class PolygonsEditorExampleComponent implements OnInit {
  polygons: NamedPolygonEditor[] = [];
  isEditMode: Boolean = false;

  constructor(
    private polygonsEditor: PolygonsEditorService,
    private cesiumService: CesiumService,
    private camService: CameraService
  ) {}

  ngOnInit(): void {}

  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let outColor = '#';
    for (let i = 0; i < 6; i++) {
      outColor += letters[Math.floor(Math.random() * 16)];
    }

    const r = parseInt(outColor.slice(1, 3), 16) / 255;
    const g = parseInt(outColor.slice(3, 5), 16) / 255;
    const b = parseInt(outColor.slice(5, 7), 16) / 255;

    const cesiumColor = new Cesium.Color(r, g, b, 1);

    return { hex: outColor, cesium: cesiumColor };
  }

  startEdit() {
    this.isEditMode = true;
    const color = this.generateRandomColor();
    const polygon = this.polygonsEditor.create({
      polygonProps: {
        material: Cesium.Color.TRANSPARENT,
      },
      polylineProps: {
        material: () =>
          new Cesium.PolylineDashMaterialProperty({
            color: color.cesium,
          }),
      },
    });
    const namedPolygon = new NamedPolygonEditor(
      polygon,
      'Polygon ' + (this.polygons.length + 1),
      color.hex
    );
    this.polygons.push(namedPolygon);

    if (!this.isEditMode) {
    } else {
      polygon.subscribe((editUpdate: PolygonEditUpdate) => {
        console.log(editUpdate.points);
        console.log(editUpdate.positions);
        console.log(editUpdate.updatedPosition);
      });
    }
  }

  stopEdit() {
    this.isEditMode = false;
  }

  toggleNameEditing(namedPolygon: NamedPolygonEditor) {
    namedPolygon.isEditingName = !namedPolygon.isEditingName;
  }

  deletePolygon(namedPolygon: NamedPolygonEditor) {
    const index = this.polygons.indexOf(namedPolygon);
    if (index > -1) {
      this.polygons.splice(index, 1);
      namedPolygon.editor.dispose();
    }
  }

  savePolygons(): void {
    const polygonData = this.polygons.map((polygon) => ({
      name: polygon.name,
      color: polygon.color,
      positions: polygon.editor.getCurrentPoints().map((pos) => ({
        x: pos.getPosition().x,
        y: pos.getPosition().y,
        z: pos.getPosition().z,
      })),
    }));

    const blob = new Blob([JSON.stringify(polygonData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'polygons.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  loadPolygons(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result as string);

        const oldPolygons = this.polygons;
        this.polygons = data.map((polygon) => {
          const r = parseInt(polygon.color.slice(1, 3), 16) / 255;
          const g = parseInt(polygon.color.slice(3, 5), 16) / 255;
          const b = parseInt(polygon.color.slice(5, 7), 16) / 255;
          const cesiumColor = new Cesium.Color(r, g, b, 1);

          const positions = polygon.positions.map(
            (pos) => new Cesium.Cartesian3(pos.x, pos.y, pos.z)
          );

          let editor = this.polygonsEditor.edit(positions, {
            polygonProps: {
              material: Cesium.Color.TRANSPARENT,
            },
            polylineProps: {
              material: () =>
                new Cesium.PolylineDashMaterialProperty({
                  color: cesiumColor,
                }),
            },
          });

          return new NamedPolygonEditor(editor, polygon.name, polygon.color);
        });
        oldPolygons.forEach((item) => {
          this.polygons.push(item);
        });
      } catch (error) {
        console.error('Error reading file', error);
      }
    };

    reader.onerror = (error) => console.error('File could not be read', error);

    reader.readAsText(file);
  }
}
