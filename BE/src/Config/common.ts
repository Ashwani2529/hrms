import _, { add } from 'lodash';
import * as puppeteer from 'puppeteer';
import {EOL} from "os";
import {readFileSync,writeFileSync} from "fs";

interface IAdditionals {
  name: string;
  type: string;
  amount: number;
  percent? : number;
}

export async function calculateAdditionals(
  addtional: IAdditionals[],
  basePay: number,
): Promise<number> {
  let amount = 0;
  for (let i = 0; i < addtional.length; i++) {
    const element = addtional[i];
    if (element.type === 'PERCENTAGE') {
      amount += (element.amount / 100) * basePay;
      addtional[i].percent = parseInt(element.amount.toFixed(2))
      addtional[i].amount = (element.amount / 100) * basePay
    } else {
      amount += parseInt(Number(element.amount).toFixed(2));

    }
  }

  return amount;
}

export function convertNumberToRupees(n: number, custom_join_character) {
  var string = n.toString(),
    units,
    tens,
    scales,
    start,
    end,
    chunks,
    chunksLen,
    chunk,
    ints,
    i,
    word,
    words;

  var and = custom_join_character || 'and';

  /* Is number zero? */
  if (parseInt(string) === 0) {
    return 'zero';
  }

  /* Array of units as words */
  units = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  /* Array of tens as words */
  tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  /* Array of scales as words */
  scales = [
    '',
    'thousand',
    'million',
    'billion',
    'trillion',
    'quadrillion',
    'quintillion',
    'sextillion',
    'septillion',
    'octillion',
    'nonillion',
    'decillion',
    'undecillion',
    'duodecillion',
    'tredecillion',
    'quatttuor-decillion',
    'quindecillion',
    'sexdecillion',
    'septen-decillion',
    'octodecillion',
    'novemdecillion',
    'vigintillion',
    'centillion',
  ];

  /* Split user arguemnt into 3 digit chunks from right to left */
  start = string.length;
  chunks = [];
  while (start > 0) {
    end = start;
    chunks.push(string.slice((start = Math.max(0, start - 3)), end));
  }

  /* Check if function has enough scale words to be able to stringify the user argument */
  chunksLen = chunks.length;
  if (chunksLen > scales.length) {
    return '';
  }

  /* Stringify each integer in each chunk */
  words = [];
  for (i = 0; i < chunksLen; i++) {
    chunk = parseInt(chunks[i]);

    if (chunk) {
      /* Split chunk into array of individual integers */
      ints = chunks[i].split('').reverse().map(parseFloat);

      /* If tens integer is 1, i.e. 10, then add 10 to units integer */
      if (ints[1] === 1) {
        ints[0] += 10;
      }

      /* Add scale word if chunk is not zero and array item exists */
      if ((word = scales[i])) {
        words.push(word);
      }

      /* Add unit word if array item exists */
      if ((word = units[ints[0]])) {
        words.push(word);
      }

      /* Add tens word if array item exists */
      if ((word = tens[ints[1]])) {
        words.push(word);
      }

      /* Add 'and' string after units or tens integer if: */
      if (ints[0] || ints[1]) {
        /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
        if (ints[2] || (!i && chunksLen)) {
          words.push(and);
        }
      }

      /* Add hundreds word if array item exists */
      if ((word = units[ints[2]])) {
        words.push(word + ' hundred');
      }
    }
  }

  return words.reverse().join(' ');
}

export async function htmlToPdfBuffer(html: any) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

export function setEnvValue(key:string, value:string) {
  const ENV_VARS = readFileSync("./.env", "utf8").split(EOL);

  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
      return line.match(new RegExp(key));
  }));

  ENV_VARS.splice(target, 1, `${key}=${value}`);

  writeFileSync("./.env", ENV_VARS.join(EOL));
}
