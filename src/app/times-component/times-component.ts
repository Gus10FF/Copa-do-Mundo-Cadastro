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

grupos = signal<{ times: Times[] }[]>(Array.from({ length: 12 }, () => ({ times: [] })));
groupIds = Array.from({ length: 12 }, (_, i) => 'group-' + i);


selectedTime?: Times;


showDetails(time: Times) {
  console.log(time);
  this.selectedTime = time;
}


drop(event: CdkDragDrop<Times[]>, groupIndex: number) {
  if (event.previousContainer === event.container) {
    // mesmo grupo: recria o array
    this.grupos.update(grupos =>
      grupos.map((g, i) => i === groupIndex ? {
        ...g,
        times: [...g.times] // aqui você pode aplicar lógica de reorder
      } : g)
    );
  } else {
    if (groupIndex === -1 || event.container.data.length < 4) {
      const moved: Times = event.previousContainer.data[event.previousIndex];

      // remove da origem
      this.grupos.update(grupos =>
        grupos.map((g, i) => ({
          ...g,
          times: g.times.filter(t => t.id !== moved.id)
        }))
      );

      // adiciona no destino
      if (groupIndex !== -1) {
        this.grupos.update(grupos =>
          grupos.map((g, i) => i === groupIndex ? {
            ...g,
            times: [...g.times, moved]
          } : g)
        );

        this.listaEspera.update(lista => lista.filter(t => t.id !== moved.id));
      } else {
        this.listaEspera.update(lista => [...lista, moved]);
      }
    } else {
      alert("Esse grupo já está cheio!");
    }
  }

  localStorage.setItem('grupos', JSON.stringify(this.grupos()));
}


 // lista de espera inicial
listaEspera = signal<Times[]>([]);


ngOnInit(): void {
  this.service.getAllTimes().subscribe({
    next: (json) => {
      this.times.set(json);

      const gruposSalvos = localStorage.getItem('grupos');
      if (gruposSalvos) {
        this.grupos.set(JSON.parse(gruposSalvos));
       const usados = this.grupos().flatMap(g => g.times.map(t => t.id));
        this.listaEspera.set(json.filter(t => !usados.includes(t.id)));
      } else {
        this.listaEspera.set([...json]);
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
    // Atualizar existente
    this.service.update(this.editingId, timeData).subscribe({
      next: () => {
       this.service.getAllTimes().subscribe(lista => {
  this.times.set(lista);

  const usados = this.grupos().flatMap(g => g.times.map(t => t.id));
  this.listaEspera.set(lista.filter(t => !usados.includes(t.id)));

  // Atualiza os grupos com os dados novos
  this.grupos.update(grupos =>
    grupos.map(g => ({
      ...g,
      times: g.times.map(t => {
        const atualizado = lista.find(novo => novo.id === t.id);
        return atualizado ? atualizado : t;
      })
    }))
  );

  localStorage.setItem('grupos', JSON.stringify(this.grupos()));
  this.cdr.detectChanges();
});

        this.editingId = null;
        this.formGroupTimes.reset();
      }
    });
  } else {
    // Criar novo
    this.service.save(timeData).subscribe({
      next: json => {
        this.times.update(times => [...times, json]);
        this.listaEspera.update(lista => [...lista, json]);
        this.formGroupTimes.reset();
        this.cdr.detectChanges();
      }
    });
  }
}




deleteTime(time: Times) {
  this.service.delete(time).subscribe({
    next: () => {
      // remove da lista de espera
      this.listaEspera.update(lista =>
        lista.filter(t => t.id !== time.id)
      );

      // remove de todos os grupos (recria o array de grupos)
      this.grupos.update(grupos =>
        grupos.map(g => ({
          ...g,
          times: g.times.filter(t => t.id !== time.id)
        }))
      );

      // atualiza o signal times
      this.times.update(lista =>
        lista.filter(t => t.id !== time.id)
      );

      // salva estado atualizado dos grupos
      localStorage.setItem('grupos', JSON.stringify(this.grupos()));

    }
  });
}

}
