
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, bytes, MMap, nat, ticket } from './type-aliases';

export type Storage = {
    pokeTraces: MMap<address, {
        receiver: address;
        feedback: string;
    }>;
    feedback: string;
    ticketOwnership: MMap<address, ticket>;
    tzip18: {
        proxy: address;
        version: nat;
        contractPrevious: {Some: address} | null;
        contractNext: {Some: address} | null;
    };
};

type Methods = {
    default: (
        entrypointName: string,
        payload: bytes,
    ) => Promise<void>;
};

export type DefaultParams = string

type MethodsObject = {
    default: (params: {
        entrypointName: string,
        payload: bytes,
    }) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'PokeGameCode', protocol: string, code: object[] } };
export type PokeGameContractType = ContractAbstractionFromContractType<contractTypes>;
export type PokeGameWalletType = WalletContractAbstractionFromContractType<contractTypes>;
