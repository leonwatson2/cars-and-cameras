import { Component, OnInit } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';
import { RootState } from '../store/state';
import { Observable } from 'rxjs';
import { CameraStoreSelectors, CameraStoreActions } from '../store';
import { Camera, Assignment, Vehicle } from '../models';
import { selectAssignments } from '../store/assignments-store/assignments.selectors';
import { selectVehicles } from '../store/vehicles-store/vehicles.selectors';
import {
  VehicleStoreSelectors,
  VehicleStoreActions
} from '../store/vehicles-store';
import { AssignmentStoreActions } from '../store/assignments-store';
import { createAssignment } from '../store/utils';

@Component({
  selector: 'app-cameras',
  templateUrl: './cameras.component.html',
  styleUrls: ['./cameras.component.sass']
})
export class CamerasComponent implements OnInit {
  cameras$: Observable<Camera[]>;
  unassignedVehicles$: Observable<Vehicle[]>;
  assignments: Assignment[];
  vehicles: Vehicle[];
  constructor(private store: Store<RootState>) {}

  ngOnInit() {
    this.cameras$ = this.store.select(CameraStoreSelectors.selectCameras);
    this.unassignedVehicles$ = this.store.select(
      VehicleStoreSelectors.selectUnassignedVehicles
    );
    this.store.dispatch(new CameraStoreActions.LoadCameras());
    this.store
      .select(
        createSelector(
          selectAssignments,
          selectVehicles,
          (assignments, vehicles) => ({ assignments, vehicles })
        )
      )
      .subscribe(({ assignments, vehicles }) => {
        this.assignments = assignments;
        this.vehicles = vehicles;
      });
    this.store.dispatch(new VehicleStoreActions.LoadVehicles());
    this.store.dispatch(new CameraStoreActions.LoadCameras());
  }
  getCameraAssignment(camera: Camera) {
    const assignment = this.assignments.find(a => a.cameraId === camera.id);
    if (!assignment) return false;
    return this.vehicles.find(v => v.id === assignment.vehicleId);
  }
  assignVehicleTo(camera: Camera, vehicle: Vehicle) {
    console.log(camera, vehicle);
    this.store.dispatch(
      new AssignmentStoreActions.AddAssignment({
        item: createAssignment(camera, vehicle)
      })
    );
  }
}
