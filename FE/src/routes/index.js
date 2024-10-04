/* eslint-disable */
import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

//Guards
import GuestGuard from 'utils/route-guard/GuestGuard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ApprovedGuard from 'utils/route-guard/ApprovedGuard';

// project imports
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';
import NavMotion from 'layout/NavMotion';
import Loadable from 'ui-component/Loadable';
import Leave from 'views/attendance/leave';
import Attendance from 'views/attendance/attendance';
import VerificationPending from 'views/profile/VerificationPending';
import Holiday from 'views/attendance/holiday';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { roles } from 'store/constant';
import CompanyDetails from 'views/company';
import TicketsList from 'views/dashboard/Tickets';
import EmployeeLeaveDashboard from 'views/attendance/leave/EmployeeLeaveDashboard';
import EmployeePayrollDashboard from 'views/payroll/EmployeePayrollDashboard';
// import SampleComp from 'views/signature/signature';
// import HTMLToPdf from 'views/signature/htmlToPdf';
// import RichText from 'views/richtext';
// import LetterTemplates from 'views/dashboard/templates';
// import SignaturePad from 'views/signature/signature';

// login routing
const AuthLogin = Loadable(lazy(() => import('views/pages/authentication/authentication1/Login1')));
const AuthForgotPassword = Loadable(lazy(() => import('views/pages/authentication/authentication1/ForgotPassword1')));
const AuthResetPassword = Loadable(lazy(() => import('views/pages/authentication/authentication1/ResetPassword1')));
const AuthCreatePassword = Loadable(lazy(() => import('views/pages/authentication/authentication1/CreatePassword1')));

const UserDetails = Loadable(lazy(() => import('views/pages/user/index')));
const UserProfile = Loadable(lazy(() => import('views/profile/Profile1/index')));

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const DashboardAnalytics = Loadable(lazy(() => import('views/dashboard/Analytics')));

const EmployeesList = Loadable(lazy(() => import('views/dashboard/Employees/EmployeesList')));
const EmployeeAddEditForm = Loadable(lazy(() => import('views/dashboard/Employees/EmployeeAddEditForm')));

const ShiftAddEdit = Loadable(lazy(() => import('views/dashboard/shift-management/Shifts/index')));
const EmployeeShift = Loadable(lazy(() => import('views/dashboard/shift-management/employee-shifts/index')));

// attendance routing
const CheckIn = Loadable(lazy(() => import('views/attendance/checkin/index')));

// client routing
const ClientList = Loadable(lazy(() => import('views/dashboard/Clients/ClientList')));

//Payroll
const PayrollList = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/PayrollList')));
const SalarySlips = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/SalarySlips')));
const Salary = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/Salary')));
const UpdatePayroll = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/UpdatePayroll')));
const SalaryStructureHistory = Loadable(lazy(() => import('views/dashboard/Payroll/Salary/history/SalaryStructureHistory')));
const PayrollOverview = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/PayrollOverview')));
const SalaryRevision = Loadable(lazy(() => import('views/dashboard/Payroll/payroll/SalaryRevision')));

// logger listt
const LoggerList = Loadable(lazy(() => import('views/dashboard/logger/LoggerList')));

const SalaryAddEditForm = Loadable(lazy(() => import('views/dashboard/Payroll/Salary/SalaryAddEditForm')));
const BonusAddEditForm = Loadable(lazy(() => import('views/dashboard/Payroll/Bonus/BonusAddEditForm')));

// Letter Templates
const LetterTempatesList = Loadable(lazy(() => import('views/dashboard/templates/index')));
const LetterTempatesEditCreate = Loadable(lazy(() => import('views/dashboard/templates/CreateEditTemplate')));

// Employees
const SendEmployeeLetter = Loadable(lazy(() => import('views/dashboard/Employees/letters/SendLetter')));
const EmployeeDigitalSignature = Loadable(lazy(() => import('views/dashboard/Employees/digital-signature/DigitalSignature')));

// Documents
const DocumentsList = Loadable(lazy(() => import('views/dashboard/Documents')));
const RequestsList = Loadable(lazy(() => import('views/dashboard/Requests')));

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes([
        {
            path: '/',
            children: [
                {
                    element: (
                        <GuestGuard>
                            <AuthLogin />
                        </GuestGuard>
                    ),
                    index: true
                }
            ]
        },
        {
            path: 'auth',
            children: [
                {
                    element: (
                        <GuestGuard>
                            <AuthForgotPassword />
                        </GuestGuard>
                    ),
                    path: 'forgot-password'
                },
                {
                    element: (
                        <GuestGuard>
                            <AuthResetPassword />
                        </GuestGuard>
                    ),
                    path: 'reset-password'
                },
                {
                    element: (
                        <GuestGuard>
                            <AuthCreatePassword />
                        </GuestGuard>
                    ),
                    path: 'create-password'
                }
            ]
        },

        {
            path: 'user',
            children: [
                {
                    path: 'details',
                    element: (
                        <AuthGuard>
                            <UserDetails />
                        </AuthGuard>
                    ),
                    index: true
                },
                {
                    path: 'account-profile',
                    element: (
                        <AuthGuard>
                            <MainLayout />
                        </AuthGuard>
                    ),
                    children: [
                        {
                            path: '',
                            element: <UserProfile />
                        }
                    ]
                }
            ]
        },

        {
            path: 'user',
            element: <MainLayout />,
            children: [
                {
                    path: 'not-approved',
                    element: <VerificationPending />
                }
            ]
        },
        {
            path: 'company',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'details',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE, roles.HR]}>
                            <CompanyDetails />
                        </RoleBasedGuard>
                    )
                }
            ]
        },
        {
            path: 'dashboard',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'default',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <DashboardDefault />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'analytics',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <DashboardAnalytics />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'clients',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE, roles.HR]}>
                            <ClientList />
                        </RoleBasedGuard>
                    )
                }
            ]
        },

        {
            path: 'employees',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <EmployeesList />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'add',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <EmployeeAddEditForm />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: ':id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <EmployeeAddEditForm />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'send-letter/:employeeId',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SendEmployeeLetter />
                        </RoleBasedGuard>
                    )
                }
            ]
        },
        {
            path: 'employees/digital-sign',
            element: <EmployeeDigitalSignature />
        },

        {
            path: 'letter-templates',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                            <LetterTempatesList />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'create',
                    element: (
                        <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                            <LetterTempatesEditCreate />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'edit/:template_id',
                    element: (
                        <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                            <LetterTempatesEditCreate isEdit />
                        </RoleBasedGuard>
                    )
                }
            ]
        },
        {
            path: 'shift',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'create-shifts',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <ShiftAddEdit />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'manage-shifts',
                    element: <EmployeeShift />
                }
            ]
        },
        {
            path: 'attendance',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: <Attendance />
                },
                {
                    path: 'checkin',
                    element: <CheckIn />
                },
                {
                    path: 'leave',
                    element: <Leave />
                },
                {
                    path: 'leave/employee/:id',
                    element: <EmployeeLeaveDashboard />
                },
                {
                    path: 'holiday',
                    element: <Holiday />
                }
            ]
        },
        {
            path: 'payroll',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <PayrollList />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary-slips',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalarySlips />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <Salary />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <Salary />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'payout-overview',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <PayrollOverview />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary-revision',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalaryRevision />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'reimbursement',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <EmployeePayrollDashboard />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary-revision/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <EmployeePayrollDashboard />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary/add/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalaryAddEditForm />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary/view/:id',
                    element: <SalaryAddEditForm comingFromSalaryHistory viewOnly />
                },
                {
                    path: 'salary/edit/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalaryAddEditForm />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary/history/edit/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalaryAddEditForm comingFromSalaryHistory />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'salary/history/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <SalaryStructureHistory />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'bonus/add/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <BonusAddEditForm />
                        </RoleBasedGuard>
                    )
                },
                {
                    path: 'bonus/edit/:id',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE]}>
                            <BonusAddEditForm />
                        </RoleBasedGuard>
                    )
                }
            ]
        },
        {
            path: 'documents',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <ApprovedGuard>
                            <DocumentsList />
                        </ApprovedGuard>
                    )
                }
            ]
        },
        {
            path: 'logger',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <RoleBasedGuard message restrictedRoles={[roles.EMPLOYEE, roles.HR]}>
                            <LoggerList />
                        </RoleBasedGuard>
                    )
                }
                // {
                //     path: 'salary/add/:id',
                //     element: <SalaryAddEditForm />
                // },
                // {
                //     path: 'salary/edit/:id',
                //     element: <SalaryAddEditForm />
                // },
                // {
                //     path: 'bonus/add/:id',
                //     element: <BonusAddEditForm />
                // },
                // {
                //     path: 'bonus/edit/:id',
                //     element: <BonusAddEditForm />
                // }
            ]
        },
        {
            path: 'requests',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <ApprovedGuard>
                            <RequestsList />
                        </ApprovedGuard>
                    )
                }
            ]
        },
        {
            path: 'tickets',
            element: (
                <ApprovedGuard>
                    <MainLayout />
                </ApprovedGuard>
            ),
            children: [
                {
                    path: 'list',
                    element: (
                        <ApprovedGuard>
                            <TicketsList />
                        </ApprovedGuard>
                    )
                }
            ]
        }
        // {
        //     path: 'test',
        //     element: <SampleComp />
        // },
        // {
        //     path: 'html-to-pdf',
        //     element: <HTMLToPdf />
        // },

        // {
        //     path: 'editor',
        //     element: <RichText />
        // },
        // {
        //     path: 'test',
        //     element: <SignaturePad />
        // },
        // {
        //     path: 'html-to-pdf',
        //     element: <HTMLToPdf />
        // }
    ]);
}
