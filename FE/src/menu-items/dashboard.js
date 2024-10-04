/* eslint-disable */
// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
    IconDashboard,
    IconDeviceAnalytics,
    IconUsers,
    IconUserCircle,
    IconCalendarEvent,
    IconUserCheck,
    IconCreditCard,
    IconList,
    IconMail,
    IconArticle,
    IconGitPullRequest,
    IconTicket
} from '@tabler/icons';
import { roles } from 'store/constant';

const icons = {
    IconDashboard,
    IconDeviceAnalytics,
    IconUsers,
    IconCalendarEvent,
    IconUserCheck,
    IconUserCircle,
    IconCreditCard,
    IconList,
    IconMail,
    IconArticle,
    IconGitPullRequest,
    IconTicket
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
    id: 'dashboard',
    title: <FormattedMessage id="dashboard" />,
    icon: icons.IconDashboard,
    type: 'group',
    children: [
        // {
        //     id: 'default',
        //     title: <FormattedMessage id="default" />,
        //     type: 'item',
        //     url: '/dashboard/default',
        //     icon: icons.IconDashboard,
        //     breadcrumbs: false,
        //     restrict: [roles.EMPLOYEE]
        // },
        // {
        //     id: 'analytics',
        //     title: <FormattedMessage id="analytics" />,
        //     type: 'item',
        //     url: '/dashboard/analytics',
        //     icon: icons.IconDeviceAnalytics,
        //     breadcrumbs: false,
        //     restrict: [roles.EMPLOYEE]
        // },
        {
            id: 'employees',
            title: <FormattedMessage id="Employee" />,
            type: 'item',
            url: '/employees/list',
            breadcrumbs: false,
            icon: icons.IconUsers,
            restrict: [roles.EMPLOYEE]
        },
        {
            id: 'clients',
            title: <FormattedMessage id="Clients" />,
            type: 'item',
            url: '/dashboard/clients',
            icon: icons.IconUserCheck,
            breadcrumbs: false,
            restrict: [roles.EMPLOYEE, roles.HR]
        },
        {
            id: 'shift-management',
            title: <FormattedMessage id="Shift Management" />,
            type: 'collapse',
            icon: icons.IconCalendarEvent,
            children: [
                {
                    id: 'create-shifts',
                    title: <FormattedMessage id="Create Shifts" />,
                    type: 'item',
                    url: '/shift/create-shifts',
                    breadcrumbs: false,
                    restrict: [roles.EMPLOYEE]
                },
                {
                    id: 'manage-shifts',
                    title: <FormattedMessage id="Shift Roster" />,
                    type: 'item',
                    url: '/shift/manage-shifts',
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'attendance',
            title: <FormattedMessage id="Attendance" />,
            type: 'collapse',
            icon: icons.IconUserCircle,
            children: [
                {
                    id: 'attendance',
                    title: <FormattedMessage id="Attendance" />,
                    type: 'item',
                    url: '/attendance/list',
                    breadcrumbs: false
                },
                {
                    id: 'checkin',
                    title: <FormattedMessage id="CheckIns" />,
                    type: 'item',
                    url: '/attendance/checkin',
                    breadcrumbs: false
                },
                {
                    id: 'leave',
                    title: <FormattedMessage id="Leave" />,
                    type: 'item',
                    url: '/attendance/leave',
                    breadcrumbs: false
                },
                {
                    id: 'holiday',
                    title: <FormattedMessage id="Holiday" />,
                    type: 'item',
                    url: '/attendance/holiday',
                    breadcrumbs: false
                }
            ]
        },

        {
            id: 'payroll',
            title: <FormattedMessage id="Payroll" />,
            type: 'collapse',
            breadcrumbs: false,
            icon: icons.IconCreditCard,
            restrict: [roles.EMPLOYEE],
            children: [
                {
                    id: 'payrolls-list',
                    title: <FormattedMessage id="Payroll List" />,
                    type: 'item',
                    url: '/payroll/list',
                    breadcrumbs: false
                },
                {
                    id: 'salary-slips',
                    title: <FormattedMessage id="Salary Slips" />,
                    type: 'item',
                    url: '/payroll/salary-slips',
                    breadcrumbs: false
                },
                {
                    id: 'salary',
                    title: <FormattedMessage id="Salary" />,
                    type: 'item',
                    url: '/payroll/salary',
                    breadcrumbs: false
                },
                {
                    id: 'payout-overview',
                    title: <FormattedMessage id="Payout Overview" />,
                    type: 'item',
                    url: '/payroll/payout-overview',
                    breadcrumbs: false
                },
                {
                    id: 'salary-revision',
                    title: <FormattedMessage id="Salary Revision" />,
                    type: 'item',
                    url: '/payroll/salary-revision',
                    breadcrumbs: false
                }
            ]
        },
        {
            id: 'letter-templates',
            title: <FormattedMessage id="Letter Templates" />,
            type: 'item',
            url: '/letter-templates/list',
            icon: icons.IconMail,
            breadcrumbs: false,
            restrict: [roles.EMPLOYEE]
        },
        {
            id: 'docs',
            title: <FormattedMessage id="Documents" />,
            type: 'item',
            url: '/documents/list',
            icon: icons.IconArticle,
            breadcrumbs: false,
            // restrict: [roles.EMPLOYEE]
        },
        {
            id: 'logger',
            title: <FormattedMessage id="Logs" />,
            type: 'item',
            url: '/logger/list',
            breadcrumbs: false,
            icon: icons.IconList,
            restrict: [roles.EMPLOYEE, roles.HR]
        },
        {
            id: 'requests',
            title: <FormattedMessage id="Requests" />,
            type: 'item',
            url: '/requests/list',
            breadcrumbs: false,
            icon: icons.IconGitPullRequest,
            restrict: []
        },
        {
            id: 'tickets',
            title: <FormattedMessage id="Raise a ticket" />,
            type: 'item',
            url: '/tickets/list',
            breadcrumbs: false,
            icon: icons.IconTicket,
            restrict: []
        },
    ]
};

export default dashboard;
