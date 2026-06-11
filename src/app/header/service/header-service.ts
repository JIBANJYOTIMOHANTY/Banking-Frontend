import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonService } from '../../common-service/common-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private commonService = inject(CommonService);

  private readonly baseUrl = `${environment.BASE_API_URL}bank/customer`;

  isBannerDismissed = signal(false);

  getAccounts(query?: string): Observable<any> {
    return this.commonService.post<any>(`${this.baseUrl}/search`, { query: query || '' });
  }

  freezeAccount(accountNumber: string): Observable<any> {
    return this.commonService.put<any>(`${this.baseUrl}/${accountNumber}/freeze`, {});
  }

  unfreezeAccount(accountNumber: string): Observable<any> {
    return this.commonService.put<any>(`${this.baseUrl}/${accountNumber}/unfreeze`, {});
  }

  publishBroadcast(message: string, alertType: string = 'INFO'): Observable<any> {
    const broadcastUrl = `${environment.BASE_API_URL}bank/broadcast`;
    return this.commonService.post<any>(broadcastUrl, { message, alertType });
  }


  getActiveBroadcast(): Observable<any> {
    const broadcastUrl = `${environment.BASE_API_URL}bank/broadcast/active`;
    return this.commonService.get<any>(broadcastUrl);
  }

  clearActiveBroadcast(): Observable<any> {
    const broadcastUrl = `${environment.BASE_API_URL}bank/broadcast/active`;
    return this.commonService.delete<any>(broadcastUrl);
  }
}
