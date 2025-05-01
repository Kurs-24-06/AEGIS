import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface VersionInfo {
  version: string;
  buildTimestamp: string;
  gitCommit: string;
}

@Component({
  selector: 'app-version-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="version-display">
      <span class="version-label">Version:</span>
      <span class="version-value">{{ versionInfo?.version || 'Unknown' }}</span>
      <span class="version-timestamp" *ngIf="versionInfo?.buildTimestamp">
        (Built: {{ formatDate(versionInfo?.buildTimestamp) }})
      </span>
    </div>
  `,
  styles: [
    `
      .version-display {
        font-size: 0.8rem;
        color: var(--gray-700);
        padding: 4px 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .version-label {
        font-weight: 500;
      }
      .version-value {
        font-family: monospace;
      }
      .version-timestamp {
        font-style: italic;
        opacity: 0.8;
      }
    `,
  ],
})
export class VersionDisplayComponent implements OnInit {
  versionInfo: VersionInfo | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVersionInfo();
  }

  private loadVersionInfo(): void {
    this.http.get<VersionInfo>('/assets/version.json').subscribe({
      next: (data) => {
        this.versionInfo = data;
      },
      error: () => {
        console.error('Failed to load version information');
        // Fallback to empty version info
        this.versionInfo = {
          version: 'dev',
          buildTimestamp: new Date().toISOString(),
          gitCommit: 'local',
        };
      },
    });
  }

  formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) {
      return 'Unknown date';
    }

    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      // Catch without parameter to avoid unused variable
      return isoDate;
    }
  }
}
