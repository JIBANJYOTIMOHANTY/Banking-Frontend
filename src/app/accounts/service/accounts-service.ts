import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common-service/common-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private commonService = inject(CommonService);
  private readonly baseUrl = `${environment.BASE_API_URL}bank/customer`;

  getAccounts(query?: string): Observable<any> {
    return this.commonService.post<any>(`${this.baseUrl}/search`, { query: query || '' });
  }

  createAccount(payload: { firstName: string; lastName: string; balance: number }): Observable<any> {
    return this.commonService.post<any>(this.baseUrl, payload);
  }

  deposit(accountNumber: string, amount: number): Observable<any> {
    return this.commonService.put<any>(`${this.baseUrl}/deposit/${accountNumber}/${amount}`, {});
  }

  withdraw(accountNumber: string, amount: number): Observable<any> {
    return this.commonService.put<any>(`${this.baseUrl}/withdraw/${accountNumber}/${amount}`, {});
  }

  transfer(sourceAccountNumber: string, destAccountNumber: string, amount: number): Observable<any> {
    return this.commonService.put<any>(`${this.baseUrl}/transfer/${sourceAccountNumber}/${destAccountNumber}/${amount}`, {});
  }

  deleteAccount(accountNumber: string): Observable<any> {
    return this.commonService.delete<any>(`${this.baseUrl}/${accountNumber}`);
  }
}
