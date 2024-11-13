/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import Query from './Query';
// import [TransferSummary] from './TransferSummary';
import { TransferSummary, TransferGroup, TransferSummarySum } from './TransferSummary';

// Add more types as needed

export default [Query, TransferSummary, TransferGroup, TransferSummarySum];
