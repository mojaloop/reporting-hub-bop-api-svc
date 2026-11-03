/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2026                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 **************************************************************************/

import { createLifecycle } from './lifecycle';

/** The service's lifecycle, taking SIGTERM and SIGINT from the moment the entry module imports it first. */
export const lifecycle = createLifecycle();
