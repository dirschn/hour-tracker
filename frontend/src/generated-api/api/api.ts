export * from './authentication.service';
import { AuthenticationService } from './authentication.service';
export * from './authentication.serviceInterface';
export * from './dashboard.service';
import { DashboardService } from './dashboard.service';
export * from './dashboard.serviceInterface';
export const APIS = [AuthenticationService, DashboardService];
