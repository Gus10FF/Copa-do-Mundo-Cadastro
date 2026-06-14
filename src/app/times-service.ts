import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Times } from './times';

@Injectable({
  providedIn: 'root',
})
export class TimesService {
   apiUrl = "http://localhost:8080/times";

  constructor(private http: HttpClient) {}

  getAllTimes(): Observable<Times[]> {
    return this.http.get<Times[]>(this.apiUrl);
  }

  save(times: Times): Observable<Times>{
    return this.http.post<Times>(this.apiUrl, times);

  }

  // HTTP DELETE: http://localhost:8080/times/6
  delete(times: Times): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${times.id}`);
 }

 update(id: number, time: Times) {
  return this.http.put<Times>(`${this.apiUrl}/${id}`, time);
}

}
