import * as moment from 'moment';
import renderPdfTemplate from '../Config/pdfTemplate';
import { htmlToPdfBuffer } from '../Config/common';

const getTotalAmount = function (type) {
  let rows = this[type];
  let total = 0;

  if (rows && rows.length) {
    total += rows.reduce((acc, row) => acc + row.amount, 0);
  }

  return total;
};

const getGrossIncome = function () {
  return (
    getTotalAmount.call(this, 'earnings') + getTotalAmount.call(this, 'incentives')
  );
};

const getTotalNetIncome = function () {
  return getGrossIncome.call(this) - getTotalAmount.call(this, 'deductions');
};

export async function generatePdf(body: any) {
  try {
    body.generatedMonth = body.start_date
      ? moment(body.start_date).format('MMMM')
      : moment().format('MMMM');
    body.companyIconUrl = body.companyIconUrl;
    body.employeeJoiningDate = body.employeeJoiningDate
      ? moment(body.employeeJoiningDate).format('DD-MM-YYYY')
      : '';

    body.totalEarnings = body.calculatedEarnings;
    body.totalincentives = body.calculatedIncentives;
    body.totalDeductions = body.calculatedDeductions;

    body.earningAndDeductions = [];

    body.earnings.forEach(function (earning, index) {
      let obj = {
        earningName: earning.name,
        earningAmount: earning.amount,
        deductionName: '',
        deductionAmount: '',
      };

      let deduction = body.deductions[index];

      if (deduction) {
        obj.deductionName = deduction.name;
        obj.deductionAmount = deduction.amount;
      }

      body.earningAndDeductions.push(obj);
    });

    body.totalNetIncome = body.calculatedNetIncome;

    let pdfContent = undefined;
    let pdfFileName = `payslip-${body.generatedMonth.toLowerCase()}-${body.employeeId}.pdf`;

    pdfContent = await renderPdfTemplate('standard-payslip', body);
    pdfContent = await htmlToPdfBuffer(pdfContent);

    return { pdfContent, pdfFileName };
  } catch (error) {
    console.log(error);
  }
}

// const getGrossAnnualIncome = function () {
//   return getGrossIncome.call(this) * 12;
// };

// const findIncomeTaxRow = function () {
//   return _.find(this.deductions, (deduction) => deduction.name.replace(/\s+/g, "").toLowerCase() === "incometax");
// };

// const getIncomeTax = function () {
//   /*
//         Income Slab                 Tax Rate
//         Up to  2.5 lakhs            None
//         2.5 lakhs – 5 lakhs         10% of exceeding amount
//         5 lakhs – 10 lakhs          20% of the exceeding amount
//         Above 10 lakhs              30% of the exceeding amount
//     */
//   let incomeTax = 0; // if less than 250000 lakhs income tax is 0.

//   let grossAnnualIncome = getGrossAnnualIncome.call(this) - getTotalAmount.call(this, "deductions");
//   let incomeTaxRow = findIncomeTaxRow.call(this);

//   if (incomeTaxRow) {
//     grossAnnualIncome = grossAnnualIncome - incomeTaxRow.amount;
//   }

//   if (grossAnnualIncome >= 250000 && grossAnnualIncome < 500000) {
//     incomeTax = (grossAnnualIncome * 10) / 100;
//   } else if (grossAnnualIncome >= 500000 && grossAnnualIncome < 1000000) {
//     incomeTax = (grossAnnualIncome * 20) / 100;
//   } else {
//     incomeTax = (grossAnnualIncome * 30) / 100;
//   }

//   return incomeTax / 12;
// };

// let incomeTaxRow = findIncomeTaxRow.call(body);

// if (!incomeTaxRow) {
//   incomeTaxRow = {
//     name: "Income Tax",
//     amount: getIncomeTax.call(body),
//   };

//   body.deductions.push(incomeTaxRow);
// }

// if (body.type === "download") {
//   res.attachment(pdfFileName);
//   return res.send(pdfContent);
// } else if (body.type === "email") {
//   let companyName = body.companyName.split(" ")[0];

//   let emailData = {
//     title: `${companyName} payslip for ${generatedMonth}`,
//     employeeName: body.employeeName,
//     generatedMonth: generatedMonth,
//   };

//   let options = {
//     subject: emailData.title,
//     to: body.employeeEmail || `${body.employeeName.replace(/\s+/g, "").toLowerCase()}@gmail.com`,
//     data: emailData,
//     pdf: {
//       content: pdfContent,
//       fileName: pdfFileName,
//     },
//   };

//   let result = await sendPayslipMail(options);

//   return { success: true, to: options.to, type: result.type, url: result.url };

// }
