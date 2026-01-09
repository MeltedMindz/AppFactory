export interface PreviewSession {
  sessionId: string;
  buildId: string;
  buildPath: string;
  startedAt: string;
  port: number;
  expoUrl: string | null;
  platformHints: {
    iosReady: boolean;
    androidReady: boolean;
  };
  fixupsApplied: string[];
  iosLaunched?: boolean;
  metroReady?: boolean;
}

export interface PreviewStatus {
  enabled: boolean;
  running: boolean;
  session: PreviewSession | null;
}

export interface PreviewLog {
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  source: 'system' | 'npm' | 'expo';
}

class PreviewAPIClient {
  private baseUrl = 'http://localhost:5174';

  async getStatus(): Promise<PreviewStatus> {
    const response = await fetch(`${this.baseUrl}/api/preview/status`);
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }
    return response.json();
  }

  async startPreview(buildId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/api/preview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ buildId }),
    });

    const result = await response.json();
    return result;
  }

  async stopPreview(): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/api/preview/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  }

  async openIOS(): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/api/preview/open/ios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  }

  async resetWatchman(): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/api/preview/reset-watchman`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  }

  createLogStream(onLog: (log: PreviewLog) => void, onError?: (error: Error) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/preview/logs`);
    
    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data) as PreviewLog;
        onLog(log);
      } catch (error) {
        console.error('Failed to parse log message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      if (onError) {
        onError(new Error('Log stream connection error'));
      }
    };

    return () => {
      eventSource.close();
    };
  }
}

export const previewAPI = new PreviewAPIClient();