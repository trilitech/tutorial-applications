
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, MMap, unit } from './type-aliases';

export type Storage = {
    messages: MMap<address, string>;
    feedback: string;
};

type Methods = {
    pokeMeBack: () => Promise<void>;
    pokeOtherContract: (param: address) => Promise<void>;
    pokeWithMessage: (param: string) => Promise<void>;
    poke: () => Promise<void>;
};

export type PokeMeBackParams = unit
export type PokeOtherContractParams = address
export type PokeWithMessageParams = string
export type PokeParams = unit

type MethodsObject = {
    pokeMeBack: () => Promise<void>;
    pokeOtherContract: (param: address) => Promise<void>;
    pokeWithMessage: (param: string) => Promise<void>;
    poke: () => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'PokeGameCode', protocol: string, code: object[] } };
export type PokeGameContractType = ContractAbstractionFromContractType<contractTypes>;
export type PokeGameWalletType = WalletContractAbstractionFromContractType<contractTypes>;
