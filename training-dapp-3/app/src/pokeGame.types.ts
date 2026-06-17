
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, MMap, nat, ticket, unit } from './type-aliases';

export type Storage = {
    pokeTraces: MMap<address, {
        receiver: address;
        feedback: string;
    }>;
    feedback: string;
    ticketOwnership: MMap<address, ticket>;
};

type Methods = {
    init: (
        _0: address,
        _1: nat,
    ) => Promise<void>;
    pokeAndGetFeedback: (param: address) => Promise<void>;
    poke: () => Promise<void>;
};

export type InitParams = address
export type PokeAndGetFeedbackParams = address
export type PokeParams = unit

type MethodsObject = {
    init: (params: {
        0: address,
        1: nat,
    }) => Promise<void>;
    pokeAndGetFeedback: (param: address) => Promise<void>;
    poke: () => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'PokeGameCode', protocol: string, code: object[] } };
export type PokeGameContractType = ContractAbstractionFromContractType<contractTypes>;
export type PokeGameWalletType = WalletContractAbstractionFromContractType<contractTypes>;
