import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonService } from '../../common-service/common-service';

@Injectable({
  providedIn: 'root',
})
export class LoginAdministratorService {
  readonly loginUrl = `${environment.BASE_API_URL}`;
  private commonService = inject(CommonService);


  login(payload: any) {
    const apiUrl = 'auth/login'
    return this.commonService.post(`${this.loginUrl}${apiUrl}`, payload, { skipSanitization: true });
  }
}
