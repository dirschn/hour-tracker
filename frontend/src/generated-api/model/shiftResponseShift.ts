/**
 * API V1
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { EmploymentWithDetails } from './employmentWithDetails';


export interface ShiftResponseShift { 
    id: number;
    employment_id: number;
    date: string;
    start_time: string;
    end_time?: string | null;
    description?: string;
    notes?: string;
    hours: number;
    active: boolean;
    created_at?: string;
    updated_at?: string;
    employment: EmploymentWithDetails;
}

