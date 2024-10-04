import * as pug from 'pug';
import * as path from 'path';
import * as numeral from 'numeral';
import { convertNumberToRupees } from '../common';

const pdfContent = async (pdfTemplateName, pdfTemplateData) => {
  const PDF_TEMPLATE_PATH = path.join(__dirname, 'templates');

  pdfTemplateData.siteUrl = 'https://hrms.heliverse.com';
  pdfTemplateData.invalidIcon = '/images/no-icon.jpg';

  pdfTemplateData.convertNumberToRupees = n => {
    let word = convertNumberToRupees(n, '&') || '';
    if (!word) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  pdfTemplateData.formatCurrency = amount => {
    return '₹' + numeral(amount).format('0,0.00');
  };

  var pdfHtml = pug.renderFile(
    path.join(PDF_TEMPLATE_PATH, `${pdfTemplateName}.pug`),
    pdfTemplateData,
  );

  return pdfHtml;
};

export default pdfContent;
