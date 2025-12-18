import React from 'react';
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Inputs = ClassValue[];

/**
 * A utility function that combines class names using clsx and tailwind-merge.
 * @param inputs - An array of class names to combine.
 * @returns A string of combined class names.
 */
export function cn(...inputs: Inputs): string {
  return twMerge(clsx(inputs));
}