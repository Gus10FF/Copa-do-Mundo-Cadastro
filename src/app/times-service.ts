import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Times } from './times';

@Injectable({
  providedIn: 'root',
})
export class TimesService {
   apiUrl = "http://localhost:3000/times";

  constructor(private http: HttpClient) {}

  getAllTimes(): Observable<Times[]> {
    return this.http.get<Times[]>(this.apiUrl);
  }
}
