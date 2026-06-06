import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Times } from "../times"
import { TimesService } from '../times-service';

@Component({
  selector: 'app-times-component',
  standalone: false,
  templateUrl: './times-component.html',
  styleUrl: './times-component.css',
})
export class TimesComponent implements OnInit{
  times = signal<Times[]>([]);
  formGroupTimes: FormGroup;

   constructor(private formBuilder: FormBuilder, private service: TimesService) {
    this.formGroupTimes = formBuilder.group({
      id: [""],
      national: [""],
      trainer: [""],
      date: [""],
      fisic: [""],
    });
  }

 ngOnInit(): void {
    this.service.getAllTimes().subscribe({
      next: (json) => this.times.set(json),
    });
  }

  save(){
    this.service.save(this.formGroupTimes.value).subscribe(
     {
       next: json => {
          this.times.update(times => [...times, json]);
          this.formGroupTimes.reset();
       }
     }
    );
 }



}
