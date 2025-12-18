// Converted React Native utils file
// React Native utility functions
import React from 'react';
import { Platform } from 'react-native';

type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray;

interface ClassDictionary {
  [id: string]: any;
}

interface ClassArray extends Array<ClassValue> {}

type ClassName = ClassValue | ClassValue[];

function toVal(mix: ClassValue): string | number {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let i = 0; i < mix.length; i++) {
        const val = toVal(mix[i]);
        if (val) {
          str && (str += ' ');
          str += val;
        }
      }
    } else {
      for (const key in mix) {
        if (Object.prototype.hasOwnProperty.call(mix, key) && mix[key]) {
          str && (str += ' ');
          str += key;
        }
      }
    }
  }

  return str;
}

function clsx(...args: ClassName[]): string {
  let str = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const val = toVal(arg);
    if (val) {
      str && (str += ' ');
      str += val;
    }
  }
  return str;
}

export { clsx };