import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { FeatureFlags } from '@f123dashboard/shared';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private apiService = inject(ApiService);
  private flagsSignal = signal<FeatureFlags>({ fantaEnabled: false });

  readonly fantaEnabled = computed(() => this.flagsSignal().fantaEnabled);

  async loadFlags(): Promise<void> {
    try {
      this.flagsSignal.set(await firstValueFrom(this.apiService.get<FeatureFlags>('/feature-flags')));
    } catch (error) {
      console.error('Error loading feature flags:', error);
      this.flagsSignal.set({ fantaEnabled: false });
    }
  }
}