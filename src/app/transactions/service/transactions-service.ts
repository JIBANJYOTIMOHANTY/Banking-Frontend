import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common-service/common-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private commonService = inject(CommonService);

  getAccounts(): Observable<any> {
    return this.commonService.get<any>(`${environment.BASE_API_URL}bank/customer`);
  }

  getTransactions(accountNumber: string, date?: string): Observable<any> {
    let url = `${environment.BASE_API_URL}bank/${accountNumber}/transactions`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.commonService.get<any>(url);
  }
}
