import { describe, expect, it } from 'vitest';

import type { TChainStatus } from '../../types';
import { statusLabels, statusTone } from './chainStatusBadge.constants';

const statuses: TChainStatus[] = [
    'pending',
    'active',
    'completed',
    'cancelled',
    'rejected',
    'countered',
    'failed',
    'expired',
];

describe('status badge constants', () => {
    it('содержит label и tone для каждого статуса сделки', () => {
        for (const status of statuses) {
            expect(statusLabels[status]).toBeTruthy();
            expect(statusTone[status]).toBeTruthy();
        }
    });

    it('помечает встречные и завершившиеся с ошибкой сделки особыми tone', () => {
        expect(statusTone.countered).toBe('warning');
        expect(statusTone.cancelled).toBe('negative');
        expect(statusTone.rejected).toBe('negative');
        expect(statusTone.failed).toBe('negative');
        expect(statusTone.expired).toBe('negative');
    });
});
