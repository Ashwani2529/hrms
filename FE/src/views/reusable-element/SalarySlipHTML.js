/* eslint-disable */

import { format } from 'date-fns'
import React from 'react'

function SalarySlipHTML({user, selectedRow}) {


    const earnings = selectedRow?.earnings || [];
    const deduction = selectedRow?.deduction || [];
    const incentive = selectedRow?.incentive || [];

    const maxRows = Math.max(earnings?.length, deduction?.length);

    return (
        <div className="payslip-box">
            <table className="border-bottom" cellSpacing="0" cellPadding="0">
                <tbody>
                    <tr>
                        <td className="pt-0 valign-bottom">
                            <div className="mb-5">
                                <b className="font-22">{user?.company?.company_name}</b>
                            </div>
                            <div>{user?.company?.company_address}</div>
                        </td>

                        <td className="pb-0 pt-0 text-right">
                           {user?.company?.company_logo && 
                           <img
                                className="mr-5 company-icon"
                                src={user?.company?.company_logo}
                                alt="Company Icon"
                            />}
                        </td>
                    </tr>
                </tbody>
            </table>

            <table cellSpacing="0" cellPadding="0">
                <tbody>
                    <tr>
                        <td colSpan="4">
                            <b className="font-22">
                                Payslip for the month of
                                {' '}
                                {selectedRow?.salary_slip_from_date &&
                                    format(new Date(selectedRow?.salary_slip_from_date), 'MMMM')}
                            </b>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="pb-0">
                            <div className="mb-5">
                                <b className="font-16 text-uppercase">
                                    {`${user?.firstname} ${user?.middlename} ${user?.lastname}`}
                                </b>
                                <span>, {user?.user_id}</span>
                            </div>

                            <div>
                                <span>{user?.role?.role_name}</span>
                                <span>
                                    &nbsp; | Date of Joining:
                                    {user?.date_of_joining &&
                                        format(new Date(user?.date_of_joining), 'd MMM yyyy')
                                    }
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="valign-bottom">
                            <div className="mb-5">UAN Number</div>
                            <div>
                                <b>{user?.user_bank?.universal_account_number || 'XXXXXXXXXX'}</b>
                            </div>
                        </td>
                        <td className="valign-bottom">
                            <div className="mb-5">PF A/C Number</div>
                            <div>
                                <b>{user?.user_bank?.pf_account_number || 'XXXXXXXXXX'}</b>
                            </div>
                        </td>
                        <td className="valign-bottom">
                            <div className="mb-5">Bank A/C Number</div>
                            <div>
                                <b>{user?.user_bank?.account_number}</b>
                            </div>
                        </td>

                        <td className="text-right">
                            <p className="mb-10">Employee Net Pay</p>
                            <div className="font-22 mb-10">
                                {`${selectedRow?.currency_type} ${selectedRow?.salary_slip_total_amount?.toLocaleString()}`}
                            </div>
                            {selectedRow?.working_days ? (
                                <div className="mb-10">
                                    <span>Paid Days: {selectedRow?.working_days}</span>
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
                    {[...Array(maxRows)?.keys()]?.map(index => (
                        <tr key={index}>
                            {earnings[index] ? (
                                <>
                                    <td>{earnings[index]?.name}</td>
                                    <td>
                                        {earnings[index]?.type === 'NORMAL' ?
                                            `${selectedRow?.currency_type} ${earnings[index]?.amount?.toLocaleString()}`
                                            :
                                            `${earnings[index]?.amount}%`
                                        }
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
                                    <td>{deduction[index]?.name}</td>
                                    <td>
                                        {deduction[index]?.type === 'NORMAL' ?
                                            `${selectedRow?.currency_type} ${deduction[index]?.amount?.toLocaleString()}`
                                            :
                                            `${deduction[index]?.amount}%`
                                        }
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
                                    {selectedRow?.currency_type}{' '}
                                    {selectedRow?.salary_slip_total_earning?.toLocaleString()}
                                </span>
                            </span>
                        </td>
                        <td></td>
                        <td>Total Deductions</td>
                        <td>
                            <span className="">
                                <span>
                                    {selectedRow?.currency_type}{' '}
                                    {selectedRow?.salary_slip_total_deduction?.toLocaleString()}
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
                            <td>{row?.name}</td>
                            <td>
                                {row?.type === 'NORMAL' ?
                                    `${selectedRow?.currency_type} ${row?.amount?.toLocaleString()}`
                                    :
                                    `${row?.amount}%`
                                }
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
                                    {selectedRow?.currency_type}{' '}
                                    {selectedRow?.salary_slip_total_incentive?.toLocaleString()}
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
                                <span >
                                    {`${selectedRow?.currency_type} 
                                            ${selectedRow?.salary_slip_total_amount?.toLocaleString()}`
                                    }
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
    )
}

export default SalarySlipHTML