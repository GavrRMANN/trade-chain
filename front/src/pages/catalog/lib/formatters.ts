import { pluralize } from '@shared/lib';

const PRODUCT_FORMS: [string, string, string] = ['объявление', 'объявления', 'объявлений'];

/** «1 объявление» / «2 объявления» / «5 объявлений». */
export const formatProductCount = (count: number): string => pluralize(count, PRODUCT_FORMS);
