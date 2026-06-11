import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonService } from '../../common-service/common-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private commonService = inject(CommonService);

  private readonly baseUrl = `${environment.BASE_API_URL}bank/customer`;

  getAccounts(query?: string): Observable<any> {
    return this.commonService.post<any>(`${this.baseUrl}/search`, { query: query || '' });
  }
}
