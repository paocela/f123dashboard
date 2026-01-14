import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { GPEditItem, CreateGpData, UpdateGpData } from '@f123dashboard/shared';

@Injectable({
  providedIn: 'root'
})
export class GpEditService {
  private api = inject(ApiService);
  private readonly baseUrl = 'gp-edit';

  getUpcomingGps(): Observable<{ success: boolean; data: GPEditItem[] }> {
    return this.api.post<{ success: boolean; data: GPEditItem[] }>(`${this.baseUrl}/list`, {});
  }

  getAllTracks(): Observable<{ success: boolean; data: {id: number, name: string}[] }> {
    return this.api.post<{ success: boolean; data: {id: number, name: string}[] }>(`${this.baseUrl}/tracks`, {});
  }

  createGp(data: CreateGpData): Observable<{ success: boolean; data: GPEditItem }> {
    return this.api.post<{ success: boolean; data: GPEditItem }>(`${this.baseUrl}/create`, data);
  }

  updateGp(id: number, data: UpdateGpData): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`${this.baseUrl}/update/${id}`, data);
  }

  deleteGp(id: number): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`${this.baseUrl}/delete/${id}`, {});
  }

  bulkUpdateGpDate(daysOffset: number): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`${this.baseUrl}/bulk-update-date`, { daysOffset });
  }
}
