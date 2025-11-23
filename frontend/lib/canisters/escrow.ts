// Escrow Canister Client

import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createActor, CANISTER_IDS } from './agent';
import { escrowIdlFactory } from './escrow.idl';
import {
    EscrowRecord,
    CreateEscrowParams,
    CreateEscrowResult,
    EscrowStatus,
    UTXO,
    Result,
} from '../types/canister';

export interface EscrowActor {
    create_escrow: (params: CreateEscrowParams) => Promise<Result<CreateEscrowResult>>;
    get_escrow: (escrowId: string) => Promise<[EscrowRecord] | []>;
    get_user_escrows: (userId: Principal) => Promise<EscrowRecord[]>;
    get_total_escrows: () => Promise<bigint>;
    get_escrows_by_status: (status: EscrowStatus) => Promise<EscrowRecord[]>;
    notify_deposit: (escrowId: string, utxo: UTXO) => Promise<Result<EscrowRecord>>;
    confirm_delivery: (escrowId: string) => Promise<Result<EscrowRecord>>;
    request_release: (escrowId: string) => Promise<Result<EscrowRecord>>;
    force_refund: (escrowId: string, reason: string) => Promise<Result<EscrowRecord>>;
    mark_disputed: (escrowId: string, reason: string) => Promise<Result<EscrowRecord>>;
    resolve_dispute: (escrowId: string, resolution: string) => Promise<Result<EscrowRecord>>;
    attach_ai_result: (escrowId: string, riskScore: number, tags: string[]) => Promise<Result<EscrowRecord>>;
}

class EscrowCanisterClient {
    private actor: ActorSubclass<EscrowActor> | null = null;

    private async getActor(): Promise<ActorSubclass<EscrowActor>> {
        if (!this.actor) {
            this.actor = await createActor<EscrowActor>(
                CANISTER_IDS.escrow,
                escrowIdlFactory
            );
        }
        return this.actor;
    }

    async createEscrow(params: CreateEscrowParams): Promise<CreateEscrowResult> {
        const actor = await this.getActor();
        const result = await actor.create_escrow(params);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async getEscrow(escrowId: string): Promise<EscrowRecord | null> {
        const actor = await this.getActor();
        const result = await actor.get_escrow(escrowId);
        return result[0] ?? null;
    }

    async getUserEscrows(userId: Principal): Promise<EscrowRecord[]> {
        const actor = await this.getActor();
        return await actor.get_user_escrows(userId);
    }

    async getTotalEscrows(): Promise<number> {
        const actor = await this.getActor();
        const total = await actor.get_total_escrows();
        return Number(total);
    }

    async getEscrowsByStatus(status: EscrowStatus): Promise<EscrowRecord[]> {
        const actor = await this.getActor();
        return await actor.get_escrows_by_status(status);
    }

    async notifyDeposit(escrowId: string, utxo: UTXO): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.notify_deposit(escrowId, utxo);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async confirmDelivery(escrowId: string): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.confirm_delivery(escrowId);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async requestRelease(escrowId: string): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.request_release(escrowId);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async forceRefund(escrowId: string, reason: string): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.force_refund(escrowId, reason);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async markDisputed(escrowId: string, reason: string): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.mark_disputed(escrowId, reason);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async resolveDispute(escrowId: string, resolution: string): Promise<EscrowRecord> {
        const actor = await this.getActor();
        const result = await actor.resolve_dispute(escrowId, resolution);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    private formatError(error: any): string {
        if ('NotFound' in error) return 'Escrow not found';
        if ('Unauthorized' in error) return 'Unauthorized access';
        if ('InvalidStatus' in error) return 'Invalid escrow status';
        if ('InsufficientFunds' in error) return 'Insufficient funds';
        if ('TimeLockNotExpired' in error) return 'Time lock has not expired';
        if ('AlreadyConfirmed' in error) return 'Already confirmed';
        if ('InvalidAmount' in error) return 'Invalid amount';
        if ('InternalError' in error) return `Internal error: ${error.InternalError}`;
        return 'Unknown error';
    }

    resetActor(): void {
        this.actor = null;
    }
}

export const escrowCanister = new EscrowCanisterClient();
