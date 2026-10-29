import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { FeatureFlags, FeatureFlagUpdateResponse } from '@f123dashboard/shared';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private apiService = inject(ApiService);
  private flagsSignal = signal<FeatureFlags>({ fantaEnabled: false, freePracticeEnabled: true });

  readonly fantaEnabled = computed(() => this.flagsSignal().fantaEnabled);
  readonly freePracticeEnabled = computed(() => this.flagsSignal().freePracticeEnabled);

  async loadFlags(seasonId?: number): Promise<FeatureFlags> {
    try {
      const endpoint = seasonId === undefined ? '/feature-flags' : `/feature-flags?seasonId=${seasonId}`;
      const flags = await firstValueFrom(this.apiService.get<FeatureFlags>(endpoint));
      this.flagsSignal.set(flags);
      return flags;
    } catch (error) {
      console.error('Error loading feature flags:', error);
      const flags = { fantaEnabled: false, freePracticeEnabled: true };
      this.flagsSignal.set(flags);
      return flags;
    }
  }

  async setFreePracticeEnabled(enabled: boolean): Promise<void> {
    await firstValueFrom(this.apiService.put<FeatureFlagUpdateResponse>('/feature-flags/free-practice', { enabled }));
    this.flagsSignal.update(flags => ({ ...flags, freePracticeEnabled: enabled }));
  }
}