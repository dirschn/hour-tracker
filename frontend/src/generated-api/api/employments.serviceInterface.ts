/**
 * API V1
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { HttpHeaders }                                       from '@angular/common/http';

import { Observable }                                        from 'rxjs';

import { EmploymentsIdClockInPost422Response } from '../model/models';
import { EmploymentsIdClockOutPost422Response } from '../model/models';
import { Shift } from '../model/models';


import { Configuration }                                     from '../configuration';



export interface EmploymentsServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * clock in employment
     * Clock in for a specific employment
     * @param id Employment ID
     */
    employmentsIdClockInPost(id: string, extraHttpRequestParams?: any): Observable<Shift>;

    /**
     * clock out employment
     * Clock out for a specific employment
     * @param id Employment ID
     */
    employmentsIdClockOutPost(id: string, extraHttpRequestParams?: any): Observable<Shift>;

}
