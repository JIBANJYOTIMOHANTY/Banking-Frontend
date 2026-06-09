import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonService } from '../../common-service/common-service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  readonly loginUrl = `${environment.BASE_API_URL}`;
  private commonService = inject(CommonService);

  createCustomer(payload: any) {
    const apiUrl = 'bank/customer';
    return this.commonService.post(`${this.loginUrl}${apiUrl}`, payload, { skipSanitization: true });
  }
}
