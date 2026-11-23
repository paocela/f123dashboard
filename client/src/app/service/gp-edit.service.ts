import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type {
  EligibleTrack, CreateGpData, UpdateGpData, SprintDrawInfo,
  GpListResponse, GpTracksResponse, GpCreateResponse, GpMutationResponse
} from '@f123dashboard/shared';

@Injectable({
  providedIn: 'root'
})
export class GpEditService {
  private api = inject(ApiService);
  private readonly baseUrl = 'gp-edit';

  getUpcomingGps(includePast = false): Observable<GpListResponse> {
    return this.api.post<GpListResponse>(`${this.baseUrl}/list`, { includePast });
  }

  getAllTracks(): Observable<GpTracksResponse> {
    return this.api.post<GpTracksResponse>(`${this.baseUrl}/tracks`, {});
  }

  getEligibleTracks(): Observable<{ success: boolean; data: EligibleTrack[] }> {
    return this.api.post<{ success: boolean; data: EligibleTrack[] }>(`${this.baseUrl}/eligible-tracks`, {});
  }

  getSprintDrawInfo(): Observable<{ success: boolean; data: SprintDrawInfo }> {
    return this.api.post<{ success: boolean; data: SprintDrawInfo }>(`${this.baseUrl}/sprint-draw-info`, {});
  }

  createGp(data: CreateGpData): Observable<GpCreateResponse> {
    return this.api.post<GpCreateResponse>(`${this.baseUrl}/create`, data);
  }

  updateGp(id: number, data: UpdateGpData): Observable<GpMutationResponse> {
    return this.api.post<GpMutationResponse>(`${this.baseUrl}/update/${id}`, data);
  }

  deleteGp(id: number): Observable<GpMutationResponse> {
    return this.api.post<GpMutationResponse>(`${this.baseUrl}/delete/${id}`, {});
  }

  bulkUpdateGpDate(daysOffset: number): Observable<GpMutationResponse> {
    return this.api.post<GpMutationResponse>(`${this.baseUrl}/bulk-update-date`, { daysOffset });
  }
}
