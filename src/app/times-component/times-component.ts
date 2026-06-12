import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Times } from "../times"
import { TimesService } from '../times-service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-times-component',
  standalone: false,
  templateUrl: './times-component.html',
  styleUrl: './times-component.css',
})
export class TimesComponent implements OnInit{
  times=  signal<Times[]>([]);
  formGroupTimes: FormGroup;

   constructor(private formBuilder: FormBuilder, private service: TimesService, private cdr: ChangeDetectorRef) {
    this.formGroupTimes = formBuilder.group({
      id: [""],
      national: [""],
      trainer: [""],
      date: [""],
      fisic: [""],
    });
  }

grupos: { times: Times[] }[] = Array.from({ length: 12 }, () => ({ times: [] }));
groupIds = Array.from({ length: 12 }, (_, i) => 'group-' + i);

selectedTime: Times | null = null;

showDetails(time: Times) {
  this.selectedTime = time;
}


drop(event: CdkDragDrop<Times[]>, groupIndex: number) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    if (groupIndex === -1 || event.container.data.length < 4) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      if (groupIndex !== -1) {
        const moved: Times = event.container.data[event.currentIndex];
        this.listaEspera = this.listaEspera.filter(t => t.id !== moved.id);
      }
    } else {
      alert("Esse grupo já está cheio!");
    }
  }

  localStorage.setItem('grupos', JSON.stringify(this.grupos));
}


 // lista de espera inicial
listaEspera: Times[] = [];


ngOnInit(): void {
  this.service.getAllTimes().subscribe({
    next: (json) => {
      this.times.set(json);

      const gruposSalvos = localStorage.getItem('grupos');
      if (gruposSalvos) {
        this.grupos = JSON.parse(gruposSalvos);
        const usados = this.grupos.flatMap(g => g.times.map(t => t.id));
        this.listaEspera = json.filter(t => !usados.includes(t.id));
      } else {
        this.listaEspera = [...json];
      }

      // força atualização da tela
      this.cdr.detectChanges();
    },
  });
}


editingId: number | null = null;

editTime(time: Times) {
  this.formGroupTimes.patchValue({
    id: time.id,
    national: time.national,
    trainer: time.trainer,
    date: time.date,
    fisic: time.fisic
  });
  this.editingId = time.id;
}

save() {
  const timeData: Times = this.formGroupTimes.value;

  if (this.editingId) {
    // Atualizar no JSON Server
    this.service.update(this.editingId, timeData).subscribe({
      next: updated => {
        // Atualiza no signal
        this.times.update(lista =>
          lista.map(t => t.id === updated.id ? updated : t)
        );

        // Atualiza na lista de espera
        this.listaEspera = this.listaEspera.map(t =>
          t.id === updated.id ? updated : t
        );

        // Atualiza nos grupos
        this.grupos.forEach(g => {
          g.times = g.times.map(t =>
            t.id === updated.id ? updated : t
          );
        });

        localStorage.setItem('grupos', JSON.stringify(this.grupos));
        this.editingId = null;
        this.formGroupTimes.reset();
      }
    });
  } else {
    // Criar novo
    this.service.save(timeData).subscribe({
      next: json => {
        this.times.update(times => [...times, json]);
        this.listaEspera.push(json);
        this.formGroupTimes.reset();
      }
    });
  }
}

deleteTime(time: Times) {
  this.service.delete(time).subscribe({
    next: () => {
      // remove da lista de espera
      this.listaEspera = this.listaEspera.filter(t => t.id !== time.id);

      // remove de todos os grupos
      this.grupos.forEach(g => {
        g.times = g.times.filter(t => t.id !== time.id);
      });

      // atualiza o signal times
      this.times.update(lista => lista.filter(t => t.id !== time.id));

      // salva estado atualizado dos grupos
      localStorage.setItem('grupos', JSON.stringify(this.grupos));
    }
  });
}



}
