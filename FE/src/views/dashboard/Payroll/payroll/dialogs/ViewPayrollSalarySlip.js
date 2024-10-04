/* eslint-disable */

import React from 'react';
import './pdf.css';
import { DialogActions, DialogContent, DialogTitle, Divider, Typography, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import moment from 'moment';

function ViewPayrollSalarySlip({ selectedRow, handleModalClose }) {
    const { user } = useAuth();
    const salary_slip = selectedRow?.salary_slip[0].slips;
    const userDetails = selectedRow?.user;

    const earnings = salary_slip?.earnings || [];
    const deduction = salary_slip?.deduction || [];
    const incentive = salary_slip?.incentive || [];

    const maxRows = Math.max(earnings?.length, deduction?.length);

    return (
        <DialogContent sx={{ overflowY: 'unset', padding: '13px 0px' }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <Typography variant="h3">Salary Slip </Typography>
                <CloseIcon sx={{ position: 'absolute', right: '20px', cursor: 'pointer' }} onClick={handleModalClose} />
            </DialogTitle>
            <Divider />
            <div className="payslip-box">
                <table className="border-bottom" cellSpacing="0" cellPadding="0">
                    <tbody className="w-full ">
                        <tr className="slip-header">
                            <td className="pt-0 valign-bottom">
                                <div className="mb-5">
                                    <b className="font-22">{user?.company?.company_name}</b>
                                </div>
                                <div>{user?.company?.company_address}</div>
                            </td>

                            <td className="pb-0 pt-0 text-right">
                                {user?.company?.company_logo && (
                                    <img
                                        className="mr-5 company-icon"
                                        src={user?.company?.company_logo}
                                        alt="Company Icon"
                                        width={80}
                                        height={80}
                                    />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table cellSpacing="0" cellPadding="0">
                    <tbody>
                        <tr>
                            <td colSpan="4">
                                <b className="font-22">
                                    Payslip for the month of {moment(salary_slip?.salary_slip_from_date).format('DD-MM-YYYY')}
                                </b>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4" className="pb-0">
                                <div className="mb-5">
                                    <b className="font-16 text-uppercase">
                                        {`${userDetails?.firstname} ${userDetails?.middlename} ${userDetails?.lastname}`}
                                    </b>
                                    <span>, {userDetails?.user_id}</span>
                                </div>

                                <div>
                                    <span>{userDetails?.role?.role_name}</span>
                                    <span>
                                        &nbsp; | Date of Joining:
                                        {userDetails?.date_of_joining && format(new Date(userDetails?.date_of_joining), 'd MMM yyyy')}
                                    </span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="valign-bottom">
                                <div className="mb-5">UAN Number</div>
                                <div>
                                    <b>{userDetails?.user_bank?.universal_account_number || 'XXXXXXXXXX'}</b>
                                </div>
                            </td>
                            <td className="valign-bottom">
                                <div className="mb-5">PF A/C Number</div>
                                <div>
                                    <b>{userDetails?.user_bank?.pf_account_number || 'XXXXXXXXXX'}</b>
                                </div>
                            </td>
                            <td className="valign-bottom">
                                <div className="mb-5">Bank A/C Number</div>
                                <div>
                                    <b>{userDetails?.user_bank?.account_number}</b>
                                </div>
                            </td>

                            <td className="text-right">
                                <p className="mb-10">Employee Net Pay</p>
                                <div className="font-22 mb-10">
                                    {`${salary_slip?.currency_type} ${salary_slip?.salary_slip_total_amount?.toLocaleString()}`}
                                </div>
                                {salary_slip?.working_days ? (
                                    <div className="mb-10">
                                        <span>Paid Days: {salary_slip?.working_days}</span>
                                    </div>
                                ) : null}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <br />

                <table className="table" cellSpacing="0" cellPadding="0">
                    <thead>
                        <tr>
                            <th>EARNINGS</th>
                            <th>AMOUNT</th>
                            <th></th>
                            <th>DEDUCTIONS</th>
                            <th>AMOUNT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(maxRows)?.keys()]?.map((index) => (
                            <tr key={index}>
                                {earnings[index] ? (
                                    <>
                                        <td>{earnings[index]?.name}</td>
                                        <td>
                                            {earnings[index]?.type === 'NORMAL'
                                                ? `${salary_slip?.currency_type} ${earnings[index]?.amount?.toLocaleString()}`
                                                : `${earnings[index]?.amount}%`}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td></td>
                                        <td></td>
                                    </>
                                )}
                                <td></td>
                                {deduction[index] ? (
                                    <>
                                        {/* <td>{deduction[index]?.name}</td> */}

                                        <td>
                                            {deduction[index]?.type === 'NORMAL'
                                                ? `${deduction[index]?.name}`
                                                : `${deduction[index]?.name} (${deduction[index]?.percent}%)`}
                                        </td>
                                        <td>
                                            {deduction[index]?.type === 'NORMAL'
                                                ? `${salary_slip?.currency_type} ${deduction[index]?.amount?.toLocaleString()}`
                                                : `${deduction[index]?.amount}`}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td></td>
                                        <td></td>
                                    </>
                                )}
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Gross Earnings</td>
                            <td>
                                <span className="">
                                    <span>
                                        {salary_slip?.currency_type} {salary_slip?.salary_slip_total_earning?.toLocaleString()}
                                    </span>
                                </span>
                            </td>
                            <td></td>
                            <td>Total Deductions</td>
                            <td>
                                <span className="">
                                    <span>
                                        {salary_slip?.currency_type} {salary_slip?.salary_slip_total_deduction?.toLocaleString()}
                                    </span>
                                </span>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <br />
                <br />

                <table className="table" cellSpacing="0" cellPadding="0">
                    <thead>
                        <tr>
                            <th>INCENTIVES</th>
                            <th>AMOUNT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {incentive?.map((row, index) => (
                            <tr key={index}>
                                <td>{row?.type === 'NORMAL' ? `${row?.name}` : `${row?.name} (${row.percent}%)`}</td>
                                <td>
                                    {row?.type === 'NORMAL'
                                        ? `${salary_slip?.currency_type} ${row?.amount?.toLocaleString()}`
                                        : `${row?.amount}`}
                                </td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total Incentive</td>
                            <td>
                                <span className="">
                                    <span>
                                        {salary_slip?.currency_type} {salary_slip?.salary_slip_total_incentive?.toLocaleString()}
                                    </span>
                                </span>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <br />
                <br />

                <table className="page-break-inside-avoid">
                    <tbody>
                        <tr>
                            <td className="net-payable">
                                <div className="mb-10">
                                    <span className="text">Total Net Payable</span>
                                    <span>
                                        {`${salary_slip?.currency_type} 
                                            ${salary_slip?.salary_slip_total_amount?.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="calculation-text">
                                    Total Net Payable= ((Gross Earnings - Total Deductions) + Reimbursements)
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </DialogContent>
    );
}

export default ViewPayrollSalarySlip;
